const STATIC_CACHE = "tesla-static-v2";
const DYNAMIC_CACHE = "tesla-dynamic-v2";

const STATIC_ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "https://unpkg.com/leaflet/dist/leaflet.css",
  "https://unpkg.com/leaflet/dist/leaflet.js"
];

// 🔹 INSTALACIÓN
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// 🔹 ACTIVACIÓN (borra versiones viejas)
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys
          .filter(key => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
          .map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// 🔹 FETCH INTELIGENTE
self.addEventListener("fetch", event => {

  // 🗺 MAPAS (Network First)
  if (event.request.url.includes("cartocdn") ||
      event.request.url.includes("tile")) {

    event.respondWith(
      fetch(event.request)
        .then(res => {
          return caches.open(DYNAMIC_CACHE).then(cache => {
            cache.put(event.request, res.clone());
            return res;
          });
        })
        .catch(() => caches.match(event.request))
    );

    return;
  }

  // 📦 APP (Cache First)
  event.respondWith(
    caches.match(event.request)
      .then(cacheRes => {
        return cacheRes || fetch(event.request)
          .then(fetchRes => {
            return caches.open(DYNAMIC_CACHE).then(cache => {
              cache.put(event.request, fetchRes.clone());
              return fetchRes;
            });
          });
      })
  );
});
