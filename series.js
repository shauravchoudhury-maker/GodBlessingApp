// series.js
// "One question, five traditions" — EverVerse's signature series format.
//
// Why this exists: a standalone verse post delivers its whole payload in about
// eight seconds, so a viewer has no reason to wonder what else is on the
// profile. TikTok bears this out — strong like and comment rates, but a profile
// click-through well under benchmark. A numbered series with a consistent shape
// gives people a reason to go looking, which is the metric that actually turns
// views into followers.
//
// Each entry takes one human problem and answers it from five different wisdom
// traditions, which is a format only this app has the library to run.
//
// Depends on: VERSE_DB, faithLabel, meaningFor (meanings.js), THEME_PALETTES.

/* ---------------------------------------------------------------- */
/*  The series                                                       */
/* ---------------------------------------------------------------- */
// key      — stable id, used in filenames
// question — the hook. Shown on the cover card and as the caption's first line.
// sub      — the cover card's second line
// title    — platform title stem (YouTube / TikTok)
// palettes — a five-step ramp so the set reads as one piece, not five posts
// bg       — background key shared across the set
// picks    — one verse per tradition, in the order they should appear
const SERIES = [
  {
    key: "burnout",
    question: "You're doing everything right and still running on empty.",
    sub: "Five traditions, on burnout.",
    title: "Burnout, answered by 5 wisdom traditions",
    bg: "strata",
    palettes: ["sand", "clay", "terra", "harvest", "gold"],
    picks: ["Bhagavad Gita 2:47", "Matthew 11:28", "Tao Te Ching 9", "Exodus 33:14", "On rest"],
  },
  {
    key: "anxiety",
    question: "For the mind that will not switch off.",
    sub: "Five traditions, on a racing mind.",
    title: "Anxiety, answered by 5 wisdom traditions",
    bg: "aura",
    palettes: ["calm", "mint", "sage", "dusk", "night"],
    picks: ["Philippians 4:6", "Dhammapada 35", "Tao Te Ching 15", "Bhagavad Gita 6:19", "On overthinking"],
  },
  {
    key: "grief",
    question: "What to read when you have lost someone.",
    sub: "Five traditions, on grief.",
    title: "Grief, answered by 5 wisdom traditions",
    bg: "clouds",
    palettes: ["night", "ink", "dusk", "slate", "noir"],
    picks: ["Psalm 34:18", "Sallatha Sutta", "Deuteronomy 33:27", "Guru Granth Sahib (Sukhmani Sahib)", "On grief"],
  },
  {
    key: "self-worth",
    question: "If you have been feeling like you are not enough.",
    sub: "Five traditions, on your worth.",
    title: "Self-worth, answered by 5 wisdom traditions",
    bg: "petals",
    palettes: ["blush", "lilac", "peach", "butter", "gold"],
    picks: ["Psalm 139:14", "Genesis 1:31", "Guru Granth Sahib, Ang 1349", "Samyutta Nikaya 3.8", "On being enough"],
  },
  {
    key: "starting-over",
    question: "For anyone who has to begin again.",
    sub: "Five traditions, on starting over.",
    title: "Starting over, answered by 5 wisdom traditions",
    bg: "meadow",
    palettes: ["mint", "sage", "moss", "teal", "forest"],
    picks: ["Ezekiel 36:26", "Tao Te Ching 64", "Dhammapada 239", "Leviticus 25:10", "On beginning again"],
  },
  {
    key: "comparison",
    question: "For when everyone else looks further ahead than you.",
    sub: "Five traditions, on comparison.",
    title: "Comparison, answered by 5 wisdom traditions",
    bg: "mesh",
    palettes: ["mono", "chrome", "slate", "ink", "noir"],
    picks: ["Bhagavad Gita 3:35", "Galatians 6:9", "Tao Te Ching 24", "Dhammapada 252", "On comparison"],
  },
  {
    key: "forgiveness",
    question: "The hardest thing every tradition asks of you.",
    sub: "Five traditions, on forgiveness.",
    title: "Forgiveness, answered by 5 wisdom traditions",
    bg: "watercolor",
    palettes: ["blush", "clay", "peach", "terra", "warm"],
    picks: ["Ephesians 4:32", "Dhammapada 5", "Guru Granth Sahib (Bhagat Farid)", "Leviticus 19:18", "Anguttara Nikaya 5.161"],
  },
  {
    key: "fear",
    question: "Read this before the thing you are scared of.",
    sub: "Five traditions, on fear.",
    title: "Fear, answered by 5 wisdom traditions",
    bg: "rays",
    palettes: ["ink", "royal", "dusk", "azure", "bold"],
    picks: ["Joshua 1:9", "Genesis 15:1", "Dhajagga Sutta", "Tao Te Ching 73", "On being scared"],
  },
  {
    key: "loneliness",
    question: "For the nights that feel too quiet.",
    sub: "Five traditions, on loneliness.",
    title: "Loneliness, answered by 5 wisdom traditions",
    bg: "starfield",
    palettes: ["night", "dusk", "lilac", "plum", "royal"],
    picks: ["Genesis 28:15", "Deuteronomy 31:8", "Upaddha Sutta", "Guru Granth Sahib (Guru Arjan)", "On self-kindness"],
  },
  {
    key: "anger",
    question: "Before you say the thing you cannot take back.",
    sub: "Five traditions, on anger.",
    title: "Anger, answered by 5 wisdom traditions",
    bg: "gradient",
    palettes: ["crimson", "terra", "clay", "amber", "mono"],
    picks: ["Dhammapada 222", "Proverbs 15:1", "Tao Te Ching 68", "Bhagavad Gita 16:21", "Guru Granth Sahib (Bhagat Farid II)"],
  },
  {
    key: "gratitude",
    question: "The one practice every tradition agrees on.",
    sub: "Five traditions, on gratitude.",
    title: "Gratitude, answered by 5 wisdom traditions",
    bg: "goldenhour",
    palettes: ["harvest", "gold", "butter", "amber", "sand"],
    picks: ["1 Thessalonians 5:16-18", "Deuteronomy 8:10", "Tao Te Ching 46", "Anguttara Nikaya", "Japji Sahib (Pauri 25)"],
  },
  {
    key: "purpose",
    question: "For anyone still asking what they are actually here for.",
    sub: "Five traditions, on purpose.",
    title: "Purpose, answered by 5 wisdom traditions",
    bg: "sunrise",
    palettes: ["gold", "amber", "royal", "bold", "crimson"],
    picks: ["Bhagavad Gita 3:8", "Ephesians 2:10", "Dhammapada 80", "Genesis 12:2", "On your path"],
  },
];

