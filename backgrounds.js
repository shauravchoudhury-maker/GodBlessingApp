// backgrounds.js
// Original, procedurally-drawn background scenes. Because they are generated
// from code (no external photos), they are royalty-free by construction and
// export safely — no CORS taint, works fully offline.
//
// Every scene is a deterministic function of (ctx, W, H, palette, seed) so the
// same verse always renders the same art.

// Tiny seeded PRNG (mulberry32) for repeatable "randomness".
function makeRng(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shade(hex, amt) {
  const h = hex.replace("#", "");
  const n = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  let r = parseInt(n.slice(0, 2), 16), g = parseInt(n.slice(2, 4), 16), b = parseInt(n.slice(4, 6), 16);
  r = Math.max(0, Math.min(255, r + amt));
  g = Math.max(0, Math.min(255, g + amt));
  b = Math.max(0, Math.min(255, b + amt));
  return `rgb(${r},${g},${b})`;
}
function rgba(hex, a) {
  const h = hex.replace("#", "");
  const n = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  return `rgba(${parseInt(n.slice(0, 2), 16)},${parseInt(n.slice(2, 4), 16)},${parseInt(n.slice(4, 6), 16)},${a})`;
}

function baseGradient(ctx, W, H, pal) {
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, pal.stops[0]);
  g.addColorStop(1, pal.stops[1]);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

/* ------------------------------ Scenes ------------------------------ */

function sceneGradient(ctx, W, H, pal) {
  baseGradient(ctx, W, H, pal);
  const glow = ctx.createRadialGradient(W * 0.5, H * 0.34, 0, W * 0.5, H * 0.34, W * 0.75);
  glow.addColorStop(0, "rgba(255,255,255,0.16)");
  glow.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);
}

function sceneSunrise(ctx, W, H, pal, seed) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, shade(pal.stops[0], 20));
  g.addColorStop(0.55, pal.stops[0]);
  g.addColorStop(1, pal.stops[1]);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // Sun
  const cx = W * 0.5, cy = H * 0.44, r = W * 0.16;
  const sun = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 2.6);
  sun.addColorStop(0, rgba(pal.accent, 0.95));
  sun.addColorStop(0.25, rgba(pal.accent, 0.45));
  sun.addColorStop(1, rgba(pal.accent, 0));
  ctx.fillStyle = sun;
  ctx.beginPath(); ctx.arc(cx, cy, r * 2.6, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = rgba(pal.accent, 0.9);
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
  // Horizon shimmer
  ctx.fillStyle = rgba("#000000", 0.12);
  ctx.fillRect(0, H * 0.7, W, H * 0.3);
}

function sceneMountains(ctx, W, H, pal, seed) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, shade(pal.stops[0], 30));
  g.addColorStop(1, pal.stops[1]);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const rng = makeRng(seed + 7);
  // Layered ridges, far to near, getting darker
  const layers = 4;
  for (let l = 0; l < layers; l++) {
    const baseY = H * (0.55 + l * 0.1);
    const amp = H * (0.06 + l * 0.03);
    ctx.beginPath();
    ctx.moveTo(0, H);
    ctx.lineTo(0, baseY);
    const step = W / 8;
    for (let x = 0; x <= W + step; x += step) {
      const y = baseY - amp * (0.4 + rng()) * Math.sin((x / W) * Math.PI * (2 + l));
      ctx.lineTo(x, y);
    }
    ctx.lineTo(W, H);
    ctx.closePath();
    ctx.fillStyle = rgba(pal.stops[1], 0.25 + l * 0.22);
    ctx.fill();
  }
}

function sceneStarfield(ctx, W, H, pal, seed) {
  const g = ctx.createRadialGradient(W * 0.5, H * 0.4, 0, W * 0.5, H * 0.4, H);
  g.addColorStop(0, shade(pal.stops[0], 10));
  g.addColorStop(1, shade(pal.stops[1], -20));
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const rng = makeRng(seed + 21);
  const count = Math.floor((W * H) / 9000);
  for (let i = 0; i < count; i++) {
    const x = rng() * W, y = rng() * H * 0.85;
    const r = rng() * (W * 0.0016) + 0.4;
    ctx.globalAlpha = 0.3 + rng() * 0.7;
    ctx.fillStyle = rng() > 0.85 ? pal.accent : "#ffffff";
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function sceneOcean(ctx, W, H, pal, seed) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, shade(pal.stops[0], 25));
  g.addColorStop(1, shade(pal.stops[1], -15));
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const rng = makeRng(seed + 3);
  ctx.strokeStyle = rgba(pal.accent, 0.18);
  ctx.lineWidth = Math.max(1, W * 0.0016);
  for (let i = 0; i < 22; i++) {
    const y = H * 0.5 + i * (H * 0.024);
    ctx.beginPath();
    for (let x = 0; x <= W; x += W / 40) {
      const yy = y + Math.sin((x / W) * Math.PI * 4 + i + rng()) * (H * 0.006);
      x === 0 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy);
    }
    ctx.stroke();
  }
}

