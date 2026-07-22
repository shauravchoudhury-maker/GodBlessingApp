// collection.js
// A hand-curated "best of 30" set of Etsy printable-wall-art listings: proven
// best-seller verses paired with deliberate palette / background / layout
// choices (earthy neutrals + clean minimalist looks convert best on Etsy),
// plus a world-class SEO listing generator (title + 13 tags + description).
// Depends on: VERSE_DB, faithLabel, renderVerse.

// head  = the punchy title hook (2–5 words)
// style = the aesthetic bucket (drives tags + copy)
// room  = the target room (drives tags + copy)
// niche = the market angle (defaults from faith if omitted)
const ETSY_COLLECTION = [
  // ── Christian scripture — the proven best-sellers ──
  { ref: "Joshua 1:9",        palette: "sand",    bg: "mesh",       layout: "editorial", head: "Be Strong and Courageous",    style: "Boho Neutral",      room: "Office" },
  { ref: "Jeremiah 29:11",    palette: "clay",    bg: "aura",       layout: "editorial", head: "Plans to Prosper You",         style: "Boho Neutral",      room: "Living Room" },
  { ref: "Philippians 4:13",  palette: "noir",    bg: "gradient",   layout: "poster",    head: "I Can Do All Things",          style: "Dark Elegant",      room: "Office" },
  { ref: "Psalm 46:10",       palette: "calm",    bg: "clouds",     layout: "minimal",   head: "Be Still and Know",            style: "Soft & Serene",     room: "Bedroom" },
  { ref: "Proverbs 3:5-6",    palette: "sage",    bg: "meadow",     layout: "editorial", head: "Trust in the Lord",            style: "Botanical Calm",    room: "Living Room" },
  { ref: "Isaiah 40:31",      palette: "dusk",    bg: "aura",       layout: "editorial", head: "Wings Like Eagles",            style: "Soft & Serene",     room: "Bedroom" },
  { ref: "Psalm 23:1",        palette: "sage",    bg: "strata",     layout: "minimal",   head: "The Lord Is My Shepherd",      style: "Botanical Calm",    room: "Prayer Room" },
  { ref: "Zephaniah 3:17",    palette: "blush",   bg: "watercolor", layout: "editorial", head: "He Rejoices Over You",         style: "Soft & Serene",     room: "Nursery" },
  { ref: "Philippians 4:6",   palette: "sand",    bg: "mesh",       layout: "editorial", head: "Do Not Be Anxious",            style: "Boho Neutral",      room: "Bedroom" },
  { ref: "Matthew 11:28",     palette: "moss",    bg: "canopy",     layout: "editorial", head: "Come to Me and Rest",          style: "Botanical Calm",    room: "Bedroom" },
  { ref: "Romans 8:28",       palette: "harvest", bg: "aura",       layout: "editorial", head: "All Things Work Together",     style: "Warm & Golden",     room: "Living Room" },
  { ref: "Psalm 121:1-2",     palette: "dusk",    bg: "mountains",  layout: "editorial", head: "I Lift My Eyes",               style: "Minimalist Modern", room: "Entryway" },
  { ref: "1 Corinthians 13:4",palette: "blush",   bg: "petals",     layout: "editorial", head: "Love Is Patient",              style: "Soft & Serene",     room: "Living Room", niche: "Wedding & Love" },
  { ref: "Isaiah 41:10",      palette: "bold",    bg: "gradient",   layout: "editorial", head: "Do Not Fear",                  style: "Dark Elegant",      room: "Office" },
  { ref: "Psalm 27:1",        palette: "gold",    bg: "rays",       layout: "editorial", head: "The Lord Is My Light",         style: "Warm & Golden",     room: "Entryway" },
  { ref: "Lamentations 3:22-23", palette: "sand", bg: "sunrise",    layout: "editorial", head: "New Every Morning",            style: "Warm & Golden",     room: "Bedroom" },
  { ref: "Psalm 139:14",      palette: "clay",    bg: "mesh",       layout: "minimal",   head: "Fearfully and Wonderfully Made", style: "Boho Neutral",    room: "Nursery" },
  { ref: "John 14:27",        palette: "calm",    bg: "aura",       layout: "minimal",   head: "Peace I Leave With You",       style: "Soft & Serene",     room: "Bedroom" },

  // ── Bhagavad Gita — the multi-faith differentiator ──
  { ref: "Bhagavad Gita 2:47", palette: "terra",  bg: "strata",     layout: "editorial", head: "Do Your Duty, Not for Reward", style: "Boho Neutral",      room: "Office",           niche: "Bhagavad Gita" },
  { ref: "Bhagavad Gita 6:5",  palette: "harvest",bg: "aura",       layout: "editorial", head: "Lift Yourself by Yourself",    style: "Warm & Golden",     room: "Meditation Space", niche: "Yoga & Gita" },
  { ref: "Bhagavad Gita 6:19", palette: "dusk",   bg: "aura",       layout: "minimal",   head: "Steady as a Windless Flame",   style: "Minimalist Modern", room: "Meditation Space", niche: "Meditation" },
  { ref: "Bhagavad Gita 2:14", palette: "moss",   bg: "meadow",     layout: "editorial", head: "The Seasons Come and Go",      style: "Botanical Calm",    room: "Living Room",      niche: "Bhagavad Gita" },

  // ── Timeless wisdom — trendy minimalist / gift prints ──
  { ref: "On being enough",   palette: "blush",   bg: "mesh",       layout: "minimal",   head: "You Are Already Enough",       style: "Soft & Serene",     room: "Bedroom",  niche: "Self-Love Affirmation" },
  { ref: "Marcus Aurelius",   palette: "noir",    bg: "gradient",   layout: "editorial", head: "Power Over Your Mind",         style: "Dark Elegant",      room: "Office",   niche: "Stoic Quote" },
  { ref: "Lao Tzu",           palette: "sage",    bg: "mesh",       layout: "minimal",   head: "A Single Step",                style: "Minimalist Modern", room: "Office",   niche: "Zen Quote" },
  { ref: "On rest",           palette: "sand",    bg: "clouds",     layout: "minimal",   head: "You Don't Have to Earn Rest",  style: "Boho Neutral",      room: "Bedroom",  niche: "Self-Care Affirmation" },
  { ref: "On hope",           palette: "gold",    bg: "aura",       layout: "editorial", head: "The Light Is Looking for You", style: "Warm & Golden",     room: "Living Room", niche: "Inspirational Quote" },
  { ref: "Mark Twain",        palette: "blush",   bg: "petals",     layout: "editorial", head: "Where Smiles Have Been",       style: "Soft & Serene",     room: "Entryway", niche: "Witty Quote" },

  // ── World proverbs — universal, giftable ──
  { ref: "Japanese proverb",  palette: "bold",    bg: "gradient",   layout: "poster",    head: "Fall Seven, Rise Eight",       style: "Minimalist Modern", room: "Office",   niche: "Motivational Quote" },
  { ref: "Irish blessing",    palette: "sage",    bg: "meadow",     layout: "editorial", head: "May the Road Rise to Meet You", style: "Botanical Calm",   room: "Entryway", niche: "Irish Blessing" },
];

