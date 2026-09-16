// devotion.js
// The Devotion tab: turns a PRAYER_DB entry into a narrated script, a voiced
// video (vertical for Shorts/TikTok, landscape for YouTube) and the listing
// copy to paste alongside it.
//
// Two lengths:
//   short — hook → intro → each line (sound, then meaning) → a short
//           reflection → close. Lands at 60–90s, which clears TikTok's
//           1-minute bar for Creator Rewards without dragging.
//   long  — the same, then the whole text once more spoken straight through
//           (the recitation people actually come back for), then the full
//           reflection. About 3 minutes — the YouTube watch-hours version.
//
// Depends on: PRAYER_DB / PRAYER_TRADITIONS (prayers.js), generateVoiceOverVideo,
// fetchTTS, videoFileExt, videoSupported (video.js), bgForVerseApp, downloadBlob,
// showMediaActions, showTextDownloadLink, isMobileDevice, withTimeout, $ (app.js),
// ttsVoiceFor (tts-config.js), faithLabel + THEME_PALETTES (verses.js).

// Narration runs slower than the 150 wpm the verse shorts assume: the voice
// pauses at every line end and slows on unfamiliar words, so 140 wpm is what
// actually comes back from the TTS for this material.
const DEVOTION_WPM = 140;
const DEVOTION_SHORT_MAX_WORDS = 215;   // ≈ 92s
const DEVOTION_SHORT_MIN_WORDS = 175;   // ≈ 75s — safely over TikTok's 1-minute bar
const DEVOTION_HANDLE = "@eververse2117";

// Closing lines — one is picked per prayer (by id) so two devotions never
// end identically.
const DEVOTION_CLOSES = [
  "Carry it with you today. This is EverVerse.",
  "Say it once more, slowly, before you go. EverVerse.",
  "May it stay with you. A new devotion every day, here on EverVerse.",
  "Let that be enough for today. EverVerse.",
  "Go gently. This has been EverVerse.",
];
function _devHash(s) { let h = 7; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) | 0; return Math.abs(h); }
function devotionClose(p) { return DEVOTION_CLOSES[_devHash(p.id) % DEVOTION_CLOSES.length]; }

// Does this script contain Devanagari / Gurmukhi / Hebrew / Arabic / CJK?
const DEV_DEVANAGARI = /[ऀ-ॿ]/;
function hasScript(s, re) { return re.test(s || ""); }

// Which version of a line the voice reads before the meaning.
//   • meaning-only entries (Islamic): nothing — the meaning is the narration.
//   • English originals: the line itself.
//   • Hindi voice + Devanagari original: the Devanagari (the multilingual
//     model reads it natively; romanised Sanskrit through an English voice
//     comes out mangled).
//   • otherwise the transliteration.
function devotionSpokenLine(p, line, narrLang) {
  if (p.narrate === "meaning") return "";
  if (!line.t) return line.o;
  if (narrLang === "hi" && hasScript(line.o, DEV_DEVANAGARI)) return line.o;
  return line.t;
}

// Make sure a spoken part ends in terminal punctuation so the caption pager
// (which splits on sentence ends) and the voice (which pauses on them) agree.
function _endStop(s) {
  s = String(s || "").trim();
  if (!s) return "";
  // A line that hands over to the next (ends in a dash, comma, colon) stays
  // open — the caption and the voice both carry on.
  return /[.!?।॥،؟…—–,;:]$/.test(s) ? s : s + ".";
}
function _firstSentences(text, n) {
  const sents = String(text || "").match(/[^.!?]+[.!?]+/g) || [text];
  return sents.slice(0, n).join(" ").trim();
}
function _wordCount(s) { return String(s || "").split(/\s+/).filter(Boolean).length; }

