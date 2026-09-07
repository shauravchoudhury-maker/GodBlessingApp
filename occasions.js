// occasions.js
// Gift-occasion listings for Etsy + Pinterest.
//
// Why this exists separately from collection.js: everything in ETSY_COLLECTION is
// DECOR — it competes on "scripture wall art", a term with enormous competition and
// browsing (not buying) intent. Etsy is a gift marketplace. Someone searching
// "baptism gift for godson" or "sympathy gift for loss of mother" has their card
// out. Those searches convert several times better and are far less contested.
//
// So the SEO here is built around the OCCASION and the RECIPIENT, not the room and
// the palette. Different tag pools, different titles, different pin angles.
//
// Depends on VERSE_DB (verses.js) and the shared helpers in collection.js.

const OCCASIONS = {
  christmas: {
    label: "Christmas & Advent", gift: "Christmas gift", recipient: "family",
    window: "List by late September — Q4 search traffic builds 8–10 weeks ahead.",
    tags: ["christmas wall art", "christmas printable", "advent decor", "christmas decor",
           "nativity print", "christmas gift"],
    hash: ["#christmasdecor", "#christmasprintable", "#adventseason", "#nativity"],
  },
  baptism: {
    label: "Baptism & Christening", gift: "baptism gift", recipient: "godchild",
    window: "Evergreen, peaks Easter and early autumn.",
    tags: ["baptism gift", "christening gift", "baptism print", "godchild gift",
           "first communion", "confirmation gift"],
    hash: ["#baptismgift", "#christeninggift", "#godchild", "#firstcommunion"],
  },
  wedding: {
    label: "Wedding & Anniversary", gift: "wedding gift", recipient: "couple",
    window: "Evergreen, peaks January–June for the wedding season.",
    tags: ["wedding gift", "engagement gift", "anniversary gift", "wedding print",
           "couple gift", "bridal shower gift"],
    hash: ["#weddinggift", "#engagementgift", "#anniversarygift", "#weddingdecor"],
  },
  sympathy: {
    label: "Sympathy & Remembrance", gift: "sympathy gift", recipient: "someone grieving",
    window: "Evergreen and steady. Low competition, high intent, rarely done with taste.",
    tags: ["sympathy gift", "memorial print", "bereavement gift", "condolence gift",
           "in memory of", "grief gift"],
    hash: ["#sympathygift", "#memorialgift", "#griefsupport", "#inmemory"],
  },
  baby: {
    label: "New Baby & Nursery", gift: "new baby gift", recipient: "new parents",
    window: "Evergreen. Baby-shower season peaks spring and autumn.",
    tags: ["new baby gift", "nursery wall art", "baby shower gift", "christian nursery",
           "baby dedication", "nursery decor"],
    hash: ["#nurserydecor", "#babyshowergift", "#newbabygift", "#nurserywallart"],
  },
  graduation: {
    label: "Graduation", gift: "graduation gift", recipient: "a graduate",
    window: "List by February — searches climb hard March to June.",
    tags: ["graduation gift", "grad gift", "class of 2027", "graduate print",
           "college gift", "encouragement gift"],
    hash: ["#graduationgift", "#gradgift", "#classof2027", "#graduation"],
  },
  home: {
    label: "Housewarming & Home", gift: "housewarming gift", recipient: "a new homeowner",
    window: "Evergreen, peaks late spring through summer moving season.",
    tags: ["housewarming gift", "new home gift", "family sign", "entryway decor",
           "home blessing", "realtor gift"],
    hash: ["#housewarminggift", "#newhomegift", "#homedecor", "#homeblessing"],
  },
  easter: {
    label: "Easter & Resurrection", gift: "Easter gift", recipient: "family",
    window: "List by early February — Easter searches run six weeks ahead.",
    tags: ["easter wall art", "easter printable", "resurrection print", "easter decor",
           "he is risen", "lent decor"],
    hash: ["#easterdecor", "#heisrisen", "#easterprintable", "#resurrection"],
  },
  mother: {
    label: "Mother's Day", gift: "Mother's Day gift", recipient: "a mother",
    window: "List by mid-March — the search peak is short and sharp in early May.",
    tags: ["mothers day gift", "gift for mom", "mom birthday gift", "christian mom gift",
           "grandma gift", "mother gift"],
    hash: ["#mothersdaygift", "#giftformom", "#momlife", "#christianmom"],
  },
  father: {
    label: "Father's Day", gift: "Father's Day gift", recipient: "a father",
    window: "List by mid-April — peaks the first two weeks of June.",
    tags: ["fathers day gift", "gift for dad", "christian dad gift", "grandpa gift",
           "dad birthday gift", "father gift"],
    hash: ["#fathersdaygift", "#giftfordad", "#christiandad", "#girldad"],
  },
};

