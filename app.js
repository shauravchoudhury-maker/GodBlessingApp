// app.js — EverVerse Daily Verse Studio
"use strict";

const $ = (id) => document.getElementById(id);

// renderVerse + wrapLines/fitText/hexToRgba now live in render.js (shared with
// the public site). render.js is loaded before app.js.

/* ================================================================== */
/*  DAILY STUDIO                                                       */
/* ================================================================== */
const daily = {
  startDate: new Date(),           // anchor for the 90-day plans
  plans: { Bible: [], Gita: [] },  // each: [{ date, verse }] × 90
  activeSource: "Bible",
  dayIndex: 0,
  verse: null,
  date: new Date(),                // date of the active verse (for filenames)
  lang: "en",                      // language shown on the image
  trans: { text: "", rtl: false }, // active (possibly translated) text
  transCache: {},                  // { "ref|lang": { text, rtl } }
  bgKey: "sunrise",
  paletteKey: null,
  watermark: true,
};

const PLAN_DAYS = 120;

// Build a 90-day reading plan per source, anchored at startDate. Each source
// cycles through its own verses so Bible and Gita are fully independent.
function buildPlans(startDate) {
  const plans = { Bible: [], Gita: [] };
  ["Bible", "Gita"].forEach((src) => {
    const list = VERSE_DB.filter((v) => v.faith === src);
    const startDoy = dayOfYear(startDate);
    for (let d = 0; d < PLAN_DAYS; d++) {
      const date = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + d);
      const verse = list[(startDoy + d) % list.length];
      plans[src].push({ date, verse });
    }
  });
  return plans;
}

// Load the verse currently selected in the daily view (source + day index).
function setActiveVerse() {
  const entry = daily.plans[daily.activeSource][daily.dayIndex];
  const v = entry.verse;
  daily.verse = v;
  daily.date = entry.date;
  daily.paletteKey = v.theme;
  $("verse-faith").textContent = v.faith === "Gita" ? "Bhagavad Gita" : v.faith;
  $("verse-topic").textContent = v.topic;
  $("verse-text").textContent = `“${v.text}”`;
  $("verse-ref").textContent = v.ref;
  $("daily-palette").value = v.theme;

  const track = trackFor(v);
  $("music-mood").textContent = track.mood;
  $("music-idea").textContent = track.idea;
  const ul = $("music-sources"); ul.innerHTML = "";
  track.sources.forEach((s) => { const li = document.createElement("li"); li.textContent = s; ul.appendChild(li); });

  $("verse-meaning").textContent = meaningFor(v);
  updateFavVerse();
  stopSpeak(); // stop any narration from the previous verse

  applyDailyLanguage(); // sets daily.trans then renders
}

// Translate the active verse into daily.lang (or reset to English), then render.
async function applyDailyLanguage() {
  const status = $("daily-trans-status");
  $("verify-meaning").style.display = daily.lang === "en" ? "none" : "inline-block";
  $("localize-captions").style.display = daily.lang === "en" ? "none" : "inline-block";
  $("localize-status").textContent = "";
  daily.localized = null; // caption localization is per-language; reset on change
  $("fidelity-box").innerHTML = "";
  if (daily.lang === "en") {
    daily.trans = { text: daily.verse.text, rtl: false };
    status.textContent = "";
    renderDailyAll();
    return;
  }
  const meta = LANGUAGES.find((l) => l.code === daily.lang);
  const key = daily.verse.ref + "|" + daily.lang;
  if (daily.transCache[key]) {
    daily.trans = daily.transCache[key];
    status.textContent = `Showing in ${meta.name}.`;
    renderDailyAll();
    return;
  }
  status.textContent = `Translating to ${meta.name}…`;
  try {
    const text = await translateText(daily.verse.text, daily.lang);
    daily.trans = { text, rtl: !!meta.rtl };
    daily.transCache[key] = daily.trans;
    status.textContent = `Showing in ${meta.name}.`;
  } catch (e) {
    daily.trans = { text: daily.verse.text, rtl: false };
    status.textContent = `⚠ ${meta.name} translation failed (free API rate-limit?). Showing English.`;
  }
  renderDailyAll();
}

function renderDailyAll() {
  renderDailyPreview();
  renderPlatformCards();
}

function updateFavVerse() {
  const btn = $("fav-verse");
  if (!btn || !daily.verse) return;
  const on = isFav("verse", daily.verse.ref);
  btn.textContent = on ? "♥ Saved" : "♡ Save";
  btn.classList.toggle("faved", on);
}

/* ---- Grammar / meaning fidelity check (back-translation) ---------- */
function tokenize(s) {
  return (s || "").toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").split(/\s+/).filter(Boolean);
}
function similarity(a, b) {
  const A = new Set(tokenize(a)), B = new Set(tokenize(b));
  if (!A.size || !B.size) return 0;
  let inter = 0;
  A.forEach((w) => { if (B.has(w)) inter++; });
  return inter / new Set([...A, ...B]).size; // Jaccard
}

