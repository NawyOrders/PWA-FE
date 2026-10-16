"use client";

import { useAuthStore } from "@/store/authStore";
import { useUiStore } from "@/store/uiStore";

export function useAuthGuard() {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const openLoginModal = useUiStore((state) => state.openLoginModal);

  return (action: () => void) => {
    if (!isLoggedIn) {
      openLoginModal();
      return;
    }
    action();
  };
}
