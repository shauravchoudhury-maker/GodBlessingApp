// render.js — shared verse → canvas renderer, used by BOTH the public site
// (site.js) and the private studio (app.js). Depends on THEME_PALETTES (verses.js)
// and drawBackground (backgrounds.js).

function wrapLines(ctx, text, maxWidth) {
  const words = text.split(/\s+/);
  const lines = [];
  let line = "";
  for (const w of words) {
    const test = line ? line + " " + w : w;
    if (ctx.measureText(test).width > maxWidth && line) { lines.push(line); line = w; }
    else line = test;
  }
  if (line) lines.push(line);
  return lines;
}
function fitText(ctx, text, maxW, maxH, family, startSize, weight) {
  let size = startSize, lines, lineHeight;
  while (size > 12) {
    ctx.font = `${weight} ${size}px ${family}`;
    lines = wrapLines(ctx, text, maxW);
    lineHeight = size * 1.28;
    if (lines.length * lineHeight <= maxH) break;
    size -= 2;
  }
  return { size, lines, lineHeight };
}
function hexToRgba(hex, a) {
  const h = hex.replace("#", "");
  const n = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  return `rgba(${parseInt(n.slice(0,2),16)},${parseInt(n.slice(2,4),16)},${parseInt(n.slice(4,6),16)},${a})`;
}

// Typeface stacks (system fonts only — offline/CSP-safe).
const EV_FONTS = {
  serif: 'Georgia, "Times New Roman", serif',
  sans: '"Helvetica Neue", "Segoe UI", Arial, sans-serif',
};

function evSetTracking(ctx, px) { try { ctx.letterSpacing = (px || 0) + "px"; } catch (e) {} }

// Small, tasteful brand mark. corner: "center" | "bottom-left" | "bottom-right".
function drawWatermark(ctx, W, H, pal, corner) {
  const minDim = Math.min(W, H);
  ctx.save();
  ctx.direction = "ltr";
  ctx.textBaseline = "bottom";
  ctx.font = `600 ${minDim * 0.02}px ${EV_FONTS.sans}`;
  evSetTracking(ctx, minDim * 0.006);
  ctx.fillStyle = hexToRgba(pal.text, pal.light ? 0.5 : 0.62);
  const pad = H * 0.045;
  if (corner === "bottom-left") { ctx.textAlign = "left"; ctx.fillText("✦ EVERVERSE", W * 0.10, H - pad); }
  else if (corner === "bottom-right") { ctx.textAlign = "right"; ctx.fillText("✦ EVERVERSE", W * 0.90, H - pad); }
  else { ctx.textAlign = "center"; ctx.fillText("✦ EVERVERSE", W / 2, H - pad); }
  evSetTracking(ctx, 0);
  ctx.restore();
}

// opts: { text, ref, rtl, paletteKey, bgKey, watermark, showRef, fontScale,
//         layout: "classic"|"affirmation"|"editorial"|"minimal", font: "serif"|"sans",
//         grain: bool (default true), kicker: string }
function renderVerse(canvas, W, H, opts) {
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");
  const pal = THEME_PALETTES[opts.paletteKey] || THEME_PALETTES.warm;
  const seed = (opts.ref || opts.text || "seed").split("").reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 7);
  // Studio-wide style defaults (set by the admin) fall through when not given per-call.
  const style = (typeof EV_STYLE !== "undefined") ? EV_STYLE : null;
  const layout = opts.layout || (style && style.layout) || "classic";
  const font = opts.font || (style && style.font) || null;

  drawBackground(opts.bgKey || "gradient", ctx, W, H, pal, seed);

  // Adaptive vignette — dark for deep palettes, soft for light ("sand") ones.
  const vig = ctx.createRadialGradient(W / 2, H * 0.44, Math.min(W, H) * 0.2, W / 2, H * 0.5, Math.max(W, H) * 0.78);
  if (pal.light) { vig.addColorStop(0, "rgba(255,255,255,0.10)"); vig.addColorStop(1, "rgba(120,90,50,0.16)"); }
  else { vig.addColorStop(0, "rgba(0,0,0,0)"); vig.addColorStop(1, "rgba(0,0,0,0.30)"); }
  ctx.fillStyle = vig; ctx.fillRect(0, 0, W, H);

  const grainOn = (opts.grain != null) ? opts.grain : (style && style.grain != null ? style.grain : true);
  if (grainOn && typeof addGrain === "function") addGrain(ctx, W, H, seed, layout === "editorial" ? 0.05 : 0.075);

  const ctxArg = { ctx, W, H, pal, opts, font, seed, minDim: Math.min(W, H) };
  if (layout === "affirmation") drawLayoutAffirmation(ctxArg);
  else if (layout === "editorial") drawLayoutEditorial(ctxArg);
  else if (layout === "minimal") drawLayoutMinimal(ctxArg);
  else drawLayoutClassic(ctxArg);
}