async function checkMeaning() {
  const box = $("fidelity-box");
  if (daily.lang === "en") { box.innerHTML = ""; return; }
  const meta = LANGUAGES.find((l) => l.code === daily.lang);
  box.innerHTML = `<span class="fidelity-note">Back-translating from ${meta.name} to English…</span>`;
  try {
    const back = await translateText(daily.trans.text, "en", daily.lang);
    const score = similarity(daily.verse.text, back);
    let cls = "high", label = "High fidelity — meaning preserved";
    if (score < 0.4) { cls = "low"; label = "Low fidelity — review wording"; }
    else if (score < 0.62) { cls = "med"; label = "Medium — check the highlighted meaning"; }
    box.innerHTML =
      `<span class="fidelity-badge ${cls}">${label} · ${Math.round(score * 100)}% match</span>` +
      `<div class="fidelity-row"><span class="lbl">Original:</span> ${escapeHtml(daily.verse.text)}</div>` +
      `<div class="fidelity-row"><span class="lbl">${meta.name} → back to English:</span> ${escapeHtml(back)}</div>` +
      `<div class="fidelity-note">Read the two lines above. If they say the same thing, the translation is safe to post. Tip: MyMemory is machine translation — for sacred wording, a quick human check is always wise.</div>`;
  } catch (e) {
    box.innerHTML = `<span class="fidelity-note">⚠ Could not back-translate (${e.message}). Try again shortly.</span>`;
  }
}
function escapeHtml(s) {
  return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}

/* ---- Native share (Web Share API) -------------------------------- */
function canvasToBlob(canvas, type) {
  return new Promise((res) => canvas.toBlob(res, type || "image/png"));
}
// Returns true if the OS share sheet handled it, false if unsupported.
async function shareFiles(files, text, title) {
  try {
    if (navigator.canShare && navigator.canShare({ files })) {
      await navigator.share({ files, text, title });
      return true;
    }
  } catch (e) {
    if (e && e.name === "AbortError") return true; // user cancelled — still "handled"
  }
  return false;
}

async function shareToday() {
  const hint = $("share-hint");
  hint.textContent = "Preparing…";
  const cv = document.createElement("canvas");
  renderVerse(cv, 1080, 1080, {
    text: daily.trans.text, ref: daily.verse.ref, rtl: daily.trans.rtl,
    paletteKey: daily.paletteKey, bgKey: daily.bgKey, watermark: daily.watermark, showRef: true,
  });
  const blob = await canvasToBlob(cv);
  const file = new File([blob], top8Filename("square") + ".png", { type: "image/png" });
  const caption = buildPostKit(daily.verse).platforms.find((p) => p.key === "instagram").caption;
  const shared = await shareFiles([file], caption, "EverVerse");
  if (shared) {
    hint.textContent = "Shared. Pick an app to post to 🙌";
  } else {
    // Desktop fallback: download image + copy caption
    const a = document.createElement("a");
    a.download = file.name; a.href = cv.toDataURL("image/png"); a.click();
    try { await navigator.clipboard.writeText(caption); } catch (_) {}
    hint.textContent = "Image downloaded and caption copied (sharing needs a phone/tablet).";
  }
}

let lastVideoBlob = null;
async function shareVideo() {
  if (!lastVideoBlob) return;
  const file = new File([lastVideoBlob], top8Filename("video") + ".webm", { type: "video/webm" });
  const shared = await shareFiles([file], `${daily.verse.ref} — EverVerse`, "EverVerse");
  if (!shared) $("video-download").click();
}

/* ---- Video + music generation ------------------------------------ */
async function generateDailyVideo() {
  const status = $("video-status");
  const btn = $("gen-video");
  if (!videoSupported()) { status.textContent = "⚠ This browser can't record video. Try Chrome/Edge."; return; }
  const fmt = $("vid-format").value;
  const dur = Number($("vid-duration").value);
  const music = $("vid-music").checked;
  const dims = fmt === "square" ? { w: 720, h: 720 } : { w: 720, h: 1280 };
  btn.disabled = true;
  $("video-download").style.display = "none";
  status.textContent = "Rendering video…";
  try {
    const blob = await generateVerseVideo({
      text: daily.trans.text, ref: daily.verse.ref, rtl: daily.trans.rtl,
      paletteKey: daily.paletteKey, bgKey: daily.bgKey, theme: daily.verse.theme,
      watermark: daily.watermark, showRef: true, durationSec: dur, withMusic: music,
      w: dims.w, h: dims.h,
      onProgress: (p) => { status.textContent = `Rendering video… ${Math.round(p * 100)}%`; },
    });
    lastVideoBlob = blob;
    const url = URL.createObjectURL(blob);
    const v = $("video-preview"); v.src = url; v.load();
    const a = $("video-download"); a.href = url; a.download = top8Filename("video") + ".webm"; a.style.display = "inline-block";
    $("share-video").style.display = (navigator.canShare) ? "inline-block" : "none";
    status.textContent = `✓ Video ready (${(blob.size / 1048576).toFixed(1)} MB, ${dur}s${music ? ", with music" : ""}).`;
  } catch (e) {
    status.textContent = `⚠ ${e.message || e}`;
  } finally {
    btn.disabled = false;
  }
}

/* ---- Voice-over podcast (Web Speech API) -------------------------- */
function stopSpeak() {
  EVVoice.stop();
  const s = $("stop-listen-btn"), l = $("listen-btn");
  if (s) s.style.display = "none";
  if (l) l.textContent = "🎙 Listen (podcast)";
}
function speakVerse() {
  if (!window.speechSynthesis) { $("share-hint").textContent = "Voice isn't supported in this browser."; return; }
  EVVoice.speak(narrationFor(daily.verse), { lang: "en", onend: stopSpeak, onerror: stopSpeak });
  $("stop-listen-btn").style.display = "inline-block";
  $("listen-btn").textContent = "🔊 Speaking…";
}
function downloadNarrationScript() {
  downloadBlob(new Blob([narrationFor(daily.verse)], { type: "text/plain" }), top8Filename("narration") + ".txt");
}