// Each entry reuses the same render controls as ETSY_COLLECTION so the art stays
// on-brand; `head` is the short hook that carries the listing photo.
const OCCASION_COLLECTION = [
  // ── Christmas & Advent ──
  { occ:"christmas", ref:"Luke 2:14",       palette:"gold",    bg:"blessing",  layout:"editorial", head:"Glory to God in the Highest", style:"Warm & Golden",     room:"Living Room" },
  { occ:"christmas", ref:"Isaiah 9:6",      palette:"royal",   bg:"starfield", layout:"editorial", head:"Prince of Peace",             style:"Dark Elegant",      room:"Entryway" },
  { occ:"christmas", ref:"Luke 2:11",       palette:"crimson", bg:"aura",      layout:"minimal",   head:"Unto You a Saviour Is Born",  style:"Minimalist Modern", room:"Living Room" },
  { occ:"christmas", ref:"Matthew 1:23",    palette:"night",   bg:"starfield", layout:"cinematic", head:"Immanuel — God With Us",      style:"Dark Elegant",      room:"Living Room" },
  { occ:"christmas", ref:"John 1:5",        palette:"noir",    bg:"goldenhour",layout:"poster",    head:"The Light Shines in the Darkness", style:"Dark Elegant", room:"Entryway" },
  { occ:"christmas", ref:"John 1:14",       palette:"amber",   bg:"blessing",  layout:"editorial", head:"Full of Grace and Truth",     style:"Warm & Golden",     room:"Living Room" },

  // ── Baptism, Christening & Communion ──
  { occ:"baptism",   ref:"Mark 10:14",      palette:"blush",   bg:"petals",    layout:"editorial", head:"Let the Little Children Come", style:"Soft & Serene",    room:"Nursery" },
  { occ:"baptism",   ref:"Isaiah 43:1",     palette:"calm",    bg:"watercolor",layout:"minimal",   head:"I Have Called You by Name",   style:"Soft & Serene",     room:"Nursery" },
  { occ:"baptism",   ref:"Psalm 139:14",    palette:"sand",    bg:"mesh",      layout:"minimal",   head:"Fearfully and Wonderfully Made", style:"Boho Neutral",   room:"Nursery" },
  { occ:"baptism",   ref:"1 Samuel 1:27",   palette:"peach",   bg:"aura",      layout:"editorial", head:"For This Child I Prayed",     style:"Soft & Serene",     room:"Nursery" },

  // ── Wedding & Anniversary ──
  { occ:"wedding",   ref:"1 Corinthians 13:4", palette:"blush",bg:"petals",    layout:"editorial", head:"Love Is Patient, Love Is Kind", style:"Soft & Serene",    room:"Living Room" },
  { occ:"wedding",   ref:"Ruth 1:16",       palette:"sage",    bg:"meadow",    layout:"editorial", head:"Where You Go I Will Go",      style:"Botanical Calm",    room:"Living Room" },
  { occ:"wedding",   ref:"Colossians 3:14", palette:"coral",   bg:"aura",      layout:"minimal",   head:"Put On Love",                 style:"Minimalist Modern", room:"Bedroom" },
  { occ:"wedding",   ref:"Song of Solomon 3:4", palette:"blush", bg:"watercolor", layout:"quote",  head:"I Have Found the One My Soul Loves", style:"Soft & Serene", room:"Bedroom" },
  { occ:"wedding",   ref:"Ecclesiastes 4:9-10", palette:"harvest", bg:"strata",layout:"editorial", head:"Two Are Better Than One",     style:"Boho Neutral",      room:"Living Room" },

  // ── Sympathy & Remembrance ──
  { occ:"sympathy",  ref:"Psalm 34:18",     palette:"dusk",    bg:"clouds",    layout:"minimal",   head:"Close to the Brokenhearted",  style:"Soft & Serene",     room:"Living Room" },
  { occ:"sympathy",  ref:"Revelation 21:4", palette:"calm",    bg:"aura",      layout:"editorial", head:"He Will Wipe Every Tear",     style:"Soft & Serene",     room:"Living Room" },
  { occ:"sympathy",  ref:"Psalm 147:3",     palette:"lilac",   bg:"watercolor",layout:"minimal",   head:"He Heals the Brokenhearted",  style:"Soft & Serene",     room:"Bedroom" },
  { occ:"sympathy",  ref:"Psalm 23:4",      palette:"night",   bg:"mountains", layout:"editorial", head:"Through the Darkest Valley",  style:"Dark Elegant",      room:"Living Room" },
  { occ:"sympathy",  ref:"Matthew 5:4",     palette:"sage",    bg:"canopy",    layout:"minimal",   head:"Blessed Are Those Who Mourn", style:"Botanical Calm",    room:"Prayer Room" },

  // ── New Baby & Nursery ──
  { occ:"baby",      ref:"Psalm 127:3",     palette:"butter",  bg:"petals",    layout:"editorial", head:"A Heritage From the Lord",    style:"Soft & Serene",     room:"Nursery" },
  { occ:"baby",      ref:"Zephaniah 3:17",  palette:"blush",   bg:"watercolor",layout:"editorial", head:"He Rejoices Over You With Singing", style:"Soft & Serene",room:"Nursery" },
  { occ:"baby",      ref:"Jeremiah 1:5",    palette:"peach",   bg:"aura",      layout:"minimal",   head:"Before I Formed You, I Knew You", style:"Boho Neutral",  room:"Nursery" },

  // ── Graduation ──
  { occ:"graduation",ref:"Jeremiah 29:11",  palette:"clay",    bg:"aura",      layout:"editorial", head:"Plans to Give You Hope",      style:"Boho Neutral",      room:"Office" },
  { occ:"graduation",ref:"Joshua 1:9",      palette:"bold",    bg:"gradient",  layout:"poster",    head:"Be Strong and Courageous",    style:"Dark Elegant",      room:"Office" },
  { occ:"graduation",ref:"Isaiah 40:31",    palette:"dusk",    bg:"mountains", layout:"editorial", head:"They Will Soar on Wings Like Eagles", style:"Minimalist Modern", room:"Office" },

  // ── Housewarming & Home ──
  { occ:"home",      ref:"Joshua 24:15",    palette:"terra",   bg:"linen",     layout:"editorial", head:"As for Me and My House",      style:"Boho Neutral",      room:"Entryway" },
  { occ:"home",      ref:"Psalm 127:1",     palette:"clay",    bg:"strata",    layout:"minimal",   head:"Unless the Lord Builds the House", style:"Boho Neutral", room:"Entryway" },
  { occ:"home",      ref:"Proverbs 24:3-4", palette:"harvest", bg:"linen",     layout:"editorial", head:"By Wisdom a House Is Built",  style:"Warm & Golden",     room:"Living Room" },

  // ── Easter & Resurrection ──
  { occ:"easter",    ref:"Matthew 28:6",    palette:"gold",    bg:"sunrise",   layout:"poster",    head:"He Is Not Here — He Has Risen", style:"Warm & Golden",   room:"Entryway" },
  { occ:"easter",    ref:"John 11:25",      palette:"royal",   bg:"rays",      layout:"editorial", head:"I Am the Resurrection and the Life", style:"Dark Elegant",room:"Living Room" },
  { occ:"easter",    ref:"1 Corinthians 15:57", palette:"amber", bg:"blessing",layout:"editorial", head:"He Gives Us the Victory",     style:"Warm & Golden",     room:"Living Room" },
  { occ:"easter",    ref:"Romans 6:4",      palette:"mint",    bg:"meadow",    layout:"minimal",   head:"Live a New Life",             style:"Botanical Calm",    room:"Bedroom" },

  // ── Mother's Day ──
  { occ:"mother",    ref:"Proverbs 31:28",  palette:"blush",   bg:"petals",    layout:"editorial", head:"Her Children Call Her Blessed", style:"Soft & Serene",   room:"Living Room" },
  { occ:"mother",    ref:"Isaiah 66:13",    palette:"peach",   bg:"watercolor",layout:"minimal",   head:"As a Mother Comforts",        style:"Soft & Serene",     room:"Bedroom" },
  { occ:"mother",    ref:"Proverbs 31:25",  palette:"plum",    bg:"aura",      layout:"editorial", head:"She Laughs at the Days to Come", style:"Warm & Golden",   room:"Office" },

  // ── Father's Day ──
  { occ:"father",    ref:"Psalm 103:13",    palette:"slate",   bg:"strata",    layout:"editorial", head:"As a Father Has Compassion",  style:"Minimalist Modern", room:"Office" },
  { occ:"father",    ref:"Proverbs 22:6",   palette:"moss",    bg:"canopy",    layout:"editorial", head:"Start Them Off on the Way",   style:"Botanical Calm",    room:"Living Room" },
];

