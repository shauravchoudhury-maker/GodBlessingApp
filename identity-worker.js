// identity-worker.js
// Cloudflare Worker: Stripe Identity for guide verification.
//
// Deploy separately from the site (wrangler), the same way tts-proxy-worker.js
// already is. It exists because the browser cannot be trusted to report that
// it passed its own identity check — that claim has to arrive from Stripe,
// signed, on a channel the guide does not control.
//
// WHAT IT IS ALLOWED TO DO, AND NOTHING MORE.
//
// On a verified identity it does ONE of two things. If the guide document
// already exists, it writes idVerifiedAt and idVerificationId and nothing
// else. If it does not — the person applied and then verified — it creates
// the guide document from their application, with probation: true. That is
// the whole of interview-free approval: they can now answer celebrations,
// and nothing harder, until a person has read their first replies.
//
// It never writes vouchCount, never grants supervisor, never clears
// probation. Standing still needs stewards to vouch; probation still needs
// a human to have read the work.
//
// IT NEVER SEES OR STORES A DOCUMENT. Stripe holds the passport image and the
// selfie; we keep a session id and a date. If EverVerse is ever breached
// there is no identity document in it to lose. That is the whole reason to
// use a vendor rather than a form.
//
// SECRETS (wrangler secret put ...):
//   STRIPE_SECRET_KEY        sk_live_...
//   STRIPE_WEBHOOK_SECRET    whsec_...        (from the endpoint, not the CLI)
//   FIREBASE_PROJECT_ID      eververse2117
//   FIREBASE_SA_EMAIL        ...@....iam.gserviceaccount.com
//   FIREBASE_SA_KEY          the PEM private key, newlines intact
//
// ROUTES
//   POST /start     Authorization: Bearer <firebase id token>  -> { url }
//                   (403 "apply first" unless a guide doc or an application exists)
//   POST /webhook   Stripe-Signature: ...                      -> 200

const ALLOWED_ORIGIN = "https://eververse.org";

