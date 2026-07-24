// video.js
// Animated verse video with ORIGINAL, browser-synthesized ambient music.
// Nothing is bundled or downloaded — the visuals are drawn with canvas and the
// music is generated with the Web Audio API, so the output is royalty-free by
// construction. Exported as .webm via MediaRecorder.
//
// Depends on globals from app.js/backgrounds.js/verses.js:
//   fitText, hexToRgba, drawBackground, THEME_PALETTES

/* ------------------------------------------------------------------ */
/*  Music synthesis                                                    */
/* ------------------------------------------------------------------ */
const THEME_BASE = {   // root frequency (Hz) per theme mood
  warm: 130.81, calm: 110.0, bold: 146.83, hope: 164.81,
  royal: 98.0, night: 87.31, gold: 123.47, forest: 116.54,
};
const MINOR_THEMES = new Set(["calm", "night", "royal", "forest"]);

function buildAmbientMusic(ac, dest, theme, dur) {
  const now = ac.currentTime;
  const master = ac.createGain();
  master.gain.setValueAtTime(0.0001, now);
  master.gain.linearRampToValueAtTime(0.5, now + 2);
  master.gain.setValueAtTime(0.5, now + Math.max(2.1, dur - 2));
  master.gain.linearRampToValueAtTime(0.0001, now + dur);
  master.connect(dest);

  const lp = ac.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 1700;
  lp.connect(master);

  const base = THEME_BASE[theme] || 110;
  const chord = MINOR_THEMES.has(theme) ? [0, 3, 7, 12] : [0, 4, 7, 12];

  // Sustained pad
  chord.forEach((semi, i) => {
    const osc = ac.createOscillator();
    osc.type = i === 0 ? "sine" : "triangle";
    osc.frequency.value = base * Math.pow(2, semi / 12);
    const g = ac.createGain();
    g.gain.value = i === 0 ? 0.26 : 0.13;
    osc.connect(g); g.connect(lp);
    // slow detune shimmer
    const lfo = ac.createOscillator();
    lfo.frequency.value = 0.07 + 0.02 * i;
    const lg = ac.createGain(); lg.gain.value = 1.6;
    lfo.connect(lg); lg.connect(osc.detune);
    lfo.start(now); lfo.stop(now + dur + 0.2);
    osc.start(now); osc.stop(now + dur + 0.2);
  });

  // Gentle bell arpeggio one octave up
  const bells = chord.map((s) => base * 2 * Math.pow(2, s / 12));
  let t = now + 1.2, k = 0;
  while (t < now + dur - 0.6) {
    const o = ac.createOscillator();
    o.type = "sine";
    o.frequency.value = bells[k % bells.length];
    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.11, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0008, t + 1.5);
    o.connect(g); g.connect(lp);
    o.start(t); o.stop(t + 1.6);
    t += 1.7; k++;
  }
}

/* ------------------------------------------------------------------ */
/*  Frame rendering                                                    */
/* ------------------------------------------------------------------ */
function easeInOut(p) { return p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2; }
function clamp01(x) { return Math.max(0, Math.min(1, x)); }

const EV_VIDEO_FONTS = (typeof EV_FONTS !== "undefined") ? EV_FONTS : { serif: 'Georgia, "Times New Roman", serif', sans: '"Helvetica Neue", "Segoe UI", Arial, sans-serif' };

