const CACHE_NAME = "nawyorders-shell-v1";
const OFFLINE_URLS = ["/ar/offline", "/en/offline"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(OFFLINE_URLS)).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => Promise.all(
        cacheNames
          .filter((cacheName) => cacheName.startsWith("nawyorders-") && cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName)),
      ))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET" || new URL(event.request.url).origin !== self.location.origin) return;

  if (event.request.mode !== "navigate") {
    if (!event.request.destination) return;

    event.respondWith(
      fetch(event.request).then((response) => {
        if (response.ok) {
          const responseCopy = response.clone();
          void caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseCopy));
        }
        return response;
      }).catch(async () => {
        const cachedResponse = await caches.match(event.request);
        return cachedResponse || Response.error();
      }),
    );
    return;
  }

  event.respondWith(
    fetch(event.request).catch(async () => {
      const cache = await caches.open(CACHE_NAME);
      const locale = new URL(event.request.url).pathname.split("/")[1];
      return (await cache.match(`/${locale}/offline`)) || (await cache.match("/ar/offline")) || Response.error();
    }),
  );
});
