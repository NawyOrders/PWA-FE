"use client";

import { useEffect } from "react";
import {
  PWA_CACHE_PREFIX,
  PWA_RELOAD_FLAG,
  UPDATE_CHECK_INTERVAL_MS,
  isStandalone,
  readSession,
  recordSession,
  removeSession,
} from "@/lib/pwa";
import { usePwaStore } from "@/store/pwaStore";

export function RegisterSW() {
  const setHydrated = usePwaStore((state) => state.setHydrated);
  const setUpdateReady = usePwaStore((state) => state.setUpdateReady);
  const setInstalled = usePwaStore((state) => state.setInstalled);
  const setOnline = usePwaStore((state) => state.setOnline);

  useEffect(() => {
    let cancelled = false;
    let interval = 0;
    let registration: ServiceWorkerRegistration | null = null;

    const syncOnline = () => setOnline(navigator.onLine);
    syncOnline();
    window.addEventListener("online", syncOnline);
    window.addEventListener("offline", syncOnline);

    setInstalled(isStandalone());
    recordSession();

    const onControllerChange = () => {
      if (cancelled || readSession(PWA_RELOAD_FLAG) !== "1") return;
      removeSession(PWA_RELOAD_FLAG);
      window.location.reload();
    };

    const supportsServiceWorker = "serviceWorker" in navigator;

    if (supportsServiceWorker) {
      navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);
    }

    const cleanup = () => {
      cancelled = true;
      window.removeEventListener("online", syncOnline);
      window.removeEventListener("offline", syncOnline);
      window.removeEventListener("load", register);
      document.removeEventListener("visibilitychange", checkForUpdate);
      if (interval) window.clearInterval(interval);
      if (supportsServiceWorker) {
        navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
      }
    };

    if (!supportsServiceWorker) {
      setHydrated();
      return cleanup;
    }

    if (process.env.NODE_ENV !== "production") {
      navigator.serviceWorker
        .getRegistrations()
        .then((registrations) => Promise.all(registrations.map((item) => item.unregister())))
        .catch(() => undefined);
      if (typeof caches !== "undefined") {
        caches
          .keys()
          .then((keys) =>
            Promise.all(
              keys
                .filter((key) => key.startsWith(PWA_CACHE_PREFIX))
                .map((key) => caches.delete(key)),
            ),
          )
          .catch(() => undefined);
      }
      setHydrated();
      return cleanup;
    }

    const watch = (reg: ServiceWorkerRegistration) => {
      registration = reg;
      if (reg.waiting && navigator.serviceWorker.controller) {
        setUpdateReady(true, reg.waiting);
      }
      reg.addEventListener("updatefound", () => {
        const worker = reg.installing;
        if (!worker) return;
        worker.addEventListener("statechange", () => {
          if (worker.state === "installed" && navigator.serviceWorker.controller) {
            setUpdateReady(true, worker);
          }
        });
      });
    };

    const register = async () => {
      try {
        const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
        if (cancelled) return;
        watch(reg);
        void reg.update().catch(() => undefined);
        interval = window.setInterval(checkForUpdate, UPDATE_CHECK_INTERVAL_MS);
      } catch {
        // Registration can fail on insecure origins; the app still works online.
      } finally {
        if (!cancelled) setHydrated();
      }
    };

    function checkForUpdate() {
      if (document.visibilityState !== "visible") return;
      void registration?.update().catch(() => undefined);
    }

    document.addEventListener("visibilitychange", checkForUpdate);

    if (document.readyState === "complete") {
      void register();
    } else {
      window.addEventListener("load", register, { once: true });
    }

    return cleanup;
  }, [setHydrated, setInstalled, setOnline, setUpdateReady]);

  return null;
}
