"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/data/user";

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  persistent: boolean;
  login: (user: User, remember?: boolean) => void;
  setName: (name: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoggedIn: false,
      persistent: true,
      login: (user, remember = true) => set({ user, isLoggedIn: true, persistent: remember }),
      setName: (name) =>
        set((state) => ({ user: state.user ? { ...state.user, name } : state.user })),
      logout: () => set({ user: null, isLoggedIn: false }),
    }),
    {
      name: "nawy-auth",
      skipHydration: true,
      partialize: ({ user, isLoggedIn, persistent }) => ({
        user: persistent ? user : null,
        isLoggedIn: persistent ? isLoggedIn : false,
        persistent,
      }),
    },
  ),
);
