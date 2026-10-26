"use client";

import { create } from "zustand";
import type { BeforeInstallPromptEvent } from "@/lib/pwa";

interface PwaState {
  hydrated: boolean;
  updateReady: boolean;
  waitingWorker: ServiceWorker | null;
  installPromptEvent: BeforeInstallPromptEvent | null;
  installed: boolean;
  online: boolean;
  setHydrated: () => void;
  setUpdateReady: (ready: boolean, worker?: ServiceWorker | null) => void;
  setInstallPromptEvent: (event: BeforeInstallPromptEvent | null) => void;
  setInstalled: (installed: boolean) => void;
  setOnline: (online: boolean) => void;
}

export const usePwaStore = create<PwaState>()((set) => ({
  hydrated: false,
  updateReady: false,
  waitingWorker: null,
  installPromptEvent: null,
  installed: false,
  online: true,
  setHydrated: () => set({ hydrated: true }),
  setUpdateReady: (updateReady, waitingWorker = null) => set({ updateReady, waitingWorker }),
  setInstallPromptEvent: (installPromptEvent) => set({ installPromptEvent }),
  setInstalled: (installed) => set({ installed }),
  setOnline: (online) => set({ online }),
}));
