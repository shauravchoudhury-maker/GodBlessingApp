// youtube.js
// Upload a rendered devotion batch to YouTube, straight from the browser.
//
// How it works: Google Identity Services hands the studio a short-lived access
// token for the youtube.upload scope (sign-in popup, once per session — no
// secrets anywhere, only the public client id in youtube-config.js). The
// studio opens the batch folder, reads metadata.csv, and pushes each video to
// YouTube's resumable-upload endpoint with its title, description, tags and
// scheduled publish time already filled in. After each upload the CSV is
// rewritten with the new video id, so the next session picks up where this
// one stopped.
//
// Two YouTube rules that shape this file — see YOUTUBE_SETUP.md:
//   • videos.insert costs 1,600 quota units and a new project gets 10,000 a
//     day, so SIX uploads a day is the ceiling until Google grants more. The
//     "upload next" button defaults to that.
//   • Until the API project passes YouTube's compliance audit, everything it
//     uploads is locked to PRIVATE. The metadata and schedule still land; the
//     visibility is flipped in YouTube Studio (select all → Visibility). File
//     the audit form on day one.
//
// Depends on: $ / downloadBlob (app.js), YT_CLIENT_ID (youtube-config.js),
// the GIS script (accounts.google.com/gsi/client) loaded by app.html.

const YT_SCOPE = "https://www.googleapis.com/auth/youtube.upload";
const YT_UPLOAD_URL = "https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status";
const YT_CATEGORY = "22";         // People & Blogs — where devotional channels sit
const YT_DAILY_DEFAULT = 6;       // 6 × 1,600 units < the 10,000/day default quota
const YT_CSV_EXTRA = ["youtube_id", "youtube_status", "uploaded_at"];

const ytState = { token: "", expiresAt: 0, dir: null, rows: [], header: [], busy: false, cancel: false };

function ytReady() { return typeof YT_CLIENT_ID === "string" && YT_CLIENT_ID.indexOf("PASTE") === -1 && !!YT_CLIENT_ID; }

/* ---------------------------------------------------------------- */
/*  Sign-in                                                          */
/* ---------------------------------------------------------------- */
// Resolves with an access token, reusing the cached one while it is fresh.
// `silent` re-requests without a prompt (works after the first consent).
function ytGetToken(silent) {
  if (ytState.token && Date.now() < ytState.expiresAt - 60_000) return Promise.resolve(ytState.token);
  if (!ytReady()) return Promise.reject(new Error("Add your Google client id to youtube-config.js first (see YOUTUBE_SETUP.md)."));
  if (!window.google || !google.accounts || !google.accounts.oauth2) return Promise.reject(new Error("Google sign-in script hasn't loaded — check your connection and reload."));
  return new Promise((resolve, reject) => {
    const client = google.accounts.oauth2.initTokenClient({
      client_id: YT_CLIENT_ID,
      scope: YT_SCOPE,
      callback: (resp) => {
        if (!resp || resp.error || !resp.access_token) { reject(new Error("Sign-in failed: " + (resp && resp.error ? resp.error : "no token"))); return; }
        ytState.token = resp.access_token;
        ytState.expiresAt = Date.now() + (Number(resp.expires_in) || 3600) * 1000;
        resolve(ytState.token);
      },
      error_callback: (err) => reject(new Error("Sign-in cancelled" + (err && err.type ? " (" + err.type + ")" : ""))),
    });
    client.requestAccessToken(silent ? { prompt: "" } : {});
  });
}

/* ---------------------------------------------------------------- */
/*  CSV                                                              */
/* ---------------------------------------------------------------- */
// RFC-4180-ish parser: quoted cells may contain commas, quotes ("") and
// newlines — descriptions do.
function ytParseCsv(text) {
  const rows = []; let row = [], cell = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; }
      else cell += c;
    } else if (c === '"') q = true;
    else if (c === ",") { row.push(cell); cell = ""; }
    else if (c === "\n" || c === "\r") { if (c === "\r" && text[i + 1] === "\n") i++; row.push(cell); rows.push(row); row = []; cell = ""; }
    else cell += c;
  }
  if (cell.length || row.length) { row.push(cell); rows.push(row); }
  const header = rows.shift() || [];
  return { header, rows: rows.filter((r) => r.length > 1 || (r[0] || "").trim()).map((r) => { const o = {}; header.forEach((h, i) => { o[h] = r[i] == null ? "" : r[i]; }); return o; }) };
}
function ytCsvCell(v) { return `"${String(v == null ? "" : v).replace(/"/g, '""')}"`; }
function ytToCsv(header, rows) {
  return [header.join(",")].concat(rows.map((r) => header.map((h) => ytCsvCell(r[h])).join(","))).join("\n");
}

