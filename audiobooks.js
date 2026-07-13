// audiobooks.js
// Turns EverVerse's verse + meaning + sermon library into full audiobooks:
// a narratable chapter script, a printable manuscript (for KDP / offline reading),
// a ready-to-paste Amazon/Audible/Pinterest listing, and a square cover.
// Ordered by the depth of content we hold (verses + reflections) per tradition.

const AUDIOBOOKS = [
  {
    id: "still-waters",
    faith: "Bible",
    palette: "calm",
    title: "Still Waters",
    subtitle: "Daily Comfort and Courage from the Bible",
    sourceName: "the Holy Bible",
    intro:
      "For centuries, people in every kind of weather — grief and joy, fear and hope — have returned to these words and found solid ground. " +
      "In this collection you'll hear a verse, and then its meaning in plain, modern language, so it lands not just in your ears but in your day.",
    closing:
      "That is the end of our reading. However today has treated you, may you rest tonight like water gone still. " +
      "You are seen. You are loved. You are not carrying it alone. This has been a production of EverVerse. Find a new blessing each day at eververse dot org.",
    categories: ["Religion & Spirituality > Christianity", "Self-Development > Meditation"],
    keywords: ["daily bible verses", "christian meditation", "scripture and meaning", "faith comfort", "devotional audiobook", "bible for anxiety"],
    pinterest: "Still Waters 🕊️ — a daily Bible verse with its meaning in plain words. Listen free, read offline. Peace for anxious days. #Bible #DailyDevotional #Faith",
  },
  {
    id: "steady-flame",
    faith: "Gita",
    palette: "gold",
    title: "The Steady Flame",
    subtitle: "Timeless Wisdom from the Bhagavad Gita",
    sourceName: "the Bhagavad Gita",
    intro:
      "The Bhagavad Gita is a conversation about how to act with a clear heart in a confusing world — how to do your duty without being ruled by fear or reward. " +
      "Here each teaching is spoken, then unfolded in plain language you can use the moment you switch off your phone.",
    closing:
      "Our reading is complete. Like a lamp in a windless place, may your mind grow steady and bright. " +
      "Carry this calm into whatever you do next. This has been a production of EverVerse. A new reflection waits for you each day at eververse dot org.",
    categories: ["Religion & Spirituality > Hinduism", "Self-Development > Personal Success"],
    keywords: ["bhagavad gita audiobook", "gita in english", "hindu wisdom", "karma yoga", "spiritual meditation", "gita meaning"],
    pinterest: "The Steady Flame 🪔 — timeless verses of the Bhagavad Gita, each explained in plain words. Free to listen, offline to keep. #BhagavadGita #Wisdom #Meditation",
  },
  {
    id: "guarded-mind",
    faith: "Dhammapada",
    palette: "forest",
    title: "The Guarded Mind",
    subtitle: "Verses on Peace and Clarity from the Dhammapada",
    sourceName: "the Dhammapada",
    intro:
      "The Dhammapada is a collection of short, sharp verses on how the mind works — and how, by watching it, we set ourselves free. " +
      "Each line here is read aloud and then opened up in everyday language, a small practice you can return to again and again.",
    closing:
      "That completes our reading. Guard your mind gently, as you would a quiet flame, and let your kindness reach in every direction. " +
      "This has been a production of EverVerse. Find a new verse to sit with each day at eververse dot org.",
    categories: ["Religion & Spirituality > Buddhism", "Self-Development > Meditation"],
    keywords: ["dhammapada audiobook", "buddhist verses", "mindfulness meditation", "buddhism for beginners", "calm the mind", "dhammapada meaning"],
    pinterest: "The Guarded Mind 🌿 — the Dhammapada's verses on peace, each in plain words. Listen free, keep offline. Quiet for a busy mind. #Dhammapada #Mindfulness #Buddhism",
  },
  {
    id: "one-light",
    faith: "Sikh",
    palette: "royal",
    title: "One Light",
    subtitle: "Reflections from the Guru Granth Sahib",
    sourceName: "the Guru Granth Sahib",
    intro:
      "The Guru Granth Sahib sings of one Light living in all people — and of a life of honest work, remembrance, and sharing. " +
      "In this collection each teaching is spoken and then explained simply, so its warmth reaches your ordinary day.",
    closing:
      "Our reading is finished. See the one Light in every face you meet, earn honestly, and share freely. " +
      "This has been a production of EverVerse. A new blessing arrives each day at eververse dot org.",
    categories: ["Religion & Spirituality > Sikhism", "Self-Development > Spiritual Growth"],
    keywords: ["guru granth sahib english", "sikh scripture audiobook", "gurbani meaning", "sikhism wisdom", "spiritual reflections", "one light"],
    pinterest: "One Light ☀️ — reflections from the Guru Granth Sahib, each in plain words. Free to listen, offline to keep. #GuruGranthSahib #Sikhi #Wisdom",
  },
  {
    id: "heart-without-walls",
    faith: "Tripitaka",
    palette: "night",
    title: "A Heart Without Walls",
    subtitle: "Teachings on Loving-Kindness from the Tripitaka",
    sourceName: "the Tripitaka",
    intro:
      "The Tripitaka gathers the earliest recorded teachings of the Buddha — on suffering and its ending, and on a love that holds no one outside it. " +
      "Each teaching here is read aloud and then unfolded in plain language, an invitation to a wider, softer heart.",
    closing:
      "That is the close of our reading. Let your kindness flow outward through the whole world, above, below, and all around, without limit. " +
      "This has been a production of EverVerse. Find a new teaching to rest in each day at eververse dot org.",
    categories: ["Religion & Spirituality > Buddhism", "Self-Development > Meditation"],
    keywords: ["tripitaka audiobook", "buddha teachings", "metta loving kindness", "early buddhism", "pali canon english", "meditation audiobook"],
    pinterest: "A Heart Without Walls 🌌 — the Buddha's teachings on loving-kindness, each in plain words. Listen free, keep offline. #Buddha #Metta #Meditation",
  },
];

