// ecards.js
// Turns a verse into (1) a greeting eCard for an occasion, and (2) print-ready
// merch artwork (posters, apparel, stickers, mugs) to upload to Canva / Printful
// / Redbubble / Society6. Depends on: drawBackground, addGrain, THEME_PALETTES,
// fitText, hexToRgba, bgForVerseApp.

const ECARD_OCCASIONS = [
  { id: "encouragement", label: "Encouragement", greeting: "Thinking of You", sub: "and cheering you on" },
  { id: "comfort", label: "Comfort & Sympathy", greeting: "With You in This", sub: "holding you gently" },
  { id: "getwell", label: "Get Well Soon", greeting: "Get Well Soon", sub: "wishing you healing and strength" },
  { id: "birthday", label: "Birthday", greeting: "Happy Birthday", sub: "may this year be full of grace" },
  { id: "thankyou", label: "Thank You", greeting: "Thank You", sub: "with a grateful heart" },
  { id: "congrats", label: "Congratulations", greeting: "Congratulations", sub: "celebrating you today" },
  { id: "newbaby", label: "New Baby", greeting: "Welcome, Little One", sub: "a new blessing has arrived" },
  { id: "wedding", label: "Wedding", greeting: "Congratulations", sub: "wishing you a love that lasts" },
  { id: "christmas", label: "Christmas", greeting: "Merry Christmas", sub: "peace and joy to you" },
  { id: "easter", label: "Easter", greeting: "Happy Easter", sub: "hope is renewed" },
  { id: "diwali", label: "Diwali", greeting: "Happy Diwali", sub: "may your light shine bright" },
  { id: "eid", label: "Eid", greeting: "Eid Mubarak", sub: "blessings to you and yours" },
  { id: "newyear", label: "New Year", greeting: "Happy New Year", sub: "a fresh page, a new grace" },
  { id: "blessing", label: "Just a Blessing", greeting: "A Little Blessing", sub: "sent your way" },
];
function ecardOccasion(id) { return ECARD_OCCASIONS.find((o) => o.id === id) || ECARD_OCCASIONS[0]; }

// Card design templates (Canva-style). Any works with any occasion + verse.
const ECARD_DESIGNS = [
  { id: "classic", label: "Classic (art)" },
  { id: "postcard", label: "Postcard (split)" },
  { id: "framed", label: "Framed stationery" },
  { id: "minimal", label: "Minimal" },
  { id: "bold", label: "Bold modern" },
  { id: "vintage", label: "Vintage paper" },
];

const SERIF = 'Georgia, "Times New Roman", serif';
const SANS = '"Helvetica Neue", "Segoe UI", Arial, sans-serif';
function _ecFooter(ctx, W, H, color) {
  const m = Math.min(W, H) * 0.021;
  ctx.save(); ctx.textAlign = "center"; ctx.textBaseline = "bottom"; ctx.direction = "ltr";
  ctx.font = `600 ${m}px ${SANS}`; ctx.fillStyle = color;
  ctx.fillText("✦ EverVerse · eververse.org", W / 2, H - H * 0.035); ctx.restore();
}
function _ecVerseBlock(ctx, v, W, cx, midY, maxW, maxH, size, weight, color, family, shadow) {
  const fit = fitText(ctx, v.text, maxW, maxH, family, size, weight);
  ctx.font = `${weight} ${fit.size}px ${family}`; ctx.fillStyle = color; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  if (shadow) { ctx.shadowColor = "rgba(0,0,0,0.4)"; ctx.shadowBlur = fit.size * 0.14; }
  let y = midY - (fit.lines.length * fit.lineHeight) / 2 + fit.lineHeight / 2;
  for (const ln of fit.lines) { ctx.fillText(ln, cx, y); y += fit.lineHeight; }
  ctx.shadowColor = "transparent"; ctx.shadowBlur = 0;
  return y;
}

// Dispatcher.
function drawEcard(canvas, v, occasionId, W, H, opts) {
  opts = opts || {};
  const occ = ecardOccasion(occasionId);
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");
  const pal = (typeof THEME_PALETTES !== "undefined" && THEME_PALETTES[v.theme]) || THEME_PALETTES.warm;
  const seed = (v.ref || "card").split("").reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 7) >>> 0;
  const minDim = Math.min(W, H);
  const arg = { ctx, v, occ, W, H, pal, seed, opts, minDim };
  const fn = {
    classic: _ecClassic, postcard: _ecPostcard, framed: _ecFramed,
    minimal: _ecMinimal, bold: _ecBold, vintage: _ecVintage,
  }[opts.design] || _ecClassic;
  fn(arg);
}

