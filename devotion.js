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

  const parts = [];
  parts.push(_endStop(p.hook));
  parts.push(_endStop(p.intro));

  // Line by line: the sound, then what it means.
  p.lines.forEach((l) => {
    const spoken = devotionSpokenLine(p, l, narrLang);
    if (spoken) parts.push(_endStop(spoken));
    if (l.m) parts.push(_endStop(l.m));
  });

  // The recitation: the whole text once more, uninterrupted. Always in the
  // long cut; in the short cut only when a brief text (a two-line chant)
  // would otherwise land under the 60s mark TikTok's rewards programme needs.
  const recite = () => {
    parts.push(p.narrate === "meaning"
      ? "Once more — the meaning of the whole prayer, straight through."
      : "Now the whole of it, once more, without interruption.");
    p.lines.forEach((l) => {
      const spoken = p.narrate === "meaning" ? l.m : devotionSpokenLine(p, l, narrLang);
      if (spoken) parts.push(_endStop(spoken));
    });
  };
  const soFar = () => _wordCount(parts.join(" "));
  let padded = false;
  if (long) {
    recite();
    parts.push(_endStop(p.reflection));
  } else {
    const refl2 = _firstSentences(p.reflection, 2);
    if (soFar() + _wordCount(refl2) >= DEVOTION_SHORT_MIN_WORDS) {
      parts.push(_endStop(refl2));
    } else if (soFar() + _wordCount(p.reflection) >= DEVOTION_SHORT_MIN_WORDS - 25) {
      // A little short: the full reflection gets it close enough (the render
      // holds the last frame to 63s anyway), and it beats repeating the text.
      padded = true;
      parts.push(_endStop(p.reflection));
    } else {
      // Brief text (a two-line chant): add the recitation, then as much
      // reflection as fits.
      padded = true;
      recite();
      const fullFits = soFar() + _wordCount(p.reflection) <= DEVOTION_SHORT_MAX_WORDS;
      parts.push(_endStop(fullFits ? p.reflection : refl2));
    }
  }
  parts.push(p.close || devotionClose(p));

  // Short version (unpadded): if it overran, trim reflection first, then middle lines.
  let out = parts.filter(Boolean);
  if (!long && !padded) {
    const count = () => _wordCount(out.join(" "));
    if (count() > DEVOTION_SHORT_MAX_WORDS) {
      const idx = out.length - 2;
      out[idx] = _endStop(_firstSentences(p.reflection, 1));
    }
    while (count() > DEVOTION_SHORT_MAX_WORDS && out.length > 6) {
      out.splice(2 + Math.floor((out.length - 4) / 2), 1);   // drop from the middle of the lines, keep hook/intro/reflection/close
    }
  }

  const script = out.join(" ").replace(/\s+/g, " ").trim();
  const words = _wordCount(script);
  return { script, parts: out, words, seconds: Math.round((words / DEVOTION_WPM) * 60), chars: script.length };
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
      narrationText: r.script, captionText: r.script, rtl,
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
}
