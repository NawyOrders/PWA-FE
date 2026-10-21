import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { formatPrice } from "@/lib/format";
import { renderWithProviders, LOCALES } from "../utils/render";
import { makeDish } from "../factories";

describe("UT-SMOKE-01 test harness", () => {
  it("runs in jsdom with the Africa/Cairo time zone", () => {
    expect(typeof window).toBe("object");
    expect(new Intl.DateTimeFormat("en-US", { timeZone: "Africa/Cairo" }).format(new Date()))
      .toContain("202");
  });

  it("freezes the clock at the fixed Cairo time", () => {
    expect(new Date().toISOString()).toBe("2026-10-20T07:00:00.000Z");
  });

  it("exposes the RTL/LTR locale matrix", () => {
    expect(LOCALES).toEqual([
      ["ar", "rtl"],
      ["en", "ltr"],
    ]);
  });

  it("renders a component with the providers", () => {
    renderWithProviders(<p>hello</p>, { locale: "en" });
    expect(screen.getByText("hello")).toBeInTheDocument();
  });

  it("formats a price with the shared helper", () => {
    expect(formatPrice(12000, "ar")).toBe("120 جـ");
  });

  it("builds valid factories", () => {
    expect(makeDish().price).toBe(12000);
  });

  it("mounts and unmounts without leaking", () => {
    const { unmount } = render(<span>x</span>);
    unmount();
    expect(screen.queryByText("x")).toBeNull();
  });

  it("registers the axe matcher", async () => {
    const { container } = render(
      <button type="button" aria-label="ترجمة">
        ترجمة
      </button>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
