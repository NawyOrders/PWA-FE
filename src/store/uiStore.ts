"use client";

import { create } from "zustand";

export type ToastTone = "default" | "success" | "danger";

export interface ToastAction {
  label: string;
  onAction: () => void;
}

export interface ToastOptions {
  duration?: number;
  action?: ToastAction;
}

export interface Toast {
  id: number;
  message: string;
  tone: ToastTone;
  duration?: number;
  action?: ToastAction;
}

interface UiState {
  hydrated: boolean;
  drawerOpen: boolean;
  loginModalOpen: boolean;
  toast: Toast | null;
  setHydrated: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  showToast: (message: string, tone?: ToastTone, options?: ToastOptions) => void;
  hideToast: () => void;
}

let toastId = 0;

export const useUiStore = create<UiState>()((set) => ({
  hydrated: false,
  drawerOpen: false,
  loginModalOpen: false,
  toast: null,
  setHydrated: () => set({ hydrated: true }),
  openDrawer: () => set({ drawerOpen: true }),
  closeDrawer: () => set({ drawerOpen: false }),
  openLoginModal: () => set({ loginModalOpen: true }),
  closeLoginModal: () => set({ loginModalOpen: false }),
  showToast: (message, tone = "default", options) => {
    toastId += 1;
    set({ toast: { id: toastId, message, tone, duration: options?.duration, action: options?.action } });
  },
  hideToast: () => set({ toast: null }),
}));
