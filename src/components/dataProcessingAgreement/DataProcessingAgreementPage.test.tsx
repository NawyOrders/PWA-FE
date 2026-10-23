import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DataProcessingAgreementPage } from "./DataProcessingAgreementPage";
import { renderWithProviders } from "../../../tests/utils/render";

describe("DataProcessingAgreementPage", () => {
  it("UT-DPA-01 shows the agreement title", () => {
    const { t } = renderWithProviders(<DataProcessingAgreementPage />, {
      route: "/ar/dataProcessingAgreement",
    });

    expect(
      screen.getByRole("heading", { level: 1, name: t("aboutRestaurant.dataProcessing") }),
    ).toBeInTheDocument();
  });

  it("UT-DPA-02 shows the shared policy sections", () => {
    const { t } = renderWithProviders(<DataProcessingAgreementPage />, {
      route: "/ar/dataProcessingAgreement",
    });

    expect(
      screen.getByRole("heading", { name: t("privacyPolicy.securityTitle") }),
    ).toBeInTheDocument();
    expect(screen.getByText(t("privacyPolicy.sharing"))).toBeInTheDocument();
  });

  it("UT-DPA-03 links back to the about page", () => {
    const { t } = renderWithProviders(<DataProcessingAgreementPage />, {
      route: "/ar/dataProcessingAgreement",
    });

    expect(screen.getByRole("link", { name: t("common.back") })).toHaveAttribute(
      "href",
      "/ar/aboutRestaurant",
    );
  });
});
