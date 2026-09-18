// audiences.js
// Who each devotion is for, and what that audience actually types, watches and
// wakes up to. Everything here is drawn from public signals (YouTube/YouVersion
// year-end data, platform timing studies, festival calendars, diaspora
// community sources) — see AUDIENCE_RESEARCH.md for the sources. It is used to
// tailor a video's title, tags, publish time and festival timing to the people
// most likely to watch it, per tradition and per segment.
//
// Segments (every tradition has all three; the default differs):
//   native   — homeland audience; native-script title first, native voice
//              where one exists, posts in the homeland's morning.
//   diaspora — second-generation and English-first believers (US/UK/CA/AU);
//              English title with "meaning", transliteration on screen.
//   seeker   — people outside the tradition who found it online; plain
//              framing ("what it means", "a prayer for anxiety"), no insider
//              vocabulary in the title.
//
// Festivals: verified dates only. A day inside a window pulls that tradition's
// preferred entries into the rotation. Add next year's dates when they are
// published — never guess a lunar date.

const AUDIENCES = {
  hindu: {
    defaultSegment: "diaspora",
    tz: "Asia/Kolkata", morning: "07:30", evening: "19:30",
    regions: ["IN", "US", "GB", "CA", "AU", "NP", "MU", "FJ", "SG"],
    // What people type: format words first ("with meaning", "with lyrics", "fast").
    formats: ["with meaning", "with lyrics", "in English", "fast", "Sanskrit"],
    titles: {
      native:   "{native} अर्थ सहित | {title} with meaning",
      diaspora: "{title} with meaning in English | {kind} explained line by line",
      seeker:   "{title}: what this {kindLower} actually says",
    },
    tags: {
      native:   ["#भक्ति", "#हिंदी", "#मंत्र", "#आरती", "#bhakti", "#hindi"],
      diaspora: ["#hinduism", "#sanatandharma", "#desi", "#indianamerican", "#britishasian"],
      seeker:   ["#meditation", "#mantra", "#spirituality", "#mindfulness"],
    },
    perId: {   // the exact phrases the biggest searches use
      "hanuman-chalisa": { search: "Hanuman Chalisa with meaning", nativeTags: ["#हनुमानचालीसा", "#जयश्रीराम", "#hanumanchalisa"] },
      "gayatri-mantra": { search: "Gayatri Mantra meaning", nativeTags: ["#गायत्रीमंत्र", "#gayatrimantra"] },
      "om-jai-jagdish-hare": { search: "Om Jai Jagdish Hare aarti with lyrics and meaning", nativeTags: ["#ॐजयजगदीशहरे", "#aarti"] },
      "mahamrityunjaya-mantra": { search: "Mahamrityunjaya Mantra meaning", nativeTags: ["#महामृत्युंजय", "#shiva"] },
      "jai-ambe-gauri": { search: "Jai Ambe Gauri aarti with lyrics and meaning", nativeTags: ["#जयअम्बेगौरी", "#दुर्गाआरती", "#navratri", "#durgaaarti"] },
      "durga-navratri-chant": { search: "Ya Devi Sarva Bhuteshu meaning", nativeTags: ["#यादेवीसर्वभूतेषु", "#navratri", "#durga"] },
      "saraswati-vandana": { search: "Saraswati Vandana Ya Kundendu with meaning", nativeTags: ["#सरस्वतीवंदना", "#saraswati", "#students"] },
      "om-jai-lakshmi-mata": { search: "Om Jai Lakshmi Mata aarti with lyrics and meaning", nativeTags: ["#लक्ष्मीआरती", "#diwali", "#lakshmiaarti"] },
      "jai-ganesh-deva": { search: "Jai Ganesh Deva aarti with lyrics and meaning", nativeTags: ["#जयगणेशदेवा", "#गणेशआरती", "#ganeshaarti"] },
      "om-jai-shiv-omkara": { search: "Om Jai Shiv Omkara aarti with lyrics and meaning", nativeTags: ["#शिवआरती", "#mahadev", "#shivaarti"] },
      "hanuman-chalisa-2": { search: "Hanuman Chalisa with meaning part 2", nativeTags: ["#हनुमानचालीसा", "#hanumanchalisa"] },
      "hanuman-chalisa-3": { search: "Hanuman Chalisa with meaning part 3", nativeTags: ["#हनुमानचालीसा", "#hanumanchalisa"] },
      "hanuman-chalisa-4": { search: "Hanuman Chalisa with meaning part 4", nativeTags: ["#हनुमानचालीसा", "#hanumanchalisa"] },
      "hanuman-chalisa-5": { search: "Hanuman Chalisa with meaning part 5", nativeTags: ["#हनुमानचालीसा", "#hanumanchalisa"] },
    },
    festivals: [
      { name: "Navratri", start: "2026-10-11", end: "2026-10-19", prefer: ["jai-ambe-gauri", "durga-navratri-chant", "gayatri-mantra", "asato-ma-sadgamaya", "om-jai-lakshmi-mata", "sarve-bhavantu-sukhinah", "saraswati-vandana", "hanuman-chalisa-5", "om-jai-jagdish-hare"], tag: "#navratri" },   // nine nights, nine different videos — never the same upload twice
      { name: "Diwali", start: "2026-11-06", end: "2026-11-10", peak: "2026-11-08", prefer: ["vakratunda-mahakaya", "asato-ma-sadgamaya", "om-jai-lakshmi-mata", "jai-ganesh-deva", "om-jai-jagdish-hare"], tag: "#diwali" },   // Lakshmi aarti lands on the peak night
      { name: "Maha Shivaratri", start: "2027-03-05", end: "2027-03-06", prefer: ["om-jai-shiv-omkara", "mahamrityunjaya-mantra"], tag: "#mahashivratri" },
    ],
  },
  christian: {
    defaultSegment: "seeker",
    tz: "America/New_York", morning: "06:30", evening: "20:00",
    regions: ["US", "BR", "NG", "PH", "GB", "MX", "KE", "ZA"],
    formats: ["prayer", "meaning", "for anxiety", "for sleep", "explained"],
    titles: {
      native:   "{title} | prayer with meaning",
      diaspora: "{title} explained line by line",
      seeker:   "{title}: a {occasionWord} prayer, line by line",
      seekerAny: "{title}: a prayer, line by line",
    },
    tags: {
      native:   ["#christian", "#prayer", "#bible", "#jesus", "#faith"],
      diaspora: ["#christian", "#prayer", "#bible", "#jesus", "#faith"],
      seeker:   ["#prayer", "#peace", "#anxiety", "#hope", "#spirituality"],
    },
    perId: {
      "psalm-23": { search: "Psalm 23 with meaning", nativeTags: ["#psalm23", "#thelordismyshepherd"] },
      "psalm-91": { search: "Psalm 91 prayer for protection", nativeTags: ["#psalm91", "#protection"] },
      "lords-prayer": { search: "The Lord's Prayer explained", nativeTags: ["#lordsprayer", "#ourfather"] },
      "isaiah-41-10-prayer": { search: "Isaiah 41:10 meaning fear not", nativeTags: ["#isaiah4110", "#fearnot", "#bibleverse"] },
      "jeremiah-29-11-prayer": { search: "Jeremiah 29:11 meaning explained", nativeTags: ["#jeremiah2911", "#bibleverse", "#hope"] },
      "philippians-4-6-prayer": { search: "Philippians 4:6-7 prayer for anxiety", nativeTags: ["#philippians46", "#anxiety", "#bibleverse"] },
    },
    festivals: [
      { name: "Advent", start: "2026-11-29", end: "2026-12-24", prefer: ["doxology", "beatitudes", "lords-prayer"], tag: "#advent" },
      { name: "Christmas", start: "2026-12-25", end: "2026-12-26", prefer: ["doxology", "lords-prayer"], tag: "#christmas" },
      { name: "Lent", start: "2027-02-10", end: "2027-03-27", prefer: ["psalm-23", "prayer-of-st-francis", "beatitudes", "psalm-91"], tag: "#lent" },
      { name: "Easter", start: "2027-03-28", end: "2027-03-29", prefer: ["psalm-23", "doxology"], tag: "#easter" },
    ],
  },
  jewish: {
    defaultSegment: "diaspora",
    tz: "America/New_York", morning: "07:00", evening: "19:00",
    regions: ["US", "IL", "GB", "CA", "FR", "AR", "AU"],
    formats: ["meaning", "in English", "transliteration", "explained"],
    titles: {
      native:   "{native} | {title} with meaning",
      diaspora: "{title} — meaning and transliteration",
      seeker:   "{title}: what this Jewish prayer says",
    },
    tags: {
      native:   ["#תפילה", "#יהדות", "#jewish", "#judaism"],
      diaspora: ["#jewish", "#judaism", "#torah", "#shabbat", "#tefillah"],
      seeker:   ["#prayer", "#blessing", "#peace", "#spirituality"],
    },
    perId: {
      "shema": { search: "Shema Yisrael meaning", nativeTags: ["#shema", "#שמעישראל"] },
      "birkat-kohanim": { search: "Priestly Blessing meaning", nativeTags: ["#priestlyblessing", "#birkatkohanim"] },
    },
    festivals: [
      { name: "Yom Kippur", start: "2026-09-20", end: "2026-09-21", prefer: ["shema", "oseh-shalom"], tag: "#yomkippur" },
      { name: "Hanukkah", start: "2026-12-04", end: "2026-12-12", prefer: ["oseh-shalom", "psalm-121", "modeh-ani"], tag: "#hanukkah" },
    ],
  },
  islamic: {
    defaultSegment: "diaspora",
    tz: "Asia/Jakarta", morning: "05:30", evening: "20:30",
    regions: ["ID", "PK", "BD", "NG", "EG", "GB", "US", "MY", "TR", "SA"],
    // Sleep and anxiety framing wins; "transliteration" is explicitly searched.
    formats: ["with meaning", "transliteration", "for anxiety", "before sleep", "for protection"],
    titles: {
      native:   "{title} — meaning & transliteration",
      diaspora: "{title} — meaning, transliteration, and when to say it",
      seeker:   "{title}: what Muslims say {occasionPhrase} — and why",
      seekerAny: "{title}: what Muslims say every day — and why",
    },
    tags: {
      native:   ["#islam", "#quran", "#dua", "#alhamdulillah", "#muslim"],
      diaspora: ["#islam", "#muslim", "#dua", "#quran", "#ramadan", "#muslimtiktok"],
      seeker:   ["#prayer", "#peace", "#anxiety", "#spirituality"],
    },
    perId: {
      "ayat-al-kursi": { search: "Ayatul Kursi meaning before sleep", nativeTags: ["#ayatulkursi", "#آية_الكرسي", "#sleep"] },
      "al-fatiha": { search: "Surah Al-Fatiha meaning in English", nativeTags: ["#alfatiha", "#الفاتحة"] },
      "dua-anxiety": { search: "dua for anxiety and stress", nativeTags: ["#duaforanxiety", "#stress"] },
      "dua-morning": { search: "morning dua with meaning", nativeTags: ["#morningdua", "#adhkar"] },
      "three-quls": { search: "3 Quls before sleep with meaning", nativeTags: ["#3quls", "#المعوذات", "#sleep", "#surahikhlas"] },
      "dua-before-sleep": { search: "dua before sleeping with meaning", nativeTags: ["#duabeforesleep", "#sleep", "#adhkar"] },
    },
    festivals: [
      { name: "Ramadan", start: "2027-02-08", end: "2027-03-08", prefer: ["al-fatiha", "dua-morning", "ayat-al-kursi", "three-quls", "dua-anxiety", "dua-before-sleep", "hasbunallah", "dua-yunus"], tag: "#ramadan" },
    ],
  },
  sikh: {
    defaultSegment: "diaspora",
    tz: "America/Vancouver", morning: "06:30", evening: "19:30",
    regions: ["IN", "CA", "GB", "US", "AU", "IT", "MY"],
    // Diaspora Sikhs say plainly that they want Gurbani with meaning in English.
    formats: ["meaning in English", "with meaning", "translation", "explained"],
    titles: {
      native:   "{native} | {title} — ਅਰਥ ਸਹਿਤ",
      diaspora: "{title} — Gurbani with meaning in English",
      seeker:   "{title}: what the Sikh scripture says, line by line",
    },
    tags: {
      native:   ["#ਗੁਰਬਾਣੀ", "#ਵਾਹਿਗੁਰੂ", "#gurbani", "#waheguru"],
      diaspora: ["#sikh", "#gurbani", "#waheguru", "#punjabi", "#sikhi", "#surrey", "#brampton", "#southall"],
      seeker:   ["#wisdom", "#spirituality", "#peace", "#meditation"],
    },
    perId: {
      "mool-mantar": { search: "Mool Mantar meaning in English", nativeTags: ["#moolmantar", "#ੴ"] },
      "hukam-rajai-chalna": { search: "Japji Sahib meaning in English", nativeTags: ["#japjisahib"] },
    },
    festivals: [
      { name: "Guru Nanak Jayanti", start: "2026-11-23", end: "2026-11-24", prefer: ["mool-mantar", "hukam-rajai-chalna", "sarbat-da-bhala"], tag: "#gurpurab" },
      { name: "Vaisakhi", start: "2027-04-13", end: "2027-04-14", prefer: ["mool-mantar", "sarbat-da-bhala", "tati-vao-na-lagai"], tag: "#vaisakhi" },
    ],
  },
  buddhist: {
    defaultSegment: "seeker",
    tz: "America/Los_Angeles", morning: "06:30", evening: "21:00",
    regions: ["US", "TH", "LK", "MM", "VN", "GB", "DE", "AU"],
    formats: ["meaning", "chant", "for sleep", "meditation", "explained"],
    titles: {
      native:   "{title} — {kind} with meaning",
      diaspora: "{title} — {kind} with meaning",
      seeker:   "{title}: a Buddhist {kindLower} for {occasionWord}, explained",
      seekerAny: "{title}: a Buddhist {kindLower}, explained",
    },
    tags: {
      native:   ["#buddhism", "#dhamma", "#metta", "#chant"],
      diaspora: ["#buddhism", "#dhamma", "#metta", "#chant"],
      seeker:   ["#meditation", "#mindfulness", "#lovingkindness", "#calm", "#anxiety"],
    },
    perId: {
      "metta-sutta": { search: "Metta Sutta chant with meaning", nativeTags: ["#mettasutta", "#lovingkindness"] },
      "om-mani-padme-hum": { search: "Om Mani Padme Hum meaning", nativeTags: ["#ommanipadmehum", "#tibetan"] },
    },
    festivals: [],   // Vesak 2027 not yet published with confidence — add when verified.
  },
  taoist: {
    defaultSegment: "seeker",
    tz: "America/Los_Angeles", morning: "06:30", evening: "21:00",
    regions: ["US", "GB", "DE", "CA", "AU", "TW", "SG"],
    formats: ["explained", "meaning", "Lao Tzu", "quotes", "philosophy"],
    titles: {
      native:   "{native} | {title} — Tao Te Ching explained",
      diaspora: "{title} — Tao Te Ching explained",
      seeker:   "Lao Tzu on {occasionWord}: {title}",
      seekerAny: "Lao Tzu: {title}",
    },
    tags: {
      native:   ["#道德经", "#老子", "#taoism"],
      diaspora: ["#taoism", "#taoteching", "#laozi", "#philosophy"],
      seeker:   ["#stoicism", "#philosophy", "#wisdom", "#mindset", "#calm"],
    },
    perId: {},
    festivals: [],
  },
  universal: {
    defaultSegment: "seeker",
    tz: "America/New_York", morning: "06:30", evening: "20:30",
    regions: ["US", "GB", "CA", "AU", "IE", "IN"],
    formats: ["poem", "blessing", "explained", "meaning"],
    titles: {
      native:   "{title} — read slowly, with meaning",
      diaspora: "{title} — read slowly, with meaning",
      seeker:   "{title} — the {kindLower} people send when words run out",
    },
    tags: {
      native:   ["#poetry", "#blessing", "#wisdom"],
      diaspora: ["#poetry", "#blessing", "#wisdom"],
      seeker:   ["#poetry", "#wisdom", "#mindfulness", "#selfcare", "#quotes"],
    },
    perId: {
      "irish-blessing": { search: "May the road rise to meet you blessing", nativeTags: ["#irishblessing", "#ireland"] },
      "desiderata": { search: "Desiderata poem read aloud", nativeTags: ["#desiderata"] },
    },
    festivals: [
      { name: "St Patrick's Day", start: "2027-03-17", end: "2027-03-17", prefer: ["irish-blessing"], tag: "#stpatricksday" },
    ],
  },
};

