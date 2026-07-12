// voice.js — shared, softer voice-over engine (Web Speech API).
// Picks the most natural voice the device offers (Natural / Google / neural),
// supports a Female/Male preference, and uses a warmer, slower delivery.
// Used by the public site (site.js) and the studio (app.js, hub.js).

const EVVoice = (function () {
  let voices = [];
  function load() { try { voices = window.speechSynthesis ? speechSynthesis.getVoices() : []; } catch (e) { voices = []; } }
  if (window.speechSynthesis) { load(); try { speechSynthesis.onvoiceschanged = load; } catch (e) {} }

  const FEMALE = /(female|zira|aria|jenny|samantha|serena|ava|allison|susan|hazel|heera|catherine|natasha|clara|sonia|libby|michelle|amber|ana|joanna|salli|kendra|kimberly|nicole|emma|amy|olivia|neerja|swara|isha|kavya|luciana|francisca|ines|camila)/i;
  const MALE = /(\bmale\b|david|mark|guy|ryan|george|james|william|daniel|thomas|richard|eric|brandon|christopher|matthew|justin|joey|brian|arthur|liam|prabhat|hemant|madhur|rishi|antonio|enrique|miguel|pablo|diego|fabio)/i;
  function genderOf(v) { const n = (v.name || "").toLowerCase(); if (FEMALE.test(n)) return "female"; if (MALE.test(n)) return "male"; return "any"; }

  // Higher score = more natural / human-sounding.
  function score(v) {
    const n = ((v.name || "") + " " + (v.voiceURI || "")).toLowerCase();
    let s = 0;
    if (/natural|neural/.test(n)) s += 130;
    if (/google/.test(n)) s += 95;
    if (/online/.test(n)) s += 70;
    if (/siri|samantha|aria|jenny|ava|allison|serena|joanna|emma|amy|olivia|guy|ryan/.test(n)) s += 55;
    if (v.localService === false) s += 25;      // remote voices are usually neural
    if (/microsoft/.test(n) && !/natural|online/.test(n)) s -= 15; // classic MS = robotic
    if (/espeak|festival|pico|compact/.test(n)) s -= 60;
    return s;
  }

  function pref() { try { return localStorage.getItem("ev_voice_gender") || "female"; } catch (e) { return "female"; } }
  function setPref(g) { try { localStorage.setItem("ev_voice_gender", g); } catch (e) {} }

  // Full locale hint so the engine can choose a language-appropriate voice
  // even when no exact voice object is installed for that language.
  const LANG_BCP = { en:"en-US", es:"es-ES", pt:"pt-BR", hi:"hi-IN", fr:"fr-FR",
    de:"de-DE", it:"it-IT", ar:"ar-SA", zh:"zh-CN", ja:"ja-JP", ko:"ko-KR",
    ru:"ru-RU", nl:"nl-NL", tr:"tr-TR", pl:"pl-PL", uk:"uk-UA", id:"id-ID",
    vi:"vi-VN", th:"th-TH", he:"he-IL", fa:"fa-IR", ta:"ta-IN", te:"te-IN", bn:"bn-IN" };

  // Strict language match (no English fallback) so foreign text isn't read by an English voice.
  function pickForLang(l, gender) {
    if (!voices.length) load();
    const cands = voices.filter((v) => v.lang && v.lang.toLowerCase().startsWith(l));
    if (!cands.length) return null;
    const byGender = cands.filter((v) => genderOf(v) === gender);
    const pool = byGender.length ? byGender : cands;
    pool.sort((a, b) => score(b) - score(a));
    return pool[0];
  }
  function pick(lang, gender) { // English-tolerant, kept for callers that want a voice
    const l = (lang || "en").slice(0, 2).toLowerCase();
    return pickForLang(l, gender || pref()) || pickForLang("en", gender || pref());
  }

  // Does the device actually have a voice for this language?
  function hasVoiceFor(lang) {
    if (!voices.length) load();
    const l = (lang || "en").slice(0, 2).toLowerCase();
    return voices.some((v) => v.lang && v.lang.toLowerCase().startsWith(l));
  }

  function speak(text, opts) {
    opts = opts || {};
    if (!window.speechSynthesis) { if (opts.onerror) opts.onerror(); return; }
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = opts.rate || 0.88;   // a touch slower = calmer, softer
    u.pitch = opts.pitch || 1.0;
    u.volume = 1;
    const l = (opts.lang || "en").slice(0, 2).toLowerCase();
    const v = pickForLang(l, opts.gender || pref());
    if (v) { u.voice = v; u.lang = v.lang; }
    else { u.lang = LANG_BCP[l] || l; } // let the engine choose a lang-appropriate voice
    if (opts.onend) u.onend = opts.onend;
    if (opts.onerror) u.onerror = opts.onerror;
    // Chrome sometimes drops a speak() issued immediately after cancel().
    setTimeout(() => { try { speechSynthesis.speak(u); } catch (e) { if (opts.onerror) opts.onerror(); } }, 40);
  }
  function stop() { try { if (window.speechSynthesis) speechSynthesis.cancel(); } catch (e) {} }

  return { speak, stop, pick, pref, setPref, genderOf, hasVoiceFor, reload: load };
})();

// Build a small Female/Male voice <select>, wired to the shared preference.
function buildVoiceSelect(id, cls) {
  const sel = document.createElement("select");
  sel.id = id; if (cls) sel.className = cls;
  sel.add(new Option("Female voice", "female"));
  sel.add(new Option("Male voice", "male"));
  sel.value = EVVoice.pref();
  sel.onchange = () => EVVoice.setPref(sel.value);
  return sel;
}