const SERIES_NAME = "One question. Five traditions.";
const SERIES_HANDLE = "@eververse2117";

/* ---------------------------------------------------------------- */
/*  Lookups                                                          */
/* ---------------------------------------------------------------- */
function seriesByKey(key) { return SERIES.find((s) => s.key === key) || null; }

// Part number as shown to viewers (1-based, stable across sessions).
function seriesPart(key) { return SERIES.findIndex((s) => s.key === key) + 1; }

// Resolve the picks to real verse objects. Any ref that has gone missing from
// the database is dropped rather than throwing, so a bad ref degrades the post
// instead of breaking the studio. seriesIssues() reports them for the build.
function seriesVerses(key) {
  const s = seriesByKey(key);
  if (!s) return [];
  return s.picks.map((ref) => VERSE_DB.find((v) => v.ref === ref)).filter(Boolean);
}

// Any picks that no longer resolve — used by the test page and the build check.
function seriesIssues() {
  const out = [];
  SERIES.forEach((s) => {
    s.picks.forEach((ref) => {
      if (!VERSE_DB.some((v) => v.ref === ref)) out.push({ key: s.key, ref });
    });
    if (s.palettes.length !== s.picks.length) out.push({ key: s.key, ref: "palette ramp length mismatch" });
    s.palettes.forEach((p) => {
      if (!THEME_PALETTES[p]) out.push({ key: s.key, ref: "unknown palette " + p });
    });
  });
  return out;
}

// The traditions represented, in order, de-duped — e.g. "Bible · Tao Te Ching · …"
function seriesTraditions(key) {
  const seen = [];
  seriesVerses(key).forEach((v) => {
    const label = faithLabel(v.faith);
    if (seen.indexOf(label) === -1) seen.push(label);
  });
  return seen;
}

/* ---------------------------------------------------------------- */
/*  Copy                                                             */
/* ---------------------------------------------------------------- */
// Hashtags spanning every tradition in the set, not just Bible and Gita.
const SERIES_FAITH_TAGS = {
  Bible: ["#bibleverse", "#christian"],
  Gita: ["#bhagavadgita", "#krishna"],
  Torah: ["#torah", "#judaism"],
  Tao: ["#taoteching", "#taoism"],
  Sikh: ["#sikhi", "#gurbani"],
  Dhammapada: ["#dhammapada", "#buddhism"],
  Tripitaka: ["#buddhism", "#mindfulness"],
  Wisdom: ["#stoicism", "#affirmations"],
};