/* ---- Localized captions (keep the message intact per language) ---- */
function buildLocalizedCaption(p, loc) {
  const v = `"${loc.verse}"`;
  const ref = `— ${daily.verse.ref}`;
  const tags = p.hashtags.join(" ");
  const track = trackFor(daily.verse);
  switch (p.key) {
    case "instagram": return `${v}\n${ref}\n\n${loc.reflection}\n\n💡 ${loc.meaning}\n\n🎵 ${track.idea}\n\n${tags}`;
    case "tiktok":    return `${loc.reflection} 🙏\n${v} ${ref}\n🎵 ${track.idea}\n${tags}`;
    case "facebook":  return `${v}\n${ref}\n\n${loc.reflection}\n\n💡 ${loc.meaning}\n\n${tags}`;
    case "youtube":   return `${daily.verse.ref} | ${loc.reflection}\n\n${v}\n${ref}\n\n💡 ${loc.meaning}\n\n${tags}`;
    case "x":         return `${v} ${ref}\n\n${loc.reflection}\n${tags}`;
    default:          return `${v} ${ref}\n\n${tags}`;
  }
}
function activeCaptionText(p) {
  if (daily.localized && daily.localized.lang === daily.lang && daily.lang !== "en") {
    return buildLocalizedCaption(p, daily.localized);
  }
  return p.caption;
}
async function localizeCaptions() {
  const status = $("localize-status");
  if (daily.lang === "en") { status.textContent = "Pick a language first (in 'Show verse in language')."; return; }
  const meta = LANGUAGES.find((l) => l.code === daily.lang);
  status.textContent = `Translating captions to ${meta.name}…`;
  try {
    const reflection = reflectionFor(daily.verse);
    const tReflection = await translateText(reflection, daily.lang);
    const tMeaning = await translateText(meaningFor(daily.verse), daily.lang);
    daily.localized = { lang: daily.lang, rtl: !!meta.rtl, verse: daily.trans.text, reflection: tReflection, meaning: tMeaning };
    status.textContent = `✓ Captions now in ${meta.name} (verse + reflection + meaning; hashtags kept universal).`;
    renderPlatformCards();
  } catch (e) {
    status.textContent = `⚠ ${e.message}. The free API may be rate-limited — try again shortly.`;
  }
}