function sceneRays(ctx, W, H, pal, seed) {
  baseGradient(ctx, W, H, pal);
  const cx = W * 0.5, cy = H * 0.1;
  const rays = 14;
  const rng = makeRng(seed + 11);
  for (let i = 0; i < rays; i++) {
    const a0 = (i / rays) * Math.PI * 2 + rng() * 0.2;
    const spread = 0.06 + rng() * 0.05;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(a0 - spread) * H * 1.6, cy + Math.sin(a0 - spread) * H * 1.6);
    ctx.lineTo(cx + Math.cos(a0 + spread) * H * 1.6, cy + Math.sin(a0 + spread) * H * 1.6);
    ctx.closePath();
    ctx.fillStyle = rgba("#ffffff", 0.05 + rng() * 0.05);
    ctx.fill();
  }
  const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, H * 0.5);
  glow.addColorStop(0, rgba(pal.accent, 0.5));
  glow.addColorStop(1, rgba(pal.accent, 0));
  ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);
}

function sceneClouds(ctx, W, H, pal, seed) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, shade(pal.stops[0], 30));
  g.addColorStop(1, pal.stops[1]);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const rng = makeRng(seed + 5);
  for (let i = 0; i < 10; i++) {
    const cx = rng() * W, cy = H * (0.3 + rng() * 0.6), rw = W * (0.12 + rng() * 0.18);
    const cl = ctx.createRadialGradient(cx, cy, 0, cx, cy, rw);
    cl.addColorStop(0, rgba("#ffffff", 0.16));
    cl.addColorStop(1, rgba("#ffffff", 0));
    ctx.fillStyle = cl;
    ctx.beginPath(); ctx.ellipse(cx, cy, rw, rw * 0.5, 0, 0, Math.PI * 2); ctx.fill();
  }
}

function sceneBokeh(ctx, W, H, pal, seed) {
  baseGradient(ctx, W, H, pal);
  const rng = makeRng(seed + 13);
  for (let i = 0; i < 26; i++) {
    const x = rng() * W, y = rng() * H, r = W * (0.02 + rng() * 0.08);
    const b = ctx.createRadialGradient(x, y, 0, x, y, r);
    b.addColorStop(0, rgba(pal.accent, 0.22 + rng() * 0.15));
    b.addColorStop(1, rgba(pal.accent, 0));
    ctx.fillStyle = b;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }
}

function sceneForest(ctx, W, H, pal, seed) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, shade(pal.stops[0], 25));
  g.addColorStop(1, shade(pal.stops[1], -10));
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const rng = makeRng(seed + 9);
  // Distant mist
  const mist = ctx.createLinearGradient(0, H * 0.4, 0, H * 0.75);
  mist.addColorStop(0, rgba("#ffffff", 0.12));
  mist.addColorStop(1, rgba("#ffffff", 0));
  ctx.fillStyle = mist; ctx.fillRect(0, H * 0.4, W, H * 0.35);
  // Tree silhouettes
  const trees = 9;
  for (let i = 0; i < trees; i++) {
    const x = (i + 0.5) * (W / trees) + (rng() - 0.5) * W * 0.05;
    const topY = H * (0.32 + rng() * 0.12);
    const halfW = W * (0.03 + rng() * 0.02);
    ctx.fillStyle = rgba(pal.stops[1], 0.55);
    ctx.beginPath();
    ctx.moveTo(x, topY);
    ctx.lineTo(x - halfW, H);
    ctx.lineTo(x + halfW, H);
    ctx.closePath();
    ctx.fill();
  }
}

function sceneAurora(ctx, W, H, pal, seed) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, shade(pal.stops[1], -20));
  g.addColorStop(1, shade(pal.stops[1], 10));
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const rng = makeRng(seed + 41);
  // flowing ribbons of light
  for (let b = 0; b < 4; b++) {
    const yBase = H * (0.2 + b * 0.18);
    const col = b % 2 ? pal.accent : pal.stops[0];
    const rib = ctx.createLinearGradient(0, yBase - H * 0.12, 0, yBase + H * 0.12);
    rib.addColorStop(0, rgba(col, 0));
    rib.addColorStop(0.5, rgba(col, 0.28));
    rib.addColorStop(1, rgba(col, 0));
    ctx.fillStyle = rib;
    ctx.beginPath();
    ctx.moveTo(0, yBase);
    for (let x = 0; x <= W; x += W / 30) {
      ctx.lineTo(x, yBase + Math.sin((x / W) * Math.PI * 3 + b + rng()) * H * 0.06);
    }
    ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath(); ctx.fill();
  }
}

