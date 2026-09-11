// safety-lang.js
// Crisis and under-18 detection in the languages we actually offer.
//
// THE HOLE THIS CLOSES.
//
// world.js opened the Circle to 24 languages. The two classifiers that keep
// people alive and keep children out — risky() and looksLikeMinor() — were
// English only. So a Spanish speaker writing "quiero morir" got no crisis
// panel, no local helpline and no routing to a vetted guide, and a child
// writing "tengo 15 años" went straight into an adult queue. Every protection
// an English speaker had, a Spanish speaker did not.
//
// ─────────────────────────────────────────────────────────────────────────
//  NEEDS A NATIVE SPEAKER, PER LANGUAGE, BEFORE THAT LANGUAGE IS PROMOTED.
//
//  I wrote these. I am not a native speaker of any of them, and a missed
//  crisis phrase is the most expensive bug this codebase can have. Each
//  language carries a `checked` field naming the person who reviewed it.
//  Every one is null. CAMPAIGN.txt already says not to promote the Circle
//  in a language before its patterns exist — extend that: not before a
//  native speaker has read them.
// ─────────────────────────────────────────────────────────────────────────
//
// TWO DESIGN CONSTRAINTS THAT SHAPED EVERY PATTERN.
//
// 1. Crisis detection must be PRECISE, not merely sensitive. A flagged
//    request can only go to a companion or steward, and if none is free it
//    is refused outright. So a false positive does not cost a wasted panel —
//    it turns someone away. Every phrase below is unambiguous self-harm or
//    suicide language. General distress ("no aguanto más", "je n'en peux
//    plus") is deliberately NOT here, however tempting.
//
// 2. Minor detection must be FIRST PERSON. "mi hija tiene 14 años" is a
//    mother asking for help and must pass through untouched, while "tengo 14
//    años" must not. Romance and Slavic conjugation does this work for us;
//    for Hindi and Urdu the patterns require "main"/"میں".

/* JS word boundaries are ASCII-only — \b will not match before "мне" or
   "मैं", so every non-Latin pattern below anchors on whitespace instead.
   hitsMinor() pads the text with a space at each end to make that safe.
   This was not a theoretical problem: "мне 15 лет" was going undetected. */
const W0 = "(?:^|\\s)";   // start of a word, any script

/* Diacritics come off both sides before matching, because people type "anos"
   for "años" and "voce" for "você" constantly. Only U+0300–U+036F is
   stripped, which leaves Devanagari matras, Arabic harakat and Hangul
   untouched. */
