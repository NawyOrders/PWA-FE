import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AboutRestaurantPage } from "./AboutRestaurantPage";
import { renderWithProviders } from "../../../tests/utils/render";

describe("AboutRestaurantPage", () => {
  it("UT-ABOUT-01 shows the title, the brand and the tagline", () => {
    const { t } = renderWithProviders(<AboutRestaurantPage />, { route: "/ar/aboutRestaurant" });

    expect(screen.getByRole("heading", { level: 1, name: t("aboutRestaurant.title") })).toBeInTheDocument();
    expect(screen.getByText(t("aboutRestaurant.brandName"))).toBeInTheDocument();
    expect(screen.getByText(t("aboutRestaurant.tagline"))).toBeInTheDocument();
  });

  it("UT-ABOUT-02 links to the three policy pages", () => {
    const { t } = renderWithProviders(<AboutRestaurantPage />, { route: "/ar/aboutRestaurant" });

    expect(screen.getByRole("link", { name: t("aboutRestaurant.privacy") })).toHaveAttribute(
      "href",
      "/ar/privacyPolicy",
    );
    expect(screen.getByRole("link", { name: t("aboutRestaurant.terms") })).toHaveAttribute(
      "href",
      "/ar/termsAndConditions",
    );
    expect(screen.getByRole("link", { name: t("aboutRestaurant.dataProcessing") })).toHaveAttribute(
      "href",
      "/ar/dataProcessingAgreement",
    );
  });

  it("UT-ABOUT-03 links to the two platform pages", () => {
    renderWithProviders(<AboutRestaurantPage />, { route: "/ar/aboutRestaurant" });

    expect(screen.getByRole("link", { name: /Nawy Orders/ })).toHaveAttribute(
      "href",
      "/ar/aboutNawyOrders",
    );
    expect(screen.getByRole("link", { name: /Space Tech/ })).toHaveAttribute(
      "href",
      "/ar/aboutSpaceTech",
    );
  });

  it("UT-ABOUT-04 shows the version and the copyright", () => {
    const { t } = renderWithProviders(<AboutRestaurantPage />, { route: "/ar/aboutRestaurant" });

    expect(screen.getByText(t("aboutRestaurant.version", { version: "1.0.0" }))).toBeInTheDocument();
    expect(screen.getByText(/2026/)).toBeInTheDocument();
  });

  it("UT-ABOUT-05 links back to the profile", () => {
    const { t } = renderWithProviders(<AboutRestaurantPage />, { route: "/ar/aboutRestaurant" });

    expect(screen.getByRole("link", { name: t("common.back") })).toHaveAttribute(
      "href",
      "/ar/profile",
    );
  });
});