function sceneWatercolor(ctx, W, H, pal, seed) {
  baseGradient(ctx, W, H, pal);
  const rng = makeRng(seed + 53);
  ctx.globalCompositeOperation = "soft-light";
  for (let i = 0; i < 40; i++) {
    const x = rng() * W, y = rng() * H, r = W * (0.05 + rng() * 0.2);
    const col = rng() > 0.5 ? pal.accent : "#ffffff";
    const wc = ctx.createRadialGradient(x, y, 0, x, y, r);
    wc.addColorStop(0, rgba(col, 0.10 + rng() * 0.08));
    wc.addColorStop(1, rgba(col, 0));
    ctx.fillStyle = wc;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalCompositeOperation = "source-over";
}

function sceneGeometric(ctx, W, H, pal, seed) {
  baseGradient(ctx, W, H, pal);
  const rng = makeRng(seed + 67);
  const cols = 6, rows = Math.ceil((H / W) * cols);
  const cw = W / cols, chh = H / rows;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (rng() > 0.55) continue;
      const x = c * cw, y = r * chh;
      ctx.fillStyle = rgba(rng() > 0.5 ? pal.accent : "#ffffff", 0.05 + rng() * 0.08);
      ctx.beginPath();
      if (rng() > 0.5) { ctx.moveTo(x, y); ctx.lineTo(x + cw, y); ctx.lineTo(x, y + chh); }
      else { ctx.moveTo(x + cw, y); ctx.lineTo(x + cw, y + chh); ctx.lineTo(x, y + chh); }
      ctx.closePath(); ctx.fill();
    }
  }
  const glow = ctx.createRadialGradient(W / 2, H * 0.4, 0, W / 2, H * 0.4, W * 0.7);
  glow.addColorStop(0, "rgba(255,255,255,0.12)"); glow.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);
}

function sceneParticles(ctx, W, H, pal, seed) {
  const g = ctx.createRadialGradient(W / 2, H * 0.45, 0, W / 2, H * 0.5, H);
  g.addColorStop(0, shade(pal.stops[0], 8)); g.addColorStop(1, shade(pal.stops[1], -12));
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const rng = makeRng(seed + 73);
  const n = Math.floor((W * H) / 5200);
  for (let i = 0; i < n; i++) {
    const x = rng() * W, y = rng() * H, r = W * (0.001 + rng() * 0.006);
    const col = rng() > 0.7 ? pal.accent : "#ffffff";
    const p = ctx.createRadialGradient(x, y, 0, x, y, r * 3);
    p.addColorStop(0, rgba(col, 0.5 + rng() * 0.4));
    p.addColorStop(1, rgba(col, 0));
    ctx.fillStyle = p;
    ctx.beginPath(); ctx.arc(x, y, r * 3, 0, Math.PI * 2); ctx.fill();
  }
}

function sceneMesh(ctx, W, H, pal, seed) {
  baseGradient(ctx, W, H, pal);
  const rng = makeRng(seed + 89);
  const blobs = [pal.stops[0], pal.stops[1], pal.accent, "#ffffff"];
  ctx.globalCompositeOperation = "lighter";
  blobs.forEach((col, i) => {
    const x = W * (0.2 + rng() * 0.6), y = H * (0.2 + rng() * 0.6), r = W * (0.35 + rng() * 0.25);
    const m = ctx.createRadialGradient(x, y, 0, x, y, r);
    m.addColorStop(0, rgba(col, 0.22));
    m.addColorStop(1, rgba(col, 0));
    ctx.fillStyle = m;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  });
  ctx.globalCompositeOperation = "source-over";
}

// Film-grain / noise texture — the signature "premium" layer on modern
// affirmation/quote posts. Tiled + composited so it's cheap even at 1080².
// Build a reusable noise tile (expensive part = ImageData gen; do it once).
function makeGrainTile(seed) {
  const tile = 160;
  const off = document.createElement("canvas"); off.width = tile; off.height = tile;
  const octx = off.getContext("2d");
  const img = octx.createImageData(tile, tile);
  const rng = makeRng((seed >>> 0) + 991);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 90 + Math.floor(rng() * 130);
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  octx.putImageData(img, 0, 0);
  return off;
}
function addGrain(ctx, W, H, seed, amount) {
  amount = amount == null ? 0.07 : amount;
  const pat = ctx.createPattern(makeGrainTile(seed), "repeat");
  ctx.save();
  ctx.globalAlpha = amount;
  ctx.globalCompositeOperation = "overlay";
  ctx.fillStyle = pat;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

// A soft, modern "aura" mesh — big blurred colour fields (very on-trend).
function sceneAura(ctx, W, H, pal, seed) {
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, shade(pal.stops[0], 12)); g.addColorStop(1, shade(pal.stops[1], -6));
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const rng = makeRng(seed + 131);
  const cols = [pal.accent, pal.stops[0], "#ffffff", pal.stops[1]];
  ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < 5; i++) {
    const x = W * (0.15 + rng() * 0.7), y = H * (0.12 + rng() * 0.7), r = W * (0.28 + rng() * 0.3);
    const m = ctx.createRadialGradient(x, y, 0, x, y, r);
    m.addColorStop(0, rgba(cols[i % cols.length], 0.20));
    m.addColorStop(1, rgba(cols[i % cols.length], 0));
    ctx.fillStyle = m; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalCompositeOperation = "source-over";
}

/* ---- Nature / blessing / earthy scenes ---- */

