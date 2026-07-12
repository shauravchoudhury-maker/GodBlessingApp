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
];

function drawBackground(key, ctx, W, H, pal, seed) {
  const bg = BACKGROUNDS.find((b) => b.key === key) || BACKGROUNDS[0];
  bg.draw(ctx, W, H, pal, seed >>> 0);
}
