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

export interface Brand {
  name: LocalizedText;
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
