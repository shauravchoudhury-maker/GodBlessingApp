// prayers.js
// Aartis, prayers, mantras, psalms, duas, chants and blessings across the
// traditions EverVerse already carries — the "Devotion" library. Each entry is
// a short, sayable text with a line-by-line plain-English meaning and an
// original reflection, so a video is never just a template with the words
// swapped (that is what gets a channel demonetized).
//
// RULES — these are not optional:
//   • Public-domain originals only (scripture, traditional prayers, texts whose
//     author died 100+ years ago, or pre-1930 publications). No modern bhajans,
//     hymns or translations — every English meaning here is our own rendering.
//   • Islamic entries are `narrate: "meaning"` — the synthetic voice must NEVER
//     recite Qur'an or dua in Arabic. Recitation has rules a machine can't keep,
//     and the audience we want will hear the disrespect instantly. The Arabic is
//     shown on screen; the voice speaks the meaning.
//   • Gurbani, Vedic mantras, Pali and Hebrew are narrated by transliteration
//     (or the native script when a matching voice is chosen) followed by the
//     meaning — never the meaning alone, because the sound is the practice.
//   • In Jewish entries the divine name is written ה׳ and spoken "Adonai", the
//     way it is in a printed siddur.
//   • Long texts (a chalisa, a full aarti) are carried as an EXCERPT with
//     `excerpt: true`, chosen so the piece still opens and closes properly.
//
// Schema per entry:
//   id         stable slug (filenames, links)
//   tradition  key into PRAYER_TRADITIONS
//   kind       aarti | chalisa | mantra | prayer | psalm | hymn | dua | chant | blessing | sutra | poem | teaching
//   title      English title;  native — title in the original script (optional)
//   occasion   morning | evening | protection | peace | gratitude | courage | healing | grief | beginnings | anytime
//   lang       BCP-47 language of the original ("sa" Sanskrit, "hi", "he", "ar", "pa" Punjabi, "pi" Pali, "zh", "en", "bo" Tibetan)
//   topic      matches SHORT_TAGS_BY_TOPIC keys (hope, peace, strength, …)
//   theme      palette key
//   hook       the first spoken line and the caption's opening — unique per entry
//   intro      one sentence placing the text (spoken after the hook)
//   lines      [{ o: original, t: transliteration, m: meaning }] — `t` omitted when the original is English
//   reflection two or three original sentences — the part that is ours
//   close      the last spoken line (optional; a default exists)
//   source     attribution + why it is public domain
//   narrate    "both" (sound + meaning, default) | "meaning" (meaning only)
//   excerpt    true when `lines` is a chosen portion of a longer text

const PRAYER_TRADITIONS = {
  hindu:     { label: "Hindu",     faith: "Gita",       emoji: "🪔", tags: ["hindu", "sanatandharma", "bhakti", "mantra", "aarti"] },
  christian: { label: "Christian", faith: "Bible",      emoji: "✝️", tags: ["christian", "prayer", "jesus", "bible", "faith"] },
  jewish:    { label: "Jewish",    faith: "Torah",      emoji: "✡️", tags: ["jewish", "judaism", "torah", "tefillah", "shabbat"] },
  islamic:   { label: "Islamic",   faith: "Quran",      emoji: "☪️", tags: ["islam", "muslim", "dua", "quran", "alhamdulillah"] },
  sikh:      { label: "Sikh",      faith: "Sikh",       emoji: "☬",  tags: ["sikh", "gurbani", "waheguru", "sikhi", "gurunanak"] },
  buddhist:  { label: "Buddhist",  faith: "Dhammapada", emoji: "☸️", tags: ["buddhist", "buddhism", "metta", "meditation", "dharma"] },
  taoist:    { label: "Taoist",    faith: "Tao",        emoji: "☯️", tags: ["taoism", "taoteching", "laozi", "wuwei", "philosophy"] },
  universal: { label: "Universal", faith: "Wisdom",     emoji: "✦",  tags: ["wisdom", "blessing", "mindfulness", "spirituality", "poetry"] },
};
function prayerTradition(p) { return PRAYER_TRADITIONS[p.tradition] || PRAYER_TRADITIONS.universal; }

