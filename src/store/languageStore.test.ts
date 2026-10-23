import { beforeEach, describe, expect, it } from "vitest";
import { useLanguageStore } from "./languageStore";
import { defaultLocale } from "@/lib/i18n";
import { resetStores } from "../../tests/utils/stores";

const STORAGE_KEY = "nawy-language";

describe("language store", () => {
  beforeEach(() => {
    resetStores();
    document.cookie = "locale=; max-age=0; path=/";
  });

  it("UT-LANG-01 defaults to Arabic", () => {
    expect(useLanguageStore.getState().locale).toBe(defaultLocale);
    expect(useLanguageStore.getState().locale).toBe("ar");
  });

  it("UT-LANG-02 switches the language", () => {
    useLanguageStore.getState().setLocale("en");

    expect(useLanguageStore.getState().locale).toBe("en");
  });

  it("UT-LANG-03 writes the locale in a cookie", () => {
    useLanguageStore.getState().setLocale("en");

    expect(document.cookie).toContain("locale=en");
  });

  it("UT-LANG-04 persists the language in local storage", () => {
    useLanguageStore.getState().setLocale("en");

    const raw = window.localStorage.getItem(STORAGE_KEY);
    expect(raw).toBeTruthy();
    expect(JSON.parse(raw!).state.locale).toBe("en");
  });

  it("UT-LANG-05 restores the language after a rehydration", async () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ state: { locale: "en" }, version: 0 }),
    );

    await useLanguageStore.persist.rehydrate();

    expect(useLanguageStore.getState().locale).toBe("en");
  });

  it("UT-LANG-06 falls back to Arabic for an unknown stored locale", async () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ state: { locale: "fr" }, version: 0 }),
    );

    await useLanguageStore.persist.rehydrate();

    expect(useLanguageStore.getState().locale).toBe("ar");
  });

  it("UT-LANG-07 keeps the current locale when the stored state has no locale", async () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ state: {}, version: 0 }),
    );

    await useLanguageStore.persist.rehydrate();

    expect(useLanguageStore.getState().locale).toBe("ar");
  });

  it("UT-LANG-08 keeps a language chosen in this session when the stored one is unknown", async () => {
    useLanguageStore.getState().setLocale("en");
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ state: { locale: "fr" }, version: 0 }),
    );

    await useLanguageStore.persist.rehydrate();

    expect(useLanguageStore.getState().locale).toBe("en");
  });
});
