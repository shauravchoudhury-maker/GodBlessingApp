/* ------------------------------------------------------------------ */
/*  shortstyles.js — complete looks for the voiced vertical short       */
/* ------------------------------------------------------------------ */
// A short style is a whole recipe: palette, background, typeface and a
// caption treatment that follows the narration WORD BY WORD, the way the
// best-performing shorts are captioned. "classic" keeps the original
// page-by-page captions and the Daily tab's own palette and background.
//
// Everything sits inside the TikTok / Reels / Shorts safe zone on a vertical
// frame: clear of the top tabs, the right-hand button rail, and the bottom
// quarter where the username, caption and music ticker are overlaid.
//
// Loaded after render.js (EV_FONTS, hexToRgba, evReadableOn, evSetTracking)
// and video.js (easeInOut, clamp01, drawGrainOverlay, drawVoiceOverFrame).

const SHORT_STYLES = {
  classic: { name: "Classic", note: "Page-by-page captions in your Daily palette and background." },
  karaoke: { name: "Karaoke Gold", caption: "karaoke", palette: "noir", bg: "spotlight", font: "sans", weight: 800, hi: "#f5c542", grain: true,
    note: "Bold words that light up as they are spoken — the caption style that holds attention longest." },
  punch: { name: "Punch", caption: "punch", palette: "night", bg: "nebula", font: "sans", weight: 900, upper: true, hi: "#ffd84d", grain: true,
    note: "Two or three huge words at a time, popping in on the beat. Built for the hook." },
  reveal: { name: "Scripture Reveal", caption: "reveal", palette: "gold", bg: "goldenhour", font: "book", weight: 600, grain: true,
    note: "Each word rises into place as it is read. Quiet, reverent, unhurried." },
  cinema: { name: "Cinema", caption: "reveal", palette: "dusk", bg: "rays", font: "serif", weight: 500, upper: true, tracking: 0.07,
    letterbox: true, grain: true, grainAmt: 0.12, note: "Letterbox bars, heavy film grain and wide-tracked capitals — a trailer for the verse." },
  glow: { name: "Halo Glow", caption: "glow", palette: "night", bg: "starfield", font: "humanist", weight: 600, hi: "#9fd3ff", grain: false,
    note: "Soft light behind each spoken word on a deep night sky — made for evening prayers." },
  marker: { name: "Journal Marker", caption: "marker", palette: "sand", bg: "parchment", font: "slab", weight: 700, hi: "#ffd84d", grain: true,
    note: "Ink on paper with a highlighter swipe across each word — the study-notes look." },
  // Shorts pack (Nov 2026): six more looks, each with its own caption motion,
  // so a week of posts never repeats a look.
  slam: { name: "Word Slam", caption: "slam", palette: "onyx", bg: "sunburst", font: "display", weight: 400, upper: true, hi: "#e8b94a", grain: true,
    note: "One word at a time, slammed onto the screen; the long words land in gold. The fastest-paced look." },
  boxed: { name: "Caption Boxes", caption: "boxed", palette: "cobalt", bg: "orbs", font: "sans", weight: 800, box: "#ffffff", boxInk: "#111111", hi: "#2f5bff", grain: false,
    note: "A few words at a time on white caption slabs — the native TikTok caption look, readable on any feed." },
  type: { name: "Notes App", caption: "type", palette: "ivory", bg: "linen", font: "sans", weight: 600, hi: "#b2452c", grain: false,
    note: "The verse types itself into a clean note, cursor and all — the screenshot look people save and share." },
  outline: { name: "Outline Fill", caption: "outline", palette: "plum", bg: "duotone", font: "display", weight: 400, upper: true, hi: "#ffcf5a", grain: true,
    note: "Hollow outlined words that fill with colour as they are spoken. Bold without shouting." },
  underline: { name: "Editorial Underline", caption: "underline", palette: "rose", bg: "grainwash", font: "serif", weight: 500, hi: "#7d3b45", grain: true,
    note: "Quiet serif type on dusty rose, with an underline that follows the voice. Calm, premium, very saveable." },
  lyric: { name: "Lyric Scroll", caption: "lyric", palette: "olive", bg: "aurora", font: "humanist", weight: 700, hi: "#e3d9a0", grain: true,
    note: "Line by line like a lyrics screen — the line being read is bright, the rest drift past. Made for music-led reels." },
};
const SHORT_STYLE_ORDER = ["karaoke", "punch", "slam", "boxed", "type", "lyric", "outline", "underline", "reveal", "cinema", "glow", "marker", "classic"];