/* ---------------------------------------------------------------- */
/*  Folder                                                           */
/* ---------------------------------------------------------------- */
async function ytOpenFolder() {
  const status = $("yt-status");
  if (!window.showDirectoryPicker) { status.textContent = "This browser can't open folders — use Chrome or Edge on a desktop."; return; }
  let dir;
  try { dir = await window.showDirectoryPicker({ mode: "readwrite", startIn: "downloads" }); } catch (e) { return; }
  try {
    const fh = await dir.getFileHandle("metadata.csv");
    const text = await (await fh.getFile()).text();
    const { header, rows } = ytParseCsv(text);
    YT_CSV_EXTRA.forEach((k) => { if (header.indexOf(k) === -1) header.push(k); });
    // Check each video file is actually there.
    for (const r of rows) {
      r._present = false;
      if (r.file) { try { await dir.getFileHandle(r.file); r._present = true; } catch (e) {} }
    }
    ytState.dir = dir; ytState.rows = rows; ytState.header = header;
    ytRenderTable();
    status.textContent = `Opened "${dir.name}" — ${rows.length} rows in metadata.csv.`;
  } catch (e) {
    status.textContent = "No metadata.csv in that folder — pick the folder the batch was saved to.";
  }
}

function ytPending() {
  return ytState.rows.filter((r) => r.status === "ok" && r._present && !r.youtube_id);
}

function ytRenderTable() {
  const wrap = $("yt-table"); if (!wrap) return;
  const rows = ytState.rows;
  if (!rows.length) { wrap.innerHTML = ""; return; }
  const esc = (s) => String(s || "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const line = (r) => {
    const state = r.youtube_id ? `✓ <a href="https://studio.youtube.com/video/${esc(r.youtube_id)}/edit" target="_blank" rel="noopener">${esc(r.youtube_id)}</a>`
      : r.status !== "ok" ? `<span style="color:#ff6b6b;">render ${esc(r.status)}</span>`
      : !r._present ? `<span style="color:#ff6b6b;">file missing</span>`
      : r.youtube_status && r.youtube_status.indexOf("failed") === 0 ? `<span style="color:#ff6b6b;">${esc(r.youtube_status)}</span>`
      : "waiting";
    return `<tr><td>${esc(r.date)}</td><td>${esc(r.kind)}</td><td>${esc(r.title)}</td><td>${esc((r.publish_at || "").replace("T", " ").slice(0, 16))}</td><td>${state}</td></tr>`;
  };
  wrap.innerHTML = `<table class="sched-table"><thead><tr><th>Date</th><th>Kind</th><th>Title</th><th>Publish (local)</th><th>YouTube</th></tr></thead><tbody>${rows.map(line).join("")}</tbody></table>`;
  const pending = ytPending().length, done = rows.filter((r) => r.youtube_id).length;
  $("yt-summary").textContent = `${done} uploaded · ${pending} waiting · ${rows.length - done - pending} not uploadable`;
}

async function ytSaveCsv() {
  if (!ytState.dir) return;
  const clean = ytState.rows.map((r) => { const o = {}; ytState.header.forEach((h) => { o[h] = r[h]; }); return o; });
  const fh = await ytState.dir.getFileHandle("metadata.csv", { create: true });
  const w = await fh.createWritable(); await w.write(ytToCsv(ytState.header, clean)); await w.close();
}

