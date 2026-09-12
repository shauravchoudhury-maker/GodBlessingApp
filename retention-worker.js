// retention-worker.js
// Cloudflare Worker, on a cron: erases the text of old Blessing Circle
// requests so there is less to lose, leak or be compelled to hand over.
//
// WHAT IT DOES, ONCE A DAY.
//
// For every request older than RETENTION_DAYS (default 60) that it has not
// already handled, it:
//   1. deletes every reply under it (responses/*) and every turn of any
//      conversation (thread/*) — those are a guide's words about a
//      stranger's private life, and they age the same way;
//   2. blanks the request's `note` — the burden itself;
//   3. marks the request `expiredAt`, and `status: "expired"` if it was
//      still open, so the Health screen stops counting it as waiting.
//
// It never removes the request document. Tradition, category, language,
// dates and reply count stay, so the Health counts and the yearly
// transparency report can still be produced from numbers alone.
//
// It never touches guides, applications, reports, vouches or bans.
// Reports are kept: they are the record of what was raised and what was
// done, and they carry no request text.
//
// HOW IT STAYS CHEAP. A cursor in stats/retention remembers the createdAt
// of the last request handled. Each run reads only requests newer than the
// cursor and older than the cutoff, at most BATCH of them, oldest first.
// A run that finds nothing costs one read.
//
// SECRETS (dashboard: Settings -> Variables and Secrets, or wrangler):
//   FIREBASE_PROJECT_ID      eververse2117
//   FIREBASE_SA_EMAIL        ...@....iam.gserviceaccount.com
//   FIREBASE_SA_KEY          the PEM private key (pasted from the JSON is fine)
//   RUN_TOKEN                any long random string; lets a person run it by hand
// VARS (optional):
//   RETENTION_DAYS           default 60
//
// CRON (dashboard: Settings -> Triggers -> Cron Triggers): 20 4 * * *
//
// A GET to the worker's URL reports the last run (numbers only) so a person
// can see it is alive without opening the Cloudflare dashboard.
// A POST to /run with "Authorization: Bearer <RUN_TOKEN>" runs it now and
// returns the same numbers — for the first test, and for the day something
// needs erasing before 04:20.

const BATCH = 150;

const enc = new TextEncoder();
let tokenCache = { at: 0, token: null };

