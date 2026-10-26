import { PWA_CACHE_PREFIX, PWA_SYNC_TAG } from "../lib/pwa-constants";
import { renderOfflinePage, type OfflineTheme } from "./offline";
import {
  FONT_CACHE,
  IMAGE_CACHE,
  NAV_TIMEOUT_MS,
  handleActivate,
  handleFont,
  handleImage,
  handleMessage,
  handleNavigation,
  shouldIntercept,
  type StrategyDeps,
} from "./strategies";

declare const self: ServiceWorkerGlobalScope;

declare const __BUILD_ID__: string;
declare const __PRECACHE__: string[];
declare const __PWA_BG_SPLASH__: string;
declare const __PWA_PRIMARY__: string;
declare const __PWA_TEXT__: string;
declare const __PWA_TEXT_MUTED__: string;
declare const __PWA_SURFACE__: string;

const BUILD_ID = __BUILD_ID__;
const STATIC_CACHE = `${PWA_CACHE_PREFIX}static-${BUILD_ID}`;
const CACHE_NAMES = [STATIC_CACHE, IMAGE_CACHE, FONT_CACHE];
const PRECACHE = __PRECACHE__;

const THEME: OfflineTheme = {
  bgSplash: __PWA_BG_SPLASH__,
  primary: __PWA_PRIMARY__,
  text: __PWA_TEXT__,
  textMuted: __PWA_TEXT_MUTED__,
  surface: __PWA_SURFACE__,
};

interface BackgroundSyncEvent extends ExtendableEvent {
  readonly tag: string;
}

function isBackgroundSyncEvent(event: Event): event is BackgroundSyncEvent {
  return "tag" in event && "waitUntil" in event;
}

const deps: StrategyDeps = {
  caches,
  fetch: (input, init) => fetch(input, init),
  now: () => Date.now(),
};

function logWorker(message: string, error?: unknown): void {
  console.warn(`[pwa] ${message}`, error);
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(STATIC_CACHE);
      await Promise.all(
        PRECACHE.map(async (url) => {
          try {
            await cache.addAll([url]);
          } catch (error) {
            logWorker(`precache failed for ${url}`, error);
          }
        }),
      );
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      await handleActivate(deps, CACHE_NAMES);
      try {
        await self.registration.navigationPreload.enable();
      } catch (error) {
        logWorker("navigation preload unavailable", error);
      }
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("message", (event) => {
  event.waitUntil(handleMessage(event.data, () => self.skipWaiting()));
});

self.addEventListener("sync", (event) => {
  if (!isBackgroundSyncEvent(event) || event.tag !== PWA_SYNC_TAG) return;
  event.waitUntil(notifyClients());
});

async function notifyClients(): Promise<void> {
  const clients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
  for (const client of clients) {
    client.postMessage({ type: "FLUSH_OUTBOX", tag: PWA_SYNC_TAG });
  }
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (!shouldIntercept(url, request.method, self.location.origin, request.destination)) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      handleNavigation(request, deps, {
        timeoutMs: NAV_TIMEOUT_MS,
        preload: event.preloadResponse,
        renderOffline: (locale) => renderOfflinePage(locale, THEME),
      }),
    );
    return;
  }

  if (request.destination === "image" || request.destination === "font") {
    event.respondWith(
      request.destination === "font" ? handleFont(request, deps) : handleImage(request, deps),
    );
    return;
  }

  if (/\.(png|webp|avif|jpe?g|svg|gif)$/i.test(url.pathname)) {
    event.respondWith(handleImage(request, deps));
    return;
  }

  if (/\.(woff2|woff)$/i.test(url.pathname)) {
    event.respondWith(handleFont(request, deps));
  }
});
