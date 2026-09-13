// regions.js
// Three regions, and what each country still needs before it is switched on.
//
// THE DECISION (13 September 2026). The Circle serves three primary
// markets: North & South America, Asia, and Africa. The code is already
// mostly region-agnostic — 35 languages, 40 countries with a crisis line,
// eight faiths. What gates "serving a country" is not code; it is three
// per-country facts, two of them human:
//
//   1. its helpline has been verified by a person in that country (P7),
//   2. the crisis and under-18 patterns in its languages have been read by
//      a native speaker (P8),
//   3. enough guides can write in its languages (B3/B4 — three, the same
//      OPEN_THRESHOLD campaign.js uses).
//
// This file turns those three facts into one readiness colour per country
// and one next step, so the Health screen and the daily check say "N
// countries promotable" instead of "we're global on day one". Nine
// starters get done first — the biggest populations where existing
// languages, an existing crisis line and recruitable faiths overlap.
//
// WHAT THIS FILE DOES NOT DO. It does not decide where to promote; B4 says
// that is a person's decision after looking at who the guides are. It does
// not read the database. It does not pick the country for a request —
// world.js does that from the browser's timezone. It only reports.

/* Which countries belong to which region, and what a country is made of:
   languages in order of how many people write in them, and the faiths a
   guide there would most likely answer from (used only to say what to
   recruit for — never to route). */
const REGIONS = [
  { key: "americas", label: "North & South America",
    countries: ["US", "CA", "MX", "BR", "AR", "CO", "PE", "CL", "VE", "EC"] },
  { key: "asia", label: "Asia",
    countries: ["IN", "PK", "BD", "LK", "NP", "ID", "MY", "PH", "SG", "TH", "VN", "JP", "KR", "HK", "TW", "AE", "SA"] },
  { key: "africa", label: "Africa",
    countries: ["NG", "KE", "ZA", "GH", "ET", "TZ", "UG", "EG", "MA", "ZW"] },
];

/* The nine to get to green first. Three per region. */
const STARTERS = ["US", "BR", "MX", "IN", "PH", "ID", "NG", "KE", "ZA"];

const COUNTRY = {
  US: { name: "United States",  langs: ["en", "es"],                    faiths: ["christian", "none", "jewish"] },
  CA: { name: "Canada",         langs: ["en", "fr"],                    faiths: ["christian", "none"] },
  MX: { name: "Mexico",         langs: ["es"],                          faiths: ["christian"] },
  BR: { name: "Brazil",         langs: ["pt"],                          faiths: ["christian"] },
  AR: { name: "Argentina",      langs: ["es"],                          faiths: ["christian"] },
  CO: { name: "Colombia",       langs: ["es"],                          faiths: ["christian"] },
  PE: { name: "Peru",           langs: ["es"],                          faiths: ["christian"] },
  CL: { name: "Chile",          langs: ["es"],                          faiths: ["christian"] },
  VE: { name: "Venezuela",      langs: ["es"],                          faiths: ["christian"] },
  EC: { name: "Ecuador",        langs: ["es"],                          faiths: ["christian"] },

  IN: { name: "India",          langs: ["hi", "en", "bn", "te", "mr", "ta", "gu", "ur", "ml", "pa"],
                                faiths: ["hindu", "islam", "christian", "sikh"] },
  PK: { name: "Pakistan",       langs: ["ur", "en", "pa"],              faiths: ["islam"] },
  BD: { name: "Bangladesh",     langs: ["bn"],                          faiths: ["islam", "hindu"] },
  LK: { name: "Sri Lanka",      langs: ["si", "ta", "en"],              faiths: ["buddhist", "hindu", "islam", "christian"] },
  NP: { name: "Nepal",          langs: ["ne", "hi"],                    faiths: ["hindu", "buddhist"] },
  ID: { name: "Indonesia",      langs: ["id"],                          faiths: ["islam", "christian"] },
  MY: { name: "Malaysia",       langs: ["ms", "en", "zh-CN", "ta"],     faiths: ["islam", "buddhist", "christian", "hindu"] },
  PH: { name: "Philippines",    langs: ["tl", "en"],                    faiths: ["christian", "islam"] },
  SG: { name: "Singapore",      langs: ["en", "zh-CN", "ms", "ta"],     faiths: ["buddhist", "christian", "islam", "none"] },
  TH: { name: "Thailand",       langs: ["th"],                          faiths: ["buddhist"] },
  VN: { name: "Vietnam",        langs: ["vi"],                          faiths: ["buddhist", "christian", "none"] },
  JP: { name: "Japan",          langs: ["ja"],                          faiths: ["buddhist", "none"] },
  KR: { name: "South Korea",    langs: ["ko"],                          faiths: ["christian", "buddhist", "none"] },
  HK: { name: "Hong Kong",      langs: ["zh-CN", "en"],                 faiths: ["buddhist", "christian", "none"] },
  TW: { name: "Taiwan",         langs: ["zh-CN"],                       faiths: ["buddhist", "taoist", "none"] },
  AE: { name: "UAE",            langs: ["ar", "en", "hi", "ur"],        faiths: ["islam", "christian", "hindu"] },
  SA: { name: "Saudi Arabia",   langs: ["ar"],                          faiths: ["islam"] },

  NG: { name: "Nigeria",        langs: ["en", "ha", "yo"],              faiths: ["christian", "islam"] },
  KE: { name: "Kenya",          langs: ["sw", "en"],                    faiths: ["christian", "islam"] },
  ZA: { name: "South Africa",   langs: ["en", "zu"],                    faiths: ["christian"] },
  GH: { name: "Ghana",          langs: ["en"],                          faiths: ["christian", "islam"] },
  ET: { name: "Ethiopia",       langs: ["am"],                          faiths: ["christian", "islam"] },
  TZ: { name: "Tanzania",       langs: ["sw", "en"],                    faiths: ["christian", "islam"] },
  UG: { name: "Uganda",         langs: ["en", "sw"],                    faiths: ["christian", "islam"] },
  EG: { name: "Egypt",          langs: ["ar"],                          faiths: ["islam", "christian"] },
  MA: { name: "Morocco",        langs: ["ar", "fr"],                    faiths: ["islam"] },
  ZW: { name: "Zimbabwe",       langs: ["en"],                          faiths: ["christian"] },
};

