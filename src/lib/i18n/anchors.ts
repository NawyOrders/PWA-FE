import type { Locale } from "./config";

export const anchors = {
  home: "/",
  delivery: "/delivery",
  address: "/address",
  restLocation: "/restLocation",
  payment: "/payment",
  confirmation: "/payConfirmation",
  tracking: "/tracking",
  offline: "/offline",
  item: (slug: string) => `/item/${encodeURIComponent(slug)}`,
} as const;

export function localizedHref(locale: Locale, path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return normalizedPath === "/" ? `/${locale}` : `/${locale}${normalizedPath}`;
}