function drawGrainOverlay(ctx, W, H, grainPat, amount) {
  if (!grainPat) return;
  ctx.save();
  ctx.globalAlpha = amount == null ? 0.07 : amount;
  ctx.globalCompositeOperation = "overlay";
  ctx.fillStyle = grainPat;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

function drawVideoFrame(ctx, W, H, bg, fit, pal, opts, p, grainPat) {
  const minDim = Math.min(W, H);
  // Ken-Burns background: slow zoom + vertical drift, always covering the frame
  const scale = 1.0 + 0.14 * easeInOut(p);
  const drawW = W * scale, drawH = H * scale;
  const dx = -(drawW - W) / 2;
  const dy = -(drawH - H) / 2 + (drawH - H) * 0.2 * (p - 0.5);
  ctx.drawImage(bg, 0, 0, bg.width, bg.height, dx, dy, drawW, drawH);

  // Adaptive vignette (soft for light palettes)
  const vig = ctx.createRadialGradient(W / 2, H * 0.46, minDim * 0.2, W / 2, H * 0.5, Math.max(W, H) * 0.78);
  if (pal.light) { vig.addColorStop(0, "rgba(255,255,255,0.10)"); vig.addColorStop(1, "rgba(120,90,50,0.16)"); }
  else { vig.addColorStop(0, "rgba(0,0,0,0)"); vig.addColorStop(1, "rgba(0,0,0,0.34)"); }
  ctx.fillStyle = vig; ctx.fillRect(0, 0, W, H);

  // Film grain (screen-space, static — the signature texture)
  drawGrainOverlay(ctx, W, H, grainPat, 0.07);

  const textAlpha = clamp01(p / 0.12);
  const refAlpha = clamp01((p - 0.06) / 0.12);
  const floatY = Math.sin(p * Math.PI * 2) * (minDim * 0.006);
  const family = EV_VIDEO_FONTS[opts.font] || EV_VIDEO_FONTS.serif;

  if (opts.layout === "editorial") {
    const padL = W * 0.11;
    ctx.direction = "ltr"; ctx.textAlign = "left";
    // Kicker
    ctx.globalAlpha = textAlpha; ctx.textBaseline = "alphabetic";
    ctx.font = `700 ${minDim * 0.026}px ${EV_VIDEO_FONTS.sans}`;
    try { ctx.letterSpacing = (minDim * 0.012) + "px"; } catch (e) {}
    ctx.fillStyle = hexToRgba(pal.accent, 0.95);
    ctx.fillText((opts.kicker || "EVERVERSE").toUpperCase(), padL, H * 0.135);
    try { ctx.letterSpacing = "0px"; } catch (e) {}
    ctx.strokeStyle = hexToRgba(pal.accent, 0.6); ctx.lineWidth = Math.max(1.5, W * 0.0022);
    ctx.beginPath(); ctx.moveTo(padL, H * 0.16); ctx.lineTo(padL + minDim * 0.14, H * 0.16); ctx.stroke();
    // Body (left-aligned)
    ctx.textBaseline = "middle";
    ctx.font = `600 ${fit.size}px ${family}`;
    ctx.fillStyle = pal.text;
    if (!pal.light) { ctx.shadowColor = "rgba(0,0,0,0.32)"; ctx.shadowBlur = fit.size * 0.12; ctx.shadowOffsetY = fit.size * 0.03; }
    let y = H * 0.44 - (fit.lines.length * fit.lineHeight) / 2 + fit.lineHeight / 2 + floatY;
    for (const line of fit.lines) { ctx.fillText(line, padL, y); y += fit.lineHeight; }
    ctx.shadowColor = "transparent"; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
    if (opts.showRef !== false && opts.ref) {
      ctx.globalAlpha = refAlpha; ctx.textBaseline = "alphabetic";
      ctx.font = `italic 600 ${minDim * 0.03}px ${family}`;
      ctx.fillStyle = hexToRgba(pal.accent, 0.95);
      ctx.fillText("— " + opts.ref, padL, H * 0.82);
    }
    ctx.globalAlpha = 1;
  } else {
    ctx.direction = opts.rtl ? "rtl" : "ltr";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.font = `600 ${fit.size}px ${family}`;
    ctx.globalAlpha = textAlpha; ctx.fillStyle = pal.text;
    if (!pal.light) { ctx.shadowColor = "rgba(0,0,0,0.45)"; ctx.shadowBlur = fit.size * 0.14; ctx.shadowOffsetY = fit.size * 0.04; }
    let y = H * 0.44 - (fit.lines.length * fit.lineHeight) / 2 + fit.lineHeight / 2 + floatY;
    for (const line of fit.lines) { ctx.fillText(line, W / 2, y); y += fit.lineHeight; }
    ctx.shadowColor = "transparent"; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
    const divY = y + fit.lineHeight * 0.05;
    ctx.globalAlpha = refAlpha;
    ctx.strokeStyle = hexToRgba(pal.accent, 0.75); ctx.lineWidth = Math.max(1.5, W * 0.002);
    ctx.beginPath(); ctx.moveTo(W / 2 - minDim * 0.06, divY); ctx.lineTo(W / 2 + minDim * 0.06, divY); ctx.stroke();
    if (opts.showRef !== false && opts.ref) {
      ctx.direction = "ltr"; ctx.font = `italic 600 ${minDim * 0.032}px ${family}`;
      ctx.fillStyle = pal.accent; ctx.fillText("— " + opts.ref, W / 2, divY + minDim * 0.05);
    }
    ctx.globalAlpha = 1;
  }

  if (opts.watermark) {
    if (typeof drawWatermark === "function") drawWatermark(ctx, W, H, pal, opts.layout === "editorial" ? "bottom-right" : "center");
    else { ctx.direction = "ltr"; ctx.textAlign = "center"; ctx.font = `600 ${minDim * 0.022}px "Segoe UI", sans-serif`; ctx.fillStyle = hexToRgba(pal.text, 0.72); ctx.textBaseline = "bottom"; ctx.fillText("✦ EVERVERSE", W / 2, H - H * 0.04); ctx.textBaseline = "middle"; }
  }
}

/* ------------------------------------------------------------------ */
/*  Public: generate a webm blob                                       */
/* ------------------------------------------------------------------ */
function pickVideoMime() {
  // Prefer MP4/H.264 (accepted by TikTok/Instagram/Facebook); fall back to WebM.
  const candidates = [
    "video/mp4;codecs=avc1.42E01E,mp4a.40.2",
    "video/mp4;codecs=avc1.640028,mp4a.40.2",
    "video/mp4;codecs=avc1",
    "video/mp4",
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm;codecs=vp8",
    "video/webm",
  ];
  if (typeof MediaRecorder === "undefined") return null;
  return candidates.find((c) => MediaRecorder.isTypeSupported(c)) || null;
}
function mimeContainer(mime) { return mime && mime.indexOf("mp4") !== -1 ? "video/mp4" : "video/webm"; }
function videoFileExt(blob) { return blob && blob.type && blob.type.indexOf("mp4") !== -1 ? "mp4" : "webm"; }

function videoSupported() {
  return typeof MediaRecorder !== "undefined" &&
    !!HTMLCanvasElement.prototype.captureStream &&
    !!pickVideoMime();
}

/* ================================================================== */
/*  Voice-over video (real TTS narration + synced captions)            */
/* ================================================================== */
// Fetch spoken audio (mp3 ArrayBuffer) from the ElevenLabs proxy.
async function fetchTTS(text, opts) {
  if (typeof TTS_READY === "undefined" || !TTS_READY) throw new Error("Voice-over isn't set up yet — add your Worker URL in tts-config.js.");
  const headers = { "Content-Type": "application/json" };
  const tok = (typeof getTtsToken === "function") ? getTtsToken() : "";
  if (tok) headers["x-ev-token"] = tok;
  const res = await fetch(TTS_PROXY_URL, {
    method: "POST", headers,
    body: JSON.stringify({ text, voiceId: opts.voiceId || (typeof TTS_VOICES !== "undefined" ? TTS_VOICES.female : undefined), modelId: "eleven_multilingual_v2" }),
  });
  if (res.status === 401) throw new Error("Voice-over access token is missing or wrong.");
  if (!res.ok) throw new Error("Voice service error (" + res.status + ").");
  return await res.arrayBuffer();
}

// Split narration into caption "pages" (~14 words each, on sentence boundaries).
function buildCaptionPages(text) {
  const sentences = (text || "").replace(/\s+/g, " ").trim().match(/[^.!?]+[.!?]*/g) || [text];
  const pages = [];
  let cur = "";
  for (const s of sentences) {
    const test = (cur ? cur + " " : "") + s.trim();
    if (test.split(" ").length > 14 && cur) { pages.push(cur.trim()); cur = s.trim(); }
    else cur = test;
  }
  if (cur.trim()) pages.push(cur.trim());
  return pages.length ? pages : [text];
}

function drawVoiceOverFrame(ctx, W, H, bg, pal, opts, p, caption, grainPat, emph) {
  const minDim = Math.min(W, H);
  const scale = 1.0 + 0.1 * easeInOut(p);
  const drawW = W * scale, drawH = H * scale;
  ctx.drawImage(bg, 0, 0, bg.width, bg.height, -(drawW - W) / 2, -(drawH - H) / 2 + (drawH - H) * 0.15 * (p - 0.5), drawW, drawH);
  const vig = ctx.createRadialGradient(W / 2, H * 0.46, minDim * 0.2, W / 2, H * 0.5, Math.max(W, H) * 0.78);
  if (pal.light) { vig.addColorStop(0, "rgba(255,255,255,0.10)"); vig.addColorStop(1, "rgba(120,90,50,0.20)"); }
  else { vig.addColorStop(0, "rgba(0,0,0,0)"); vig.addColorStop(1, "rgba(0,0,0,0.42)"); }
  ctx.fillStyle = vig; ctx.fillRect(0, 0, W, H);
  drawGrainOverlay(ctx, W, H, grainPat, 0.07);

  ctx.direction = opts.rtl ? "rtl" : "ltr";
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  // The opening line (the hook) is rendered larger and heavier so it grabs the
  // eye in the first second — the moment that decides whether they keep watching.
  const weight = emph ? "700" : "600";
  const startSize = minDim * (emph ? 0.082 : 0.066);
  // Honor the chosen typeface (serif/sans) when EV_FONTS is available.
  const family = (typeof EV_FONTS !== "undefined" && opts.font && EV_FONTS[opts.font]) ? EV_FONTS[opts.font] : 'Georgia, "Times New Roman", serif';
  const fit = fitText(ctx, caption || "", W - W * 0.12 * 2, H * (emph ? 0.56 : 0.5), family, startSize, weight);
  ctx.font = `${weight} ${fit.size}px ${family}`;
  // Emphasise the hook with size + weight only — keep the high-contrast main
  // text colour so it stays legible on light and dark backgrounds alike.
  ctx.fillStyle = pal.text;
  ctx.shadowColor = "rgba(0,0,0,0.5)"; ctx.shadowBlur = fit.size * 0.16; ctx.shadowOffsetY = fit.size * 0.04;
  let y = H * 0.46 - (fit.lines.length * fit.lineHeight) / 2 + fit.lineHeight / 2;
  for (const line of fit.lines) { ctx.fillText(line, W / 2, y); y += fit.lineHeight; }
  ctx.shadowColor = "transparent"; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;

  if (opts.ref) {
    ctx.direction = "ltr";
    ctx.font = `italic 600 ${minDim * 0.03}px Georgia, serif`;
    ctx.fillStyle = pal.accent;
    ctx.fillText("— " + opts.ref, W / 2, H * 0.86);
  }
  // progress bar
  ctx.fillStyle = hexToRgba(pal.accent, 0.9);
  ctx.fillRect(0, H - 8, W * p, 8);
  if (opts.watermark) {
    if (typeof drawWatermark === "function") drawWatermark(ctx, W, H, pal, "center");
    else { ctx.direction = "ltr"; ctx.textAlign = "center"; ctx.font = `600 ${minDim * 0.022}px "Segoe UI", sans-serif`; ctx.fillStyle = hexToRgba(pal.text, 0.72); ctx.textBaseline = "bottom"; ctx.fillText("✦ EVERVERSE", W / 2, H - H * 0.045); ctx.textBaseline = "middle"; }
  }
}

// Core: given a decoded AudioBuffer + caption pages, record the captioned,
// voiced video. Exposed so the pipeline can be tested with any audio source.
async function renderVoiceOverVideoFromAudio(audioBuf, pages, opts) {
  if (!videoSupported()) throw new Error("This browser can't record video.");
  const W = opts.w || 720, H = opts.h || 1280;
  const audioCtx = opts._audioCtx;
  const dur = Math.max(1, audioBuf.duration);
  const pal = THEME_PALETTES[opts.paletteKey] || THEME_PALETTES.royal;
  const seed = (opts.ref || "vo").split("").reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 7);

  const canvas = document.createElement("canvas"); canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");
  const bg = document.createElement("canvas"); bg.width = Math.round(W * 1.25); bg.height = Math.round(H * 1.25);
  drawBackground(opts.bgKey || "aurora", bg.getContext("2d"), bg.width, bg.height, pal, seed >>> 0);
  const grainOn = (opts.grain != null) ? opts.grain : ((typeof EV_STYLE !== "undefined" && EV_STYLE.grain != null) ? EV_STYLE.grain : true);
  const grainPat = (grainOn && typeof makeGrainTile === "function") ? ctx.createPattern(makeGrainTile(seed), "repeat") : null;

  // Caption schedule proportional to page length.
  const totalChars = pages.reduce((a, s) => a + s.length, 0) || 1;
  let acc = 0;
  const sched = pages.map((s) => { const start = (acc / totalChars) * dur; acc += s.length; return { text: s, start, end: (acc / totalChars) * dur }; });

  const streamDest = audioCtx.createMediaStreamDestination();
  const src = audioCtx.createBufferSource(); src.buffer = audioBuf; src.connect(streamDest);

  // Optional subtle music bed UNDER the narration. buildAmbientMusic peaks at
  // 0.5, so route it through a low gain first — the voice must stay in front.
  if (opts.withMusic && typeof buildAmbientMusic === "function") {
    const bed = audioCtx.createGain();
    bed.gain.value = (opts.musicLevel != null) ? opts.musicLevel : 0.22;
    bed.connect(streamDest);
    try { buildAmbientMusic(audioCtx, bed, opts.theme || opts.paletteKey, dur); } catch (e) {}
  }

  const videoStream = canvas.captureStream(0);
  const vtrack = videoStream.getVideoTracks()[0];
  const stream = new MediaStream([vtrack, ...streamDest.stream.getAudioTracks()]);
  const mime = pickVideoMime();
  const rec = new MediaRecorder(stream, mime ? { mimeType: mime, videoBitsPerSecond: opts.videoBitsPerSecond || 6_000_000 } : undefined);
  const chunks = [];
  rec.ondataavailable = (e) => { if (e.data && e.data.size) chunks.push(e.data); };
  const finished = new Promise((res) => { rec.onstop = () => res(new Blob(chunks, { type: mimeContainer(mime) })); });

  rec.start();
  src.start();
  const start = performance.now(), interval = 1000 / 30;
  await new Promise((resolve) => {
    function tick() {
      const t = (performance.now() - start) / 1000, p = Math.min(1, t / dur);
      let cap = sched.length ? sched[sched.length - 1].text : "";
      for (const s of sched) { if (t >= s.start && t < s.end) { cap = s.text; break; } }
      if (t < (sched[0] ? sched[0].start : 0)) cap = sched[0] ? sched[0].text : "";
      // Emphasise the opening caption(s) — the hook lives in the first ~2.6s.
      const emph = opts.emphasizeHook !== false && t < (sched[1] ? Math.min(sched[1].start, 2.6) : 2.6);
      drawVoiceOverFrame(ctx, W, H, bg, pal, opts, p, cap, grainPat, emph);
      if (vtrack.requestFrame) vtrack.requestFrame();
      if (opts.onProgress) opts.onProgress(p);
      if (t >= dur + 0.2) { resolve(); return; }
      setTimeout(tick, interval);
    }
    tick();
  });
  try { src.stop(); } catch (e) {}
  rec.stop();
  stream.getTracks().forEach((tr) => tr.stop());
  return finished;
}

