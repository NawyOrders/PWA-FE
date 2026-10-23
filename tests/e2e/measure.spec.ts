import { test, expect } from "@playwright/test";
import { writeFileSync, mkdirSync } from "node:fs";
import { measurePage, type PageMeasurement } from "./helpers/measure";

const ROUTES = [
  "",
  "/menu",
  "/favorites",
  "/cart",
  "/orders",
  "/profile",
  "/profile/personal-info",
  "/profile/addresses",
  "/profile/help",
  "/profile/help/faq",
  "/profile/help/feedback",
  "/item/crack-burger",
  "/login",
  "/splash",
];

const LOCALES = ["ar", "en"] as const;
const WIDTHS = [
  { width: 1366, height: 768 },
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
];
const results: PageMeasurement[] = [];

test.describe("desktop measurements", () => {
  for (const locale of LOCALES) {
    for (const route of ROUTES) {
      test(`MEASURE ${locale}${route || "/"}`, async ({ page }) => {
        const errors: string[] = [];
        page.on("console", (message) => {
          if (message.type() === "error") errors.push(message.text());
        });

        const path = `/${locale}${route}`;
        const response = await page.goto(path, { waitUntil: "networkidle" });
        expect(response?.status(), `status for ${path}`).toBeLessThan(400);

        for (const viewport of WIDTHS) {
          await page.setViewportSize(viewport);
          const measurement = await measurePage(page, path);
          results.push(measurement);
          writeFileSync(
            "reports/measurements.json",
            JSON.stringify(results, null, 2),
          );

          expect(errors, `console errors on ${path}`).toEqual([]);
          expect(measurement.h1.length, `one h1 on ${path} at ${viewport.width}`).toBeGreaterThanOrEqual(1);
          expect(measurement.imagesWithoutAlt, `alt attributes on ${path}`).toBe(0);
          expect(measurement.horizontalOverflow, `no horizontal overflow on ${path} at ${viewport.width}`).toBe(0);
        }
      });
    }
  }
});

test.afterAll(() => {
  mkdirSync("reports", { recursive: true });
  writeFileSync("reports/measurements.json", JSON.stringify(results, null, 2));
});
