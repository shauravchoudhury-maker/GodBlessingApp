// world.js
// Making the Blessing Circle usable outside the United States.
//
// The Circle was written US-first without anyone deciding to: 988, 911 and a
// Los Angeles teen line were hard-coded into every crisis panel, and every
// request was tagged `language: "en"` regardless of what the person actually
// wrote. Someone in Delhi in real trouble was being handed a number that does
// not connect, and a woman writing in Urdu was being matched as though she
// needed English.
//
// ─────────────────────────────────────────────────────────────────────────
//  READ THIS BEFORE LAUNCH — the numbers below are NOT verified.
//
//  I compiled them from training data. Helpline numbers change, services
//  close, and a wrong number given to someone in crisis is worse than no
//  number at all. Every entry must be checked by a person against the
//  provider's own website before this ships outside the US, and re-checked
//  on a schedule after that.
//
//  Because of that, findahelpline.com is shown ALONGSIDE the local line
//  every single time, never as a fallback only. It covers 130+ countries and
//  is maintained by people whose job that is. If our number is stale, the
//  person still has a working route in the same breath.
//
//  `checked` is the date a human confirmed the entry. It is null on every
//  row right now, on purpose, and the UI says so until it is not.
// ─────────────────────────────────────────────────────────────────────────

const HELP_DIRECTORY = {
  url: "https://findahelpline.com",
  label: "findahelpline.com — free, confidential lines in over 130 countries",
};

const CRISIS = {
  US: { line: "988", name: "Suicide & Crisis Lifeline", note: "call or text, free, 24 hours",
        chat: "https://988lifeline.org/chat/", emergency: "911", checked: null },
  CA: { line: "988", name: "Suicide Crisis Helpline", note: "call or text, free, 24 hours",
        emergency: "911", checked: null },
  GB: { line: "116 123", name: "Samaritans", note: "free, 24 hours, from any phone",
        emergency: "999", checked: null },
  IE: { line: "116 123", name: "Samaritans", note: "free, 24 hours",
        emergency: "112", checked: null },
  AU: { line: "13 11 14", name: "Lifeline", note: "24 hours",
        emergency: "000", checked: null },
  NZ: { line: "1737", name: "Need to Talk?", note: "call or text, free, 24 hours",
        emergency: "111", checked: null },
  IN: { line: "14416", name: "Tele-MANAS", note: "government helpline, free, 24 hours, many languages",
        emergency: "112", checked: null },
  DE: { line: "0800 111 0 111", name: "Telefonseelsorge", note: "free, 24 hours",
        emergency: "112", checked: null },
  FR: { line: "3114", name: "Numéro national de prévention du suicide", note: "free, 24 hours",
        emergency: "112", checked: null },
  ES: { line: "024", name: "Línea de atención a la conducta suicida", note: "free, 24 hours",
        emergency: "112", checked: null },
  IT: { line: "800 86 00 22", name: "Telefono Amico", note: "free",
        emergency: "112", checked: null },
  NL: { line: "113", name: "113 Zelfmoordpreventie", note: "24 hours",
        emergency: "112", checked: null },
  BE: { line: "1813", name: "Zelfmoordlijn", note: "24 hours",
        emergency: "112", checked: null },
  PT: { line: "213 544 545", name: "SOS Voz Amiga", emergency: "112", checked: null },
  PL: { line: "116 123", name: "Kryzysowy Telefon Zaufania", emergency: "112", checked: null },
  SE: { line: "90101", name: "Mind Självmordslinjen", emergency: "112", checked: null },
  NO: { line: "116 123", name: "Mental Helse", emergency: "113", checked: null },
  DK: { line: "70 201 201", name: "Livslinien", emergency: "112", checked: null },
  FI: { line: "09 2525 0111", name: "MIELI Kriisipuhelin", emergency: "112", checked: null },
  AT: { line: "142", name: "Telefonseelsorge", note: "free, 24 hours", emergency: "112", checked: null },
  CH: { line: "143", name: "Die Dargebotene Hand", note: "24 hours", emergency: "112", checked: null },
  BR: { line: "188", name: "CVV — Centro de Valorização da Vida", note: "free, 24 hours",
        emergency: "192", checked: null },
  MX: { line: "800 911 2000", name: "SAPTEL", note: "free, 24 hours", emergency: "911", checked: null },
  AR: { line: "135", name: "Centro de Asistencia al Suicida", emergency: "911", checked: null },
  ZA: { line: "0800 567 567", name: "SADAG", emergency: "10111", checked: null },
  JP: { line: "0570-064-556", name: "いのちの電話 (Inochi no Denwa)", emergency: "119", checked: null },
  KR: { line: "109", name: "자살예방상담전화", note: "24 hours", emergency: "119", checked: null },
  SG: { line: "1767", name: "Samaritans of Singapore", note: "24 hours", emergency: "995", checked: null },
  MY: { line: "03-76272929", name: "Befrienders KL", emergency: "999", checked: null },
  PH: { line: "1553", name: "NCMH Crisis Hotline", note: "free, 24 hours", emergency: "911", checked: null },
  ID: { line: "119", name: "Kemenkes SEJIWA", note: "extension 8", emergency: "112", checked: null },
  IL: { line: "1201", name: "ERAN", note: "24 hours", emergency: "101", checked: null },
  BD: { line: "09612119911", name: "Kaan Pete Roi", emergency: "999", checked: null },
};

