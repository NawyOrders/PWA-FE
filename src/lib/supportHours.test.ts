import { describe, expect, it } from "vitest";
import { getSupportStatus, getSupportStatusNow } from "./supportHours";
import { brand, type SupportHours } from "./brand";

const hours: SupportHours = {
  days: [0, 1, 2, 3, 4, 5, 6],
  opensAt: 10 * 60,
  closesAt: 23 * 60,
};

// 2026-10-20 is a Tuesday in Cairo (day 2).
const TUESDAY_10_00 = new Date("2026-10-20T10:00:00+03:00");
const TUESDAY_03_00 = new Date("2026-10-20T03:00:00+03:00");
const TUESDAY_22_59 = new Date("2026-10-20T22:59:00+03:00");
const TUESDAY_23_00 = new Date("2026-10-20T23:00:00+03:00");
const TUESDAY_12_00 = new Date("2026-10-20T12:00:00+03:00");
const TUESDAY_00_00 = new Date("2026-10-20T00:00:00+03:00");

describe("getSupportStatus", () => {
  it("UT-HOURS-01 is open at 10:00 when the opening time is inclusive", () => {
    expect(getSupportStatus(hours, "ar", TUESDAY_10_00).open).toBe(true);
  });

  it("UT-HOURS-02 is closed at 03:00", () => {
    expect(getSupportStatus(hours, "ar", TUESDAY_03_00).open).toBe(false);
  });

  it("UT-HOURS-03 is closed at the closing time because the end is exclusive", () => {
    expect(getSupportStatus(hours, "ar", TUESDAY_23_00).open).toBe(false);
  });

  it("UT-HOURS-04 is open one minute before the closing time", () => {
    expect(getSupportStatus(hours, "ar", TUESDAY_22_59).open).toBe(true);
  });

  it("UT-HOURS-05 is closed on a day that is not supported", () => {
    const weekendsOnly: SupportHours = { ...hours, days: [5, 6] };
    expect(getSupportStatus(weekendsOnly, "ar", TUESDAY_10_00).open).toBe(false);
  });

  it("UT-HOURS-06 returns the Arabic opening label when closed", () => {
    expect(getSupportStatus(hours, "ar", TUESDAY_03_00).opensAtLabel).toBe("10:00 ص");
  });

  it("UT-HOURS-07 returns the English opening label when closed", () => {
    expect(getSupportStatus(hours, "en", TUESDAY_03_00).opensAtLabel).toBe("10:00 AM");
  });

  it("UT-HOURS-08 returns no opening label while open", () => {
    expect(getSupportStatus(hours, "ar", TUESDAY_10_00).opensAtLabel).toBeNull();
  });

  it("UT-HOURS-09 formats noon with the afternoon marker", () => {
    const noon: SupportHours = { ...hours, opensAt: 12 * 60 };
    expect(getSupportStatus(noon, "ar", TUESDAY_12_00).opensAtLabel).toBeNull();
    expect(getSupportStatus({ ...noon, days: [] }, "ar", TUESDAY_12_00).opensAtLabel).toBe("12:00 م");
    expect(getSupportStatus({ ...noon, days: [] }, "en", TUESDAY_12_00).opensAtLabel).toBe("12:00 PM");
  });

  it("UT-HOURS-10 formats midnight as 12 AM", () => {
    const midnight: SupportHours = { ...hours, opensAt: 0, days: [] };
    expect(getSupportStatus(midnight, "ar", TUESDAY_00_00).opensAtLabel).toBe("12:00 ص");
    expect(getSupportStatus(midnight, "en", TUESDAY_00_00).opensAtLabel).toBe("12:00 AM");
  });

  it("UT-HOURS-11 pads the minutes with a leading zero", () => {
    const nine: SupportHours = { ...hours, opensAt: 9 * 60 + 5, days: [] };
    expect(getSupportStatus(nine, "en", TUESDAY_03_00).opensAtLabel).toBe("9:05 AM");
  });

  it("UT-HOURS-12 reads the hour in the Cairo time zone", () => {
    expect(getSupportStatus(hours, "en", TUESDAY_10_00).open).toBe(true);
    expect(new Date(TUESDAY_10_00).getHours()).toBe(10);
  });

  it("UT-HOURS-13 handles the Egypt daylight saving change with the tz database", () => {
    // Egypt leaves summer time at the end of October 2026: on 2026-10-30 Cairo
    // is UTC+2, so the same instant that reads 10:00 in the old offset is 09:00
    // in Cairo and the support is still closed. Hardcoded offsets would fail.
    const lastSummerDay = new Date("2026-10-29T10:00:00+03:00");
    const firstWinterDay = new Date("2026-10-30T10:00:00+03:00");
    const afterChange = new Date("2026-11-01T10:00:00+02:00");

    expect(getSupportStatus(hours, "en", lastSummerDay).open).toBe(true);
    expect(getSupportStatus(hours, "en", firstWinterDay).open).toBe(false);
    expect(getSupportStatus(hours, "en", afterChange).open).toBe(true);
  });
});

describe("getSupportStatusNow", () => {
  it("UT-HOURS-14 uses the brand support hours", () => {
    const status = getSupportStatusNow("ar", TUESDAY_10_00);
    expect(status.open).toBe(true);
    expect(status.opensAtLabel).toBeNull();
  });

  it("UT-HOURS-15 reads the brand hours from the config", () => {
    expect(brand.support.hours.opensAt).toBe(10 * 60);
    expect(brand.support.hours.closesAt).toBe(23 * 60);
    expect(brand.support.hours.days).toEqual([0, 1, 2, 3, 4, 5, 6]);
  });
});