function audiobookById(id) { return AUDIOBOOKS.find((b) => b.id === id) || AUDIOBOOKS[0]; }
function versesForFaith(faith) { return (typeof VERSE_DB !== "undefined" ? VERSE_DB : []).filter((v) => v.faith === faith); }
function sermonsForFaith(faith) { return (typeof SERMONS !== "undefined" ? SERMONS : []).filter((s) => s.faith === faith); }

// --- Chapter scripts (what the narrator actually says) --------------------
function verseChapterScript(v, n, book) {
  return (
    `Verse ${n}. From ${book.sourceName}. ${v.ref}. ` +
    `${v.text} ` +
    `In plain words. ${meaningFor(v)} ` +
    `Take a slow breath, and carry this with you.`
  );
}

function sermonChapterScript(s) {
  return (
    `A reflection. ${s.title}. ` +
    `This draws on ${s.verseRef}. ${s.verseText} ` +
    `${(s.body || []).join(" ")} ` +
    `To carry with you: ${s.takeaway}`
  );
}

// Build the full ordered chapter list for a book from the live library.
function buildAudiobookChapters(book) {
  const chapters = [];
  chapters.push({
    kind: "open",
    title: "Opening",
    script:
      `${book.title}. ${book.subtitle}. A production of EverVerse. ` +
      `${book.intro} ` +
      `Find a comfortable place, let your shoulders drop, and let's begin.`,
  });

  const verses = versesForFaith(book.faith);
  verses.forEach((v, i) => chapters.push({ kind: "verse", title: `${v.ref}`, script: verseChapterScript(v, i + 1, book) }));

  const serms = sermonsForFaith(book.faith);
  if (serms.length) {
    chapters.push({ kind: "part", title: "Reflections", script: `Part two. Reflections. A few of these verses, opened a little wider.` });
    serms.forEach((s) => chapters.push({ kind: "sermon", title: `Reflection — ${s.title}`, script: sermonChapterScript(s) }));
  }

  chapters.push({ kind: "close", title: "Closing blessing", script: book.closing });
  return chapters;
}