/* ---------------------------------------------------------------- */
/*  Occasion SEO — gift intent, not decor intent                    */
/* ---------------------------------------------------------------- */

// Title leads with the OCCASION, because that is the search someone types when
// they intend to buy. Etsy caps the useful title around 140 characters.
function occasionTitle(e, v) {
  const o = OCCASIONS[e.occ];
  const full = `${o.gift} | ${e.head} · ${v.ref} | ${o.label} Printable Wall Art | ${e.style} Decor | Instant Download`;
  if (full.length <= 140) return full;
  const short = `${o.gift} | ${e.head} · ${v.ref} | ${o.label} Printable Wall Art | Instant Download`;
  if (short.length <= 140) return short;
  return `${o.gift} | ${e.head} | ${o.label} Printable Art | Instant Download`.slice(0, 140);
}

// 13 tags, each <= 20 chars, weighted toward the occasion terms rather than the
// decor terms — the decor pool is where all the competition is.
function occasionTags(e, v) {
  const o = OCCASIONS[e.occ];
  const pool = [
    ...o.tags,
    "printable wall art", "instant download", "digital download",
    "scripture print", "bible verse art", "christian gift", "faith wall art",
    (_COL_ROOM_TAGS && _COL_ROOM_TAGS[e.room]) || "wall art print",
  ];
  const out = [];
  for (const t of pool) {
    if (!t) continue;
    const tag = String(t).toLowerCase();
    if (tag.length <= 20 && out.indexOf(tag) === -1) out.push(tag);
    if (out.length === 13) break;
  }
  return out;
}

