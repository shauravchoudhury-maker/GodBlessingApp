// app.js — EverVerse Daily Verse Studio
"use strict";

const $ = (id) => document.getElementById(id);

// The EverVerse "house style" — the signature look every post uses by default,
// so the feed is instantly recognizable. Read by render.js renderVerse.
const EV_SIGNATURE = { layout: "editorial", font: "serif", grain: true };
function loadStyle() {
  try { const s = JSON.parse(localStorage.getItem("ev_style") || "null"); return Object.assign({}, EV_SIGNATURE, s || {}); }
  catch (e) { return Object.assign({}, EV_SIGNATURE); }
}
function saveStyle() {
  try { localStorage.setItem("ev_style", JSON.stringify({ layout: EV_STYLE.layout, font: EV_STYLE.font, grain: EV_STYLE.grain })); } catch (e) {}
}
let EV_STYLE = loadStyle();

// Voice-over access token (used by video.js fetchTTS; kept on-device only).
function getTtsToken() { try { return localStorage.getItem("ev_tts_token") || ""; } catch (e) { return ""; } }
function setTtsToken(t) { try { localStorage.setItem("ev_tts_token", t); } catch (e) {} }

async function runVoiceOver() {
  const status = $("vo-status"), btn = $("vo-run");
  if (typeof TTS_READY === "undefined" || !TTS_READY) { status.textContent = "Voice-over isn't connected yet — see TTS_SETUP.md and paste your Worker URL into tts-config.js."; return; }
  const content = $("vo-content").value, lang = $("vo-lang").value, fmt = $("vo-format").value;
  const voiceId = (typeof TTS_VOICES !== "undefined" ? TTS_VOICES[$("vo-voice").value] : undefined);
  const dims = fmt === "square" ? { w: 720, h: 720 } : { w: 720, h: 1280 };
  let text, ref, paletteKey;
  if (content === "sermon") {
    const s = SERMONS.find((x) => x.id === $("vo-sermon").value) || SERMONS[0];
    text = `${s.verseText} ${s.body.join(" ")} ${s.takeaway}`;
    ref = s.verseRef; paletteKey = (VERSE_DB.find((v) => v.ref === s.verseRef) || {}).theme || "royal";
  } else {
    const v = verseForSourceDate(content.replace("verse-", ""), new Date());
    text = `${v.text} ${meaningFor(v)}`; ref = v.ref; paletteKey = v.theme;
  }
  const netMsg = (m) => /failed to fetch|networkerror|load failed|typeerror/i.test(String(m));
  btn.disabled = true; $("vo-download").style.display = "none";
  status.textContent = "Preparing…";
  try {
    let narration = text, rtl = false;
    if (lang !== "en") {
      const meta = LANGUAGES.find((l) => l.code === lang);
      status.textContent = `Translating to ${meta.name}…`;
      try { narration = await translateText(text, lang); rtl = !!meta.rtl; }
      catch (te) { status.textContent = `⚠ Couldn't translate to ${meta.name} (translation service busy). Try English, or retry shortly.`; return; }
    }
    status.textContent = "Creating narration (voice service)…";
    let blob;
    try {
      blob = await generateVoiceOverVideo({
        narrationText: narration, captionText: narration, ref, rtl, paletteKey,
        bgKey: "aurora", voiceId, watermark: true, w: dims.w, h: dims.h,
        onProgress: (p) => { status.textContent = `Recording… ${Math.round(p * 100)}%`; },
      });
    } catch (ve) {
      const m = String(ve && ve.message || ve);
      status.textContent = netMsg(m)
        ? "⚠ Couldn't reach the voice service. Make sure you're on https://eververse.org, your access token is correct, and that an ad-blocker / VPN / Brave shield isn't blocking workers.dev. Then reload and retry."
        : `⚠ ${m}`;
      return;
    }
    const url = URL.createObjectURL(blob);
    const vp = $("vo-preview"); vp.src = url; vp.load();
    lastVoiceOverBlob = blob;
    const ext = videoFileExt(blob);
    const a = $("vo-download"); a.href = url;
    a.download = `eververse_voiceover_${ref.replace(/[^\w]+/g, "_").toLowerCase()}_${lang}.${ext}`;
    a.textContent = `⬇ Download .${ext}`;
    a.style.display = "inline-block";
    $("vo-share").style.display = navigator.canShare ? "inline-block" : "none";
    status.textContent = `✓ Voice-over video ready (${(blob.size / 1048576).toFixed(1)} MB, ${ext.toUpperCase()}).`;
  } catch (e) {
    status.textContent = `⚠ ${e.message || e}`;
  } finally { btn.disabled = false; }
}
function initVoiceOver() {
  if (!$("vo-run")) return;
  // content: today's verse for EVERY tradition, plus any sermon
  $("vo-content").innerHTML = "";
  [...new Set(VERSE_DB.map((v) => v.faith))].forEach((f) => $("vo-content").add(new Option("Today's verse — " + faithLabel(f), "verse-" + f)));
  $("vo-content").add(new Option("A sermon…", "sermon"));
  SERMONS.forEach((s) => $("vo-sermon").add(new Option(faithLabel(s.faith) + " · " + s.title, s.id)));
  $("vo-lang").add(new Option("English (original)", "en"));
  LANGUAGES.forEach((l) => $("vo-lang").add(new Option(l.name, l.code)));
  $("vo-content").onchange = () => { $("vo-sermon-wrap").style.display = $("vo-content").value === "sermon" ? "" : "none"; };
  $("vo-token").value = getTtsToken();
  $("vo-token").oninput = () => setTtsToken($("vo-token").value);
  $("vo-run").onclick = runVoiceOver;
  $("vo-share").onclick = shareVoiceOver;
  if (typeof TTS_READY === "undefined" || !TTS_READY) {
    $("vo-setup").textContent = "⚙ Not connected yet — follow TTS_SETUP.md, deploy the Worker, then paste its URL into tts-config.js.";
  }
}
let lastVoiceOverBlob = null;
async function shareVoiceOver() {
  if (!lastVoiceOverBlob) return;
  const ext = videoFileExt(lastVoiceOverBlob);
  const file = new File([lastVoiceOverBlob], "eververse_voiceover." + ext, { type: lastVoiceOverBlob.type });
  const ok = await shareFiles([file], "A blessing from EverVerse ✦ eververse.org", "EverVerse");
  if (!ok) $("vo-download").click();
}

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
  const plans = {};
  [...new Set(VERSE_DB.map((v) => v.faith))].forEach((src) => {
    plans[src] = [];
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
  EV_STYLE.kicker = "EVERVERSE · " + faithLabel(v.faith).toUpperCase();
  $("verse-faith").textContent = faithLabel(v.faith);
  $("verse-topic").textContent = v.topic;
  $("verse-text").textContent = `“${v.text}”`;
  $("verse-ref").textContent = v.ref;
  $("daily-palette").value = v.theme;

  updateExplainerStats();

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
  // Curated wording needs no MT fidelity check — say so plainly instead.
  if (typeof isCuratedVerse === "function" && isCuratedVerse(daily.verse.ref, daily.lang)) {
    const cur = curatedTranslation(daily.verse.text, daily.lang) || {};
    const review = cur.conf === "review";
    box.innerHTML =
      `<span class="fidelity-badge ${review ? "med" : "high"}">${review ? "Curated — please have a native speaker confirm" : "✓ Curated translation — verified wording"}</span>` +
      `<div class="fidelity-row"><span class="lbl">Original:</span> ${escapeHtml(daily.verse.text)}</div>` +
      `<div class="fidelity-row"><span class="lbl">${meta.name}:</span> ${escapeHtml(cur.text || "")}</div>` +
      `<div class="fidelity-note">${review
        ? "This is a respectful rendering of sacred text, not machine translation — but for Gurbani especially, a check by someone from the tradition is wise before publishing at scale."
        : "Hand-written, not machine translation. Safe to post and to narrate."}</div>`;
    return;
  }
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
    const ext = videoFileExt(blob);
    const a = $("video-download"); a.href = url; a.download = top8Filename("video") + "." + ext; a.textContent = `⬇ Download .${ext}`; a.style.display = "inline-block";
    $("share-video").style.display = (navigator.canShare) ? "inline-block" : "none";
    status.textContent = `✓ Video ready (${(blob.size / 1048576).toFixed(1)} MB, ${ext.toUpperCase()}, ${dur}s${music ? ", with music" : ""}).`;
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

/* ---- Carousels (multi-slide IG posts) ------------------------------ */
function reflectionFor(v) {
  const s = (typeof SERMONS !== "undefined" ? SERMONS : []).find((x) => x.verseRef === v.ref);
  if (s && s.takeaway) return s.takeaway;
  return "Carry this with you today. You are seen, you are loved, and you are not alone.";
}
function carouselCaption(v) {
  const f = v.faith.toLowerCase();
  return `${v.text}\n— ${v.ref}\n\nIn simple words: ${meaningFor(v)}\n\nSave this for a day you need it, and share it with someone you love. 🤍\nFollow @eververse2117 for a daily blessing from the world's wisdom traditions — eververse.org\n\n#dailyverse #${f} #faith #spirituality #dailydevotional #affirmations #wisdom #eververse`;
}
async function generateCarousel() {
  const btn = $("gen-carousel"); if (btn) btn.disabled = true;
  $("kit-status").textContent = "Building carousel…";
  try {
    const v = daily.verse;
    const W = 1080, H = 1350;                 // 4:5 — the highest-reach IG feed ratio
    const pal = daily.paletteKey, bg = daily.bgKey;
    const kick = "EVERVERSE · " + faithLabel(v.faith).toUpperCase();
    const slides = [];
    const mk = (o) => { const c = document.createElement("canvas"); renderVerse(c, W, H, o); slides.push(c); };
    // Optional cover/hook slide — the scroll-stopping first frame.
    const hook = ($("carousel-hook") && $("carousel-hook").value.trim()) || "";
    if (hook) {
      const cov = document.createElement("canvas");
      renderVerse(cov, W, H, { text: hook, paletteKey: pal, bgKey: bg, watermark: true, showRef: false, layout: "affirmation", grain: true });
      const cc = cov.getContext("2d");
      cc.textAlign = "center"; cc.direction = "ltr";
      cc.font = `600 ${Math.min(W, H) * 0.032}px "Helvetica Neue", Arial, sans-serif`;
      cc.fillStyle = hexToRgba((THEME_PALETTES[pal] || THEME_PALETTES.warm).accent, 0.95);
      cc.fillText("swipe →", W / 2, H * 0.9);
      slides.push(cov);
    }
    mk({ text: daily.trans.text, ref: v.ref, rtl: daily.trans.rtl, paletteKey: pal, bgKey: bg, watermark: true, showRef: true, kicker: kick });
    mk({ text: meaningFor(v), paletteKey: pal, bgKey: bg, watermark: true, showRef: false, layout: "editorial", kicker: "IN SIMPLE WORDS" });
    mk({ text: reflectionFor(v), paletteKey: pal, bgKey: bg, watermark: true, showRef: false, layout: "editorial", kicker: "A THOUGHT" });
    const cta = document.createElement("canvas"); drawCtaSlide(cta, W, H, THEME_PALETTES[pal] || THEME_PALETTES.warm, { bgKey: bg }); slides.push(cta);
    const files = [];
    for (let i = 0; i < slides.length; i++) files.push({ name: `slide-${String(i + 1).padStart(2, "0")}.jpg`, bytes: await canvasToBytes(slides[i], "image/jpeg", 0.9) });
    const caption = hook ? (hook + "\n\n" + carouselCaption(v)) : carouselCaption(v);
    files.push({ name: "caption.txt", bytes: new TextEncoder().encode(caption) });
    downloadBlob(createZipBlob(files, new Date()), top8Filename("carousel") + ".zip");
    $("kit-status").textContent = `Carousel ready — ${slides.length} slides + caption, zipped. Upload in order to Instagram.`;
  } catch (e) {
    $("kit-status").textContent = "Carousel error: " + (e && e.message ? e.message : e);
  } finally { if (btn) btn.disabled = false; }
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

// Fill the day dropdown with "Day N · date — ref" for the active tradition.
function populateDaySelect() {
  const sel = $("daily-day");
  sel.innerHTML = "";
  (daily.plans[daily.activeSource] || []).forEach((entry, i) => {
    const dateLabel = entry.date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    sel.add(new Option(`Day ${i + 1} · ${dateLabel} — ${entry.verse.ref}`, String(i)));
  });
  sel.value = String(daily.dayIndex);
}

function initDaily() {
  BACKGROUNDS.forEach((b) => $("daily-bg").add(new Option(b.name, b.key)));
  Object.entries(THEME_PALETTES).forEach(([k, p]) => $("daily-palette").add(new Option(p.name, k)));
  $("daily-bg").value = daily.bgKey;

  // language dropdown: English first, then all supported languages
  $("daily-lang").add(new Option("English (original)", "en"));
  LANGUAGES.forEach((l) => $("daily-lang").add(new Option(l.name, l.code)));

  // build 120-day plans for every tradition and fill the dropdowns
  daily.plans = buildPlans(daily.startDate);
  const faiths = Object.keys(daily.plans);
  $("daily-tradition").innerHTML = "";
  faiths.forEach((f) => $("daily-tradition").add(new Option(faithLabel(f), f)));
  daily.activeSource = faiths[0]; daily.dayIndex = 0;
  populateDaySelect();

  $("daily-tradition").onchange = () => {
    daily.activeSource = $("daily-tradition").value; daily.dayIndex = 0;
    populateDaySelect(); setActiveVerse();
  };
  $("daily-day").onchange = () => { daily.dayIndex = Number($("daily-day").value); setActiveVerse(); };
  $("today-btn").onclick = () => {
    daily.activeSource = faiths[0]; daily.dayIndex = 0;
    $("daily-tradition").value = faiths[0]; populateDaySelect(); setActiveVerse();
  };
  $("daily-lang").onchange = () => { daily.lang = $("daily-lang").value; applyDailyLanguage(); };
  $("daily-bg").onchange = () => { daily.bgKey = $("daily-bg").value; renderDailyAll(); };
  $("daily-palette").onchange = () => { daily.paletteKey = $("daily-palette").value; renderDailyAll(); };
  $("daily-watermark").onchange = () => { daily.watermark = $("daily-watermark").checked; renderDailyAll(); };
  $("daily-layout").value = EV_STYLE.layout; $("daily-font").value = EV_STYLE.font; $("daily-grain").checked = EV_STYLE.grain;
  $("daily-layout").onchange = () => { EV_STYLE.layout = $("daily-layout").value; saveStyle(); renderDailyAll(); };
  $("daily-font").onchange = () => { EV_STYLE.font = $("daily-font").value; saveStyle(); renderDailyAll(); };
  $("daily-grain").onchange = () => { EV_STYLE.grain = $("daily-grain").checked; saveStyle(); renderDailyAll(); };
  if ($("daily-signature")) $("daily-signature").onclick = () => {
    EV_STYLE.layout = EV_SIGNATURE.layout; EV_STYLE.font = EV_SIGNATURE.font; EV_STYLE.grain = EV_SIGNATURE.grain;
    $("daily-layout").value = EV_STYLE.layout; $("daily-font").value = EV_STYLE.font; $("daily-grain").checked = EV_STYLE.grain;
    saveStyle(); renderDailyAll();
  };
  if ($("gen-carousel")) $("gen-carousel").onclick = generateCarousel;
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
  // Curated human translations win over machine translation. Sacred wording
  // (Gita/Gurbani into Hindi, scripture into Spanish) is too easy for MT to
  // get subtly wrong; anything not curated still falls through to MyMemory.
  const curated = (typeof curatedTranslation === "function") ? curatedTranslation(text, to) : null;
  if (curated) return curated.text;
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
  [...new Set(VERSE_DB.map((v) => v.faith))].forEach((f) => $("faith-select").add(new Option(faithLabel(f), f)));
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
  const sources = src === "all" ? Object.keys(daily.plans) : [src];
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
    const srcTd = document.createElement("td"); srcTd.innerHTML = `<span class="pill">${r.source}</span>`;
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
        csv += [dateStr, r.time, p.name, faithLabel(r.source),
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

/* ---- Batch video export ------------------------------------------ */
let batchVideoCancel = false;
function bgForVerseApp(v) {
  const list = ["sunrise","aurora","rays","mesh","clouds","watercolor","ocean","forest","bokeh","meadow","blessing","petals","canopy","strata","aura"];
  const h = v.ref.split("").reduce((a,c)=>(a*31+c.charCodeAt(0))|0,5);
  return list[Math.abs(h) % list.length];
}
function buildVerseBatch(scope) {
  if (scope === "all") return VERSE_DB.slice();
  const faiths = [...new Set(VERSE_DB.map((v) => v.faith))];
  if (faiths.indexOf(scope) !== -1) return VERSE_DB.filter((v) => v.faith === scope); // a single tradition
  const days = scope === "next30" ? 30 : 7;
  const out = [], today = new Date();
  for (let d = 0; d < days; d++) {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate()+d);
    faiths.forEach((s)=>{ const list = VERSE_DB.filter((v)=>v.faith===s); out.push(list[dayOfYear(date)%list.length]); });
  }
  return out;
}
function batchCount() {
  return $("bv-type").value === "sermons" ? SERMONS.length : buildVerseBatch($("bv-scope").value).length;
}
function updateBatchEstimate() {
  const sermon = $("bv-type").value === "sermons";
  $("bv-scope-wrap").style.display = sermon ? "none" : "";
  const n = batchCount(), dur = Number($("bv-duration").value);
  const mins = Math.max(1, Math.ceil(n * (dur + 2) / 60));
  $("bv-estimate").textContent = `${n} videos · about ${mins} min to generate (real time). Large batches use more memory — for the whole library, consider running it in parts (e.g. by source).`;
}
async function runBatchVideo() {
  if (!videoSupported()) { $("bv-status").textContent = "This browser can't record video — use Chrome or Edge."; return; }
  const type = $("bv-type").value, fmt = $("bv-format").value, dur = Number($("bv-duration").value), music = $("bv-music").checked;
  const dims = fmt === "square" ? { w:720, h:720 } : { w:720, h:1280 };
  const items = type === "sermons" ? SERMONS.map((s)=>({ s })) : buildVerseBatch($("bv-scope").value).map((v)=>({ v }));
  batchVideoCancel = false;
  $("bv-cancel").style.display = "inline-block"; $("bv-run").disabled = true;
  const files = [], status = $("bv-status");
  for (let i = 0; i < items.length; i++) {
    if (batchVideoCancel) break;
    const it = items[i];
    const onProgress = (p) => { status.textContent = `Video ${i+1}/${items.length} — ${Math.round(p*100)}%`; };
    try {
      let blob, name;
      if (it.v) {
        blob = await generateVerseVideo({ text: it.v.text, ref: it.v.ref, paletteKey: it.v.theme, theme: it.v.theme,
          kicker: "EVERVERSE · " + faithLabel(it.v.faith).toUpperCase(),
          bgKey: bgForVerseApp(it.v), watermark: true, showRef: true, durationSec: dur, withMusic: music, w: dims.w, h: dims.h, onProgress });
        name = `${it.v.ref.replace(/[^\w]+/g,"_").toLowerCase()}.${videoFileExt(blob)}`;
      } else {
        blob = await generateSermonVideo(it.s, { durationSec: Math.max(dur,12), withMusic: music, w: dims.w, h: dims.h, onProgress });
        name = `sermon_${it.s.id}.${videoFileExt(blob)}`;
      }
      files.push({ name: `eververse_${name}`, bytes: new Uint8Array(await blob.arrayBuffer()) });
    } catch (e) { /* skip a failed item */ }
  }
  $("bv-cancel").style.display = "none"; $("bv-run").disabled = false;
  if (!files.length) { status.textContent = "No videos were generated."; return; }
  status.textContent = `Zipping ${files.length} videos…`;
  try {
    downloadBlob(createZipBlob(files, new Date()), `eververse_videos_${type}.zip`);
    status.textContent = batchVideoCancel
      ? `Stopped — ${files.length} videos zipped.`
      : `✓ Done — ${files.length} videos zipped & downloaded.`;
  } catch (e) { status.textContent = "⚠ Batch too large to zip in memory — try a smaller scope."; }
}

function initSchedule() {
  BACKGROUNDS.forEach((b) => $("sched-bg").add(new Option(b.name, b.key)));
  $("sched-bg").value = "sunrise";

  // Data-driven source lists (all traditions).
  const allFaiths = [...new Set(VERSE_DB.map((v) => v.faith))];
  $("sched-source").innerHTML = "";
  allFaiths.forEach((f) => $("sched-source").add(new Option(faithLabel(f), f)));
  $("sched-source").add(new Option("All traditions", "all"));
  const bv = $("bv-scope");
  bv.innerHTML = "";
  bv.add(new Option("Next 7 days (all traditions)", "next7"));
  bv.add(new Option("Next 30 days (all traditions)", "next30"));
  allFaiths.forEach((f) => bv.add(new Option("All " + faithLabel(f), f)));
  bv.add(new Option("Entire library", "all"));

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

  // Batch video export
  $("bv-type").onchange = updateBatchEstimate;
  $("bv-scope").onchange = updateBatchEstimate;
  $("bv-duration").onchange = updateBatchEstimate;
  $("bv-run").onclick = runBatchVideo;
  $("bv-cancel").onclick = () => { batchVideoCancel = true; };
  updateBatchEstimate();

  rebuild();
}

/* ================================================================== */
/*  5-minute explainer (YouTube + Spotify)                             */
/* ================================================================== */
let exBusy = false;
function exVoiceId() { return (typeof TTS_VOICES !== "undefined") ? TTS_VOICES[$("ex-voice").value] : undefined; }
function initExplainer() {
  if (!$("ex-script")) return;
  $("ex-token").value = getTtsToken();
  $("ex-token").oninput = () => setTtsToken($("ex-token").value);
  $("ex-script").onclick = () => {
    const v = daily.verse; const r = explainerScript(v);
    downloadBlob(new Blob([r.script], { type: "text/plain;charset=utf-8" }), top8Filename("explainer-script") + ".txt");
    $("ex-status").textContent = `Script exported — ${r.words} words ≈ ${r.minutes.toFixed(1)} min.`;
  };
  $("ex-meta").onclick = () => {
    const v = daily.verse; const y = explainerYouTube(v);
    const txt = `TITLE\n${y.title}\n\nDESCRIPTION\n${y.description}\n\nTAGS\n${y.tags}`;
    downloadBlob(new Blob([txt], { type: "text/plain;charset=utf-8" }), top8Filename("youtube-listing") + ".txt");
    $("ex-status").textContent = "YouTube listing exported (title + description + chapters + tags).";
  };
  $("ex-audio").onclick = runExplainerAudio;
  $("ex-video").onclick = runExplainerVideo;
  if ($("ex-pack")) $("ex-pack").onclick = runYouTubePack;
  if ($("ex-batch-narrate")) $("ex-batch-narrate").onclick = runBatchNarrate;
  if ($("ex-batch-count")) { $("ex-batch-count").onchange = updateBatchNarrateEstimate; updateBatchNarrateEstimate(); }
  updateExplainerStats();
}
// Batch YouTube pack: a whole run of ready-to-upload content in one zip —
// per item a script, a YouTube listing, and a thumbnail, plus a posting
// calendar. Sermon-backed verses = the richest scripts, so that's the default.
async function runYouTubePack() {
  const btn = $("ex-pack"); if (btn) btn.disabled = true;
  $("ex-status").textContent = "Building your YouTube pack…";
  try {
    const seen = new Set();
    const verses = SERMONS.map((s) => VERSE_DB.find((v) => v.ref === s.verseRef))
      .filter((v) => v && !seen.has(v.ref) && seen.add(v.ref));
    const files = [];
    const cal = ["day,date,reference,title,folder"];
    const start = new Date();
    for (let i = 0; i < verses.length; i++) {
      const v = verses[i];
      const n = String(i + 1).padStart(2, "0");
      const slug = v.ref.replace(/[^\w]+/g, "_").toLowerCase().slice(0, 40);
      const folder = `${n}-${slug}`;
      const y = explainerYouTube(v);
      files.push({ name: `${folder}/script.txt`, bytes: new TextEncoder().encode(y.script) });
      files.push({ name: `${folder}/youtube-listing.txt`, bytes: new TextEncoder().encode(`TITLE\n${y.title}\n\nDESCRIPTION\n${y.description}\n\nTAGS\n${y.tags}`) });
      files.push({ name: `${folder}/thumbnail.jpg`, bytes: await canvasToBytes(explainerThumbnail(v), "image/jpeg", 0.9) });
      const d = new Date(start); d.setDate(start.getDate() + i);
      cal.push(`${i + 1},${d.toISOString().slice(0, 10)},"${v.ref}","${y.title.replace(/"/g, "'")}",${folder}`);
      if (i % 4 === 0) { $("ex-status").textContent = `Building pack… ${i + 1} / ${verses.length}`; await new Promise((r) => setTimeout(r)); }
    }
    files.push({ name: "content-calendar.csv", bytes: new TextEncoder().encode(cal.join("\n")) });
    files.push({ name: "README.txt", bytes: new TextEncoder().encode(
      "EverVerse — YouTube content pack\n\n" +
      `${verses.length} sermon-backed explainers, one per folder.\n` +
      "Each folder has: script.txt (read/narrate this), youtube-listing.txt (paste title/description/tags), thumbnail.jpg (1280x720).\n\n" +
      "To publish one: record yourself reading script.txt (or use the studio 'Narrate/Render' buttons), upload to YouTube, paste the listing, set the thumbnail.\n" +
      "content-calendar.csv suggests one per day starting today.\n\n" +
      "Tip: the same script.txt works as a Spotify podcast episode — narrate to MP3 and upload to Spotify for Podcasters.") });
    downloadBlob(createZipBlob(files, new Date()), "eververse-youtube-pack.zip");
    $("ex-status").textContent = `✓ Pack ready — ${verses.length} videos' worth of scripts, listings & thumbnails + a calendar.`;
  } catch (e) {
    $("ex-status").textContent = "Pack error: " + (e && e.message ? e.message : e);
  } finally { if (btn) btn.disabled = false; }
}

// Unique sermon-backed verses — the source list for batch narration.
function batchNarrateVerses() {
  const seen = new Set();
  return SERMONS.map((s) => VERSE_DB.find((v) => v.ref === s.verseRef)).filter((v) => v && !seen.has(v.ref) && seen.add(v.ref));
}
function updateBatchNarrateEstimate() {
  if (!$("ex-batch-est") || !$("ex-batch-count")) return;
  const n = parseInt($("ex-batch-count").value, 10);
  const verses = batchNarrateVerses().slice(0, n);
  const chars = verses.reduce((a, v) => a + explainerScript(v).script.length, 0);
  const mins = verses.reduce((a, v) => a + explainerScript(v).minutes, 0);
  $("ex-batch-est").textContent = `${verses.length} episodes · ~${Math.round(mins)} min total · ~${chars.toLocaleString()} characters of ElevenLabs narration.`;
}
async function runBatchNarrate() {
  if (exBusy || !exReady()) return;
  const n = parseInt($("ex-batch-count").value, 10);
  const voiceId = exVoiceId();
  const voiceName = $("ex-voice").value;
  const verses = batchNarrateVerses().slice(0, n);
  exBusy = true;
  ["ex-batch-narrate", "ex-audio", "ex-video", "ex-pack"].forEach((id) => { if ($(id)) $(id).disabled = true; });
  const files = []; const cal = ["episode,date,reference,title,mp3"]; const start = new Date();
  const finish = (partial) => {
    if (files.length) {
      files.push({ name: "episodes.csv", bytes: new TextEncoder().encode(cal.join("\n")) });
      downloadBlob(createZipBlob(files, new Date()), `eververse-narrations-${voiceName}${partial ? "-partial" : ""}.zip`);
    }
  };
  try {
    for (let i = 0; i < verses.length; i++) {
      const v = verses[i]; const y = explainerYouTube(v);
      $("ex-status").textContent = `Narrating ${i + 1} / ${verses.length}: ${v.ref}… (keep this tab open)`;
      const buf = await fetchTTS(explainerScript(v).script, { voiceId });
      const nn = String(i + 1).padStart(2, "0");
      const name = `${nn}-${v.ref.replace(/[^\w]+/g, "_").toLowerCase().slice(0, 40)}.mp3`;
      files.push({ name, bytes: new Uint8Array(buf) });
      const d = new Date(start); d.setDate(start.getDate() + i);
      cal.push(`${i + 1},${d.toISOString().slice(0, 10)},"${v.ref}","${y.title.replace(/"/g, "'")}",${name}`);
    }
    finish(false);
    $("ex-status").textContent = `✓ ${files.length - 1} MP3s narrated in the ${voiceName} voice — upload to Spotify for Podcasters (and pair with the YouTube pack).`;
  } catch (e) {
    finish(true);
    $("ex-status").textContent = `Stopped after ${files.length ? files.length - 1 : 0} of ${verses.length}: ${e && e.message ? e.message : e} — zipped what completed. (Your ElevenLabs credits may be exhausted.)`;
  } finally {
    exBusy = false;
    ["ex-batch-narrate", "ex-audio", "ex-video", "ex-pack"].forEach((id) => { if ($(id)) $(id).disabled = false; });
  }
}

function updateExplainerStats() {
  if (!$("ex-stats") || !daily.verse) return;
  const r = explainerScript(daily.verse);
  $("ex-stats").textContent = `${daily.verse.ref} → ${r.words} words ≈ ${r.minutes.toFixed(1)} min` +
    (r.hasSermon ? " · sermon-backed (richest)" : " · verse-only") + ` · ~${r.script.length.toLocaleString()} voice credits`;
}
function exReady() {
  if (typeof TTS_READY === "undefined" || !TTS_READY) { $("ex-status").textContent = "Voice isn't connected yet — add your Worker URL in tts-config.js."; return false; }
  return true;
}
async function runExplainerAudio() {
  if (exBusy || !exReady()) return;
  exBusy = true; $("ex-audio").disabled = true; $("ex-video").disabled = true;
  $("ex-status").textContent = "Narrating the explainer… (this takes a minute)";
  try {
    const v = daily.verse; const r = explainerScript(v);
    const buf = await fetchTTS(r.script, { voiceId: exVoiceId() });
    const url = URL.createObjectURL(new Blob([new Uint8Array(buf)], { type: "audio/mpeg" }));
    $("ex-audio-preview").src = url; $("ex-audio-preview").style.display = "block";
    const a = $("ex-download"); a.href = url; a.download = top8Filename("explainer") + ".mp3"; a.textContent = "⬇ Download MP3"; a.style.display = "inline-block";
    $("ex-status").textContent = `✓ MP3 ready (~${r.minutes.toFixed(1)} min) — upload to Spotify for Podcasters.`;
  } catch (e) {
    $("ex-status").textContent = "Voice error: " + (e && e.message ? e.message : e);
  } finally { exBusy = false; $("ex-audio").disabled = false; $("ex-video").disabled = false; }
}
async function runExplainerVideo() {
  if (exBusy || !exReady()) return;
  if (!videoSupported()) { $("ex-status").textContent = "⚠ This browser can't record video. Try Chrome/Edge."; return; }
  exBusy = true; $("ex-audio").disabled = true; $("ex-video").disabled = true;
  try {
    const v = daily.verse; const r = explainerScript(v);
    const dims = $("ex-format").value === "portrait" ? { w: 720, h: 1280 } : { w: 1280, h: 720 };
    $("ex-status").textContent = "Narrating + rendering… keep this tab open (renders in real time).";
    const blob = await generateVoiceOverVideo({
      narrationText: r.script, captionText: r.script, ref: v.ref,
      paletteKey: v.theme, bgKey: bgForVerseApp(v), voiceId: exVoiceId(),
      watermark: true, w: dims.w, h: dims.h,
      onProgress: (p) => { $("ex-status").textContent = `Rendering… ${Math.round(p * 100)}%`; },
    });
    const url = URL.createObjectURL(blob);
    $("ex-preview").src = url; $("ex-preview").load();
    const ext = videoFileExt(blob);
    const a = $("ex-download"); a.href = url; a.download = top8Filename("explainer") + "." + ext; a.textContent = `⬇ Download .${ext}`; a.style.display = "inline-block";
    $("ex-status").textContent = `✓ Video ready (${(blob.size / 1048576).toFixed(1)} MB, ${ext.toUpperCase()}) — upload to YouTube with the listing above.`;
  } catch (e) {
    $("ex-status").textContent = "Error: " + (e && e.message ? e.message : e);
  } finally { exBusy = false; $("ex-audio").disabled = false; $("ex-video").disabled = false; }
}

/* ================================================================== */
/*  Cards & Merch                                                      */
/* ================================================================== */
function initCards() {
  if (!$("ecard-occasion")) return;
  ECARD_OCCASIONS.forEach((o) => $("ecard-occasion").add(new Option(o.label, o.id)));
  if ($("ecard-design") && typeof ECARD_DESIGNS !== "undefined") ECARD_DESIGNS.forEach((d) => $("ecard-design").add(new Option(d.label, d.id)));
  $("ecard-occasion").onchange = renderEcardPreview;
  if ($("ecard-design")) $("ecard-design").onchange = renderEcardPreview;
  $("ecard-format").onchange = renderEcardPreview;
  ["ecard-to", "ecard-from"].forEach((id) => { $(id).oninput = debounceEcard; });
  $("ecard-download").onclick = downloadEcard;
  $("ecard-share").onclick = shareEcard;
  if ($("cardpack-run")) $("cardpack-run").onclick = generateCardPack;
  if ($("printpack-run")) $("printpack-run").onclick = generatePrintablePack;
  if ($("collection-run")) $("collection-run").onclick = generateEtsyCollection;
  if ($("pinpack-run")) $("pinpack-run").onclick = generatePinPack;
  $("merch-pack").onclick = generateMerchPack;
}
let _ecardTimer = null;
function debounceEcard() { clearTimeout(_ecardTimer); _ecardTimer = setTimeout(renderEcardPreview, 250); }
function ecardDims() { return $("ecard-format").value === "square" ? { w: 1080, h: 1080 } : { w: 1050, h: 1470 }; }
function ecardOpts() { return { to: ($("ecard-to").value || "").trim(), from: ($("ecard-from").value || "").trim(), design: $("ecard-design") ? $("ecard-design").value : "classic" }; }
function cardPackVerses(scope) {
  if (scope === "faith") return VERSE_DB.filter((v) => v.faith === daily.verse.faith);
  if (scope === "sermons") { const seen = new Set(); return SERMONS.map((s) => VERSE_DB.find((v) => v.ref === s.verseRef)).filter((v) => v && !seen.has(v.ref) && seen.add(v.ref)); }
  const days = parseInt(scope, 10) || 7;
  const faiths = [...new Set(VERSE_DB.map((v) => v.faith))]; const out = []; const today = new Date();
  for (let i = 0; i < days; i++) { const d = new Date(today); d.setDate(today.getDate() + i); out.push(verseForSourceDate(faiths[dayOfYear(d) % faiths.length], d)); }
  return out;
}
async function generateCardPack() {
  const btn = $("cardpack-run"); btn.disabled = true;
  $("cardpack-status").textContent = "Building card pack…";
  try {
    const scope = $("cardpack-scope").value, occ = $("ecard-occasion").value, design = ecardOpts().design;
    const verses = cardPackVerses(scope).filter(Boolean);
    const d = ecardDims(); const opts = ecardOpts();
    const files = []; const cal = ["card,reference,faith,file"];
    for (let i = 0; i < verses.length; i++) {
      const v = verses[i]; const c = document.createElement("canvas");
      drawEcard(c, v, occ, d.w, d.h, opts);
      const nn = String(i + 1).padStart(2, "0");
      const name = `${nn}-${v.ref.replace(/[^\w]+/g, "_").toLowerCase().slice(0, 40)}.jpg`;
      files.push({ name, bytes: await canvasToBytes(c, "image/jpeg", 0.9) });
      cal.push(`${i + 1},"${v.ref}",${v.faith},${name}`);
      if (i % 4 === 0) { $("cardpack-status").textContent = `Building… ${i + 1} / ${verses.length}`; await new Promise((r) => setTimeout(r)); }
    }
    files.push({ name: "cards.csv", bytes: new TextEncoder().encode(cal.join("\n")) });
    downloadBlob(createZipBlob(files, new Date()), top8Filename("cardpack-" + design) + ".zip");
    $("cardpack-status").textContent = `✓ ${verses.length} cards ready (${design} design) — post to Pinterest/social.`;
  } catch (e) {
    $("cardpack-status").textContent = "Card pack error: " + (e && e.message ? e.message : e);
  } finally { btn.disabled = false; }
}
function renderEcardPreview() {
  if (!$("ecard-canvas") || !daily.verse) return;
  if ($("cards-verse-ref")) $("cards-verse-ref").textContent = daily.verse.ref + " · " + faithLabel(daily.verse.faith);
  if ($("printpack-ref")) $("printpack-ref").textContent = daily.verse.ref + " · " + faithLabel(daily.verse.faith);
  const d = ecardDims();
  drawEcard($("ecard-canvas"), daily.verse, $("ecard-occasion").value, d.w, d.h, ecardOpts());
}
async function downloadEcard() {
  const d = ecardDims(); const c = document.createElement("canvas");
  drawEcard(c, daily.verse, $("ecard-occasion").value, d.w * 2, d.h * 2, ecardOpts());
  c.toBlob((blob) => downloadBlob(blob, top8Filename("ecard-" + $("ecard-occasion").value) + ".jpg"), "image/jpeg", 0.92);
  $("ecard-status").textContent = "eCard downloaded — send it, or upload to Canva.";
}
async function shareEcard() {
  const d = ecardDims(); const c = document.createElement("canvas");
  drawEcard(c, daily.verse, $("ecard-occasion").value, d.w * 2, d.h * 2, ecardOpts());
  c.toBlob(async (blob) => {
    const file = new File([blob], "eververse-ecard.jpg", { type: "image/jpeg" });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try { await navigator.share({ files: [file], title: "An EverVerse blessing ✦" }); return; } catch (e) { if (e && e.name === "AbortError") return; }
    }
    downloadBlob(blob, "eververse-ecard.jpg");
  }, "image/jpeg", 0.92);
}
async function generateMerchPack() {
  const btn = $("merch-pack"); btn.disabled = true;
  $("merch-status").textContent = "Building print-ready pack…";
  try {
    const v = daily.verse; const files = [];
    const artOpts = chosenArtOpts(); // poster/print/wallpaper follow the chosen Daily design
    const rv = (w, h) => { const c = document.createElement("canvas"); renderVerse(c, w, h, artOpts); return c; };
    files.push({ name: "poster-portrait.jpg", bytes: await canvasToBytes(rv(2400, 3600), "image/jpeg", 0.9) });
    files.push({ name: "print-square.jpg", bytes: await canvasToBytes(rv(2400, 2400), "image/jpeg", 0.9) });
    files.push({ name: "wallpaper-phone.jpg", bytes: await canvasToBytes(rv(1080, 2340), "image/jpeg", 0.92) });
    const dark = document.createElement("canvas"); drawPrintDesign(dark, v, 3000, 3600, { color: "#161616" });
    files.push({ name: "apparel-dark.png", bytes: await canvasToBytes(dark, "image/png") });
    const light = document.createElement("canvas"); drawPrintDesign(light, v, 3000, 3600, { color: "#ffffff" });
    files.push({ name: "apparel-light.png", bytes: await canvasToBytes(light, "image/png") });
    files.push({ name: "README.txt", bytes: new TextEncoder().encode(MERCH_README) });
    downloadBlob(createZipBlob(files, new Date()), top8Filename("merch") + ".zip");
    $("merch-status").textContent = "✓ Merch pack ready — upload to Printful / Redbubble / Canva.";
  } catch (e) {
    $("merch-status").textContent = "Merch error: " + (e && e.message ? e.message : e);
  } finally { btn.disabled = false; }
}

// The exact design chosen in the Daily tab, so Etsy exports match the on-screen
// post rather than the verse's raw defaults. Palette, background, kicker, ref,
// text and watermark come from the daily selection; layout/font/grain are left
// out on purpose so renderVerse falls through to EV_STYLE (also user-chosen).
function chosenArtOpts(over) {
  const v = daily.verse;
  return Object.assign({
    text: (daily.trans && daily.trans.text) || v.text,
    ref: v.ref,
    rtl: !!(daily.trans && daily.trans.rtl),
    paletteKey: daily.paletteKey || v.theme,
    bgKey: daily.bgKey,
    kicker: (typeof EV_STYLE !== "undefined" && EV_STYLE.kicker) || undefined,
    watermark: daily.watermark,
    showRef: true,
  }, over || {});
}

// Printable wall art pack — the highest-margin product: one verse exported at
// every standard frame ratio (~300 DPI) + a print guide & starter Etsy listing.
// Render the 6 print ratios for a verse and bundle them (+ a buyer print guide)
// into ONE print-files.zip, MEASURING the real output and stepping down
// quality/size so the bundle stays under Etsy's 20 MB per-file cap regardless
// of the design or the browser's JPEG encoder. Returns { bytes, chart, mb,
// optimised }. Canvases are freed between renders to keep memory flat.
async function buildPrintFilesZip(v, artOpts, slug, onStatus) {
  const TARGET = 18 * 1024 * 1024;
  const TIERS = [
    { long: 4000, q: 0.90 },   // ~300 DPI at 13" — the default
    { long: 4000, q: 0.80 },
    { long: 3400, q: 0.82 },
    { long: 3000, q: 0.75 },   // last resort — still ~300 DPI at 10"
  ];
  let printFiles = [], chart = [], total = 0, used = TIERS[0];
  for (let t = 0; t < TIERS.length; t++) {
    const tier = TIERS[t]; printFiles = []; chart = []; total = 0;
    for (let i = 0; i < PRINT_RATIOS.length; i++) {
      const r = PRINT_RATIOS[i];
      const h = tier.long, w = Math.round(tier.long * (r.w / r.h));
      const c = document.createElement("canvas");
      renderVerse(c, w, h, artOpts);
      const bytes = await canvasToBytes(c, "image/jpeg", tier.q);
      c.width = c.height = 0;
      printFiles.push({ name: `EverVerse-${slug}-${r.id}.jpg`, bytes });
      total += bytes.length;
      chart.push(`- ${r.id.replace("_", " ")}  (${w}x${h}px)  → fits ${r.fits}`);
      if (onStatus) onStatus(i + 1, PRINT_RATIOS.length, t);
      await new Promise((res) => setTimeout(res));
    }
    used = tier;
    if (total <= TARGET || t === TIERS.length - 1) break;
  }
  printFiles.push({ name: "How to print.txt", bytes: new TextEncoder().encode(printGuideForBuyer(v, chart)) });
  const innerZip = createZipBlob(printFiles, new Date());
  return { bytes: new Uint8Array(await innerZip.arrayBuffer()), chart, mb: innerZip.size / 1024 / 1024, optimised: used.long < 4000 };
}

async function generatePrintablePack() {
  const btn = $("printpack-run"); if (!btn) return;
  btn.disabled = true;
  const status = $("printpack-status");
  status.textContent = "Rendering print sizes…";
  try {
    const v = daily.verse;
    // Print files mirror the design chosen in the Daily tab (WYSIWYG with the
    // preview): palette, background, layout, font, grain, kicker and watermark.
    const slug = v.ref.replace(/[^\w]+/g, "_").toLowerCase().slice(0, 32);
    const files = [];
    const pf = await buildPrintFilesZip(v, chosenArtOpts(), slug, (i, n, t) => {
      status.textContent = `Rendering… ${i}/${n}${t ? ` (optimising, pass ${t + 1})` : ""}`;
    });
    files.push({ name: "print-files.zip", bytes: pf.bytes });

    // Listing images — the pictures a buyer clicks on. Always branded so the ✦
    // mark on the listing photo deters image theft (print files stay clean).
    status.textContent = "Building listing images…";
    const shots = await buildListingImages(v, chosenArtOpts({ watermark: true }));
    shots.forEach((f) => files.push(f));

    // ASCII-only filename: our zip writer doesn't set the UTF-8 name flag.
    files.push({ name: "READ-ME-how-to-list-on-Etsy.txt", bytes: new TextEncoder().encode(printableReadme(v, pf.chart)) });
    downloadBlob(createZipBlob(files, new Date()), top8Filename("printable-" + slug.slice(0, 24)) + ".zip");
    status.textContent = `✓ print-files.zip (${pf.mb.toFixed(1)}MB, ${PRINT_RATIOS.length} sizes${pf.optimised ? ", size-optimised" : ""}) + ${shots.length} listing images — drag straight into Etsy.`;
  } catch (e) {
    status.textContent = "Printable pack error: " + (e && e.message ? e.message : e);
  } finally { btn.disabled = false; }
}

// Best-of-30 Etsy collection — a curated master zip: one numbered folder per
// listing (print-files.zip + listing-images/ + listing.txt) plus a master copy
// sheet. Each listing renders in its own hand-picked design (ETSY_COLLECTION).
async function generateEtsyCollection() {
  const btn = $("collection-run"); if (!btn) return;
  const status = $("collection-status");
  const count = Math.min(parseInt(($("collection-count") || {}).value, 10) || ETSY_COLLECTION.length, ETSY_COLLECTION.length);
  btn.disabled = true;
  const files = []; const index = ["#,reference,faith,style,room,title"]; const done = [];
  try {
    for (let n = 0; n < count; n++) {
      const e = ETSY_COLLECTION[n];
      const L = collectionListing(e);
      if (!L) { continue; }
      const v = L.v;
      const nn = String(n + 1).padStart(2, "0");
      const slug = e.head.replace(/[^\w]+/g, "-").toLowerCase().replace(/^-+|-+$/g, "").slice(0, 32);
      const folder = `${nn}-${slug}`;
      status.textContent = `Building ${n + 1}/${count} — ${v.ref}…`;
      await new Promise((r) => setTimeout(r));
      // Clean print files in the curated design + branded listing mockups.
      const pf = await buildPrintFilesZip(v, collectionArtOpts(e, v), slug, (i, tot, t) => {
        status.textContent = `Building ${n + 1}/${count} — ${v.ref} — print ${i}/${tot}${t ? " (optimising)" : ""}`;
      });
      files.push({ name: `${folder}/print-files.zip`, bytes: pf.bytes });
      const shots = await buildListingImages(v, collectionArtOpts(e, v, { watermark: true }));
      shots.forEach((f) => files.push({ name: `${folder}/${f.name}`, bytes: f.bytes }));
      const listingTxt = `TITLE\n-----\n${L.title}\n\nTAGS (paste one per box; Etsy allows 13)\n----\n${L.tags.join(", ")}\n\nDESCRIPTION\n-----------\n${L.description}\n\n---\nPHOTOS: upload the 5 files in listing-images/ (mockup-oak-warm first).\nDIGITAL FILE: upload print-files.zip.\nType: Digital / instant download. Suggested price: $6.\n`;
      files.push({ name: `${folder}/listing.txt`, bytes: new TextEncoder().encode(listingTxt) });
      index.push(`${n + 1},"${v.ref}",${v.faith},"${e.style}","${e.room}","${L.title.replace(/"/g, "'")}"`);
      done.push(`${nn}  ${v.ref} — ${e.head}`);
    }
    files.push({ name: "ALL-LISTINGS.csv", bytes: new TextEncoder().encode(index.join("\n")) });
    files.push({ name: "START-HERE.txt", bytes: new TextEncoder().encode(collectionStartHere(done)) });
    downloadBlob(createZipBlob(files, new Date()), `EverVerse-Etsy-collection-${count}.zip`);
    status.textContent = `✓ ${done.length} listings ready — each folder = one Etsy listing (photos + print-files.zip + copy).`;
  } catch (err) {
    status.textContent = "Collection error at listing " + (done.length + 1) + ": " + (err && err.message ? err.message : err);
  } finally { btn.disabled = false; }
}
// Pinterest pin pack — a light zip of vertical 2:3 pins (one per curated
// listing) + Pinterest SEO copy. Pinterest is the traffic engine that feeds
// the Etsy listings, so each pin is a clear, shoppable product pin.
async function generatePinPack() {
  const btn = $("pinpack-run"); if (!btn) return;
  const status = $("pinpack-status");
  const count = Math.min(parseInt(($("pinpack-count") || {}).value, 10) || ETSY_COLLECTION.length, ETSY_COLLECTION.length);
  btn.disabled = true;
  const files = []; const copy = ["EverVerse — Pinterest pins", "==========================", ""];
  try {
    for (let n = 0; n < count; n++) {
      const e = ETSY_COLLECTION[n];
      const P = pinCopy(e); if (!P) continue;
      const v = P.v;
      const nn = String(n + 1).padStart(2, "0");
      const slug = e.head.replace(/[^\w]+/g, "-").toLowerCase().replace(/^-+|-+$/g, "").slice(0, 32);
      status.textContent = `Building pin ${n + 1}/${count} — ${v.ref}…`;
      await new Promise((r) => setTimeout(r));
      const c = document.createElement("canvas");
      drawPin(c, v, e.head, collectionArtOpts(e, v), 1000, 1500);
      files.push({ name: `pins/${nn}-${slug}.jpg`, bytes: await canvasToBytes(c, "image/jpeg", 0.9) });
      c.width = c.height = 0;
      copy.push(`#${n + 1} — ${v.ref}  (pin: ${nn}-${slug}.jpg)`);
      copy.push(`LINK TO: your Etsy listing #${n + 1} (${e.head})`);
      copy.push(`TITLE: ${P.title}`);
      copy.push(`DESCRIPTION:\n${P.description}`);
      copy.push("");
    }
    files.push({ name: "PINS-COPY.txt", bytes: new TextEncoder().encode(copy.join("\n")) });
    files.push({ name: "PIN-GUIDE.txt", bytes: new TextEncoder().encode(pinGuide(count)) });
    downloadBlob(createZipBlob(files, new Date()), `EverVerse-Pinterest-pins-${count}.zip`);
    status.textContent = `✓ ${count} pins + Pinterest copy ready — schedule 3–5/day, each linked to its Etsy listing.`;
  } catch (err) {
    status.textContent = "Pin pack error: " + (err && err.message ? err.message : err);
  } finally { btn.disabled = false; }
}
function pinGuide(count) {
  return `EverVerse — Pinterest pin pack
==============================
${count} vertical 2:3 pins (1000x1500) + PINS-COPY.txt with a title &
description for each. Pinterest is a search engine and your #1 free
traffic source to Etsy.

Set-up (once)
-------------
1. Create a FREE Pinterest BUSINESS account (pinterest.com/business).
2. Claim your site (eververse.org) and, later, your Etsy shop — this
   unlocks analytics and richer pins.
3. Make a few boards: "Bible Verse Wall Art", "Boho Scripture Prints",
   "Inspirational Quotes", "Bhagavad Gita Art", etc.

Posting (the routine that works)
--------------------------------
- Pin 3-5 per day, spread out — steady beats bursts. Pinterest rewards
  consistency and fresh pins.
- For each pin: upload the image from pins/, paste the TITLE and
  DESCRIPTION from PINS-COPY.txt, and set the DESTINATION LINK to that
  product's Etsy listing URL. THIS LINK IS WHAT DRIVES SALES.
- Add it to the most relevant board. Re-pin your best performers to
  other boards over time.
- Pins have a long tail — many get their best traffic months later.
  Keep pinning; don't judge by day one.

Tip: make 2-3 different pins for your best verses later (different
palette/layout) — more pins = more entries into search.

Made with EverVerse · eververse.org`;
}
function collectionStartHere(doneLines) {
  return `EverVerse — Best-of Etsy collection
===================================
${doneLines.length} ready-to-post printable wall art listings.

Each numbered folder is ONE complete Etsy listing:
  print-files.zip     → upload as the digital file (6 print sizes inside)
  listing-images/     → upload as the photos (5 images; oak-warm first)
  listing.txt         → the title, 13 tags & description to paste

To post each one on Etsy
------------------------
1. Shop Manager > Listings > Add a listing.
2. Photos: drag the 5 files from listing-images/.
3. About: Made by you / A finished product / DIGITAL.
4. Category: Art & Collectibles > Prints > Digital Prints.
5. Paste Title, Tags, Description from listing.txt.
6. Digital file: upload print-files.zip. Price ~$6. Publish.
7. Pin the oak-warm mockup on Pinterest, linked to the listing.

The 30 (in this file's order)
-----------------------------
${doneLines.join("\n")}

ALL-LISTINGS.csv has every title in a spreadsheet for tracking.
Made with EverVerse · eververse.org`;
}
// Square 2000px listing images: framed room mockups + size chart + info card.
async function buildListingImages(v, artOpts) {
  const S = 2000, out = [];
  for (const sc of MOCKUP_SCENES) {
    const c = document.createElement("canvas");
    drawMockup(c, v, sc.id, S, S, artOpts, { w: 4, h: 5 });
    out.push({ name: `listing-images/mockup-${sc.id}.jpg`, bytes: await canvasToBytes(c, "image/jpeg", 0.9) });
    await new Promise((r) => setTimeout(r));
  }
  const chart = document.createElement("canvas");
  drawSizeChart(chart, v, S, S, PRINT_RATIOS);
  out.push({ name: "listing-images/what-you-get.jpg", bytes: await canvasToBytes(chart, "image/jpeg", 0.9) });
  const info = document.createElement("canvas");
  drawInfoCard(info, v, S, S);
  out.push({ name: "listing-images/instant-download.jpg", bytes: await canvasToBytes(info, "image/jpeg", 0.9) });
  return out;
}

// Buyer-facing guide — goes INSIDE print-files.zip, next to the 6 prints.
function printGuideForBuyer(v, chartLines) {
  const faith = (typeof faithLabel === "function") ? faithLabel(v.faith) : v.faith;
  return `Thank you — your EverVerse printable
====================================
"${v.ref}" — ${faith}

This is a digital download. Inside this zip are 6 print files, one per
aspect ratio, each ~300 DPI on the long edge. Pick the file that matches
your frame's shape and print it at the size you want (large prints land
near 200 DPI, the accepted standard for wall art).

The files & the frame sizes they fit
------------------------------------
${chartLines.join("\n")}

How to print
------------
- At home: use quality matte or photo paper; in the print dialog choose the
  exact frame size or "fit to page"; borderless if your printer supports it.
- Print shop / online (Walgreens, Boots, Prodigi, etc.): upload the file
  whose ratio matches your frame — e.g. the 2x3 file for an 8x12, 16x24 or
  24x36 frame; the 11x14 file for an 11x14 or 22x28 frame.
- Colours vary slightly by printer & paper — this is normal for prints.

For personal use. Please don't resell or redistribute the files.
Made with EverVerse · eververse.org`;
}

// Seller-facing guide — the root README that tells YOU how to list it.
function printableReadme(v, chartLines) {
  const faith = (typeof faithLabel === "function") ? faithLabel(v.faith) : v.faith;
  const fl = faith.toLowerCase();
  return `EverVerse — Etsy listing pack for "${v.ref}" (${faith})
================================================================
Everything to publish ONE digital / instant-download Etsy listing.
No physical item ships — Etsy delivers the file automatically.

What's in this pack
-------------------
print-files.zip     ← upload as the DIGITAL FILE (the 1 thing buyers get).
                       Holds all 6 print ratios + a buyer print guide.
                       One zip = one file slot (Etsy caps a listing at 5).
listing-images/     ← upload as the PHOTOS (2000x2000 each):
  mockup-oak-warm.jpg     framed on a warm wall  → set as the MAIN photo
  mockup-black-grey.jpg   black frame on soft grey
  mockup-shelf-plant.jpg  framed on a shelf, styled
  what-you-get.jpg        the size chart
  instant-download.jpg    heads off "is this physical?" messages
This file            ← just for you; don't upload it.

The print ratios inside print-files.zip
----------------------------------------
${chartLines.join("\n")}

Step-by-step on Etsy
--------------------
1. Shop Manager > Listings > Add a listing.
2. Photos: upload the 5 files from listing-images/ (oak-warm first).
3. About: Made by you / A finished product / DIGITAL.
4. Category: Art & Collectibles > Prints > Digital Prints.
5. Title / Tags / Description: paste the starter copy below.
6. Digital files: upload print-files.zip (one file, done).
7. Price ~$6. Publish.

Starter listing copy (edit freely)
----------------------------------
TITLE:
${v.ref} Printable Wall Art | ${faith} Quote Print | Faith Home Decor | Instant Download

TAGS (Etsy allows 13):
printable wall art, ${fl} art, scripture print, faith decor, verse wall art,
spiritual gift, instant download, quote print, prayer room decor,
inspirational art, digital print, ${fl} gift, meditation decor

DESCRIPTION:
Bring "${v.ref}" into any room. This instant-download set includes 6 print
ratios so you can print at home or a shop at the size you need — no physical
item is shipped. Frame families included: 2:3, 3:4, 4:5, 11x14, 5:7 and ISO A.
For personal use; please don't resell the file itself.

Tip: drive traffic by pinning mockup-oak-warm.jpg on Pinterest, linked to
the listing. (Ask EverVerse for the batch SEO listing generator + Pinterest
pin pack to scale this.)`;
}

/* ================================================================== */
/*  Audiobooks                                                         */
/* ================================================================== */
let abChapters = [];
let abBusy = false;
let abCancel = false;

function abSlug(s) { return (s || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "track"; }
function abCurrentBook() { return audiobookById($("ab-select").value); }
function abVoiceId() { return (typeof TTS_VOICES !== "undefined") ? TTS_VOICES[$("ab-gender").value] : undefined; }
function canvasToBytes(canvas, type, q) {
  return new Promise((resolve) => canvas.toBlob(async (b) => resolve(new Uint8Array(await b.arrayBuffer())), type, q));
}

function initAudiobooks() {
  if (!$("ab-select")) return;
  AUDIOBOOKS.forEach((b) => $("ab-select").add(new Option(`${b.title} — ${faithLabel(b.faith)}`, b.id)));
  $("ab-token").value = getTtsToken();
  $("ab-token").oninput = () => setTtsToken($("ab-token").value);
  $("ab-select").onchange = renderAudiobook;
  $("ab-picturebook").onclick = runPictureBook;
  $("ab-pdf").onclick = () => { const b = abCurrentBook(); downloadBlob(createBookPdfBlob(b), `${b.id}-book.pdf`); };
  $("ab-manuscript").onclick = () => { const b = abCurrentBook(); downloadBlob(new Blob([audiobookManuscript(b, abChapters)], { type: "text/plain;charset=utf-8" }), `${b.id}-manuscript.txt`); };
  $("ab-listing").onclick = () => { const b = abCurrentBook(); downloadBlob(new Blob([audiobookListing(b, abChapters, audiobookStats(abChapters))], { type: "text/plain;charset=utf-8" }), `${b.id}-listing.txt`); };
  $("ab-cover-dl").onclick = () => { const b = abCurrentBook(); const c = document.createElement("canvas"); drawAudiobookCover(c, b, 2400); c.toBlob((blob) => downloadBlob(blob, `${b.id}-cover.jpg`), "image/jpeg", 0.92); };
  $("ab-sample").onclick = runAudiobookSample;
  $("ab-run").onclick = runAudiobookFull;
  $("ab-cancel").onclick = () => { abCancel = true; };
  if (typeof TTS_READY === "undefined" || !TTS_READY) {
    $("ab-setup").textContent = "⚙ Connect your EverVerse voice in tts-config.js to narrate. You can still export the manuscript, listing and cover art now.";
  }
  renderAudiobook();
}

async function runPictureBook() {
  if (abBusy) return;
  abBusy = true;
  const b = abCurrentBook();
  const btn = $("ab-picturebook"); btn.disabled = true; $("ab-pdf").disabled = true;
  $("ab-status").textContent = "Illustrating your picture book…";
  try {
    const blob = await createPictureBookPdfBlob(b, (i, n) => { $("ab-status").textContent = `Illustrating… ${i} / ${n} verses`; });
    downloadBlob(blob, `${b.id}-picture-book.pdf`);
    $("ab-status").textContent = `Picture book ready — ${(blob.size / 1048576).toFixed(1)} MB, downloaded.`;
  } catch (e) {
    $("ab-status").textContent = "Picture book error: " + (e && e.message ? e.message : e);
  } finally {
    abBusy = false; btn.disabled = false; $("ab-pdf").disabled = false;
  }
}

function renderAudiobook() {
  const book = abCurrentBook();
  abChapters = buildAudiobookChapters(book);
  drawAudiobookCover($("ab-cover"), book, 600);
  $("ab-title").textContent = book.title;
  $("ab-sub").textContent = book.subtitle;
  const s = audiobookStats(abChapters);
  $("ab-stats").innerHTML =
    `<span><b>${s.chapters}</b> chapters</span>` +
    `<span><b>${fmtDuration(s.minutes)}</b> listening</span>` +
    `<span><b>${s.words.toLocaleString()}</b> words</span>` +
    `<span>~<b>${s.chars.toLocaleString()}</b> voice credits</span>`;
  $("ab-desc").textContent = book.intro;
  const wrap = $("ab-chapters"); wrap.innerHTML = "";
  abChapters.forEach((c, i) => {
    const row = document.createElement("div");
    row.className = "ab-chap kind-" + c.kind;
    row.innerHTML = `<span class="n">${String(i).padStart(2, "0")}</span><span class="t"></span><span class="w">${countWords(c.script)} w</span>`;
    row.querySelector(".t").textContent = c.title;
    wrap.appendChild(row);
  });
  $("ab-status").textContent = "";
  $("ab-audio").style.display = "none";
  $("ab-download").style.display = "none";
}

function abVoiceReady() {
  if (typeof TTS_READY === "undefined" || !TTS_READY) {
    $("ab-status").textContent = "Voice isn't connected yet — add your Worker URL in tts-config.js.";
    return false;
  }
  return true;
}

async function runAudiobookSample() {
  if (abBusy || !abVoiceReady()) return;
  const book = abCurrentBook();
  const sample = buildAudiobookChapters(book).filter((c) => c.kind === "open" || c.kind === "verse").slice(0, 2);
  const text = sample.map((c) => c.script).join("  ");
  abBusy = true;
  $("ab-sample").disabled = true; $("ab-run").disabled = true;
  $("ab-status").textContent = "Narrating a sample…";
  try {
    const buf = await fetchTTS(text, { voiceId: abVoiceId() });
    const url = URL.createObjectURL(new Blob([new Uint8Array(buf)], { type: "audio/mpeg" }));
    $("ab-audio").src = url; $("ab-audio").style.display = "block";
    $("ab-download").href = url; $("ab-download").download = `${book.id}-sample.mp3`; $("ab-download").style.display = "inline-block";
    $("ab-status").textContent = "Sample ready — this is your ACX 'retail audio sample'. ▶ Listen or download.";
  } catch (e) {
    $("ab-status").textContent = "Voice error: " + (e && e.message ? e.message : e);
  } finally {
    abBusy = false; $("ab-sample").disabled = false; $("ab-run").disabled = false;
  }
}

async function runAudiobookFull() {
  if (abBusy || !abVoiceReady()) return;
  const book = abCurrentBook();
  const chapters = buildAudiobookChapters(book);
  abBusy = true; abCancel = false;
  $("ab-cancel").style.display = "inline-block";
  $("ab-sample").disabled = true; $("ab-run").disabled = true;
  $("ab-audio").style.display = "none"; $("ab-download").style.display = "none";
  const files = [];
  try {
    for (let i = 0; i < chapters.length; i++) {
      if (abCancel) { $("ab-status").textContent = "Cancelled after " + files.length + " chapters."; break; }
      $("ab-status").textContent = `Narrating ${i + 1} / ${chapters.length}: ${chapters[i].title}…`;
      const buf = await fetchTTS(chapters[i].script, { voiceId: abVoiceId() });
      files.push({ name: `audio/${String(i).padStart(2, "0")}-${abSlug(chapters[i].title)}.mp3`, bytes: new Uint8Array(buf) });
    }
    if (!abCancel && files.length) {
      $("ab-status").textContent = "Building cover + packaging…";
      const cover = document.createElement("canvas"); drawAudiobookCover(cover, book, 2400);
      files.push({ name: `${book.id}-cover.jpg`, bytes: await canvasToBytes(cover, "image/jpeg", 0.92) });
      files.push({ name: "manuscript.txt", bytes: new TextEncoder().encode(audiobookManuscript(book, chapters)) });
      files.push({ name: "listing.txt", bytes: new TextEncoder().encode(audiobookListing(book, chapters, audiobookStats(chapters))) });
      const zip = createZipBlob(files, new Date());
      downloadBlob(zip, `${book.id}-audiobook.zip`);
      $("ab-status").textContent = `Done — ${files.length - 3} chapter MP3s + cover + manuscript + listing, zipped and downloaded.`;
    }
  } catch (e) {
    $("ab-status").textContent = "Voice error after " + files.length + " chapters: " + (e && e.message ? e.message : e) + " (Your credits may be exhausted — try one book at a time.)";
  } finally {
    abBusy = false; $("ab-sample").disabled = false; $("ab-run").disabled = false; $("ab-cancel").style.display = "none";
  }
}

/* ================================================================== */
/*  Tabs + boot                                                        */
/* ================================================================== */
function initTabs() {
  const panels = { daily: "tab-daily", read: "tab-read", studio: "tab-studio", schedule: "tab-schedule", audiobooks: "tab-audiobooks", cards: "tab-cards" };
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.onclick = () => {
      document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      const name = tab.dataset.tab;
      Object.entries(panels).forEach(([key, id]) => $(id).classList.toggle("hidden", key !== name));
      if (name === "cards" && typeof renderEcardPreview === "function") renderEcardPreview();
    };
  });
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  window.addEventListener("load", () => {
    // initAutoUpdate registers the worker AND watches for new deploys, so the
    // studio picks up new features without a manual hard-refresh.
    if (typeof initAutoUpdate === "function") initAutoUpdate("sw.js");
    else navigator.serviceWorker.register("sw.js").catch(() => {});
  });
}

function init() {
  initTabs();
  initDaily();
  initStudio();
  initSchedule();
  initHub();
  initVoiceOver();
  initAudiobooks();
  initExplainer();
  initCards();
  registerServiceWorker();
}
document.addEventListener("DOMContentLoaded", init);