// --- Estimates ------------------------------------------------------------
function countWords(str) { return (str.trim().match(/\S+/g) || []).length; }
function audiobookStats(chapters) {
  let words = 0, chars = 0;
  chapters.forEach((c) => { words += countWords(c.script); chars += c.script.length; });
  const minutes = words / 150; // ~150 spoken words per minute
  return { chapters: chapters.length, words, chars, minutes };
}
function fmtDuration(minutes) {
  const total = Math.max(1, Math.round(minutes));
  const h = Math.floor(total / 60), m = total % 60;
  return h ? `${h} hr ${m} min` : `${m} min`;
}

// --- Manuscript (for KDP ebook / offline reading / show notes) ------------
function audiobookManuscript(book, chapters) {
  const lines = [];
  lines.push(book.title.toUpperCase());
  lines.push(book.subtitle);
  lines.push("A production of EverVerse — eververse.org");
  lines.push("");
  lines.push("=".repeat(60));
  lines.push("");
  chapters.forEach((c, i) => {
    const label = c.kind === "verse" ? `${i}. ${c.title}` : c.title;
    lines.push(label);
    lines.push("-".repeat(Math.min(60, label.length + 4)));
    // Re-flow the spoken script into readable paragraphs.
    lines.push(c.script.replace(/\s+/g, " ").trim());
    lines.push("");
  });
  lines.push("=".repeat(60));
  lines.push("© EverVerse. Scripture renderings are widely used public-domain English translations; plain-language meanings are original to EverVerse.");
  return lines.join("\n");
}

// --- Store listing (Amazon KDP / Audible ACX / Pinterest) -----------------
function audiobookListing(book, chapters, stats) {
  const L = [];
  L.push(`AUDIOBOOK LISTING — ${book.title}`);
  L.push("=".repeat(60));
  L.push("");
  L.push("TITLE:");
  L.push(book.title);
  L.push("");
  L.push("SUBTITLE:");
  L.push(book.subtitle);
  L.push("");
  L.push("AUTHOR / PROVIDED BY: EverVerse");
  L.push("NARRATED BY: EverVerse (AI narration)");
  L.push(`RUN TIME (approx): ${fmtDuration(stats.minutes)}   •   CHAPTERS: ${stats.chapters}   •   WORDS: ${stats.words.toLocaleString()}`);
  L.push("");
  L.push("DESCRIPTION (Amazon / Audible):");
  L.push(
    `${book.title} — ${book.subtitle}.\n\n` +
    `${book.intro}\n\n` +
    `Every chapter follows the same calm rhythm: a short reading, then its meaning in plain, modern words you can actually use. ` +
    `It's made to be listened to on a commute, a walk, or in the quiet before sleep — and to be returned to, one verse at a time. ` +
    `Whether this tradition is your lifelong home or somewhere you're visiting with an open mind, you're welcome here.\n\n` +
    `From EverVerse, a global home for daily faith and wellness — a new blessing every day at eververse.org.`
  );
  L.push("");
  L.push("CATEGORIES:");
  book.categories.forEach((c) => L.push("  • " + c));
  L.push("");
  L.push("KEYWORDS / SEARCH TERMS:");
  L.push("  " + book.keywords.join(", "));
  L.push("");
  L.push("PINTEREST PIN CAPTION:");
  L.push("  " + book.pinterest);
  L.push("");
  L.push("CHAPTER LIST (upload one MP3 per chapter to ACX):");
  chapters.forEach((c, i) => L.push(`  ${String(i).padStart(2, "0")}  ${c.title}`));
  L.push("");
  L.push("ACX / AUDIBLE CHECKLIST:");
  L.push("  • One audio file per chapter (this tool exports them, already numbered).");
  L.push("  • Add a 'retail audio sample' (1–5 min) — use the Opening plus verse 1.");
  L.push("  • Opening credits (title + author) and closing credits are built into the audio.");
  L.push("  • Cover art: square JPG/PNG, 2400×2400 — exported alongside the chapters.");
  L.push("  • ACX masters to MP3, 192kbps+, ~ -18 dB RMS, -3 dB peak. If a track is rejected");
  L.push("    for loudness, run the ZIP through a free normalizer (e.g. Auphonic) before upload.");
  return L.join("\n");
}

