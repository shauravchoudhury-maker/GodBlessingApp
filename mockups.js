// mockups.js
// Listing images for the printable wall art pack — the pictures a buyer
// actually clicks on. Everything is drawn procedurally (generated walls,
// frames, light and shadow), so there are no stock photos and no licensing
// worries. Depends on: renderVerse, faithLabel, fitText.
//
// Etsy wants square listing images, 2000px+ on the long edge.

const MOCKUP_SCENES = [
  // wall: [top, bottom] gradient · frame: moulding · mat: card around the art
  { id: "oak-warm",    label: "Oak frame, warm wall",   wall: ["#f1e9dd", "#e0d4c2"], frame: "#b0834c", bevel: "#8a6539", mat: "#fcfaf6", floor: null },
  { id: "black-grey",  label: "Black frame, soft grey", wall: ["#ebebec", "#d9d9dc"], frame: "#1c1c1e", bevel: "#000000", mat: "#ffffff", floor: null },
  { id: "shelf-plant", label: "On a shelf, with plant", wall: ["#efeae2", "#ded5c8"], frame: "#2a2724", bevel: "#151312", mat: "#fdfbf7", floor: "#cbbda9" },
];

// Rounded rect helper (kept local so this file stands alone).
function _mkRound(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// Draws the artwork hanging in a generated room scene.
// ratio = { w, h } aspect of the print (defaults to 4:5).
function drawMockup(canvas, v, sceneId, W, H, artOpts, ratio) {
  const sc = MOCKUP_SCENES.find((s) => s.id === sceneId) || MOCKUP_SCENES[0];
  const r = ratio || { w: 4, h: 5 };
  const ar = r.w / r.h;
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");

  // ── Wall ──────────────────────────────────────────────────────────
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, sc.wall[0]); g.addColorStop(1, sc.wall[1]);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

  // Soft light wash from the upper left — sells the "photo" feel.
  const wash = ctx.createRadialGradient(W * 0.26, H * 0.14, 0, W * 0.26, H * 0.14, W * 0.95);
  wash.addColorStop(0, "rgba(255,255,255,0.42)");
  wash.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = wash; ctx.fillRect(0, 0, W, H);

  // Shelf/floor line for the ledge scene.
  const floorY = H * 0.80;
  if (sc.floor) {
    ctx.fillStyle = sc.floor; ctx.fillRect(0, floorY, W, H - floorY);
    ctx.fillStyle = "rgba(0,0,0,0.07)"; ctx.fillRect(0, floorY, W, H * 0.012);
  }

  // ── Frame geometry ────────────────────────────────────────────────
  const artH = sc.floor ? H * 0.52 : H * 0.60;
  const artW = artH * ar;
  const mat = artH * 0.065;
  const fw = artH * 0.032;
  const outerW = artW + 2 * mat + 2 * fw;
  const outerH = artH + 2 * mat + 2 * fw;
  const cx = W / 2;
  const outerY = sc.floor ? floorY - outerH : (H - outerH) / 2 - H * 0.02;
  const outerX = cx - outerW / 2;

  // Cast shadow.
  ctx.save();
  ctx.shadowColor = "rgba(40,32,24,0.30)";
  ctx.shadowBlur = W * 0.035;
  ctx.shadowOffsetY = W * 0.012;
  ctx.fillStyle = sc.frame;
  _mkRound(ctx, outerX, outerY, outerW, outerH, W * 0.004);
  ctx.fill();
  ctx.restore();

  // Frame inner bevel.
  ctx.strokeStyle = sc.bevel;
  ctx.lineWidth = Math.max(1, W * 0.0016);
  ctx.strokeRect(outerX + fw * 0.55, outerY + fw * 0.55, outerW - fw * 1.1, outerH - fw * 1.1);

  // Mat board.
  ctx.fillStyle = sc.mat;
  ctx.fillRect(outerX + fw, outerY + fw, outerW - 2 * fw, outerH - 2 * fw);
  // Mat inner shadow (depth where the mat meets the print).
  ctx.strokeStyle = "rgba(0,0,0,0.16)";
  ctx.lineWidth = Math.max(1, W * 0.0018);
  ctx.strokeRect(outerX + fw + mat, outerY + fw + mat, artW, artH);

  // ── The artwork itself ────────────────────────────────────────────
  const art = document.createElement("canvas");
  renderVerse(art, Math.round(artW * 2), Math.round(artH * 2), artOpts);
  ctx.drawImage(art, outerX + fw + mat, outerY + fw + mat, artW, artH);

  // Glass sheen — a soft diagonal highlight across the print.
  ctx.save();
  ctx.beginPath();
  ctx.rect(outerX + fw, outerY + fw, outerW - 2 * fw, outerH - 2 * fw);
  ctx.clip();
  const sheen = ctx.createLinearGradient(outerX, outerY, outerX + outerW * 0.85, outerY + outerH);
  sheen.addColorStop(0, "rgba(255,255,255,0.16)");
  sheen.addColorStop(0.42, "rgba(255,255,255,0.03)");
  sheen.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = sheen;
  ctx.fillRect(outerX, outerY, outerW, outerH);
  ctx.restore();

  // A simple potted plant beside the ledge — abstract, tasteful.
  if (sc.floor) _mkPlant(ctx, W, H, outerX, floorY);

  return canvas;
}