function b64urlToBytes(s) {
  s = s.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
function pemToDer(pem) {
  // The JSON from Firebase writes newlines as backslash-n; a secret pasted
  // straight from it keeps them as two characters. Either form is accepted.
  return b64urlToBytes(pem.replace(/\\n/g, "\n").replace(/-----[^-]+-----/g, "").replace(/\s+/g, "")
                          .replace(/\+/g, "-").replace(/\//g, "_"));
}

// Same exchange as identity-worker.js: a signed JWT for the service
// account, traded for a one-hour access token.
async function accessToken(env) {
  if (tokenCache.token && Date.now() - tokenCache.at < 3000e3) return tokenCache.token;
  const now = Math.floor(Date.now() / 1000);
  const b64 = (o) => btoa(JSON.stringify(o)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const unsigned = b64({ alg: "RS256", typ: "JWT" }) + "." + b64({
    iss: env.FIREBASE_SA_EMAIL,
    scope: "https://www.googleapis.com/auth/datastore",
    aud: "https://oauth2.googleapis.com/token",
    iat: now, exp: now + 3600,
  });
  const key = await crypto.subtle.importKey("pkcs8", pemToDer(env.FIREBASE_SA_KEY),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, enc.encode(unsigned));
  const jwt = unsigned + "." + btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: "grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=" + jwt,
  });
  if (!r.ok) throw new Error("token exchange failed: " + await r.text());
  const t = await r.json();
  tokenCache = { at: Date.now(), token: t.access_token };
  return t.access_token;
}

function base(env) {
  return "https://firestore.googleapis.com/v1/projects/" + env.FIREBASE_PROJECT_ID + "/databases/(default)/documents";
}
async function fs(env, method, path, body) {
  const tok = await accessToken(env);
  const r = await fetch(base(env) + path, {
    method,
    headers: { Authorization: "Bearer " + tok, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  return r;
}

/* ---------------------------------------------------------------- */
/*  The cursor                                                      */
/* ---------------------------------------------------------------- */
async function readCursor(env) {
  const r = await fs(env, "GET", "/blessing/circle/stats/retention");
  if (r.status !== 200) return "";
  const f = (await r.json()).fields || {};
  return (f.cursor && f.cursor.stringValue) || "";
}
async function writeCursor(env, cursor, summary) {
  const fields = {
    cursor: { stringValue: cursor },
    lastRunAt: { stringValue: summary.at },
    lastRunExpired: { integerValue: String(summary.expired) },
    lastRunRepliesRemoved: { integerValue: String(summary.replies) },
    lastRunTurnsRemoved: { integerValue: String(summary.turns) },
    retentionDays: { integerValue: String(summary.days) },
  };
  const mask = Object.keys(fields).map((k) => "updateMask.fieldPaths=" + k).join("&");
  const r = await fs(env, "PATCH", "/blessing/circle/stats/retention?" + mask, { fields });
  if (!r.ok) throw new Error("cursor write failed: " + r.status + " " + await r.text());
}

/* ---------------------------------------------------------------- */
/*  The work                                                        */
/* ---------------------------------------------------------------- */

// Requests older than the cutoff and newer than the cursor, oldest first.
// Only the fields needed to decide are read — never `note`.
async function dueRequests(env, cursor, cutoff) {
  const r = await fs(env, "POST", "/blessing/circle:runQuery", { structuredQuery: {
    from: [{ collectionId: "requests" }],
    select: { fields: [{ fieldPath: "createdAt" }, { fieldPath: "status" }, { fieldPath: "expiredAt" }] },
    where: { compositeFilter: { op: "AND", filters: [
      { fieldFilter: { field: { fieldPath: "createdAt" }, op: "GREATER_THAN", value: { stringValue: cursor } } },
      { fieldFilter: { field: { fieldPath: "createdAt" }, op: "LESS_THAN", value: { stringValue: cutoff } } },
    ] } },
    orderBy: [{ field: { fieldPath: "createdAt" }, direction: "ASCENDING" }],
    limit: BATCH,
  } });
  if (!r.ok) throw new Error("query failed: " + r.status + " " + await r.text());
  const rows = await r.json();
  return rows.filter((x) => x.document).map((x) => {
    const f = x.document.fields || {};
    return {
      id: x.document.name.split("/").pop(),
      createdAt: (f.createdAt && f.createdAt.stringValue) || "",
      status: (f.status && f.status.stringValue) || "",
      expiredAt: (f.expiredAt && f.expiredAt.stringValue) || "",
    };
  });
}

// Delete every document in a subcollection. Paged, so a long conversation
// is handled the same as a short one.
async function clearSub(env, id, sub) {
  let removed = 0, pageToken = "";
  for (let guard = 0; guard < 20; guard++) {
    const r = await fs(env, "GET", "/blessing/circle/requests/" + encodeURIComponent(id) + "/" + sub +
      "?pageSize=50&mask.fieldPaths=createdAt" + (pageToken ? "&pageToken=" + encodeURIComponent(pageToken) : ""));
    if (r.status === 404) return removed;
    if (!r.ok) throw new Error("list " + sub + " failed: " + r.status);
    const body = await r.json();
    for (const d of body.documents || []) {
      const del = await fs(env, "DELETE", "/" + d.name.split("/documents/")[1]);
      if (del.ok || del.status === 404) removed++;
    }
    pageToken = body.nextPageToken || "";
    if (!pageToken) break;
  }
  return removed;
}

// Blank the text and stamp the expiry. The update mask is the guard: this
// cannot touch tradition, category, forGuide, ownerHash or anything else.
async function expireRequest(env, req, when) {
  const fields = { note: { stringValue: "" }, expiredAt: { stringValue: when } };
  if (req.status === "open") fields.status = { stringValue: "expired" };
  const mask = Object.keys(fields).map((k) => "updateMask.fieldPaths=" + k).join("&");
  const r = await fs(env, "PATCH", "/blessing/circle/requests/" + encodeURIComponent(req.id) + "?" + mask +
    "&currentDocument.exists=true", { fields });
  if (!r.ok && r.status !== 404) throw new Error("expire failed: " + r.status + " " + await r.text());
}

async function run(env) {
  const days = Math.max(30, Math.min(90, parseInt(env.RETENTION_DAYS || "60", 10) || 60));
  const at = new Date().toISOString();
  const cutoff = new Date(Date.now() - days * 864e5).toISOString();
  const cursor = await readCursor(env);
  const due = await dueRequests(env, cursor, cutoff);
  const summary = { at, days, seen: due.length, expired: 0, replies: 0, turns: 0 };
  let last = cursor;
  for (const req of due) {
    if (!req.expiredAt) {
      summary.replies += await clearSub(env, req.id, "responses");
      summary.turns += await clearSub(env, req.id, "thread");
      await expireRequest(env, req, at);
      summary.expired++;
    }
    last = req.createdAt || last;
  }
  if (due.length || !cursor) await writeCursor(env, last, summary);
  return summary;
}

export default {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(run(env).catch((e) => console.error("retention run failed: " + e.message)));
  },
  // A glance, for a person: the last run's numbers. No text, no ids.
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === "POST" && url.pathname === "/run") {
      const auth = request.headers.get("Authorization") || "";
      if (!env.RUN_TOKEN || auth !== "Bearer " + env.RUN_TOKEN) return new Response("no\n", { status: 403 });
      try {
        const s = await run(env);
        return new Response("ran: " + JSON.stringify(s) + "\n", { headers: { "Content-Type": "text/plain" } });
      } catch (e) {
        return new Response("failed: " + e.message + "\n", { status: 500, headers: { "Content-Type": "text/plain" } });
      }
    }
    const r = await fs(env, "GET", "/blessing/circle/stats/retention");
    if (r.status !== 200) return new Response("retention: no run recorded yet\n", { headers: { "Content-Type": "text/plain" } });
    const f = (await r.json()).fields || {};
    const v = (k) => (f[k] && (f[k].stringValue || f[k].integerValue)) || "";
    return new Response("retention: last run " + v("lastRunAt") + " · " + v("retentionDays") + " days · expired " +
      v("lastRunExpired") + " · replies removed " + v("lastRunRepliesRemoved") + " · turns removed " + v("lastRunTurnsRemoved") + "\n",
      { headers: { "Content-Type": "text/plain", "Cache-Control": "no-store" } });
  },
};