function foldApostrophes(s) {
  return String(s || "").replace(/[’‘‛`´]/g, "'");
}

function foldText(s) {
  return foldApostrophes(s).toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[​-‍﻿]/g, "")
    .replace(/\s+/g, " ");
}

const LANG_SAFETY = {
  es: { level: "full", checked: null,
    crisis: ["quiero morir","quiero morirme","me quiero morir","ganas de morir",
             "matarme","me voy a matar","voy a matarme","me mato",
             "quitarme la vida","acabar con mi vida","terminar con mi vida",
             "suicidio","suicidarme","suicida","me suicido",
             "no quiero vivir","no quiero seguir viviendo","no quiero seguir aqui",
             "hacerme dano","lastimarme","autolesion","cortarme",
             "mejor sin mi","estarian mejor sin mi","mejor muerto","mejor muerta"],
    minor: [/\btengo\s+(?:solo\s+|apenas\s+)?(?:[89]|1[0-7])\s+anos\b/,
            /\btengo\s+(?:ocho|nueve|diez|once|doce|trece|catorce|quince|dieciseis|diecisiete)\s+anos\b/,
            /\bsoy\s+(?:un\s+|una\s+)?menor(?:\s+de\s+edad)?\b/,
            /\bestoy\s+en\s+(?:la\s+)?(?:primaria|secundaria|prepa|preparatoria)\b/,
            /\bmi\s+(?:mama|papa|madre|padre|mami|papi)\s+no\s+me\s+deja\b/,
            /\bsoy\s+(?:un\s+|una\s+)?(?:nino|nina|adolescente)\b/] },

  pt: { level: "full", checked: null,
    crisis: ["quero morrer","vontade de morrer","queria morrer",
             "me matar","vou me matar","tirar minha vida","acabar com a minha vida",
             "suicidio","suicidar","me suicidar",
             "nao quero viver","nao quero mais viver",
             "me machucar","me cortar","automutilacao",
             "melhor sem mim","seria melhor morto"],
    minor: [/\btenho\s+(?:so\s+|apenas\s+)?(?:[89]|1[0-7])\s+anos\b/,
            /\btenho\s+(?:oito|nove|dez|onze|doze|treze|quatorze|catorze|quinze|dezesseis|dezessete)\s+anos\b/,
            /\bsou\s+menor(?:\s+de\s+idade)?\b/,
            /\bestou\s+no\s+(?:ensino\s+)?(?:fundamental|medio)\b/,
            /\bminha\s+(?:mae|mãe)\s+nao\s+(?:me\s+)?deixa\b/] },

  fr: { level: "full", checked: null,
    crisis: ["je veux mourir","envie de mourir","j'ai envie de mourir","je voudrais mourir",
             "me tuer","je vais me tuer","mettre fin a mes jours","en finir avec la vie",
             "suicide","me suicider","suicidaire",
             "je ne veux plus vivre","je veux plus vivre",
             "me faire du mal","me scarifier","automutilation",
             "mieux sans moi"],
    minor: [/\bj\s*'?\s*ai\s+(?:seulement\s+)?(?:[89]|1[0-7])\s+ans\b/,
            /\bj\s*'?\s*ai\s+(?:huit|neuf|dix|onze|douze|treize|quatorze|quinze|seize|dix-sept)\s+ans\b/,
            /\bje\s+suis\s+mineure?\b/,
            /\bje\s+suis\s+(?:au\s+|en\s+)(?:college|lycee|4eme|3eme|5eme|6eme)\b/,
            /\bma\s+mere\s+ne\s+me\s+laisse\s+pas\b/] },

  de: { level: "full", checked: null,
    crisis: ["ich will sterben","ich mochte sterben","will nicht mehr leben",
             "mich umbringen","mich toten","schluss machen mit dem leben",
             "selbstmord","suizid","suizidal","selbsttotung",
             "mich verletzen","selbstverletzung","ritzen",
             "besser ohne mich"],
    minor: [/\bich\s+bin\s+(?:erst\s+)?(?:[89]|1[0-7])\s*(?:jahre(?:\s+alt)?)?\b/,
            /\bich\s+bin\s+minderjahrig\b/,
            /\bich\s+gehe\s+(?:noch\s+)?(?:in\s+die|zur)\s+schule\b/,
            /\bmeine\s+(?:mutter|mama|eltern)\s+(?:lasst|lassen)\s+mich\s+nicht\b/] },

  it: { level: "full", checked: null,
    crisis: ["voglio morire","voglia di morire","vorrei morire",
             "uccidermi","ammazzarmi","togliermi la vita","farla finita",
             "suicidio","suicidarmi","suicida",
             "non voglio piu vivere",
             "farmi del male","autolesionismo","tagliarmi",
             "meglio senza di me"],
    minor: [/\bho\s+(?:solo\s+|appena\s+)?(?:[89]|1[0-7])\s+anni\b/,
            /\bho\s+(?:otto|nove|dieci|undici|dodici|tredici|quattordici|quindici|sedici|diciassette)\s+anni\b/,
            /\bsono\s+minorenne\b/,
            /\bvado\s+alle\s+(?:medie|superiori)\b/] },

  id: { level: "full", checked: null,
    // Indonesian marks possession after the noun, so "anak saya 15 tahun"
    // (my child is 15) literally contains the first-person pattern. Without
    // this a worried parent would be refused.
    notMinor: [/\b(?:anak|adik|kakak|putra|putri|keponakan|cucu|ponakan)\s+(?:saya|aku|ku)\b/],
    crisis: ["ingin mati","mau mati","pengen mati","pengin mati",
             "bunuh diri","membunuh diri",
             "tidak ingin hidup","gak mau hidup","nggak mau hidup","tidak mau hidup lagi",
             "menyakiti diri","melukai diri",
             "lebih baik mati"],
    minor: [/\bsaya\s+(?:baru\s+)?(?:[89]|1[0-7])\s+tahun\b/,
            /\baku\s+(?:baru\s+)?(?:[89]|1[0-7])\s+tahun\b/,
            /\bmasih\s+di\s+bawah\s+umur\b/,
            /\bsaya\s+masih\s+(?:smp|sma|sekolah|pelajar)\b/] },

  tl: { level: "full", checked: null,
    crisis: ["gusto ko nang mamatay","gusto kong mamatay","gusto ko na mamatay",
             "magpakamatay","pagpapakamatay","papatayin ko ang sarili ko",
             "ayoko nang mabuhay","ayaw ko nang mabuhay",
             "saktan ang sarili","saktan ko ang sarili ko",
             "mabuti pang mamatay"],
    minor: [/\b(?:[89]|1[0-7])\s+(?:anyos|taong\s+gulang)\s+ako\b/,
            /\bmenor\s+de\s+edad\s+ako\b/,
            /\b(?:high\s*school|elementary|estudyante)\s+pa\s+ako\b/] },

  ru: { level: "full", checked: null,
    crisis: ["хочу умереть","хочется умереть","не хочу жить","не хочу больше жить",
             "покончить с собой","покончить жизнь","убить себя",
             "самоубийство","суицид",
             "причинить себе вред","резать себя"],
    minor: [new RegExp(W0 + "мне\\s+(?:всего\\s+)?(?:[89]|1[0-7])\\s+лет(?=\\s|$)"),
            new RegExp(W0 + "я\\s+несовершеннолетн"),
            new RegExp(W0 + "я\\s+школьни"),
            new RegExp(W0 + "мама\\s+не\\s+разрешает\\s+мне(?=\\s|$)")] },

  pl: { level: "full", checked: null,
    crisis: ["chce umrzec","chcialbym umrzec","chcialabym umrzec",
             "odebrac sobie zycie","skonczyc ze soba","zabic sie",
             "samobojstwo","samobojcze","mysli samobojcze",
             "nie chce zyc","nie chce dluzej zyc",
             "zrobic sobie krzywde"],
    minor: [/\bmam\s+(?:dopiero\s+)?(?:[89]|1[0-7])\s+lat\b/,
            /\bjestem\s+niepelnoletni/,
            /\bchodze\s+do\s+(?:szkoly|gimnazjum|podstawowki)\b/] },

  hi: { level: "full", checked: null,
    crisis: ["आत्महत्या","खुदकुशी","मरना चाहता","मरना चाहती","मर जाना चाहता",
             "जीना नहीं चाहता","जीना नहीं चाहती","जीने का मन नहीं",
             "अपनी जान लेना","जान दे","खुद को नुकसान","खुद को मार",
             // people type Hindi in Roman script constantly
             "atmahatya","aatmahatya","khudkushi","khud kushi",
             "marna chahta","marna chahti","mar jana chahta","mar jaun",
             "jeena nahi chahta","jina nahi chahta","jeene ka mann nahi",
             "jaan dena","jaan de dun","khud ko maar"],
    minor: [new RegExp(W0 + "मैं\\s+(?:सिर्फ\\s+)?(?:[89]|1[0-7])\\s+साल\\s+क[ाी]\\s+हूँ?"),
            /\bmain\s+(?:sirf\s+)?(?:[89]|1[0-7])\s+saal\s+k[ai]\s+(?:hoon|hun|hu)\b/,
            /\bmain\s+(?:abhi\s+)?school\s+(?:mein|me)\s+(?:padhta|padhti)\b/,
            new RegExp(W0 + "मैं\\s+स्कूल\\s+में\\s+पढ़त[ाी]")] },

  ur: { level: "full", checked: null,
    crisis: ["خودکشی","مرنا چاہتا","مرنا چاہتی","جینا نہیں چاہتا","جینا نہیں چاہتی",
             "اپنی جان لینا","خود کو نقصان","اپنے آپ کو مار",
             "khudkushi","khud kushi","marna chahta","marna chahti",
             "jeena nahi chahta","jina nahi chahta","jaan dena"],
    minor: [new RegExp(W0 + "میں\\s+(?:صرف\\s+)?(?:[89]|1[0-7])\\s+سال\\s+کا?\\s+ہوں"),
            /\bmain\s+(?:sirf\s+)?(?:[89]|1[0-7])\s+saal\s+k[ai]\s+(?:hoon|hun|hu)\b/,
            /\bmain\s+school\s+(?:mein|me)\s+parhta\b/] },

  ar: { level: "full", checked: null,
    crisis: ["انتحار","الانتحار","انتحر","أنتحر","اقتل نفسي","أقتل نفسي","قتل نفسي",
             "اريد ان اموت","أريد أن أموت","اريد الموت","أريد الموت","اتمنى لو اموت",
             "لا اريد ان اعيش","لا أريد أن أعيش","لا اريد الحياة",
             "ايذاء نفسي","إيذاء نفسي","اؤذي نفسي"],
    minor: [/عمري\s+(?:فقط\s+)?(?:[89]|1[0-7])\b/,
            new RegExp(W0 + "[أا]نا\\s+قاصر"),
            new RegExp(W0 + "[أا]نا\\s+في\\s+المدرسة")] },

  bn: { level: "full", checked: null,
    crisis: ["আত্মহত্যা","মরতে চাই","মরে যেতে চাই","বাঁচতে চাই না","বাচতে চাই না",
             "নিজেকে শেষ","নিজের ক্ষতি",
             "atmahatya","atmohotta","morte chai","bachte chai na"],
    minor: [new RegExp(W0 + "আমার\\s+বয়স\\s+(?:[89]|1[0-7])"),
            /\bami\s+(?:[89]|1[0-7])\s+bochor\b/,
            new RegExp(W0 + "আমি\\s+স্কুলে\\s+পড়ি")] },

  fa: { level: "basic", checked: null,
    crisis: ["خودکشی","می‌خواهم بمیرم","میخوام بمیرم","نمی‌خواهم زندگی کنم",
             "به خودم آسیب","خودم را بکشم","khodkoshi"],
    minor: [new RegExp(W0 + "من\\s+(?:[89]|1[0-7])\\s+ساله\\s+هستم")] },

  he: { level: "basic", checked: null,
    crisis: ["התאבדות","להתאבד","רוצה למות","לא רוצה לחיות","לפגוע בעצמי"],
    minor: [new RegExp(W0 + "אני\\s+ב[ןת]\\s+(?:[89]|1[0-7])")] },

  vi: { level: "basic", checked: null,
    crisis: ["muốn chết","muon chet","tự tử","tu tu","tự sát","tu sat",
             "không muốn sống","khong muon song","làm hại bản thân"],
    minor: [/\b(?:toi|em)\s+(?:[89]|1[0-7])\s+tuoi\b/] },

  ko: { level: "basic", checked: null,
    crisis: ["자살","죽고 싶","죽고싶","살기 싫","살고 싶지 않","자해"],
    minor: [new RegExp(W0 + "(?:저는|나는)\\s*(?:[89]|1[0-7])\\s*살")] },

  "zh-CN": { level: "basic", checked: null,
    crisis: ["自杀","想死","不想活","自残","伤害自己","了结自己"],
    minor: [/我\s*(?:今年)?\s*(?:[89]|1[0-7])\s*岁/] },

  ta: { level: "basic", checked: null,
    crisis: ["தற்கொலை","சாக வேண்டும்","சாகணும்","வாழ விரும்பவில்லை","tharkolai"],
    minor: [new RegExp(W0 + "எனக்கு\\s+(?:[89]|1[0-7])\\s+வயது")] },

  te: { level: "basic", checked: null,
    crisis: ["ఆత్మహత్య","చనిపోవాలని","బతకాలని లేదు","atmahatya"],
    minor: [new RegExp(W0 + "నాకు\\s+(?:[89]|1[0-7])\\s+సంవత్సరాలు")] },

  pa: { level: "basic", checked: null,
    crisis: ["ਖੁਦਕੁਸ਼ੀ","ਆਤਮਹੱਤਿਆ","ਮਰਨਾ ਚਾਹੁੰਦਾ","ਜੀਣਾ ਨਹੀਂ ਚਾਹੁੰਦਾ","khudkushi"],
    minor: [new RegExp(W0 + "ਮੈਂ\\s+(?:[89]|1[0-7])\\s+ਸਾਲ\\s+ਦਾ")] },

  gu: { level: "basic", checked: null,
    crisis: ["આત્મહત્યા","મરવું છે","જીવવું નથી","atmahatya"],
    minor: [new RegExp(W0 + "મારી\\s+ઉંમર\\s+(?:[89]|1[0-7])")] },

  sw: { level: "basic", checked: null,
    crisis: ["kujiua","nataka kufa","sitaki kuishi","kujidhuru"],
    minor: [/\bnina\s+miaka\s+(?:[89]|1[0-7])\b/] },
};

/* Script gives a free, collision-proof second opinion: if the text is in
   Devanagari we check Hindi whatever the picker says, because people choose
   English and then write in their own language all the time. */
const SCRIPT_HINTS = [
  { re: /[ऀ-ॿ]/, langs: ["hi"] },          // Devanagari
  { re: /[؀-ۿݐ-ݿ]/, langs: ["ar", "ur", "fa"] },
  { re: /[ঀ-৿]/, langs: ["bn"] },
  { re: /[਀-੿]/, langs: ["pa"] },
  { re: /[઀-૿]/, langs: ["gu"] },
  { re: /[஀-௿]/, langs: ["ta"] },
  { re: /[ఀ-౿]/, langs: ["te"] },
  { re: /[֐-׿]/, langs: ["he"] },
  { re: /[Ѐ-ӿ]/, langs: ["ru"] },
  { re: /[一-鿿]/, langs: ["zh-CN"] },
  { re: /[가-힯]/, langs: ["ko"] },
];

// English always runs — people mix, and "I want to die" turns up in every
// language's messages. Then the language they chose. Then anything the
// script betrays.
function langsToCheck(selected, text) {
  const out = ["en"];
  if (selected && selected !== "en") out.push(selected);
  SCRIPT_HINTS.forEach((h) => { if (h.re.test(String(text || ""))) h.langs.forEach((l) => out.push(l)); });
  return out.filter((l, i) => out.indexOf(l) === i);
}

function hitsCrisis(text, lang) {
  const L = LANG_SAFETY[lang];
  if (!L) return false;
  const t = " " + foldText(text) + " ";
  return L.crisis.some((p) => t.indexOf(foldText(p)) !== -1);
}
function hitsMinor(text, lang) {
  const L = LANG_SAFETY[lang];
  if (!L || !L.minor) return false;
  const t = " " + foldText(text) + " ";
  // Exclusions run first: some languages phrase "my child is 15" in a way
  // that contains "I am 15" word for word.
  if (L.notMinor && L.notMinor.some((re) => re.test(t))) return false;
  return L.minor.some((re) => re.test(t));
}

/* The two questions the app actually asks. `enRisky` / `enMinor` are the
   existing English classifiers, passed in so this file stays standalone. */
function riskyMulti(text, selected, enRisky) {
  if (enRisky && (enRisky(text) || enRisky(foldApostrophes(text)))) return true;
  return langsToCheck(selected, text).some((l) => l !== "en" && hitsCrisis(text, l));
}
function minorMulti(text, selected, enMinor) {
  if (enMinor && (enMinor(text) || enMinor(foldApostrophes(text)))) return true;
  return langsToCheck(selected, text).some((l) => l !== "en" && hitsMinor(text, l));
}

/* Honesty about coverage. A language with no patterns is not silently
   treated as safe — the request is marked unscreened so the guide is told,
   and the helpline block is shown regardless. It is NOT auto-flagged as a
   crisis, because a flagged request with no vetted guide free is refused
   outright, and turning away everyone who writes in Korean would be a
   worse failure than the one we are fixing. */
function screenLevel(lang) {
  if (lang === "en") return "full";
  const L = LANG_SAFETY[lang];
  return L ? L.level : "none";
}
function isScreened(lang) { return screenLevel(lang) !== "none"; }

if (typeof module !== "undefined" && module.exports) {
  module.exports = { LANG_SAFETY, SCRIPT_HINTS, foldText, foldApostrophes, langsToCheck,
                     hitsCrisis, hitsMinor, riskyMulti, minorMulti,
                     screenLevel, isScreened };
}
