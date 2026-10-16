"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface FavoritesState {
  ids: string[];
  toggle: (dishId: string) => void;
  remove: (dishId: string) => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set) => ({
      ids: [],
      toggle: (dishId) =>
        set((state) => ({
          ids: state.ids.includes(dishId)
            ? state.ids.filter((id) => id !== dishId)
            : [dishId, ...state.ids],
        })),
      remove: (dishId) =>
        set((state) => ({ ids: state.ids.filter((id) => id !== dishId) })),
    }),
    { name: "nawy-favorites", skipHydration: true },
  ),
);
