const CACHE_NAME = "elara-field-v5-beta1-20260710";
const APP_SHELL = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./install.js",
  "./offline.html",
  "./manifest.webmanifest",
  "./timeline_engine.js",
  "./timeline_search.js",
  "./timeline_summary.js",
  "./timeline_export.js",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/maskable-512.png",
  "./icons/apple-touch-icon.png",
  "./academy/index.html",
  "./academy/academy.css",
  "./academy/academy.js",
  "./academy/academy_data.js",
  "./bid-commander/index.html",
  "./bid-commander/style.css",
  "./bid-commander/app.js",
  "./bid-commander/bid_engine.js",
  "./bid-commander/bid_scoring.js",
  "./bid-commander/bid_export.js",
  "./bid-commander/product_manifest.json",
  "./bid-commander/bid_database.json",
  "./bid-commander/README.md"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match(event.request).then(r => r || caches.match("./index.html") || caches.match("./offline.html")))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
      const network = fetch(event.request)
        .then(response => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});

self.addEventListener("message", event => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});
