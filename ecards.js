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

// Greeting eCard (default 5:7 portrait). Reuses the art engine + adds card framing.
function drawEcard(canvas, v, occasionId, W, H, opts) {
  opts = opts || {};
  const occ = ecardOccasion(occasionId);
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");
  const pal = (typeof THEME_PALETTES !== "undefined" && THEME_PALETTES[v.theme]) || THEME_PALETTES.warm;
  const seed = (v.ref || "card").split("").reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 7);
  const minDim = Math.min(W, H);

  drawBackground((typeof bgForVerseApp === "function" ? bgForVerseApp(v) : "aura"), ctx, W, H, pal, seed >>> 0);
  const vig = ctx.createRadialGradient(W / 2, H * 0.5, minDim * 0.2, W / 2, H * 0.5, Math.max(W, H) * 0.8);
  if (pal.light) { vig.addColorStop(0, "rgba(255,255,255,0.08)"); vig.addColorStop(1, "rgba(120,90,50,0.16)"); }
  else { vig.addColorStop(0, "rgba(0,0,0,0)"); vig.addColorStop(1, "rgba(0,0,0,0.34)"); }
  ctx.fillStyle = vig; ctx.fillRect(0, 0, W, H);
  if (typeof addGrain === "function") addGrain(ctx, W, H, seed, 0.06);

  ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.direction = "ltr";
  // Occasion greeting
  ctx.fillStyle = pal.text;
  if (!pal.light) { ctx.shadowColor = "rgba(0,0,0,0.35)"; ctx.shadowBlur = minDim * 0.02; }
  ctx.font = `700 ${minDim * 0.072}px Georgia, "Times New Roman", serif`;
  ctx.fillText(occ.greeting, W / 2, H * 0.15);
  ctx.font = `italic 400 ${minDim * 0.034}px Georgia, serif`;
  ctx.fillStyle = hexToRgba(pal.accent, 0.95);
  ctx.fillText(opts.to ? ("For " + opts.to) : occ.sub, W / 2, H * 0.225);
  ctx.shadowColor = "transparent"; ctx.shadowBlur = 0;
  // Rule
  ctx.strokeStyle = hexToRgba(pal.accent, 0.6); ctx.lineWidth = Math.max(1.5, W * 0.003);
  ctx.beginPath(); ctx.moveTo(W / 2 - minDim * 0.08, H * 0.285); ctx.lineTo(W / 2 + minDim * 0.08, H * 0.285); ctx.stroke();
  // Verse
  const family = 'Georgia, "Times New Roman", serif';
  const fit = fitText(ctx, v.text, W - W * 0.13 * 2, H * 0.34, family, minDim * 0.058, "500");
  ctx.font = `500 ${fit.size}px ${family}`; ctx.fillStyle = pal.text;
  if (!pal.light) { ctx.shadowColor = "rgba(0,0,0,0.4)"; ctx.shadowBlur = fit.size * 0.14; }
  let y = H * 0.52 - (fit.lines.length * fit.lineHeight) / 2 + fit.lineHeight / 2;
  for (const ln of fit.lines) { ctx.fillText(ln, W / 2, y); y += fit.lineHeight; }
  ctx.shadowColor = "transparent"; ctx.shadowBlur = 0;
  // Reference
  ctx.font = `italic 600 ${minDim * 0.03}px ${family}`; ctx.fillStyle = hexToRgba(pal.accent, 0.95);
  ctx.fillText("— " + v.ref, W / 2, y + minDim * 0.03);
  // Sign-off
  if (opts.from) { ctx.font = `italic 400 ${minDim * 0.03}px Georgia, serif`; ctx.fillStyle = pal.text; ctx.fillText("with love, " + opts.from, W / 2, H * 0.83); }
  // Brand footer
  ctx.font = `600 ${minDim * 0.022}px "Segoe UI", sans-serif`; ctx.fillStyle = hexToRgba(pal.text, 0.72);
  ctx.textBaseline = "bottom";
  ctx.fillText("✦ EverVerse · eververse.org", W / 2, H - H * 0.038);
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