// Extra style/room keyword pools (all tags kept <= 20 chars for Etsy).
const _COL_STYLE_TAGS = {
  "Boho Neutral":      ["boho wall art", "neutral wall art", "earthy wall art"],
  "Minimalist Modern": ["minimalist art", "modern wall art", "line art print"],
  "Soft & Serene":     ["pastel wall art", "calming wall art", "soft wall art"],
  "Botanical Calm":    ["botanical print", "nature wall art", "green wall art"],
  "Warm & Golden":     ["warm wall art", "golden wall art", "boho wall art"],
  "Dark Elegant":      ["dark wall art", "modern wall art", "bold wall art"],
};
const _COL_ROOM_TAGS = {
  "Office": "office wall art", "Living Room": "living room art", "Bedroom": "bedroom decor",
  "Nursery": "nursery print", "Prayer Room": "prayer room decor", "Entryway": "entryway decor",
  "Meditation Space": "meditation print",
};
const _COL_FAITH_TAGS = {
  Bible:  ["scripture print", "bible verse art", "christian gift", "faith wall art"],
  Gita:   ["bhagavad gita art", "yoga wall art", "spiritual gift", "hindu wall art"],
  Wisdom: ["quote print", "affirmation art", "self love print", "mindset print"],
};
function _colFaith(v) { return _COL_FAITH_TAGS[v.faith] || _COL_FAITH_TAGS.Wisdom; }
function _colNiche(e, v) {
  if (e.niche) return e.niche;
  return v.faith === "Bible" ? "Scripture" : v.faith === "Gita" ? "Bhagavad Gita" : "Inspirational Quote";
}

// Build the SEO title (<= 140 chars), trimming the style/room segment if long.
function collectionTitle(e, v) {
  const niche = _colNiche(e, v);
  const full = `${e.head} · ${v.ref} | ${niche} Printable Wall Art | ${e.style} ${e.room} Decor | Instant Download`;
  if (full.length <= 140) return full;
  const short = `${e.head} · ${v.ref} | ${niche} Printable Wall Art | ${e.room} Decor | Instant Download`;
  if (short.length <= 140) return short;
  return `${e.head} · ${v.ref} | ${niche} Printable Wall Art | Instant Download`.slice(0, 140);
}

