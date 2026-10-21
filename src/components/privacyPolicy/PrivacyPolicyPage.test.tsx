import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PrivacyPolicyPage } from "./PrivacyPolicyPage";
import { renderWithProviders } from "../../../tests/utils/render";

describe("PrivacyPolicyPage", () => {
  it("UT-POLICY-01 shows the title and the five sections", () => {
    const { t } = renderWithProviders(<PrivacyPolicyPage />, { route: "/ar/privacyPolicy" });

    expect(
      screen.getByRole("heading", { level: 1, name: t("privacyPolicy.title") }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: t("privacyPolicy.introductionTitle") })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: t("privacyPolicy.collectionTitle") })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: t("privacyPolicy.useTitle") })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: t("privacyPolicy.sharingTitle") })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: t("privacyPolicy.securityTitle") })).toBeInTheDocument();
  });

  it("UT-POLICY-02 shows the body of every section", () => {
    const { t } = renderWithProviders(<PrivacyPolicyPage />, { route: "/ar/privacyPolicy" });

    expect(screen.getByText(t("privacyPolicy.introduction"))).toBeInTheDocument();
    expect(screen.getByText(t("privacyPolicy.security"))).toBeInTheDocument();
  });

  it("UT-POLICY-03 shows the update date", () => {
    const { t } = renderWithProviders(<PrivacyPolicyPage />, { route: "/ar/privacyPolicy" });

    expect(
      screen.getByText(t("privacyPolicy.updatedAt", { date: t("privacyPolicy.updatedDate") })),
    ).toBeInTheDocument();
  });

  it("UT-POLICY-04 links back to the about page", () => {
    const { t } = renderWithProviders(<PrivacyPolicyPage />, { route: "/ar/privacyPolicy" });

    expect(screen.getByRole("link", { name: t("common.back") })).toHaveAttribute(
      "href",
      "/ar/aboutRestaurant",
    );
  });

  it("UT-POLICY-05 accepts a custom title", () => {
    renderWithProviders(<PrivacyPolicyPage title="سياسة مخصصة" />, {
      route: "/ar/termsAndConditions",
    });

    expect(screen.getByRole("heading", { level: 1, name: "سياسة مخصصة" })).toBeInTheDocument();
  });
});