const AUDIENCE_SEGMENTS = {
  native:   { label: "Homeland — native script & voice" },
  diaspora: { label: "Diaspora — English-first believers" },
  seeker:   { label: "Seekers — outside the tradition" },
};

// Words the title formulas can use, per occasion.
const OCCASION_WORDS = {
  morning: { word: "the morning", phrase: "when they wake" }, evening: { word: "the evening", phrase: "at the end of the day" },
  protection: { word: "protection", phrase: "when they feel unsafe" }, peace: { word: "peace", phrase: "when the mind will not settle" },
  gratitude: { word: "gratitude", phrase: "when they want to say thank you" }, courage: { word: "courage", phrase: "when the odds are against them" },
  healing: { word: "healing", phrase: "for someone who is ill" }, grief: { word: "grief", phrase: "when they have lost someone" },
  beginnings: { word: "a new beginning", phrase: "before starting something" }, anytime: { word: "any day", phrase: "every day" },
};

function audienceFor(p) { return AUDIENCES[p.tradition] || AUDIENCES.universal; }

// The title for a segment: the exact search phrase people use when we know
// it, otherwise the segment's formula. Always ≤ 100 chars before tags.
function audienceTitle(p, segment) {
  const a = audienceFor(p);
  const per = a.perId[p.id];
  const kind = (typeof prayerKindLabel === "function") ? prayerKindLabel(p) : "Prayer";
  const occ = OCCASION_WORDS[p.occasion] || OCCASION_WORDS.anytime;
  let t;
  if (per && per.search && segment !== "native") {
    // The known search phrase, plus the title stem when the phrase doesn't already carry it.
    const stem = p.title.split(/ [—–] /)[0];
    t = per.search.toLowerCase().indexOf(stem.toLowerCase().split(" ")[0]) !== -1 ? per.search : `${per.search} | ${stem}`;
  }
  else t = ((segment === "seeker" && p.occasion === "anytime" && a.titles.seekerAny) || a.titles[segment] || a.titles.diaspora)
    .replace("{native}", p.native || p.title).replace("{title}", p.title)
    .replace("{kind}", kind).replace("{kindLower}", kind.toLowerCase())
    .replace("{occasionWord}", occ.word).replace("{occasionPhrase}", occ.phrase);
  return t.replace(/\s+/g, " ").trim();
}

