const CACHE_NAME = "despezzas-v1";

const urlsToCache = [
  "/",
  "/index.html",
  "/src/css/base.css",
  "/src/css/layout.css",
  "/src/css/form.css",
  "/src/css/table.css",
  "/src/css/buttons.css"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});