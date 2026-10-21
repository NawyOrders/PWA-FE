import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Footer } from "./Footer";
import { renderWithProviders } from "../../tests/utils/render";
import { brand } from "@/lib/brand";

function renderFooter(locale: "ar" | "en" = "ar") {
  return renderWithProviders(<Footer />, { locale });
}

describe("Footer", () => {
  it("UT-FOOTER-01 shows the quick links", () => {
    const { t } = renderFooter();

    const footer = screen.getByRole("contentinfo");
    expect(within(footer).getByRole("link", { name: t("nav.menu") })).toHaveAttribute(
      "href",
      "/ar/menu",
    );
    expect(within(footer).getByRole("link", { name: t("nav.orders") })).toHaveAttribute(
      "href",
      "/ar/orders",
    );
  });

  it("UT-FOOTER-02 uses the English links in the English locale", () => {
    const { t } = renderFooter("en");

    const footer = screen.getByRole("contentinfo");
    expect(within(footer).getByRole("link", { name: t("nav.menu") })).toHaveAttribute(
      "href",
      "/en/menu",
    );
  });

  it("UT-FOOTER-03 shows the social channels with a name", () => {
    const { t } = renderFooter();

    expect(screen.getByRole("link", { name: t("drawer.instagram") })).toHaveAttribute(
      "target",
      "_blank",
    );
  });

  it("UT-FOOTER-04 shows the domain of the brand", () => {
    renderFooter();

    expect(screen.getByText(brand.domainTld)).toBeInTheDocument();
  });

  it("UT-FOOTER-05 shows the year and the rights", () => {
    const { t } = renderFooter();

    const line = screen.getByText(new RegExp(`©\\s*${new Date().getFullYear()}`));
    expect(line).toHaveTextContent(t("footer.rights"));
    expect(line).toHaveTextContent(brand.name.ar);
  });

  it("UT-FOOTER-06 shows the tagline", () => {
    const { t } = renderFooter();

    expect(screen.getByText(t("footer.tagline"))).toBeInTheDocument();
  });
});