function sceneMeadow(ctx, W, H, pal, seed) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, shade(pal.stops[0], 42));
  g.addColorStop(0.55, pal.stops[0]);
  g.addColorStop(1, shade(pal.stops[1], -8));
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const gl = ctx.createRadialGradient(W * 0.72, H * 0.2, 0, W * 0.72, H * 0.2, W * 0.6);
  gl.addColorStop(0, rgba(pal.accent, 0.42)); gl.addColorStop(1, rgba(pal.accent, 0));
  ctx.fillStyle = gl; ctx.fillRect(0, 0, W, H);
  const rng = makeRng(seed + 201);
  for (let l = 0; l < 3; l++) {
    const baseY = H * (0.72 + l * 0.08);
    ctx.beginPath(); ctx.moveTo(0, H); ctx.lineTo(0, baseY);
    for (let x = 0; x <= W; x += W / 6) ctx.lineTo(x, baseY - Math.sin((x / W) * Math.PI * (1.5 + l) + rng()) * H * 0.03);
    ctx.lineTo(W, H); ctx.closePath();
    ctx.fillStyle = rgba(pal.stops[1], 0.3 + l * 0.22); ctx.fill();
  }
  ctx.strokeStyle = rgba(pal.stops[1], 0.55); ctx.lineWidth = Math.max(1, W * 0.002);
  for (let i = 0; i < W / 12; i++) {
    const x = rng() * W, h = H * (0.02 + rng() * 0.045);
    ctx.beginPath(); ctx.moveTo(x, H); ctx.quadraticCurveTo(x + (rng() - 0.5) * 12, H - h * 0.6, x + (rng() - 0.5) * 16, H - h); ctx.stroke();
  }
  for (let i = 0; i < 22; i++) {
    const x = rng() * W, y = H * (0.9 + rng() * 0.08);
    ctx.fillStyle = rgba(rng() > 0.5 ? pal.accent : "#ffffff", 0.75);
    ctx.beginPath(); ctx.arc(x, y, W * 0.004, 0, Math.PI * 2); ctx.fill();
  }
}

function sceneBlessingLight(ctx, W, H, pal, seed) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, shade(pal.stops[0], 30)); g.addColorStop(1, pal.stops[1]);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const cx = W * 0.5, cy = -H * 0.05;
  const rng = makeRng(seed + 211);
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI - Math.PI / 2 + (rng() - 0.5) * 0.1;
    const spread = 0.05 + rng() * 0.04;
    ctx.beginPath(); ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(a - spread) * H * 1.7, cy + Math.sin(a - spread) * H * 1.7);
    ctx.lineTo(cx + Math.cos(a + spread) * H * 1.7, cy + Math.sin(a + spread) * H * 1.7);
    ctx.closePath(); ctx.fillStyle = rgba("#fff8e0", 0.05 + rng() * 0.05); ctx.fill();
  }
  const glow = ctx.createRadialGradient(cx, H * 0.16, 0, cx, H * 0.16, H * 0.6);
  glow.addColorStop(0, rgba(pal.accent, 0.6)); glow.addColorStop(0.4, rgba(pal.accent, 0.2)); glow.addColorStop(1, rgba(pal.accent, 0));
  ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 40; i++) {
    const x = rng() * W, y = rng() * H, r = W * (0.001 + rng() * 0.004);
    ctx.fillStyle = rgba("#fff7e0", 0.3 + rng() * 0.5);
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }
}

function scenePetals(ctx, W, H, pal, seed) {
  baseGradient(ctx, W, H, pal);
  const glow = ctx.createRadialGradient(W * 0.5, H * 0.4, 0, W * 0.5, H * 0.42, W * 0.7);
  glow.addColorStop(0, "rgba(255,255,255,0.12)"); glow.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);
  const rng = makeRng(seed + 223);
  for (let i = 0; i < 26; i++) {
    const x = rng() * W, y = rng() * H, rw = W * (0.02 + rng() * 0.035), rot = rng() * Math.PI;
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
    ctx.fillStyle = rgba(rng() > 0.55 ? pal.accent : "#ffffff", 0.14 + rng() * 0.16);
    ctx.beginPath(); ctx.ellipse(0, 0, rw, rw * 0.45, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
}

function sceneForestLight(ctx, W, H, pal, seed) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, shade(pal.stops[0], 28)); g.addColorStop(1, shade(pal.stops[1], -12));
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const rng = makeRng(seed + 233);
  // slanted light shafts
  for (let i = 0; i < 5; i++) {
    const x = W * (rng() * 1.1 - 0.05);
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + W * 0.12, 0);
    ctx.lineTo(x + W * 0.12 + H * 0.4, H); ctx.lineTo(x + H * 0.4, H); ctx.closePath();
    ctx.fillStyle = rgba("#f4ffe8", 0.04 + rng() * 0.04); ctx.fill();
  }
  // canopy dapples (top) + foliage blobs
  for (let i = 0; i < 30; i++) {
    const x = rng() * W, y = rng() * H * 0.9, r = W * (0.015 + rng() * 0.06);
    const b = ctx.createRadialGradient(x, y, 0, x, y, r);
    const col = rng() > 0.6 ? pal.accent : (rng() > 0.5 ? "#ffffff" : pal.stops[1]);
    b.addColorStop(0, rgba(col, 0.14 + rng() * 0.12)); b.addColorStop(1, rgba(col, 0));
    ctx.fillStyle = b; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }
}