/* ---- Weekly newsletter ------------------------------------------- */
function verseForSourceDate(source, date) {
  const list = VERSE_DB.filter((v) => v.faith === source);
  return list[dayOfYear(date) % list.length];
}
function newsletterRows() {
  const src = $("news-source").value;
  const val = $("news-start").value;
  let start;
  if (val) { const [y, m, d] = val.split("-").map(Number); start = new Date(y, m - 1, d); }
  else start = new Date(daily.startDate);
  const sources = src === "Both" ? ["Bible", "Gita"] : [src];
  const rows = [];
  for (let d = 0; d < 7; d++) {
    const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + d);
    sources.forEach((s) => rows.push({ date, source: s, verse: verseForSourceDate(s, date) }));
  }
  return rows;
}
function buildNewsletterHtml(rows) {
  const start = rows[0].date, end = rows[rows.length - 1].date;
  const fmt = (dt) => dt.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  const items = rows.map((r) => {
    const dl = r.date.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
    return `<tr><td style="padding:20px 0;border-bottom:1px solid #eee;">
      <div style="font-size:12px;color:#7c5cff;font-weight:700;letter-spacing:.5px;text-transform:uppercase;">${dl} &middot; ${r.source === "Gita" ? "Bhagavad Gita" : "Bible"}</div>
      <blockquote style="font-family:Georgia,serif;font-size:19px;line-height:1.5;margin:10px 0 6px;color:#1a1a2e;">&ldquo;${escapeHtml(r.verse.text)}&rdquo;</blockquote>
      <div style="font-size:13px;color:#3aa0a8;font-weight:600;">&mdash; ${r.verse.ref}</div>
      <div style="font-size:14px;line-height:1.55;color:#444;margin-top:10px;"><b style="color:#7c5cff;">💡 In simple words:</b> ${escapeHtml(meaningFor(r.verse))}</div>
    </td></tr>`;
  }).join("");
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;background:#f4f5f9;padding:24px 12px;font-family:'Segoe UI',Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;margin:0 auto;background:#fff;border-radius:18px;overflow:hidden;box-shadow:0 10px 34px rgba(0,0,0,.09);">
<tr><td style="background:linear-gradient(135deg,#7c5cff,#4bc0c8);padding:30px 30px 24px;color:#fff;">
  <div style="font-size:27px;font-weight:700;">✦ EverVerse</div>
  <div style="font-size:14px;opacity:.92;margin-top:4px;">Your week of blessings &middot; ${fmt(start)} &ndash; ${fmt(end)}</div>
</td></tr>
<tr><td style="padding:14px 30px 0;"><p style="font-size:15px;color:#555;line-height:1.6;">Here are this week's verses, each with its meaning in plain words. Take a moment with the one that speaks to you. 🙏</p></td></tr>
<tr><td style="padding:0 30px;"><table width="100%" cellpadding="0" cellspacing="0">${items}</table></td></tr>
<tr><td style="padding:24px 30px 30px;color:#999;font-size:12px;text-align:center;line-height:1.6;">
  Sent with love from EverVerse. Reply and tell us which verse blessed you this week.
</td></tr></table></body></html>`;
}
let lastNewsletterHtml = "";
function generateNewsletter() {
  const rows = newsletterRows();
  lastNewsletterHtml = buildNewsletterHtml(rows);
  const iframe = $("news-preview");
  iframe.style.display = "block";
  iframe.srcdoc = lastNewsletterHtml;
  $("download-newsletter").style.display = "inline-block";
  $("copy-newsletter").style.display = "inline-block";
  $("news-status").textContent = `Newsletter ready — ${rows.length} entries.`;
}

function renderDailyPreview() {
  renderVerse($("daily-canvas"), 1080, 1080, {
    text: daily.trans.text, ref: daily.verse.ref, rtl: daily.trans.rtl,
    paletteKey: daily.paletteKey, bgKey: daily.bgKey, watermark: daily.watermark, showRef: true,
  });
}

function renderPlatformCards() {
  const kit = buildPostKit(daily.verse);
  const grid = $("platform-grid");
  grid.innerHTML = "";
  kit.platforms.forEach((p) => {
    const card = document.createElement("div");
    card.className = "platform-card";

    const head = document.createElement("div");
    head.className = "pc-head";
    head.innerHTML = `<span class="pc-title">${p.emoji} ${p.name}</span><span class="pc-size">${p.w}×${p.h}</span>`;

    const thumbWrap = document.createElement("div");
    thumbWrap.className = "pc-thumb";
    const thumb = document.createElement("canvas");
    // small backing store preserving aspect (width capped ~ 300)
    const tw = 300, th = Math.round((p.h / p.w) * tw);
    renderVerse(thumb, tw, th, {
      text: daily.trans.text, ref: daily.verse.ref, rtl: daily.trans.rtl, paletteKey: daily.paletteKey,
      bgKey: daily.bgKey, watermark: daily.watermark, showRef: true,
    });
    thumbWrap.appendChild(thumb);

    const cap = document.createElement("div");
    cap.className = "pc-caption";
    cap.textContent = activeCaptionText(p);
    if (daily.localized && daily.localized.rtl) cap.setAttribute("dir", "rtl");

    const actions = document.createElement("div");
    actions.className = "pc-actions";
    const copyBtn = document.createElement("button");
    copyBtn.className = "btn ghost small";
    copyBtn.textContent = "Copy caption";
    copyBtn.onclick = () => { navigator.clipboard?.writeText(activeCaptionText(p)); copyBtn.textContent = "Copied ✓"; setTimeout(() => copyBtn.textContent = "Copy caption", 1200); };
    const imgBtn = document.createElement("button");
    imgBtn.className = "btn small";
    imgBtn.textContent = "Save image";
    imgBtn.onclick = () => downloadPlatformImage(p);
    actions.append(copyBtn, imgBtn);
    if (navigator.canShare) {
      const shareBtn = document.createElement("button");
      shareBtn.className = "btn small";
      shareBtn.textContent = "📤 Share";
      shareBtn.onclick = async () => {
        const blob = await canvasToBlob(renderPlatformFull(p));
        const file = new File([blob], kitFilename(p.key, "png"), { type: "image/png" });
        const ok = await shareFiles([file], activeCaptionText(p), "EverVerse");
        if (!ok) downloadPlatformImage(p);
      };
      actions.appendChild(shareBtn);
    }

    card.append(head, thumbWrap, cap, actions);
    grid.appendChild(card);
  });
}

function renderPlatformFull(p) {
  const c = document.createElement("canvas");
  renderVerse(c, p.w, p.h, {
    text: daily.trans.text, ref: daily.verse.ref, rtl: daily.trans.rtl, paletteKey: daily.paletteKey,
    bgKey: daily.bgKey, watermark: daily.watermark, showRef: true,
  });
  return c;
}

function downloadPlatformImage(p) {
  const c = renderPlatformFull(p);
  const a = document.createElement("a");
  a.download = kitFilename(p.key, "png");
  a.href = c.toDataURL("image/png");
  a.click();
}

function kitFilename(suffix, ext) {
  const d = daily.date;
  const ds = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  const ref = daily.verse.ref.replace(/[^\w]+/g, "_").toLowerCase();
  return `${ds}_${ref}_${suffix}.${ext}`;
}

function buildCaptionsText(kit) {
  const d = daily.date;
  const ds = d.toDateString();
  let out = `EVERVERSE — DAILY POST KIT\n${ds}\n\n`;
  out += `Verse: "${kit.verse.text}"\n${kit.verse.ref} (${kit.verse.faith === "Gita" ? "Bhagavad Gita" : kit.verse.faith})\n`;
  out += `Theme: ${kit.verse.topic}\n`;
  if (daily.lang !== "en") {
    const meta = LANGUAGES.find((l) => l.code === daily.lang);
    out += `Image language: ${meta ? meta.name : daily.lang}\n`;
  }
  out += `\n`;
  out += `🎵 Suggested music (${kit.track.mood}): ${kit.track.idea}\n`;
  out += `   Find free tracks at:\n`;
  kit.track.sources.forEach((s) => (out += `   - ${s}\n`));
  out += `\n${"=".repeat(60)}\n\n`;
  kit.platforms.forEach((p) => {
    out += `### ${p.name.toUpperCase()} (${p.w}×${p.h}) — image: ${kitFilename(p.key, "png")}\n\n`;
    out += `${activeCaptionText(p)}\n\n${"-".repeat(60)}\n\n`;
  });
  return out;
}