// "Rotate" in the picker: each short takes the next look in this order, so
// back-to-back posts never share a look. The position is kept per device.
const SHORT_STYLE_ROTATE_KEY = "ev_short_rotate";
function evNextRotatingStyle() {
  const pool = SHORT_STYLE_ORDER.filter((k) => k !== "classic");
  let n = 0;
  try { n = Number(localStorage.getItem(SHORT_STYLE_ROTATE_KEY) || 0) || 0; } catch (e) {}
  try { localStorage.setItem(SHORT_STYLE_ROTATE_KEY, String(n + 1)); } catch (e) {}
  return pool[n % pool.length];
}

function evEaseOutBack(x) { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); }

// Everything a short needs before its first frame: palette, pre-rendered
// background (25% oversize for the slow push-in), grain, and the style.
function evPrepareShort(opts, W, H, seed, ctx) {
  const st = (opts.shortStyle && SHORT_STYLES[opts.shortStyle] && SHORT_STYLES[opts.shortStyle].caption) ? SHORT_STYLES[opts.shortStyle] : null;
  const pal = THEME_PALETTES[st ? st.palette : opts.paletteKey] || THEME_PALETTES.royal;
  const bg = document.createElement("canvas"); bg.width = Math.round(W * 1.25); bg.height = Math.round(H * 1.25);
  drawBackground((st && st.bg) || opts.bgKey || "aurora", bg.getContext("2d"), bg.width, bg.height, pal, seed >>> 0);
  const grainOn = st ? st.grain : ((opts.grain != null) ? opts.grain : ((typeof EV_STYLE !== "undefined" && EV_STYLE.grain != null) ? EV_STYLE.grain : true));
  const grainPat = (grainOn && typeof makeGrainTile === "function") ? ctx.createPattern(makeGrainTile(seed), "repeat") : null;
  return { st, pal, bg, grainPat };
}

// Caption schedule: each page gets a slice of the voice proportional to how
// much of it is spoken (see renderVoiceOverVideoFromAudio).
function evScheduleCaptions(pages, voiceDur) {
  const norm = (s) => (typeof s === "string") ? { text: s, weight: s.length } : Object.assign({ weight: (s.text || "").length }, s);
  const pgs = pages.map(norm);
  const total = pgs.reduce((a, s) => a + (s.weight || 1), 0) || 1;
  let acc = 0;
  return pgs.map((s) => { const start = (acc / total) * voiceDur; acc += (s.weight || 1); return Object.assign({ start, end: (acc / total) * voiceDur }, s); });
}

// Word timing inside a page. Without word timestamps from the voice, weight
// each word by its length and give punctuation the pause a reader takes there.
function evWordTimes(page) {
  if (page._w) return page._w;
  const words = String(page.text || "").split(/\s+/).filter(Boolean);
  const wt = words.map((w) => w.replace(/[^\p{L}\p{N}]/gu, "").length + 2 + (/[.!?;:।]["”’)]?$/.test(w) ? 5 : /[,—–]["”’)]?$/.test(w) ? 2 : 0));
  const tot = wt.reduce((a, b) => a + b, 0) || 1, span = page.end - page.start;
  let acc = 0;
  page._w = words.map((w, i) => { const s = page.start + (acc / tot) * span; acc += wt[i]; return { w, s, e: page.start + (acc / tot) * span }; });
  return page._w;
}

