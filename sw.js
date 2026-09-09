// sw.js — EverVerse service worker.
// Strategy:
//   • App shell is precached on install for instant, offline-capable loads.
//   • Code (HTML/JS/CSS) is NETWORK-FIRST with a short timeout, so the first
//     open after a deploy is already the new version; the cache answers if the
//     network is slow or gone.
//   • Other same-origin GETs (icons, images) use STALE-WHILE-REVALIDATE.
//   • The Firebase SDK (versioned, immutable) is cached on first use.
//   • Cross-origin APIs (translation, Firestore) are never intercepted.
//   • Navigations fall back to the cached shell when offline.
//
// Why the explicit `cache: "reload"` / `"no-cache"` below: Pages serves the
// app with `Cache-Control: max-age=600`, and both cache.add() and a plain
// fetch() read through the browser's HTTP cache. Without these, a freshly
// installed worker could precache TEN-MINUTE-OLD files under a brand new
// cache name — the app would look stale even after the worker updated.

const CACHE = "eververse-v79";

// How long a slow network gets before the cached copy is served instead.
const NET_TIMEOUT_MS = 3000;
const SHELL = [
  "./", "./index.html", "./app.html",
  "./styles.css", "./site.css",
  "./firebase-config.js", "./reactions.js", "./tts-config.js",
  "./verses.js", "./meanings.js", "./sermons.js", "./content.js", "./translations.js",
  "./backgrounds.js", "./render.js", "./voice.js", "./site.js",
  "./zip.js", "./video.js", "./audiobooks.js", "./explainer.js", "./ecards.js", "./mockups.js", "./collection.js", "./occasions.js", "./series.js", "./updater.js", "./hub.js", "./app.js",
  "./manifest.json", "./privacy.html", "./style-gallery.html", "./blessing.html",
  "./icons/icon-192.png", "./icons/icon-512.png", "./icons/icon-maskable-512.png",
];

// Precache straight from the network, never through the HTTP cache — a new
// worker must not inherit the files the old version was already serving.
async function precacheFresh(cache, url) {
  const res = await fetch(new Request(url, { cache: "reload", credentials: "same-origin" }));
  if (res && res.ok) await cache.put(url, res);
}

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE)
      // Best-effort precache: don't fail install if one asset 404s.
      .then((c) => Promise.allSettled(SHELL.map((u) => precacheFresh(c, u))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Cache-first for the immutable Firebase SDK on gstatic (versioned URLs).
function isFirebaseSdk(url) {
  return url.hostname === "www.gstatic.com" && url.pathname.indexOf("/firebasejs/") !== -1;
}

// A same-origin GET that always asks the server whether its copy is current.
// Unchanged files come back 304 with no body, so this stays cheap.
function revalidating(req) {
  return fetch(new Request(req.url, { cache: "no-cache", credentials: "same-origin" }));
}

async function staleWhileRevalidate(req) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(req);
  const fetching = revalidating(req)
    .then((res) => { if (res && res.status === 200 && res.type === "basic") cache.put(req, res.clone()); return res; })
    .catch(() => null);
  return cached || (await fetching) || cache.match("./index.html");
}

// Code paths: prefer the network so a deploy shows up on the very next open,
// but never let a slow or dead connection block the page — after
// NET_TIMEOUT_MS the cached copy is served and the fetch still fills the cache.
async function networkFirst(req) {
  const cache = await caches.open(CACHE);
  const fetching = revalidating(req)
    .then((res) => { if (res && res.status === 200 && res.type === "basic") cache.put(req, res.clone()); return res; })
    .catch(() => null);
  const cached = await cache.match(req);
  if (!cached) return (await fetching) || cache.match("./index.html");
  const winner = await Promise.race([
    fetching,
    new Promise((r) => setTimeout(() => r(null), NET_TIMEOUT_MS)),
  ]);
  return winner || cached;
}

// HTML, JS and CSS are the app itself; everything else is an asset.
function isCode(url) {
  return /\.(?:html|js|css)$/i.test(url.pathname) || url.pathname.endsWith("/");
}

async function cacheFirst(req) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(req);
  if (cached) return cached;
  try {
    const res = await fetch(req);
    if (res && (res.status === 200 || res.type === "opaque")) cache.put(req, res.clone());
    return res;
  } catch (e) { return cached || Response.error(); }
}

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // Immutable Firebase SDK → cache-first (faster repeat loads, works offline once cached).
  if (isFirebaseSdk(url)) { e.respondWith(cacheFirst(req)); return; }

  // Only manage our own origin; let all other cross-origin (APIs) hit the network.
  if (url.origin !== location.origin) return;

  // Navigations and code: network-first, cached copy as the safety net.
  if (req.mode === "navigate" || isCode(url)) {
    e.respondWith(networkFirst(req).then((r) => r || caches.match("./index.html")));
    return;
  }

  // Other same-origin assets (icons, images): stale-while-revalidate.
  e.respondWith(staleWhileRevalidate(req));
});

// Daily reminder (best-effort, where Periodic Background Sync is supported).
self.addEventListener("periodicsync", (e) => {
  if (e.tag === "daily-blessing") {
    e.waitUntil(self.registration.showNotification("Today's blessing is ready ✦", {
      body: "Open EverVerse for a new verse and its meaning.",
      icon: "./icons/icon-192.png", badge: "./icons/icon-192.png", tag: "daily-blessing",
    }));
  }
});
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
    for (const c of list) { if ("focus" in c) return c.focus(); }
    return self.clients.openWindow("./index.html");
  }));
});