function sceneEarthStrata(ctx, W, H, pal, seed) {
  ctx.fillStyle = shade(pal.stops[0], 18); ctx.fillRect(0, 0, W, H);
  const rng = makeRng(seed + 241);
  const bands = 7;
  let y = 0;
  for (let i = 0; i < bands; i++) {
    const bh = H / bands * (0.7 + rng() * 0.6);
    const t = i / bands;
    const col = i % 2 ? pal.stops[1] : pal.stops[0];
    ctx.beginPath(); ctx.moveTo(0, y);
    for (let x = 0; x <= W; x += W / 8) ctx.lineTo(x, y + Math.sin((x / W) * Math.PI * 2 + i + rng()) * H * 0.02);
    ctx.lineTo(W, y + bh + H * 0.06); ctx.lineTo(0, y + bh); ctx.closePath();
    ctx.fillStyle = rgba(col, 0.5 + t * 0.3); ctx.fill();
    y += bh;
  }
  const glow = ctx.createRadialGradient(W * 0.5, H * 0.3, 0, W * 0.5, H * 0.35, W * 0.7);
  glow.addColorStop(0, rgba(pal.accent, 0.2)); glow.addColorStop(1, rgba(pal.accent, 0));
  ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);
}

/* ---- Trend pack (2026): the looks reaching furthest on TikTok / Reels / Shorts ---- */

// Risograph-style grainy single-hue wash — big soft ink fields, minimal detail.
function sceneGrainWash(ctx, W, H, pal, seed) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, shade(pal.stops[0], 14));
  g.addColorStop(1, shade(pal.stops[1], -10));
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const rng = makeRng(seed + 301);
  const bx = W * (0.3 + rng() * 0.4), by = H * (0.25 + rng() * 0.4);
  const bloom = ctx.createRadialGradient(bx, by, 0, bx, by, W * 0.6);
  bloom.addColorStop(0, rgba(pal.accent, 0.28));
  bloom.addColorStop(1, rgba(pal.accent, 0));
  ctx.fillStyle = bloom; ctx.fillRect(0, 0, W, H);
  // printed-ink speckle
  ctx.globalCompositeOperation = "overlay";
  const dots = Math.floor((W * H) / 1400);
  for (let i = 0; i < dots; i++) {
    ctx.fillStyle = rgba(rng() > 0.5 ? "#ffffff" : "#000000", 0.05 + rng() * 0.06);
    ctx.fillRect(rng() * W, rng() * H, 1.4, 1.4);
  }
  ctx.globalCompositeOperation = "source-over";
}

// Aged parchment — warm mottled paper with fibres and darkened edges.
function sceneParchment(ctx, W, H, pal, seed) {
  const g = ctx.createRadialGradient(W * 0.5, H * 0.42, 0, W * 0.5, H * 0.5, Math.max(W, H) * 0.75);
  g.addColorStop(0, shade(pal.stops[0], pal.light ? 10 : 6));
  g.addColorStop(1, shade(pal.stops[1], pal.light ? -6 : -14));
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const rng = makeRng(seed + 311);
  const stainCol = pal.light ? "#7a5a34" : "#000000";
  ctx.globalCompositeOperation = "soft-light";
  for (let i = 0; i < 28; i++) {
    const x = rng() * W, y = rng() * H, r = W * (0.06 + rng() * 0.16);
    const s = ctx.createRadialGradient(x, y, 0, x, y, r);
    const col = rng() > 0.5 ? pal.accent : stainCol;
    s.addColorStop(0, rgba(col, 0.05 + rng() * 0.06));
    s.addColorStop(1, rgba(col, 0));
    ctx.fillStyle = s; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalCompositeOperation = "source-over";
  ctx.strokeStyle = rgba(pal.light ? "#8a6a3c" : "#ffffff", 0.04);
  ctx.lineWidth = 1;
  for (let i = 0; i < 40; i++) {
    const y = rng() * H;
    ctx.beginPath(); ctx.moveTo(0, y);
    for (let x = 0; x <= W; x += W / 20) ctx.lineTo(x, y + (rng() - 0.5) * 2);
    ctx.stroke();
  }
  const v = ctx.createRadialGradient(W * 0.5, H * 0.5, Math.min(W, H) * 0.3, W * 0.5, H * 0.5, Math.max(W, H) * 0.72);
  v.addColorStop(0, "rgba(0,0,0,0)");
  v.addColorStop(1, pal.light ? "rgba(90,60,25,0.22)" : "rgba(0,0,0,0.34)");
  ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
}

// Deep-space nebula — layered colour clouds over a dark field, sprinkled stars.
function sceneNebula(ctx, W, H, pal, seed) {
  const g = ctx.createRadialGradient(W * 0.5, H * 0.4, 0, W * 0.5, H * 0.45, Math.max(W, H) * 0.8);
  g.addColorStop(0, shade(pal.stops[1], -6));
  g.addColorStop(1, shade(pal.stops[1], -30));
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const rng = makeRng(seed + 321);
  const cols = [pal.accent, pal.stops[0], pal.stops[1], "#ffffff"];
  ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < 7; i++) {
    const x = rng() * W, y = rng() * H * 0.9, r = W * (0.18 + rng() * 0.34);
    const m = ctx.createRadialGradient(x, y, 0, x, y, r);
    const c = cols[i % cols.length];
    m.addColorStop(0, rgba(c, 0.14 + rng() * 0.1));
    m.addColorStop(0.6, rgba(c, 0.05));
    m.addColorStop(1, rgba(c, 0));
    ctx.fillStyle = m; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalCompositeOperation = "source-over";
  const n = Math.floor((W * H) / 6500);
  for (let i = 0; i < n; i++) {
    const x = rng() * W, y = rng() * H, r = rng() * (W * 0.0016) + 0.3;
    ctx.globalAlpha = 0.25 + rng() * 0.7;
    ctx.fillStyle = rng() > 0.9 ? pal.accent : "#ffffff";
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
}

// Bold duotone with a halftone dot gradient — editorial, high-contrast.
function sceneDuotone(ctx, W, H, pal, seed) {
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, pal.stops[0]);
  g.addColorStop(1, shade(pal.stops[1], -14));
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const step = Math.max(14, W * 0.022);
  for (let y = 0; y < H + step; y += step) {
    for (let x = 0; x < W + step; x += step) {
      const t = 1 - (x / W * 0.6 + y / H * 0.6);
      if (t <= 0) continue;
      const r = step * 0.42 * t;
      if (r < 0.4) continue;
      ctx.fillStyle = rgba(pal.accent, 0.12 * t + 0.04);
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    }
  }
  const glow = ctx.createRadialGradient(W * 0.5, H * 0.4, 0, W * 0.5, H * 0.45, W * 0.7);
  glow.addColorStop(0, "rgba(255,255,255,0.08)"); glow.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);
}