// Full pipeline: fetch TTS for the text, decode it, render the voiced video.
async function generateVoiceOverVideo(opts) {
  const mp3 = opts.audioArrayBuffer || await fetchTTS(opts.narrationText || opts.text, opts);
  const AC = window.AudioContext || window.webkitAudioContext;
  const audioCtx = new AC();
  if (audioCtx.state === "suspended") { try { await audioCtx.resume(); } catch (e) {} }
  const audioBuf = await audioCtx.decodeAudioData(mp3.slice(0));
  const pages = buildCaptionPages(opts.captionText || opts.narrationText || opts.text);
  opts._audioCtx = audioCtx;
  const blob = await renderVoiceOverVideoFromAudio(audioBuf, pages, opts);
  try { await audioCtx.close(); } catch (e) {}
  return blob;
}

// A short "sermon teaser" video — the takeaway line + source ref + music.
function generateSermonVideo(sermon, opts) {
  const base = (typeof VERSE_DB !== "undefined") ? VERSE_DB.find((v) => v.ref === sermon.verseRef) : null;
  return generateVerseVideo(Object.assign({
    text: sermon.takeaway,
    ref: sermon.verseRef,
    paletteKey: base ? base.theme : "royal",
    theme: base ? base.theme : "royal",
    bgKey: "aurora",
    kicker: "EVERVERSE · " + ((typeof faithLabel === "function" && sermon.faith) ? faithLabel(sermon.faith).toUpperCase() : "SERMON"),
    watermark: true, showRef: true,
    durationSec: 12, withMusic: true, w: 720, h: 1280,
  }, opts || {}));
}