function drawLayoutClassic({ ctx, W, H, pal, opts, font, minDim }) {
  const text = opts.text || "";
  const maxWidth = W - W * 0.10 * 2;
  const showRef = opts.showRef !== false && opts.ref;
  const family = EV_FONTS[font] || EV_FONTS.serif;
  const startSize = minDim * 0.075 * (opts.fontScale || 1);
  ctx.direction = opts.rtl ? "rtl" : "ltr";
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  const fit = fitText(ctx, text, maxWidth, H * (showRef ? 0.54 : 0.64), family, startSize, "600");
  ctx.font = `600 ${fit.size}px ${family}`;
  ctx.fillStyle = pal.text;
  if (!pal.light) { ctx.shadowColor = "rgba(0,0,0,0.4)"; ctx.shadowBlur = fit.size * 0.14; ctx.shadowOffsetY = fit.size * 0.04; }
  const blockH = fit.lines.length * fit.lineHeight;
  let y = H * 0.46 - blockH / 2 + fit.lineHeight / 2;
  for (const line of fit.lines) { ctx.fillText(line, W / 2, y); y += fit.lineHeight; }
  ctx.shadowColor = "transparent"; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
  const divY = y + fit.lineHeight * 0.05;
  ctx.strokeStyle = hexToRgba(pal.accent, 0.75);
  ctx.lineWidth = Math.max(1.5, W * 0.002);
  ctx.beginPath(); ctx.moveTo(W / 2 - minDim * 0.06, divY); ctx.lineTo(W / 2 + minDim * 0.06, divY); ctx.stroke();
  if (showRef) {
    ctx.direction = "ltr"; ctx.font = `italic 600 ${minDim * 0.032}px ${family}`;
    ctx.fillStyle = pal.accent; ctx.fillText("— " + opts.ref, W / 2, divY + minDim * 0.05);
  }
  if (opts.watermark) drawWatermark(ctx, W, H, pal, "center");
}

function drawLayoutAffirmation({ ctx, W, H, pal, opts, font, minDim }) {
  const text = opts.text || "";
  const family = EV_FONTS[font] || EV_FONTS.sans;   // sans reads as modern affirmation
  const maxWidth = W - W * 0.11 * 2;
  const showRef = opts.showRef !== false && opts.ref;
  ctx.direction = opts.rtl ? "rtl" : "ltr";
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  const startSize = minDim * 0.098 * (opts.fontScale || 1);
  const fit = fitText(ctx, text, maxWidth, H * 0.6, family, startSize, "700");
  ctx.font = `700 ${fit.size}px ${family}`;
  ctx.fillStyle = pal.text;
  if (!pal.light) { ctx.shadowColor = "rgba(0,0,0,0.28)"; ctx.shadowBlur = fit.size * 0.10; }
  const lh = fit.size * 1.18;
  const blockH = fit.lines.length * lh;
  let y = H * 0.47 - blockH / 2 + lh / 2;
  for (const line of fit.lines) { ctx.fillText(line, W / 2, y); y += lh; }
  ctx.shadowColor = "transparent"; ctx.shadowBlur = 0;
  if (showRef) {
    ctx.direction = "ltr"; ctx.textBaseline = "alphabetic";
    ctx.font = `600 ${minDim * 0.026}px ${EV_FONTS.sans}`;
    evSetTracking(ctx, minDim * 0.01);
    ctx.fillStyle = hexToRgba(pal.accent, 0.95);
    ctx.fillText(opts.ref.toUpperCase(), W / 2, y + minDim * 0.03);
    evSetTracking(ctx, 0);
  }
  if (opts.watermark) drawWatermark(ctx, W, H, pal, "center");
}

