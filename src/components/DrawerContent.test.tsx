import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DrawerContent } from "./DrawerContent";
import { renderWithProviders } from "../../tests/utils/render";
import { routerMock } from "../../tests/mocks/router";
import { useUiStore } from "@/store/uiStore";
import { makeUser } from "../../tests/factories";
import type { Locale } from "@/lib/i18n/types";

function renderContent(locale: Locale = "ar", user: ReturnType<typeof makeUser> | null = null) {
  return renderWithProviders(<DrawerContent />, {
    locale,
    stores: user
      ? { auth: { user, isLoggedIn: true } }
      : undefined,
  });
}

describe("DrawerContent", () => {
  it("UT-DRAWERC-01 greets a guest with the brand name", () => {
    const { t } = renderContent();

    expect(screen.getByText(t("drawer.guest"))).toBeInTheDocument();
  });

  it("UT-DRAWERC-02 shows the name of a logged in user", () => {
    const user = makeUser({ name: "أحمد" });
    renderContent("ar", user);

    expect(screen.getByText(/أحمد/)).toBeInTheDocument();
  });

  it("UT-DRAWERC-03 lists the navigation of the drawer", () => {
    const { t } = renderContent();

    expect(screen.getByRole("link", { name: t("nav.home") })).toHaveAttribute("href", "/ar");
    expect(screen.getByRole("link", { name: t("nav.cart") })).toHaveAttribute("href", "/ar/cart");
    expect(screen.getByRole("link", { name: t("nav.orders") })).toHaveAttribute("href", "/ar/orders");
  });

  it("UT-DRAWERC-04 uses the English links in the English locale", () => {
    const { t } = renderContent("en");

    expect(screen.getByRole("link", { name: t("nav.menu") })).toHaveAttribute("href", "/en/menu");
  });

  it("UT-DRAWERC-05 closes the drawer when a link is used", async () => {
    const { user, t } = renderWithProviders(<DrawerContent />, {
      stores: { ui: { drawerOpen: true } },
    });

    await user.click(screen.getByRole("link", { name: t("nav.menu") }));

    expect(useUiStore.getState().drawerOpen).toBe(false);
  });

  it("UT-DRAWERC-06 offers the social channels with a name", () => {
    const { t } = renderContent();

    const whatsapp = screen.getByRole("link", { name: t("drawer.whatsapp") });
    expect(whatsapp).toHaveAttribute("target", "_blank");
    expect(whatsapp).toHaveAttribute("rel", "noreferrer");
  });

  it("UT-DRAWERC-07 switches the language and keeps the route", async () => {
    const { user } = renderContent("ar");

    await user.click(screen.getByRole("button", { name: "ENG" }));

    expect(routerMock.replace).toHaveBeenCalledWith("/en");
  });

  it("UT-DRAWERC-08 marks the active language as pressed", () => {
    renderContent("ar");

    expect(screen.getByRole("button", { name: "عربي" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "ENG" })).toHaveAttribute("aria-pressed", "false");
  });

  it("UT-DRAWERC-09 shows the version of the app", () => {
    const { t } = renderContent();

    expect(screen.getByText(t("drawer.version"))).toBeInTheDocument();
  });
});
