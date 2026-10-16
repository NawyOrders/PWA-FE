"use client";

import { create } from "zustand";

export type ToastTone = "default" | "success" | "danger";

export interface Toast {
  id: number;
  message: string;
  tone: ToastTone;
}

interface UiState {
  drawerOpen: boolean;
  loginModalOpen: boolean;
  toast: Toast | null;
  openDrawer: () => void;
  closeDrawer: () => void;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  showToast: (message: string, tone?: ToastTone) => void;
  hideToast: () => void;
}

let toastId = 0;

export const useUiStore = create<UiState>()((set) => ({
  drawerOpen: false,
  loginModalOpen: false,
  toast: null,
  openDrawer: () => set({ drawerOpen: true }),
  closeDrawer: () => set({ drawerOpen: false }),
  openLoginModal: () => set({ loginModalOpen: true }),
  closeLoginModal: () => set({ loginModalOpen: false }),
  showToast: (message, tone = "default") => {
    toastId += 1;
    set({ toast: { id: toastId, message, tone } });
  },
  hideToast: () => set({ toast: null }),
}));
