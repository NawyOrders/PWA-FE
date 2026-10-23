import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AboutNawyOrdersPage } from "./AboutNawyOrdersPage";
import { renderWithProviders } from "../../../tests/utils/render";
import { useUiStore } from "@/store/uiStore";

describe("AboutNawyOrdersPage", () => {
  it("UT-NAWY-01 shows the platform title and the tagline", () => {
    const { t } = renderWithProviders(<AboutNawyOrdersPage />, { route: "/ar/aboutNawyOrders" });

    expect(
      screen.getByRole("heading", { level: 1, name: t("aboutNawyOrders.title") }),
    ).toBeInTheDocument();
    expect(screen.getByText(t("aboutNawyOrders.tagline"))).toBeInTheDocument();
  });

  it("UT-NAWY-02 shows the three features", () => {
    const { t } = renderWithProviders(<AboutNawyOrdersPage />, { route: "/ar/aboutNawyOrders" });

    expect(
      screen.getByRole("heading", { name: t("aboutNawyOrders.commissionTitle") }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: t("aboutNawyOrders.menuTitle") }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: t("aboutNawyOrders.customersTitle") }),
    ).toBeInTheDocument();
  });

  it("UT-NAWY-03 shows the description of every feature", () => {
    const { t } = renderWithProviders(<AboutNawyOrdersPage />, { route: "/ar/aboutNawyOrders" });

    expect(screen.getByText(t("aboutNawyOrders.commissionDescription"))).toBeInTheDocument();
    expect(screen.getByText(t("aboutNawyOrders.customersDescription"))).toBeInTheDocument();
  });

  it("UT-NAWY-04 announces that the learn more button is not ready", async () => {
    const { user, t } = renderWithProviders(<AboutNawyOrdersPage />, {
      route: "/ar/aboutNawyOrders",
    });

    await user.click(screen.getByRole("button", { name: t("aboutNawyOrders.learnMore") }));

    expect(useUiStore.getState().toast?.message).toBe(t("profile.comingSoon"));
  });

  it("UT-NAWY-05 links back to the about page", () => {
    const { t } = renderWithProviders(<AboutNawyOrdersPage />, { route: "/ar/aboutNawyOrders" });

    expect(screen.getByRole("link", { name: t("common.back") })).toHaveAttribute(
      "href",
      "/ar/aboutRestaurant",
    );
  });
});