// Same bar as campaign.js OPEN_THRESHOLD: fewer than this and a country is
// answering but too thin to advertise.
const READY_GUIDES = 3;

/* The three facts, from the files that own them. In the browser these are
   globals from world.js and safety-lang.js; in node they are required. */
function deps() {
  const w = typeof CRISIS !== "undefined" ? { CRISIS, EMERGENCY_ONLY } : require("./world.js");
  const s = typeof LANG_SAFETY !== "undefined" ? { LANG_SAFETY } : require("./safety-lang.js");
  return { CRISIS: w.CRISIS, EMERGENCY_ONLY: w.EMERGENCY_ONLY, LANG_SAFETY: s.LANG_SAFETY };
}

function helplineState(cc, d) {
  const c = d.CRISIS[cc];
  if (c && c.checked) return "verified";
  if (c) return "unverified";
  if (d.EMERGENCY_ONLY[cc]) return "emergency-only";
  return "none";
}

/* Per language: reviewed by a native speaker, written but unreviewed, or
   absent. English is the one language treated as reviewed — it is the
   founder's, and it was the original classifier. */
function patternState(lang, d) {
  if (lang === "en") return "reviewed";
  const L = d.LANG_SAFETY[lang];
  if (!L) return "none";
  return L.checked ? "reviewed" : "unreviewed";
}

/* One country. `stats` is the Health snapshot; it carries guidesByLanguage
   (active guides per language code) once blessing.html has written it.
   A missing map counts as zero guides everywhere, never as "unknown = fine". */
function readiness(cc, stats, d) {
  d = d || deps();
  const c = COUNTRY[cc];
  if (!c) return null;
  const byLang = (stats && stats.guidesByLanguage) || {};
  const helpline = helplineState(cc, d);
  const langs = c.langs.map((l) => ({ code: l, patterns: patternState(l, d), guides: byLang[l] || 0 }));
  const first = langs[0];
  // Guides count in whichever of the country's languages has the most —
  // three English-writing guides make the Philippines answerable even if
  // nobody writes Filipino yet.
  const best = langs.reduce((a, l) => (l.guides > a.guides ? l : a), first);
  const guides = best.guides;

  const missing = [];
  if (helpline !== "verified") missing.push(
    helpline === "none" ? "no crisis line at all — find one, then verify it"
    : helpline === "emergency-only" ? "no crisis line, only an emergency number — find one, then verify it"
    : "crisis line not yet verified by a person in " + c.name);
  if (first.patterns !== "reviewed") missing.push(
    first.patterns === "none" ? "no crisis patterns in " + first.code
    : "crisis patterns in " + first.code + " not yet read by a native speaker");
  if (guides < READY_GUIDES) missing.push(
    guides === 0 ? "no active guide writes in " + first.code
    : "only " + guides + " of " + READY_GUIDES + " guides in " + best.code);

  const colour = missing.length === 0 ? "green"
    : (helpline !== "none" && first.patterns !== "none" && guides > 0) ? "amber"
    : "red";
  return { cc, name: c.name, region: regionOf(cc), starter: STARTERS.indexOf(cc) !== -1,
           helpline, langs, guides, faiths: c.faiths, colour, missing, next: missing[0] || "" };
}

function regionOf(cc) {
  const r = REGIONS.find((x) => x.countries.indexOf(cc) !== -1);
  return r ? r.key : null;
}

/* The roll-up the daily check reads: how many countries are promotable,
   per region and among the starters, and the one next step per starter. */
function regionSummary(stats) {
  const d = deps();
  const out = { promotable: 0, total: 0, byRegion: {}, starters: [] };
  REGIONS.forEach((r) => {
    const rows = r.countries.map((cc) => readiness(cc, stats, d)).filter(Boolean);
    const tally = { green: 0, amber: 0, red: 0 };
    rows.forEach((x) => { tally[x.colour]++; });
    out.byRegion[r.key] = { label: r.label, ...tally, total: rows.length };
    out.promotable += tally.green; out.total += rows.length;
  });
  out.starters = STARTERS.map((cc) => readiness(cc, stats, d)).filter(Boolean)
    .map((x) => ({ cc: x.cc, name: x.name, colour: x.colour, guides: x.guides, next: x.next }));
  return out;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { REGIONS, STARTERS, COUNTRY, READY_GUIDES, readiness, regionSummary, regionOf,
                     helplineState, patternState };
}
