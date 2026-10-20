"use client";

import { useEffect } from "react";
import { useAddressStore } from "@/store/addressStore";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { useFavoritesStore } from "@/store/favoritesStore";
import { useLanguageStore } from "@/store/languageStore";
import { useOrdersStore } from "@/store/ordersStore";
import { useUiStore } from "@/store/uiStore";
import type { Locale } from "@/lib/i18n/types";

export function StoreHydrator({ locale }: { locale: Locale }) {
  useEffect(() => {
    void Promise.allSettled([
      useAddressStore.persist.rehydrate(),
      useAuthStore.persist.rehydrate(),
      useCartStore.persist.rehydrate(),
      useFavoritesStore.persist.rehydrate(),
      useLanguageStore.persist.rehydrate(),
      useOrdersStore.persist.rehydrate(),
    ]).then(() => useUiStore.getState().setHydrated());
  }, []);

  useEffect(() => {
    useLanguageStore.getState().setLocale(locale);
  }, [locale]);

  return null;
}