// Animate a pre-rendered card: gentle Ken-Burns + fade in/out. Zoom stays
// modest and centred so edge elements (kicker, watermark) never clip.
function drawCardFrame(ctx, W, H, card, p) {
  ctx.fillStyle = "#000"; ctx.fillRect(0, 0, W, H);
  const scale = 1.0 + 0.035 * easeInOut(p);
  const drawW = W * scale, drawH = H * scale;
  const dx = -(drawW - W) / 2;
  const dy = -(drawH - H) / 2 + (drawH - H) * 0.14 * (p - 0.5);
  const fade = Math.min(clamp01(p / 0.06), clamp01((1 - p) / 0.05));
  ctx.globalAlpha = fade;
  ctx.drawImage(card, 0, 0, card.width, card.height, dx, dy, drawW, drawH);
  ctx.globalAlpha = 1;
}

async function generateVerseVideo(opts) {
  if (!videoSupported()) throw new Error("This browser can't record video (MediaRecorder/captureStream unavailable).");
  const W = opts.w || 720, H = opts.h || 1280;
  const dur = opts.durationSec || 12;
  const fps = 30;

  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");

  // Render the EXACT designed card once (full image renderer → honors every
  // layout, background, palette, grain, kicker, exactly like the preview),
  // then Ken-Burns animate it. This guarantees the video matches the image.
  const card = document.createElement("canvas");
  if (typeof renderVerse === "function") {
    renderVerse(card, W, H, Object.assign({
      text: opts.text, ref: opts.ref, rtl: opts.rtl,
      paletteKey: opts.paletteKey, bgKey: opts.bgKey,
      watermark: opts.watermark !== false, showRef: opts.showRef !== false,
    }, opts.layout ? { layout: opts.layout } : {}, opts.kicker ? { kicker: opts.kicker } : {}));
  } else {
    card.width = W; card.height = H;
  }

  // Audio graph (optional).
  let audioCtx = null, streamDest = null;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (opts.withMusic && AC) {
    audioCtx = new AC();
    if (audioCtx.state === "suspended") { try { await audioCtx.resume(); } catch (_) {} }
    streamDest = audioCtx.createMediaStreamDestination();
    buildAmbientMusic(audioCtx, streamDest, opts.theme, dur);
  }

  // Manual-frame capture (captureStream(0) + requestFrame) so recording is
  // driven by setTimeout, not requestAnimationFrame — this keeps working even
  // when the tab is backgrounded (rAF pauses on hidden tabs).
  const videoStream = canvas.captureStream(0);
  const vtrack = videoStream.getVideoTracks()[0];
  const allTracks = streamDest ? [vtrack, ...streamDest.stream.getAudioTracks()] : [vtrack];
  const stream = new MediaStream(allTracks);

  const mime = pickVideoMime();
  const rec = new MediaRecorder(stream, mime ? { mimeType: mime, videoBitsPerSecond: opts.videoBitsPerSecond || 6_000_000 } : undefined);
  const chunks = [];
  rec.ondataavailable = (e) => { if (e.data && e.data.size) chunks.push(e.data); };
  const finished = new Promise((res) => { rec.onstop = () => res(new Blob(chunks, { type: mimeContainer(mime) })); });

  rec.start();
  const interval = 1000 / fps;
  const start = performance.now();
  await new Promise((resolve) => {
    function tick() {
      const t = (performance.now() - start) / 1000;
      const p = Math.min(1, t / dur);
      drawCardFrame(ctx, W, H, card, p);
      if (vtrack.requestFrame) vtrack.requestFrame();
      else if (videoStream.requestFrame) videoStream.requestFrame();
      if (opts.onProgress) opts.onProgress(p);
      if (t >= dur) { resolve(); return; }
      setTimeout(tick, interval);
    }
    tick();
  });
  rec.stop();
  stream.getTracks().forEach((tr) => tr.stop());
  if (audioCtx) { try { await audioCtx.close(); } catch (_) {} }
  return finished;
}