function occasionDescription(e, v) {
  const o = OCCASIONS[e.occ];
  return `${e.head}\n"${v.text}"\n— ${v.ref}\n\n` +
`A ${o.gift} that lasts longer than flowers. This is an INSTANT DOWNLOAD — you get the files ` +
`the moment you check out, so it works even when you have left it late.\n\n` +
`WHAT YOU GET\n` +
`• 6 ratios covering every standard frame — 2:3, 3:4, 4:5, 11x14, 5:7 and ISO A\n` +
`• 300 DPI, sharp from 5x7 right up to 24x36 inches\n` +
`• A short print guide — at home, at a local shop, or through an online printer\n\n` +
`HOW PEOPLE USE IT\n` +
`Printed and framed for ${o.recipient}, slipped into a card, or sent as a file so they can ` +
`choose their own size. ${e.style} styling that suits a ${e.room.toLowerCase()} without shouting.\n\n` +
`PLEASE NOTE\n` +
`This is a digital file. Nothing is posted to you, no frame is included, and because of that ` +
`the price is a fraction of a printed piece.\n\n` +
`Every design is made in-house from an original typeset — not a template, and not AI-generated art.`;
}

function occasionListing(e) {
  const v = (typeof VERSE_DB !== "undefined") ? VERSE_DB.find((x) => x.ref === e.ref) : null;
  if (!v) return null;
  return { v, occ: OCCASIONS[e.occ], title: occasionTitle(e, v),
           tags: occasionTags(e, v), description: occasionDescription(e, v) };
}

