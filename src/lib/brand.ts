import type { LocalizedText } from "./i18n/types";

export interface SupportHours {
  // 0 = Sunday ... 6 = Saturday. Minutes from local midnight.
  days: number[];
  opensAt: number;
  closesAt: number;
}

export interface SupportContact {
  phone: string;
  phoneDisplay: string;
  email: string;
  whatsapp: string;
  hours: SupportHours;
}

export interface BrandLogo {
  ar: string;
  en: string;
  mark: string;
  alt: LocalizedText;
}

export interface Brand {
  name: LocalizedText;
  shortName: LocalizedText;
  tagline: LocalizedText;
  description: LocalizedText;
  logo: BrandLogo;
  domain: string;
  domainBrand: string;
  domainTld: string;
  version: string;
  support: SupportContact;
  social: {
    whatsapp: string;
    instagram: string;
    facebook: string;
    tiktok: string;
  };
}

export const brand: Brand = {
  name: { ar: "كرم الشام", en: "Karam El Sham" },
  shortName: { ar: "كرم الشام", en: "Karam Sham" },
  tagline: { ar: "مأكولات شامية", en: "Shami food" },
  description: {
    ar: "اطلب أشهى الأكلات الشامية من كرم الشام، توصيل سريع إلى باب بيتك في القاهرة.",
    en: "Order the finest Shami dishes from Karam El Sham, delivered fast to your door in Cairo.",
  },
  logo: {
    ar: "/icons/logo.png",
    en: "/icons/logo.png",
    mark: "/icons/logo.png",
    alt: { ar: "شعار كرم الشام", en: "Karam El Sham logo" },
  },
  domain: "nawyorders.com",
  domainBrand: "nawyorders",
  domainTld: ".com",
  version: "1.0.0",
  support: {
    // Demo placeholders — never real numbers (CLAUDE.md rule 9).
    phone: "+201000000000",
    phoneDisplay: "+20 100 000 0000",
    email: "support@nawyorders.com",
    whatsapp: "https://wa.me/201000000000",
    hours: {
      days: [0, 1, 2, 3, 4, 5, 6],
      opensAt: 10 * 60,
      closesAt: 23 * 60,
    },
  },
  social: {
    whatsapp: "https://wa.me/201000000000",
    instagram: "https://instagram.com/nawyorders",
    facebook: "https://facebook.com/nawyorders",
    tiktok: "https://tiktok.com/@nawyorders",
  },
};
