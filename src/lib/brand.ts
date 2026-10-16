import type { LocalizedText } from "./i18n/types";

export interface Brand {
  name: LocalizedText;
  domain: string;
  domainBrand: string;
  domainTld: string;
  version: string;
  social: {
    whatsapp: string;
    instagram: string;
    facebook: string;
    tiktok: string;
  };
}

export const brand: Brand = {
  name: { ar: "كرم الشام", en: "Karam El Sham" },
  domain: "nawyorders.com",
  domainBrand: "nawyorders",
  domainTld: ".com",
  version: "1.0.0",
  social: {
    whatsapp: "https://wa.me/201000000000",
    instagram: "https://instagram.com/nawyorders",
    facebook: "https://facebook.com/nawyorders",
    tiktok: "https://tiktok.com/@nawyorders",
  },
};