// Countries where we have no number we would stand behind. The directory is
// shown on its own rather than guessing — an emergency number we are sure of
// is still useful, so it is kept where known.
const EMERGENCY_ONLY = {
  AE: "999", PK: "1122", NG: "112", KE: "999", GH: "112", TZ: "112", UG: "999",
  LK: "119", NP: "100", VN: "115", TH: "191", TR: "112", SA: "997", EG: "123",
  QA: "999", KW: "112", MA: "150", DZ: "14", CN: "120", HK: "999", TW: "119",
  RU: "112", UA: "112", RO: "112", GR: "112", CZ: "112", HU: "112", CO: "123",
  CL: "131", PE: "116", VE: "171", EC: "911", ET: "907", ZW: "999",
};

/* ---------------------------------------------------------------- */
/*  Where is this person, roughly                                   */
/* ---------------------------------------------------------------- */
// Deliberately no geolocation prompt, no IP lookup, no storage. The browser's
// own timezone is enough to pick a helpline and it never leaves the device.
// If we are wrong, the international directory is right there anyway.
const TZ_COUNTRY = {
  "America/New_York":"US","America/Detroit":"US","America/Chicago":"US","America/Denver":"US",
  "America/Phoenix":"US","America/Los_Angeles":"US","America/Anchorage":"US","Pacific/Honolulu":"US",
  "America/Toronto":"CA","America/Vancouver":"CA","America/Edmonton":"CA","America/Winnipeg":"CA",
  "America/Halifax":"CA","America/St_Johns":"CA",
  "Europe/London":"GB","Europe/Dublin":"IE","Europe/Berlin":"DE","Europe/Paris":"FR",
  "Europe/Madrid":"ES","Europe/Rome":"IT","Europe/Amsterdam":"NL","Europe/Brussels":"BE",
  "Europe/Lisbon":"PT","Europe/Warsaw":"PL","Europe/Stockholm":"SE","Europe/Oslo":"NO",
  "Europe/Copenhagen":"DK","Europe/Helsinki":"FI","Europe/Vienna":"AT","Europe/Zurich":"CH",
  "Europe/Athens":"GR","Europe/Prague":"CZ","Europe/Budapest":"HU","Europe/Bucharest":"RO",
  "Europe/Moscow":"RU","Europe/Kyiv":"UA","Europe/Kiev":"UA","Europe/Istanbul":"TR",
  "Asia/Kolkata":"IN","Asia/Calcutta":"IN","Asia/Colombo":"LK","Asia/Kathmandu":"NP",
  "Asia/Karachi":"PK","Asia/Dhaka":"BD","Asia/Dubai":"AE","Asia/Riyadh":"SA","Asia/Qatar":"QA",
  "Asia/Kuwait":"KW","Asia/Jerusalem":"IL","Asia/Tel_Aviv":"IL",
  "Asia/Tokyo":"JP","Asia/Seoul":"KR","Asia/Shanghai":"CN","Asia/Hong_Kong":"HK","Asia/Taipei":"TW",
  "Asia/Singapore":"SG","Asia/Kuala_Lumpur":"MY","Asia/Manila":"PH","Asia/Jakarta":"ID",
  "Asia/Bangkok":"TH","Asia/Ho_Chi_Minh":"VN","Asia/Saigon":"VN",
  "Australia/Sydney":"AU","Australia/Melbourne":"AU","Australia/Brisbane":"AU",
  "Australia/Perth":"AU","Australia/Adelaide":"AU","Pacific/Auckland":"NZ",
  "Africa/Johannesburg":"ZA","Africa/Lagos":"NG","Africa/Nairobi":"KE","Africa/Accra":"GH",
  "Africa/Cairo":"EG","Africa/Casablanca":"MA","Africa/Algiers":"DZ","Africa/Addis_Ababa":"ET",
  "Africa/Dar_es_Salaam":"TZ","Africa/Kampala":"UG","Africa/Harare":"ZW",
  "America/Sao_Paulo":"BR","America/Bahia":"BR","America/Fortaleza":"BR",
  "America/Mexico_City":"MX","America/Argentina/Buenos_Aires":"AR","America/Bogota":"CO",
  "America/Santiago":"CL","America/Lima":"PE","America/Caracas":"VE","America/Guayaquil":"EC",
};