// Build the narration. Returns { script, parts, words, seconds, chars }.
function devotionScript(p, opts) {
  opts = opts || {};
  const long = opts.length === "long";
  const narrLang = opts.lang || "en";
  const trad = prayerTradition(p);

  // `parts` is what the voice says; `shown` is what the screen shows for each
  // part — the original script (Devanagari, Arabic, Hebrew, Gurmukhi…) with the
  // transliteration or meaning beneath it, instead of romanised text alone.
  // A part's page is null when the spoken text itself is what to show.
  const parts = [], shown = [];
  const say = (text, page) => { parts.push(text); shown.push(page || null); };
  const rtlOf = (t) => /[\u0590-\u05FF\u0600-\u06FF]/.test(t || "");
  const linePage = (l, spoken) => {
    if (!l.t) return null;                                    // English original: show what is said
    const meaningOnly = p.narrate === "meaning";
    return { text: l.o, sub: meaningOnly ? l.m : (spoken === l.o ? l.t : l.t), weight: spoken.length, rtl: rtlOf(l.o), subRtl: false, big: true };
  };
  say(_endStop(p.hook));
  say(_endStop(p.intro));

  // Line by line: the sound, then what it means.
  p.lines.forEach((l) => {
    const spoken = devotionSpokenLine(p, l, narrLang);
    if (spoken) say(_endStop(spoken), linePage(l, spoken));
    if (l.m) {
      // Meaning-only entries already showed the meaning under the script; keep
      // the script up while it is spoken so the Arabic stays on screen.
      if (p.narrate === "meaning" && l.t) say(_endStop(l.m), { text: l.o, sub: l.m, weight: l.m.length, rtl: rtlOf(l.o), subRtl: false, big: true });
      else say(_endStop(l.m));
    }
  });

  // The recitation: the whole text once more, uninterrupted. Always in the
  // long cut; in the short cut only when a brief text (a two-line chant)
  // would otherwise land under the 60s mark TikTok's rewards programme needs.
  const recite = () => {
    say(p.narrate === "meaning"
      ? "Once more — the meaning of the whole prayer, straight through."
      : "Now the whole of it, once more, without interruption.");
    p.lines.forEach((l) => {
      const spoken = p.narrate === "meaning" ? l.m : devotionSpokenLine(p, l, narrLang);
      if (spoken) say(_endStop(spoken), l.t ? { text: l.o, sub: p.narrate === "meaning" ? l.m : l.t, weight: spoken.length, rtl: rtlOf(l.o), subRtl: false, big: true } : null);
    });
  };
  const soFar = () => _wordCount(parts.join(" "));
  let padded = false;
  // In the short cut the reflection's last sentence — the thing to do today —
  // always survives; the middle of the reflection is what gets trimmed.
  const sents = (p.reflection.match(/[^.!?]+[.!?]+/g) || [p.reflection]).map((x) => x.trim());
  const action = sents.length > 1 ? sents[sents.length - 1] : "";
  const reflShort = sents.length > 2 ? sents.slice(0, 2).join(" ") + " " + action : p.reflection;
  if (long) {
    recite();
    say(_endStop(p.reflection));
  } else {
    if (soFar() + _wordCount(reflShort) >= DEVOTION_SHORT_MIN_WORDS) {
      say(_endStop(reflShort));
    } else if (soFar() + _wordCount(p.reflection) >= DEVOTION_SHORT_MIN_WORDS - 25) {
      // A little short: the full reflection gets it close enough (the render
      // holds the last frame to 63s anyway), and it beats repeating the text.
      padded = true;
      say(_endStop(p.reflection));
    } else {
      // Brief text (a two-line chant): add the recitation, then as much
      // reflection as fits.
      padded = true;
      recite();
      const fullFits = soFar() + _wordCount(p.reflection) <= DEVOTION_SHORT_MAX_WORDS;
      say(_endStop(fullFits ? p.reflection : reflShort));
    }
  }
  say(p.close || devotionClose(p));

  // Short version (unpadded): if it overran, trim the reflection to its first
  // sentence plus the action, then drop lines from the middle.
  let out = parts.slice(), outShown = shown.slice();
  if (!long && !padded) {
    const count = () => _wordCount(out.join(" "));
    if (count() > DEVOTION_SHORT_MAX_WORDS) out[out.length - 2] = _endStop((sents[0] + " " + action).trim());
    while (count() > DEVOTION_SHORT_MAX_WORDS && out.length > 6) {
      const i = 2 + Math.floor((out.length - 4) / 2);   // from the middle of the lines; hook/intro/reflection/close stay
      out.splice(i, 1); outShown.splice(i, 1);
    }
  }

  // Caption pages: a spoken part with no special page is split the usual way
  // (~14 words a page); a part with a page shows that page for its whole length.
  const pages = [];
  out.forEach((part, i) => {
    if (outShown[i]) pages.push(outShown[i]);
    else buildCaptionPages(part).forEach((t) => pages.push({ text: t, weight: t.length }));
  });

  const script = out.join(" ").replace(/\s+/g, " ").trim();
  const words = _wordCount(script);
  return { script, parts: out, pages, words, seconds: Math.round((words / DEVOTION_WPM) * 60), chars: script.length };
}

