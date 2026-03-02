const CACHE_NAME="tesla-dash-cache-v1";
const urlsToCache=["./index.html","./manifest.json","./service-worker.js","./icon-192.png","./icon-512.png","./alerta.mp3"];

self.addEventListener("install",event=>{
  event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(urlsToCache)));
});

self.addEventListener("activate",event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))));
});

self.addEventListener("fetch",event=>{
  event.respondWith(caches.match(event.request).then(resp=>resp||fetch(event.request)));
});