// A simple potted plant: tapered leaf blades rising from a terracotta pot.
// Leaves are drawn as two mirrored curves so they taper to a point rather
// than reading as straight sticks.
function _mkPlant(ctx, W, H, frameX, floorY) {
  const px = Math.max(W * 0.115, frameX - W * 0.135);
  const potW = W * 0.085, potH = H * 0.072;
  const potY = floorY - potH;
  const base = potY + potH * 0.06;

  // Leaves first, so the pot overlaps their bases.
  const leaves = [
    { lean: -1.30, up: 1.9, w: 0.15, col: "#4e6b46" },
    { lean: -0.62, up: 2.5, w: 0.17, col: "#5c7f51" },
    { lean:  0.04, up: 2.9, w: 0.18, col: "#6a8f5c" },
    { lean:  0.68, up: 2.4, w: 0.17, col: "#5c7f51" },
    { lean:  1.32, up: 1.8, w: 0.15, col: "#4e6b46" },
  ];
  for (const lf of leaves) {
    const tipX = px + potW * lf.lean, tipY = base - potH * lf.up;
    const midX = px + potW * lf.lean * 0.42, midY = base - potH * lf.up * 0.55;
    const bw = potW * lf.w;
    ctx.fillStyle = lf.col;
    ctx.beginPath();
    ctx.moveTo(px, base);
    ctx.quadraticCurveTo(midX - bw, midY, tipX, tipY);
    ctx.quadraticCurveTo(midX + bw, midY, px, base);
    ctx.fill();
  }

  // Terracotta pot, tapered, with a rim.
  ctx.save();
  ctx.shadowColor = "rgba(40,32,24,0.22)"; ctx.shadowBlur = W * 0.018; ctx.shadowOffsetY = W * 0.005;
  ctx.fillStyle = "#b06a45";
  ctx.beginPath();
  ctx.moveTo(px - potW / 2, potY);
  ctx.lineTo(px + potW / 2, potY);
  ctx.lineTo(px + potW * 0.34, floorY);
  ctx.lineTo(px - potW * 0.34, floorY);
  ctx.closePath(); ctx.fill();
  ctx.restore();
  ctx.fillStyle = "#9c5a39";
  ctx.fillRect(px - potW / 2, potY, potW, potH * 0.17);
  ctx.fillStyle = "rgba(0,0,0,0.12)";
  ctx.fillRect(px - potW / 2, potY + potH * 0.17, potW, potH * 0.04);
}