/* ---------------------------------------------------------------- */
/*  Listing copy                                                     */
/* ---------------------------------------------------------------- */
function _devTag(s) { return String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, ""); }

// Title ≤ 100 chars (YouTube's cap), description, comma tags, and a shorter
// TikTok caption. Titles lead with the title + "with meaning" — that phrase is
// what people actually type into search for this kind of content.
function devotionListing(p, secs, opts) {
  opts = opts || {};
  const trad = prayerTradition(p);
  const kind = prayerKindLabel(p);
  const topicTags = (typeof SHORT_TAGS_BY_TOPIC !== "undefined" && SHORT_TAGS_BY_TOPIC[p.topic]) ? SHORT_TAGS_BY_TOPIC[p.topic] : ["faith", "blessed"];
  const titleTags = [...new Set([_devTag(p.title.split(/ [—–] /)[0]), _devTag(kind), trad.tags[0], "eververse"].filter(Boolean))].slice(0, 4);
  const tagStr = titleTags.map((t) => "#" + t).join(" ");
  const meaning = p.narrate === "meaning" ? "with meaning" : "lyrics & meaning";
  let head = `${p.title} | ${meaning}`;
  const room = 100 - 2 - trad.emoji.length - 1 - tagStr.length;
  if (head.length > room) head = head.slice(0, Math.max(20, room)).replace(/\s+\S*$/, "");
  const title = `${head} ${trad.emoji} ${tagStr}`.slice(0, 100).trim();

  const body = p.lines.map((l) => (l.t && l.t !== l.o) ? `${l.o}\n${l.t}\n${l.m}` : `${l.o}\n${l.m}`).join("\n\n");
  const descTags = [...new Set([...titleTags, ...trad.tags, ...topicTags, "dailyprayer", "withmeaning", "devotional", "spirituality"])].slice(0, 15);
  const description =
    `${p.hook}\n\n` +
    `${p.title}${p.native ? " · " + p.native : ""} — ${kind}, ${trad.label} tradition.\n\n` +
    `${body}\n\n` +
    `${p.reflection}\n\n` +
    `Source: ${p.source}\n\n` +
    `A new devotion every day — follow ${DEVOTION_HANDLE} and visit eververse.org\n\n` +
    descTags.map((t) => "#" + t).join(" ");
  const tiktok = `${p.hook}\n\n${p.title} — ${kind}, ${trad.label} tradition. ${meaning}, line by line.\n\nFollow ${DEVOTION_HANDLE} for a devotion every day.\n\n${descTags.slice(0, 8).map((t) => "#" + t).join(" ")}`;
  return { title, description, tags: descTags.join(", "), tiktok, seconds: secs };
}

/* ---------------------------------------------------------------- */
/*  Studio panel                                                     */
/* ---------------------------------------------------------------- */
let devBusy = false;

function devCurrent() {
  const id = $("dev-pick") ? $("dev-pick").value : "";
  return prayerById(id) || PRAYER_DB[0];
}
function devOpts() {
  return {
    length: $("dev-length") ? $("dev-length").value : "short",
    lang: $("dev-lang") ? $("dev-lang").value : "en",
  };
}
function devVoiceId() {
  const gender = $("dev-voice") ? $("dev-voice").value : "female";
  const lang = devOpts().lang;
  if (typeof ttsVoiceFor === "function") return ttsVoiceFor(lang, gender);
  return (typeof TTS_VOICES !== "undefined") ? TTS_VOICES[gender] : undefined;
}
function devFilename(p, suffix) {
  const d = new Date();
  const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  return `${ds}_devotion_${p.id}_${suffix}`;
}

function devFillPicker() {
  const tradSel = $("dev-tradition"), pick = $("dev-pick");
  if (!tradSel || !pick) return;
  const t = tradSel.value;
  const keep = pick.value;
  pick.innerHTML = "";
  prayersFor(t).forEach((p) => pick.add(new Option(`${prayerKindLabel(p)} · ${p.title}`, p.id)));
  if (keep && prayerById(keep) && prayerById(keep).tradition === t) pick.value = keep;
}

