// auth-proxy-worker.js
// Cloudflare Worker: serve Firebase's sign-in handler from eververse.org.
//
// WHY THIS EXISTS.
//
// Google sign-in on the site runs its popup on eververse2117.firebaseapp.com
// and hands the result back to eververse.org through a hidden iframe. That
// is a third-party handshake, and Firefox (Enhanced Tracking Protection) and
// Safari (ITP) partition third-party storage — so the popup writes the result
// somewhere the iframe cannot read, closes, and Firebase reports
// "auth/popup-closed-by-user". Every Firefox user and every iPhone user hits
// it. localhost was exempt, which is why it worked during testing.
//
// Firebase's documented fix for a site not on Firebase Hosting is to serve
// the handler from your OWN domain: proxy eververse.org/__/auth/* through to
// eververse2117.firebaseapp.com/__/auth/*, and set authDomain to
// eververse.org. Same origin, nothing third-party, works everywhere.
//
// This Worker is that proxy. It answers ONLY /__/auth/* — every other path on
// eververse.org still comes from GitHub Pages untouched.
//
// Route (Cloudflare dashboard → Workers → this worker → Triggers → Routes):
//   eververse.org/__/auth/*
//   www.eververse.org/__/auth/*      (if the site answers on www)
//
// No secrets. Nothing is logged. The Worker sees the same public traffic the
// browser already sends to Firebase; it just changes which domain it appears
// to come from.

const UPSTREAM = "eververse2117.firebaseapp.com";

export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (!url.pathname.startsWith("/__/auth/")) {
      return new Response("not found", { status: 404 });
    }

    const upstream = new URL(url.pathname + url.search, "https://" + UPSTREAM);

    // Forward the request as-is, with the Host header pointed at Firebase.
    // Redirects are passed back to the browser rather than followed here, so
    // the handler's own redirect logic keeps working.
    const headers = new Headers(request.headers);
    headers.set("Host", UPSTREAM);
    headers.delete("cf-connecting-ip");
    headers.delete("x-forwarded-for");

    const res = await fetch(upstream.toString(), {
      method: request.method,
      headers,
      body: ["GET", "HEAD"].indexOf(request.method) === -1 ? request.body : undefined,
      redirect: "manual",
    });

    // Pass the response through. Strip any Set-Cookie scoped to the upstream
    // domain — the browser would refuse it for eververse.org anyway, and the
    // handler does not depend on cookies; it uses the page's own storage,
    // which is the entire point of moving it onto our origin.
    const out = new Headers(res.headers);
    out.delete("set-cookie");
    return new Response(res.body, { status: res.status, statusText: res.statusText, headers: out });
  },
};