// --- PDF book (self-contained writer, standard Times fonts) ---------------
// Keeps everything ASCII so string length == byte length (xref offsets stay valid).
function asciiClean(s) {
  return (s || "")
    .normalize("NFKD").replace(/[̀-ͯ]/g, "")
    .replace(/[‘’‚‹›]/g, "'")
    .replace(/[“”„«»]/g, '"')
    .replace(/[–—―]/g, "-")
    .replace(/…/g, "...")
    .replace(/[^\x20-\x7E]/g, "");
}

function createBookPdfBlob(book) {
  const PW = 432, PH = 648, ML = 56, MR = 56, MT = 66, MB = 64; // 6x9" trade paperback
  const usableW = PW - ML - MR;
  const meas = document.createElement("canvas").getContext("2d");
  const fontCss = (size, font) =>
    `${font === "F3" ? "italic " : ""}${font === "F2" ? "700" : "400"} ${size}px "Times New Roman", Georgia, serif`;
  const textWidth = (t, size, font) => { meas.font = fontCss(size, font); return meas.measureText(asciiClean(t)).width; };
  function wrap(t, size, font) {
    meas.font = fontCss(size, font);
    const words = asciiClean(t).split(/\s+/).filter(Boolean); const lines = []; let cur = "";
    for (const w of words) { const test = cur ? cur + " " + w : w; if (meas.measureText(test).width > usableW && cur) { lines.push(cur); cur = w; } else cur = test; }
    if (cur) lines.push(cur); return lines;
  }
  const pages = []; let cur = []; let y = PH - MT;
  function newPage() { pages.push(cur); cur = []; y = PH - MT; }
  function ensure(h) { if (y - h < MB) newPage(); }
  function gap(h) { ensure(h); y -= h; }
  function para(text, size, font, leading, opts) {
    opts = opts || {};
    wrap(text, size, font).forEach((ln) => {
      ensure(leading); y -= leading;
      const x = opts.center ? (PW - textWidth(ln, size, font)) / 2 : ML + (opts.indent || 0);
      cur.push({ x, y, size, font, text: ln });
    });
  }

  // Title page
  y = PH - 200;
  para(book.title, 30, "F2", 34, { center: true });
  gap(8); para(book.subtitle, 14, "F3", 20, { center: true });
  gap(30); para("* * *", 12, "F1", 16, { center: true });
  y = 150; para("A production of EverVerse", 11, "F1", 16, { center: true });
  para("eververse.org", 11, "F1", 16, { center: true });
  newPage();

  // Introduction
  para("Introduction", 16, "F2", 24); gap(6);
  para(book.intro, 11.5, "F1", 16.5);
  newPage();

  // Verses
  versesForFaith(book.faith).forEach((v, i) => {
    gap(16); ensure(64);
    para(`${i + 1}. ${v.ref}`, 12.5, "F2", 17); gap(3);
    para(v.text, 11.5, "F3", 16.5); gap(3);
    para(`In simple words: ${meaningFor(v)}`, 11.5, "F1", 16.5);
  });

  // Reflections
  const serms = sermonsForFaith(book.faith);
  if (serms.length) {
    newPage();
    para("Reflections", 18, "F2", 26, { center: true }); gap(10);
    serms.forEach((s) => {
      gap(18); ensure(74);
      para(s.title, 14, "F2", 19);
      para(`On ${s.verseRef}`, 10.5, "F3", 15); gap(4);
      para(s.verseText, 11.5, "F3", 16.5); gap(4);
      (s.body || []).forEach((p) => { para(p, 11.5, "F1", 16.5); gap(4); });
      para(`To carry with you: ${s.takeaway}`, 11.5, "F2", 16.5);
    });
  }

  // Colophon
  newPage();
  y = PH * 0.55;
  para(book.closing.replace(/This has been a production.*$/i, "").trim(), 12, "F3", 18, { center: true });
  gap(24);
  para("EverVerse - a new blessing every day at eververse.org", 10.5, "F1", 15, { center: true });
  newPage(); // flush last page

  // Page numbers (skip the title page)
  pages.forEach((items, idx) => {
    if (idx === 0) return;
    const label = String(idx + 1);
    items.push({ x: (PW - textWidth(label, 9, "F1")) / 2, y: MB - 28, size: 9, font: "F1", text: label });
  });

  return assemblePdf(pages, PW, PH);
}

