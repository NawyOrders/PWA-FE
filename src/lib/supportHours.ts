import { brand, type SupportHours } from "./brand";
import type { Locale } from "./i18n/types";

export interface SupportStatus {
  open: boolean;
  // Next opening time label (localized) when closed, e.g. "10:00 ص".
  opensAtLabel: string | null;
}

function formatTime(minutes: number, locale: Locale): string {
  const hours24 = Math.floor(minutes / 60) % 24;
  const mins = minutes % 60;
  const suffix = hours24 < 12 ? (locale === "ar" ? "ص" : "AM") : locale === "ar" ? "م" : "PM";
  let hours12 = hours24 % 12;
  if (hours12 === 0) hours12 = 12;
  const hh = String(hours12);
  const mm = String(mins).padStart(2, "0");
  return `${hh}:${mm} ${suffix}`;
}

export function getSupportStatus(hours: SupportHours, locale: Locale, now = new Date()): SupportStatus {
  const day = now.getDay();
  const minutes = now.getHours() * 60 + now.getMinutes();
  const isOpenDay = hours.days.includes(day);
  const open = isOpenDay && minutes >= hours.opensAt && minutes < hours.closesAt;
  return {
    open,
    opensAtLabel: open ? null : formatTime(hours.opensAt, locale),
  };
}

export function getSupportStatusNow(locale: Locale, now = new Date()): SupportStatus {
  return getSupportStatus(brand.support.hours, locale, now);
}