/* ---------------------------------------------------------------- */
/*  Upload                                                           */
/* ---------------------------------------------------------------- */
function ytMetadata(r) {
  const short = r.kind === "short";
  const tags = String(r.tags || "").split(",").map((t) => t.trim()).filter(Boolean).slice(0, 30);
  if (short && tags.indexOf("Shorts") === -1) tags.push("Shorts");
  let description = r.description || "";
  if (short && !/#shorts/i.test(description)) description += "\n\n#Shorts";
  const status = { privacyStatus: "private", selfDeclaredMadeForKids: false };
  // A future publish_at makes it a scheduled premiere-less release; YouTube
  // requires privacyStatus "private" alongside publishAt.
  const when = r.publish_at ? new Date(r.publish_at) : null;
  if (when && !isNaN(when) && when.getTime() > Date.now() + 5 * 60_000) status.publishAt = when.toISOString();
  return {
    snippet: { title: String(r.title || "").slice(0, 100), description: description.slice(0, 5000), tags, categoryId: YT_CATEGORY, defaultLanguage: "en" },
    status,
  };
}

function ytXhr(method, url, headers, body, onProgress) {
  return new Promise((resolve, reject) => {
    const x = new XMLHttpRequest();
    x.open(method, url, true);
    Object.entries(headers || {}).forEach(([k, v]) => x.setRequestHeader(k, v));
    if (onProgress && x.upload) x.upload.onprogress = (e) => { if (e.lengthComputable) onProgress(e.loaded / e.total); };
    x.onload = () => resolve(x);
    x.onerror = () => reject(new Error("network error"));
    x.send(body);
  });
}

// Resumable upload: start a session (metadata), PUT the bytes, resume once if
// the connection drops. Returns the YouTube video id.
async function ytUploadOne(r, file, onProgress) {
  const token = await ytGetToken(true).catch(() => ytGetToken(false));
  const meta = JSON.stringify(ytMetadata(r));
  const start = await ytXhr("POST", YT_UPLOAD_URL, {
    Authorization: "Bearer " + token, "Content-Type": "application/json; charset=UTF-8",
    "X-Upload-Content-Length": String(file.size), "X-Upload-Content-Type": file.type || "video/*",
  }, meta);
  if (start.status === 403 && /quota/i.test(start.responseText)) throw new Error("YouTube daily quota used up — try again after midnight Pacific time, or request more (YOUTUBE_SETUP.md).");
  if (start.status !== 200) throw new Error("start failed (" + start.status + "): " + (start.responseText || "").slice(0, 160));
  const session = start.getResponseHeader("Location");
  if (!session) throw new Error("YouTube didn't return an upload session URL.");

  let attempt = 0, res;
  while (true) {
    attempt++;
    try {
      res = await ytXhr("PUT", session, { "Content-Type": file.type || "video/*" }, file, onProgress);
    } catch (e) {
      if (attempt >= 3) throw e;
      // Ask where the upload got to, then send the remainder.
      const q = await ytXhr("PUT", session, { "Content-Range": `bytes */${file.size}` }, null);
      if (q.status === 200 || q.status === 201) { res = q; break; }
      const range = q.getResponseHeader("Range");
      const from = range ? Number(range.split("-")[1]) + 1 : 0;
      res = await ytXhr("PUT", session, { "Content-Type": file.type || "video/*", "Content-Range": `bytes ${from}-${file.size - 1}/${file.size}` }, file.slice(from), (p) => onProgress(from / file.size + p * (1 - from / file.size)));
    }
    if (res.status === 200 || res.status === 201) break;
    if (attempt >= 3 || res.status < 500) throw new Error("upload failed (" + res.status + "): " + (res.responseText || "").slice(0, 160));
  }
  const json = JSON.parse(res.responseText || "{}");
  if (!json.id) throw new Error("upload finished but no video id came back.");
  return json.id;
}

async function ytUploadNext() {
  if (ytState.busy) return;
  const status = $("yt-status");
  if (!ytState.dir) { status.textContent = "Open the batch folder first."; return; }
  const max = Math.max(1, Number($("yt-max").value) || YT_DAILY_DEFAULT);
  const queue = ytPending().slice(0, max);
  if (!queue.length) { status.textContent = "Nothing waiting — everything uploadable is already on YouTube."; return; }
  try { await ytGetToken(false); } catch (e) { status.textContent = e.message; return; }
  ytState.busy = true; ytState.cancel = false;
  $("yt-upload").disabled = true; $("yt-cancel").style.display = "inline-block";
  let ok = 0;
  for (let i = 0; i < queue.length; i++) {
    if (ytState.cancel) break;
    const r = queue[i];
    try {
      const file = await (await ytState.dir.getFileHandle(r.file)).getFile();
      status.textContent = `${i + 1}/${queue.length} — ${r.title} — uploading…`;
      const id = await ytUploadOne(r, file, (p) => { status.textContent = `${i + 1}/${queue.length} — ${r.title} — ${Math.round(p * 100)}%`; });
      r.youtube_id = id; r.youtube_status = "uploaded"; r.uploaded_at = new Date().toISOString(); ok++;
    } catch (e) {
      r.youtube_status = "failed: " + (e && e.message ? e.message : e);
      if (/quota/i.test(r.youtube_status)) { ytRenderTable(); await ytSaveCsv(); status.textContent = r.youtube_status; break; }
    }
    ytRenderTable();
    try { await ytSaveCsv(); } catch (e) {}
  }
  ytState.busy = false; $("yt-upload").disabled = false; $("yt-cancel").style.display = "none";
  if (!/quota/i.test(status.textContent)) {
    status.textContent = `${ytState.cancel ? "Stopped" : "✓ Done"} — ${ok} uploaded this run. ${ytPending().length} still waiting${ytPending().length ? " (come back tomorrow for the next batch, or after a quota increase)" : ""}. Remember: until the API audit clears, uploads sit as Private — set visibility in YouTube Studio.`;
  }
}

function initYouTube() {
  if (!$("yt-open")) return;
  $("yt-open").onclick = ytOpenFolder;
  $("yt-upload").onclick = ytUploadNext;
  $("yt-cancel").onclick = () => { ytState.cancel = true; };
  $("yt-signin").onclick = async () => {
    const s = $("yt-status");
    try { await ytGetToken(false); s.textContent = "✓ Signed in to YouTube for this session."; }
    catch (e) { s.textContent = e.message; }
  };
  if (!ytReady()) $("yt-status").textContent = "Not connected yet — paste your Google client id into youtube-config.js (YOUTUBE_SETUP.md, 10 minutes).";
}
