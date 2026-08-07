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
// Dark or light ink for text sitting ON a filled colour (e.g. a highlight box).
function evReadableOn(hex) {
  const h = hex.replace("#", "");
  const n = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const r = parseInt(n.slice(0, 2), 16), g = parseInt(n.slice(2, 4), 16), b = parseInt(n.slice(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.6 ? "#141018" : "#ffffff";
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
  const kicker = opts.kicker || (style && style.kicker) || null;

  drawBackground(opts.bgKey || "gradient", ctx, W, H, pal, seed);

  // Adaptive vignette — dark for deep palettes, soft for light ("sand") ones.
  const vig = ctx.createRadialGradient(W / 2, H * 0.44, Math.min(W, H) * 0.2, W / 2, H * 0.5, Math.max(W, H) * 0.78);
  if (pal.light) { vig.addColorStop(0, "rgba(255,255,255,0.10)"); vig.addColorStop(1, "rgba(120,90,50,0.16)"); }
  else { vig.addColorStop(0, "rgba(0,0,0,0)"); vig.addColorStop(1, "rgba(0,0,0,0.30)"); }
  ctx.fillStyle = vig; ctx.fillRect(0, 0, W, H);

  const grainOn = (opts.grain != null) ? opts.grain : (style && style.grain != null ? style.grain : true);
  if (grainOn && typeof addGrain === "function") addGrain(ctx, W, H, seed, layout === "editorial" ? 0.05 : 0.075);

  const ctxArg = { ctx, W, H, pal, opts, font, kicker, seed, minDim: Math.min(W, H) };
  if (layout === "affirmation") drawLayoutAffirmation(ctxArg);
  else if (layout === "editorial") drawLayoutEditorial(ctxArg);
  else if (layout === "minimal") drawLayoutMinimal(ctxArg);
  else if (layout === "dimensional") drawLayoutDimensional(ctxArg);
  else if (layout === "poster") drawLayoutPoster(ctxArg);
  else if (layout === "quote") drawLayoutQuote(ctxArg);
  else if (layout === "glass") drawLayoutGlass(ctxArg);
  else if (layout === "banner") drawLayoutBanner(ctxArg);
  else if (layout === "captions") drawLayoutCaptions(ctxArg);
  else if (layout === "cinematic") drawLayoutCinematic(ctxArg);
  else if (layout === "scripture") drawLayoutScripture(ctxArg);
  else if (layout === "lowerthird") drawLayoutLowerThird(ctxArg);
  else if (layout === "postcard") drawLayoutPostcard(ctxArg);
  else if (layout === "spotlight") drawLayoutSpotlight(ctxArg);
  else if (layout === "billboard") drawLayoutBillboard(ctxArg);
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

// Layered "3D" treatment: extruded text + a foreground depth layer so the
// words sit on a stage between background and out-of-focus front elements.
function drawLayoutDimensional({ ctx, W, H, pal, opts, font, minDim }) {
  const text = opts.text || "";
  const family = EV_FONTS[font] || EV_FONTS.sans;   // bold sans reads most "3D"
  const maxWidth = W - W * 0.12 * 2;
  const showRef = opts.showRef !== false && opts.ref;
  ctx.direction = opts.rtl ? "rtl" : "ltr";
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  const fit = fitText(ctx, text, maxWidth, H * 0.56, family, minDim * 0.09 * (opts.fontScale || 1), "800");
  ctx.font = `800 ${fit.size}px ${family}`;
  const lh = fit.size * 1.16;
  const blockH = fit.lines.length * lh;
  const cx = W / 2;
  const y0 = H * 0.45 - blockH / 2 + lh / 2;

  // Soft drop shadow beneath the whole block (lift off the background)
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.4)"; ctx.shadowBlur = fit.size * 0.5; ctx.shadowOffsetY = fit.size * 0.12;
  ctx.fillStyle = "rgba(0,0,0,0.001)";
  let ys = y0; for (const line of fit.lines) { ctx.fillText(line, cx, ys); ys += lh; }
  ctx.restore();

  // Extruded side (opaque dark, back → front) for genuine depth
  const depth = Math.max(5, Math.round(fit.size * 0.12));
  const dx = fit.size * 0.018, dy = fit.size * 0.05;
  const side = (typeof shade === "function") ? shade(pal.stops[1], -55) : "rgba(0,0,0,0.85)";
  ctx.fillStyle = side;
  for (let i = depth; i >= 1; i--) {
    let y = y0; for (const line of fit.lines) { ctx.fillText(line, cx + i * dx, y + i * dy); y += lh; }
  }

  // Top face — gradient from text colour to accent + a bright top edge highlight
  let y = y0;
  for (const line of fit.lines) {
    const g = ctx.createLinearGradient(0, y - fit.size * 0.5, 0, y + fit.size * 0.5);
    g.addColorStop(0, hexToRgba(pal.text, 1));
    g.addColorStop(1, hexToRgba(pal.accent, 1));
    ctx.fillStyle = g; ctx.fillText(line, cx, y);
    ctx.fillStyle = hexToRgba("#ffffff", 0.18); ctx.fillText(line, cx, y - fit.size * 0.02);
    y += lh;
  }

  if (showRef) {
    ctx.textBaseline = "alphabetic"; ctx.direction = "ltr";
    ctx.font = `600 ${minDim * 0.026}px ${EV_FONTS.sans}`;
    evSetTracking(ctx, minDim * 0.01);
    ctx.fillStyle = hexToRgba(pal.accent, 0.95);
    ctx.fillText(opts.ref.toUpperCase(), cx, y + minDim * 0.02);
    evSetTracking(ctx, 0);
    ctx.textBaseline = "middle";
  }

  // Foreground depth layer — large, soft, out-of-focus orbs sitting IN FRONT
  const orbs = [[0.1, 0.14, 0.16], [0.9, 0.86, 0.2], [0.86, 0.12, 0.12], [0.14, 0.85, 0.14]];
  orbs.forEach(([fx, fy, rr], i) => {
    const r = W * rr;
    const g = ctx.createRadialGradient(W * fx, H * fy, 0, W * fx, H * fy, r);
    g.addColorStop(0, hexToRgba(i % 2 ? pal.accent : "#ffffff", 0.16));
    g.addColorStop(1, hexToRgba(i % 2 ? pal.accent : "#ffffff", 0));
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(W * fx, H * fy, r, 0, Math.PI * 2); ctx.fill();
  });

  if (opts.watermark) drawWatermark(ctx, W, H, pal, "center");
}

function evRoundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// POSTER — huge tight-leading type, edge to edge. Built to stop the scroll.
function drawLayoutPoster({ ctx, W, H, pal, opts, font, minDim }) {
  const text = (opts.text || "").toUpperCase();
  const family = EV_FONTS[font] || EV_FONTS.sans;
  const padL = W * 0.08;
  const maxWidth = W - padL * 2;
  ctx.direction = opts.rtl ? "rtl" : "ltr";
  ctx.textAlign = "left"; ctx.textBaseline = "middle";
  const fit = fitText(ctx, text, maxWidth, H * 0.68, family, minDim * 0.135, "800");
  ctx.font = `800 ${fit.size}px ${family}`;
  const lh = fit.size * 1.03;
  ctx.fillStyle = pal.text;
  if (!pal.light) { ctx.shadowColor = "rgba(0,0,0,0.3)"; ctx.shadowBlur = fit.size * 0.12; }
  let y = H * 0.45 - (fit.lines.length * lh) / 2 + lh / 2;
  for (const line of fit.lines) { ctx.fillText(line, padL, y); y += lh; }
  ctx.shadowColor = "transparent"; ctx.shadowBlur = 0;
  ctx.fillStyle = hexToRgba(pal.accent, 0.95);
  ctx.fillRect(padL, y + minDim * 0.02, minDim * 0.13, Math.max(3, minDim * 0.009));
  if (opts.showRef !== false && opts.ref) {
    ctx.textBaseline = "alphabetic"; ctx.direction = "ltr";
    ctx.font = `700 ${minDim * 0.026}px ${EV_FONTS.sans}`;
    evSetTracking(ctx, minDim * 0.01);
    ctx.fillStyle = hexToRgba(pal.accent, 0.95);
    ctx.fillText(opts.ref.toUpperCase(), padL, y + minDim * 0.085);
    evSetTracking(ctx, 0);
  }
  if (opts.watermark) drawWatermark(ctx, W, H, pal, "bottom-right");
}

// QUOTE — oversized decorative mark; classic, premium, instantly readable.
function drawLayoutQuote({ ctx, W, H, pal, opts, font, minDim }) {
  const family = EV_FONTS[font] || EV_FONTS.serif;
  ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.direction = "ltr";
  ctx.font = `${minDim * 0.3}px Georgia, "Times New Roman", serif`;
  ctx.fillStyle = hexToRgba(pal.accent, 0.32);
  ctx.fillText("“", W / 2, H * 0.26);
  const maxWidth = W - W * 0.12 * 2;
  ctx.direction = opts.rtl ? "rtl" : "ltr";
  const fit = fitText(ctx, opts.text || "", maxWidth, H * 0.42, family, minDim * 0.068, "600");
  ctx.font = `600 ${fit.size}px ${family}`;
  ctx.fillStyle = pal.text;
  if (!pal.light) { ctx.shadowColor = "rgba(0,0,0,0.32)"; ctx.shadowBlur = fit.size * 0.12; }
  let y = H * 0.52 - (fit.lines.length * fit.lineHeight) / 2 + fit.lineHeight / 2;
  for (const line of fit.lines) { ctx.fillText(line, W / 2, y); y += fit.lineHeight; }
  ctx.shadowColor = "transparent"; ctx.shadowBlur = 0;
  ctx.strokeStyle = hexToRgba(pal.accent, 0.7); ctx.lineWidth = Math.max(1.5, W * 0.002);
  ctx.beginPath(); ctx.moveTo(W / 2 - minDim * 0.05, y + minDim * 0.01); ctx.lineTo(W / 2 + minDim * 0.05, y + minDim * 0.01); ctx.stroke();
  if (opts.showRef !== false && opts.ref) {
    ctx.direction = "ltr"; ctx.font = `italic 600 ${minDim * 0.032}px ${family}`;
    ctx.fillStyle = hexToRgba(pal.accent, 0.95);
    ctx.fillText("— " + opts.ref, W / 2, y + minDim * 0.06);
  }
  if (opts.watermark) drawWatermark(ctx, W, H, pal, "center");
}

// GLASS — a real frosted-glass card over the art (backdrop blur). Very modern.
function drawLayoutGlass({ ctx, W, H, pal, opts, font, minDim }) {
  const family = EV_FONTS[font] || EV_FONTS.sans;
  const cx = W * 0.08, cw = W * 0.84;
  const ch = H * 0.56, cy = H * 0.20;
  const r = minDim * 0.05;
  // Snapshot what's underneath, then blur it inside the card = true glassmorphism.
  try {
    const snap = document.createElement("canvas"); snap.width = W; snap.height = H;
    snap.getContext("2d").drawImage(ctx.canvas, 0, 0);
    ctx.save(); evRoundRect(ctx, cx, cy, cw, ch, r); ctx.clip();
    ctx.filter = "blur(22px)"; ctx.drawImage(snap, 0, 0); ctx.filter = "none";
    ctx.fillStyle = pal.light ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.14)";
    ctx.fillRect(cx, cy, cw, ch);
    ctx.restore();
  } catch (e) {
    ctx.save(); evRoundRect(ctx, cx, cy, cw, ch, r);
    ctx.fillStyle = pal.light ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.16)"; ctx.fill(); ctx.restore();
  }
  ctx.save(); evRoundRect(ctx, cx, cy, cw, ch, r);
  ctx.strokeStyle = hexToRgba("#ffffff", 0.35); ctx.lineWidth = Math.max(1.5, minDim * 0.003); ctx.stroke();
  ctx.restore();
  // Text inside the card
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.direction = opts.rtl ? "rtl" : "ltr";
  const fit = fitText(ctx, opts.text || "", cw - minDim * 0.12, ch * 0.62, family, minDim * 0.062, "700");
  ctx.font = `700 ${fit.size}px ${family}`;
  ctx.fillStyle = pal.text;
  if (!pal.light) { ctx.shadowColor = "rgba(0,0,0,0.35)"; ctx.shadowBlur = fit.size * 0.14; }
  let y = cy + ch * 0.44 - (fit.lines.length * fit.lineHeight) / 2 + fit.lineHeight / 2;
  for (const line of fit.lines) { ctx.fillText(line, W / 2, y); y += fit.lineHeight; }
  ctx.shadowColor = "transparent"; ctx.shadowBlur = 0;
  if (opts.showRef !== false && opts.ref) {
    ctx.direction = "ltr"; ctx.textBaseline = "alphabetic";
    ctx.font = `600 ${minDim * 0.026}px ${EV_FONTS.sans}`;
    evSetTracking(ctx, minDim * 0.008);
    ctx.fillStyle = hexToRgba(pal.accent, 0.98);
    ctx.fillText(opts.ref.toUpperCase(), W / 2, cy + ch - minDim * 0.05);
    evSetTracking(ctx, 0);
  }
  if (opts.watermark) drawWatermark(ctx, W, H, pal, "center");
}