// ── Audio-only export (Spotify) ──────────────────────────────────────
// Mix the MP3 narration with the optional ambient music bed offline and
// return a 16-bit PCM WAV (ArrayBuffer). No MP3 encoder library is bundled,
// so the mixed output is WAV; Spotify for Podcasters accepts WAV directly.
async function renderShortAudioWav(narrationArrayBuffer, opts) {
  opts = opts || {};
  const AC = window.AudioContext || window.webkitAudioContext;
  const tmp = new AC();
  const narr = await tmp.decodeAudioData(narrationArrayBuffer.slice(0));
  try { tmp.close(); } catch (e) {}
  const sr = narr.sampleRate || 44100;
  const tail = opts.withMusic ? 1.6 : 0.4;         // let the music fade after the voice
  const dur = narr.duration + tail;
  const OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
  const off = new OAC(2, Math.ceil(dur * sr), sr);

  const vgain = off.createGain(); vgain.gain.value = 0.95; vgain.connect(off.destination);
  const nsrc = off.createBufferSource(); nsrc.buffer = narr; nsrc.connect(vgain); nsrc.start(0);

  if (opts.withMusic && typeof buildAmbientMusic === "function") {
    const bed = off.createGain(); bed.gain.value = (opts.musicLevel != null) ? opts.musicLevel : 0.18;
    bed.connect(off.destination);
    try { buildAmbientMusic(off, bed, opts.theme, dur); } catch (e) {}
  }
  const mixed = await off.startRendering();
  return audioBufferToWav(mixed);
}