function _ecClassic({ ctx, v, occ, W, H, pal, seed, opts, minDim }) {
  drawBackground((typeof bgForVerseApp === "function" ? bgForVerseApp(v) : "aura"), ctx, W, H, pal, seed);
  const vig = ctx.createRadialGradient(W / 2, H * 0.5, minDim * 0.2, W / 2, H * 0.5, Math.max(W, H) * 0.8);
  if (pal.light) { vig.addColorStop(0, "rgba(255,255,255,0.08)"); vig.addColorStop(1, "rgba(120,90,50,0.16)"); }
  else { vig.addColorStop(0, "rgba(0,0,0,0)"); vig.addColorStop(1, "rgba(0,0,0,0.34)"); }
  ctx.fillStyle = vig; ctx.fillRect(0, 0, W, H);
  if (typeof addGrain === "function") addGrain(ctx, W, H, seed, 0.06);
  ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.direction = "ltr";
  ctx.fillStyle = pal.text;
  if (!pal.light) { ctx.shadowColor = "rgba(0,0,0,0.35)"; ctx.shadowBlur = minDim * 0.02; }
  ctx.font = `700 ${minDim * 0.072}px ${SERIF}`; ctx.fillText(occ.greeting, W / 2, H * 0.15);
  ctx.font = `italic 400 ${minDim * 0.034}px ${SERIF}`; ctx.fillStyle = hexToRgba(pal.accent, 0.95);
  ctx.fillText(opts.to ? ("For " + opts.to) : occ.sub, W / 2, H * 0.225);
  ctx.shadowColor = "transparent"; ctx.shadowBlur = 0;
  ctx.strokeStyle = hexToRgba(pal.accent, 0.6); ctx.lineWidth = Math.max(1.5, W * 0.003);
  ctx.beginPath(); ctx.moveTo(W / 2 - minDim * 0.08, H * 0.285); ctx.lineTo(W / 2 + minDim * 0.08, H * 0.285); ctx.stroke();
  const y = _ecVerseBlock(ctx, v, W, W / 2, H * 0.52, W - W * 0.13 * 2, H * 0.34, minDim * 0.058, "500", pal.text, SERIF, !pal.light);
  ctx.font = `italic 600 ${minDim * 0.03}px ${SERIF}`; ctx.fillStyle = hexToRgba(pal.accent, 0.95);
  ctx.fillText("— " + v.ref, W / 2, y + minDim * 0.03);
  if (opts.from) { ctx.font = `italic 400 ${minDim * 0.03}px ${SERIF}`; ctx.fillStyle = pal.text; ctx.fillText("with love, " + opts.from, W / 2, H * 0.83); }
  _ecFooter(ctx, W, H, hexToRgba(pal.text, 0.72));
}

function _ecPostcard({ ctx, v, occ, W, H, pal, seed, opts, minDim }) {
  const splitY = H * 0.6;
  // Top: art with the verse
  drawBackground((typeof bgForVerseApp === "function" ? bgForVerseApp(v) : "aura"), ctx, W, H, pal, seed);
  ctx.fillStyle = "rgba(0,0,0,0.28)"; ctx.fillRect(0, 0, W, splitY);
  if (typeof addGrain === "function") addGrain(ctx, W, H, seed, 0.05);
  const y = _ecVerseBlock(ctx, v, W, W / 2, splitY * 0.5, W - W * 0.12 * 2, splitY * 0.6, minDim * 0.055, "500", "#fff", SERIF, true);
  ctx.textAlign = "center"; ctx.font = `italic 600 ${minDim * 0.028}px ${SERIF}`; ctx.fillStyle = hexToRgba(pal.accent, 0.98);
  ctx.fillText("— " + v.ref, W / 2, Math.min(y + minDim * 0.03, splitY - minDim * 0.03));
  // Bottom: cream band with the greeting
  ctx.fillStyle = "#f6f0e4"; ctx.fillRect(0, splitY, W, H - splitY);
  ctx.fillStyle = hexToRgba(pal.accent, 1); ctx.fillRect(0, splitY, W, Math.max(3, H * 0.006));
  const ink = "#3a3226";
  ctx.textBaseline = "middle"; ctx.fillStyle = ink;
  ctx.font = `700 ${minDim * 0.06}px ${SERIF}`; ctx.fillText(occ.greeting, W / 2, splitY + (H - splitY) * 0.32);
  ctx.font = `italic 400 ${minDim * 0.032}px ${SERIF}`; ctx.fillStyle = shade(pal.accent, -40);
  ctx.fillText(opts.to ? ("For " + opts.to) : occ.sub, W / 2, splitY + (H - splitY) * 0.55);
  if (opts.from) { ctx.font = `italic 400 ${minDim * 0.028}px ${SERIF}`; ctx.fillStyle = ink; ctx.fillText("with love, " + opts.from, W / 2, splitY + (H - splitY) * 0.72); }
  _ecFooter(ctx, W, H, hexToRgba("#3a3226", 0.65));
}