// BANNER — a bold colour band across the art. Magazine-cover energy.
function drawLayoutBanner({ ctx, W, H, pal, opts, font, minDim }) {
  const family = EV_FONTS[font] || EV_FONTS.serif;
  const bandY = H * 0.28, bandH = H * 0.44;
  const g = ctx.createLinearGradient(0, bandY, W, bandY + bandH);
  g.addColorStop(0, hexToRgba(pal.stops[1], 0.94));
  g.addColorStop(1, hexToRgba(pal.stops[0], 0.92));
  ctx.fillStyle = g; ctx.fillRect(0, bandY, W, bandH);
  ctx.fillStyle = hexToRgba(pal.accent, 0.9);
  const t = Math.max(2, minDim * 0.006);
  ctx.fillRect(0, bandY, W, t); ctx.fillRect(0, bandY + bandH - t, W, t);
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.direction = opts.rtl ? "rtl" : "ltr";
  const fit = fitText(ctx, opts.text || "", W - W * 0.1 * 2, bandH * 0.6, family, minDim * 0.062, "700");
  ctx.font = `700 ${fit.size}px ${family}`;
  ctx.fillStyle = pal.text;
  let y = bandY + bandH * 0.44 - (fit.lines.length * fit.lineHeight) / 2 + fit.lineHeight / 2;
  for (const line of fit.lines) { ctx.fillText(line, W / 2, y); y += fit.lineHeight; }
  if (opts.showRef !== false && opts.ref) {
    ctx.direction = "ltr"; ctx.textBaseline = "alphabetic";
    ctx.font = `600 ${minDim * 0.026}px ${EV_FONTS.sans}`;
    evSetTracking(ctx, minDim * 0.009);
    ctx.fillStyle = hexToRgba(pal.accent, 0.98);
    ctx.fillText(opts.ref.toUpperCase(), W / 2, bandY + bandH - minDim * 0.045);
    evSetTracking(ctx, 0);
  }
  if (opts.watermark) drawWatermark(ctx, W, H, pal, "center");
}

