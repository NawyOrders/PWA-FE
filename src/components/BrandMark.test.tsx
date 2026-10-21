import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BrandMark } from "./BrandMark";
import { renderWithProviders } from "../../tests/utils/render";
import { brand } from "@/lib/brand";

describe("BrandMark", () => {
  it("UT-BRAND-01 shows the name of the brand", () => {
    renderWithProviders(<BrandMark locale="ar" />);

    expect(screen.getByText(brand.name.ar)).toBeInTheDocument();
  });

  it("UT-BRAND-02 shows the English name in the English locale", () => {
    renderWithProviders(<BrandMark locale="en" />);

    expect(screen.getByText(brand.name.en)).toBeInTheDocument();
  });

  it("UT-BRAND-03 hides the name on request", () => {
    renderWithProviders(<BrandMark locale="ar" showName={false} />);

    expect(screen.queryByText(brand.name.ar)).not.toBeInTheDocument();
  });

  it("UT-BRAND-04 keeps the letter of the brand out of the reader", () => {
    renderWithProviders(<BrandMark locale="ar" showName={false} />);

    const mark = screen.getByText(brand.name.ar[0]);
    expect(mark).toHaveAttribute("aria-hidden", "true");
  });
});