const PRAYER_DB = [
  /* ============================ HINDU ============================ */
  {
    id: "gayatri-mantra", tradition: "hindu", kind: "mantra",
    title: "Gayatri Mantra", native: "गायत्री मन्त्र",
    occasion: "morning", lang: "sa", topic: "guidance", theme: "gold",
    hook: "One sentence, said at sunrise, for more than three thousand years.",
    intro: "This is the Gayatri Mantra, from the Rig Veda — a prayer for a clear mind, spoken to the rising sun.",
    lines: [
      { o: "ॐ भूर्भुवः स्वः", t: "Om bhūr bhuvaḥ svaḥ", m: "We turn to the One who is the earth, the sky, and everything beyond them." },
      { o: "तत्सवितुर्वरेण्यं", t: "tat savitur vareṇyaṃ", m: "To that radiant source, the most worthy of our attention." },
      { o: "भर्गो देवस्य धीमहि", t: "bhargo devasya dhīmahi", m: "We hold that divine light in our minds." },
      { o: "धियो यो नः प्रचोदयात्", t: "dhiyo yo naḥ pracodayāt", m: "May it wake up our understanding and guide it." },
    ],
    reflection: "Notice what the mantra asks for. Not money, not victory, not even comfort — only that our thinking be lit from a good source. Most of a bad day is bad thinking. Start the day by asking for light on the mind, and the rest tends to follow.",
    source: "Rig Veda 3.62.10 — Vedic scripture, public domain.",
  },
  {
    id: "om-jai-jagdish-hare", tradition: "hindu", kind: "aarti",
    title: "Om Jai Jagdish Hare", native: "ॐ जय जगदीश हरे",
    occasion: "evening", lang: "hi", topic: "faith", theme: "warm", excerpt: true,
    hook: "The aarti almost every Hindu home knows by heart — and what the words actually say.",
    intro: "This is Om Jai Jagdish Hare, the evening aarti sung with a lamp in hand, written by Pandit Shardha Ram Phillauri in 1870.",
    lines: [
      { o: "ॐ जय जगदीश हरे, स्वामी जय जगदीश हरे ।", t: "Om jai Jagadīsh hare, swāmī jai Jagadīsh hare.", m: "Glory to you, Lord of the universe. Glory to you, master of all." },
      { o: "भक्त जनों के संकट, क्षण में दूर करे ॥", t: "Bhakta janon ke sankat, kshan mein door kare.", m: "The troubles of those who love you — you remove them in a moment." },
      { o: "जो ध्यावे फल पावे, दुःख बिनसे मन का ।", t: "Jo dhyāve phal pāve, dukh binase man kā.", m: "Whoever turns their mind to you finds what they came for; the sorrow in the mind melts away." },
      { o: "सुख सम्पत्ति घर आवे, कष्ट मिटे तन का ॥", t: "Sukh sampatti ghar āve, kasht mite tan kā.", m: "Peace and plenty come home; the body's suffering eases." },
      { o: "मात पिता तुम मेरे, शरण गहूँ किसकी ।", t: "Māt pitā tum mere, sharan gahūn kis kī.", m: "You are my mother and my father — whose shelter would I take, if not yours?" },
      { o: "तुम बिन और न दूजा, आस करूँ जिसकी ॥", t: "Tum bin aur na dūjā, ās karūn jis kī.", m: "There is no one else. You are the only one I hope in." },
    ],
    reflection: "An aarti is sung with a small flame circling in front of the divine. The flame is not for God to see by — it is for us. Each evening the song says the same simple thing: I have carried this day, and I am setting it down here. That is why it is sung at dusk, not dawn. Tonight, before any screen goes on, light one candle and say the first two lines. Ninety seconds. That is the whole practice.",
    source: "Pandit Shardha Ram Phillauri, 1870 — author died 1881, public domain. Excerpt: refrain and first three stanzas.",
  },
  {
    id: "hanuman-chalisa", tradition: "hindu", kind: "chalisa",
    title: "Hanuman Chalisa", native: "हनुमान चालीसा",
    occasion: "courage", lang: "hi", topic: "strength", theme: "bold", excerpt: true,
    hook: "Forty verses that people say when they are afraid. Here is how it begins.",
    intro: "This is the opening of the Hanuman Chalisa, written by Tulsidas in the sixteenth century — a prayer for strength, wisdom and the removal of fear.",
    lines: [
      { o: "बुद्धिहीन तनु जानिके, सुमिरौं पवन-कुमार ।", t: "Buddhi-hīn tanu jānike, sumiraun Pavan-kumār.", m: "Knowing how little I understand, I remember the son of the wind." },
      { o: "बल बुधि बिद्या देहु मोहिं, हरहु कलेस बिकार ॥", t: "Bal budhi bidyā dehu mohin, harahu kales bikār.", m: "Give me strength, good sense and knowledge; take away my troubles and my flaws." },
      { o: "जय हनुमान ज्ञान गुन सागर । जय कपीस तिहुँ लोक उजागर ॥", t: "Jai Hanumān gyān gun sāgar. Jai Kapīs tihun lok ujāgar.", m: "Hail Hanuman, ocean of wisdom and goodness. Hail the lord of the monkeys, who lights up all three worlds." },
      { o: "राम दूत अतुलित बल धामा । अंजनि-पुत्र पवनसुत नामा ॥", t: "Rām dūt atulit bal dhāmā. Anjani-putra Pavan-sut nāmā.", m: "Messenger of Rama, home of strength beyond measure; son of Anjani, called the son of the wind." },
      { o: "महाबीर बिक्रम बजरंगी । कुमति निवार सुमति के संगी ॥", t: "Mahābīr bikram Bajarangī. Kumati nivār sumati ke sangī.", m: "Great hero, mighty, with a body like a thunderbolt — you drive out bad thinking and keep company with good." },
      { o: "संकट कटै मिटै सब पीरा । जो सुमिरै हनुमत बलबीरा ॥", t: "Sankat katai mitai sab pīrā. Jo sumirai Hanumat balbīrā.", m: "Trouble is cut away and every pain fades for the one who remembers Hanuman, the strong and brave." },
    ],
    reflection: "The Chalisa opens with an admission — I do not have enough understanding on my own. That honesty is the strength it asks for. You do not recite it because you are already brave; you recite it because you are not, and the words carry you until you are. Before the thing you are dreading today, say the first couplet out loud. It takes eleven seconds, and you will not be the first person to do it in a car park.",
    source: "Goswami Tulsidas, 16th century — public domain. Excerpt: the second opening doha, chaupais 1–3 and chaupai 36.",
  },
  {
    id: "jai-ambe-gauri", tradition: "hindu", kind: "aarti",
    title: "Jai Ambe Gauri — Durga Aarti", native: "जय अम्बे गौरी",
    occasion: "protection", lang: "hi", topic: "strength", theme: "bold", excerpt: true,
    hook: "For nine nights every autumn, millions sing this to a mother with a sword in her hand.",
    intro: "This is Jai Ambe Gauri, the aarti of Durga sung every evening of Navratri — a hymn to the goddess as mother, warrior and light.",
    lines: [
      { o: "जय अम्बे गौरी, मैया जय श्यामा गौरी ।", t: "Jai Ambe Gaurī, maiyā jai Shyāmā Gaurī.", m: "Glory to you, Mother Ambe, the fair one — Mother, glory to you, dark one and fair one both." },
      { o: "तुमको निशदिन ध्यावत, हरि ब्रह्मा शिवरी ॥", t: "Tumko nishdin dhyāvat, Hari Brahmā Shivarī.", m: "Day and night Vishnu, Brahma and Shiva themselves hold you in their minds." },
      { o: "माँग सिंदूर विराजत, टीको मृगमद को ।", t: "Māng sindūr virājat, tīko mrigmad ko.", m: "Vermilion shines in the parting of your hair; a mark of musk sits on your brow." },
      { o: "उज्ज्वल से दोउ नैना, चंद्रवदन नीको ॥", t: "Ujjval se dou nainā, chandravadan nīko.", m: "Both your eyes are bright, and your face is lovely as the moon." },
      { o: "केहरि वाहन राजत, खड्ग खप्पर धारी ।", t: "Kehari vāhan rājat, khadag khappar dhārī.", m: "You ride a lion, and you carry a sword and a skull-bowl." },
      { o: "सुर-नर-मुनिजन सेवत, तिनके दुखहारी ॥", t: "Sur-nar-munijan sevat, tinke dukhahārī.", m: "Gods, people and sages serve you — and you take their suffering away." },
      { o: "शुम्भ-निशुम्भ बिदारे, महिषासुर घाती ।", t: "Shumbh-Nishumbh bidāre, Mahishāsur ghātī.", m: "You tore apart the demons Shumbha and Nishumbha; you struck down the buffalo-demon Mahisha." },
      { o: "भुजा चार अति शोभित, वर मुद्रा धारी ।", t: "Bhujā chār ati shobhit, var mudrā dhārī.", m: "Your four arms are beautiful, and one hand is raised in blessing." },
    ],
    reflection: "Look at what the song puts side by side. Vermilion and a sword. A face like the moon and a bowl for the blood of demons. A hand that blesses and a hand that kills. The aarti refuses to choose — the mother who comforts is the same one who fights for you, and the two are not in tension. Navratri is nine nights of remembering that gentleness with no strength behind it is not gentleness, it is helplessness. Tonight, name one thing you have been too soft with — a habit, a fear, a person walking over you — and say the fifth line out loud to it. Kehari vāhan rājat. She rides a lion. So can you.",
    source: "Traditional Durga aarti, attributed to Shivanand Swami; printed in aarti collections long before 1930 — public domain. Excerpt: refrain and four stanzas.",
  },
  {
    id: "durga-navratri-chant", tradition: "hindu", kind: "chant",
    title: "Ya Devi Sarva Bhuteshu — The Goddess in Everything", native: "या देवी सर्वभूतेषु",
    occasion: "courage", lang: "sa", topic: "strength", theme: "royal",
    hook: "A fifteen-hundred-year-old chant that says the goddess is not in a temple. She is your strength, your mind, your patience.",
    intro: "These lines are from the Devi Mahatmya, the oldest scripture of the goddess, recited through Navratri — each verse finds her in one ordinary human quality.",
    lines: [
      { o: "सर्वमङ्गलमाङ्गल्ये शिवे सर्वार्थसाधिके ।", t: "Sarva-mangala-māngalye Shive sarvārtha-sādhike.", m: "Auspicious one behind every good thing; kind one, who brings every purpose to its end —" },
      { o: "शरण्ये त्र्यम्बके गौरि नारायणि नमोऽस्तु ते ॥", t: "Sharanye Tryambake Gauri Nārāyani namo'stu te.", m: "shelter of all, three-eyed one, fair one, Narayani — I bow to you." },
      { o: "या देवी सर्वभूतेषु शक्तिरूपेण संस्थिता ।", t: "Yā Devī sarva-bhūteshu shakti-rūpena sansthitā.", m: "The goddess who lives in every being as strength —" },
      { o: "नमस्तस्यै नमस्तस्यै नमस्तस्यै नमो नमः ॥", t: "Namas-tasyai namas-tasyai namas-tasyai namo namah.", m: "to her I bow, to her I bow, to her I bow, again and again." },
      { o: "या देवी सर्वभूतेषु बुद्धिरूपेण संस्थिता ।", t: "Yā Devī sarva-bhūteshu buddhi-rūpena sansthitā.", m: "The goddess who lives in every being as intelligence —" },
      { o: "या देवी सर्वभूतेषु शान्तिरूपेण संस्थिता ।", t: "Yā Devī sarva-bhūteshu shānti-rūpena sansthitā.", m: "The goddess who lives in every being as peace —" },
      { o: "या देवी सर्वभूतेषु दयारूपेण संस्थिता ।", t: "Yā Devī sarva-bhūteshu dayā-rūpena sansthitā.", m: "The goddess who lives in every being as compassion —" },
      { o: "नमस्तस्यै नमस्तस्यै नमस्तस्यै नमो नमः ॥", t: "Namas-tasyai namas-tasyai namas-tasyai namo namah.", m: "to her I bow, to her I bow, to her I bow, again and again." },
    ],
    reflection: "The chant does not say the goddess gives you strength, as if from outside. It says she is your strength — and your clear thinking, and your calm, and your kindness — the same power wearing four different faces. So when you were patient with someone this week, that was her. When you thought clearly under pressure, that was her too. The bow is not to a statue; it is to the part of you that already did the hard thing. Pick the quality you need most this week — strength, clarity, peace, or compassion — and say only that verse, once, each morning of Navratri.",
    source: "Devi Mahatmya (Markandeya Purana), chapters 5 and 11 — Sanskrit scripture, c. 5th–6th century, public domain.",
  },
  {
    id: "saraswati-vandana", tradition: "hindu", kind: "mantra",
    title: "Saraswati Vandana — Ya Kundendu", native: "सरस्वती वन्दना",
    occasion: "beginnings", lang: "sa", topic: "wisdom", theme: "calm",
    hook: "Before an exam, a first day, a blank page — this is the prayer Indian students have said for a thousand years.",
    intro: "This is the Saraswati Vandana, a verse to the goddess of learning, music and speech — said before study, and sung on the last days of Navratri when books are placed at her feet.",
    lines: [
      { o: "या कुन्देन्दुतुषारहारधवला या शुभ्रवस्त्रावृता ।", t: "Yā kunda-indu-tushāra-hāra-dhavalā, yā shubhra-vastrāvritā.", m: "She who is white as jasmine, the moon, and a garland of snow; who is dressed in pure white —" },
      { o: "या वीणावरदण्डमण्डितकरा या श्वेतपद्मासना ॥", t: "Yā vīnā-vara-danda-mandita-karā, yā shveta-padmāsanā.", m: "whose hands are graced with the veena, who sits on a white lotus —" },
      { o: "या ब्रह्माच्युतशंकरप्रभृतिभिर्देवैः सदा वन्दिता ।", t: "Yā Brahmāchyuta-Shankara-prabhritibhir devaih sadā vanditā.", m: "who is honoured always by Brahma, Vishnu, Shiva and all the gods —" },
      { o: "सा मां पातु सरस्वती भगवती निःशेषजाड्यापहा ॥", t: "Sā mām pātu Sarasvatī Bhagavatī nihshesha-jādyāpahā.", m: "may she protect me, Saraswati, the goddess who removes dullness of mind completely." },
    ],
    reflection: "Everything in the verse is white — jasmine, moon, snow, cloth, lotus. Not gold, not fire. Learning needs a clean surface — a mind with nothing already written on it. And the request at the end is not for cleverness, it is for the removal of dullness — the fog, the not-caring, the scrolling. Before you sit down to the thing you have been avoiding today, close every other tab, say the last line once, and give it fifteen honest minutes. That is how the fog lifts.",
    source: "Saraswati Stotram, traditional Sanskrit — public domain.",
  },
  {
    id: "om-jai-lakshmi-mata", tradition: "hindu", kind: "aarti",
    title: "Om Jai Lakshmi Mata — Lakshmi Aarti", native: "ॐ जय लक्ष्मी माता",
    occasion: "gratitude", lang: "hi", topic: "gratitude", theme: "gold", excerpt: true,
    hook: "The Diwali aarti everyone thinks is about money. Listen to what it actually asks for.",
    intro: "This is Om Jai Lakshmi Mata, the aarti of Lakshmi — sung on Diwali night with every lamp in the house lit, and on the eighth day of Navratri.",
    lines: [
      { o: "ॐ जय लक्ष्मी माता, मैया जय लक्ष्मी माता ।", t: "Om jai Lakshmī Mātā, maiyā jai Lakshmī Mātā.", m: "Glory to you, Mother Lakshmi. Mother, glory to you." },
      { o: "तुमको निशदिन सेवत, हर विष्णु विधाता ॥", t: "Tumko nishdin sevat, Har Vishnu Vidhātā.", m: "Day and night Shiva, Vishnu and Brahma the maker serve you." },
      { o: "दुर्गा रूप निरंजनी, सुख सम्पत्ति दाता ।", t: "Durgā rūp niranjanī, sukh sampatti dātā.", m: "In Durga's form you are the spotless one — the giver of happiness and of plenty." },
      { o: "जो कोई तुमको ध्यावत, ऋद्धि-सिद्धि धन पाता ॥", t: "Jo koī tumko dhyāvat, riddhi-siddhi dhan pātā.", m: "Whoever holds you in mind finds prosperity, fulfilment and wealth." },
      { o: "जिस घर में तुम रहतीं, सब सद्गुण आता ।", t: "Jis ghar mein tum rahtīn, sab sadgun ātā.", m: "In the house where you live, every good quality comes to stay." },
      { o: "सब सम्भव हो जाता, मन नहीं घबराता ॥", t: "Sab sambhav ho jātā, man nahīn ghabrātā.", m: "Everything becomes possible, and the mind stops being afraid." },
      { o: "तुम बिन यज्ञ न होते, वस्त्र न कोई पाता ।", t: "Tum bin yagya na hote, vastra na koī pātā.", m: "Without you no offering can be made, and no one would have clothes on their back." },
      { o: "खान-पान का वैभव, सब तुमसे आता ॥", t: "Khān-pān kā vaibhav, sab tumse ātā.", m: "Food and drink, and every good thing on the table — all of it comes from you." },
    ],
    reflection: "Read the fifth and sixth lines again. In the house where she lives, what arrives is not gold — it is good qualities, and a mind that is not afraid. That is the aarti's definition of wealth: enough that you can stop worrying, and character enough to use it well. The lamps on Diwali are not a display of what you have; they are gratitude for the ordinary plenty — clothes, dinner, a roof — that the seventh line says most of us never notice. Tonight, before the meal, name out loud three things on the table you did not make yourself. That is the whole aarti in three sentences.",
    source: "Traditional Lakshmi aarti; printed in aarti collections long before 1930 — public domain. Excerpt: refrain and four stanzas.",
  },
  {
    id: "jai-ganesh-deva", tradition: "hindu", kind: "aarti",
    title: "Jai Ganesh Deva — Ganesh Aarti", native: "जय गणेश देवा",
    occasion: "beginnings", lang: "hi", topic: "hope", theme: "warm", excerpt: true,
    hook: "The aarti sung before every other aarti — because you always call Ganesh first.",
    intro: "This is Jai Ganesh Deva, the aarti of Ganesha, the remover of obstacles — sung at the start of any puja, any journey and any new beginning.",
    lines: [
      { o: "जय गणेश जय गणेश, जय गणेश देवा ।", t: "Jai Ganesh jai Ganesh, jai Ganesh Devā.", m: "Glory to Ganesh, glory to Ganesh, glory to Lord Ganesh." },
      { o: "माता जाकी पार्वती, पिता महादेवा ॥", t: "Mātā jākī Pārvatī, pitā Mahādevā.", m: "Whose mother is Parvati, and whose father is Shiva, the great god." },
      { o: "एक दंत दयावंत, चार भुजा धारी ।", t: "Ek dant dayāvant, chār bhujā dhārī.", m: "One tusk, full of compassion, with four arms." },
      { o: "माथे सिंदूर सोहे, मूसे की सवारी ॥", t: "Māthe sindūr sohe, mūse kī savārī.", m: "Vermilion shines on his forehead, and he rides a mouse." },
      { o: "पान चढ़े फल चढ़े, और चढ़े मेवा ।", t: "Pān chadhe phal chadhe, aur chadhe mevā.", m: "Betel leaf is offered, fruit is offered, and dried fruit too." },
      { o: "लड्डुअन का भोग लगे, संत करें सेवा ॥", t: "Ladduan kā bhog lage, sant karen sevā.", m: "Sweet laddoos are set before him, and the holy ones serve him." },
      { o: "अंधन को आँख देत, कोढ़िन को काया ।", t: "Andhan ko ānkh det, kodhin ko kāyā.", m: "He gives sight to the blind, and a whole body to the sick." },
      { o: "बाँझन को पुत्र देत, निर्धन को माया ॥", t: "Bānjhan ko putra det, nirdhan ko māyā.", m: "He gives a child to the childless, and means to the poor." },
    ],
    reflection: "An elephant-headed god riding a mouse. The picture is meant to be slightly funny, and the joke has a point: the biggest obstacle and the smallest helper travel together. Ganesh is called first not because he is the greatest but because he is the one who deals with what is in the way — and most of what is in the way is small. A phone call not made. A form not filled. An apology owed. Before anything grand today, pick the smallest obstacle you have been stepping around, say the first line, and remove it. Then the puja can begin.",
    source: "Traditional Ganesh aarti, widely attributed to Surdas (16th century); public domain. Excerpt: refrain and three stanzas.",
  },
  {
    id: "om-jai-shiv-omkara", tradition: "hindu", kind: "aarti",
    title: "Om Jai Shiv Omkara — Shiv Aarti", native: "ॐ जय शिव ओंकारा",
    occasion: "peace", lang: "hi", topic: "peace", theme: "night", excerpt: true,
    hook: "It is called the Shiva aarti. Listen closely — it is secretly about three gods being one.",
    intro: "This is Om Jai Shiv Omkara, the aarti of Shiva — sung on Mondays and on Maha Shivaratri, and unusual among aartis for praising Brahma, Vishnu and Shiva as a single form.",
    lines: [
      { o: "ॐ जय शिव ओंकारा, स्वामी जय शिव ओंकारा ।", t: "Om jai Shiv Omkārā, swāmī jai Shiv Omkārā.", m: "Glory to Shiva, who is the sound Om itself. Lord, glory to Shiva, the Om." },
      { o: "ब्रह्मा विष्णु सदाशिव, अर्द्धांगी धारा ॥", t: "Brahmā Vishnu Sadāshiv, arddhāngī dhārā.", m: "Brahma, Vishnu and the eternal Shiva — each holding the goddess as half of himself." },
      { o: "एकानन चतुरानन, पंचानन राजे ।", t: "Ekānan chaturānan, panchānan rāje.", m: "One face, four faces, five faces — all three shine." },
      { o: "हंसासन गरुड़ासन, वृषवाहन साजे ॥", t: "Hansāsan Garudāsan, vrish-vāhan sāje.", m: "One rides a swan, one an eagle, one a bull." },
      { o: "अक्षमाला वनमाला, मुण्डमाला धारी ।", t: "Akshamālā vanamālā, mundamālā dhārī.", m: "One wears prayer beads, one a garland of forest flowers, one a garland of skulls." },
      { o: "त्रिपुरारी कंसारी, कर माला धारी ॥", t: "Tripurārī Kansārī, kar mālā dhārī.", m: "The destroyer of the three cities, the slayer of Kansa — a rosary in hand." },
      { o: "ब्रह्मा विष्णु सदाशिव, जानत अविवेका ।", t: "Brahmā Vishnu Sadāshiv, jānat avivekā.", m: "Only the unwise see Brahma, Vishnu and Shiva as separate." },
      { o: "प्रणवाक्षर में शोभित, ये तीनों एका ॥", t: "Pranavākshar mein shobhit, ye tīnon ekā.", m: "Within the single syllable Om, all three are one." },
    ],
    reflection: "Every stanza lines up three of everything — three faces, three mounts, three garlands — and then the seventh line says: only a fool thinks these are three. The aarti is built to teach one thing by repetition: what looks divided from outside is one thing from inside. Shiva here is not a god among gods; he is the sound underneath them, the Om before the words. On Shivaratri people stay up all night with that sound. You do not need a night. Sit for two minutes today, say Om once on a long breath, and notice how the different worries in your head sound like one hum. That hum is what the aarti is about.",
    source: "Traditional Shiv aarti, attributed to Shivanand Swami; printed in aarti collections long before 1930 — public domain. Excerpt: refrain and four stanzas.",
  },
  {
    id: "hanuman-chalisa-2", tradition: "hindu", kind: "chalisa",
    title: "Hanuman Chalisa — Part 2: Who He Is (verses 4–13)", native: "हनुमान चालीसा — भाग २",
    occasion: "courage", lang: "hi", topic: "strength", theme: "bold", excerpt: true,
    hook: "Golden skin, a thunderbolt in one hand, a sacred thread on his shoulder — the Chalisa's portrait of Hanuman, verse by verse.",
    intro: "This is the second part of the Hanuman Chalisa by Tulsidas — verses four to thirteen, which describe Hanuman's form, his learning, and the deeds that made Rama call him a brother.",
    lines: [
      { o: "कंचन बरन बिराज सुबेसा । कानन कुंडल कुंचित केसा ॥", t: "Kanchan baran birāj subesā. Kānan kundal kunchit kesā.", m: "Golden in colour, handsomely dressed; earrings in his ears, and curling hair." },
      { o: "हाथ बज्र औ ध्वजा बिराजै । काँधे मूँज जनेऊ साजै ॥", t: "Hāth bajra au dhvajā birājai. Kāndhe mūnj janeū sājai.", m: "A thunderbolt and a banner in his hands; a sacred thread of grass across his shoulder." },
      { o: "संकर सुवन केसरीनंदन । तेज प्रताप महा जग बन्दन ॥", t: "Sankar suvan Kesarī-nandan. Tej pratāp mahā jag bandan.", m: "Shiva's own, son of Kesari — his brilliance and power honoured by the whole world." },
      { o: "विद्यावान गुनी अति चातुर । राम काज करिबे को आतुर ॥", t: "Vidyāvān gunī ati chātur. Rām kāj karibe ko ātur.", m: "Learned, virtuous and very clever — and always eager to do Rama's work." },
      { o: "प्रभु चरित्र सुनिबे को रसिया । राम लखन सीता मन बसिया ॥", t: "Prabhu charitra sunibe ko rasiyā. Rām Lakhan Sītā man basiyā.", m: "He loves to hear the Lord's story; Rama, Lakshman and Sita live in his heart." },
      { o: "सूक्ष्म रूप धरि सियहिं दिखावा । बिकट रूप धरि लंक जरावा ॥", t: "Sūkshma rūp dhari Siyahin dikhāvā. Bikat rūp dhari Lank jarāvā.", m: "He took a tiny form to appear before Sita, and a terrible form to burn Lanka." },
      { o: "भीम रूप धरि असुर सँहारे । रामचंद्र के काज सँवारे ॥", t: "Bhīm rūp dhari asur sanhāre. Rāmchandra ke kāj sanvāre.", m: "In a giant's form he destroyed the demons, and set Rama's work right." },
      { o: "लाय सजीवन लखन जियाये । श्रीरघुबीर हरषि उर लाये ॥", t: "Lāya sajīvan Lakhan jiyāye. Shrī Raghubīr harashi ur lāye.", m: "He brought the life-giving herb and revived Lakshman; Rama, overjoyed, held him to his chest." },
      { o: "रघुपति कीन्ही बहुत बड़ाई । तुम मम प्रिय भरतहि सम भाई ॥", t: "Raghupati kīnhī bahut badāī. Tum mam priya Bharatahi sam bhāī.", m: "Rama praised him greatly: 'You are as dear to me as my brother Bharat.'" },
      { o: "सहस बदन तुम्हरो जस गावैं । अस कहि श्रीपति कंठ लगावैं ॥", t: "Sahas badan tumharo jas gāvain. As kahi Shrīpati kanth lagāvain.", m: "'A thousand mouths sing your praise' — and saying so, the Lord embraced him." },
    ],
    reflection: "Notice the order. Tulsidas describes the muscles and the thunderbolt, then immediately says: learned, virtuous, clever. Strength comes first in the picture but not in the point. And every deed listed is a change of size — tiny for Sita, huge for the demons, whatever the job needed. That is the skill the Chalisa is actually praising: not being big, but knowing what size to be. Today, in one conversation where you would normally push, try being small — ask a question instead. In one where you would normally shrink, be large. The strength is in the choosing.",
    source: "Goswami Tulsidas, 16th century — public domain. Chaupais 4–13.",
  },
  {
    id: "hanuman-chalisa-3", tradition: "hindu", kind: "chalisa",
    title: "Hanuman Chalisa — Part 3: What He Did (verses 14–23)", native: "हनुमान चालीसा — भाग ३",
    occasion: "courage", lang: "hi", topic: "faith", theme: "bold", excerpt: true,
    hook: "He swallowed the sun as a child and leapt an ocean with a ring in his mouth. The middle of the Chalisa, and what it is really saying.",
    intro: "This is the third part of the Hanuman Chalisa by Tulsidas — verses fourteen to twenty-three: the sages who cannot describe him, the kings he restored, the ocean he crossed, and the door he guards.",
    lines: [
      { o: "सनकादिक ब्रह्मादि मुनीसा । नारद सारद सहित अहीसा ॥", t: "Sanakādik Brahmādi munīsā. Nārad Sārad sahit Ahīsā.", m: "The sages Sanaka and the rest, Brahma and the great seers, Narada, Saraswati and the king of serpents —" },
      { o: "जम कुबेर दिगपाल जहाँ ते । कबि कोबिद कहि सके कहाँ ते ॥", t: "Jam Kuber digpāl jahān te. Kabi kobid kahi sake kahān te.", m: "Yama, Kubera, the guardians of the directions — if they cannot describe you, how could poets and scholars?" },
      { o: "तुम उपकार सुग्रीवहिं कीन्हा । राम मिलाय राज पद दीन्हा ॥", t: "Tum upakār Sugrīvahin kīnhā. Rām milāya rāj pad dīnhā.", m: "You did Sugriva a great kindness: you brought him to Rama and gave him back his throne." },
      { o: "तुम्हरो मंत्र बिभीषन माना । लंकेस्वर भए सब जग जाना ॥", t: "Tumharo mantra Bibhīshan mānā. Lankesvar bhaye sab jag jānā.", m: "Vibhishana took your advice, and became king of Lanka — the whole world knows it." },
      { o: "जुग सहस्र जोजन पर भानू । लील्यो ताहि मधुर फल जानू ॥", t: "Jug sahasra jojan par bhānū. Līlyo tāhi madhur phal jānū.", m: "The sun, thousands of miles away — you swallowed it, thinking it a sweet fruit." },
      { o: "प्रभु मुद्रिका मेलि मुख माहीं । जलधि लाँघि गये अचरज नाहीं ॥", t: "Prabhu mudrikā meli mukh māhīn. Jaladhi lānghi gaye acharaj nāhīn.", m: "With the Lord's ring in your mouth you leapt across the ocean — no wonder in that." },
      { o: "दुर्गम काज जगत के जेते । सुगम अनुग्रह तुम्हरे तेते ॥", t: "Durgam kāj jagat ke jete. Sugam anugrah tumhare tete.", m: "Every impossible task in the world becomes easy by your grace." },
      { o: "राम दुआरे तुम रखवारे । होत न आज्ञा बिनु पैसारे ॥", t: "Rām duāre tum rakhavāre. Hot na āgyā binu paisāre.", m: "You are the keeper of Rama's door; no one enters without your leave." },
      { o: "सब सुख लहै तुम्हारी सरना । तुम रच्छक काहू को डर ना ॥", t: "Sab sukh lahai tumhārī saranā. Tum rachchhak kāhū ko dar nā.", m: "In your shelter there is every happiness; with you as protector, there is nothing to fear." },
      { o: "आपन तेज सम्हारो आपै । तीनों लोक हाँक तें काँपै ॥", t: "Āpan tej samhāro āpai. Tīnon lok hānk ten kānpai.", m: "Only you can contain your own power; at your roar all three worlds tremble." },
    ],
    reflection: "Two kings in this section — Sugriva and Vibhishana — and Hanuman gave neither of them a kingdom. He gave one an introduction and the other advice. The leap across the ocean gets the poetry, but the throne-restoring was done with a conversation. That is the part people miss when they read the Chalisa for strength: half of what Hanuman did was connect the right people and say the true thing at the right moment. Today, make one introduction someone needs, or give one piece of honest advice you have been holding back. That is Chalisa work too.",
    source: "Goswami Tulsidas, 16th century — public domain. Chaupais 14–23.",
  },
  {
    id: "hanuman-chalisa-4", tradition: "hindu", kind: "chalisa",
    title: "Hanuman Chalisa — Part 4: What He Gives (verses 24–33)", native: "हनुमान चालीसा — भाग ४",
    occasion: "protection", lang: "hi", topic: "protection", theme: "bold", excerpt: true,
    hook: "This is the part people recite when they are frightened at night. Here is the promise, line by line.",
    intro: "This is the fourth part of the Hanuman Chalisa by Tulsidas — verses twenty-four to thirty-three, the promises: fear driven off, illness eased, and the gift that matters more than the eight powers.",
    lines: [
      { o: "भूत पिसाच निकट नहिं आवै । महाबीर जब नाम सुनावै ॥", t: "Bhūt pisāch nikat nahin āvai. Mahābīr jab nām sunāvai.", m: "Ghosts and evil spirits do not come near when the great hero's name is spoken." },
      { o: "नासै रोग हरै सब पीरा । जपत निरंतर हनुमत बीरा ॥", t: "Nāsai rog harai sab pīrā. Japat nirantar Hanumat bīrā.", m: "Illness is destroyed and every pain removed for one who repeats brave Hanuman's name without stopping." },
      { o: "संकट तें हनुमान छुड़ावै । मन क्रम बचन ध्यान जो लावै ॥", t: "Sankat ten Hanumān chhudāvai. Man kram bachan dhyān jo lāvai.", m: "Hanuman frees from trouble the one who turns to him in thought, in action and in word." },
      { o: "सब पर राम तपस्वी राजा । तिन के काज सकल तुम साजा ॥", t: "Sab par Rām tapasvī rājā. Tin ke kāj sakal tum sājā.", m: "Rama, the ascetic king, is above all — and every one of his tasks, you completed." },
      { o: "और मनोरथ जो कोई लावै । सोइ अमित जीवन फल पावै ॥", t: "Aur manorath jo koī lāvai. Soi amit jīvan phal pāvai.", m: "Whoever brings you any other wish receives the boundless fruit of life." },
      { o: "चारों जुग परताप तुम्हारा । है परसिद्ध जगत उजियारा ॥", t: "Chāron jug partāp tumhārā. Hai parsiddh jagat ujiyārā.", m: "Your glory fills all four ages; your light is famous through the world." },
      { o: "साधु संत के तुम रखवारे । असुर निकंदन राम दुलारे ॥", t: "Sādhu sant ke tum rakhavāre. Asur nikandan Rām dulāre.", m: "You are the guardian of the good and the holy; destroyer of demons, beloved of Rama." },
      { o: "अष्ट सिद्धि नौ निधि के दाता । अस बर दीन जानकी माता ॥", t: "Asht siddhi nau nidhi ke dātā. As bar dīn Jānakī Mātā.", m: "Giver of the eight powers and the nine treasures — that was the gift Mother Sita granted you." },
      { o: "राम रसायन तुम्हरे पासा । सदा रहो रघुपति के दासा ॥", t: "Rām rasāyan tumhare pāsā. Sadā raho Raghupati ke dāsā.", m: "You hold the elixir of Rama's name; may you remain his servant always." },
      { o: "तुम्हरे भजन राम को पावै । जनम जनम के दुख बिसरावै ॥", t: "Tumhare bhajan Rām ko pāvai. Janam janam ke dukh bisarāvai.", m: "Singing to you, one reaches Rama, and forgets the sorrows of many lifetimes." },
    ],
    reflection: "Eight powers and nine treasures — and the very next line says the real thing Hanuman holds is a name, and his own wish is to stay a servant. The Chalisa puts the superpowers and the humility side by side on purpose. The protection it promises is not a force field; it is what happens to fear when your attention is fully on something you love more than yourself. Tonight, if you cannot sleep, do not fight the thought that is circling. Say the first line here, slowly, five times, and give the mind one thing to hold instead of the fear. That is how the ghosts leave.",
    source: "Goswami Tulsidas, 16th century — public domain. Chaupais 24–33.",
  },
  {
    id: "hanuman-chalisa-5", tradition: "hindu", kind: "chalisa",
    title: "Hanuman Chalisa — Part 5: The Ending (verses 34–40)", native: "हनुमान चालीसा — भाग ५",
    occasion: "anytime", lang: "hi", topic: "faith", theme: "gold", excerpt: true,
    hook: "Recite it a hundred times and your chains fall off — that is the actual promise at the end of the Chalisa. Here is what it means.",
    intro: "This is the final part of the Hanuman Chalisa by Tulsidas — verses thirty-four to forty and the closing couplet, where the poet makes his promises, signs his name, and asks Hanuman to stay.",
    lines: [
      { o: "अंत काल रघुबर पुर जाई । जहाँ जन्म हरि-भक्त कहाई ॥", t: "Ant kāl Raghubar pur jāī. Jahān janma Hari-bhakt kahāī.", m: "At the end, one goes to Rama's own city — and wherever born again, is known as God's devotee." },
      { o: "और देवता चित्त न धरई । हनुमत सेइ सर्ब सुख करई ॥", t: "Aur devatā chitta na dharaī. Hanumat sei sarb sukh karaī.", m: "One who holds no other god in mind and serves Hanuman finds every happiness." },
      { o: "संकट कटै मिटै सब पीरा । जो सुमिरै हनुमत बलबीरा ॥", t: "Sankat katai mitai sab pīrā. Jo sumirai Hanumat balbīrā.", m: "Trouble is cut away and every pain fades for the one who remembers Hanuman, the strong and brave." },
      { o: "जय जय जय हनुमान गोसाईं । कृपा करहु गुरुदेव की नाईं ॥", t: "Jai jai jai Hanumān Gosāīn. Kripā karahu Gurudev kī nāīn.", m: "Victory, victory, victory to Hanuman, the master — be gracious to me as a teacher is." },
      { o: "जो सत बार पाठ कर कोई । छूटहि बंदि महा सुख होई ॥", t: "Jo sat bār pāth kar koī. Chhūtahi bandi mahā sukh hoī.", m: "Whoever recites this a hundred times is released from every bond, and great happiness follows." },
      { o: "जो यह पढ़ै हनुमान चालीसा । होय सिद्धि साखी गौरीसा ॥", t: "Jo yah padhai Hanumān Chālīsā. Hoya siddhi sākhī Gaurīsā.", m: "Whoever reads this Hanuman Chalisa will succeed — Shiva himself is witness." },
      { o: "तुलसीदास सदा हरि चेरा । कीजै नाथ हृदय महँ डेरा ॥", t: "Tulsīdās sadā Hari cherā. Kījai nāth hridaya mahan derā.", m: "Tulsidas, forever God's servant, asks: Lord, make your home in my heart." },
      { o: "पवनतनय संकट हरन, मंगल मूरति रूप । राम लखन सीता सहित, हृदय बसहु सुर भूप ॥", t: "Pavan-tanay sankat haran, mangal mūrati rūp. Rām Lakhan Sītā sahit, hridaya basahu sur bhūp.", m: "Son of the wind, remover of trouble, the very form of good fortune — with Rama, Lakshman and Sita, live in my heart, king of the gods." },
    ],
    reflection: "A hundred recitations, the poem says, and the chains come off. Do the arithmetic: at eleven minutes each, that is eighteen hours of saying the same forty verses. Nobody does that in a day. The promise is not magic — it is a description of what a hundred repetitions of anything do to a person. The fear you had at recitation one is not the fear you have at recitation sixty. And the last line is not a request for power; it is an invitation to a guest: come and live here. Start the count today. One full Chalisa, out loud, eleven minutes. Write a 1 somewhere you will see it. Then tomorrow, a 2.",
    source: "Goswami Tulsidas, 16th century — public domain. Chaupais 34–40 and the closing doha.",
  },
  {
    id: "sarve-bhavantu-sukhinah", tradition: "hindu", kind: "mantra",
    title: "Shanti Mantra — May All Be Happy", native: "सर्वे भवन्तु सुखिनः",
    occasion: "peace", lang: "sa", topic: "peace", theme: "calm",
    hook: "A prayer that does not mention you once.",
    intro: "This is a shanti mantra — a peace prayer — recited at the end of gatherings and at the close of the day.",
    lines: [
      { o: "ॐ सर्वे भवन्तु सुखिनः", t: "Om sarve bhavantu sukhinaḥ", m: "May everyone be happy." },
      { o: "सर्वे सन्तु निरामयाः", t: "sarve santu nirāmayāḥ", m: "May everyone be free of illness." },
      { o: "सर्वे भद्राणि पश्यन्तु", t: "sarve bhadrāṇi paśyantu", m: "May everyone see what is good." },
      { o: "मा कश्चिद्दुःखभाग्भवेत्", t: "mā kaścid duḥkha-bhāg bhavet", m: "May no one have to carry suffering." },
      { o: "ॐ शान्तिः शान्तिः शान्तिः", t: "Om śāntiḥ śāntiḥ śāntiḥ", m: "Peace. Peace. Peace." },
    ],
    reflection: "Peace is said three times at the end — for the body, for the world around us, and for what we cannot see or control. The prayer never asks for anything for the person saying it. Try it: the moment you want good things for everyone, you are already calmer than you were.",
    source: "Traditional Sanskrit shanti mantra (Brihadaranyaka / Garuda Purana lineage) — public domain.",
  },
  {
    id: "asato-ma-sadgamaya", tradition: "hindu", kind: "mantra",
    title: "Lead Me From Darkness to Light", native: "असतो मा सद्गमय",
    occasion: "beginnings", lang: "sa", topic: "guidance", theme: "night",
    hook: "Three requests. Each one bigger than the last.",
    intro: "This is the Pavamana mantra from the Brihadaranyaka Upanishad, one of the oldest prayers still spoken every day.",
    lines: [
      { o: "ॐ असतो मा सद्गमय", t: "Om asato mā sad gamaya", m: "Lead me from what is untrue to what is true." },
      { o: "तमसो मा ज्योतिर्गमय", t: "tamaso mā jyotir gamaya", m: "Lead me from darkness to light." },
      { o: "मृत्योर्मा अमृतं गमय", t: "mṛtyor mā amṛtaṃ gamaya", m: "Lead me from death to what does not die." },
      { o: "ॐ शान्तिः शान्तिः शान्तिः", t: "Om śāntiḥ śāntiḥ śāntiḥ", m: "Peace. Peace. Peace." },
    ],
    reflection: "Notice the verb. Not 'give me' — 'lead me'. The prayer assumes you will have to walk, and only asks not to walk alone or in the wrong direction. Say it on the first morning of anything new.",
    source: "Brihadaranyaka Upanishad 1.3.28 — Vedic scripture, public domain.",
  },
  {
    id: "mahamrityunjaya-mantra", tradition: "hindu", kind: "mantra",
    title: "Mahamrityunjaya Mantra", native: "महामृत्युंजय मन्त्र",
    occasion: "healing", lang: "sa", topic: "protection", theme: "forest",
    hook: "When someone you love is in hospital, this is the mantra Hindus send.",
    intro: "This is the Mahamrityunjaya, the great prayer over death, from the Rig Veda — said for healing and for protection.",
    lines: [
      { o: "ॐ त्र्यम्बकं यजामहे", t: "Om tryambakaṃ yajāmahe", m: "We honour the three-eyed one," },
      { o: "सुगन्धिं पुष्टिवर्धनम्", t: "sugandhiṃ puṣṭi-vardhanam", m: "who is fragrant, who makes all things grow and flourish." },
      { o: "उर्वारुकमिव बन्धनान्", t: "urvārukam iva bandhanān", m: "As a ripe cucumber slips free of its stem," },
      { o: "मृत्योर्मुक्षीय मामृतात्", t: "mṛtyor mukṣīya mā'mṛtāt", m: "free us from death — but not from what is deathless." },
    ],
    reflection: "The image is gentle on purpose. A ripe fruit does not fight the vine; it lets go when it is ready. The prayer is not a demand to be spared everything. It asks that when release comes, it comes ripely, and that what matters in us is never lost. Say it three times today for the person on your mind, and say their name after the last line.",
    source: "Rig Veda 7.59.12 — Vedic scripture, public domain.",
  },
  {
    id: "vakratunda-mahakaya", tradition: "hindu", kind: "mantra",
    title: "Ganesh Mantra — Vakratunda Mahakaya", native: "वक्रतुण्ड महाकाय",
    occasion: "beginnings", lang: "sa", topic: "purpose", theme: "hope",
    hook: "Before an exam, a journey, a wedding, a first day — this is what gets said first.",
    intro: "This is the Vakratunda mantra to Ganesha, the remover of obstacles, spoken at the start of anything that matters.",
    lines: [
      { o: "वक्रतुण्ड महाकाय", t: "Vakratuṇḍa mahākāya", m: "You with the curved trunk and the great body," },
      { o: "सूर्यकोटि समप्रभ", t: "sūrya-koṭi sama-prabha", m: "bright as ten million suns —" },
      { o: "निर्विघ्नं कुरु मे देव", t: "nirvighnaṃ kuru me deva", m: "make my path free of obstacles, Lord," },
      { o: "सर्वकार्येषु सर्वदा", t: "sarva-kāryeṣu sarvadā", m: "in everything I do, always." },
    ],
    reflection: "Ganesha is honoured first not because he is the greatest, but because beginnings are where most things fail. The prayer is a small act of humility: I am about to start, and I know I cannot see every obstacle. Say it, then begin.",
    source: "Traditional Sanskrit dhyana shloka — public domain.",
  },

  /* ========================== CHRISTIAN ========================== */
  {
    id: "lords-prayer", tradition: "christian", kind: "prayer",
    title: "The Lord's Prayer",
    occasion: "anytime", lang: "en", topic: "faith", theme: "royal",
    hook: "The one prayer Jesus actually taught — line by line.",
    intro: "This is the Lord's Prayer, from the Gospel of Matthew — the words Jesus gave when his followers asked him how to pray.",
    lines: [
      { o: "Our Father, who art in heaven, hallowed be thy name.", m: "You are close enough to be called Father, and holy enough to be honoured." },
      { o: "Thy kingdom come, thy will be done, on earth as it is in heaven.", m: "Let things here become the way they already are with you." },
      { o: "Give us this day our daily bread.", m: "Give us what we need for today — not a lifetime's worth, just today." },
      { o: "And forgive us our trespasses, as we forgive those who trespass against us.", m: "Forgive us the way we forgive others — which means we had better forgive." },
      { o: "And lead us not into temptation, but deliver us from evil.", m: "Keep us out of what we cannot handle, and pull us out of what harms us." },
      { o: "For thine is the kingdom, and the power, and the glory, for ever and ever. Amen.", m: "All of it is yours. Let it be so." },
    ],
    reflection: "It is a short prayer, and everything in it is plural. Our Father. Give us. Forgive us. It was never written for one person alone in a room; it assumes you are part of something. Say it and you are praying with everyone who has ever said it. Say it once today, slowly, and at every 'us' picture one face. It changes the prayer.",
    source: "Matthew 6:9–13, traditional English wording — public domain.",
  },
  {
    id: "psalm-23", tradition: "christian", kind: "psalm",
    title: "Psalm 23 — The Lord Is My Shepherd",
    occasion: "grief", lang: "en", topic: "comfort", theme: "calm",
    hook: "The psalm read at more bedsides and gravesides than any other.",
    intro: "This is the twenty-third Psalm, a song of David, in the classic English of the King James Bible.",
    lines: [
      { o: "The Lord is my shepherd; I shall not want.", m: "I am looked after. I will have what I need." },
      { o: "He maketh me to lie down in green pastures: he leadeth me beside the still waters.", m: "He makes me rest, and leads me to places where I can breathe." },
      { o: "He restoreth my soul: he leadeth me in the paths of righteousness for his name's sake.", m: "He brings me back to myself, and shows me the right way to go." },
      { o: "Yea, though I walk through the valley of the shadow of death, I will fear no evil: for thou art with me; thy rod and thy staff they comfort me.", m: "Even through the darkest part, I am not afraid — because I am not alone." },
      { o: "Thou preparest a table before me in the presence of mine enemies: thou anointest my head with oil; my cup runneth over.", m: "Even surrounded by trouble, I am cared for, honoured, and given more than enough." },
      { o: "Surely goodness and mercy shall follow me all the days of my life: and I will dwell in the house of the Lord for ever.", m: "Goodness will follow me all my life, and I will be home with God always." },
    ],
    reflection: "The psalm does not promise a way around the valley. It says 'through'. Comfort here is not the absence of the dark; it is company inside it. That is why it is read to the grieving — not to explain the loss, but to say you will not walk this alone. If you are grieving, read only the fourth line today. That is enough for one day.",
    source: "Psalm 23, King James Version (1611) — public domain.",
  },
  {
    id: "beatitudes", tradition: "christian", kind: "teaching",
    title: "The Beatitudes",
    occasion: "anytime", lang: "en", topic: "hope", theme: "hope",
    hook: "Jesus' list of who is blessed — and almost nobody on it is winning.",
    intro: "These are the Beatitudes, the opening of the Sermon on the Mount in the Gospel of Matthew.",
    lines: [
      { o: "Blessed are the poor in spirit: for theirs is the kingdom of heaven.", m: "Blessed are those who know they are empty — there is room in them for God." },
      { o: "Blessed are they that mourn: for they shall be comforted.", m: "Blessed are the grieving — comfort is coming." },
      { o: "Blessed are the meek: for they shall inherit the earth.", m: "Blessed are the gentle — the world ends up in their hands." },
      { o: "Blessed are they which do hunger and thirst after righteousness: for they shall be filled.", m: "Blessed are those who ache for things to be made right — they will be satisfied." },
      { o: "Blessed are the merciful: for they shall obtain mercy.", m: "Blessed are those who let others off — they will be let off too." },
      { o: "Blessed are the pure in heart: for they shall see God.", m: "Blessed are those whose hearts are undivided — they will see God." },
      { o: "Blessed are the peacemakers: for they shall be called the children of God.", m: "Blessed are those who make peace — they look like their Father." },
    ],
    reflection: "Every line names a state the world calls losing — poor, grieving, meek, hungry — and calls it blessed. It is not saying suffering is good. It is saying God's attention goes first to the people at the bottom. If that is where you are today, you are not out of sight. Find your own line in the list — the one that describes this week — and say the second half of it out loud.",
    source: "Matthew 5:3–9, King James Version (1611) — public domain.",
  },
  {
    id: "prayer-of-st-francis", tradition: "christian", kind: "prayer",
    title: "Prayer of Saint Francis — Instrument of Peace",
    occasion: "peace", lang: "en", topic: "love", theme: "forest",
    hook: "A prayer that asks for nothing — except to be useful.",
    intro: "This is the prayer known as the Prayer of Saint Francis, first published in France in 1912 and loved across every church since.",
    lines: [
      { o: "Lord, make me an instrument of your peace.", m: "Use me to bring peace, the way a musician uses an instrument." },
      { o: "Where there is hatred, let me sow love; where there is injury, pardon; where there is doubt, faith.", m: "Let me answer hate with love, hurt with forgiveness, and doubt with trust." },
      { o: "Where there is despair, hope; where there is darkness, light; where there is sadness, joy.", m: "Let me carry hope, light and joy into the places that have run out of them." },
      { o: "Grant that I may not so much seek to be consoled as to console; to be understood as to understand; to be loved as to love.", m: "Let me care less about being comforted, understood and loved, and more about giving those things." },
      { o: "For it is in giving that we receive, it is in pardoning that we are pardoned, and it is in dying that we are born to eternal life.", m: "Because giving is how we receive, forgiving is how we are forgiven, and letting go is how we truly live." },
    ],
    reflection: "Most prayers ask God to change something. This one asks God to change the person praying. Read it again and notice there is not one request for yourself — only requests to be turned into someone others can lean on. That is a bigger ask than it looks. Choose one pair — hatred and love, injury and pardon, sadness and joy — and be the second word for one person before the day ends.",
    source: "Anonymous, first printed in La Clochette, Paris, 1912 — public domain. Rendered in plain English.",
  },
  {
    id: "doxology", tradition: "christian", kind: "hymn",
    title: "The Doxology — Praise God From Whom All Blessings Flow",
    occasion: "gratitude", lang: "en", topic: "gratitude", theme: "gold",
    hook: "Four lines, three hundred and fifty years old, still sung every Sunday.",
    intro: "This is the Doxology, written by Bishop Thomas Ken in 1674 — a verse of pure thanks, sung at the end of worship.",
    lines: [
      { o: "Praise God, from whom all blessings flow;", m: "Thank God — every good thing started with him." },
      { o: "Praise Him, all creatures here below;", m: "Everything alive on earth, join in." },
      { o: "Praise Him above, ye heavenly host;", m: "Everything in heaven, join in too." },
      { o: "Praise Father, Son, and Holy Ghost. Amen.", m: "Praise God in all the ways he has shown himself. So be it." },
    ],
    reflection: "It was written as the last verse of a longer hymn for the boys of a school, to sing at bedtime. The idea was simple: end the day on thanks, whatever the day was like. Three centuries later it still works for exactly that. Say it tonight with the lights already off. That is what it was written for.",
    source: "Thomas Ken, 1674 — public domain.",
  },
  {
    id: "psalm-91", tradition: "christian", kind: "psalm",
    title: "Psalm 91 — Under His Wings",
    occasion: "protection", lang: "en", topic: "protection", theme: "night", excerpt: true,
    hook: "The psalm soldiers carry in their pockets.",
    intro: "This is the opening of Psalm 91, the psalm of protection, in the King James English.",
    lines: [
      { o: "He that dwelleth in the secret place of the most High shall abide under the shadow of the Almighty.", m: "If you make your home close to God, you live in his shade." },
      { o: "I will say of the Lord, He is my refuge and my fortress: my God; in him will I trust.", m: "I will say it out loud: he is where I run, and he is my wall. I trust him." },
      { o: "Surely he shall deliver thee from the snare of the fowler, and from the noisome pestilence.", m: "He will pull you out of the trap and away from the sickness." },
      { o: "He shall cover thee with his feathers, and under his wings shalt thou trust: his truth shall be thy shield and buckler.", m: "He will cover you like a bird covers her young; his faithfulness is your shield." },
      { o: "Thou shalt not be afraid for the terror by night; nor for the arrow that flieth by day.", m: "You do not have to be afraid of what comes at night, or what strikes in daylight." },
    ],
    reflection: "The psalm is full of pictures — shade, fortress, feathers, shield — because fear does not respond to arguments; it responds to pictures. When you cannot reason yourself calm, borrow one of these. Under his wings is a good place to sit.",
    source: "Psalm 91:1–5, King James Version (1611) — public domain. Excerpt.",
  },

  {
    id: "isaiah-41-10-prayer", tradition: "christian", kind: "prayer",
    title: "Fear Thou Not — Isaiah 41:10 as a Prayer",
    occasion: "courage", lang: "en", topic: "courage", theme: "hope",
    hook: "The most-read Bible verse in the world for four of the last six years. Not John 3:16. This one.",
    intro: "This is Isaiah 41:10, in the King James Bible — a promise spoken to a frightened people in exile, and today the verse people reach for more than any other.",
    lines: [
      { o: "Fear thou not; for I am with thee:", m: "Do not be afraid. I am here with you." },
      { o: "be not dismayed; for I am thy God:", m: "Do not lose heart. I am yours, and you are mine." },
      { o: "I will strengthen thee;", m: "I will make you strong enough for this." },
      { o: "yea, I will help thee;", m: "Yes — I will help you." },
      { o: "yea, I will uphold thee with the right hand of my righteousness.", m: "Yes — I will hold you up, with the hand that never does wrong." },
    ],
    reflection: "Two commands and five promises, and the commands come first: stop being afraid, stop being dismayed. Then the reasons. Notice the verse never says the thing you fear will not happen. It says you will not face it alone, you will be made strong enough, and you will be held up if you fall. Turn it into a prayer by changing one word: 'I am with you' becomes 'you are with me'. Say it that way, in your own voice, before the appointment or the conversation you are dreading this week. Five sentences. Then walk in.",
    source: "Isaiah 41:10, King James Version (1611) — public domain.",
  },
  {
    id: "jeremiah-29-11-prayer", tradition: "christian", kind: "prayer",
    title: "I Know the Thoughts I Think Toward You — Jeremiah 29:11",
    occasion: "beginnings", lang: "en", topic: "hope", theme: "forest",
    hook: "The verse on a million graduation cards was written to people who had just lost everything. That changes what it means.",
    intro: "This is Jeremiah 29, verses eleven to thirteen, in the King James Bible — a letter from God to a people carried off into exile, who had been told they would be there seventy years.",
    lines: [
      { o: "For I know the thoughts that I think toward you, saith the Lord,", m: "I know exactly what I have in mind for you, says the Lord —" },
      { o: "thoughts of peace, and not of evil, to give you an expected end.", m: "plans for your good and not for your harm, to bring you to a future you can hope for." },
      { o: "Then shall ye call upon me, and ye shall go and pray unto me, and I will hearken unto you.", m: "Then you will call to me, and come and pray to me, and I will listen." },
      { o: "And ye shall seek me, and find me, when ye shall search for me with all your heart.", m: "You will look for me and you will find me — when you look with everything you have." },
    ],
    reflection: "Read the verse before this one and it says: settle in, build houses, plant gardens, you are going to be here a long time. The promise of a hopeful future is made to people who have to wait for it — the 'expected end' is seventy years off. So this is not a verse about things working out soon. It is about what to do in the meantime: call, pray, search with the whole heart. Turn it into a prayer by starting with the hard part: 'I am in a place I did not choose.' Then say the last line back to God as a promise of your own. Then plant something — literally, if you can — today.",
    source: "Jeremiah 29:11–13, King James Version (1611) — public domain.",
  },
  {
    id: "philippians-4-6-prayer", tradition: "christian", kind: "prayer",
    title: "Be Careful for Nothing — Philippians 4:6–7",
    occasion: "peace", lang: "en", topic: "peace", theme: "calm",
    hook: "A two-verse prescription for anxiety, written by a man in prison. It has four steps and most people skip the third.",
    intro: "This is Philippians 4, verses six and seven, in the King James Bible — written by Paul from a Roman prison to a church he loved, about what to do with worry.",
    lines: [
      { o: "Be careful for nothing;", m: "Do not be anxious about anything —" },
      { o: "but in every thing by prayer and supplication", m: "instead, in every situation, by praying and by asking plainly," },
      { o: "with thanksgiving", m: "and with thanks —" },
      { o: "let your requests be made known unto God.", m: "tell God what you need." },
      { o: "And the peace of God, which passeth all understanding,", m: "And God's own peace, which makes no sense given the circumstances," },
      { o: "shall keep your hearts and minds through Christ Jesus.", m: "will stand guard over your heart and your mind, in Christ Jesus." },
    ],
    reflection: "Four steps: pray, ask, give thanks, tell God specifically. The one people skip is thanks — because when you are anxious, thanks feels like lying. But gratitude in the middle of the asking is what turns a worry list into a prayer. And notice the promise. Not that the problem is solved — that your heart and mind are guarded. Tonight, write your worry in one sentence. Under it, one thing you are thankful for that is true right now. Then read both to God. That is the whole prescription.",
    source: "Philippians 4:6–7, King James Version (1611) — public domain.",
  },
  /* ============================ JEWISH ============================ */
  {
    id: "shema", tradition: "jewish", kind: "prayer",
    title: "Shema Yisrael", native: "שמע ישראל",
    occasion: "anytime", lang: "he", topic: "faith", theme: "royal",
    hook: "Six words. The first thing a Jewish child learns and the last thing many say.",
    intro: "This is the Shema, from Deuteronomy — the central declaration of Jewish faith, said morning and evening.",
    lines: [
      { o: "שְׁמַע יִשְׂרָאֵל ה׳ אֱלֹהֵינוּ ה׳ אֶחָד", t: "Shema Yisrael, Adonai Eloheinu, Adonai Echad.", m: "Listen, Israel: the Lord is our God, the Lord is One." },
      { o: "בָּרוּךְ שֵׁם כְּבוֹד מַלְכוּתוֹ לְעוֹלָם וָעֶד", t: "Baruch shem kevod malchuto le'olam va'ed.", m: "Blessed is the name of his glorious kingdom for ever and ever." },
      { o: "וְאָהַבְתָּ אֵת ה׳ אֱלֹהֶיךָ בְּכָל־לְבָבְךָ וּבְכָל־נַפְשְׁךָ וּבְכָל־מְאֹדֶךָ", t: "V'ahavta et Adonai Elohecha b'chol levavcha, u'v'chol nafshecha, u'v'chol me'odecha.", m: "And you shall love the Lord your God with all your heart, with all your soul, and with all you have." },
    ],
    reflection: "It begins with 'listen', not 'believe'. Before anything is asked of you, you are asked to stop and hear. And what follows the great declaration is not a rule but a love — with the heart, the soul, and everything you own. Faith, in this prayer, is a way of loving. Say the first line the traditional way: eyes covered with your right hand, so 'listen' becomes literal. Six words, then open your eyes.",
    source: "Deuteronomy 6:4–5 — Torah, public domain. The divine name is written ה׳ and spoken 'Adonai', as in a siddur.",
  },
  {
    id: "modeh-ani", tradition: "jewish", kind: "prayer",
    title: "Modeh Ani — Waking Thanks", native: "מודה אני",
    occasion: "morning", lang: "he", topic: "gratitude", theme: "hope",
    hook: "Twelve words to say before your feet touch the floor.",
    intro: "This is Modeh Ani, the first prayer of the Jewish day, said on waking, before getting out of bed.",
    lines: [
      { o: "מוֹדֶה אֲנִי לְפָנֶיךָ מֶלֶךְ חַי וְקַיָּם", t: "Modeh ani lefanecha, melech chai v'kayam,", m: "I thank you, living and eternal King," },
      { o: "שֶׁהֶחֱזַרְתָּ בִּי נִשְׁמָתִי בְּחֶמְלָה", t: "she'hechezarta bi nishmati b'chemlah,", m: "for giving my soul back to me, gently," },
      { o: "רַבָּה אֱמוּנָתֶךָ", t: "rabbah emunatecha.", m: "Your faithfulness is great." },
    ],
    reflection: "It is said before washing, before coffee, before the phone. The order is the point: gratitude first, then everything else. And notice what is being thanked — not the good night's sleep, but the fact of waking at all. Most mornings that is the thing we forget to count. Tomorrow, say it before your feet touch the floor. One morning is enough to feel the difference; a week is enough to want it.",
    source: "Traditional morning prayer, from the siddur — public domain. (A woman says 'modah ani'.)",
  },
  {
    id: "birkat-kohanim", tradition: "jewish", kind: "blessing",
    title: "The Priestly Blessing", native: "ברכת כהנים",
    occasion: "protection", lang: "he", topic: "protection", theme: "gold",
    hook: "The oldest blessing still spoken — three thousand years, word for word.",
    intro: "This is the Priestly Blessing from the Book of Numbers, said over children on Friday nights and over the congregation on festivals.",
    lines: [
      { o: "יְבָרֶכְךָ ה׳ וְיִשְׁמְרֶךָ", t: "Yevarechecha Adonai v'yishmerecha.", m: "May the Lord bless you and keep you." },
      { o: "יָאֵר ה׳ פָּנָיו אֵלֶיךָ וִיחֻנֶּךָּ", t: "Ya'er Adonai panav eilecha vichuneka.", m: "May the Lord's face shine on you, and may he be gracious to you." },
      { o: "יִשָּׂא ה׳ פָּנָיו אֵלֶיךָ וְיָשֵׂם לְךָ שָׁלוֹם", t: "Yisa Adonai panav eilecha v'yasem lecha shalom.", m: "May the Lord turn his face toward you, and give you peace." },
    ],
    reflection: "Each line is longer than the last — three words, five, seven — the blessing grows as it goes. And it ends on the one thing every other blessing is really for: peace. Parents say it with a hand on the child's head. You can say it over anyone.",
    source: "Numbers 6:24–26 — Torah, public domain.",
  },
  {
    id: "psalm-121", tradition: "jewish", kind: "psalm",
    title: "Psalm 121 — I Lift My Eyes", native: "שיר למעלות",
    occasion: "protection", lang: "he", topic: "protection", theme: "forest", excerpt: true,
    hook: "Why Jewish travellers say this one at the door, not on the road.",
    intro: "This is Psalm 121, a song of ascents — sung by pilgrims walking up to Jerusalem, and said today before travel and through the night.",
    lines: [
      { o: "שִׁיר לַמַּעֲלוֹת אֶשָּׂא עֵינַי אֶל הֶהָרִים מֵאַיִן יָבֹא עֶזְרִי", t: "Shir lama'alot. Esa einai el heharim, me'ayin yavo ezri?", m: "I lift my eyes to the mountains. Where will my help come from?" },
      { o: "עֶזְרִי מֵעִם ה׳ עֹשֵׂה שָׁמַיִם וָאָרֶץ", t: "Ezri me'im Adonai, oseh shamayim va'aretz.", m: "My help comes from the Lord, who made heaven and earth." },
      { o: "הִנֵּה לֹא יָנוּם וְלֹא יִישָׁן שׁוֹמֵר יִשְׂרָאֵל", t: "Hineh lo yanum v'lo yishan, shomer Yisrael.", m: "See — the guardian of Israel does not doze and does not sleep." },
      { o: "ה׳ יִשְׁמָר צֵאתְךָ וּבוֹאֶךָ מֵעַתָּה וְעַד עוֹלָם", t: "Adonai yishmor tzet'cha u'vo'echa, me'atah v'ad olam.", m: "The Lord will guard your going out and your coming in, from now and for ever." },
    ],
    reflection: "It opens with a question and a glance upward — the exact posture of someone who is not sure they will manage. The answer is not that the road will be easy. It is that someone is awake the whole way. Say the last line at the door.",
    source: "Psalm 121:1–2, 4, 8 — public domain. Excerpt.",
  },
  {
    id: "oseh-shalom", tradition: "jewish", kind: "prayer",
    title: "Oseh Shalom — Maker of Peace", native: "עושה שלום",
    occasion: "peace", lang: "he", topic: "peace", theme: "calm",
    hook: "The last line of the mourner's prayer is not about death. Here is what it says instead.",
    intro: "This is Oseh Shalom, the closing line of the Kaddish and the Amidah, sung at the end of prayer.",
    lines: [
      { o: "עֹשֶׂה שָׁלוֹם בִּמְרוֹמָיו", t: "Oseh shalom bimromav,", m: "The one who makes peace in the heavens above," },
      { o: "הוּא יַעֲשֶׂה שָׁלוֹם עָלֵינוּ", t: "hu ya'aseh shalom aleinu,", m: "may he make peace for us," },
      { o: "וְעַל כָּל יִשְׂרָאֵל וְאִמְרוּ אָמֵן", t: "v'al kol Yisrael, v'imru amen.", m: "and for all Israel — and let us say, amen." },
    ],
    reflection: "The logic is gentle: if peace is possible up there, among forces far bigger than us, then peace is possible down here too. It is said at the end of mourning prayers on purpose — the last word after loss is not the loss. It is peace. Say it tonight for one specific person — put their name where the prayer says 'us'.",
    source: "Traditional liturgy (Kaddish, Amidah) — public domain.",
  },

  /* =========================== ISLAMIC =========================== */
  {
    id: "al-fatiha", tradition: "islamic", kind: "dua", narrate: "meaning",
    title: "Al-Fatiha — The Opening", native: "الفاتحة",
    occasion: "anytime", lang: "ar", topic: "guidance", theme: "royal",
    hook: "Seven verses Muslims say at least seventeen times a day. Here is what they mean.",
    intro: "This is Surah Al-Fatiha, the opening chapter of the Qur'an, recited in every unit of every prayer. The Arabic is shown; the meaning is spoken.",
    lines: [
      { o: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ", t: "Bismillāhir-Raḥmānir-Raḥīm", m: "In the name of God, the endlessly merciful, the especially merciful." },
      { o: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ", t: "Al-ḥamdu lillāhi Rabbil-'ālamīn", m: "All praise belongs to God, who sustains every world there is." },
      { o: "الرَّحْمَٰنِ الرَّحِيمِ", t: "Ar-Raḥmānir-Raḥīm", m: "The endlessly merciful, the especially merciful." },
      { o: "مَالِكِ يَوْمِ الدِّينِ", t: "Māliki yawmid-dīn", m: "Master of the day when everything is set right." },
      { o: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ", t: "Iyyāka na'budu wa iyyāka nasta'īn", m: "You alone we worship, and you alone we ask for help." },
      { o: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ", t: "Ihdinaṣ-ṣirāṭal-mustaqīm", m: "Guide us along the straight path —" },
      { o: "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ", t: "Ṣirāṭal-ladhīna an'amta 'alayhim, ghayril-maghḍūbi 'alayhim wa laḍ-ḍāllīn", m: "the path of those you have blessed; not of those who earned anger, nor of those who lost their way." },
    ],
    reflection: "Mercy is named three times before anything is asked. Only then comes the one request — and it is not for wealth or safety, but for direction. The chapter is called The Opening because it is the door the rest walks through: praise first, then a plea to be pointed the right way. Read the last line slowly today. It asks only not to be lost — and that is a prayer anyone, in any language, can mean.",
    source: "Qur'an 1:1–7 — scripture, public domain. Meaning rendered in plain English; the Arabic is shown on screen and never voiced synthetically.",
  },
  {
    id: "ayat-al-kursi", tradition: "islamic", kind: "dua", narrate: "meaning",
    title: "Ayat al-Kursi — The Throne Verse", native: "آية الكرسي",
    occasion: "protection", lang: "ar", topic: "protection", theme: "night",
    hook: "The verse Muslims say before sleep for protection — and what it actually claims.",
    intro: "This is Ayat al-Kursi, the Throne Verse, from the second chapter of the Qur'an — recited for protection, especially at night. The Arabic is shown; the meaning is spoken.",
    lines: [
      { o: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ", t: "Allāhu lā ilāha illā Huwal-Ḥayyul-Qayyūm", m: "God — there is nothing worthy of worship but him, the Living, the one who holds everything up." },
      { o: "لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ", t: "Lā ta'khudhuhū sinatun wa lā nawm", m: "Neither drowsiness nor sleep ever takes him." },
      { o: "لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ", t: "Lahū mā fis-samāwāti wa mā fil-arḍ", m: "Everything in the heavens and everything on earth belongs to him." },
      { o: "يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ", t: "Ya'lamu mā bayna aydīhim wa mā khalfahum", m: "He knows what lies ahead of them and what lies behind them." },
      { o: "وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ وَلَا يَئُودُهُ حِفْظُهُمَا", t: "Wasi'a kursiyyuhus-samāwāti wal-arḍ, wa lā ya'ūduhū ḥifẓuhumā", m: "His throne extends over the heavens and the earth, and guarding them does not tire him." },
      { o: "وَهُوَ الْعَلِيُّ الْعَظِيمُ", t: "Wa Huwal-'Aliyyul-'Aẓīm", m: "And he is the Most High, the Tremendous." },
    ],
    reflection: "Read it as a person about to fall asleep. You are about to stop watching; the verse says someone never does. You will lose track of what is ahead and behind; he holds both. The comfort is not that nothing will happen — it is that nothing will happen unwatched. Let it be the last thing before sleep tonight, read or said, with the phone face down. Someone else has the watch.",
    source: "Qur'an 2:255 — scripture, public domain. Key phrases; meaning rendered in plain English. Never voiced synthetically in Arabic.",
    excerpt: true,
  },
  {
    id: "dua-morning", tradition: "islamic", kind: "dua", narrate: "meaning",
    title: "Morning Dua — We Have Entered the Morning", native: "دعاء الصباح",
    occasion: "morning", lang: "ar", topic: "gratitude", theme: "hope",
    hook: "The first sentence of a Muslim's day.",
    intro: "This is a morning remembrance taught by the Prophet Muhammad, peace be upon him — said as the day begins.",
    lines: [
      { o: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ", t: "Aṣbaḥnā wa aṣbaḥal-mulku lillāh", m: "We have reached the morning, and the whole of creation has reached it belonging to God." },
      { o: "وَالْحَمْدُ لِلَّهِ", t: "wal-ḥamdu lillāh", m: "And all praise is God's." },
      { o: "لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ", t: "Lā ilāha illallāhu waḥdahū lā sharīka lah", m: "There is none worthy of worship but God, alone, with no partner." },
      { o: "لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ", t: "Lahul-mulku wa lahul-ḥamdu wa Huwa 'alā kulli shay'in qadīr", m: "To him belongs everything, to him belongs all praise, and he has power over all things." },
    ],
    reflection: "The dua does not say 'I woke up'. It says the morning arrived — for me and for everything — and none of it is mine. That is a strange way to start a day of tasks, and a very good one: the pressure to own the day is lifted before it begins. Before the first task tomorrow, say the first line — then start. Notice how differently the task sits.",
    source: "Hadith (Sahih Muslim) — traditional adhkar, public domain. Meaning spoken; Arabic shown.",
  },
  {
    id: "dua-anxiety", tradition: "islamic", kind: "dua", narrate: "meaning",
    title: "Dua for Worry and Sadness", native: "دعاء الهم والحزن",
    occasion: "peace", lang: "ar", topic: "peace", theme: "calm",
    hook: "A prayer that names anxiety out loud — fourteen centuries ago.",
    intro: "This is a dua the Prophet Muhammad, peace be upon him, taught for worry, grief and weakness.",
    lines: [
      { o: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ", t: "Allāhumma innī a'ūdhu bika minal-hammi wal-ḥazan", m: "O God, I take shelter in you from worry and from sadness," },
      { o: "وَالْعَجْزِ وَالْكَسَلِ", t: "wal-'ajzi wal-kasal", m: "from helplessness and from laziness," },
      { o: "وَالْبُخْلِ وَالْجُبْنِ", t: "wal-bukhli wal-jubn", m: "from stinginess and from cowardice," },
      { o: "وَضَلَعِ الدَّيْنِ وَغَلَبَةِ الرِّجَالِ", t: "wa ḍala'id-dayni wa ghalabatir-rijāl", m: "from the weight of debt, and from being overpowered by people." },
    ],
    reflection: "Look at the list. Worry, sadness, feeling useless, feeling stuck, holding back, being afraid, money trouble, being pushed around. It is an honest map of a bad month. The prayer does not pretend these things are small. It just refuses to face them alone. Find your word on the list — worry, sadness, debt, feeling pushed around — and say that one line for it, out loud, once.",
    source: "Hadith (Sahih al-Bukhari) — traditional dua, public domain. Meaning spoken; Arabic shown.",
  },
  {
    id: "hasbunallah", tradition: "islamic", kind: "dua", narrate: "meaning",
    title: "Hasbunallah — God Is Enough for Us", native: "حسبنا الله ونعم الوكيل",
    occasion: "courage", lang: "ar", topic: "faith", theme: "bold",
    hook: "Five Arabic words people say when the odds are against them.",
    intro: "This is Hasbunallahu wa ni'mal wakeel, from the third chapter of the Qur'an — said by believers facing an army far larger than their own.",
    lines: [
      { o: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ", t: "Ḥasbunallāhu wa ni'mal-wakīl", m: "God is enough for us — and what an excellent guardian he is." },
      { o: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً", t: "Rabbanā ātinā fid-dunyā ḥasanah", m: "Our Lord, give us good in this world," },
      { o: "وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ", t: "wa fil-ākhirati ḥasanatan wa qinā 'adhāban-nār", m: "and good in the life to come, and keep us from the fire." },
    ],
    reflection: "The word wakeel means the one you hand your affairs to — a trustee. The prayer is not a claim that the problem is small. It is a decision about who is handling it. Say the first line once, slowly, the next time the numbers do not add up.",
    source: "Qur'an 3:173 and 2:201 — scripture, public domain. Meaning spoken; Arabic shown.",
  },
  {
    id: "dua-yunus", tradition: "islamic", kind: "dua", narrate: "meaning",
    title: "The Prayer of Jonah — From the Depths", native: "دعاء يونس",
    occasion: "grief", lang: "ar", topic: "hope", theme: "night",
    hook: "The prayer said from inside the whale.",
    intro: "This is the dua of the Prophet Yunus — Jonah — from the twenty-first chapter of the Qur'an, called out from the belly of the fish.",
    lines: [
      { o: "لَا إِلَٰهَ إِلَّا أَنتَ", t: "Lā ilāha illā anta", m: "There is none worthy of worship but you." },
      { o: "سُبْحَانَكَ", t: "subḥānaka", m: "You are beyond every fault." },
      { o: "إِنِّي كُنتُ مِنَ الظَّالِمِينَ", t: "innī kuntu minaẓ-ẓālimīn", m: "Truly, I have been one of those who did wrong." },
    ],
    reflection: "Three parts: who you are, that you are faultless, that I am not. No excuse and no bargain. Jonah was in the dark with no way out, and this is what he found to say — and the Qur'an says he was answered. When you have made the mess yourself, this is still a prayer you are allowed. If you are in the dark you built yourself, say these three parts tonight, in this order. Then sleep.",
    source: "Qur'an 21:87 — scripture, public domain. Meaning spoken; Arabic shown.",
  },

  {
    id: "three-quls", tradition: "islamic", kind: "dua", narrate: "meaning",
    title: "The Three Quls — Before Sleep", native: "المعوذات",
    occasion: "protection", lang: "ar", topic: "protection", theme: "night",
    hook: "Three short chapters, blown into cupped hands and wiped over the body every night — the Prophet's own bedtime routine.",
    intro: "These are the last three chapters of the Qur'an — Al-Ikhlas, Al-Falaq and An-Nas — recited three times before sleep for protection. The Arabic is shown; the meaning is spoken.",
    lines: [
      { o: "قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ", t: "Qul huwallāhu aḥad. Allāhuṣ-ṣamad.", m: "Say: He is God, the One. God, the eternal, on whom everything depends." },
      { o: "لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ", t: "Lam yalid wa lam yūlad. Wa lam yakul-lahū kufuwan aḥad.", m: "He has no child and no parent. And there is nothing at all like him." },
      { o: "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۝ مِن شَرِّ مَا خَلَقَ", t: "Qul a'ūdhu bi-Rabbil-falaq. Min sharri mā khalaq.", m: "Say: I take shelter with the Lord of the daybreak, from the harm in anything he has made," },
      { o: "وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ ۝ وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ", t: "Wa min sharri ghāsiqin idhā waqab. Wa min sharrin-naffāthāti fil-'uqad.", m: "from the harm of the darkness when it settles, from the harm of those who whisper spells over knots," },
      { o: "وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ", t: "Wa min sharri ḥāsidin idhā ḥasad.", m: "and from the harm of the envious one when he envies." },
      { o: "قُلْ أَعُوذُ بِرَبِّ النَّاسِ ۝ مَلِكِ النَّاسِ ۝ إِلَٰهِ النَّاسِ", t: "Qul a'ūdhu bi-Rabbin-nās. Malikin-nās. Ilāhin-nās.", m: "Say: I take shelter with the Lord of people, the King of people, the God of people," },
      { o: "مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ۝ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ", t: "Min sharril-waswāsil-khannās. Alladhī yuwaswisu fī ṣudūrin-nās.", m: "from the harm of the whisperer who slinks away — the one who whispers into people's hearts," },
      { o: "مِنَ الْجِنَّةِ وَالنَّاسِ", t: "Minal-jinnati wan-nās.", m: "whether from unseen beings or from people." },
    ],
    reflection: "Three chapters, three directions of danger. The first one names nothing to fear at all — it only says who God is, as if that were the protection. The second names things outside you: the dark, ill will, envy. The third names the one inside: the whisperer, the voice at 2 a.m. that says the thing you cannot stop thinking. The Prophet's routine was to say all three, breathe into his hands, and pass them over his body — a way of saying: this whole person is covered, outside and in. Tonight, phone face down, say the meaning of the three, and then do the gesture — hands to face, down the arms. It takes forty seconds, and the body remembers it faster than the mind does.",
    source: "Qur'an 112, 113 and 114 — scripture, public domain; the practice from hadith (Sahih al-Bukhari). Meaning spoken; the Arabic is shown and never voiced synthetically.",
  },
  {
    id: "dua-before-sleep", tradition: "islamic", kind: "dua", narrate: "meaning",
    title: "Dua Before Sleep and on Waking", native: "دعاء النوم والاستيقاظ",
    occasion: "evening", lang: "ar", topic: "peace", theme: "night",
    hook: "The last sentence of a Muslim's day, and the first of the next — they are a pair, and they only make sense together.",
    intro: "These are the remembrances the Prophet Muhammad, peace be upon him, said lying down to sleep, and the one said on opening his eyes in the morning.",
    lines: [
      { o: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا", t: "Bismika Allāhumma amūtu wa aḥyā.", m: "In your name, O God, I die and I live." },
      { o: "اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ", t: "Allāhumma qinī 'adhābaka yawma tab'athu 'ibādak.", m: "O God, protect me from your punishment on the day you raise your servants." },
      { o: "بِاسْمِكَ رَبِّي وَضَعْتُ جَنْبِي وَبِكَ أَرْفَعُهُ", t: "Bismika Rabbī wada'tu janbī wa bika arfa'uh.", m: "In your name, my Lord, I lay down my side, and by you I lift it again." },
      { o: "الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ", t: "Al-ḥamdu lillāhil-ladhī aḥyānā ba'da mā amātanā wa ilayhin-nushūr.", m: "All praise to God, who gave us life after taking it from us — and to him is the rising." },
    ],
    reflection: "The sleep dua calls sleep a small death, and the waking dua calls the morning a small resurrection. That sounds heavy until you notice what it does to the day in between: it makes it a gift you were not owed. Every worry you carry to bed is set down by the first line — I am not the one keeping myself alive tonight. And every morning is a fresh start that has already happened once, so the next one is believable. Say the first line tonight, before the last scroll, not after. Say the fourth before your feet touch the floor. Two sentences, one day, bracketed.",
    source: "Hadith (Sahih al-Bukhari and Sahih Muslim) — traditional adhkar, public domain. Meaning spoken; Arabic shown.",
  },
  /* ============================= SIKH ============================= */
  {
    id: "mool-mantar", tradition: "sikh", kind: "prayer",
    title: "Mool Mantar", native: "ਮੂਲ ਮੰਤਰ",
    occasion: "morning", lang: "pa", topic: "faith", theme: "gold",
    hook: "The first words of the Guru Granth Sahib — the whole of Sikh belief in one breath.",
    intro: "This is the Mool Mantar, the root verse, composed by Guru Nanak and placed at the very beginning of the Guru Granth Sahib.",
    lines: [
      { o: "ੴ", t: "Ik Oankār", m: "There is one Creator, and it is everywhere." },
      { o: "ਸਤਿ ਨਾਮੁ", t: "Sat Nām", m: "Truth is its name." },
      { o: "ਕਰਤਾ ਪੁਰਖੁ", t: "Kartā Purakh", m: "It made everything." },
      { o: "ਨਿਰਭਉ ਨਿਰਵੈਰੁ", t: "Nirbhau Nirvair", m: "Without fear, without hatred." },
      { o: "ਅਕਾਲ ਮੂਰਤਿ ਅਜੂਨੀ ਸੈਭੰ", t: "Akāl Mūrat, Ajūnī, Saibhang", m: "Beyond time, never born, existing by itself." },
      { o: "ਗੁਰ ਪ੍ਰਸਾਦਿ ॥", t: "Gur Prasād.", m: "Known by the Guru's grace." },
    ],
    reflection: "Two of the words describe what God is not: not afraid, not hostile. Guru Nanak put them there for us. If the source of everything carries no fear and no grudge, then those two things are not the ground of reality — they are habits, and habits can be set down. Say Nirbhau, Nirvair — without fear, without hatred — once today, not as a description of God but as a description of who you are trying to be by evening.",
    source: "Guru Nanak, Guru Granth Sahib ang 1 — Gurbani, public domain.",
  },
  {
    id: "sarbat-da-bhala", tradition: "sikh", kind: "prayer",
    title: "Sarbat Da Bhala — Good for All", native: "ਸਰਬੱਤ ਦਾ ਭਲਾ",
    occasion: "peace", lang: "pa", topic: "love", theme: "hope",
    hook: "How every Sikh prayer ends — with a wish for people who are not Sikh.",
    intro: "This is the closing line of the Ardas, the prayer said standing at the end of every Sikh service.",
    lines: [
      { o: "ਨਾਨਕ ਨਾਮ ਚੜ੍ਹਦੀ ਕਲਾ", t: "Nānak Nām chaṛhdī kalā,", m: "Nanak says: through the Name, may our spirits keep rising —" },
      { o: "ਤੇਰੇ ਭਾਣੇ ਸਰਬੱਤ ਦਾ ਭਲਾ", t: "tere bhāṇe sarbat dā bhalā.", m: "and by your will, may there be good for everyone." },
    ],
    reflection: "Chardi kala is a Punjabi phrase with no clean English — it means high spirits, rising morale, the refusal to sink. And it is paired with a wish that leaves no one out. That pairing is the whole teaching: keep your own spirit up, and want good for all. Neither one works without the other. End today the Sikh way: name one person you find difficult, and wish them well, out loud, where no one can hear.",
    source: "Ardas, closing line — traditional Sikh liturgy, public domain.",
  },
  {
    id: "tati-vao-na-lagai", tradition: "sikh", kind: "prayer",
    title: "Tati Vao Na Lagai — The Hot Wind Does Not Touch", native: "ਤਾਤੀ ਵਾਉ ਨ ਲਗਈ",
    occasion: "protection", lang: "pa", topic: "protection", theme: "forest",
    hook: "A shabad Sikh mothers say over a sick child.",
    intro: "This is a shabad by Guru Arjan from the Guru Granth Sahib, sung for protection and for the healing of the sick.",
    lines: [
      { o: "ਤਾਤੀ ਵਾਉ ਨ ਲਗਈ ਪਾਰਬ੍ਰਹਮ ਸਰਣਾਈ ॥", t: "Tātī vāu na lagaī, Pārbrahm sarṇāī.", m: "The hot wind does not even touch the one who shelters in the Supreme." },
      { o: "ਚਉਗਿਰਦ ਹਮਾਰੈ ਰਾਮ ਕਾਰ ਦੁਖੁ ਲਗੈ ਨ ਭਾਈ ॥", t: "Chaugirad hamārai Rām kār, dukh lagai na bhāī.", m: "The Lord has drawn a circle all around us — pain cannot reach us, brother." },
    ],
    reflection: "The picture is a circle drawn on the ground around a person, the way you would draw one around a child to say 'stay here, you're safe'. The hot wind is still blowing. The shabad does not say it stops. It says there is a place it cannot reach. Draw the circle for someone: say the second line with a hand on the shoulder of a person who is unwell or afraid.",
    source: "Guru Arjan, Guru Granth Sahib ang 819 — Gurbani, public domain. Opening lines.",
    excerpt: true,
  },
  {
    id: "hukam-rajai-chalna", tradition: "sikh", kind: "teaching",
    title: "Japji Sahib — Walking in Hukam", native: "ਹੁਕਮਿ ਰਜਾਈ ਚਲਣਾ",
    occasion: "anytime", lang: "pa", topic: "wisdom", theme: "calm",
    hook: "Guru Nanak asked how to become truthful. Then he answered in one line.",
    intro: "This is from the first pauri of Japji Sahib, Guru Nanak's morning prayer, which opens the Guru Granth Sahib.",
    lines: [
      { o: "ਕਿਵ ਸਚਿਆਰਾ ਹੋਈਐ ਕਿਵ ਕੂੜੈ ਤੁਟੈ ਪਾਲਿ ॥", t: "Kiv sachiārā hoīai, kiv kūṛai tutai pāl?", m: "How do we become truthful? How does the wall of falsehood come down?" },
      { o: "ਹੁਕਮਿ ਰਜਾਈ ਚਲਣਾ ਨਾਨਕ ਲਿਖਿਆ ਨਾਲਿ ॥੧॥", t: "Hukam rajāī chalṇā, Nānak likhiā nāl.", m: "By walking in step with the divine order, says Nanak — it is written into you already." },
    ],
    reflection: "The wall between us and truth, Nanak says, is not ignorance — it is resistance. Hukam is the way things are and the way they are meant to go. Fighting it is exhausting; walking with it is honest. The answer to 'how do I become true' turns out to be 'stop pushing against what is'. Name one thing today you are still pushing against that is simply how things are. Set it down, and feel how much lighter your shoulders sit.",
    source: "Guru Nanak, Japji Sahib pauri 1, Guru Granth Sahib ang 1 — Gurbani, public domain.",
  },
  {
    id: "sukhmani-sahib-rahao", tradition: "sikh", kind: "prayer",
    title: "Sukhmani Sahib — The Jewel of Peace", native: "ਸੁਖਮਨੀ ਸਾਹਿਬ",
    occasion: "peace", lang: "pa", topic: "peace", theme: "royal",
    hook: "Two lines, repeated twenty-four times, until the mind finally believes them.",
    intro: "This is the refrain of Sukhmani Sahib, the Psalm of Peace, composed by Guru Arjan — read in times of grief and worry.",
    lines: [
      { o: "ਸੁਖਮਨੀ ਸੁਖ ਅੰਮ੍ਰਿਤ ਪ੍ਰਭ ਨਾਮੁ ॥", t: "Sukhmanī sukh amrit Prabh Nām.", m: "The jewel of peace is the sweet nectar of God's Name." },
      { o: "ਭਗਤ ਜਨਾ ਕੈ ਮਨਿ ਬਿਸ੍ਰਾਮ ॥", t: "Bhagat janā kai man bisrām.", m: "In the minds of those who love him, it comes to rest." },
    ],
    reflection: "Bisram means to rest, the way a traveller sits down at the end of a long road. The refrain says peace is not something you achieve by effort; it is something that settles in a mind that keeps returning to the Name. Two lines, repeated across twenty-four sections, until the mind believes them. Read the two lines five times, slowly. The fifth time will feel different from the first — that difference is the whole prayer.",
    source: "Guru Arjan, Sukhmani Sahib, Guru Granth Sahib ang 262 — Gurbani, public domain. The rahao (refrain).",
    excerpt: true,
  },

  /* =========================== BUDDHIST =========================== */
  {
    id: "metta-sutta", tradition: "buddhist", kind: "chant",
    title: "Metta — Loving-Kindness", native: "Mettā",
    occasion: "peace", lang: "pi", topic: "love", theme: "warm",
    hook: "The Buddha's answer to fear was not a weapon. It was this.",
    intro: "This is the heart of the Metta Sutta, the Buddha's discourse on loving-kindness, chanted in Pali across the Buddhist world.",
    lines: [
      { o: "Sabbe sattā bhavantu sukhitattā.", t: "Sabbe sattā bhavantu sukhitattā.", m: "May all beings be happy at heart." },
      { o: "Mātā yathā niyaṃ puttaṃ āyusā ekaputtam anurakkhe,", t: "Mātā yathā niyaṃ puttaṃ āyusā ekaputtam anurakkhe,", m: "As a mother would guard her only child with her life," },
      { o: "evam pi sabbabhūtesu mānasaṃ bhāvaye aparimāṇaṃ.", t: "evam pi sabbabhūtesu mānasaṃ bhāvaye aparimāṇaṃ.", m: "so cultivate a boundless heart toward every living thing." },
      { o: "Mettañca sabbalokasmiṃ mānasaṃ bhāvaye aparimāṇaṃ.", t: "Mettañca sabbalokasmiṃ mānasaṃ bhāvaye aparimāṇaṃ.", m: "Let kindness for the whole world fill the mind without limit." },
    ],
    reflection: "The story goes that monks were frightened in a forest, and the Buddha gave them this to chant — not a charm against the dark, but a way of turning fear into goodwill. It works on the same principle today. You cannot hold fear and wish someone well at the same moment. Choose the second. Pick the one person you are afraid of or angry at, and say the first line with their face in mind. Once is enough to start.",
    source: "Karaniya Metta Sutta, Sutta Nipata 1.8 — Pali canon, public domain. Key lines.",
    excerpt: true,
  },
  {
    id: "three-refuges", tradition: "buddhist", kind: "chant",
    title: "The Three Refuges", native: "Tisaraṇa",
    occasion: "beginnings", lang: "pi", topic: "faith", theme: "gold",
    hook: "Three sentences that make someone a Buddhist.",
    intro: "This is the Tisarana, the Three Refuges — the oldest Buddhist chant, said at the start of practice and at every ceremony.",
    lines: [
      { o: "Buddhaṃ saraṇaṃ gacchāmi.", t: "Buddhaṃ saraṇaṃ gacchāmi.", m: "I go to the Buddha for refuge — to the one who woke up." },
      { o: "Dhammaṃ saraṇaṃ gacchāmi.", t: "Dhammaṃ saraṇaṃ gacchāmi.", m: "I go to the Dhamma for refuge — to the way things truly are." },
      { o: "Saṅghaṃ saraṇaṃ gacchāmi.", t: "Saṅghaṃ saraṇaṃ gacchāmi.", m: "I go to the Sangha for refuge — to the people walking this road with me." },
    ],
    reflection: "A refuge is where you go when the weather turns. The chant names three: an example that it can be done, a truth that does not shift, and company. Everyone has refuges — most of them are habits, screens, or people who cannot bear the weight. This is a deliberate choice of better ones. Say the three lines tonight, and be honest about which refuge you actually ran to today. Then choose again in the morning.",
    source: "Traditional Pali formula, Khuddakapatha 1 — Pali canon, public domain.",
  },
  {
    id: "heart-sutra-mantra", tradition: "buddhist", kind: "sutra",
    title: "The Heart Sutra — Gone Beyond", native: "般若心經",
    occasion: "anytime", lang: "sa", topic: "wisdom", theme: "night",
    hook: "The shortest sutra in Buddhism ends with a mantra almost no one translates. Here it is.",
    intro: "These are the closing lines of the Heart Sutra, the most chanted text in Mahayana Buddhism, in Chinese and Sanskrit.",
    lines: [
      { o: "色即是空，空即是色。", t: "Sè jí shì kōng, kōng jí shì sè.", m: "Form is emptiness; emptiness is form." },
      { o: "गते गते पारगते पारसंगते बोधि स्वाहा", t: "Gate gate pāragate pārasaṃgate bodhi svāhā.", m: "Gone, gone, gone across, gone fully across — awakening, so be it." },
    ],
    reflection: "Emptiness here does not mean nothing. It means nothing stands alone — everything is made of everything else, and so nothing has to be gripped. The mantra at the end is the sound of letting go: gone, gone, across. It is chanted, not argued, because the point is not to understand it but to loosen your hands. Say the mantra once with your hands open on your knees. Nothing to hold. That is the teaching in your palms.",
    source: "Prajnaparamita Hridaya (Heart Sutra), Xuanzang's Chinese text, 7th century — public domain. Closing lines.",
    excerpt: true,
  },
  {
    id: "om-mani-padme-hum", tradition: "buddhist", kind: "mantra",
    title: "Om Mani Padme Hum", native: "ༀ་མ་ཎི་པདྨེ་ཧཱུྃ།",
    occasion: "anytime", lang: "sa", topic: "love", theme: "royal",
    hook: "Six syllables carved into stones on every Himalayan path.",
    intro: "This is Om Mani Padme Hum, the mantra of Avalokiteshvara — the embodiment of compassion — said on prayer beads and prayer wheels across Tibet, Nepal and beyond.",
    lines: [
      { o: "ॐ मणि पद्मे हूँ", t: "Om maṇi padme hūṃ", m: "Om — the jewel in the lotus — hum." },
      { o: "ༀ་མ་ཎི་པདྨེ་ཧཱུྃ།", t: "Om mani padme hung", m: "May the jewel of compassion open in the lotus of the heart." },
    ],
    reflection: "The lotus grows out of mud and opens clean above the water. The jewel is compassion. Put together: what is most precious in you can grow from the messiest parts of your life — that is not a flaw in the design, it is the design. Say it while walking; that is how it has always been said.",
    source: "Traditional mantra, Karandavyuha Sutra — public domain.",
  },
  {
    id: "four-immeasurables", tradition: "buddhist", kind: "prayer",
    title: "The Four Immeasurables", native: "ཚད་མེད་བཞི།",
    occasion: "peace", lang: "en", topic: "love", theme: "calm",
    hook: "Four wishes — and the last one is for the person you'd rather leave out.",
    intro: "This is the prayer of the Four Immeasurables — kindness, compassion, joy and equanimity — said at the start of practice in the Tibetan tradition.",
    lines: [
      { o: "May all beings have happiness and the causes of happiness.", m: "Not only the good feeling, but whatever it takes to get there." },
      { o: "May all beings be free from suffering and the causes of suffering.", m: "Not only relief, but an end to what keeps causing the pain." },
      { o: "May all beings never be parted from the happiness that is free of suffering.", m: "A joy that does not depend on things going well." },
      { o: "May all beings rest in equanimity, free from attachment and aversion.", m: "A steadiness that neither clings nor pushes away — toward anyone." },
    ],
    reflection: "Each line has two halves: the thing wished for, and the cause of it. That is the practical part. It is easy to wish someone were happier; the prayer asks you to wish for whatever would actually make it so — including for people you find difficult. 'All beings' has no exceptions clause. Say it today for the one person you would rather leave out. That is exactly where it starts to work.",
    source: "Traditional Tibetan Buddhist liturgy — public domain. Rendered in plain English.",
  },
  {
    id: "dedication-of-merit", tradition: "buddhist", kind: "chant",
    title: "Dedication of Merit", native: "Puñña-anumodanā",
    occasion: "evening", lang: "pi", topic: "gratitude", theme: "forest",
    hook: "How Buddhists end a good deed: by giving it away.",
    intro: "This is a traditional Pali dedication, chanted at the close of practice — offering whatever good was done to everyone.",
    lines: [
      { o: "Sabbe sattā sadā hontu averā sukhajīvino.", t: "Sabbe sattā sadā hontu averā sukhajīvino.", m: "May all beings always live happily, free from hostility." },
      { o: "Kataṃ puñña-phalaṃ mayhaṃ sabbe bhāgī bhavantu te.", t: "Kataṃ puñña-phalaṃ mayhaṃ sabbe bhāgī bhavantu te.", m: "Whatever good has come from what I did — may all of them share in it." },
    ],
    reflection: "Merit is not hoarded in this tradition; it is passed on, like a candle lighting another. The chant makes sure you do not walk away from a good act feeling superior. You did something kind — now hand the credit to everyone, and go to sleep lighter.",
    source: "Traditional Theravada chant — public domain.",
  },

  /* ============================ TAOIST ============================ */
  {
    id: "tao-8-water", tradition: "taoist", kind: "teaching",
    title: "The Highest Good Is Like Water", native: "上善若水",
    occasion: "anytime", lang: "zh", topic: "wisdom", theme: "calm",
    hook: "Lao Tzu's picture of a good person is not a hero. It is water.",
    intro: "This is the opening of chapter eight of the Tao Te Ching, the Book of the Way, attributed to Lao Tzu.",
    lines: [
      { o: "上善若水。", t: "Shàng shàn ruò shuǐ.", m: "The highest good is like water." },
      { o: "水善利萬物而不爭，", t: "Shuǐ shàn lì wànwù ér bù zhēng,", m: "Water helps everything and competes with nothing," },
      { o: "處眾人之所惡，", t: "chǔ zhòngrén zhī suǒ wù,", m: "and settles in the low places people avoid." },
      { o: "故幾於道。", t: "gù jī yú dào.", m: "That is why it is so close to the Way." },
    ],
    reflection: "Water does not argue about which way is down. It does not need the high ground; it goes where it is needed and takes the shape of whatever holds it. Lao Tzu is describing a strength that looks like softness — and, over enough time, wears through stone. Once today, take the low place on purpose: let someone else be right, and watch what it costs you. Almost nothing.",
    source: "Tao Te Ching, chapter 8 — c. 4th century BCE, public domain. Rendered in plain English.",
  },
  {
    id: "tao-33-know-yourself", tradition: "taoist", kind: "teaching",
    title: "Knowing Others, Knowing Yourself", native: "知人者智",
    occasion: "anytime", lang: "zh", topic: "wisdom", theme: "gold",
    hook: "Lao Tzu ranked strength. Beating other people came second.",
    intro: "This is chapter thirty-three of the Tao Te Ching — Lao Tzu on the difference between power and strength.",
    lines: [
      { o: "知人者智，自知者明。", t: "Zhī rén zhě zhì, zì zhī zhě míng.", m: "To understand others is clever. To understand yourself is clear." },
      { o: "勝人者有力，自勝者強。", t: "Shèng rén zhě yǒu lì, zì shèng zhě qiáng.", m: "To overcome others takes force. To overcome yourself takes strength." },
      { o: "知足者富。", t: "Zhī zú zhě fù.", m: "To know you have enough is to be rich." },
      { o: "強行者有志。", t: "Qiáng xíng zhě yǒu zhì.", m: "To keep going is to have will." },
    ],
    reflection: "Every line has an outward version and an inward version, and the inward one is always ranked higher. It is a quiet argument against most of what we chase. The richest person in the room, by this measure, is the one who has stopped wanting more. Pick one line and do the inward half of it before dinner — understand yourself, overcome yourself, or decide you have enough.",
    source: "Tao Te Ching, chapter 33 — public domain. Rendered in plain English.",
  },
  {
    id: "tao-44-enough", tradition: "taoist", kind: "teaching",
    title: "Knowing When to Stop", native: "知足不辱",
    occasion: "peace", lang: "zh", topic: "peace", theme: "forest",
    hook: "Which do you love more — your name or your life? Lao Tzu asked first.",
    intro: "This is from chapter forty-four of the Tao Te Ching — on fame, wealth, and knowing when you have enough.",
    lines: [
      { o: "名與身孰親？身與貨孰多？", t: "Míng yǔ shēn shú qīn? Shēn yǔ huò shú duō?", m: "Your reputation or your self — which is closer to you? Your self or your possessions — which is worth more?" },
      { o: "甚愛必大費，多藏必厚亡。", t: "Shèn ài bì dà fèi, duō cáng bì hòu wáng.", m: "Love something too much and it costs you dearly; hoard too much and you lose heavily." },
      { o: "知足不辱，知止不殆，可以長久。", t: "Zhī zú bù rǔ, zhī zhǐ bù dài, kěyǐ chángjiǔ.", m: "Know you have enough and you will not be shamed. Know when to stop and you will not be harmed. Then you can last." },
    ],
    reflection: "It is a chapter of questions before it offers anything, because the questions do the work. Most exhaustion comes from not having answered them. Decide what enough looks like today — in money, in approval, in hours — and stop there. That is the whole instruction.",
    source: "Tao Te Ching, chapter 44 — public domain. Rendered in plain English.",
  },
  {
    id: "tao-76-soft-and-strong", tradition: "taoist", kind: "teaching",
    title: "The Soft Overcomes the Hard", native: "柔弱勝剛強",
    occasion: "anytime", lang: "zh", topic: "strength", theme: "night",
    hook: "The living are soft. The dead are stiff. Lao Tzu drew the conclusion.",
    intro: "This is chapter seventy-six of the Tao Te Ching — on why softness is a sign of life.",
    lines: [
      { o: "人之生也柔弱，其死也堅強。", t: "Rén zhī shēng yě róuruò, qí sǐ yě jiānqiáng.", m: "A person is soft and yielding when alive, hard and stiff when dead." },
      { o: "草木之生也柔脆，其死也枯槁。", t: "Cǎomù zhī shēng yě róucuì, qí sǐ yě kūgǎo.", m: "Plants are tender and green when alive, dry and brittle when dead." },
      { o: "故堅強者死之徒，柔弱者生之徒。", t: "Gù jiānqiáng zhě sǐ zhī tú, róuruò zhě shēng zhī tú.", m: "So the hard and rigid belong to death; the soft and yielding belong to life." },
    ],
    reflection: "We call stubbornness strength and flexibility weakness. Lao Tzu looks at a tree in a storm and says the opposite: the branch that bends is the one still there in the morning. Being able to change your mind is not a failure of character. It is a sign you are alive. Change your mind about one thing today, out loud, in front of someone. It is the most alive thing you will do all day.",
    source: "Tao Te Ching, chapter 76 — public domain. Rendered in plain English.",
  },
  {
    id: "tao-67-three-treasures", tradition: "taoist", kind: "teaching",
    title: "The Three Treasures", native: "三寶",
    occasion: "anytime", lang: "zh", topic: "love", theme: "warm",
    hook: "Lao Tzu said he owned three treasures. None of them can be bought.",
    intro: "This is from chapter sixty-seven of the Tao Te Ching — the three things Lao Tzu said he held onto.",
    lines: [
      { o: "我有三寶，持而保之。", t: "Wǒ yǒu sān bǎo, chí ér bǎo zhī.", m: "I have three treasures that I hold and keep safe." },
      { o: "一曰慈，二曰儉，三曰不敢為天下先。", t: "Yī yuē cí, èr yuē jiǎn, sān yuē bù gǎn wéi tiānxià xiān.", m: "The first is compassion. The second is simplicity. The third is not daring to put myself ahead of everyone." },
      { o: "慈故能勇。", t: "Cí gù néng yǒng.", m: "From compassion comes courage." },
    ],
    reflection: "The surprise is the last line. We think courage comes from confidence or anger. Lao Tzu says it comes from caring — a parent runs into the fire not because they are brave but because someone they love is inside. If you want to be braver, love something more.",
    source: "Tao Te Ching, chapter 67 — public domain. Rendered in plain English.",
  },

  /* =========================== UNIVERSAL =========================== */
  {
    id: "desiderata", tradition: "universal", kind: "poem",
    title: "Desiderata — Go Placidly",
    occasion: "anytime", lang: "en", topic: "peace", theme: "calm", excerpt: true,
    hook: "A poem so calm people assumed it was found in an old church. It was written in 1927.",
    intro: "These are lines from Desiderata, by Max Ehrmann — a prose poem about how to carry yourself through a noisy life.",
    lines: [
      { o: "Go placidly amid the noise and the haste, and remember what peace there may be in silence.", m: "Move gently through the rush, and keep a little quiet inside." },
      { o: "Beyond a wholesome discipline, be gentle with yourself.", m: "Hold yourself to standards — and then stop punishing yourself." },
      { o: "You are a child of the universe, no less than the trees and the stars; you have a right to be here.", m: "You belong. You did not have to earn a place in the world." },
      { o: "With all its sham, drudgery and broken dreams, it is still a beautiful world.", m: "Even counting everything that is wrong with it, the world is worth loving." },
    ],
    reflection: "It was written by a lawyer in Indiana who wanted, in his own words, to leave something 'in a style more of a spirit than a thing'. The advice is unglamorous — be gentle, be honest, do not compare — and it has outlasted almost everything else written that year. Read 'be gentle with yourself' as an instruction, not a sentiment, and skip one self-criticism today on purpose.",
    source: "Max Ehrmann, 1927 — public domain (US, published 1927). Excerpt.",
  },
  {
    id: "irish-blessing", tradition: "universal", kind: "blessing",
    title: "May the Road Rise to Meet You",
    occasion: "beginnings", lang: "en", topic: "hope", theme: "forest",
    hook: "The blessing said at Irish weddings, wakes and farewells — the same words for all three.",
    intro: "This is the traditional Irish blessing, said when someone is setting out.",
    lines: [
      { o: "May the road rise up to meet you.", m: "May the way ahead come easy." },
      { o: "May the wind be always at your back.", m: "May what pushes you, push you forward." },
      { o: "May the sun shine warm upon your face, and the rains fall soft upon your fields.", m: "May you have warmth, and may what is hard on you come gently." },
      { o: "And until we meet again, may God hold you in the palm of his hand.", m: "And while we are apart, may you be held." },
    ],
    reflection: "Nothing in it promises the road will be short or the weather good. It asks that the road rise — that it come toward you a little, so you do not have to do all the walking. That is what a blessing is: not a guarantee, but a wish that the world meets you halfway. Say it to someone leaving today — a child at the door, a friend at the car. Out loud. They will remember it longer than you think.",
    source: "Traditional Irish blessing — public domain.",
  },
  {
    id: "marcus-aurelius-morning", tradition: "universal", kind: "teaching",
    title: "Marcus Aurelius — At Dawn",
    occasion: "morning", lang: "en", topic: "purpose", theme: "gold",
    hook: "The most powerful man in the world wrote himself a note about not wanting to get out of bed.",
    intro: "This is from Book Five of the Meditations of Marcus Aurelius, the Roman emperor's private notebook — written to himself, never meant to be read.",
    lines: [
      { o: "In the morning, when you rise unwillingly, let this thought be present: I am rising to do the work of a human being.", m: "You are not getting up for the job. You are getting up because that is what a person does." },
      { o: "Why should I complain, if I am going to do the things for which I was brought into the world?", m: "If this is what you are for, then doing it is not a burden." },
      { o: "Or was I made to lie warm under the blankets?", m: "You were not made for comfort alone — and you know it." },
      { o: "Do you not see the plants, the birds, the ants, the spiders, the bees, each doing their own work, each putting the world in order? And you are unwilling to do the work of a human being?", m: "Everything alive is busy being what it is. Join in." },
    ],
    reflection: "He was emperor of Rome and still had to talk himself out of bed. That is the comfort. The argument he uses is not 'you have duties' but 'you have a nature' — and a nature wants to be used. Tired is normal. Get up anyway, gently, because it is what you are for.",
    source: "Marcus Aurelius, Meditations 5.1 — c. 170 CE; rendered in plain English after George Long's 1862 translation, public domain.",
  },
  {
    id: "gibran-on-children", tradition: "universal", kind: "poem",
    title: "Kahlil Gibran — On Children",
    occasion: "anytime", lang: "en", topic: "love", theme: "warm", excerpt: true,
    hook: "The lines parents read at graduations, then quietly at night.",
    intro: "These are lines from 'On Children', in The Prophet by Kahlil Gibran, published in 1923.",
    lines: [
      { o: "Your children are not your children. They are the sons and daughters of Life's longing for itself.", m: "They came through you — but they belong to life, not to you." },
      { o: "You may give them your love but not your thoughts, for they have their own thoughts.", m: "Love them all you like. Do not expect them to think like you." },
      { o: "You may strive to be like them, but seek not to make them like you. For life goes not backward nor tarries with yesterday.", m: "Learn from them. Do not shape them into a copy of yourself. Time only moves one way." },
      { o: "You are the bows from which your children as living arrows are sent forth.", m: "Your job is to give them strength and direction — and then let go." },
    ],
    reflection: "It is the hardest thing in the book, because it is true and no parent wants it to be. The bow does not follow the arrow. But the poem is kind about it too: the archer loves the bow that is steady. Being the steady thing they leave from is not a small role. It is the whole role. Today, ask your child one real question and do not correct the answer. That is the bow, staying steady.",
    source: "Kahlil Gibran, The Prophet, 1923 — public domain. Excerpt.",
  },
  {
    id: "teresa-bookmark", tradition: "universal", kind: "prayer",
    title: "Let Nothing Disturb You",
    occasion: "peace", lang: "en", topic: "peace", theme: "royal",
    hook: "Found written on a bookmark in a nun's prayer book in 1582. Still the best advice for a bad day.",
    intro: "These are the lines known as Saint Teresa's bookmark — found in her breviary after her death in 1582, and loved far beyond her own tradition.",
    lines: [
      { o: "Let nothing disturb you. Let nothing frighten you.", m: "Whatever is happening, it does not get to shake you." },
      { o: "All things pass. God does not change.", m: "This will end. What holds you will not." },
      { o: "Patience obtains everything.", m: "Wait it out. Waiting wins more than you think." },
      { o: "Whoever has God lacks nothing. God alone is enough.", m: "If you have the one thing, you have what you need." },
    ],
    reflection: "It was not written to be published — it was a private note she carried around, probably read hundreds of times. That is the right way to use it. Not once, as a beautiful thought, but on repeat, on the days the first line feels impossible. All things pass. Read it again tomorrow.",
    source: "Teresa of Ávila, 1582; English after Henry Wadsworth Longfellow, 1879 — public domain. Rendered in plain English.",
  },
];

/* ---------------------------------------------------------------- */
/*  Lookups                                                          */
/* ---------------------------------------------------------------- */
function prayerById(id) { return PRAYER_DB.find((p) => p.id === id) || null; }
function prayersFor(tradition) { return PRAYER_DB.filter((p) => p.tradition === tradition); }
function prayerTraditionKeys() { return Object.keys(PRAYER_TRADITIONS).filter((k) => prayersFor(k).length); }

// Daily rotation: traditions take turns (Hindu, Christian, Jewish, …) rather
// than running the library in file order, so a week on the channel is never
// five Taoist days in a row. Smaller groups simply come round again sooner.
const PRAYER_ROTATION = (() => {
  const keys = Object.keys(PRAYER_TRADITIONS).filter((k) => PRAYER_DB.some((p) => p.tradition === k));
  const groups = keys.map((k) => PRAYER_DB.filter((p) => p.tradition === k));
  const out = [];
  const longest = Math.max(...groups.map((g) => g.length));
  for (let round = 0; round < longest; round++) groups.forEach((g) => out.push(g[round % g.length]));
  return out;
})();

// The devotion for a given day. Order is fixed, so the same date always gives
// the same devotion — the studio and the batch agree.
function prayerForDay(date) {
  const d = date || new Date();
  const start = Date.UTC(d.getFullYear(), 0, 0);
  const doy = Math.floor((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - start) / 86400000);
  return PRAYER_ROTATION[doy % PRAYER_ROTATION.length];
}

// Human label for a `kind`, singular, capitalised — "Aarti", "Dua", "Psalm".
const PRAYER_KIND_LABELS = {
  aarti: "Aarti", chalisa: "Chalisa", mantra: "Mantra", prayer: "Prayer", psalm: "Psalm",
  hymn: "Hymn", dua: "Dua", chant: "Chant", blessing: "Blessing", sutra: "Sutra", poem: "Poem", teaching: "Teaching",
};
function prayerKindLabel(p) { return PRAYER_KIND_LABELS[p.kind] || "Prayer"; }