function drawLayoutEditorial({ ctx, W, H, pal, opts, font, kicker, minDim }) {
  const text = opts.text || "";
  const padL = W * 0.11;
  const maxWidth = W - padL - W * 0.09;
  const family = EV_FONTS[font] || EV_FONTS.serif;
  ctx.direction = "ltr"; ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
  // Kicker
  ctx.font = `700 ${minDim * 0.024}px ${EV_FONTS.sans}`;
  evSetTracking(ctx, minDim * 0.012);
  ctx.fillStyle = hexToRgba(pal.accent, 0.95);
  ctx.fillText((kicker || "EVERVERSE").toUpperCase(), padL, H * 0.15);
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

// Call-to-action slide (last slide of a carousel).
function drawCtaSlide(canvas, W, H, pal, opts) {
  opts = opts || {};
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");
  const minDim = Math.min(W, H);
  drawBackground(opts.bgKey || "aura", ctx, W, H, pal, 4242);
  const vig = ctx.createRadialGradient(W / 2, H * 0.5, minDim * 0.15, W / 2, H * 0.5, minDim * 0.8);
  vig.addColorStop(0, "rgba(0,0,0,0)"); vig.addColorStop(1, pal.light ? "rgba(120,90,50,0.16)" : "rgba(0,0,0,0.34)");
  ctx.fillStyle = vig; ctx.fillRect(0, 0, W, H);
  if (typeof addGrain === "function") addGrain(ctx, W, H, 4242, 0.07);
  ctx.textAlign = "center"; ctx.fillStyle = pal.text; ctx.direction = "ltr";
  ctx.font = `${minDim * 0.13}px Georgia, serif`;
  ctx.fillText("✦", W / 2, H * 0.34);
  ctx.font = `700 ${minDim * 0.062}px ${EV_FONTS.serif}`;
  ctx.fillText("A daily blessing", W / 2, H * 0.47);
  ctx.fillText("for every soul", W / 2, H * 0.47 + minDim * 0.08);
  ctx.strokeStyle = hexToRgba(pal.accent, 0.7); ctx.lineWidth = Math.max(1.5, W * 0.002);
  ctx.beginPath(); ctx.moveTo(W / 2 - minDim * 0.08, H * 0.62); ctx.lineTo(W / 2 + minDim * 0.08, H * 0.62); ctx.stroke();
  ctx.font = `600 ${minDim * 0.036}px ${EV_FONTS.sans}`;
  ctx.fillStyle = hexToRgba(pal.accent, 0.95);
  ctx.fillText("Follow for a verse every day", W / 2, H * 0.7);
  ctx.font = `700 ${minDim * 0.044}px ${EV_FONTS.sans}`;
  ctx.fillStyle = pal.text;
  ctx.fillText("@eververse2117", W / 2, H * 0.77);
  ctx.font = `600 ${minDim * 0.03}px ${EV_FONTS.sans}`;
  evSetTracking(ctx, minDim * 0.006);
  ctx.fillStyle = hexToRgba(pal.text, 0.8);
  ctx.fillText("EVERVERSE.ORG", W / 2, H * 0.85);
  evSetTracking(ctx, 0);
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

// CAPTIONS — big bold caption with one keyword highlighted in an accent box.
// The single most-reached format on TikTok / Reels (the CapCut caption look).
function drawLayoutCaptions({ ctx, W, H, pal, opts, font, minDim }) {
  const raw = (opts.text || "").trim();
  const family = EV_FONTS[font] || EV_FONTS.sans;
  const maxWidth = W - W * 0.09 * 2;
  ctx.direction = opts.rtl ? "rtl" : "ltr";
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  const upper = raw.toUpperCase();
  const fit = fitText(ctx, upper, maxWidth, H * 0.62, family, minDim * 0.092 * (opts.fontScale || 1), "800");
  ctx.font = `800 ${fit.size}px ${family}`;
  // keyword = the longest word, highlighted for emphasis
  let key = "";
  for (const w of raw.split(/\s+/)) { const c = w.replace(/[^A-Za-z0-9À-ɏ]/g, ""); if (c.length > key.length) key = c; }
  const keyUp = key.toUpperCase();
  const lh = fit.size * 1.12;
  const blockH = fit.lines.length * lh;
  let y = H * 0.46 - blockH / 2 + lh / 2;
  const padX = fit.size * 0.16, boxR = fit.size * 0.16;
  const spaceW = ctx.measureText(" ").width;
  const keyText = evReadableOn(pal.accent);
  for (const line of fit.lines) {
    const toks = line.split(" ");
    const ws = toks.map((t) => ctx.measureText(t).width);
    let total = spaceW * (toks.length - 1); ws.forEach((w) => (total += w));
    let x = W / 2 - total / 2;
    ctx.textAlign = "left";
    for (let i = 0; i < toks.length; i++) {
      const t = toks[i], w = ws[i];
      const isKey = keyUp.length >= 3 && t.replace(/[^A-Z0-9À-ɏ]/g, "") === keyUp;
      if (isKey) {
        evRoundRect(ctx, x - padX * 0.5, y - fit.size * 0.58, w + padX, fit.size * 1.16, boxR);
        ctx.fillStyle = hexToRgba(pal.accent, 0.95); ctx.fill();
        ctx.fillStyle = keyText; ctx.fillText(t, x, y);
      } else {
        ctx.fillStyle = pal.text;
        if (!pal.light) { ctx.shadowColor = "rgba(0,0,0,0.4)"; ctx.shadowBlur = fit.size * 0.1; }
        ctx.fillText(t, x, y);
        ctx.shadowColor = "transparent"; ctx.shadowBlur = 0;
      }
      x += w + spaceW;
    }
    y += lh;
  }
  ctx.textAlign = "center";
  if (opts.showRef !== false && opts.ref) {
    ctx.direction = "ltr"; ctx.textBaseline = "alphabetic";
    ctx.font = `700 ${minDim * 0.026}px ${EV_FONTS.sans}`;
    evSetTracking(ctx, minDim * 0.01);
    ctx.fillStyle = hexToRgba(pal.accent, 0.98);
    ctx.fillText((opts.ref || "").toUpperCase(), W / 2, y + minDim * 0.02);
    evSetTracking(ctx, 0);
  }
  if (opts.watermark) drawWatermark(ctx, W, H, pal, "center");
}

// CINEMATIC — elegant letter-spaced serif with a soft luminous glow and hairline
// rules. The "scripture at night" / stoic look that performs on dark palettes.
function drawLayoutCinematic({ ctx, W, H, pal, opts, font, minDim }) {
  const family = EV_FONTS[font] || EV_FONTS.serif;
  const maxWidth = W - W * 0.13 * 2;
  ctx.direction = opts.rtl ? "rtl" : "ltr";
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  const fit = fitText(ctx, opts.text || "", maxWidth, H * 0.46, family, minDim * 0.058 * (opts.fontScale || 1), "500");
  const lh = fit.size * 1.34;
  const blockH = fit.lines.length * lh;
  const y0 = H * 0.47 - blockH / 2 + lh / 2;
  ctx.font = `500 ${fit.size}px ${family}`;
  evSetTracking(ctx, fit.size * 0.02);
  // luminous glow pass
  ctx.save();
  ctx.shadowColor = hexToRgba(pal.accent, 0.55); ctx.shadowBlur = fit.size * 0.9;
  ctx.fillStyle = hexToRgba(pal.text, 0.001);
  let yg = y0; for (const l of fit.lines) { ctx.fillText(l, W / 2, yg); yg += lh; }
  ctx.restore();
  ctx.fillStyle = pal.text;
  let y = y0; for (const l of fit.lines) { ctx.fillText(l, W / 2, y); y += lh; }
  evSetTracking(ctx, 0);
  const topY = y0 - lh / 2 - minDim * 0.05, botY = y0 + blockH - lh / 2 + minDim * 0.05;
  ctx.strokeStyle = hexToRgba(pal.accent, 0.5); ctx.lineWidth = Math.max(1, minDim * 0.0016);
  ctx.beginPath(); ctx.moveTo(W / 2 - minDim * 0.1, topY); ctx.lineTo(W / 2 + minDim * 0.1, topY); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(W / 2 - minDim * 0.1, botY); ctx.lineTo(W / 2 + minDim * 0.1, botY); ctx.stroke();
  if (opts.showRef !== false && opts.ref) {
    ctx.direction = "ltr"; ctx.textBaseline = "alphabetic";
    ctx.font = `600 ${minDim * 0.023}px ${EV_FONTS.sans}`;
    evSetTracking(ctx, minDim * 0.014);
    ctx.fillStyle = hexToRgba(pal.accent, 0.9);
    ctx.fillText(opts.ref.toUpperCase(), W / 2, botY + minDim * 0.06);
    evSetTracking(ctx, 0);
  }
  if (opts.watermark) drawWatermark(ctx, W, H, pal, "center");
}

// SCRIPTURE — parchment-style verse card: ornament, serif body, dotted divider
// and an italic reference. Pairs beautifully with the Parchment / Linen art.
function drawLayoutScripture({ ctx, W, H, pal, opts, font, minDim }) {
  const family = EV_FONTS[font] || EV_FONTS.serif;
  const maxWidth = W - W * 0.14 * 2;
  ctx.direction = "ltr"; ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
  ctx.font = `${minDim * 0.05}px Georgia, "Times New Roman", serif`;
  ctx.fillStyle = hexToRgba(pal.accent, 0.85);
  ctx.fillText("❦", W / 2, H * 0.2);
  ctx.textBaseline = "middle"; ctx.direction = opts.rtl ? "rtl" : "ltr";
  const fit = fitText(ctx, opts.text || "", maxWidth, H * 0.44, family, minDim * 0.06 * (opts.fontScale || 1), "500");
  ctx.font = `500 ${fit.size}px ${family}`;
  ctx.fillStyle = pal.text;
  if (!pal.light) { ctx.shadowColor = "rgba(0,0,0,0.3)"; ctx.shadowBlur = fit.size * 0.1; }
  let y = H * 0.46 - (fit.lines.length * fit.lineHeight) / 2 + fit.lineHeight / 2;
  for (const l of fit.lines) { ctx.fillText(l, W / 2, y); y += fit.lineHeight; }
  ctx.shadowColor = "transparent"; ctx.shadowBlur = 0;
  ctx.fillStyle = hexToRgba(pal.accent, 0.8);
  for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.arc(W / 2 + i * minDim * 0.03, y + minDim * 0.02, Math.max(1.5, minDim * 0.004), 0, Math.PI * 2); ctx.fill(); }
  if (opts.showRef !== false && opts.ref) {
    ctx.direction = "ltr"; ctx.textBaseline = "alphabetic";
    ctx.font = `italic 600 ${minDim * 0.032}px ${family}`;
    ctx.fillStyle = hexToRgba(pal.accent, 0.95);
    ctx.fillText(opts.ref, W / 2, y + minDim * 0.075);
  }
  if (opts.watermark) drawWatermark(ctx, W, H, pal, "center");
}

// LOWER THIRD — reel-style caption in the lower third over a legibility scrim,
// with an accent bar. Always readable over any background; ideal for video art.
function drawLayoutLowerThird({ ctx, W, H, pal, opts, font, minDim }) {
  const family = EV_FONTS[font] || EV_FONTS.sans;
  const scrim = ctx.createLinearGradient(0, H * 0.45, 0, H);
  scrim.addColorStop(0, "rgba(0,0,0,0)");
  scrim.addColorStop(1, pal.light ? "rgba(40,28,12,0.6)" : "rgba(0,0,0,0.7)");
  ctx.fillStyle = scrim; ctx.fillRect(0, H * 0.45, W, H * 0.55);
  const padL = W * 0.08, maxWidth = W - padL * 2 - minDim * 0.03;
  ctx.direction = opts.rtl ? "rtl" : "ltr";
  ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
  const fit = fitText(ctx, opts.text || "", maxWidth, H * 0.3, family, minDim * 0.066 * (opts.fontScale || 1), "700");
  ctx.font = `700 ${fit.size}px ${family}`;
  const lh = fit.size * 1.16;
  const lastBaseline = H * 0.82;
  const firstBaseline = lastBaseline - (fit.lines.length - 1) * lh;
  const textX = padL + minDim * 0.03;
  ctx.fillStyle = hexToRgba(pal.accent, 0.95);
  ctx.fillRect(padL, firstBaseline - fit.size, Math.max(3, minDim * 0.008), (fit.lines.length - 1) * lh + fit.size * 1.2);
  if (opts.showRef !== false && opts.ref) {
    ctx.font = `700 ${minDim * 0.024}px ${EV_FONTS.sans}`;
    evSetTracking(ctx, minDim * 0.012);
    ctx.fillStyle = hexToRgba(pal.accent, 0.98);
    ctx.fillText(opts.ref.toUpperCase(), textX, firstBaseline - fit.size - minDim * 0.03);
    evSetTracking(ctx, 0);
  }
  ctx.font = `700 ${fit.size}px ${family}`;
  ctx.fillStyle = "#ffffff";
  let y = firstBaseline; for (const l of fit.lines) { ctx.fillText(l, textX, y); y += lh; }
  if (opts.watermark) drawWatermark(ctx, W, H, pal, "bottom-right");
}

// POSTCARD — a framed gallery card: double border, small-caps kicker, centred
// serif and an italic attribution. Premium, print-ready energy.
function drawLayoutPostcard({ ctx, W, H, pal, opts, font, kicker, minDim }) {
  const family = EV_FONTS[font] || EV_FONTS.serif;
  const m = minDim * 0.06, m2 = m + minDim * 0.02;
  ctx.strokeStyle = hexToRgba(pal.accent, 0.85); ctx.lineWidth = Math.max(1.5, minDim * 0.004);
  ctx.strokeRect(m, m, W - 2 * m, H - 2 * m);
  ctx.strokeStyle = hexToRgba(pal.text, 0.4); ctx.lineWidth = Math.max(1, minDim * 0.0016);
  ctx.strokeRect(m2, m2, W - 2 * m2, H - 2 * m2);
  ctx.direction = "ltr"; ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
  ctx.font = `700 ${minDim * 0.024}px ${EV_FONTS.sans}`;
  evSetTracking(ctx, minDim * 0.016);
  ctx.fillStyle = hexToRgba(pal.accent, 0.95);
  ctx.fillText((kicker || "EVERVERSE").toUpperCase(), W / 2, m2 + minDim * 0.075);
  evSetTracking(ctx, 0);
  ctx.textBaseline = "middle"; ctx.direction = opts.rtl ? "rtl" : "ltr";
  const fit = fitText(ctx, opts.text || "", W - m2 * 2 - minDim * 0.06, H * 0.44, family, minDim * 0.058 * (opts.fontScale || 1), "600");
  ctx.font = `600 ${fit.size}px ${family}`;
  ctx.fillStyle = pal.text;
  if (!pal.light) { ctx.shadowColor = "rgba(0,0,0,0.3)"; ctx.shadowBlur = fit.size * 0.1; }
  let y = H * 0.5 - (fit.lines.length * fit.lineHeight) / 2 + fit.lineHeight / 2;
  for (const l of fit.lines) { ctx.fillText(l, W / 2, y); y += fit.lineHeight; }
  ctx.shadowColor = "transparent"; ctx.shadowBlur = 0;
  if (opts.showRef !== false && opts.ref) {
    ctx.direction = "ltr"; ctx.textBaseline = "alphabetic";
    ctx.font = `italic 600 ${minDim * 0.03}px ${family}`;
    ctx.fillStyle = hexToRgba(pal.accent, 0.95);
    ctx.fillText("— " + opts.ref, W / 2, H - m2 - minDim * 0.055);
  }
}

// SPOTLIGHT — a soft dark scrim focuses the eye on centered bold white text,
// with the reference in an accent pill. Reads strongly on busy/bright art and
// pops in video; a natural fit for motivation & leadership posts.
function drawLayoutSpotlight({ ctx, W, H, pal, opts, font, minDim }) {
  const text = opts.text || "";
  const family = EV_FONTS[font] || EV_FONTS.sans;
  const maxWidth = W - W * 0.12 * 2;
  const showRef = opts.showRef !== false && opts.ref;
  const scrim = ctx.createRadialGradient(W * 0.5, H * 0.46, minDim * 0.1, W * 0.5, H * 0.5, W * 0.72);
  scrim.addColorStop(0, "rgba(0,0,0,0.44)");
  scrim.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = scrim; ctx.fillRect(0, 0, W, H);
  ctx.direction = opts.rtl ? "rtl" : "ltr";
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  const fit = fitText(ctx, text, maxWidth, H * (showRef ? 0.52 : 0.6), family, minDim * 0.088 * (opts.fontScale || 1), "800");
  ctx.font = `800 ${fit.size}px ${family}`;
  ctx.fillStyle = "#ffffff";
  ctx.shadowColor = "rgba(0,0,0,0.5)"; ctx.shadowBlur = fit.size * 0.12; ctx.shadowOffsetY = fit.size * 0.03;
  const lh = fit.size * 1.16;
  const blockH = fit.lines.length * lh;
  let y = H * 0.46 - blockH / 2 + lh / 2;
  for (const line of fit.lines) { ctx.fillText(line, W / 2, y); y += lh; }
  ctx.shadowColor = "transparent"; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
  if (showRef) {
    ctx.direction = "ltr"; ctx.textBaseline = "middle";
    const label = opts.ref.toUpperCase();
    const fs = minDim * 0.028;
    ctx.font = `700 ${fs}px ${EV_FONTS.sans}`;
    evSetTracking(ctx, minDim * 0.008);
    const padX = fs * 0.9, padY = fs * 0.55;
    const tw = ctx.measureText(label).width;
    const pillW = tw + padX * 2, pillH = fs + padY * 2;
    const px = W / 2 - pillW / 2, py = y + minDim * 0.02;
    ctx.fillStyle = hexToRgba(pal.accent, 0.95);
    evRoundRect(ctx, px, py, pillW, pillH, pillH / 2); ctx.fill();
    ctx.fillStyle = pal.light ? "#1a1a1a" : "#12131a";
    ctx.fillText(label, W / 2, py + pillH / 2);
    evSetTracking(ctx, 0);
  }
  if (opts.watermark) drawWatermark(ctx, W, H, pal, "center");
}

// BILLBOARD — huge bold type framed by an accent rule top and bottom, with the
// reference tracked-out beneath. Bold, sporty, poster-like; built to stop the
// scroll for motivation & leadership content.
function drawLayoutBillboard({ ctx, W, H, pal, opts, font, minDim }) {
  const text = opts.text || "";
  const family = EV_FONTS[font] || EV_FONTS.sans;
  const maxWidth = W - W * 0.11 * 2;
  const showRef = opts.showRef !== false && opts.ref;
  ctx.direction = opts.rtl ? "rtl" : "ltr";
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  const fit = fitText(ctx, text, maxWidth, H * 0.5, family, minDim * 0.096 * (opts.fontScale || 1), "800");
  ctx.font = `800 ${fit.size}px ${family}`;
  const lh = fit.size * 1.12;
  const blockH = fit.lines.length * lh;
  const midY = H * 0.47;
  let y = midY - blockH / 2 + lh / 2;
  ctx.fillStyle = pal.text;
  if (!pal.light) { ctx.shadowColor = "rgba(0,0,0,0.3)"; ctx.shadowBlur = fit.size * 0.1; }
  for (const line of fit.lines) { ctx.fillText(line, W / 2, y); y += lh; }
  ctx.shadowColor = "transparent"; ctx.shadowBlur = 0;
  // Accent rules top & bottom of the text block.
  const ruleW = Math.min(maxWidth, minDim * 0.5);
  const topRuleY = midY - blockH / 2 - minDim * 0.055;
  const botRuleY = midY + blockH / 2 + minDim * 0.05;
  ctx.strokeStyle = hexToRgba(pal.accent, 0.9);
  ctx.lineWidth = Math.max(2, minDim * 0.006);
  [topRuleY, botRuleY].forEach((ry) => {
    ctx.beginPath(); ctx.moveTo(W / 2 - ruleW / 2, ry); ctx.lineTo(W / 2 + ruleW / 2, ry); ctx.stroke();
  });
  if (showRef) {
    ctx.direction = "ltr"; ctx.textBaseline = "middle";
    ctx.font = `700 ${minDim * 0.03}px ${EV_FONTS.sans}`;
    evSetTracking(ctx, minDim * 0.014);
    ctx.fillStyle = hexToRgba(pal.accent, 0.95);
    ctx.fillText(opts.ref.toUpperCase(), W / 2, botRuleY + minDim * 0.055);
    evSetTracking(ctx, 0);
  }
  if (opts.watermark) drawWatermark(ctx, W, H, pal, "center");
}