function assemblePdf(pages, PW, PH) {
  const esc = (s) => asciiClean(s).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
  const objects = [];
  objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";
  objects[3] = "<< /Type /Font /Subtype /Type1 /BaseFont /Times-Roman /Encoding /WinAnsiEncoding >>";
  objects[4] = "<< /Type /Font /Subtype /Type1 /BaseFont /Times-Bold /Encoding /WinAnsiEncoding >>";
  objects[5] = "<< /Type /Font /Subtype /Type1 /BaseFont /Times-Italic /Encoding /WinAnsiEncoding >>";
  const pageIds = []; let nextId = 6;
  pages.forEach((items) => {
    const contentId = nextId++, pageId = nextId++;
    let stream = "";
    items.forEach((it) => { stream += `BT /${it.font} ${it.size} Tf ${it.x.toFixed(2)} ${it.y.toFixed(2)} Td (${esc(it.text)}) Tj ET\n`; });
    objects[contentId] = `<< /Length ${stream.length} >>\nstream\n${stream}endstream`;
    objects[pageId] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PW} ${PH}] /Resources << /Font << /F1 3 0 R /F2 4 0 R /F3 5 0 R >> >> /Contents ${contentId} 0 R >>`;
    pageIds.push(pageId);
  });
  objects[2] = `<< /Type /Pages /Kids [${pageIds.map((id) => id + " 0 R").join(" ")}] /Count ${pageIds.length} >>`;

  let pdf = "%PDF-1.4\n";
  const offsets = []; const maxId = nextId - 1;
  for (let id = 1; id <= maxId; id++) { offsets[id] = pdf.length; pdf += `${id} 0 obj\n${objects[id]}\nendobj\n`; }
  const xrefStart = pdf.length;
  pdf += `xref\n0 ${maxId + 1}\n0000000000 65535 f \n`;
  for (let id = 1; id <= maxId; id++) pdf += String(offsets[id]).padStart(10, "0") + " 00000 n \n";
  pdf += `trailer\n<< /Size ${maxId + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
  return new Blob([pdf], { type: "application/pdf" });
}

// --- Illustrated "picture book" PDF (embeds the verse-art images) ---------
// A separate byte-based writer (the text writer is ASCII-only); JPEG image
// XObjects need real binary offsets, so we assemble Uint8Array chunks.
function drawTextBanner(canvas, title, subtitle, paletteKey, W, H) {
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");
  const pal = (typeof THEME_PALETTES !== "undefined" && THEME_PALETTES[paletteKey]) || { stops: ["#41295a", "#2f0743"], text: "#fff", accent: "#c9a9ff" };
  const g = ctx.createLinearGradient(0, 0, W, H); g.addColorStop(0, pal.stops[0]); g.addColorStop(1, pal.stops[1]);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const vg = ctx.createRadialGradient(W / 2, H * 0.45, Math.min(W, H) * 0.1, W / 2, H / 2, Math.max(W, H) * 0.72);
  vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,0,0,0.34)"); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  ctx.textAlign = "center";
  ctx.fillStyle = pal.accent; ctx.font = `${W * 0.05}px Georgia, serif`; ctx.fillText("✦", W / 2, H * 0.30);
  ctx.fillStyle = pal.text;
  const size = W * 0.072; ctx.font = `700 ${size}px Georgia, serif`;
  const words = (title || "").split(" "); const lines = []; let c = "";
  words.forEach((w) => { const t = c ? c + " " + w : w; if (ctx.measureText(t).width > W * 0.8 && c) { lines.push(c); c = w; } else c = t; });
  if (c) lines.push(c);
  let ty = H * 0.5 - (lines.length - 1) * size * 0.6;
  lines.forEach((ln) => { ctx.fillText(ln, W / 2, ty); ty += size * 1.2; });
  if (subtitle) { ctx.fillStyle = pal.accent; ctx.font = `italic ${W * 0.038}px Georgia, serif`; ctx.fillText(subtitle, W / 2, ty + H * 0.03); }
  return canvas;
}

