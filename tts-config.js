// tts-config.js — paste the URL of your deployed Cloudflare Worker (from
// TTS_SETUP.md). A URL is not secret, so it is fine to commit. The API key and
// PROXY_SECRET stay inside the Worker; the access token is entered once in the
// Studio (stored on your device), never committed.

const TTS_PROXY_URL = "https://eververse-tts.shauravchoudhury.workers.dev";

// ElevenLabs voice IDs — change to any voice from your ElevenLabs library.
const TTS_VOICES = {
  female: "uIZsnBL0YK1S5j69bAih", // EverVerse female narration voice
  male:   "PGoKnSD4gKn2aS99wOR2", // EverVerse male / pastor narration voice
  // Language-specific voices override the defaults where set (key: `${lang}_${gender}`).
  hi_female: "kZKm3BYbXfahOLAxYZG0", // Hindi female narration voice
  hi_male:   "m6ofebWe5rKGL9fZXmGE", // Hindi male narration voice
};

// Pick the best voice for a language + gender: a language-specific voice if
// one exists (e.g. hi_female), otherwise the default for that gender.
function ttsVoiceFor(lang, gender) {
  if (typeof TTS_VOICES === "undefined") return undefined;
  gender = (gender === "male") ? "male" : "female";
  return TTS_VOICES[`${lang}_${gender}`] || TTS_VOICES[gender];
}

const TTS_READY = typeof TTS_PROXY_URL === "string" && TTS_PROXY_URL.indexOf("PASTE") === -1;