function occasionArtOpts(e, v, over) {
  return Object.assign({
    text: v.text, ref: v.ref, paletteKey: e.palette, bgKey: e.bg,
    layout: e.layout, showRef: true, watermark: false, grain: true,
  }, over || {});
}

/* ---------------------------------------------------------------- */
/*  Pinterest — three angles per listing                            */
/* ---------------------------------------------------------------- */
// Pinterest rewards FRESH pins, not repeated ones. One pin per listing gives
// nothing to post on day two. Three distinct angles per listing turns 37
// listings into 111 pins — about four months of daily pinning.

const PIN_ANGLES = [
  { key: "verse", label: "The verse",
    title: (e, v, o) => `${e.head} — ${v.ref} | ${o.label} Printable`,
    lead:  (e, v, o) => `${e.head} — "${v.text}" (${v.ref}).` },
  { key: "gift", label: "The gift",
    title: (e, v, o) => `${o.gift} idea — ${e.head} Printable Wall Art`,
    lead:  (e, v, o) => `Looking for a ${o.gift} that is not another candle? ${e.head} (${v.ref}), ready to print the moment you buy.` },
  { key: "room", label: "The styling",
    title: (e, v, o) => `${e.style} ${o.label} Print for the ${e.room}`,
    lead:  (e, v, o) => `${e.style} ${o.label.toLowerCase()} print styled for a ${e.room.toLowerCase()} — ${e.head} (${v.ref}).` },
];

function occasionPin(e, angleKey) {
  const v = (typeof VERSE_DB !== "undefined") ? VERSE_DB.find((x) => x.ref === e.ref) : null;
  if (!v) return null;
  const o = OCCASIONS[e.occ];
  const a = PIN_ANGLES.find((x) => x.key === angleKey) || PIN_ANGLES[0];
  const hashes = [...o.hash, "#printablewallart", "#instantdownload", "#etsyfinds"]
    .filter((h, i, arr) => arr.indexOf(h) === i).slice(0, 7);
  const title = a.title(e, v, o).slice(0, 100);
  const description = (a.lead(e, v, o) +
    ` Instant download in 6 frame sizes, 300 DPI — print at home or at a shop, from 5x7 to 24x36in. ` +
    `Tap to shop on Etsy →\n\n${hashes.join(" ")}`).slice(0, 500);
  return { v, angle: a.label, title, description };
}

// Every listing × every angle, in a stable order — this is the pinning queue.
function occasionPinQueue(filterOcc) {
  const out = [];
  OCCASION_COLLECTION.forEach((e) => {
    if (filterOcc && filterOcc !== "all" && e.occ !== filterOcc) return;
    PIN_ANGLES.forEach((a) => {
      const p = occasionPin(e, a.key);
      if (p) out.push(Object.assign({ entry: e }, p));
    });
  });
  return out;
}

function occasionsFor(key) {
  return key && key !== "all"
    ? OCCASION_COLLECTION.filter((e) => e.occ === key)
    : OCCASION_COLLECTION.slice();
}
