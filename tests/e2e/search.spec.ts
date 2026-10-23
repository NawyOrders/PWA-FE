import { test, expect } from "@playwright/test";

test.describe("bilingual search @search", () => {
  test("TC-SEARCH-01 finds Arabic dishes from an English query on the Arabic site", async ({ page }) => {
    await page.goto("/ar", { waitUntil: "networkidle" });
    await page.getByRole("textbox").fill("shawarma");

    await expect(page.locator('a[href="/ar/item/chicken-shawarma"]').first()).toBeVisible();
    await expect(page.locator('a[href="/ar/item/crack-burger"]')).toHaveCount(0);
  });

  test("TC-SEARCH-02 finds English dishes from an Arabic query on the English site", async ({ page }) => {
    await page.goto("/en", { waitUntil: "networkidle" });
    await page.getByRole("textbox").fill("شاورما");

    await expect(page.locator('a[href="/en/item/chicken-shawarma"]').first()).toBeVisible();
    await expect(page.locator('a[href="/en/item/crack-burger"]')).toHaveCount(0);
  });

  test("TC-SEARCH-03 normalizes Arabic diacritics and tatweel", async ({ page }) => {
    await page.goto("/ar", { waitUntil: "networkidle" });
    await page.getByRole("textbox").fill("طـــازجـــة");

    await expect(page.locator('a[href="/ar/item/cheese-pizza"]').first()).toBeVisible();
    await expect(page.locator('a[href="/ar/item/crack-burger"]')).toHaveCount(0);
  });

  test("TC-SEARCH-04 shows the empty state for an unknown query", async ({ page }) => {
    await page.goto("/ar", { waitUntil: "networkidle" });
    const search = page.getByRole("textbox");
    await search.fill("zzzz-no-such-dish");

    await expect(page.getByText("لا توجد نتائج").first()).toBeVisible();
  });
});