// Golden-hour flare — warm sun bloom, haze streaks and lens orbs. Faith warmth.
function sceneGoldenHour(ctx, W, H, pal, seed) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, shade(pal.stops[0], 24));
  g.addColorStop(0.6, pal.stops[0]);
  g.addColorStop(1, shade(pal.stops[1], -8));
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const rng = makeRng(seed + 341);
  const sx = W * (0.3 + rng() * 0.4), sy = H * (0.3 + rng() * 0.16);
  const bloom = ctx.createRadialGradient(sx, sy, 0, sx, sy, W * 0.9);
  bloom.addColorStop(0, rgba(pal.accent, 0.75));
  bloom.addColorStop(0.15, rgba(pal.accent, 0.4));
  bloom.addColorStop(0.5, rgba(pal.accent, 0.12));
  bloom.addColorStop(1, rgba(pal.accent, 0));
  ctx.fillStyle = bloom; ctx.fillRect(0, 0, W, H);
  const core = ctx.createRadialGradient(sx, sy, 0, sx, sy, W * 0.12);
  core.addColorStop(0, "rgba(255,250,235,0.9)"); core.addColorStop(1, "rgba(255,250,235,0)");
  ctx.fillStyle = core; ctx.beginPath(); ctx.arc(sx, sy, W * 0.12, 0, Math.PI * 2); ctx.fill();
  ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < 5; i++) {
    const y = sy + (rng() - 0.5) * H * 0.3;
    const hz = ctx.createLinearGradient(0, y, W, y);
    hz.addColorStop(0, rgba(pal.accent, 0)); hz.addColorStop(0.5, rgba("#fff4dc", 0.05 + rng() * 0.05)); hz.addColorStop(1, rgba(pal.accent, 0));
    ctx.fillStyle = hz; ctx.fillRect(0, y - H * 0.01, W, H * 0.02);
  }
  for (let i = 1; i <= 4; i++) {
    const t = i / 5, x = sx + (W * 0.5 - sx) * t * 1.4, y = sy + (H * 0.7 - sy) * t * 1.4;
    ctx.fillStyle = rgba(pal.accent, 0.12);
    ctx.beginPath(); ctx.arc(x, y, W * (0.01 + rng() * 0.02), 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalCompositeOperation = "source-over";
}

// Liquid chrome — flowing metallic silk bands with a top sheen. 2026 trend.
function sceneLiquid(ctx, W, H, pal, seed) {
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, shade(pal.stops[0], 8));
  g.addColorStop(1, shade(pal.stops[1], -18));
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const rng = makeRng(seed + 351);
  ctx.globalCompositeOperation = "lighter";
  const bands = 7;
  for (let b = 0; b < bands; b++) {
    const yBase = H * (b / (bands - 1));
    const amp = H * (0.05 + rng() * 0.06);
    const col = b % 2 ? pal.accent : "#ffffff";
    const rib = ctx.createLinearGradient(0, yBase - amp, 0, yBase + amp);
    rib.addColorStop(0, rgba(col, 0));
    rib.addColorStop(0.5, rgba(col, 0.1 + rng() * 0.08));
    rib.addColorStop(1, rgba(col, 0));
    ctx.fillStyle = rib;
    ctx.beginPath(); ctx.moveTo(0, yBase);
    for (let x = 0; x <= W; x += W / 40) ctx.lineTo(x, yBase + Math.sin((x / W) * Math.PI * 2 + b + rng() * 0.5) * amp);
    ctx.lineTo(W, yBase + amp * 2); ctx.lineTo(0, yBase + amp * 2); ctx.closePath(); ctx.fill();
  }
  ctx.globalCompositeOperation = "source-over";
  const sheen = ctx.createLinearGradient(0, 0, 0, H * 0.4);
  sheen.addColorStop(0, "rgba(255,255,255,0.1)"); sheen.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = sheen; ctx.fillRect(0, 0, W, H * 0.4);
}