async function createPictureBookPdfBlob(book, onProgress) {
  const PW = 432, PH = 648, ML = 54, MR = 54, MT = 58, MB = 54;
  const usableW = PW - ML - MR;
  const meas = document.createElement("canvas").getContext("2d");
  const esc = (s) => asciiClean(s).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
  const fontCss = (size, font) => `${font === "F3" ? "italic " : ""}${font === "F2" ? "700" : "400"} ${size}px "Times New Roman", Georgia, serif`;
  const imgs = []; const pages = []; let pg = null; let y = 0;
  function startPage(plate) { pg = { ops: "", imgs: {}, plate: !!plate }; pages.push(pg); y = PH - MT; }
  function ensure(h) { if (y - h < MB) startPage(); }
  function gap(h) { ensure(h); y -= h; }
  function line(str, size, font, x, yy) { pg.ops += `BT /${font} ${size} Tf ${x.toFixed(2)} ${yy.toFixed(2)} Td (${esc(str)}) Tj ET\n`; }
  function wrap(t, size, font, w) {
    meas.font = fontCss(size, font); const words = asciiClean(t).split(/\s+/).filter(Boolean); const L = []; let c = "";
    for (const wd of words) { const test = c ? c + " " + wd : wd; if (meas.measureText(test).width > w && c) { L.push(c); c = wd; } else c = test; }
    if (c) L.push(c); return L;
  }
  function centerX(str, size, font) { meas.font = fontCss(size, font); return (PW - meas.measureText(asciiClean(str)).width) / 2; }
  function para(text, size, font, leading, opts) {
    opts = opts || {}; const w = opts.w || usableW;
    wrap(text, size, font, w).forEach((ln) => { ensure(leading); y -= leading; line(ln, size, font, opts.center ? centerX(ln, size, font) : ML, y); });
  }
  function placeImage(canvas, x, yy, w, h) {
    const bytes = dataUrlToBytes(canvas.toDataURL("image/jpeg", 0.82));
    imgs.push({ w: canvas.width, h: canvas.height, bytes }); const idx = imgs.length - 1;
    pg.imgs["Im" + idx] = idx;
    pg.ops += `q ${w.toFixed(2)} 0 0 ${h.toFixed(2)} ${x.toFixed(2)} ${yy.toFixed(2)} cm /Im${idx} Do Q\n`;
  }

  // Cover (full-bleed)
  startPage(true);
  { const c = document.createElement("canvas"); drawAudiobookCover(c, book, 1000); placeImage(c, 0, 0, PW, PH); }

  // Introduction
  startPage();
  para(book.title, 20, "F2", 26, { center: true }); gap(4);
  para(book.subtitle, 12, "F3", 17, { center: true }); gap(22);
  para(book.intro, 12, "F1", 17);

  // Verses — one illustrated page each
  const verses = versesForFaith(book.faith);
  for (let i = 0; i < verses.length; i++) {
    const v = verses[i];
    startPage();
    const c = document.createElement("canvas");
    renderVerse(c, 760, 760, { text: v.text, ref: v.ref, paletteKey: v.theme, bgKey: (typeof bgForVerseApp === "function" ? bgForVerseApp(v) : "gradient"), watermark: true, showRef: true });
    const top = (PH - MT) - usableW;              // square art, full content width
    placeImage(c, ML, top, usableW, usableW);
    y = top - 22;
    line("IN SIMPLE WORDS", 9.5, "F2", ML, y); y -= 16;
    para(meaningFor(v), 12, "F1", 17);
    if (onProgress && i % 6 === 0) { onProgress(i, verses.length); await new Promise((r) => setTimeout(r)); }
  }

  // Reflections
  const serms = sermonsForFaith(book.faith);
  if (serms.length) {
    startPage(true);
    { const c = document.createElement("canvas"); drawTextBanner(c, "Reflections", book.subtitle, book.palette, 1000, 1000); placeImage(c, 0, 0, PW, PH); }
    serms.forEach((s) => {
      startPage();
      const c = document.createElement("canvas"); drawTextBanner(c, s.title, "On " + s.verseRef, book.palette, 1000, 560);
      const bh = usableW * 0.56, top = (PH - MT) - bh;
      placeImage(c, ML, top, usableW, bh); y = top - 20;
      para(s.verseText, 11.5, "F3", 16.5); gap(6);
      (s.body || []).forEach((p) => { para(p, 11.5, "F1", 16.5); gap(5); });
      para("To carry with you: " + s.takeaway, 11.5, "F2", 16.5);
    });
  }

  // Closing plate
  startPage(true);
  { const c = document.createElement("canvas"); drawTextBanner(c, book.closing.replace(/This has been a production.*$/i, "").trim().split(". ")[0], "eververse.org", book.palette, 1000, 1000); placeImage(c, 0, 0, PW, PH); }

  // Page numbers (skip full-bleed plate pages)
  meas.font = fontCss(9, "F1");
  pages.forEach((p, idx) => { if (idx === 0 || p.plate) return; const lbl = String(idx + 1); p.ops += `BT /F1 9 Tf ${((PW - meas.measureText(lbl).width) / 2).toFixed(2)} ${(MB - 30).toFixed(2)} Td (${lbl}) Tj ET\n`; });

  return assemblePdfImages(pages, imgs, PW, PH);
}