// "What you get" — the size chart buyers look for on a printable listing.
function drawSizeChart(canvas, v, W, H, ratios) {
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");
  const rs = ratios || (typeof PRINT_RATIOS !== "undefined" ? PRINT_RATIOS : []);
  const SERIF = '"Georgia","Times New Roman",serif';
  const SANS = '"Helvetica Neue",Arial,sans-serif';

  ctx.fillStyle = "#f6f1e8"; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#2f2a24";
  ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
  ctx.font = `600 ${W * 0.052}px ${SERIF}`;
  ctx.fillText("What you get", W / 2, H * 0.105);
  ctx.font = `${W * 0.024}px ${SANS}`;
  ctx.fillStyle = "#6b6055";
  ctx.fillText(`${rs.length} print ratios · ~300 DPI · instant download`, W / 2, H * 0.152);

  // Ratio rectangles at a common height — scaled down if the row would
  // otherwise run past the edges of the canvas.
  const bandTop = H * 0.21;
  const gap = W * 0.018;
  const availW = W * 0.88;
  const sumAr = rs.reduce((a, r) => a + r.w / r.h, 0) || 1;
  const bandH = Math.min(H * 0.44, (availW - gap * (rs.length - 1)) / sumAr);
  const totalW = bandH * sumAr + gap * (rs.length - 1);
  let x = (W - totalW) / 2;
  ctx.textAlign = "center";
  for (const r of rs) {
    const w = bandH * (r.w / r.h);
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#c9bcab";
    ctx.lineWidth = Math.max(1, W * 0.0016);
    ctx.fillRect(x, bandTop, w, bandH);
    ctx.strokeRect(x, bandTop, w, bandH);
    ctx.fillStyle = "#8a7c6c";
    ctx.font = `600 ${W * 0.021}px ${SANS}`;
    ctx.fillText(r.id.replace("_", " "), x + w / 2, bandTop + bandH / 2);
    x += w + gap;
  }

  // Frame sizes each ratio covers — sits just under the row, so the layout
  // stays balanced however far the row had to scale down.
  ctx.textAlign = "left";
  ctx.fillStyle = "#4a4038";
  const lh = H * 0.038;
  let y = Math.min(bandTop + bandH + H * 0.10, H * 0.94 - lh * rs.length);
  ctx.font = `${W * 0.019}px ${SANS}`;
  for (const r of rs) {
    ctx.fillStyle = "#2f2a24";
    ctx.font = `600 ${W * 0.019}px ${SANS}`;
    ctx.fillText(r.id.replace("_", " "), W * 0.11, y);
    ctx.fillStyle = "#6b6055";
    ctx.font = `${W * 0.019}px ${SANS}`;
    ctx.fillText(r.fits, W * 0.24, y);
    y += lh;
  }

  ctx.textAlign = "center";
  ctx.fillStyle = "#8a7c6c";
  ctx.font = `${W * 0.018}px ${SANS}`;
  ctx.fillText("Digital download — no physical item is shipped", W / 2, H * 0.965);
  return canvas;
}