// Build 13 unique Etsy tags, each <= 20 chars.
function collectionTags(e, v) {
  const pool = [
    _colFaith(v)[0], _colFaith(v)[1],
    ...(_COL_STYLE_TAGS[e.style] || []),
    _COL_ROOM_TAGS[e.room],
    "printable wall art", "instant download", "verse wall art", "quote print",
    _colFaith(v)[2], "digital download",
    v.faith === "Bible" ? "prayer room decor" : "spiritual gift",
  ];
  const out = [];
  for (const t of pool) {
    if (!t) continue;
    const tag = t.toLowerCase();
    if (tag.length <= 20 && out.indexOf(tag) === -1) out.push(tag);
    if (out.length === 13) break;
  }
  return out;
}

function _artFor(word) { return /^[aeiou]/i.test(word) ? "an" : "a"; }
function collectionDescription(e, v) {
  const faith = (typeof faithLabel === "function") ? faithLabel(v.faith) : v.faith;
  const room = e.room.toLowerCase();
  const styleL = e.style.toLowerCase();
  const meaning = (typeof meaningFor === "function") ? meaningFor(v) : "";
  return `${e.head} — ${v.ref} (${faith})

"${v.text}"

${meaning ? meaning + "\n\n" : ""}A ${styleL} printable to bring calm, hope and meaning to your ${room}.

★ INSTANT DOWNLOAD — no physical item is shipped ★
You'll receive 6 high-resolution files (one per standard frame ratio), so you can print at home, a local shop, or online at any size from 5x7 up to 24x36 inches and ISO A sizes — all at ~300 DPI:
• 2:3  • 3:4  • 4:5  • 11x14  • 5:7  • ISO A

HOW IT WORKS
1. Buy — your files download instantly.
2. Print at home, or upload to a print shop (Prodigi, Printful, your local store).
3. Frame and enjoy.

Perfect for ${_artFor(room)} ${room}, a gallery wall, a prayer or meditation corner, or a heartfelt ${v.faith === "Bible" ? "Christian" : "spiritual"} gift.

For personal use only; please do not resell or redistribute the files.
© EverVerse · eververse.org`;
}

// One call → the full listing copy for an entry.
function collectionListing(e) {
  const v = VERSE_DB.find((x) => x.ref === e.ref);
  if (!v) return null;
  return { v, title: collectionTitle(e, v), tags: collectionTags(e, v), description: collectionDescription(e, v) };
}

// The exact render options for an entry (its curated design). watermark can be
// overridden (clean print files vs branded listing mockups).
function collectionArtOpts(e, v, over) {
  return Object.assign({
    text: v.text, ref: v.ref,
    paletteKey: e.palette, bgKey: e.bg,
    layout: e.layout, font: e.font || "serif",
    grain: e.grain !== false,
    kicker: "EVERVERSE · " + ((typeof faithLabel === "function" ? faithLabel(v.faith) : v.faith).toUpperCase()),
    watermark: false, showRef: true,
  }, over || {});
}

// ── Pinterest SEO copy per listing ──────────────────────────────────
const _PIN_STYLE_HASH = {
  "Boho Neutral": "#bohodecor", "Minimalist Modern": "#minimalistdecor",
  "Soft & Serene": "#pasteldecor", "Botanical Calm": "#botanicalart",
  "Warm & Golden": "#bohodecor", "Dark Elegant": "#moderndecor",
};
function _pinFaithHash(v) {
  return v.faith === "Bible" ? ["#bibleverse", "#scripturewallart", "#christiangift"]
    : v.faith === "Gita" ? ["#bhagavadgita", "#yogadecor", "#spiritualart"]
    : ["#inspirationalquote", "#quoteoftheday", "#affirmations"];
}
// Pin title — keyword-rich, <= 100 chars (Pinterest shows ~100).
function pinTitle(e, v) {
  const niche = _colNiche(e, v);
  let t = `${e.head} — ${v.ref} Printable Wall Art | ${e.style} ${niche} Print`;
  if (t.length > 100) t = `${e.head} — ${v.ref} Printable Wall Art | ${niche} Print`;
  if (t.length > 100) t = `${e.head} — ${v.ref} | ${niche} Printable Wall Art`;
  return t.slice(0, 100);
}
// Pin description — keyword-rich + a few relevant hashtags (<= 500 chars).
function pinDescription(e, v) {
  const room = e.room.toLowerCase();
  const gift = v.faith === "Bible" ? "Christian gift" : "spiritual gift";
  const hashes = [..._pinFaithHash(v), _PIN_STYLE_HASH[e.style] || "#wallart", "#printablewallart", "#instantdownload"];
  const uniq = hashes.filter((h, i) => hashes.indexOf(h) === i).slice(0, 7);
  return `${e.head} — "${v.text}" (${v.ref}). ${e.style} printable wall art for your ${room}: instant download in 6 sizes, print at home or a shop from 5x7 up to 24x36in. A meaningful ${gift} or gallery-wall piece. Tap to shop on Etsy → \n\n${uniq.join(" ")}`.slice(0, 500);
}
function pinCopy(e) {
  const v = VERSE_DB.find((x) => x.ref === e.ref);
  if (!v) return null;
  return { v, title: pinTitle(e, v), description: pinDescription(e, v) };
}