function seriesHashtags(key, max) {
  const s = seriesByKey(key);
  const out = [], seen = new Set();
  const add = (t) => {
    const k = t.toLowerCase();
    if (!seen.has(k)) { seen.add(k); out.push(t); }
  };
  add("#" + s.key.replace(/-/g, ""));
  seriesVerses(key).forEach((v) => (SERIES_FAITH_TAGS[v.faith] || []).forEach(add));
  ["#wisdom", "#spirituality", "#fyp", "#eververse"].forEach(add);
  return out.slice(0, max || 10);
}

// The line that asks for the click. This is the whole point of the format:
// name the series, say how many parts there are, and give a concrete reason
// that the profile is worth opening.
function seriesCta(key) {
  return `Part ${seriesPart(key)} of ${SERIES.length}. ${SERIES_NAME}\nThe other ${SERIES.length - 1} are on the profile — follow ${SERIES_HANDLE} so you get the rest.`;
}

// Caption. Opens on the hook (that is what shows in the feed), closes on the
// CTA, and asks the question that the comment rate says people want to answer.
function seriesCaption(key, platformKey) {
  const s = seriesByKey(key);
  const vs = seriesVerses(key);
  const body = vs.map((v) => `${faithLabel(v.faith)} — "${v.text}"`).join("\n\n");
  const tags = seriesHashtags(key, platformKey === "tiktok" ? 8 : 12).join(" ");
  const ask = `Which one landed hardest for you? 👇`;

  if (platformKey === "tiktok" || platformKey === "youtube") {
    return `${s.question}\n\n${s.sub}\n\n${ask}\n\n${seriesCta(key)}\n\n${tags}`;
  }
  return `${s.question}\n\n${body}\n\n${ask}\nSave this for the day you need it.\n\n${seriesCta(key)}\n\n${tags}`;
}

function seriesTitle(key) {
  return `${seriesByKey(key).title} | Part ${seriesPart(key)}`;
}

/* ---------------------------------------------------------------- */
/*  Card plan — what gets rendered, in order                         */
/* ---------------------------------------------------------------- */
// Returns render option objects for renderVerse(), one per card:
//   cover → one card per tradition → CTA
function seriesCardPlan(key, opts) {
  opts = opts || {};
  const s = seriesByKey(key);
  const vs = seriesVerses(key);
  const watermark = opts.watermark !== false;
  const plan = [];

  plan.push({
    kind: "cover",
    text: s.question,
    kicker: `PART ${seriesPart(key)} · ${SERIES_NAME.toUpperCase()}`,
    sub: s.sub,
    paletteKey: s.palettes[0],
    bgKey: s.bg,
    layout: "affirmation",
    showRef: false,
    grain: true,
    watermark,
  });

  vs.forEach((v, i) => {
    plan.push({
      kind: "verse",
      verse: v,
      text: v.text,
      ref: v.ref,
      kicker: `${i + 1} · ${faithLabel(v.faith).toUpperCase()}`,
      paletteKey: s.palettes[i] || s.palettes[s.palettes.length - 1],
      bgKey: s.bg,
      layout: opts.layout || "editorial",
      showRef: true,
      grain: true,
      watermark,
    });
  });

  plan.push({
    kind: "cta",
    text: `${SERIES.length} questions.\nFive traditions each.`,
    kicker: "THE SERIES",
    sub: `Follow ${SERIES_HANDLE} for the rest`,
    paletteKey: s.palettes[s.palettes.length - 1],
    bgKey: s.bg,
    layout: "affirmation",
    showRef: false,
    grain: true,
    watermark,
  });

  return plan;
}

// Per-card seconds for the video cut. The cover has to be readable in the
// first beat or the scroll wins, and longer verses need longer on screen.
function seriesCardSeconds(card) {
  if (card.kind === "cover") return 2.4;
  if (card.kind === "cta") return 2.6;
  const words = String(card.text || "").split(/\s+/).length;
  return Math.max(3.0, Math.min(6.5, 1.6 + words * 0.17));
}

function seriesDurationSec(key, opts) {
  return seriesCardPlan(key, opts).reduce((a, c) => a + seriesCardSeconds(c), 0);
}