// 16-bit PCM WAV from an AudioBuffer.
function audioBufferToWav(buf) {
  const numCh = Math.min(2, buf.numberOfChannels || 1), sr = buf.sampleRate, n = buf.length;
  const blockAlign = numCh * 2, dataLen = n * blockAlign;
  const out = new ArrayBuffer(44 + dataLen);
  const dv = new DataView(out);
  const ws = (o, s) => { for (let i = 0; i < s.length; i++) dv.setUint8(o + i, s.charCodeAt(i)); };
  ws(0, "RIFF"); dv.setUint32(4, 36 + dataLen, true); ws(8, "WAVE");
  ws(12, "fmt "); dv.setUint32(16, 16, true); dv.setUint16(20, 1, true); dv.setUint16(22, numCh, true);
  dv.setUint32(24, sr, true); dv.setUint32(28, sr * blockAlign, true); dv.setUint16(32, blockAlign, true); dv.setUint16(34, 16, true);
  ws(36, "data"); dv.setUint32(40, dataLen, true);
  const chans = [];
  for (let c = 0; c < numCh; c++) chans.push(buf.getChannelData(c));
  let o = 44;
  for (let i = 0; i < n; i++) {
    for (let c = 0; c < numCh; c++) {
      let s = Math.max(-1, Math.min(1, chans[c][i]));
      dv.setInt16(o, s < 0 ? s * 0x8000 : s * 0x7FFF, true); o += 2;
    }
  }
  return out;
}
