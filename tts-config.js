// tts-config.js — paste the URL of your deployed Cloudflare Worker (from
// TTS_SETUP.md). A URL is not secret, so it is fine to commit. The API key and
// PROXY_SECRET stay inside the Worker; the access token is entered once in the
// Studio (stored on your device), never committed.

const TTS_PROXY_URL = "https://eververse-tts.shauravchoudhury.workers.dev";

// ElevenLabs voice IDs — change to any voice from your ElevenLabs library.
const TTS_VOICES = {
  female: "EXAVITQu4vr4xnSDxMaL", // "Sarah" — warm female (example)
  male:   "JBFqnCBsd6RMkjVDRZzb", // "George" — warm male (example)
};

const TTS_READY = typeof TTS_PROXY_URL === "string" && TTS_PROXY_URL.indexOf("PASTE") === -1;
