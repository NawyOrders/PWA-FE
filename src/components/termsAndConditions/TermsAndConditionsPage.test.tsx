import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TermsAndConditionsPage } from "./TermsAndConditionsPage";
import { renderWithProviders } from "../../../tests/utils/render";

describe("TermsAndConditionsPage", () => {
  it("UT-TERMS-01 shows the terms title", () => {
    const { t } = renderWithProviders(<TermsAndConditionsPage />, {
      route: "/ar/termsAndConditions",
    });

    expect(
      screen.getByRole("heading", { level: 1, name: t("aboutRestaurant.terms") }),
    ).toBeInTheDocument();
  });

  it("UT-TERMS-02 shows the shared policy sections", () => {
    const { t } = renderWithProviders(<TermsAndConditionsPage />, {
      route: "/ar/termsAndConditions",
    });

    expect(
      screen.getByRole("heading", { name: t("privacyPolicy.introductionTitle") }),
    ).toBeInTheDocument();
    expect(screen.getByText(t("privacyPolicy.collection"))).toBeInTheDocument();
  });

  it("UT-TERMS-03 links back to the about page", () => {
    const { t } = renderWithProviders(<TermsAndConditionsPage />, {
      route: "/ar/termsAndConditions",
    });

    expect(screen.getByRole("link", { name: t("common.back") })).toHaveAttribute(
      "href",
      "/ar/aboutRestaurant",
    );
  });
});