// Segment tags + the entry's own native tags, deduplicated, in order of
// specificity (entry → segment → tradition).
function audienceTags(p, segment) {
  const a = audienceFor(p);
  const per = a.perId[p.id];
  const out = [];
  const add = (t) => { const k = String(t).replace(/^#/, ""); if (k && !out.some((x) => x.toLowerCase() === k.toLowerCase())) out.push(k); };
  (per && per.nativeTags || []).forEach(add);
  (a.tags[segment] || a.tags.diaspora).forEach(add);
  return out;
}

/* ---------------------------------------------------------------- */
/*  Festivals                                                        */
/* ---------------------------------------------------------------- */
function _dstr(d) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; }

// Every festival window that covers the date, across traditions.
function festivalsOn(date) {
  const s = _dstr(date);
  const out = [];
  Object.entries(AUDIENCES).forEach(([trad, a]) => {
    (a.festivals || []).forEach((f) => { if (s >= f.start && s <= f.end) out.push(Object.assign({ tradition: trad }, f)); });
  });
  return out;
}

// The devotion for a date, festival-aware: inside a festival window the day
// goes to that festival's preferred entries (cycling through them), otherwise
// the regular rotation. Two overlapping festivals alternate by day.
function devotionForDay(date) {
  const fs = festivalsOn(date);
  if (!fs.length || typeof prayerById !== "function") return { p: prayerForDay(date), festival: null };
  const doy = Math.floor((Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - Date.UTC(date.getFullYear(), 0, 0)) / 86400000);
  const f = fs[doy % fs.length];
  const [fy, fm, fd] = f.start.split("-").map(Number);
  const startDoy = Math.round((Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - Date.UTC(fy, fm - 1, fd)) / 86400000);
  const p = prayerById(f.prefer[Math.max(0, startDoy) % f.prefer.length]) || prayerForDay(date);
  return { p, festival: f };
}

/* ---------------------------------------------------------------- */
/*  Publish time in the audience's own morning                       */
/* ---------------------------------------------------------------- */
// "07:30 in Asia/Kolkata on 2026-10-11" → ISO instant. Uses Intl to find the
// zone's offset for that date, so DST is handled without a library.
function zonedToIso(dateStr, timeStr, tz) {
  const [y, mo, d] = dateStr.split("-").map(Number);
  const [h, mi] = timeStr.split(":").map(Number);
  const guess = Date.UTC(y, mo - 1, d, h, mi, 0);
  const offsetAt = (ms) => {
    const parts = new Intl.DateTimeFormat("en-US", { timeZone: tz, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" }).formatToParts(new Date(ms));
    const g = (t) => Number(parts.find((x) => x.type === t).value);
    return Date.UTC(g("year"), g("month") - 1, g("day"), g("hour") % 24, g("minute"), g("second")) - ms;
  };
  let ms = guess - offsetAt(guess);
  ms = guess - offsetAt(ms);   // second pass settles a DST edge
  return new Date(ms).toISOString();
}
function audiencePublishIso(p, dateStr, slot) {
  const a = audienceFor(p);
  return zonedToIso(dateStr, slot === "evening" ? a.evening : a.morning, a.tz);
}
