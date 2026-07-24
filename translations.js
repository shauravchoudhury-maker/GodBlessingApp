// translations.js
// Curated, human-written translations that OVERRIDE machine translation.
//
// Why this exists: everything else routes through MyMemory (free MT), English →
// target. For scripture that is risky — Gita and Guru Granth Sahib would be
// translated TWICE (Sanskrit/Gurmukhi → English → Hindi), losing the register a
// Hindi reader expects; and Spanish scripture loses the Reina-Valera wording
// Spanish readers know. Anything listed here is used verbatim instead of MT;
// anything not listed still falls back to MT.
//
// Keyed by VERSE_DB ref. `conf: "review"` = please have a native speaker /
// someone from the tradition confirm before publishing at scale.
// Spanish scripture follows Reina-Valera (1909, public domain) phrasing.

const TRANSLATIONS = {
  /* ---------------- Bible ---------------- */
  "Joshua 1:9": {
    es: { text: "Esfuérzate y sé valiente; no temas ni desmayes, porque Jehová tu Dios estará contigo dondequiera que vayas." },
    hi: { text: "हियाव बाँध और दृढ़ हो जा; मत डर और तेरा मन कच्चा न हो, क्योंकि जहाँ कहीं तू जाए वहाँ तेरा परमेश्वर यहोवा तेरे संग रहेगा।" },
  },
  "Jeremiah 29:11": {
    es: { text: "Porque yo sé los planes que tengo para vosotros, dice Jehová: planes de bienestar y no de mal, para daros un futuro y una esperanza." },
    hi: { text: "क्योंकि जो योजनाएँ मैं तुम्हारे लिये बना रहा हूँ उन्हें मैं जानता हूँ, यहोवा की यह वाणी है; वे कुशल की योजनाएँ हैं, हानि की नहीं, कि मैं तुम्हें आशा भरा भविष्य दूँ।" },
  },
  "Philippians 4:13": {
    es: { text: "Todo lo puedo en Cristo que me fortalece." },
    hi: { text: "जो मुझे सामर्थ्य देता है उस मसीह में मैं सब कुछ कर सकता हूँ।" },
  },
  "Psalm 46:10": {
    es: { text: "Estad quietos, y conoced que yo soy Dios." },
    hi: { text: "स्थिर हो जाओ, और जान लो कि मैं ही परमेश्वर हूँ।" },
  },
  "Proverbs 3:5-6": {
    es: { text: "Fíate de Jehová de todo tu corazón, y no te apoyes en tu propia prudencia. Reconócelo en todos tus caminos, y él enderezará tus veredas." },
    hi: { text: "अपनी समझ का सहारा न लेना, वरन सम्पूर्ण मन से यहोवा पर भरोसा रखना। अपनी सारी चाल में उसी को स्मरण रखना, और वह तेरे मार्गों को सीधा करेगा।" },
  },
  "Isaiah 40:31": {
    es: { text: "Pero los que esperan en Jehová tendrán nuevas fuerzas; levantarán alas como las águilas; correrán y no se cansarán." },
    hi: { text: "परन्तु जो यहोवा की बाट जोहते हैं, वे नया बल प्राप्त करते जाएँगे; वे उकाबों की नाईं पंख लगाकर ऊपर चढ़ेंगे; वे दौड़ेंगे और श्रमित न होंगे।" },
  },
  "Psalm 23:1": {
    es: { text: "Jehová es mi pastor; nada me faltará." },
    hi: { text: "यहोवा मेरा चरवाहा है, मुझे कुछ घटी न होगी।" },
  },
  "Zephaniah 3:17": {
    es: { text: "Jehová está en medio de ti, poderoso, él salvará; se gozará sobre ti con alegría, callará de amor, se regocijará sobre ti con cánticos." },
    hi: { text: "तेरा परमेश्वर यहोवा तेरे बीच में है, वह उद्धार करने वाला वीर है; वह तेरे कारण आनन्द से मगन होगा, वह अपने प्रेम में शान्त रहेगा, वह ऊँचे स्वर से गाता हुआ तेरे कारण मगन होगा।" },
  },
  "Philippians 4:6": {
    es: { text: "Por nada estéis afanosos, sino sean conocidas vuestras peticiones delante de Dios en toda oración y ruego, con acción de gracias." },
    hi: { text: "किसी भी बात की चिन्ता मत करो, परन्तु हर एक बात में प्रार्थना और विनती के द्वारा धन्यवाद के साथ अपने निवेदन परमेश्वर के सामने उपस्थित करो।" },
  },
  "Matthew 11:28": {
    es: { text: "Venid a mí todos los que estáis trabajados y cargados, y yo os haré descansar." },
    hi: { text: "हे सब थके-माँदे और बोझ से दबे हुए लोगो, मेरे पास आओ; मैं तुम्हें विश्राम दूँगा।" },
  },
  "Romans 8:28": {
    es: { text: "Y sabemos que a los que aman a Dios, todas las cosas les ayudan a bien." },
    hi: { text: "और हम जानते हैं कि जो लोग परमेश्वर से प्रेम रखते हैं, उनके लिये सब बातें मिलकर भलाई ही को उत्पन्न करती हैं।" },
  },
  "Psalm 121:1-2": {
    es: { text: "Alzaré mis ojos a los montes; ¿de dónde vendrá mi socorro? Mi socorro viene de Jehová, que hizo los cielos y la tierra." },
    hi: { text: "मैं अपनी आँखें पर्वतों की ओर लगाऊँगा। मेरी सहायता कहाँ से आएगी? मेरी सहायता यहोवा की ओर से आती है, जो आकाश और पृथ्वी का कर्ता है।" },
  },
  "1 Corinthians 13:4": {
    es: { text: "El amor es sufrido, es benigno; el amor no tiene envidia, no es jactancioso, no se envanece." },
    hi: { text: "प्रेम धीरजवन्त है, और कृपालु है; प्रेम डाह नहीं करता, प्रेम अपनी बड़ाई नहीं करता, और फूलता नहीं।" },
  },
  "Isaiah 41:10": {
    es: { text: "No temas, porque yo estoy contigo; no desmayes, porque yo soy tu Dios que te esfuerzo; siempre te ayudaré." },
    hi: { text: "मत डर, क्योंकि मैं तेरे संग हूँ; इधर-उधर मत ताक, क्योंकि मैं तेरा परमेश्वर हूँ; मैं तुझे दृढ़ करूँगा और तेरी सहायता भी करूँगा।" },
  },
  "Psalm 27:1": {
    es: { text: "Jehová es mi luz y mi salvación; ¿de quién temeré?" },
    hi: { text: "यहोवा मेरी ज्योति और मेरा उद्धार है, मैं किस से डरूँ?" },
  },
  "Lamentations 3:22-23": {
    es: { text: "Por la misericordia de Jehová no hemos sido consumidos, porque nunca decayeron sus misericordias. Nuevas son cada mañana; grande es tu fidelidad." },
    hi: { text: "यह यहोवा की करुणा ही है कि हम नष्ट नहीं हुए, क्योंकि उसकी दया अनन्त है। वह प्रति भोर नई होती है; तेरी सच्चाई महान है।" },
  },
  "Psalm 139:14": {
    es: { text: "Te alabaré, porque formidables y maravillosas son tus obras; asombrosamente he sido formado." },
    hi: { text: "मैं तेरा धन्यवाद करूँगा, क्योंकि मैं भयानक और अद्भुत रीति से रचा गया हूँ; तेरे काम अद्भुत हैं।" },
  },
  "John 14:27": {
    es: { text: "La paz os dejo, mi paz os doy; no se turbe vuestro corazón, ni tenga miedo." },
    hi: { text: "मैं तुम्हें शान्ति दिए जाता हूँ, अपनी शान्ति तुम्हें देता हूँ; तुम्हारा मन न घबराए और न डरे।" },
  },

  /* ---------------- Bhagavad Gita ----------------
     Rendered from the Sanskrit sense rather than round-tripped through the
     English, so the Hindi reads the way a Gita reader expects.            */
  "Bhagavad Gita 2:47": {
    es: { text: "Tu derecho es solo a la acción, jamás a sus frutos. Que el fruto no sea tu motivo." },
    hi: { text: "तेरा अधिकार केवल कर्म करने में है, उसके फलों में कभी नहीं। इसलिये तू कर्मफल का हेतु मत बन।" },
  },
  "Bhagavad Gita 6:5": {
    es: { text: "Elévate a ti mismo por ti mismo; no te degrades. Pues uno mismo es su propio amigo, y también su propio enemigo." },
    hi: { text: "अपने द्वारा अपना उद्धार कर, अपने को गिरने मत दे; क्योंकि मनुष्य आप ही अपना मित्र है और आप ही अपना शत्रु।" },
  },
  "Bhagavad Gita 6:19": {
    es: { text: "Como una lámpara en un lugar sin viento no vacila, así es la mente disciplinada del que se absorbe en el Ser." },
    hi: { text: "जैसे वायुरहित स्थान में रखा दीपक नहीं काँपता, वैसी ही आत्मा में लगे योगी के चित्त की स्थिति होती है।" },
  },
  "Bhagavad Gita 2:14": {
    es: { text: "El contacto con los sentidos trae frío y calor, placer y dolor. Van y vienen, son impermanentes; sopórtalos con valor." },
    hi: { text: "हे कुन्तीपुत्र! इन्द्रियों के विषयों का स्पर्श सर्दी-गर्मी और सुख-दुःख देने वाला है। वे आते-जाते रहते हैं, अनित्य हैं; इसलिये उन्हें धैर्य से सह।" },
  },

  /* ---------------- Guru Granth Sahib ----------------
     Most sensitive set: the original is Gurbani, so these are respectful
     renderings, NOT a substitute for the Gurmukhi. Flagged for review.   */
  "Mool Mantar": {
    es: { text: "Hay un solo Creador, cuyo Nombre es Verdad: sin miedo, sin odio, más allá del tiempo y sin forma, no nacido, conocido por la gracia del Gurú.", conf: "review" },
    hi: { text: "एक ही सृष्टिकर्ता है, जिसका नाम सत्य है — निर्भय, निर्वैर, कालरहित और निराकार, जन्म-मरण से परे, जो गुरु की कृपा से जाना जाता है।", conf: "review" },
  },
  "Japji Sahib": {
    es: { text: "Que el contento sean tus pendientes, la humildad tu cuenco de mendigo, y la meditación las cenizas sobre tu cuerpo.", conf: "review" },
    hi: { text: "संतोष को अपने कुंडल बनाओ, विनम्रता को अपना भिक्षा-पात्र, और सिमरन को अपने शरीर की विभूति।", conf: "review" },
  },
  "Guru Granth Sahib, Ang 62": {
    es: { text: "La verdad está por encima de todo; pero más alto aún está el vivir con verdad.", conf: "review" },
    hi: { text: "सत्य सबसे ऊँचा है, परन्तु उससे भी ऊँचा है सत्य का आचरण।", conf: "review" },
  },
  "Guru Granth Sahib, Ang 1245": {
    es: { text: "Quien gana con su trabajo lo que come y comparte algo de lo que tiene: oh Nanak, esa persona conoce el camino verdadero.", conf: "review" },
    hi: { text: "जो अपनी कमाई से खाता है और अपने पास से कुछ बाँटता भी है — हे नानक, वही सच्चा मार्ग पहचानता है।", conf: "review" },
  },
  "Guru Granth Sahib (Guru Nanak)": {
    es: { text: "Ni los reyes ni los emperadores con montañas de riqueza se comparan con una hormiga llena del amor de Dios.", conf: "review" },
    hi: { text: "धन के पर्वतों वाले राजा-महाराजा भी उस चींटी की समानता नहीं कर सकते जो प्रभु के प्रेम से भरी हो।", conf: "review" },
  },
  "Guru Granth Sahib, Ang 1349": {
    es: { text: "Primero Dios creó la Luz; de esa única Luz surgió toda la creación. Entonces, ¿quién es bueno y quién es malo?", conf: "review" },
    hi: { text: "पहले प्रभु ने ज्योति रची; उसी एक ज्योति से सारी सृष्टि उत्पन्न हुई। फिर कौन भला है और कौन बुरा?", conf: "review" },
  },
  "Guru Granth Sahib (Guru Tegh Bahadur)": {
    es: { text: "Como la fragancia habita en la flor y el reflejo en el espejo, así Dios habita en ti: búscalo en tu propio corazón.", conf: "review" },
    hi: { text: "जैसे फूल में सुगंध बसती है और दर्पण में प्रतिबिम्ब, वैसे ही प्रभु तेरे भीतर बसता है — उसे अपने ही हृदय में खोज।", conf: "review" },
  },
  "Guru Granth Sahib (Sukhmani Sahib)": {
    es: { text: "En el recuerdo de Dios la mente halla paz, y toda pena y todo temor se alejan.", conf: "review" },
    hi: { text: "प्रभु के सिमरन से मन को शान्ति मिलती है, और हर दुःख और भय दूर हो जाता है।", conf: "review" },
  },
  "Japji Sahib (Pauri 25)": {
    es: { text: "Por Su gracia recibimos todo don; cuanto más damos gracias, más queda por dar.", conf: "review" },
    hi: { text: "उसी की कृपा से हमें हर दान मिलता है; जितना हम धन्यवाद करते हैं, उतना ही देने को शेष रहता है।", conf: "review" },
  },
  "Guru Granth Sahib, Ang 1427": {
    es: { text: "Quien a nadie atemoriza y de nadie tiene miedo: reconoce a esa persona como verdaderamente sabia.", conf: "review" },
    hi: { text: "जो किसी को डराता नहीं और किसी से डरता नहीं — उसी को सच्चा ज्ञानी जान।", conf: "review" },
  },

  /* ---------------- Timeless Wisdom ---------------- */
  "On being enough": {
    es: { text: "Ya eres suficiente. Lo eras mucho antes de lograr una sola cosa." },
    hi: { text: "तुम पहले से ही पर्याप्त हो। कुछ भी पाने से बहुत पहले भी तुम पर्याप्त थे।" },
  },
  "Marcus Aurelius": {
    es: { text: "Tienes poder sobre tu mente, no sobre los acontecimientos externos. Comprende esto y hallarás fuerza." },
    hi: { text: "तुम्हारा वश अपने मन पर है, बाहरी घटनाओं पर नहीं। यह जान लो, और तुम्हें बल मिलेगा।" },
  },
  "Lao Tzu": {
    es: { text: "Un viaje de mil millas comienza con un solo paso." },
    hi: { text: "हज़ार मील की यात्रा एक ही कदम से आरम्भ होती है।" },
  },
  "On rest": {
    es: { text: "Que hoy sea un día amable. No tienes que ganarte el descanso." },
    hi: { text: "आज का दिन कोमल रहे। विश्राम पाने के लिये तुम्हें उसे कमाना नहीं पड़ता।" },
  },
  "On hope": {
    es: { text: "La luz que buscas también te está buscando a ti." },
    hi: { text: "जिस प्रकाश को तुम खोज रहे हो, वह भी तुम्हें खोज रहा है।" },
  },
  "Mark Twain": {
    es: { text: "Las arrugas solo deberían señalar dónde estuvieron las sonrisas." },
    hi: { text: "झुर्रियाँ तो बस इतना बताएँ कि मुस्कानें कहाँ-कहाँ रही हैं।" },
  },
  "Japanese proverb": {
    es: { text: "Cae siete veces, levántate ocho." },
    hi: { text: "सात बार गिरो, आठवीं बार उठो।" },
  },
  "Irish blessing": {
    es: { text: "Que el camino se alce a tu encuentro y el viento sople siempre a tu espalda." },
    hi: { text: "मार्ग तुम्हारा स्वागत करने को उठे, और हवा सदा तुम्हारी पीठ पीछे बहे।" },
  },
};