// Punch shows a few words at a time: groups of up to three, always breaking
// after punctuation so a phrase never straddles a pause.
function evChunks(words, size) {
  const out = []; let cur = [];
  words.forEach((w, i) => {
    cur.push(i);
    if (cur.length === (size || 3) ||/[.!?;:,—।]["”’)]?$/.test(w.w)) { out.push(cur); cur = []; }
  });
  if (cur.length) out.push(cur);
  return out;
}

// Wrap words into centred lines, shrinking until they fit the box.
function evLayoutWords(ctx, words, family, weight, maxW, maxH, startSize, upper, tracking) {
  let size = startSize;
  for (;;) {
    ctx.font = `${weight} ${size}px ${family}`;
    evSetTracking(ctx, (tracking || 0) * size);
    const space = ctx.measureText(" ").width;
    const lines = []; let cur = [], curW = 0;
    for (const i of words) {
      const txt = upper ? i.w.toUpperCase() : i.w, w = ctx.measureText(txt).width;
      if (cur.length && curW + space + w > maxW) { lines.push({ items: cur, w: curW }); cur = []; curW = 0; }
      cur.push({ idx: i.idx, txt, w }); curW += (cur.length > 1 ? space : 0) + w;
    }
    if (cur.length) lines.push({ items: cur, w: curW });
    const lh = size * 1.32;
    evSetTracking(ctx, 0);
    if ((lines.length * lh <= maxH && lines.every((l) => l.w <= maxW)) || size <= 14) return { size, lines, lh, space };
    size -= 2;
  }
}

function evRoundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath();
}

function drawStyledShortFrame(ctx, W, H, prep, opts, p, page, t, emph) {
  const { st, pal, bg, grainPat } = prep;
  const vertical = H > W, minDim = Math.min(W, H);

  // Slow push-in on the pre-rendered background.
  const scale = 1.0 + 0.1 * easeInOut(p);
  const dw = W * scale, dh = H * scale;
  ctx.drawImage(bg, 0, 0, bg.width, bg.height, -(dw - W) / 2, -(dh - H) / 2 + (dh - H) * 0.15 * (p - 0.5), dw, dh);
  const vig = ctx.createRadialGradient(W / 2, H * 0.45, minDim * 0.18, W / 2, H * 0.5, Math.max(W, H) * 0.75);
  if (pal.light) { vig.addColorStop(0, "rgba(255,255,255,0.18)"); vig.addColorStop(1, "rgba(120,90,50,0.22)"); }
  else { vig.addColorStop(0, "rgba(0,0,0,0.22)"); vig.addColorStop(1, "rgba(0,0,0,0.6)"); }
  ctx.fillStyle = vig; ctx.fillRect(0, 0, W, H);

  // Safe box: on a vertical frame, keep left of the button rail and above the
  // bottom-quarter overlay.
  const cx = vertical ? W * 0.47 : W / 2;
  const boxW = vertical ? W * 0.78 : W * 0.8;
  const cy = vertical ? H * 0.43 : H * 0.46;
  const boxH = vertical ? H * 0.4 : H * 0.5;

  // A soft pool of shade behind the words keeps light text readable on the
  // brightest backgrounds (golden hour, light rays) without a visible box.
  if (!pal.light) {
    const sh = ctx.createRadialGradient(cx, cy, 0, cx, cy, boxW * 0.78);
    sh.addColorStop(0, "rgba(0,0,0,0.34)"); sh.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = sh; ctx.fillRect(0, 0, W, H);
  }
  if (grainPat) drawGrainOverlay(ctx, W, H, grainPat, st.grainAmt || 0.07);
  if (st.letterbox) { ctx.fillStyle = "#000"; const bar = H * (vertical ? 0.075 : 0.1); ctx.fillRect(0, 0, W, bar); ctx.fillRect(0, H - bar, W, bar); }
  const family = (EV_FONTS[st.font] || EV_FONTS.sans) + ', "Nirmala UI", "Segoe UI", sans-serif';
  const words = evWordTimes(page).map((w, idx) => Object.assign({ idx }, w));
  const tt = t + 0.08;   // captions land a hair before the voice — reads as in sync
  let k = -1; for (let i = 0; i < words.length; i++) if (tt >= words[i].s) k = i;
  const ink = pal.text, hi = st.hi || pal.accent;
  const hook = emph ? 1.18 : 1;

  ctx.save();
  ctx.direction = "ltr"; ctx.textAlign = "left"; ctx.textBaseline = "middle";

  // Chunked captions show a few words at a time: punch (3, pop up), slam (1,
  // drops in from large), boxed (4, on caption slabs).
  const CHUNK = { punch: 3, slam: 1, boxed: 4 };
  if (CHUNK[st.caption]) {
    const ck = "_chunks" + st.caption;
    if (!page[ck]) page[ck] = evChunks(words, CHUNK[st.caption]);
    const ch = page[ck].find((c) => c.indexOf(Math.max(0, k)) !== -1) || page[ck][0] || [];
    const cw = ch.map((i) => words[i]);
    const slam = st.caption === "slam", boxed = st.caption === "boxed";
    const start = minDim * (slam ? 0.19 : boxed ? 0.085 : 0.15) * hook;
    const lay = evLayoutWords(ctx, cw, family, st.weight, boxW, boxH * (boxed ? 0.6 : 0.75), start, st.upper, st.tracking);
    const a = clamp01((tt - (cw[0] ? cw[0].s : 0)) / (slam ? 0.12 : 0.16));
    const sc = slam ? 1 + 0.5 * (1 - easeInOut(a)) : boxed ? 0.9 + 0.1 * evEaseOutBack(a) : 0.72 + 0.28 * evEaseOutBack(a);
    ctx.translate(cx, cy); ctx.scale(sc, sc);
    if (slam) ctx.globalAlpha = Math.min(1, 0.2 + a * 1.6);
    ctx.font = `${st.weight} ${lay.size}px ${family}`;
    ctx.lineJoin = "round"; ctx.lineWidth = lay.size * 0.13; ctx.strokeStyle = "rgba(0,0,0,0.9)";
    let y = -(lay.lines.length * lay.lh) / 2 + lay.lh / 2;
    for (const line of lay.lines) {
      let x = -line.w / 2;
      if (boxed) {
        const padX = lay.size * 0.3;
        ctx.shadowColor = "rgba(0,0,0,0.3)"; ctx.shadowBlur = lay.size * 0.3; ctx.shadowOffsetY = lay.size * 0.06;
        ctx.fillStyle = st.box || "#ffffff";
        evRoundRect(ctx, x - padX, y - lay.lh * 0.47, line.w + padX * 2, lay.lh * 0.94, lay.size * 0.22); ctx.fill();
        ctx.shadowColor = "transparent"; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
      }
      for (const it of line.items) {
        if (!boxed) {
          ctx.shadowColor = "rgba(0,0,0,0.55)"; ctx.shadowBlur = lay.size * 0.25; ctx.shadowOffsetY = lay.size * 0.06;
          ctx.strokeText(it.txt, x, y);
          ctx.shadowColor = "transparent";
        }
        if (boxed) ctx.fillStyle = it.idx === k ? hi : (st.boxInk || "#111111");
        else if (slam) ctx.fillStyle = it.txt.replace(/[^\p{L}\p{N}]/gu, "").length >= 6 ? hi : "#ffffff";
        else ctx.fillStyle = it.idx === k ? hi : "#ffffff";
        ctx.fillText(it.txt, x, y);
        x += it.w + lay.space;
      }
      y += lay.lh;
    }
    ctx.globalAlpha = 1;
  } else if (st.caption === "lyric") {
    // Lines scroll up like a lyrics screen: the line being read sits at the
    // centre, full brightness; neighbours fade with distance.
    const lk = "lyric" + W + "x" + H;
    page._lay = page._lay || {};
    const lay = page._lay[lk] || (page._lay[lk] = evLayoutWords(ctx, words, family, st.weight, boxW, 1e6, minDim * 0.082, st.upper, st.tracking));
    let cur = 0;
    lay.lines.forEach((line, li) => { if (line.items.some((it) => it.idx <= Math.max(0, k))) cur = li; });
    const first = lay.lines[cur] && lay.lines[cur].items[0] ? words[lay.lines[cur].items[0].idx].s : 0;
    const a = cur === 0 ? 1 : easeInOut(clamp01((tt - first) / 0.35));
    const pos = cur - 1 + a;   // fractional line index now at the centre
    ctx.font = `${st.weight} ${lay.size}px ${family}`;
    evSetTracking(ctx, (st.tracking || 0) * lay.size);
    lay.lines.forEach((line, li) => {
      const d = li - pos;
      if (Math.abs(d) > 2.6) return;
      const y = cy + d * lay.lh * 1.15;
      const on = li === cur;
      const sc = on ? 1 : 0.86;
      ctx.save(); ctx.translate(cx, y); ctx.scale(sc, sc);
      ctx.shadowColor = pal.light ? "transparent" : "rgba(0,0,0,0.5)"; ctx.shadowBlur = lay.size * 0.2;
      let x = -line.w / 2;
      for (const it of line.items) {
        ctx.fillStyle = on ? (it.idx <= k ? hi : ink) : hexToRgba(ink, Math.max(0.12, 0.42 - Math.abs(d) * 0.12));
        ctx.fillText(it.txt, x, 0);
        x += it.w + lay.space;
      }
      ctx.restore();
    });
    evSetTracking(ctx, 0);
  } else {
    const key = st.caption + W + "x" + H + (emph ? "h" : "");
    page._lay = page._lay || {};
    const lay = page._lay[key] || (page._lay[key] = evLayoutWords(ctx, words, family, st.weight, boxW, boxH, minDim * 0.075 * hook, st.upper, st.tracking));
    ctx.font = `${st.weight} ${lay.size}px ${family}`;
    evSetTracking(ctx, (st.tracking || 0) * lay.size);
    const top = cy - (lay.lines.length * lay.lh) / 2 + lay.lh / 2;
    const shadow = (on) => {
      if (on && !pal.light) { ctx.shadowColor = "rgba(0,0,0,0.55)"; ctx.shadowBlur = lay.size * 0.18; ctx.shadowOffsetY = lay.size * 0.04; }
      else { ctx.shadowColor = "transparent"; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0; }
    };
    // Notes App: a left-aligned block on a paper card with a small header.
    const typed = st.caption === "type";
    const blockW = Math.max(...lay.lines.map((l) => l.w));
    if (typed) {
      const pad = lay.size * 0.7, head = lay.size * 0.9;
      const bx = cx - blockW / 2 - pad, by = top - lay.lh / 2 - pad - head;
      const bw = blockW + pad * 2, bh = lay.lines.length * lay.lh + pad * 2 + head;
      ctx.save();
      ctx.shadowColor = "rgba(60,40,20,0.18)"; ctx.shadowBlur = lay.size * 0.9; ctx.shadowOffsetY = lay.size * 0.2;
      ctx.fillStyle = "rgba(255,255,255,0.93)";
      evRoundRect(ctx, bx, by, bw, bh, lay.size * 0.5); ctx.fill();
      ctx.restore();
      ctx.save();
      evSetTracking(ctx, 0);
      ctx.font = `700 ${lay.size * 0.46}px ${EV_FONTS.sans}`;
      ctx.fillStyle = hi;
      ctx.fillText("✦ TODAY", bx + pad, by + pad * 0.55 + head * 0.35);
      ctx.restore();
      ctx.font = `${st.weight} ${lay.size}px ${family}`;
      evSetTracking(ctx, (st.tracking || 0) * lay.size);
    }
    lay.lines.forEach((line, li) => {
      const y = top + li * lay.lh;
      let x = typed ? cx - blockW / 2 : cx - line.w / 2;
      for (const it of line.items) {
        const w = words[it.idx], spoken = it.idx < k, now = it.idx === k;
        const a = now ? clamp01((tt - w.s) / 0.2) : 1;
        if (typed) {
          // Typed out letter by letter across the word's spoken time, with a
          // blinking cursor after the last letter.
          if (spoken || now) {
            shadow(false); ctx.fillStyle = ink;
            const frac = now ? clamp01((tt - w.s) / Math.max(0.06, w.e - w.s)) : 1;
            const part = now ? it.txt.slice(0, Math.max(1, Math.ceil(it.txt.length * frac))) : it.txt;
            ctx.fillText(part, x, y);
            if (now && (tt * 2.2) % 1 < 0.6) {
              ctx.fillStyle = hi;
              ctx.fillRect(x + ctx.measureText(part).width + lay.size * 0.06, y - lay.size * 0.5, Math.max(2, lay.size * 0.07), lay.size);
            }
          }
        } else if (st.caption === "outline") {
          // Hollow letters; spoken words fill solid, the current one fills left to right.
          shadow(false);
          ctx.lineJoin = "round"; ctx.lineWidth = Math.max(1.5, lay.size * 0.045);
          ctx.strokeStyle = hexToRgba(ink, spoken || now ? 1 : 0.7);
          ctx.strokeText(it.txt, x, y);
          if (spoken) { ctx.fillStyle = ink; ctx.fillText(it.txt, x, y); }
          else if (now) {
            ctx.save(); ctx.beginPath(); ctx.rect(x - 2, y - lay.size, (it.w + 4) * a, lay.size * 2); ctx.clip();
            ctx.fillStyle = hi; ctx.fillText(it.txt, x, y); ctx.restore();
          }
        } else if (st.caption === "underline") {
          shadow(false); ctx.fillStyle = hexToRgba(ink, spoken || now ? 1 : 0.45); ctx.fillText(it.txt, x, y);
          if (now) {
            ctx.fillStyle = hi;
            ctx.fillRect(x, y + lay.size * 0.5, it.w * easeInOut(a), Math.max(2, lay.size * 0.07));
          }
        } else if (st.caption === "karaoke") {
          if (now) {
            const pad = lay.size * 0.16, pop = 1 + 0.06 * Math.sin(a * Math.PI);
            ctx.save(); ctx.translate(x + it.w / 2, y); ctx.scale(pop, pop);
            shadow(false); ctx.fillStyle = hi;
            evRoundRect(ctx, -it.w / 2 - pad, -lay.size * 0.62, it.w + pad * 2, lay.size * 1.2, lay.size * 0.2); ctx.fill();
            ctx.fillStyle = evReadableOn(hi); ctx.fillText(it.txt, -it.w / 2, 0);
            ctx.restore();
          } else { shadow(true); ctx.fillStyle = hexToRgba(ink, spoken ? 1 : 0.42); ctx.fillText(it.txt, x, y); }
        } else if (st.caption === "glow") {
          if (now) { ctx.shadowColor = hi; ctx.shadowBlur = lay.size * (0.3 + 0.5 * a); ctx.shadowOffsetY = 0; ctx.fillStyle = "#ffffff"; ctx.fillText(it.txt, x, y); ctx.fillText(it.txt, x, y); }
          else { shadow(true); ctx.fillStyle = hexToRgba(ink, spoken ? 0.92 : 0.26); ctx.fillText(it.txt, x, y); }
        } else if (st.caption === "marker") {
          if (spoken || now) {
            shadow(false); ctx.fillStyle = hexToRgba(hi, now ? 0.8 : 0.38);
            ctx.fillRect(x - lay.size * 0.06, y - lay.size * 0.12, (it.w + lay.size * 0.12) * (now ? a : 1), lay.size * 0.5);
          }
          shadow(false); ctx.fillStyle = hexToRgba(ink, spoken || now ? 1 : 0.34); ctx.fillText(it.txt, x, y);
        } else {   // reveal: unread words are not there yet; each one rises into place
          if (spoken || now) {
            shadow(true); ctx.globalAlpha = a; ctx.fillStyle = ink;
            ctx.fillText(it.txt, x, y + (1 - easeInOut(a)) * lay.size * 0.3);
            ctx.globalAlpha = 1;
          }
        }
        x += it.w + lay.space;
      }
    });
    evSetTracking(ctx, 0);
  }
  ctx.restore();

  // Reference + a slim progress line beneath it, inside the safe zone.
  const refY = vertical ? H * 0.70 : H * 0.84;
  ctx.save();
  ctx.direction = "ltr"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.shadowColor = "transparent";
  if (opts.ref) {
    ctx.font = `700 ${minDim * 0.032}px ${EV_FONTS.sans}`;
    evSetTracking(ctx, minDim * 0.006);
    ctx.fillStyle = pal.light ? pal.accent : hexToRgba(hi, 0.95);
    ctx.fillText(String(opts.ref).toUpperCase(), cx, refY);
    evSetTracking(ctx, 0);
  }
  const lw = W * 0.22, ly = refY + minDim * 0.045;
  ctx.fillStyle = hexToRgba(ink, 0.18); ctx.fillRect(cx - lw / 2, ly, lw, Math.max(2, minDim * 0.004));
  ctx.fillStyle = pal.light ? pal.accent : hi; ctx.fillRect(cx - lw / 2, ly, lw * p, Math.max(2, minDim * 0.004));
  if (opts.watermark) {
    if (vertical) {
      ctx.font = `600 ${minDim * 0.026}px ${EV_FONTS.sans}`;
      evSetTracking(ctx, minDim * 0.006);
      ctx.fillStyle = hexToRgba(ink, pal.light ? 0.55 : 0.7);
      ctx.fillText("✦ EVERVERSE", W / 2, H * 0.115);
      evSetTracking(ctx, 0);
    } else drawWatermark(ctx, W, H, pal, "center");
  }
  ctx.restore();
}

// One frame of a short at time t. Pages the styled renderer cannot do word by
// word (right-to-left text, a script line with its reading underneath) use
// the classic frame, so a devotion in any language still renders correctly.
function evShortFrame(ctx, W, H, prep, opts, sched, t, dur) {
  const p = Math.min(1, t / dur);
  let page = sched.length ? sched[sched.length - 1] : { text: "", start: 0, end: 1 };
  for (const s of sched) { if (t >= s.start && t < s.end) { page = s; break; } }
  if (sched[0] && t < sched[0].start) page = sched[0];
  const emph = (opts.emphasizeHook !== false && t < (sched[1] ? Math.min(sched[1].start, 2.6) : 2.6)) || !!page.big;
  if (prep.st && !page.sub && !page.big && !page.rtl && !opts.rtl) drawStyledShortFrame(ctx, W, H, prep, opts, p, page, t, emph);
  else drawVoiceOverFrame(ctx, W, H, prep.bg, prep.pal, opts, p, page.text, prep.grainPat, emph, page);
}