function devRender() {
  const p = devCurrent(); if (!p) return;
  const trad = prayerTradition(p);
  const o = devOpts();
  const r = devotionScript(p, o);

  $("dev-title").textContent = `${trad.emoji} ${p.title}`;
  $("dev-native").textContent = p.native || "";
  $("dev-meta").textContent = `${prayerKindLabel(p)} · ${trad.label} · ${p.occasion}${p.excerpt ? " · excerpt" : ""}`;
  $("dev-source").textContent = p.source;

  const respect = $("dev-respect");
  if (p.narrate === "meaning") {
    respect.textContent = "🤲 Meaning-only narration: the original is shown on screen and in the description; the voice never recites it. This is deliberate — keep it that way.";
    respect.style.display = "";
  } else respect.style.display = "none";

  const rows = p.lines.map((l) => {
    const rtl = /[֐-׿؀-ۿ]/.test(l.o);
    return `<div class="dev-line"><div class="dev-o"${rtl ? ' dir="rtl"' : ""}>${escapeHtml(l.o)}</div>` +
      (l.t && l.t !== l.o ? `<div class="dev-t">${escapeHtml(l.t)}</div>` : "") +
      `<div class="dev-m">${escapeHtml(l.m || "")}</div></div>`;
  }).join("");
  $("dev-lines").innerHTML = rows;
  $("dev-reflection").textContent = p.reflection;

  const hindiOk = p.lines.some((l) => hasScript(l.o, DEV_DEVANAGARI));
  const langSel = $("dev-lang");
  if (langSel) {
    langSel.querySelector('option[value="hi"]').disabled = !hindiOk;
    if (!hindiOk && langSel.value === "hi") langSel.value = "en";
  }

  const est = $("dev-est");
  const mins = Math.floor(r.seconds / 60), secs = r.seconds % 60;
  est.textContent = `${r.words} words ≈ ${mins ? mins + "m " : ""}${secs}s · ${r.chars.toLocaleString()} voice characters`;
  $("dev-script").value = r.script;
}