// ── Lookup ───────────────────────────────────────────────────────────
// Indexed by the English source text so every existing translateText()
// call site benefits with no changes.
let _TR_INDEX = null;
function _trNorm(s) { return (s || "").replace(/\s+/g, " ").trim().toLowerCase(); }
function buildTranslationIndex() {
  const idx = {};
  if (typeof VERSE_DB === "undefined") return idx;
  for (const ref in TRANSLATIONS) {
    const v = VERSE_DB.find((x) => x.ref === ref);
    if (v) idx[_trNorm(v.text)] = TRANSLATIONS[ref];
  }
  return idx;
}
// Returns { text, conf? } when a curated translation exists, else null.
function curatedTranslation(text, lang) {
  if (!_TR_INDEX) _TR_INDEX = buildTranslationIndex();
  const e = _TR_INDEX[_trNorm(text)];
  if (!e) return null;
  const t = e[lang];
  return (t && t.text) ? t : null;
}
// Is this verse curated in this language? (drives the "verified" badge)
function isCuratedVerse(ref, lang) {
  const e = TRANSLATIONS[ref];
  return !!(e && e[lang] && e[lang].text);
}
function curatedLanguages(ref) {
  const e = TRANSLATIONS[ref];
  return e ? Object.keys(e) : [];
}
