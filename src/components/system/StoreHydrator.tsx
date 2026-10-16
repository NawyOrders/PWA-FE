"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { useFavoritesStore } from "@/store/favoritesStore";
import { useLanguageStore } from "@/store/languageStore";
import { useOrdersStore } from "@/store/ordersStore";
import type { Locale } from "@/lib/i18n/types";

export function StoreHydrator({ locale }: { locale: Locale }) {
  useEffect(() => {
    void useAuthStore.persist.rehydrate();
    void useCartStore.persist.rehydrate();
    void useFavoritesStore.persist.rehydrate();
    void useLanguageStore.persist.rehydrate();
    void useOrdersStore.persist.rehydrate();
  }, []);

  useEffect(() => {
    useLanguageStore.getState().setLocale(locale);
  }, [locale]);

  return null;
}