function drawLayoutEditorial({ ctx, W, H, pal, opts, font, minDim }) {
  const text = opts.text || "";
  const padL = W * 0.11;
  const maxWidth = W - padL - W * 0.09;
  const family = EV_FONTS[font] || EV_FONTS.serif;
  ctx.direction = "ltr"; ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
  // Kicker
  ctx.font = `700 ${minDim * 0.024}px ${EV_FONTS.sans}`;
  evSetTracking(ctx, minDim * 0.012);
  ctx.fillStyle = hexToRgba(pal.accent, 0.95);
  ctx.fillText((opts.kicker || "EVERVERSE").toUpperCase(), padL, H * 0.15);
  evSetTracking(ctx, 0);
  ctx.strokeStyle = hexToRgba(pal.accent, 0.6); ctx.lineWidth = Math.max(1.5, W * 0.0022);
  ctx.beginPath(); ctx.moveTo(padL, H * 0.175); ctx.lineTo(padL + minDim * 0.14, H * 0.175); ctx.stroke();
  // Body (left-aligned, big)
  ctx.textBaseline = "middle";
  const fit = fitText(ctx, text, maxWidth, H * 0.5, family, minDim * 0.072 * (opts.fontScale || 1), "600");
  ctx.font = `600 ${fit.size}px ${family}`;
  ctx.fillStyle = pal.text;
  if (!pal.light) { ctx.shadowColor = "rgba(0,0,0,0.32)"; ctx.shadowBlur = fit.size * 0.12; ctx.shadowOffsetY = fit.size * 0.03; }
  let y = H * 0.42 - (fit.lines.length * fit.lineHeight) / 2 + fit.lineHeight / 2;
  for (const line of fit.lines) { ctx.fillText(line, padL, y); y += fit.lineHeight; }
  ctx.shadowColor = "transparent"; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
  // Attribution
  if (opts.showRef !== false && opts.ref) {
    ctx.textBaseline = "alphabetic";
    ctx.font = `italic 600 ${minDim * 0.03}px ${family}`;
    ctx.fillStyle = hexToRgba(pal.accent, 0.95);
    ctx.fillText("— " + opts.ref, padL, H * 0.8);
  }
  if (opts.watermark) drawWatermark(ctx, W, H, pal, "bottom-right");
}

function drawLayoutMinimal({ ctx, W, H, pal, opts, font, minDim }) {
  const text = opts.text || "";
  const maxWidth = W - W * 0.14 * 2;
  const family = EV_FONTS[font] || EV_FONTS.serif;
  ctx.direction = opts.rtl ? "rtl" : "ltr";
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  const fit = fitText(ctx, text, maxWidth, H * 0.42, family, minDim * 0.055 * (opts.fontScale || 1), "500");
  ctx.font = `500 ${fit.size}px ${family}`;
  ctx.fillStyle = pal.text;
  const blockH = fit.lines.length * fit.lineHeight;
  let y = H * 0.42 - blockH / 2 + fit.lineHeight / 2;
  for (const line of fit.lines) { ctx.fillText(line, W / 2, y); y += fit.lineHeight; }
  const divY = y + fit.lineHeight * 0.4;
  ctx.strokeStyle = hexToRgba(pal.accent, 0.7); ctx.lineWidth = Math.max(1, W * 0.0016);
  ctx.beginPath(); ctx.moveTo(W / 2 - minDim * 0.035, divY); ctx.lineTo(W / 2 + minDim * 0.035, divY); ctx.stroke();
  if (opts.showRef !== false && opts.ref) {
    ctx.direction = "ltr"; ctx.textBaseline = "alphabetic";
    ctx.font = `600 ${minDim * 0.022}px ${EV_FONTS.sans}`;
    evSetTracking(ctx, minDim * 0.008);
    ctx.fillStyle = hexToRgba(pal.accent, 0.9);
    ctx.fillText(opts.ref.toUpperCase(), W / 2, divY + minDim * 0.055);
    evSetTracking(ctx, 0);
  }
  if (opts.watermark) drawWatermark(ctx, W, H, pal, "center");
}
