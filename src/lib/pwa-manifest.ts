import { brand } from "./brand";
import { getDictionary } from "./i18n";
import type { Locale } from "./i18n/types";
import { ICON_VERSION } from "./pwa-constants";
import { getPwaColors } from "./pwa-tokens";

export interface PwaManifestIcon {
  src: string;
  sizes: string;
  type: string;
  purpose: "any" | "maskable";
}

export interface PwaManifestShortcut {
  name: string;
  short_name?: string;
  url: string;
  icons: PwaManifestIcon[];
}

export interface PwaManifest {
  id: string;
  name: string;
  short_name: string;
  description: string;
  lang: Locale;
  dir: "rtl" | "ltr";
  start_url: string;
  scope: string;
  display: "standalone";
  display_override: ["standalone", "minimal-ui"];
  orientation: "any";
  theme_color: string;
  background_color: string;
  categories: string[];
  prefer_related_applications: false;
  icons: PwaManifestIcon[];
  shortcuts: PwaManifestShortcut[];
  screenshots?: never;
}

function icon(path: string, sizes: string, purpose: "any" | "maskable" = "any"): PwaManifestIcon {
  return {
    src: `${path}?v=${ICON_VERSION}`,
    sizes,
    type: "image/png",
    purpose,
  };
}

export function manifestHref(locale: Locale): string {
  return `/${locale}/manifest.webmanifest`;
}

export function buildManifest(locale: Locale): PwaManifest {
  const colors = getPwaColors();
  const dict = getDictionary(locale);
  const icons: PwaManifestIcon[] = [
    icon("/icons/icon-192.png", "192x192"),
    icon("/icons/icon-512.png", "512x512"),
    icon("/icons/icon-maskable-512.png", "512x512", "maskable"),
  ];

  return {
    id: "/",
    name: brand.name[locale],
    short_name: brand.shortName[locale],
    description: brand.description[locale],
    lang: locale,
    dir: locale === "ar" ? "rtl" : "ltr",
    start_url: `/${locale}?source=pwa`,
    scope: "/",
    display: "standalone",
    display_override: ["standalone", "minimal-ui"],
    orientation: "any",
    theme_color: colors.bg,
    background_color: colors.bgSplash,
    categories: ["food", "shopping"],
    prefer_related_applications: false,
    icons,
    shortcuts: [
      {
        name: dict.nav.menu,
        short_name: dict.nav.menu,
        url: `/${locale}/menu`,
        icons: [icon("/icons/shortcut-menu.png", "96x96")],
      },
      {
        name: dict.nav.cart,
        short_name: dict.nav.cart,
        url: `/${locale}/cart`,
        icons: [icon("/icons/shortcut-cart.png", "96x96")],
      },
      {
        name: dict.nav.orders,
        short_name: dict.nav.orders,
        url: `/${locale}/orders`,
        icons: [icon("/icons/shortcut-orders.png", "96x96")],
      },
    ],
  };
}