function escapeHtml(s) { return String(s || "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }

async function runDevotionVideo() {
  if (devBusy) return;
  const status = $("dev-status");
  if (typeof videoSupported === "function" && !videoSupported()) { status.textContent = "⚠ This browser can't record video. Try Chrome/Edge."; return; }
  if (typeof TTS_READY === "undefined" || !TTS_READY) { status.textContent = "Connect your EverVerse voice (tts-config.js) first."; return; }
  devBusy = true; $("dev-video").disabled = true; $("dev-audio").disabled = true;
  try {
    const p = devCurrent();
    const o = devOpts();
    const r = devotionScript(p, o);
    const trad = prayerTradition(p);
    const mobile = isMobileDevice();
    const landscape = $("dev-format").value === "landscape";
    const dims = landscape ? (mobile ? { w: 1280, h: 720 } : { w: 1920, h: 1080 }) : (mobile ? { w: 720, h: 1280 } : { w: 1080, h: 1920 });
    status.textContent = mobile
      ? "Narrating + rendering (records in real time — keep the screen ON)…"
      : `Narrating + rendering — about ${Math.ceil(r.seconds / 60)} minute(s), leave the tab open…`;
    const font = (typeof EV_STYLE !== "undefined") ? EV_STYLE.font : undefined;
    const grain = (typeof EV_STYLE !== "undefined") ? EV_STYLE.grain : undefined;
    const rtl = o.lang !== "en" && /[֐-׿؀-ۿ]/.test(r.script);
    const blob = await withTimeout(generateVoiceOverVideo({
      narrationText: r.script, captionText: r.script, captionPages: r.pages, rtl,
      ref: `${p.title} · ${trad.label}`,
      paletteKey: p.theme, theme: p.theme,
      bgKey: bgForVerseApp({ ref: p.id }), font, grain,
      voiceId: devVoiceId(),
      watermark: true, withMusic: $("dev-music").checked, musicLevel: 0.18,
      minDurationSec: landscape ? 0 : 63,   // TikTok Creator Rewards: strictly over 1 minute
      videoBitsPerSecond: mobile ? 3_000_000 : 8_000_000,
      w: dims.w, h: dims.h,
      onProgress: (pr) => { status.textContent = `Rendering… ${Math.round(pr * 100)}%`; },
    }), (r.seconds + 90) * 1000, "Video render stalled on this device. Try the audio export here, and render the video on a desktop.");
    if (!blob || blob.size < 2000) throw new Error("The recorded video was empty — this browser may not support in-page video capture.");
    const ext = videoFileExt(blob);
    const name = devFilename(p, (landscape ? "wide" : "short")) + "." + ext;
    if (!mobile) downloadBlob(blob, name);
    showMediaActions("dev-actions", blob, name, { title: `${p.title} — EverVerse`, label: "video" });
    devShowListing(p, r.seconds, name);
    status.textContent = `✓ ${r.seconds}s devotion ready (${(blob.size / 1048576).toFixed(1)} MB) — listing text below.`;
  } catch (e) {
    status.textContent = "Error: " + (e && e.message ? e.message : e);
  } finally { devBusy = false; $("dev-video").disabled = false; $("dev-audio").disabled = false; }
}

async function runDevotionAudio() {
  if (devBusy) return;
  const status = $("dev-status");
  if (typeof TTS_READY === "undefined" || !TTS_READY) { status.textContent = "Connect your EverVerse voice (tts-config.js) first."; return; }
  devBusy = true; $("dev-video").disabled = true; $("dev-audio").disabled = true;
  try {
    const p = devCurrent();
    const r = devotionScript(p, devOpts());
    status.textContent = "Narrating…";
    const mp3 = await fetchTTS(r.script, { voiceId: devVoiceId() });
    const blob = new Blob([mp3], { type: "audio/mpeg" });
    const name = devFilename(p, "audio") + ".mp3";
    if (!isMobileDevice()) downloadBlob(blob, name);
    showMediaActions("dev-actions", blob, name, { title: `${p.title} — EverVerse`, label: "audio" });
    devShowListing(p, r.seconds, name);
    status.textContent = `✓ MP3 ready (~${r.seconds}s).`;
  } catch (e) {
    status.textContent = "Error: " + (e && e.message ? e.message : e);
  } finally { devBusy = false; $("dev-video").disabled = false; $("dev-audio").disabled = false; }
}

function devShowListing(p, secs, mediaName) {
  const L = devotionListing(p, secs);
  const text = `TITLE (YouTube)\n---------------\n${L.title}\n\nDESCRIPTION (YouTube)\n---------------------\n${L.description}\n\nTIKTOK CAPTION\n--------------\n${L.tiktok}\n\nTAGS\n----\n${L.tags}\n\nMedia: ${mediaName} · ~${secs}s\n`;
  showTextDownloadLink("dev-dl", mediaName.replace(/\.\w+$/, "") + "-listing.txt", text, "⬇ Listing text (YouTube title · description · TikTok caption · tags)");
}

function initDevotion() {
  if (!$("dev-tradition") || typeof PRAYER_DB === "undefined") return;
  const tradSel = $("dev-tradition");
  tradSel.innerHTML = "";
  prayerTraditionKeys().forEach((k) => {
    const t = PRAYER_TRADITIONS[k];
    tradSel.add(new Option(`${t.emoji} ${t.label} (${prayersFor(k).length})`, k));
  });
  // Open on today's devotion so the daily rhythm is one click.
  const today = prayerForDay(new Date());
  tradSel.value = today.tradition;
  devFillPicker();
  $("dev-pick").value = today.id;

  tradSel.onchange = () => { devFillPicker(); devRender(); };
  $("dev-pick").onchange = devRender;
  ["dev-length", "dev-lang", "dev-voice"].forEach((id) => { if ($(id)) $(id).onchange = devRender; });
  $("dev-today").onclick = () => { const t = prayerForDay(new Date()); tradSel.value = t.tradition; devFillPicker(); $("dev-pick").value = t.id; devRender(); };
  $("dev-video").onclick = runDevotionVideo;
  $("dev-audio").onclick = runDevotionAudio;
  $("dev-copy").onclick = () => { navigator.clipboard?.writeText($("dev-script").value); $("dev-status").textContent = "Script copied."; };
  $("dev-listing").onclick = () => { const p = devCurrent(); const r = devotionScript(p, devOpts()); devShowListing(p, r.seconds, devFilename(p, "video") + ".mp4"); $("dev-status").textContent = "Listing ready below."; };
  if ($("dev-token")) { $("dev-token").value = getTtsToken(); $("dev-token").oninput = () => setTtsToken($("dev-token").value); }
  devRender();
  initDevotionBatch();
}

/* ---------------------------------------------------------------- */
/*  Batch — a month of devotions in one sitting                      */
/* ---------------------------------------------------------------- */
// Renders one devotion per day for N days (short and/or long), saving each
// file as it finishes — straight into a folder you pick (Chrome/Edge), or as
// individual downloads elsewhere — plus a metadata.csv with the date, publish
// time, title, description, TikTok caption and tags for every file. That CSV
// is what the YouTube uploader reads, and what a bulk scheduler imports.
//
// Nothing is zipped: a month of 1080p video is gigabytes, far beyond what a
// tab can hold in memory. Streaming to disk is the only design that finishes.
let devBatchCancel = false;

function devBatchPlan() {
  const days = Number($("devb-days").value);
  const scope = $("devb-scope").value;
  const wantShort = $("devb-short").checked, wantLong = $("devb-long").checked;
  const time = $("devb-time").value || "07:00";
  const start = new Date(); start.setHours(0, 0, 0, 0);
  const items = [];
  const pool = scope === "all" ? null : prayersFor(scope);
  for (let d = 0; d < days; d++) {
    const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + d);
    const p = pool ? pool[d % pool.length] : prayerForDay(date);
    if (wantShort) items.push({ p, date, time, length: "short", landscape: false });
    if (wantLong) items.push({ p, date, time, length: "long", landscape: true });
  }
  return items;
}
function devBatchLang(p) {
  return ($("devb-hindi").checked && p.lines.some((l) => hasScript(l.o, DEV_DEVANAGARI))) ? "hi" : "en";
}
function devBatchEstimate() {
  if (!$("devb-est")) return;
  const items = devBatchPlan();
  let chars = 0, secs = 0;
  items.forEach((it) => { const r = devotionScript(it.p, { length: it.length, lang: devBatchLang(it.p) }); chars += r.chars; secs += Math.max(r.seconds, it.landscape ? 0 : 63); });
  const plan = Number($("devb-plan").value) || 0;
  const pct = plan ? Math.round((chars / plan) * 100) : 0;
  const renderMin = Math.ceil((secs + items.length * 12) / 60);   // + narration fetch/encode per item
  $("devb-est").textContent = items.length
    ? `${items.length} videos · ${chars.toLocaleString()} voice characters${plan ? ` (≈${pct}% of your ${plan.toLocaleString()}-character plan)` : ""} · about ${renderMin} min to render (real time — keep this tab visible)`
    : "Tick at least one length.";
}
function devPad(n) { return String(n).padStart(2, "0"); }
function devDateStr(d) { return `${d.getFullYear()}-${devPad(d.getMonth() + 1)}-${devPad(d.getDate())}`; }
function devPublishIso(date, time) {
  const [h, m] = time.split(":").map(Number);
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate(), h || 0, m || 0, 0);
  return d.toISOString();
}
function devCsvCell(v) { return `"${String(v == null ? "" : v).replace(/"/g, '""')}"`; }

