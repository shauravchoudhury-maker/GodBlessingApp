// tts-proxy-worker.js — Cloudflare Worker that safely proxies ElevenLabs
// text-to-speech. Your ElevenLabs API key lives here as a SECRET env var, never
// in the website. Deploy this to Cloudflare Workers (free) — see TTS_SETUP.md.
//
// Required Worker environment variables (set in the Cloudflare dashboard):
//   ELEVENLABS_API_KEY  — your ElevenLabs API key (secret)
//   PROXY_SECRET        — any random string; the Studio sends it as x-ev-token
//   ALLOW_ORIGIN        — https://eververse.org  (restricts browser callers)

export default {
  async fetch(request, env) {
    const origin = env.ALLOW_ORIGIN || "https://eververse.org";
    const cors = {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, x-ev-token",
      "Vary": "Origin",
    };
    if (request.method === "OPTIONS") return new Response(null, { headers: cors });
    if (request.method !== "POST") return new Response("POST only", { status: 405, headers: cors });

    // Shared-secret gate (keeps random visitors from spending your credits).
    if (env.PROXY_SECRET && request.headers.get("x-ev-token") !== env.PROXY_SECRET) {
      return new Response("unauthorized", { status: 401, headers: cors });
    }

    let body;
    try { body = await request.json(); } catch (e) { return new Response("bad json", { status: 400, headers: cors }); }
    const text = (body.text || "").toString().slice(0, 5000);
    const voiceId = (body.voiceId || "JBFqnCBsd6RMkjVDRZzb").toString();
    const modelId = (body.modelId || "eleven_multilingual_v2").toString();
    if (!text.trim()) return new Response("no text", { status: 400, headers: cors });

    const r = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: { "xi-api-key": env.ELEVENLABS_API_KEY, "Content-Type": "application/json", "Accept": "audio/mpeg" },
        body: JSON.stringify({ text, model_id: modelId }),
      }
    );
    if (!r.ok) {
      const err = await r.text();
      return new Response("TTS error: " + err, { status: 502, headers: cors });
    }
    const audio = await r.arrayBuffer();
    return new Response(audio, { headers: { ...cors, "Content-Type": "audio/mpeg", "Cache-Control": "public, max-age=86400" } });
  },
};
