// sw.js — offline app-shell service worker for EverVerse PWA.
const CACHE = "eververse-v12";
const ASSETS = [
  "./",
  "./index.html",
  "./app.html",
  "./styles.css",
  "./site.css",
  "./firebase-config.js",
  "./reactions.js",
  "./verses.js",
  "./meanings.js",
  "./sermons.js",
  "./content.js",
  "./backgrounds.js",
  "./render.js",
  "./voice.js",
  "./site.js",
  "./zip.js",
  "./video.js",
  "./hub.js",
  "./app.js",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Cache-first for same-origin app shell; everything else (e.g. the translation
// API) goes straight to the network and is never cached.
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  e.respondWith(
    caches.match(req).then((cached) =>
      cached ||
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy));
        return res;
      }).catch(() => caches.match("./index.html"))
    )
  );
});
