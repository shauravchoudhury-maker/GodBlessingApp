// sw.js — EverVerse service worker.
// Strategy:
//   • App shell is precached on install for instant, offline-capable loads.
//   • Same-origin GETs use STALE-WHILE-REVALIDATE: serve from cache immediately,
//     then refresh the cache in the background — fast AND self-updating.
//   • The Firebase SDK (versioned, immutable) is cached on first use.
//   • Cross-origin APIs (translation, Firestore) are never intercepted.
//   • Navigations fall back to the cached shell when offline.

const CACHE = "eververse-v59";
const SHELL = [
  "./", "./index.html", "./app.html",
  "./styles.css", "./site.css",
  "./firebase-config.js", "./reactions.js", "./tts-config.js",
  "./verses.js", "./meanings.js", "./sermons.js", "./content.js", "./translations.js",
  "./backgrounds.js", "./render.js", "./voice.js", "./site.js",
  "./zip.js", "./video.js", "./audiobooks.js", "./explainer.js", "./ecards.js", "./mockups.js", "./collection.js", "./updater.js", "./hub.js", "./app.js",
  "./manifest.json", "./privacy.html", "./style-gallery.html",
  "./icons/icon-192.png", "./icons/icon-512.png", "./icons/icon-maskable-512.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE)
      // Best-effort precache: don't fail install if one asset 404s.
      .then((c) => Promise.allSettled(SHELL.map((u) => c.add(u))))
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

async function staleWhileRevalidate(req) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(req);
  const fetching = fetch(req)
    .then((res) => { if (res && res.status === 200 && res.type === "basic") cache.put(req, res.clone()); return res; })
    .catch(() => null);
  return cached || (await fetching) || cache.match("./index.html");
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

  // Navigations: SWR with shell fallback when offline.
  if (req.mode === "navigate") {
    e.respondWith(staleWhileRevalidate(req).then((r) => r || caches.match("./index.html")));
    return;
  }

  // Same-origin assets: stale-while-revalidate.
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