function _ecFramed({ ctx, v, occ, W, H, pal, seed, opts, minDim }) {
  ctx.fillStyle = "#f7f2e8"; ctx.fillRect(0, 0, W, H);
  if (typeof addGrain === "function") addGrain(ctx, W, H, seed, 0.05);
  const ink = shade(pal.stops[1], -20), acc = pal.accent;
  // double frame
  ctx.strokeStyle = acc; ctx.lineWidth = Math.max(2, W * 0.006);
  ctx.strokeRect(W * 0.07, H * 0.06, W * 0.86, H * 0.88);
  ctx.lineWidth = Math.max(1, W * 0.002);
  ctx.strokeRect(W * 0.09, H * 0.075, W * 0.82, H * 0.85);
  ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.direction = "ltr";
  ctx.fillStyle = acc; ctx.font = `${minDim * 0.05}px ${SERIF}`; ctx.fillText("✦", W / 2, H * 0.17);
  ctx.fillStyle = ink; ctx.font = `700 ${minDim * 0.06}px ${SERIF}`; ctx.fillText(occ.greeting, W / 2, H * 0.25);
  ctx.font = `italic 400 ${minDim * 0.03}px ${SERIF}`; ctx.fillStyle = shade(acc, -30);
  ctx.fillText(opts.to ? ("For " + opts.to) : occ.sub, W / 2, H * 0.31);
  const y = _ecVerseBlock(ctx, v, W, W / 2, H * 0.53, W - W * 0.2 * 2, H * 0.3, minDim * 0.052, "500", ink, SERIF, false);
  ctx.font = `italic 600 ${minDim * 0.028}px ${SERIF}`; ctx.fillStyle = shade(acc, -30);
  ctx.fillText("— " + v.ref, W / 2, y + minDim * 0.03);
  if (opts.from) { ctx.font = `italic 400 ${minDim * 0.028}px ${SERIF}`; ctx.fillStyle = ink; ctx.fillText("with love, " + opts.from, W / 2, H * 0.86); }
  _ecFooter(ctx, W, H, hexToRgba("#4a4030", 0.6));
}

function _ecMinimal({ ctx, v, occ, W, H, pal, seed, opts, minDim }) {
  ctx.fillStyle = "#faf7f1"; ctx.fillRect(0, 0, W, H);
  const acc = pal.accent, ink = "#2b2622";
  ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.direction = "ltr";
  ctx.font = `600 ${minDim * 0.026}px ${SANS}`; ctx.fillStyle = shade(acc, -20);
  try { ctx.letterSpacing = (minDim * 0.012) + "px"; } catch (e) {}
  ctx.fillText((opts.to ? ("FOR " + opts.to) : occ.greeting).toUpperCase(), W / 2, H * 0.2);
  try { ctx.letterSpacing = "0px"; } catch (e) {}
  ctx.strokeStyle = hexToRgba(acc, 0.55); ctx.lineWidth = Math.max(1, W * 0.0016);
  ctx.beginPath(); ctx.moveTo(W / 2 - minDim * 0.04, H * 0.27); ctx.lineTo(W / 2 + minDim * 0.04, H * 0.27); ctx.stroke();
  const y = _ecVerseBlock(ctx, v, W, W / 2, H * 0.5, W - W * 0.16 * 2, H * 0.4, minDim * 0.05, "400", ink, SERIF, false);
  ctx.font = `italic 500 ${minDim * 0.028}px ${SERIF}`; ctx.fillStyle = shade(acc, -20);
  ctx.fillText("— " + v.ref, W / 2, y + minDim * 0.04);
  _ecFooter(ctx, W, H, hexToRgba("#2b2622", 0.5));
}

