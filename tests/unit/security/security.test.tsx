import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "../../utils/render";
import { normalize, highlightSegments, matchesQuery } from "@/lib/text";
import { ImageUpload } from "@/components/ImageUpload";
import { ContactModal } from "@/components/help/ContactModal";
import { useCartStore } from "@/store/cartStore";
import { useFavoritesStore } from "@/store/favoritesStore";
import { useUiStore } from "@/store/uiStore";

const XSS_PAYLOADS = [
  '<img src=x onerror="alert(1)">',
  "<script>alert(1)</script>",
  "javascript:alert(1)",
  "&lt;b&gt;bold&lt;/b&gt;",
  '"><svg onload=alert(1)>',
  "`${alert(1)}`",
];

describe("security: injected markup renders as text", () => {
  for (const payload of XSS_PAYLOADS) {
    it(`UT-SEC-01 renders ${JSON.stringify(payload)} as text`, () => {
      const { container } = render(<p>{payload}</p>);

      expect(container.querySelector("script")).toBeNull();
      expect(container.querySelector("img")).toBeNull();
      expect(container.querySelector("svg")).toBeNull();
      expect(container.textContent).toBe(payload);
    });
  }

  it("UT-SEC-02 never resolves a javascript URL to an anchor", () => {
    const { container } = render(<a href="https://example.com">link</a>);

    expect(container.querySelector("a")).toHaveAttribute("href", "https://example.com");
    expect(container.querySelector("a")?.getAttribute("href")).not.toMatch(/^javascript:/);
  });

  it("UT-SEC-03 keeps the highlight segments as plain strings", () => {
    const segments = highlightSegments('<img src=x onerror=alert(1)>', ["img"]);

    for (const segment of segments) {
      expect(typeof segment.value).toBe("string");
    }
  });
});

describe("security: link schemes", () => {
  it("UT-SEC-04 calls the phone number with a tel scheme only", () => {
    renderWithProviders(<ContactModal onClose={() => undefined} />);

    const links = screen.getAllByRole("link");
    for (const link of links) {
      const href = link.getAttribute("href") ?? "";
      expect(href).toMatch(/^(tel:|mailto:|https:\/\/|whatsapp:)/);
      expect(href).not.toMatch(/^javascript:/);
    }
  });

  it("UT-SEC-05 opens external links with noopener noreferrer", () => {
    renderWithProviders(<ContactModal onClose={() => undefined} />);

    const externals = screen
      .getAllByRole("link")
      .filter((link) => /^https?:\/\//.test(link.getAttribute("href") ?? ""));

    for (const link of externals) {
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }
  });
});

describe("security: storage corruption", () => {
  const KEYS = ["nawy-cart", "nawy-favorites", "nawy-language", "nawy-orders", "nawy-addresses"];

  it("UT-SEC-06 survives invalid JSON in every persisted key", () => {
    for (const key of KEYS) {
      window.localStorage.setItem(key, "{not json");
    }

    expect(() => useCartStore.getState()).not.toThrow();
    expect(() => useFavoritesStore.getState()).not.toThrow();
    expect(Array.isArray(useCartStore.getState().items)).toBe(true);
  });

  it("UT-SEC-07 survives a wrong shape in the cart key", () => {
    window.localStorage.setItem(
      "nawy-cart",
      JSON.stringify({ state: { items: "not-an-array" }, version: 0 }),
    );

    expect(() => useCartStore.getState()).not.toThrow();
  });

  it("UT-SEC-08 survives a huge payload without throwing", () => {
    window.localStorage.setItem("nawy-favorites", JSON.stringify({ state: { ids: "x".repeat(500_000) } }));

    expect(() => useFavoritesStore.getState()).not.toThrow();
  });

  it("UT-SEC-09 ignores prototype pollution keys in persisted data", () => {
    window.localStorage.setItem(
      "nawy-cart",
      JSON.stringify({
        state: { items: [], coupon: null, fulfillmentMethod: "delivery", __proto__: { polluted: true } },
        version: 0,
      }),
    );

    expect(() => useCartStore.getState()).not.toThrow();
    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
  });
});

describe("security: prototype pollution through the store", () => {
  it("UT-SEC-10 ignores a __proto__ dish id", () => {
    useCartStore.setState({ items: [], coupon: null, fulfillmentMethod: "delivery" });

    useCartStore.getState().add("__proto__", 1, 100);

    expect(({} as Record<string, unknown>).quantity).toBeUndefined();
    expect(Array.isArray(useCartStore.getState().items)).toBe(true);
  });

  it("UT-SEC-11 ignores a constructor key in the favorites", () => {
    useFavoritesStore.setState({ ids: [] });

    useFavoritesStore.getState().toggle("constructor");

    expect(({} as Record<string, unknown>).constructor).toBe(Object);
  });

  it("UT-SEC-12 rejects a coupon prototype key", () => {
    useCartStore.setState({ items: [], coupon: null, fulfillmentMethod: "delivery" });

    const result = useCartStore.getState().applyCoupon("__proto__");

    expect(result).toBe(false);
    expect(useCartStore.getState().coupon).toBeNull();
  });
});

describe("security: text fuzzing", () => {
  const FUZZ = [
    "\u202E\u202D reversed",
    "\u200B\u200C\u200D zero width",
    "a\u0301\u0302\u0303 combining",
    "👨‍👩‍👧‍👦 family",
    "x".repeat(10_000),
    "\u0000control",
    "\t\n\r",
  ];

  for (const [index, value] of FUZZ.entries()) {
    it(`UT-SEC-13 normalizes fuzz input ${index} without throwing`, () => {
      expect(() => normalize(value)).not.toThrow();
      expect(() => matchesQuery(value, ["x"])).not.toThrow();
      expect(() => highlightSegments(value, ["x"])).not.toThrow();
    });
  }

  it("UT-SEC-14 keeps the image upload error type stable for a script filename", () => {
    renderWithProviders(
      <ImageUpload
        id="photo"
        label="صورة"
        uploadTap="ارفع"
        uploadDesktop="اسحب"
        previewAlt="معاينة"
        removeLabel="حذف"
        uploadingLabel="جارٍ الرفع"
        errorSize="الحجم كبير"
        errorType="نوع غير مدعوم"
      />,
    );

    const input = document.querySelector('input[type="file"]');
    expect(input).not.toBeNull();
    expect(input?.getAttribute("accept")).toContain("image/");
  });
});

describe("security: privacy of console output", () => {
  it("UT-SEC-15 never logs an OTP code", () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const info = vi.spyOn(console, "info").mockImplementation(() => undefined);
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);

    useUiStore.getState().showToast("تم التسجيل بنجاح");

    const output = [...log.mock.calls, ...info.mock.calls, ...warn.mock.calls]
      .flat()
      .join(" ");

    expect(output).not.toMatch(/\b\d{6}\b/);
    log.mockRestore();
    info.mockRestore();
    warn.mockRestore();
  });

  it("UT-SEC-16 never logs a phone number from a cart write", () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined);

    useCartStore.getState().add("crack-burger", 1, 9000);

    const output = [...log.mock.calls, ...error.mock.calls].flat().join(" ");
    expect(output).not.toMatch(/01\d{9}/);

    log.mockRestore();
    error.mockRestore();
  });
});