// Woven linen / canvas — premium neutral texture for scripture & minimal looks.
function sceneLinen(ctx, W, H, pal, seed) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, shade(pal.stops[0], pal.light ? 8 : 4));
  g.addColorStop(1, shade(pal.stops[1], pal.light ? -4 : -12));
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const light = "#ffffff", dark = pal.light ? "#7a5a34" : "#000000";
  const step = Math.max(4, W * 0.006);
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += step) {
    ctx.strokeStyle = rgba(x % (step * 2) < step ? light : dark, 0.035);
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
  for (let y = 0; y < H; y += step) {
    ctx.strokeStyle = rgba(y % (step * 2) < step ? dark : light, 0.03);
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }
  const v = ctx.createRadialGradient(W * 0.5, H * 0.5, Math.min(W, H) * 0.3, W * 0.5, H * 0.5, Math.max(W, H) * 0.7);
  v.addColorStop(0, "rgba(0,0,0,0)");
  v.addColorStop(1, pal.light ? "rgba(90,60,25,0.16)" : "rgba(0,0,0,0.28)");
  ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
}

// Stage spotlight — crossing light shafts from above + a floor pool of light.
// Dramatic, high-energy: great for motivation, leadership and coach content.
function sceneSpotlight(ctx, W, H, pal, seed) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, shade(pal.stops[0], -22));
  g.addColorStop(1, shade(pal.stops[1], -32));
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const rng = makeRng(seed + 613);
  ctx.globalCompositeOperation = "lighter";
  [W * 0.34, W * 0.66].forEach((apexX, i) => {
    const halfBase = W * (0.20 + rng() * 0.06);
    const skew = (i === 0 ? -1 : 1) * W * 0.12;
    ctx.beginPath();
    ctx.moveTo(apexX, -H * 0.05);
    ctx.lineTo(apexX + skew - halfBase, H);
    ctx.lineTo(apexX + skew + halfBase, H);
    ctx.closePath();
    const beam = ctx.createLinearGradient(0, 0, 0, H);
    beam.addColorStop(0, rgba("#ffffff", 0.18));
    beam.addColorStop(0.5, rgba(pal.accent, 0.08));
    beam.addColorStop(1, rgba(pal.accent, 0));
    ctx.fillStyle = beam; ctx.fill();
  });
  const glow = ctx.createRadialGradient(W * 0.5, -H * 0.05, 0, W * 0.5, -H * 0.05, W * 0.7);
  glow.addColorStop(0, rgba("#ffffff", 0.22));
  glow.addColorStop(1, rgba("#ffffff", 0));
  ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = "source-over";
  const pool = ctx.createRadialGradient(W * 0.5, H * 0.92, 0, W * 0.5, H * 0.92, W * 0.55);
  pool.addColorStop(0, rgba(pal.accent, 0.16));
  pool.addColorStop(1, rgba(pal.accent, 0));
  ctx.fillStyle = pool; ctx.fillRect(0, 0, W, H);
}

// Layered waves — translucent sine bands rising from the base. Calm, universal.
function sceneWaves(ctx, W, H, pal, seed) {
  baseGradient(ctx, W, H, pal);
  const rng = makeRng(seed + 733);
  const layers = 5;
  for (let l = 0; l < layers; l++) {
    const t = l / layers;
    const yBase = H * (0.34 + t * 0.6);
    const amp = H * (0.045 + rng() * 0.04);
    const phase = rng() * Math.PI * 2;
    const col = l % 2 ? pal.accent : "#ffffff";
    ctx.beginPath(); ctx.moveTo(0, H); ctx.lineTo(0, yBase);
    for (let x = 0; x <= W; x += W / 60) ctx.lineTo(x, yBase + Math.sin((x / W) * Math.PI * 2 + phase) * amp);
    ctx.lineTo(W, H); ctx.closePath();
    ctx.fillStyle = rgba(col, 0.05 + t * 0.05);
    ctx.fill();
  }
}