function countryOf(tz, locale) {
  const zone = tz || (typeof Intl !== "undefined"
    ? (Intl.DateTimeFormat().resolvedOptions().timeZone || "") : "");
  if (TZ_COUNTRY[zone]) return TZ_COUNTRY[zone];
  // fall back to the region in the browser language: "en-GB" → GB
  const loc = locale || (typeof navigator !== "undefined" ? navigator.language : "") || "";
  const m = /[-_]([A-Za-z]{2})$/.exec(loc);
  if (m) {
    const cc = m[1].toUpperCase();
    if (CRISIS[cc] || EMERGENCY_ONLY[cc]) return cc;
  }
  return null;
}

/* What to show someone in trouble, wherever they are. Always the directory;
   the local line as well when we have one. */
function crisisHelp(country) {
  const c = CRISIS[country];
  return {
    country: country || null,
    line: c ? c.line : null,
    name: c ? c.name : null,
    note: c ? (c.note || "") : "",
    chat: c ? (c.chat || null) : null,
    emergency: c ? c.emergency : (EMERGENCY_ONLY[country] || null),
    verified: !!(c && c.checked),
    directory: HELP_DIRECTORY,
  };
}

/* ---------------------------------------------------------------- */
/*  Language                                                        */
/* ---------------------------------------------------------------- */
// `language` used to be hard-coded to "en" on every request, which quietly
// broke the matcher: scoreGuide() refuses a guide who cannot write in the
// requester's language, so every non-English speaker was matched as English
// and answered in English.
const UI_LANGS = [
  ["en","English"],["es","Español"],["hi","हिन्दी"],["pa","ਪੰਜਾਬੀ"],["gu","ગુજરાતી"],
  ["ta","தமிழ்"],["te","తెలుగు"],["bn","বাংলা"],["ur","اردو"],["ar","العربية"],
  ["fa","فارسی"],["he","עברית"],["fr","Français"],["pt","Português"],["zh-CN","中文"],
  ["tl","Filipino"],["vi","Tiếng Việt"],["ko","한국어"],["id","Bahasa Indonesia"],
  ["sw","Kiswahili"],["ru","Русский"],["pl","Polski"],["de","Deutsch"],["it","Italiano"],
];

const RTL_LANGS = ["ar","ur","fa","he","ps","sd","ug","yi"];
function isRTL(lang) { return RTL_LANGS.indexOf(String(lang || "").split("-")[0]) !== -1; }

// Guess what the person probably writes in, so the picker starts somewhere
// sensible rather than always on English.
function guessLanguage(locale) {
  const loc = locale || (typeof navigator !== "undefined" ? navigator.language : "en") || "en";
  const base = loc.split("-")[0].toLowerCase();
  if (/^zh/i.test(loc)) return "zh-CN";
  return UI_LANGS.some(([k]) => k === base) ? base : "en";
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { CRISIS, EMERGENCY_ONLY, HELP_DIRECTORY, TZ_COUNTRY,
                     countryOf, crisisHelp, UI_LANGS, RTL_LANGS, isRTL, guessLanguage };
}
