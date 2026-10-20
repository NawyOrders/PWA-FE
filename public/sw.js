const CACHE_NAME = "nawyorders-shell-v4";
const IMAGE_CACHE = "nawyorders-images-v2";
const OFFLINE_URL = "/offline.html";
const OFFLINE_ROUTES = ["/ar/offline", "/en/offline"];
const IMAGE_CACHE_LIMIT = 60;
const NAV_TIMEOUT_MS = 3000;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll([OFFLINE_URL, ...OFFLINE_ROUTES]))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  const keep = new Set([CACHE_NAME, IMAGE_CACHE]);
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => (key.startsWith("nawyorders-") || key.startsWith("karam-el-sham-")) && !keep.has(key))
          .map((key) => caches.delete(key)),
      ))
      .then(() => self.clients.claim()),
  );
});

async function trimCache(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxItems) {
    await cache.delete(keys[0]);
    await trimCache(cacheName, maxItems);
  }
}

async function staleWhileRevalidate(request, cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then((response) => {
      if (response?.ok) {
        void cache.put(request, response.clone()).then(() => trimCache(cacheName, maxItems));
      }
      return response;
    })
    .catch(() => cached);
  return cached || network;
}

function isImageRequest(url, request) {
  return url.pathname.startsWith("/images/") ||
    url.pathname.startsWith("/_next/image") ||
    (request.destination === "image" && url.pathname.startsWith("/_next/"));
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith("/_next/static")) return;

  if (request.mode === "navigate") {
    event.respondWith((async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), NAV_TIMEOUT_MS);
      try {
        const response = await fetch(request, { signal: controller.signal });
        clearTimeout(timeoutId);
        return response;
      } catch {
        clearTimeout(timeoutId);
        const locale = url.pathname.split("/")[1];
        const cache = await caches.open(CACHE_NAME);
        return (await cache.match(`/${locale}/offline`)) ||
          (await cache.match(OFFLINE_URL)) ||
          Response.error();
      }
    })());
    return;
  }

  if (isImageRequest(url, request)) {
    event.respondWith(staleWhileRevalidate(request, IMAGE_CACHE, IMAGE_CACHE_LIMIT));
    return;
  }

  if (!request.destination) return;
  event.respondWith(
    fetch(request).then((response) => {
      if (response.ok) {
        void caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone()));
      }
      return response;
    }).catch(async () => {
      const cache = await caches.open(CACHE_NAME);
      return (await cache.match(request)) || Response.error();
    }),
  );
});