/* ---------------------------------------------------------------- */
/*  Small helpers                                                   */
/* ---------------------------------------------------------------- */
const enc = new TextEncoder();

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin === ALLOWED_ORIGIN ? origin : ALLOWED_ORIGIN,
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}
function json(body, status, origin) {
  return new Response(JSON.stringify(body), {
    status: status || 200,
    headers: Object.assign({ "Content-Type": "application/json" }, corsHeaders(origin)),
  });
}
function b64urlToBytes(s) {
  s = s.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
function bytesToHex(buf) {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
// Constant time. A timing side channel on a webhook signature is not a
// realistic attack here, but comparing secrets with === is the kind of habit
// that eventually costs somebody something.
function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/* ---------------------------------------------------------------- */
/*  Who is asking — verify the Firebase ID token properly           */
/* ---------------------------------------------------------------- */
// Without this, anybody could ask us to start a verification session
// carrying somebody else's uid, and then the webhook would mark THAT guide
// verified. The uid must come from a signature, never from the request body.
let keyCache = { at: 0, keys: null };

async function googlePublicKeys() {
  if (keyCache.keys && Date.now() - keyCache.at < 3600e3) return keyCache.keys;
  const r = await fetch("https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com");
  if (!r.ok) throw new Error("could not fetch Google signing keys");
  keyCache = { at: Date.now(), keys: await r.json() };
  return keyCache.keys;
}

function pemToDer(pem) {
  return b64urlToBytes(pem.replace(/-----[^-]+-----/g, "").replace(/\s+/g, "")
                          .replace(/\+/g, "-").replace(/\//g, "_"));
}

async function verifyFirebaseToken(token, projectId) {
  const parts = String(token || "").split(".");
  if (parts.length !== 3) throw new Error("malformed token");
  const header = JSON.parse(new TextDecoder().decode(b64urlToBytes(parts[0])));
  const claims = JSON.parse(new TextDecoder().decode(b64urlToBytes(parts[1])));

  const now = Math.floor(Date.now() / 1000);
  if (claims.aud !== projectId) throw new Error("wrong audience");
  if (claims.iss !== "https://securetoken.google.com/" + projectId) throw new Error("wrong issuer");
  if (!claims.sub) throw new Error("no subject");
  if (claims.exp <= now) throw new Error("token expired");
  if (claims.iat > now + 300) throw new Error("token issued in the future");

  const certs = await googlePublicKeys();
  const pem = certs[header.kid];
  if (!pem) throw new Error("unknown signing key");

  // The x509 cert has to be imported as SPKI; extract the public key via
  // the certificate's DER. Workers cannot parse x509 directly, so we rely on
  // the JWK endpoint instead when the cert path is unavailable.
  const jwks = await fetch("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com").then((r) => r.json());
  const jwk = (jwks.keys || []).find((k) => k.kid === header.kid);
  if (!jwk) throw new Error("unknown signing key");
  const key = await crypto.subtle.importKey("jwk", jwk,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]);
  const ok = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key,
    b64urlToBytes(parts[2]), enc.encode(parts[0] + "." + parts[1]));
  if (!ok) throw new Error("bad signature");
  return claims;      // .sub is the uid, .email the address
}

/* ---------------------------------------------------------------- */
/*  Talking to Firestore as the service account                     */
/* ---------------------------------------------------------------- */
let tokenCache = { at: 0, token: null };

async function accessToken(env) {
  if (tokenCache.token && Date.now() - tokenCache.at < 3000e3) return tokenCache.token;
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claim = {
    iss: env.FIREBASE_SA_EMAIL,
    scope: "https://www.googleapis.com/auth/datastore",
    aud: "https://oauth2.googleapis.com/token",
    iat: now, exp: now + 3600,
  };
  const b64 = (o) => btoa(JSON.stringify(o)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const unsigned = b64(header) + "." + b64(claim);
  const key = await crypto.subtle.importKey("pkcs8", pemToDer(env.FIREBASE_SA_KEY),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, enc.encode(unsigned));
  const jwt = unsigned + "." + btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: "grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=" + jwt,
  });
  if (!r.ok) throw new Error("token exchange failed: " + await r.text());
  const t = await r.json();
  tokenCache = { at: Date.now(), token: t.access_token };
  return t.access_token;
}

// Writes ONLY these two fields. The update mask is the guard: even a bug
// elsewhere in this file cannot touch standing, vouches or suspension.
async function markVerified(env, uid, sessionId, when) {
  const tok = await accessToken(env);
  const url = "https://firestore.googleapis.com/v1/projects/" + env.FIREBASE_PROJECT_ID +
    "/databases/(default)/documents/blessing/circle/guides/" + encodeURIComponent(uid) +
    "?updateMask.fieldPaths=idVerifiedAt&updateMask.fieldPaths=idVerificationId" +
    "&currentDocument.exists=true";
  const r = await fetch(url, {
    method: "PATCH",
    headers: { Authorization: "Bearer " + tok, "Content-Type": "application/json" },
    body: JSON.stringify({ fields: {
      idVerifiedAt: { stringValue: when },
      idVerificationId: { stringValue: sessionId },
    } }),
  });
  // currentDocument.exists=true means an unknown uid fails loudly rather than
  // creating a guide document out of thin air.
  if (!r.ok) throw new Error("firestore write failed: " + r.status + " " + await r.text());
}

// The most recent application from this email, if any. Applications are
// written before sign-in, so email is the only join.
async function findApplication(env, email) {
  if (!email) return null;
  const tok = await accessToken(env);
  const r = await fetch("https://firestore.googleapis.com/v1/projects/" + env.FIREBASE_PROJECT_ID +
    "/databases/(default)/documents/blessing/circle:runQuery", {
    method: "POST",
    headers: { Authorization: "Bearer " + tok, "Content-Type": "application/json" },
    body: JSON.stringify({ structuredQuery: {
      from: [{ collectionId: "applications" }],
      where: { fieldFilter: { field: { fieldPath: "email" }, op: "EQUAL", value: { stringValue: email } } },
      limit: 10,
    } }),
  });
  if (!r.ok) return null;
  const rows = await r.json();
  // newest first, without needing a composite index in Firestore
  const docs = rows.filter((x) => x.document).map((x) => x.document)
    .sort((p, q) => String((q.fields.createdAt || {}).stringValue || "").localeCompare(String((p.fields.createdAt || {}).stringValue || "")));
  const doc = docs[0];
  if (!doc) return null;
  const f = doc.fields || {};
  const str = (k) => (f[k] && f[k].stringValue) || "";
  const arr = (k) => ((f[k] && f[k].arrayValue && f[k].arrayValue.values) || []).map((v) => v.stringValue).filter(Boolean);
  return { name: str("name"), religions: arr("religions"), experience: arr("experience"), languages: arr("languages"), why: str("why") };
}

// Create the guide document from the application. probation: true is the
// entire safety property of doing this without a human in the loop.
async function createGuideOnProbation(env, uid, app, sessionId, when) {
  const tok = await accessToken(env);
  const url = "https://firestore.googleapis.com/v1/projects/" + env.FIREBASE_PROJECT_ID +
    "/databases/(default)/documents/blessing/circle/guides?documentId=" + encodeURIComponent(uid);
  const s = (v) => ({ stringValue: v });
  const a = (vs) => ({ arrayValue: { values: vs.map((v) => ({ stringValue: v })) } });
  const r = await fetch(url, {
    method: "POST",
    headers: { Authorization: "Bearer " + tok, "Content-Type": "application/json" },
    body: JSON.stringify({ fields: {
      name: s((app.name || "").slice(0, 60)),
      tradition: a(app.religions.length ? app.religions : ["none"]),
      languages: a(app.languages.length ? app.languages : ["en"]),
      experience: a(app.experience),
      about: s(""),
      capacity: { integerValue: "3" },
      active: { booleanValue: true },
      probation: { booleanValue: true },
      approvedAt: s(when),
      idVerifiedAt: s(when),
      idVerificationId: s(sessionId),
    } }),
  });
  // 409 means it already exists — a race with the other branch; that is fine.
  if (!r.ok && r.status !== 409) throw new Error("guide create failed: " + r.status + " " + await r.text());
}

async function guideExists(env, uid) {
  const tok = await accessToken(env);
  const r = await fetch("https://firestore.googleapis.com/v1/projects/" + env.FIREBASE_PROJECT_ID +
    "/databases/(default)/documents/blessing/circle/guides/" + encodeURIComponent(uid) + "?mask.fieldPaths=approvedAt",
    { headers: { Authorization: "Bearer " + tok } });
  return r.status === 200;
}

/* ---------------------------------------------------------------- */
/*  Stripe                                                          */
/* ---------------------------------------------------------------- */
async function createSession(env, uid, email) {
  const body = new URLSearchParams();
  body.set("type", "document");
  body.set("metadata[guideUid]", uid);
  body.set("metadata[email]", (email || "").toLowerCase());   // to find their application
  body.set("options[document][require_live_capture]", "true");   // a selfie, not a photo of a photo
  body.set("options[document][require_matching_selfie]", "true");
  body.set("return_url", ALLOWED_ORIGIN + "/blessing.html?verified=1");
  const r = await fetch("https://api.stripe.com/v1/identity/verification_sessions", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + env.STRIPE_SECRET_KEY,
      "Content-Type": "application/x-www-form-urlencoded",
      // If a guide double-taps, they get the same session rather than two charges.
      "Idempotency-Key": "guide-" + uid,
    },
    body: body.toString(),
  });
  if (!r.ok) throw new Error("stripe: " + await r.text());
  return r.json();
}