const DEV_CSV_HEADER = ["date", "publish_at", "kind", "platforms", "file", "tradition", "prayer_id", "title", "description", "tiktok_caption", "tags", "length_sec", "status"];

// Where files go: a folder handle (File System Access API) or null → downloads.
async function devPickFolder() {
  if (!window.showDirectoryPicker) return null;
  try { return await window.showDirectoryPicker({ mode: "readwrite", startIn: "downloads" }); }
  catch (e) { return null; }   // cancelled → fall back to downloads
}
async function devSaveFile(dir, name, blob) {
  if (dir) {
    const fh = await dir.getFileHandle(name, { create: true });
    const w = await fh.createWritable(); await w.write(blob); await w.close();
  } else downloadBlob(blob, name);
}

async function runDevotionBatch() {
  if (devBusy) return;
  const status = $("devb-status");
  if (typeof videoSupported === "function" && !videoSupported()) { status.textContent = "⚠ This browser can't record video. Use Chrome or Edge on a desktop."; return; }
  if (typeof TTS_READY === "undefined" || !TTS_READY) { status.textContent = "Connect your EverVerse voice (tts-config.js) first."; return; }
  const items = devBatchPlan();
  if (!items.length) { status.textContent = "Tick at least one length."; return; }
  const dir = await devPickFolder();
  devBusy = true; devBatchCancel = false;
  $("devb-run").disabled = true; $("devb-cancel").style.display = "inline-block";
  const rows = [], mobile = isMobileDevice(), gender = $("dev-voice").value, music = $("dev-music").checked;
  const font = (typeof EV_STYLE !== "undefined") ? EV_STYLE.font : undefined;
  const grain = (typeof EV_STYLE !== "undefined") ? EV_STYLE.grain : undefined;
  const t0 = Date.now();
  for (let i = 0; i < items.length; i++) {
    if (devBatchCancel) break;
    const it = items[i], p = it.p, trad = prayerTradition(p);
    const lang = devBatchLang(p);
    const r = devotionScript(p, { length: it.length, lang });
    const dims = it.landscape ? { w: 1920, h: 1080 } : { w: 1080, h: 1920 };
    const base = `${devDateStr(it.date)}_${it.landscape ? "long" : "short"}_${p.id}`;
    const L = devotionListing(p, r.seconds);
    const row = { date: devDateStr(it.date), publish_at: devPublishIso(it.date, it.time), kind: it.landscape ? "long" : "short",
      platforms: it.landscape ? "youtube" : "youtube_shorts;tiktok", file: "", tradition: trad.label, prayer_id: p.id,
      title: L.title, description: L.description, tiktok_caption: L.tiktok, tags: L.tags, length_sec: r.seconds, status: "" };
    try {
      status.textContent = `${i + 1}/${items.length} — ${p.title} (${row.kind}) — narrating…`;
      const blob = await withTimeout(generateVoiceOverVideo({
        narrationText: r.script, captionText: r.script, captionPages: r.pages,
        ref: `${p.title} · ${trad.label}`, paletteKey: p.theme, theme: p.theme,
        bgKey: bgForVerseApp({ ref: p.id + it.length }), font, grain,
        voiceId: (typeof ttsVoiceFor === "function") ? ttsVoiceFor(lang, gender) : undefined,
        watermark: true, withMusic: music, musicLevel: 0.18,
        minDurationSec: it.landscape ? 0 : 63,
        videoBitsPerSecond: mobile ? 3_000_000 : 6_000_000,
        w: dims.w, h: dims.h,
        onProgress: (pr) => { status.textContent = `${i + 1}/${items.length} — ${p.title} (${row.kind}) — rendering ${Math.round(pr * 100)}%`; },
      }), (Math.max(r.seconds, 63) + 120) * 1000, "render stalled");
      if (!blob || blob.size < 2000) throw new Error("empty video");
      row.file = base + "." + videoFileExt(blob);
      await devSaveFile(dir, row.file, blob);
      row.status = "ok";
    } catch (e) {
      row.status = "failed: " + (e && e.message ? e.message : e);
    }
    rows.push(row);
    // The CSV is rewritten after every item so a crash mid-batch loses nothing.
    const csv = [DEV_CSV_HEADER.join(",")].concat(rows.map((x) => DEV_CSV_HEADER.map((k) => devCsvCell(x[k])).join(","))).join("\n");
    if (dir) { try { await devSaveFile(dir, "metadata.csv", new Blob([csv], { type: "text/csv" })); } catch (e) {} }
    else if (i === items.length - 1 || devBatchCancel) downloadBlob(new Blob([csv], { type: "text/csv" }), `devotions_${devDateStr(items[0].date)}_metadata.csv`);
  }
  const ok = rows.filter((x) => x.status === "ok").length, failed = rows.length - ok;
  const mins = Math.round((Date.now() - t0) / 60000);
  status.textContent = `${devBatchCancel ? "Stopped" : "✓ Done"} — ${ok} video${ok === 1 ? "" : "s"} saved${failed ? `, ${failed} failed (see metadata.csv)` : ""} in ${mins} min. ${dir ? "Everything is in the folder you chose." : "Check your downloads folder."}`;
  devBusy = false; $("devb-run").disabled = false; $("devb-cancel").style.display = "none";
}

function initDevotionBatch() {
  if (!$("devb-run")) return;
  const sc = $("devb-scope");
  sc.innerHTML = "";
  sc.add(new Option("Daily rotation — all traditions", "all"));
  prayerTraditionKeys().forEach((k) => sc.add(new Option(`Only ${PRAYER_TRADITIONS[k].label}`, k)));
  ["devb-days", "devb-scope", "devb-short", "devb-long", "devb-hindi", "devb-plan", "devb-time"].forEach((id) => { if ($(id)) $(id).onchange = devBatchEstimate; });
  $("devb-run").onclick = runDevotionBatch;
  $("devb-cancel").onclick = () => { devBatchCancel = true; };
  devBatchEstimate();
}
