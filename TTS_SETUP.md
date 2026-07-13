# EverVerse — connect ElevenLabs voice-over (safe, key never exposed)

The website is public, so the ElevenLabs API key can't live in the app. We put it
inside a tiny free **Cloudflare Worker** (a serverless proxy). The Studio calls the
Worker; the Worker calls ElevenLabs. ~10 minutes, one-time.

## 1. Get your ElevenLabs API key
- Sign in at **elevenlabs.io** → Profile → **API Keys** → copy your key.
- (Optional) Set a **usage limit** on your ElevenLabs account so costs stay capped.

## 2. Deploy the Worker (Cloudflare — free)
1. Create a free account at **dash.cloudflare.com**.
2. Left menu → **Workers & Pages** → **Create** → **Create Worker** → name it
   e.g. `eververse-tts` → **Deploy**.
3. Click **Edit code**, delete the sample, and paste the contents of
   **`tts-proxy-worker.js`** (in this repo) → **Deploy**.
4. Go to the Worker's **Settings → Variables and Secrets** and add:
   - `ELEVENLABS_API_KEY` = your ElevenLabs key  → mark as **Secret** (Encrypt).
   - `PROXY_SECRET` = any random phrase you invent (e.g. `bless-2026-xyz`).
   - `ALLOW_ORIGIN` = `https://eververse.org`
   → **Deploy** again.
5. Copy the Worker URL (looks like `https://eververse-tts.<you>.workers.dev`).

## 3. Connect it to EverVerse
- Open **`tts-config.js`** and set:
  `const TTS_PROXY_URL = "https://eververse-tts.<you>.workers.dev";`
  Commit & push (a URL is not secret). *(Or send me the URL and I'll paste + deploy.)*
- In the **Studio → 🎙 Voice-over video** panel, type your `PROXY_SECRET` into the
  **Voice-over access token** field (stored only on your device).

## 4. Use it
Studio → Daily → **Voice-over video**: pick a verse or sermon, a **male/female** voice,
a **language**, then **Generate**. It produces a video with **real spoken narration +
synced captions**, ready to upload.

## Notes
- Pick any voice from your ElevenLabs library by editing the IDs in `tts-config.js`
  (`TTS_VOICES`). `eleven_multilingual_v2` speaks whichever language the text is in,
  so translated text is narrated in that language.
- The token + origin restriction stop casual abuse of your credits. For stronger
  protection later, add Cloudflare Turnstile — ask and I'll wire it.
- Output is `.webm`; most platforms accept it (for strict mp4-only tools, run it
  through any free converter).