function assemblePdfImages(pages, imgs, PW, PH) {
  const enc = new TextEncoder();
  const chunks = []; let offset = 0; const offsets = [];
  const pushStr = (s) => { const b = enc.encode(s); chunks.push(b); offset += b.length; };
  const pushBytes = (b) => { chunks.push(b); offset += b.length; };
  pushBytes(new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x34, 0x0A, 0x25, 0xE2, 0xE3, 0xCF, 0xD3, 0x0A])); // %PDF-1.4 + binary marker

  const nImg = imgs.length, base = 6 + nImg;
  const contentId = (p) => base + 2 * p, pageId = (p) => base + 2 * p + 1;
  const strObj = {};
  strObj[1] = "<< /Type /Catalog /Pages 2 0 R >>";
  strObj[2] = `<< /Type /Pages /Kids [${pages.map((_, p) => pageId(p) + " 0 R").join(" ")}] /Count ${pages.length} >>`;
  strObj[3] = "<< /Type /Font /Subtype /Type1 /BaseFont /Times-Roman /Encoding /WinAnsiEncoding >>";
  strObj[4] = "<< /Type /Font /Subtype /Type1 /BaseFont /Times-Bold /Encoding /WinAnsiEncoding >>";
  strObj[5] = "<< /Type /Font /Subtype /Type1 /BaseFont /Times-Italic /Encoding /WinAnsiEncoding >>";
  pages.forEach((p, i) => {
    strObj[contentId(i)] = `<< /Length ${enc.encode(p.ops).length} >>\nstream\n${p.ops}endstream`;
    const xobj = Object.keys(p.imgs).map((name) => `/${name} ${6 + p.imgs[name]} 0 R`).join(" ");
    strObj[pageId(i)] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PW} ${PH}] /Resources << /Font << /F1 3 0 R /F2 4 0 R /F3 5 0 R >>${xobj ? ` /XObject << ${xobj} >>` : ""} >> /Contents ${contentId(i)} 0 R >>`;
  });

  const maxId = base + 2 * pages.length - 1;
  for (let id = 1; id <= maxId; id++) {
    offsets[id] = offset;
    pushStr(`${id} 0 obj\n`);
    if (id >= 6 && id < 6 + nImg) {
      const im = imgs[id - 6];
      pushStr(`<< /Type /XObject /Subtype /Image /Width ${im.w} /Height ${im.h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${im.bytes.length} >>\nstream\n`);
      pushBytes(im.bytes);
      pushStr(`\nendstream`);
    } else {
      pushStr(strObj[id]);
    }
    pushStr(`\nendobj\n`);
  }
  const xrefStart = offset;
  let xref = `xref\n0 ${maxId + 1}\n0000000000 65535 f \n`;
  for (let id = 1; id <= maxId; id++) xref += String(offsets[id]).padStart(10, "0") + " 00000 n \n";
  pushStr(xref);
  pushStr(`trailer\n<< /Size ${maxId + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`);
  return new Blob(chunks, { type: "application/pdf" });
}

// --- Cover art (square, brand-consistent) ---------------------------------
function drawAudiobookCover(canvas, book, size) {
  const S = size || 1400;
  canvas.width = S; canvas.height = S;
  const ctx = canvas.getContext("2d");
  const pal = (typeof THEME_PALETTES !== "undefined" && THEME_PALETTES[book.palette]) || { stops: ["#41295a", "#2f0743"], text: "#fff", accent: "#c9a9ff" };

  const g = ctx.createLinearGradient(0, 0, S, S);
  g.addColorStop(0, pal.stops[0]); g.addColorStop(1, pal.stops[1]);
  ctx.fillStyle = g; ctx.fillRect(0, 0, S, S);

  // soft vignette
  const vg = ctx.createRadialGradient(S / 2, S * 0.42, S * 0.1, S / 2, S / 2, S * 0.75);
  vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,0,0,0.35)");
  ctx.fillStyle = vg; ctx.fillRect(0, 0, S, S);

  // thin frame
  ctx.strokeStyle = pal.accent; ctx.globalAlpha = 0.5;
  ctx.lineWidth = S * 0.008; ctx.strokeRect(S * 0.06, S * 0.06, S * 0.88, S * 0.88);
  ctx.globalAlpha = 1;

  ctx.textAlign = "center";
  // mark
  ctx.fillStyle = pal.accent;
  ctx.font = `${S * 0.10}px Georgia, 'Times New Roman', serif`;
  ctx.fillText("✦", S / 2, S * 0.24);

  // tradition eyebrow
  ctx.fillStyle = pal.accent;
  ctx.font = `600 ${S * 0.032}px Georgia, serif`;
  const eyebrow = (typeof faithLabel === "function" ? faithLabel(book.faith) : book.faith).toUpperCase();
  ctx.fillText(letterSpaced(eyebrow, " "), S / 2, S * 0.315);

  // title (wrapped)
  ctx.fillStyle = pal.text;
  const titleWords = book.title.split(" ");
  const titleLines = wrapByWidth(ctx, titleWords, S * 0.78, S * 0.115, "700", "Georgia, serif");
  let ty = S * 0.44;
  titleLines.forEach((ln) => { ctx.font = `700 ${S * 0.115}px Georgia, serif`; ctx.fillText(ln, S / 2, ty); ty += S * 0.125; });

  // rule
  ctx.strokeStyle = pal.accent; ctx.globalAlpha = 0.7; ctx.lineWidth = S * 0.004;
  ctx.beginPath(); ctx.moveTo(S * 0.36, ty - S * 0.02); ctx.lineTo(S * 0.64, ty - S * 0.02); ctx.stroke();
  ctx.globalAlpha = 1;

  // subtitle (wrapped)
  ctx.fillStyle = pal.text;
  const subLines = wrapByWidth(ctx, book.subtitle.split(" "), S * 0.74, S * 0.040, "400", "Georgia, serif");
  let sy = ty + S * 0.05;
  subLines.forEach((ln) => { ctx.font = `italic 400 ${S * 0.040}px Georgia, serif`; ctx.fillText(ln, S / 2, sy); sy += S * 0.052; });

  // footer brand
  ctx.fillStyle = pal.accent;
  ctx.font = `600 ${S * 0.030}px Georgia, serif`;
  ctx.fillText(letterSpaced("EVERVERSE", " "), S / 2, S * 0.9);

  function letterSpaced(str, sep) { return str.split("").join(sep); }
  function wrapByWidth(c, words, maxW, fs, weight, fam) {
    c.font = `${weight} ${fs}px ${fam}`;
    const out = []; let cur = "";
    words.forEach((w) => {
      const test = cur ? cur + " " + w : w;
      if (c.measureText(test).width > maxW && cur) { out.push(cur); cur = w; } else cur = test;
    });
    if (cur) out.push(cur);
    return out;
  }
}