function _ecBold({ ctx, v, occ, W, H, pal, seed, opts, minDim }) {
  drawBackground("aura", ctx, W, H, pal, seed);
  ctx.fillStyle = pal.light ? "rgba(60,40,20,0.25)" : "rgba(0,0,0,0.45)"; ctx.fillRect(0, 0, W, H);
  if (typeof addGrain === "function") addGrain(ctx, W, H, seed, 0.07);
  ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.direction = "ltr";
  ctx.fillStyle = "#fff"; ctx.shadowColor = "rgba(0,0,0,0.3)"; ctx.shadowBlur = minDim * 0.02;
  const gfit = fitText(ctx, (opts.to ? occ.greeting + ", " + opts.to : occ.greeting).toUpperCase(), W - W * 0.1 * 2, H * 0.22, SANS, minDim * 0.088, "800");
  ctx.font = `800 ${gfit.size}px ${SANS}`;
  let gy = H * 0.2 - (gfit.lines.length * gfit.lineHeight) / 2 + gfit.lineHeight / 2;
  for (const ln of gfit.lines) { ctx.fillText(ln, W / 2, gy); gy += gfit.lineHeight; }
  ctx.shadowColor = "transparent"; ctx.shadowBlur = 0;
  ctx.fillStyle = hexToRgba(pal.accent, 1); ctx.fillRect(W / 2 - minDim * 0.06, H * 0.36, minDim * 0.12, Math.max(3, W * 0.007));
  const y = _ecVerseBlock(ctx, v, W, W / 2, H * 0.58, W - W * 0.11 * 2, H * 0.34, minDim * 0.056, "600", "#fff", SANS, true);
  ctx.font = `700 ${minDim * 0.026}px ${SANS}`; ctx.fillStyle = hexToRgba(pal.accent, 0.98);
  try { ctx.letterSpacing = (minDim * 0.008) + "px"; } catch (e) {}
  ctx.fillText(v.ref.toUpperCase(), W / 2, y + minDim * 0.035);
  try { ctx.letterSpacing = "0px"; } catch (e) {}
  _ecFooter(ctx, W, H, hexToRgba("#ffffff", 0.72));
}

function _ecVintage({ ctx, v, occ, W, H, pal, seed, opts, minDim }) {
  ctx.fillStyle = "#efe6d2"; ctx.fillRect(0, 0, W, H);
  const vg = ctx.createRadialGradient(W / 2, H / 2, minDim * 0.2, W / 2, H / 2, Math.max(W, H) * 0.75);
  vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(90,60,25,0.35)");
  ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  if (typeof addGrain === "function") addGrain(ctx, W, H, seed, 0.12);
  const ink = "#4a3826", acc = "#8a5a2c";
  ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.direction = "ltr";
  ctx.fillStyle = acc; ctx.font = `${minDim * 0.05}px ${SERIF}`; ctx.fillText("✦", W / 2, H * 0.16);
  ctx.fillStyle = ink; ctx.font = `italic 700 ${minDim * 0.062}px ${SERIF}`; ctx.fillText(occ.greeting, W / 2, H * 0.25);
  // ornamental divider
  ctx.strokeStyle = acc; ctx.lineWidth = Math.max(1, W * 0.002);
  ctx.beginPath(); ctx.moveTo(W / 2 - minDim * 0.1, H * 0.31); ctx.lineTo(W / 2 - minDim * 0.02, H * 0.31); ctx.moveTo(W / 2 + minDim * 0.02, H * 0.31); ctx.lineTo(W / 2 + minDim * 0.1, H * 0.31); ctx.stroke();
  ctx.font = `${minDim * 0.028}px ${SERIF}`; ctx.fillStyle = acc; ctx.fillText("✦", W / 2, H * 0.31);
  const y = _ecVerseBlock(ctx, v, W, W / 2, H * 0.54, W - W * 0.16 * 2, H * 0.32, minDim * 0.05, "400", ink, SERIF, false);
  ctx.font = `italic 600 ${minDim * 0.03}px ${SERIF}`; ctx.fillStyle = acc;
  ctx.fillText("— " + v.ref, W / 2, y + minDim * 0.035);
  if (opts.from) { ctx.font = `italic 400 ${minDim * 0.028}px ${SERIF}`; ctx.fillStyle = ink; ctx.fillText("with love, " + opts.from, W / 2, H * 0.85); }
  _ecFooter(ctx, W, H, hexToRgba("#4a3826", 0.6));
}