// A plain info card: sets expectations, cuts "is this physical?" messages.
function drawInfoCard(canvas, v, W, H) {
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");
  const SERIF = '"Georgia","Times New Roman",serif';
  const SANS = '"Helvetica Neue",Arial,sans-serif';
  const faith = (typeof faithLabel === "function") ? faithLabel(v.faith) : v.faith;

  ctx.fillStyle = "#20201f"; ctx.fillRect(0, 0, W, H);
  const glow = ctx.createRadialGradient(W / 2, H * 0.34, 0, W / 2, H * 0.34, W * 0.8);
  glow.addColorStop(0, "rgba(214,183,122,0.20)");
  glow.addColorStop(1, "rgba(214,183,122,0)");
  ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);

  ctx.textAlign = "center";
  ctx.fillStyle = "#d6b77a";
  ctx.font = `${W * 0.05}px ${SERIF}`;
  ctx.fillText("✦", W / 2, H * 0.20);

  ctx.fillStyle = "#f4efe6";
  ctx.font = `600 ${W * 0.048}px ${SERIF}`;
  ctx.fillText("Instant digital download", W / 2, H * 0.32);

  ctx.fillStyle = "#b9b2a6";
  ctx.font = `${W * 0.024}px ${SANS}`;
  ctx.fillText(`${v.ref} · ${faith}`, W / 2, H * 0.385);

  const lines = [
    "6 print ratios in one download",
    "~300 DPI — print at home or a print shop",
    "Frames from 5x7 up to 24x36 in & A1",
    "Files arrive the moment you buy",
    "No physical item is shipped",
  ];
  ctx.font = `${W * 0.026}px ${SANS}`;
  let y = H * 0.50;
  for (const l of lines) {
    ctx.fillStyle = "#d6b77a"; ctx.textAlign = "left";
    ctx.fillText("·", W * 0.20, y);
    ctx.fillStyle = "#e8e2d7";
    ctx.fillText(l, W * 0.24, y);
    y += H * 0.072;
  }

  ctx.textAlign = "center";
  ctx.fillStyle = "#8b8478";
  ctx.font = `${W * 0.019}px ${SANS}`;
  ctx.fillText("EverVerse · eververse.org", W / 2, H * 0.945);
  return canvas;
}

// ── Pinterest pin (2:3 vertical, 1000x1500) ──────────────────────────
// The curated art fills the pin; a soft bottom scrim carries a clear
// "buyable printable" call-to-action so it reads as a product pin.
// artOptsFor: (v) => renderVerse options (e.g. collectionArtOpts).
function drawPin(canvas, v, head, artOpts, W, H) {
  W = W || 1000; H = H || 1500;
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");
  const SANS = '"Helvetica Neue",Arial,sans-serif';
  const SERIF = '"Georgia","Times New Roman",serif';

  // Full-bleed art — no ref/watermark; the CTA band carries the branding.
  const art = document.createElement("canvas");
  renderVerse(art, W, H, Object.assign({}, artOpts, { watermark: false, showRef: false }));
  ctx.drawImage(art, 0, 0, W, H);

  // Bottom scrim so the call-to-action always reads.
  const g = ctx.createLinearGradient(0, H * 0.60, 0, H);
  g.addColorStop(0, "rgba(15,12,10,0)");
  g.addColorStop(0.55, "rgba(15,12,10,0.45)");
  g.addColorStop(1, "rgba(15,12,10,0.80)");
  ctx.fillStyle = g;
  ctx.fillRect(0, H * 0.60, W, H * 0.40);

  ctx.textAlign = "center";
  // Title hook
  ctx.fillStyle = "rgba(255,255,255,0.97)";
  ctx.font = `600 ${W * 0.058}px ${SERIF}`;
  ctx.fillText(head, W / 2, H * 0.865);
  // Reference
  ctx.fillStyle = "rgba(255,255,255,0.82)";
  ctx.font = `italic ${W * 0.030}px ${SERIF}`;
  ctx.fillText("— " + v.ref, W / 2, H * 0.900);
  // Call to action (tracked)
  try { ctx.letterSpacing = (W * 0.004) + "px"; } catch (e) {}
  ctx.fillStyle = "rgba(255,255,255,0.94)";
  ctx.font = `600 ${W * 0.027}px ${SANS}`;
  ctx.fillText("PRINTABLE WALL ART · INSTANT DOWNLOAD", W / 2, H * 0.945);
  try { ctx.letterSpacing = "0px"; } catch (e) {}
  ctx.fillStyle = "rgba(255,255,255,0.62)";
  ctx.font = `${W * 0.023}px ${SANS}`;
  ctx.fillText("6 sizes · print any size · eververse.org", W / 2, H * 0.974);
  return canvas;
}
