import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AboutSpaceTechPage } from "./AboutSpaceTechPage";
import { renderWithProviders } from "../../../tests/utils/render";

describe("AboutSpaceTechPage", () => {
  it("UT-SPACE-01 shows the company name and the tagline", () => {
    const { t } = renderWithProviders(<AboutSpaceTechPage />, { route: "/ar/aboutSpaceTech" });

    expect(
      screen.getByRole("heading", { level: 1, name: t("aboutSpaceTech.name") }),
    ).toBeInTheDocument();
    expect(screen.getByText(t("aboutSpaceTech.tagline"))).toBeInTheDocument();
  });

  it("UT-SPACE-02 shows the three services", () => {
    const { t } = renderWithProviders(<AboutSpaceTechPage />, { route: "/ar/aboutSpaceTech" });

    expect(
      screen.getByRole("heading", { name: t("aboutSpaceTech.webDevelopment") }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: t("aboutSpaceTech.appDevelopment") }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: t("aboutSpaceTech.saasPlatforms") }),
    ).toBeInTheDocument();
  });

  it("UT-SPACE-03 links to the website and to the email", () => {
    const { t } = renderWithProviders(<AboutSpaceTechPage />, { route: "/ar/aboutSpaceTech" });

    expect(
      screen.getByRole("link", { name: new RegExp(t("aboutSpaceTech.websiteValue")) }),
    ).toHaveAttribute("href", "https://www.spacetech.com");
    expect(
      screen.getByRole("link", { name: new RegExp(t("aboutSpaceTech.emailValue")) }),
    ).toHaveAttribute("href", "mailto:info@spacetech.com");
  });

  it("UT-SPACE-04 keeps the linked in row without a link", () => {
    const { t } = renderWithProviders(<AboutSpaceTechPage />, { route: "/ar/aboutSpaceTech" });

    expect(screen.getByText(t("aboutSpaceTech.linkedinValue"))).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /spacetech-eg/ })).not.toBeInTheDocument();
  });

  it("UT-SPACE-05 links back to the about page", () => {
    const { t } = renderWithProviders(<AboutSpaceTechPage />, { route: "/ar/aboutSpaceTech" });

    expect(screen.getByRole("link", { name: t("common.back") })).toHaveAttribute(
      "href",
      "/ar/aboutRestaurant",
    );
  });
});