// Transparent print design for apparel / stickers / totes / mugs — text + mark
// in a single print colour, no background (so it prints clean on fabric).
function drawPrintDesign(canvas, v, W, H, opts) {
  opts = opts || {};
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, W, H); // transparent
  const col = opts.color || "#161616";
  const minDim = Math.min(W, H);
  const family = 'Georgia, "Times New Roman", serif';
  ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillStyle = col; ctx.strokeStyle = col;
  ctx.font = `${minDim * 0.085}px Georgia, serif`;
  ctx.fillText("✦", W / 2, H * 0.19);
  const fit = fitText(ctx, v.text, W - W * 0.09 * 2, H * 0.44, family, minDim * 0.08, "600");
  ctx.font = `600 ${fit.size}px ${family}`;
  let y = H * 0.5 - (fit.lines.length * fit.lineHeight) / 2 + fit.lineHeight / 2;
  for (const ln of fit.lines) { ctx.fillText(ln, W / 2, y); y += fit.lineHeight; }
  ctx.font = `italic 600 ${minDim * 0.032}px ${family}`;
  ctx.fillText("— " + v.ref, W / 2, y + minDim * 0.045);
  ctx.lineWidth = Math.max(2, W * 0.004);
  ctx.beginPath(); ctx.moveTo(W / 2 - minDim * 0.06, H * 0.85); ctx.lineTo(W / 2 + minDim * 0.06, H * 0.85); ctx.stroke();
}

const MERCH_README =
`EverVerse — print-ready merch pack
==================================
Everything here is generated from one verse, ready to upload to a
print-on-demand (POD) service or Canva. You never hold stock — the POD
prints and ships when someone orders.

Files
-----
- poster-portrait.jpg  (2400x3600, ~200-300 DPI)  → posters, art prints, greeting cards
- print-square.jpg     (2400x2400)                → square prints, cards, album/social
- wallpaper-phone.jpg  (1080x2340)                → phone wallpaper freebie / lead magnet
- apparel-dark.png     (transparent, dark ink)    → light T-shirts, totes, mugs, stickers
- apparel-light.png    (transparent, white ink)   → dark T-shirts, hoodies, mugs
Need just the printable wall art at every frame size? Use the
"Printable wall art pack" button — it exports all standard ratios at once.

Where to upload
---------------
- Printful / Printify  → connect to Etsy, Shopify, or sell direct. Best margins & control.
- Redbubble / Society6 / TeePublic → marketplace; they handle everything, lower margins.
- Canva → upload the JPG/PNG, drop into their templates, and use Canva Print.
- Amazon Merch on Demand → apparel (needs approval).

Apparel tip: use apparel-dark.png on light garments and apparel-light.png on
dark garments. The transparent background means only the words print.

Linking your books
-------------------
Add your ebook / audiobook link (Amazon, Gumroad, Spotify) to the product
description, and/or print a small QR code on the design once the book is live.
(Ask EverVerse to add an on-design QR when your product URLs are ready.)`;

// ── Printable wall art: standard Etsy aspect-ratio bundle ─────────────
// Each ratio, rendered here at ~300 DPI on the long edge, covers a whole
// family of standard frame sizes. The buyer downloads once and prints the
// file whose ratio matches their frame — at home or a print shop, any size.
const PRINT_RATIOS = [
  { id: "2x3",   w: 2,  h: 3,          fits: "4x6, 8x12, 12x18, 16x24, 20x30, 24x36 in" },
  { id: "3x4",   w: 3,  h: 4,          fits: "6x8, 9x12, 12x16, 18x24 in" },
  { id: "4x5",   w: 4,  h: 5,          fits: "8x10, 16x20, 24x30 in" },
  { id: "11x14", w: 11, h: 14,         fits: "11x14, 22x28 in (popular US frames)" },
  { id: "5x7",   w: 5,  h: 7,          fits: "5x7, 10x14 in (small prints & cards)" },
  { id: "ISO_A", w: 1,  h: 1.4142136,  fits: "A5, A4, A3, A2, A1 (international)" },
];
