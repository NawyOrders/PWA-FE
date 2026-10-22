import { describe, expect, it } from "vitest";
import { fc, fcOptions } from "../../../tests/utils/fc";
import { anchors, localizedHref } from "./anchors";
import { getDish, dishes } from "@/data/dishes";
import { locales } from "./config";

describe("property: the item anchors", () => {
  it("UT-SLUG-P1 resolves every dish of the catalogue", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...dishes.map((dish) => dish.id)),
        fc.constantFrom(...locales),
        (id, locale) => {
          const href = localizedHref(locale, anchors.item(id));
          const slug = decodeURIComponent(href.slice(href.lastIndexOf("/") + 1));

          expect(getDish(slug)?.id).toBe(id);
        },
      ),
      fcOptions,
    );
  });

  it("UT-SLUG-P2 keeps the route of a dish stable in both locales", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...dishes.map((dish) => dish.id)),
        (id) => {
          const arabic = localizedHref("ar", anchors.item(id));
          const english = localizedHref("en", anchors.item(id));

          expect(arabic.replace("/ar", "")).toBe(english.replace("/en", ""));
        },
      ),
      fcOptions,
    );
  });

  it("UT-SLUG-P3 always prefixes the path with the locale", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...Object.values(anchors).filter((value) => typeof value === "string")),
        fc.constantFrom(...locales),
        (path, locale) => {
          const href = localizedHref(locale, path);

          expect(href.startsWith(`/${locale}`)).toBe(true);
        },
      ),
      fcOptions,
    );
  });

  it("UT-SLUG-P4 keeps an unknown slug unknown", () => {
    fc.assert(
      fc.property(
        fc.stringMatching(/^[a-z0-9-]{1,20}$/).filter((slug) => !getDish(slug)),
        (slug) => {
          expect(getDish(slug)).toBeUndefined();
        },
      ),
      fcOptions,
    );
  });
});
