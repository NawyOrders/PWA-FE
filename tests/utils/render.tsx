import type { ReactElement, ReactNode } from "react";
import { render, type RenderOptions, type RenderResult } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { getDictionary, interpolate } from "@/lib/i18n";
import { I18nProvider as LegacyI18nProvider } from "@/lib/i18n";
import { I18nProvider } from "@/lib/i18n/DictionaryProvider";
import type { Dictionary, Locale } from "@/lib/i18n/types";

export type { Locale };
import { setRoute } from "../mocks/router";
import { advanceTimers } from "./timers";
import { applyStoreSeeds, type StoreSeed } from "./stores";

export const LOCALES = [["ar", "rtl"], ["en", "ltr"]] as const;

export type LocaleDirection = (typeof LOCALES)[number][1];

export interface RenderWithProvidersOptions extends Omit<RenderOptions, "wrapper"> {
  locale?: Locale;
  stores?: StoreSeed;
  route?: string;
  /**
   * Extra `user-event` setup options. `advanceTimers` is always injected, so
   * `user-event` keeps working under fake timers.
   */
  userOptions?: Partial<Parameters<typeof userEvent.setup>[0]>;
}

/** Resolves a dotted path inside the nested dictionary, e.g. `cart.couponSuccess`. */
export function resolveDictionaryValue(
  dict: Dictionary,
  path: string,
): string | undefined {
  const value = path
    .split(".")
    .reduce<unknown>((node, key) => {
      if (node && typeof node === "object" && key in (node as Record<string, unknown>)) {
        return (node as Record<string, unknown>)[key];
      }
      return undefined;
    }, dict);
  return typeof value === "string" ? value : undefined;
}

/**
 * Renders a component with the app providers (i18n + stores) and returns the
 * Testing Library result plus a `t()` helper bound to the active dictionary.
 */
export function renderWithProviders(
  ui: ReactElement,
  {
    locale = "ar",
    stores = {},
    route = "/",
    userOptions = {},
    ...options
  }: RenderWithProvidersOptions = {},
): RenderResult & {
  user: ReturnType<typeof userEvent.setup>;
  dir: "rtl" | "ltr";
  locale: Locale;
  dict: Dictionary;
  t: (key: string, params?: Record<string, string | number>) => string;
} {
  const dir: "rtl" | "ltr" = locale === "ar" ? "rtl" : "ltr";
  document.documentElement.lang = locale;
  document.documentElement.dir = dir;
  setRoute(route);

  applyStoreSeeds(stores);

  const dict = getDictionary(locale);

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <LegacyI18nProvider locale={locale}>
        <I18nProvider locale={locale} dict={dict}>
          {children}
        </I18nProvider>
      </LegacyI18nProvider>
    );
  }

  const user = userEvent.setup({ advanceTimers, ...userOptions });
  const result = render(ui, { wrapper: Wrapper, ...options });

  return {
    user,
    ...result,
    dir,
    locale,
    dict,
    t: (key: string, params?: Record<string, string | number>) =>
      interpolate(resolveDictionaryValue(dict, key) ?? key, params),
  };
}