// Halftone — retro dot grid whose dots swell toward a light source. Editorial.
function sceneHalftone(ctx, W, H, pal, seed) {
  baseGradient(ctx, W, H, pal);
  const rng = makeRng(seed + 811);
  const cx = W * (0.26 + rng() * 0.14), cy = H * (0.24 + rng() * 0.14);
  const step = Math.max(10, W * 0.028);
  const maxR = step * 0.52;
  const reach = Math.hypot(W, H);
  const dot = pal.light ? "#5a4a2a" : pal.accent;
  for (let y = step / 2; y < H; y += step) {
    for (let x = step / 2; x < W; x += step) {
      const d = Math.hypot(x - cx, y - cy) / reach;
      const r = maxR * Math.max(0, 1 - d * 1.6);
      if (r < 0.4) continue;
      ctx.globalAlpha = 0.10 + (1 - d) * 0.26;
      ctx.fillStyle = rgba(dot, 1);
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
}

// Prism — diagonal light-refraction streaks in palette + white. Modern, glossy.
function scenePrism(ctx, W, H, pal, seed) {
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, shade(pal.stops[0], 6));
  g.addColorStop(1, shade(pal.stops[1], -14));
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const rng = makeRng(seed + 907);
  ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < 6; i++) {
    const cx = W * rng();
    const w = W * (0.05 + rng() * 0.09);
    const col = i % 2 ? pal.accent : "#ffffff";
    ctx.save();
    ctx.translate(cx, 0);
    ctx.rotate(-0.5 - rng() * 0.3);
    const grd = ctx.createLinearGradient(-w, 0, w, 0);
    grd.addColorStop(0, rgba(col, 0));
    grd.addColorStop(0.5, rgba(col, 0.10 + rng() * 0.06));
    grd.addColorStop(1, rgba(col, 0));
    ctx.fillStyle = grd;
    ctx.fillRect(-w, -H, w * 2, H * 3);
    ctx.restore();
  }
  ctx.globalCompositeOperation = "source-over";
  const sheen = ctx.createRadialGradient(W * 0.5, H * 0.4, 0, W * 0.5, H * 0.45, W * 0.7);
  sheen.addColorStop(0, "rgba(255,255,255,0.06)");
  sheen.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = sheen; ctx.fillRect(0, 0, W, H);
}

// Registry — order = display order in the picker.
const BACKGROUNDS = [
  { key: "gradient", name: "Soft Glow",  draw: sceneGradient },
  { key: "sunrise",  name: "Sunrise",    draw: sceneSunrise },
  { key: "rays",     name: "Light Rays", draw: sceneRays },
  { key: "mountains",name: "Mountains",  draw: sceneMountains },
  { key: "starfield",name: "Starfield",  draw: sceneStarfield },
  { key: "ocean",    name: "Ocean",      draw: sceneOcean },
  { key: "clouds",   name: "Clouds",     draw: sceneClouds },
  { key: "forest",   name: "Forest",     draw: sceneForest },
  { key: "bokeh",    name: "Bokeh",      draw: sceneBokeh },
  { key: "aurora",   name: "Aurora",     draw: sceneAurora },
  { key: "watercolor", name: "Watercolor", draw: sceneWatercolor },
  { key: "geometric", name: "Geometric", draw: sceneGeometric },
  { key: "particles", name: "Particles", draw: sceneParticles },
  { key: "mesh",     name: "Color Mesh", draw: sceneMesh },
  { key: "aura",     name: "Aura",       draw: sceneAura },
  { key: "meadow",   name: "Meadow",        draw: sceneMeadow },
  { key: "blessing", name: "Blessing Light", draw: sceneBlessingLight },
  { key: "petals",   name: "Petals",        draw: scenePetals },
  { key: "canopy",   name: "Forest Light",  draw: sceneForestLight },
  { key: "strata",   name: "Earth Strata",  draw: sceneEarthStrata },
  // Trend pack (2026) — the looks reaching furthest on TikTok / Reels / Shorts.
  { key: "goldenhour", name: "Golden Hour",  draw: sceneGoldenHour },
  { key: "nebula",   name: "Nebula",         draw: sceneNebula },
  { key: "grainwash",name: "Grain Wash",     draw: sceneGrainWash },
  { key: "duotone",  name: "Duotone",        draw: sceneDuotone },
  { key: "liquid",   name: "Liquid Chrome",  draw: sceneLiquid },
  { key: "parchment",name: "Parchment",      draw: sceneParchment },
  { key: "linen",    name: "Linen",          draw: sceneLinen },
  // Attractive pack (2026) — high-energy looks for motivation & leadership.
  { key: "spotlight",name: "Spotlight",      draw: sceneSpotlight },
  { key: "waves",    name: "Waves",          draw: sceneWaves },
  { key: "halftone", name: "Halftone",       draw: sceneHalftone },
  { key: "prism",    name: "Prism",          draw: scenePrism },
];

function drawBackground(key, ctx, W, H, pal, seed) {
  const bg = BACKGROUNDS.find((b) => b.key === key) || BACKGROUNDS[0];
  bg.draw(ctx, W, H, pal, seed >>> 0);
}
