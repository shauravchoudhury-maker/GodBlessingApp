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

// opts: { text, ref, rtl, paletteKey, bgKey, watermark, showRef, fontScale }
function renderVerse(canvas, W, H, opts) {
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");
  const pal = THEME_PALETTES[opts.paletteKey] || THEME_PALETTES.warm;
  const seed = (opts.ref || opts.text || "seed").split("").reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 7);

  drawBackground(opts.bgKey || "gradient", ctx, W, H, pal, seed);

  const vig = ctx.createRadialGradient(W/2, H*0.46, Math.min(W,H)*0.2, W/2, H*0.5, Math.max(W,H)*0.75);
  vig.addColorStop(0, "rgba(0,0,0,0)");
  vig.addColorStop(1, "rgba(0,0,0,0.28)");
  ctx.fillStyle = vig; ctx.fillRect(0, 0, W, H);

  const text = opts.text || "";
  const minDim = Math.min(W, H);
  const padX = W * 0.10;
  const maxWidth = W - padX * 2;
  const showRef = opts.showRef !== false && opts.ref;
  const maxHeight = H * (showRef ? 0.54 : 0.64);
  const family = 'Georgia, "Times New Roman", serif';
  const startSize = minDim * 0.075 * (opts.fontScale || 1);

  ctx.direction = opts.rtl ? "rtl" : "ltr";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const fit = fitText(ctx, text, maxWidth, maxHeight, family, startSize, "600");
  ctx.font = `600 ${fit.size}px ${family}`;
  ctx.fillStyle = pal.text;
  ctx.shadowColor = "rgba(0,0,0,0.4)";
  ctx.shadowBlur = fit.size * 0.14;
  ctx.shadowOffsetY = fit.size * 0.04;

  const blockH = fit.lines.length * fit.lineHeight;
  const centerY = H * 0.46;
  let y = centerY - blockH / 2 + fit.lineHeight / 2;
  for (const line of fit.lines) { ctx.fillText(line, W / 2, y); y += fit.lineHeight; }
  ctx.shadowColor = "transparent"; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;

  const divY = y + fit.lineHeight * 0.05;
  ctx.strokeStyle = hexToRgba(pal.accent, 0.75);
  ctx.lineWidth = Math.max(1.5, W * 0.002);
  ctx.beginPath(); ctx.moveTo(W/2 - minDim*0.06, divY); ctx.lineTo(W/2 + minDim*0.06, divY); ctx.stroke();

  if (showRef) {
    ctx.direction = "ltr";
    ctx.font = `italic 600 ${minDim * 0.032}px ${family}`;
    ctx.fillStyle = pal.accent;
    ctx.fillText("— " + opts.ref, W / 2, divY + minDim * 0.05);
  }
  if (opts.watermark) {
    ctx.direction = "ltr";
    ctx.font = `600 ${minDim * 0.022}px "Segoe UI", sans-serif`;
    ctx.fillStyle = hexToRgba(pal.text, 0.72);
    ctx.textBaseline = "bottom";
    ctx.fillText("✦ EverVerse", W / 2, H - H * 0.04);
    ctx.textBaseline = "middle";
  }
}