async function downloadKit() {
  const status = $("kit-status");
  status.textContent = "Building kit…";
  try {
    const kit = buildPostKit(daily.verse);
    const files = [];
    for (const p of kit.platforms) {
      const canvas = renderPlatformFull(p);
      files.push({ name: kitFilename(p.key, "png"), bytes: dataUrlToBytes(canvas.toDataURL("image/png")) });
    }
    files.push({ name: "captions.txt", bytes: new TextEncoder().encode(buildCaptionsText(kit)) });

    const blob = createZipBlob(files, daily.date);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.download = kitFilename("post_kit", "zip");
    a.href = url;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    status.textContent = `✓ Kit ready — ${files.length} files (${kit.platforms.length} images + captions).`;
  } catch (err) {
    status.textContent = `⚠ Could not build kit: ${err.message}`;
  }
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.download = filename;
  a.href = url;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

function top8Filename(suffix) {
  const d = daily.date;
  const ds = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  const ref = daily.verse.ref.replace(/[^\w]+/g, "_").toLowerCase();
  return `${ds}_${ref}_${suffix}`;
}

function renderLangImage(text, rtl) {
  const c = document.createElement("canvas");
  renderVerse(c, 1080, 1080, {
    text, ref: daily.verse.ref, rtl, paletteKey: daily.paletteKey,
    bgKey: daily.bgKey, watermark: daily.watermark, showRef: true,
  });
  return c;
}

// Translate the active verse into the top-8 languages and bundle one 1080² image
// per language (plus the English original) into a single ZIP.
async function downloadTop8() {
  const status = $("top8-status");
  const langs = LANGUAGES.slice(0, 8);
  status.textContent = "Generating language images…";
  try {
    const files = [];
    let txt = `${daily.verse.ref}\nEnglish: ${daily.verse.text}\n\n`;
    files.push({ name: top8Filename("en_original") + ".png", bytes: dataUrlToBytes(renderLangImage(daily.verse.text, false).toDataURL("image/png")) });
    for (let i = 0; i < langs.length; i++) {
      const l = langs[i];
      status.textContent = `Translating ${i + 1}/${langs.length} — ${l.name}…`;
      const key = daily.verse.ref + "|" + l.code;
      let text = daily.transCache[key] ? daily.transCache[key].text : null;
      if (!text) {
        try { text = await translateText(daily.verse.text, l.code); daily.transCache[key] = { text, rtl: !!l.rtl }; }
        catch (_) { text = null; }
      }
      if (!text) { txt += `${l.name}: (translation failed — retry later)\n`; continue; }
      files.push({ name: top8Filename(l.code) + ".png", bytes: dataUrlToBytes(renderLangImage(text, !!l.rtl).toDataURL("image/png")) });
      txt += `${l.name}: ${text}\n`;
      await new Promise((r) => setTimeout(r, 400)); // gentle on the free API
    }
    files.push({ name: "translations.txt", bytes: new TextEncoder().encode(txt) });
    downloadBlob(createZipBlob(files, daily.date), top8Filename("top8_languages") + ".zip");
    status.textContent = `✓ ${files.length - 1} images ready (English + up to ${langs.length} languages).`;
  } catch (err) {
    status.textContent = `⚠ Could not build language images: ${err.message}`;
  }
}

// Fill a source's 90-day dropdown with "Day N · date — ref" options.
function populatePlanSelect(selectId, source) {
  const sel = $(selectId);
  sel.innerHTML = "";
  daily.plans[source].forEach((entry, i) => {
    const dateLabel = entry.date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    sel.add(new Option(`Day ${i + 1} · ${dateLabel} — ${entry.verse.ref}`, String(i)));
  });
}

function initDaily() {
  BACKGROUNDS.forEach((b) => $("daily-bg").add(new Option(b.name, b.key)));
  Object.entries(THEME_PALETTES).forEach(([k, p]) => $("daily-palette").add(new Option(p.name, k)));
  $("daily-bg").value = daily.bgKey;

  // language dropdown: English first, then all supported languages
  $("daily-lang").add(new Option("English (original)", "en"));
  LANGUAGES.forEach((l) => $("daily-lang").add(new Option(l.name, l.code)));

  // build both 90-day plans and fill the dropdowns
  daily.plans = buildPlans(daily.startDate);
  populatePlanSelect("bible-select", "Bible");
  populatePlanSelect("gita-select", "Gita");

  $("bible-select").onchange = () => {
    daily.activeSource = "Bible"; daily.dayIndex = Number($("bible-select").value);
    $("gita-select").selectedIndex = -1; setActiveVerse();
  };
  $("gita-select").onchange = () => {
    daily.activeSource = "Gita"; daily.dayIndex = Number($("gita-select").value);
    $("bible-select").selectedIndex = -1; setActiveVerse();
  };
  $("today-btn").onclick = () => {
    daily.activeSource = "Bible"; daily.dayIndex = 0;
    $("bible-select").value = "0"; $("gita-select").selectedIndex = -1; setActiveVerse();
  };
  $("daily-lang").onchange = () => { daily.lang = $("daily-lang").value; applyDailyLanguage(); };
  $("daily-bg").onchange = () => { daily.bgKey = $("daily-bg").value; renderDailyAll(); };
  $("daily-palette").onchange = () => { daily.paletteKey = $("daily-palette").value; renderDailyAll(); };
  $("daily-watermark").onchange = () => { daily.watermark = $("daily-watermark").checked; renderDailyAll(); };
  $("download-kit").onclick = downloadKit;
  $("gen-top8").onclick = downloadTop8;
  $("verify-meaning").onclick = checkMeaning;
  $("gen-video").onclick = generateDailyVideo;
  $("share-today").onclick = shareToday;
  $("share-video").onclick = shareVideo;
  $("listen-btn").onclick = speakVerse;
  $("stop-listen-btn").onclick = stopSpeak;
  $("daily-voice").value = EVVoice.pref();
  $("daily-voice").onchange = () => EVVoice.setPref($("daily-voice").value);
  $("script-btn").onclick = downloadNarrationScript;
  $("localize-captions").onclick = localizeCaptions;
  $("fav-verse").onclick = () => { toggleFav("verse", daily.verse.ref, `${daily.verse.ref} — ${daily.verse.text.slice(0, 40)}…`); updateFavVerse(); };

  // default: Bible, day 1
  daily.activeSource = "Bible"; daily.dayIndex = 0;
  $("bible-select").value = "0"; $("gita-select").selectedIndex = -1;
  setActiveVerse();
}

/* ================================================================== */
/*  TRANSLATE & DESIGN STUDIO                                          */
/* ================================================================== */
const studio = {
  source: { ref: "", text: "", theme: "warm" },
  translations: {},
  render: { lang: "en", format: "square", bgKey: "gradient", palette: "warm", fontScale: 1, showRef: true, watermark: false },
};

function studioFilteredVerses() {
  const f = $("faith-select").value;
  return VERSE_DB.map((v, i) => ({ v, i })).filter(({ v }) => f === "all" || v.faith === f);
}
function populateStudioVerses() {
  const sel = $("verse-select");
  sel.innerHTML = "";
  studioFilteredVerses().forEach(({ v, i }) =>
    sel.add(new Option(`${v.ref} — ${v.text.slice(0, 32)}…`, String(i))));
}
function studioSetSource(ref, text, theme) {
  studio.source = { ref, text, theme: theme || "warm" };
  studio.translations = { en: { name: "English (original)", text, rtl: false } };
  $("source-ref").textContent = ref || "Custom text";
  $("source-text").textContent = text;
  $("translate-btn").disabled = !text;
  $("translate-all-btn").disabled = !text;
  if (THEME_PALETTES[theme]) { $("palette-select").value = theme; studio.render.palette = theme; }
  studio.render.lang = "en";
  rebuildRenderLang();
  renderStudio();
}
function studioSelectVerse() {
  const v = VERSE_DB[Number($("verse-select").value)];
  if (v) studioSetSource(v.ref, v.text, v.theme);
}

async function translateText(text, to, from) {
  from = from || "en";
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${encodeURIComponent(from)}|${encodeURIComponent(to)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  const out = data?.responseData?.translatedText;
  if (!out) throw new Error(data?.responseDetails || "unavailable");
  return out;
}
async function doTranslate(code) {
  const lang = LANGUAGES.find((l) => l.code === code);
  if (!lang || !studio.source.text) return;
  $("translation-status").textContent = `Translating to ${lang.name}…`;
  $("translate-btn").disabled = true;
  try {
    const text = await translateText(studio.source.text, code);
    studio.translations[code] = { name: lang.name, text, rtl: !!lang.rtl };
    $("translation-status").textContent = `Translated to ${lang.name}.`;
    renderTransList(); rebuildRenderLang();
    $("render-lang").value = code; studio.render.lang = code; renderStudio();
  } catch (e) {
    $("translation-status").textContent = `⚠ ${lang.name}: ${e.message}. Free API may be rate-limited — retry shortly.`;
  } finally { $("translate-btn").disabled = false; }
}
async function doTranslateBatch() {
  const codes = LANGUAGES.slice(0, 8).map((l) => l.code);
  $("translate-all-btn").disabled = true;
  for (let i = 0; i < codes.length; i++) {
    $("translation-status").textContent = `Translating ${i + 1}/${codes.length}…`;
    try {
      const lang = LANGUAGES.find((l) => l.code === codes[i]);
      const text = await translateText(studio.source.text, codes[i]);
      studio.translations[codes[i]] = { name: lang.name, text, rtl: !!lang.rtl };
      renderTransList(); rebuildRenderLang();
    } catch (_) {}
    await new Promise((r) => setTimeout(r, 400));
  }
  $("translation-status").textContent = `Done. ${Object.keys(studio.translations).length - 1} languages.`;
  $("translate-all-btn").disabled = false;
}
function renderTransList() {
  const list = $("translation-list"); list.innerHTML = "";
  Object.entries(studio.translations).filter(([c]) => c !== "en").forEach(([code, t]) => {
    const card = document.createElement("div"); card.className = "trans-card";
    const head = document.createElement("div"); head.className = "t-lang";
    head.innerHTML = `<span>${t.name}</span>`;
    const copy = document.createElement("button"); copy.className = "t-copy"; copy.textContent = "copy";
    copy.onclick = () => navigator.clipboard?.writeText(t.text); head.appendChild(copy);
    const body = document.createElement("div"); body.className = "t-text"; body.textContent = t.text;
    if (t.rtl) body.setAttribute("dir", "rtl");
    card.append(head, body); list.appendChild(card);
  });
}
function rebuildRenderLang() {
  const prev = $("render-lang").value;
  $("render-lang").innerHTML = "";
  Object.entries(studio.translations).forEach(([code, t]) => $("render-lang").add(new Option(t.name, code)));
  if ([...$("render-lang").options].some((o) => o.value === prev)) $("render-lang").value = prev;
}
function renderStudio() {
  const fmt = IMAGE_FORMATS[studio.render.format];
  const t = studio.translations[studio.render.lang];
  renderVerse($("preview-canvas"), fmt.w, fmt.h, {
    text: t ? t.text : studio.source.text, ref: studio.source.ref, rtl: t ? t.rtl : false,
    paletteKey: studio.render.palette, bgKey: studio.render.bgKey,
    showRef: studio.render.showRef, watermark: studio.render.watermark, fontScale: studio.render.fontScale,
  });
}
function studioDownload() {
  renderStudio();
  const a = document.createElement("a");
  const ref = (studio.source.ref || "verse").replace(/[^\w]+/g, "_").toLowerCase();
  a.download = `eververse_${ref}_${studio.render.lang}.png`;
  a.href = $("preview-canvas").toDataURL("image/png");
  a.click();
}

function initStudio() {
  ["Bible", "Gita"].forEach((f) => $("faith-select").add(new Option(f === "Gita" ? "Bhagavad Gita" : f, f)));
  populateStudioVerses();
  LANGUAGES.forEach((l) => $("lang-select").add(new Option(l.name, l.code)));
  Object.entries(IMAGE_FORMATS).forEach(([k, f]) => $("format-select").add(new Option(`${f.name} (${f.w}×${f.h})`, k)));
  BACKGROUNDS.forEach((b) => $("studio-bg").add(new Option(b.name, b.key)));
  Object.entries(THEME_PALETTES).forEach(([k, p]) => $("palette-select").add(new Option(p.name, k)));

  $("faith-select").onchange = () => { populateStudioVerses(); studioSelectVerse(); };
  $("verse-select").onchange = studioSelectVerse;
  $("use-custom-btn").onclick = () => {
    const text = $("custom-text").value.trim();
    if (!text) { $("translation-status").textContent = "Enter some custom text first."; return; }
    studioSetSource($("custom-ref").value.trim(), text, $("palette-select").value || "warm");
  };
  $("translate-btn").onclick = () => doTranslate($("lang-select").value);
  $("translate-all-btn").onclick = doTranslateBatch;
  $("format-select").onchange = () => { studio.render.format = $("format-select").value; renderStudio(); };
  $("studio-bg").onchange = () => { studio.render.bgKey = $("studio-bg").value; renderStudio(); };
  $("palette-select").onchange = () => { studio.render.palette = $("palette-select").value; renderStudio(); };
  $("render-lang").onchange = () => { studio.render.lang = $("render-lang").value; renderStudio(); };
  $("font-scale").oninput = () => { studio.render.fontScale = Number($("font-scale").value) / 100; $("font-scale-val").textContent = $("font-scale").value + "%"; renderStudio(); };
  $("show-ref").onchange = () => { studio.render.showRef = $("show-ref").checked; renderStudio(); };
  $("show-watermark").onchange = () => { studio.render.watermark = $("show-watermark").checked; renderStudio(); };
  $("download-btn").onclick = studioDownload;

  studio.render.format = $("format-select").value;
  studio.render.palette = $("palette-select").value;
  studioSelectVerse();
}

/* ================================================================== */
/*  SCHEDULE & AUTOMATE                                                 */
/* ================================================================== */
let scheduleRows = [];

function fmtDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}
function csvCell(v) { return `"${String(v).replace(/"/g, '""')}"`; }

function renderScheduleImage(verse, bgKey) {
  const c = document.createElement("canvas");
  renderVerse(c, 1080, 1080, {
    text: verse.text, ref: verse.ref, rtl: false, paletteKey: verse.theme,
    bgKey, watermark: true, showRef: true,
  });
  return c;
}

function buildScheduleRows() {
  const src = $("sched-source").value;
  const days = Number($("sched-days").value);
  const time = $("sched-time").value || "09:00";
  const sources = src === "Both" ? ["Bible", "Gita"] : [src];
  const rows = [];
  for (let d = 0; d < days; d++) {
    sources.forEach((s) => {
      const entry = daily.plans[s][d];
      rows.push({ date: entry.date, time, source: s, verse: entry.verse });
    });
  }
  return rows;
}

function renderScheduleTable() {
  const table = $("sched-table");
  table.innerHTML =
    "<thead><tr><th>Date</th><th>Time</th><th>Source</th><th>Verse</th><th>Instagram caption (preview)</th></tr></thead>";
  const tbody = document.createElement("tbody");
  scheduleRows.forEach((r, i) => {
    const tr = document.createElement("tr");
    const igCaption = buildPostKit(r.verse).platforms.find((p) => p.key === "instagram").caption;
    const dateTd = document.createElement("td"); dateTd.textContent = fmtDate(r.date);
    const timeTd = document.createElement("td");
    const timeInput = document.createElement("input"); timeInput.type = "time"; timeInput.value = r.time;
    timeInput.onchange = () => { scheduleRows[i].time = timeInput.value; };
    timeTd.appendChild(timeInput);
    const srcTd = document.createElement("td"); srcTd.innerHTML = `<span class="pill">${r.source === "Gita" ? "Gita" : "Bible"}</span>`;
    const verseTd = document.createElement("td"); verseTd.textContent = r.verse.ref;
    const capTd = document.createElement("td");
    capTd.style.maxWidth = "360px";
    const capDiv = document.createElement("div");
    capDiv.style.maxHeight = "90px"; capDiv.style.overflow = "auto"; capDiv.style.whiteSpace = "pre-wrap";
    capDiv.textContent = igCaption;
    capTd.appendChild(capDiv);
    tr.append(dateTd, timeTd, srcTd, verseTd, capTd);
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
}

function scheduleReadme(count) {
  return [
    "EVERVERSE — SCHEDULE BUNDLE",
    "",
    `Posts: ${count}`,
    "",
    "WHAT'S INSIDE",
    "  schedule.csv  — one row per post: Date, Time, Platform, Source, Reference, Caption, Hashtags, Media File",
    "  media/        — one image per post (1080x1080 PNG), named to match the 'Media File' column",
    "",
    "HOW TO AUTO-PUBLISH (verify -> import -> it posts)",
    "  1. Read through the verses & captions. For any translated posts, sanity-check the",
    "     meaning using the 'Verify meaning' button in the app's Daily Studio.",
    "  2. Open a bulk scheduler that supports CSV upload and auto-posting:",
    "       - Publer   (publer.com)     - strong CSV bulk import",
    "       - Buffer   (buffer.com)",
    "       - Metricool(metricool.com)",
    "       - Hootsuite(hootsuite.com)  - bulk composer",
    "  3. In that tool, connect your Instagram / TikTok / Facebook / YouTube / X accounts ONCE.",
    "  4. Bulk-import schedule.csv and upload the matching images from the media/ folder.",
    "  5. Confirm the queue. The scheduler publishes each post automatically at its date/time.",
    "",
    "NOTE ON CREDENTIALS",
    "  Your platform logins live inside your scheduler, not in this app. The app only",
    "  produces the content bundle. Column names may need light mapping to your tool's",
    "  importer (Date, Time, Caption, Media) — every bulk scheduler supports these fields.",
  ].join("\n");
}

async function exportScheduleBundle() {
  const status = $("sched-status");
  if (!scheduleRows.length) { status.textContent = "Build the table first."; return; }
  const bg = $("sched-bg").value;
  status.textContent = "Building bundle…";
  try {
    const files = [];
    let csv = "Date,Time,Platform,Source,Reference,Caption,Hashtags,Media File\n";
    for (let i = 0; i < scheduleRows.length; i++) {
      const r = scheduleRows[i];
      const dateStr = fmtDate(r.date);
      const refSlug = r.verse.ref.replace(/[^\w]+/g, "_").toLowerCase();
      const media = `${dateStr}_${r.source.toLowerCase()}_${refSlug}.png`;
      files.push({ name: "media/" + media, bytes: dataUrlToBytes(renderScheduleImage(r.verse, bg).toDataURL("image/png")) });
      const kit = buildPostKit(r.verse);
      kit.platforms.forEach((p) => {
        csv += [dateStr, r.time, p.name, (r.source === "Gita" ? "Bhagavad Gita" : "Bible"),
          r.verse.ref, p.caption, p.hashtags.join(" "), media].map(csvCell).join(",") + "\n";
      });
      status.textContent = `Rendering ${i + 1}/${scheduleRows.length}…`;
      await new Promise((res) => setTimeout(res, 0)); // yield to keep UI responsive
    }
    files.push({ name: "schedule.csv", bytes: new TextEncoder().encode(csv) });
    files.push({ name: "README.txt", bytes: new TextEncoder().encode(scheduleReadme(scheduleRows.length)) });
    downloadBlob(createZipBlob(files, new Date()), `eververse_schedule_${fmtDate(scheduleRows[0].date)}.zip`);
    status.textContent = `✓ Bundle ready — ${scheduleRows.length} posts across ${PLATFORMS.length} platforms, ${files.length} files.`;
  } catch (e) {
    status.textContent = `⚠ ${e.message}`;
  }
}

function initSchedule() {
  BACKGROUNDS.forEach((b) => $("sched-bg").add(new Option(b.name, b.key)));
  $("sched-bg").value = "sunrise";
  const rebuild = () => { scheduleRows = buildScheduleRows(); renderScheduleTable(); $("sched-status").textContent = ""; };
  $("sched-build").onclick = rebuild;
  $("sched-source").onchange = rebuild;
  $("sched-days").onchange = rebuild;
  $("sched-time").onchange = rebuild;
  $("sched-export").onclick = exportScheduleBundle;

  // Weekly newsletter
  const t = daily.startDate;
  $("news-start").value = `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,"0")}-${String(t.getDate()).padStart(2,"0")}`;
  $("gen-newsletter").onclick = generateNewsletter;
  $("download-newsletter").onclick = () => downloadBlob(new Blob([lastNewsletterHtml], { type: "text/html" }), "eververse_newsletter.html");
  $("copy-newsletter").onclick = () => { navigator.clipboard?.writeText(lastNewsletterHtml); $("news-status").textContent = "HTML copied to clipboard."; };

  rebuild();
}

/* ================================================================== */
/*  Tabs + boot                                                        */
/* ================================================================== */
function initTabs() {
  const panels = { daily: "tab-daily", read: "tab-read", studio: "tab-studio", schedule: "tab-schedule" };
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.onclick = () => {
      document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      const name = tab.dataset.tab;
      Object.entries(panels).forEach(([key, id]) => $(id).classList.toggle("hidden", key !== name));
    };
  });
}

function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("sw.js").catch(() => {});
    });
  }
}

function init() {
  initTabs();
  initDaily();
  initStudio();
  initSchedule();
  initHub();
  registerServiceWorker();
}
document.addEventListener("DOMContentLoaded", init);
