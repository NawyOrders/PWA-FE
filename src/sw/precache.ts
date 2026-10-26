import { brand } from "../lib/brand";
import { ICON_VERSION } from "../lib/pwa-constants";

export const precacheUrls: string[] = Array.from(
  new Set([
    brand.logo.ar,
    brand.logo.en,
    brand.logo.mark,
    `/icons/icon-192.png?v=${ICON_VERSION}`,
  ]),
);
