import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DesktopNav } from "./DesktopNav";
import { renderWithProviders } from "../../tests/utils/render";
import { routerMock } from "../../tests/mocks/router";
import { makeCartItem, makeUser } from "../../tests/factories";

function renderNav(route = "/ar", locale: "ar" | "en" = "ar") {
  return renderWithProviders(<DesktopNav />, { route, locale });
}

describe("DesktopNav", () => {
  it("UT-NAV-01 links to the main sections", () => {
    const { t } = renderNav();

    const nav = screen.getByRole("navigation", { name: t("nav.menu") });
    expect(within(nav).getByRole("link", { name: t("nav.home") })).toHaveAttribute("href", "/ar");
    expect(within(nav).getByRole("link", { name: t("nav.menu") })).toHaveAttribute("href", "/ar/menu");
    expect(within(nav).getByRole("link", { name: t("nav.favorites") })).toHaveAttribute(
      "href",
      "/ar/favorites",
    );
    expect(within(nav).getByRole("link", { name: t("nav.orders") })).toHaveAttribute(
      "href",
      "/ar/orders",
    );
  });

  it("UT-NAV-02 links to the cart and the profile", () => {
    const { t } = renderNav();

    expect(screen.getByRole("link", { name: t("nav.cart") })).toHaveAttribute("href", "/ar/cart");
    expect(screen.getByRole("link", { name: t("nav.profile") })).toHaveAttribute("href", "/ar/profile");
  });

  it("UT-NAV-03 names the navigation", () => {
    const { t } = renderNav();

    expect(screen.getByRole("navigation", { name: t("nav.menu") })).toBeInTheDocument();
  });

  it("UT-NAV-04 shows the number of items in the cart", () => {
    renderWithProviders(<DesktopNav />, {
      route: "/ar",
      stores: { cart: { items: [makeCartItem({ quantity: 3 })] } },
    });

    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("UT-NAV-05 hides the counter of an empty cart", () => {
    const { t } = renderWithProviders(<DesktopNav />, {
      route: "/ar",
      stores: { cart: { items: [] } },
    });

    expect(screen.getByRole("link", { name: t("nav.cart") })).toHaveTextContent("");
  });

  it("UT-NAV-06 switches the language and keeps the route", async () => {
    const { user } = renderNav("/ar/menu");

    await user.click(screen.getByRole("button", { name: "ENG" }));

    expect(routerMock.replace).toHaveBeenCalledWith("/en/menu");
  });

  it("UT-NAV-07 marks the active language", () => {
    renderNav();

    expect(screen.getByRole("button", { name: "عربي" })).toHaveAttribute("aria-pressed", "true");
  });

  it("UT-NAV-08 shows the name of a logged in user", () => {
    renderWithProviders(<DesktopNav />, {
      route: "/ar",
      stores: { auth: { isLoggedIn: true, user: makeUser({ name: "أحمد" }) } },
    });

    expect(screen.getByText("أحمد")).toBeInTheDocument();
  });
});