async function verifyStripeSignature(raw, header, secret) {
  const parts = Object.fromEntries(String(header || "").split(",").map((p) => p.split("=")));
  if (!parts.t || !parts.v1) return false;
  // Replay window. Stripe recommends five minutes.
  if (Math.abs(Math.floor(Date.now() / 1000) - Number(parts.t)) > 300) return false;
  const key = await crypto.subtle.importKey("raw", enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const mac = await crypto.subtle.sign("HMAC", key, enc.encode(parts.t + "." + raw));
  return timingSafeEqual(bytesToHex(mac), parts.v1);
}

/* ---------------------------------------------------------------- */
/*  Routes                                                          */
/* ---------------------------------------------------------------- */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") || "";

    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders(origin) });

    /* ---- the guide asks to be verified ---- */
    if (url.pathname === "/start" && request.method === "POST") {
      try {
        const auth = request.headers.get("Authorization") || "";
        const claims = await verifyFirebaseToken(auth.replace(/^Bearer\s+/i, ""), env.FIREBASE_PROJECT_ID);
        // Only for people we know — a guide, or someone who has applied.
        // Each session costs money; a stranger with a Google account must
        // not be able to spend it, and a verified stranger would be useless
        // anyway: no application, no guide document.
        const email = String(claims.email || "").toLowerCase();
        const known = (await guideExists(env, claims.sub)) || !!(await findApplication(env, email));
        if (!known) return json({ error: "apply first" }, 403, origin);
        const session = await createSession(env, claims.sub, email);
        return json({ url: session.url }, 200, origin);
      } catch (e) {
        // Deliberately vague to the caller, specific in the log.
        console.log("start failed: " + e.message);
        return json({ error: "could not start verification" }, 400, origin);
      }
    }

    /* ---- Stripe tells us how it went ---- */
    if (url.pathname === "/webhook" && request.method === "POST") {
      const raw = await request.text();
      const ok = await verifyStripeSignature(raw, request.headers.get("Stripe-Signature"), env.STRIPE_WEBHOOK_SECRET);
      if (!ok) return new Response("bad signature", { status: 400 });

      let event;
      try { event = JSON.parse(raw); } catch (e) { return new Response("bad body", { status: 400 }); }
      const obj = (event.data && event.data.object) || {};
      const uid = (obj.metadata && obj.metadata.guideUid) || "";

      if (event.type === "identity.verification_session.verified" && uid) {
        try {
          const when = new Date().toISOString().slice(0, 10);
          if (await guideExists(env, uid)) {
            await markVerified(env, uid, obj.id || "", when);
          } else {
            const email = (obj.metadata && obj.metadata.email) || "";
            const app = await findApplication(env, email);
            if (!app) {
              // Verified but never applied. Do nothing; a person can approve
              // by hand if they turn up. Never create a guide from thin air.
              console.log("verified without application: " + uid);
            } else {
              await createGuideOnProbation(env, uid, app, obj.id || "", when);
            }
          }
        } catch (e) {
          // 500 so Stripe retries rather than dropping a real verification.
          console.log("write failed for " + uid + ": " + e.message);
          return new Response("retry", { status: 500 });
        }
      }

      // A failure is NEVER an automatic rejection. Documents fail for glare
      // on a laminate, a worn passport, a name transliterated differently, or
      // a document type Stripe never trained on — and auto-rejecting would
      // quietly exclude immigrants, older people and the poor, which is
      // exactly the lived experience the Circle needs most. So we log it for
      // a person to pick up and write nothing.
      if (event.type === "identity.verification_session.requires_input") {
        console.log("needs a human: " + uid + " " +
          ((obj.last_error && obj.last_error.code) || "unknown"));
      }

      return new Response("ok", { status: 200 });
    }

    return new Response("not found", { status: 404 });
  },
};
