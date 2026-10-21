import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import MenuPage from "./page";
import { renderWithProviders } from "../../../../../tests/utils/render";
import { useCartStore } from "@/store/cartStore";
import { useFavoritesStore } from "@/store/favoritesStore";
import { useUiStore } from "@/store/uiStore";
import { categories } from "@/data/categories";
import { dishes } from "@/data/dishes";

function renderMenu(stores = {}) {
  return renderWithProviders(<MenuPage />, {
    route: "/ar/menu",
    stores: { auth: { isLoggedIn: false, user: null }, ...stores },
  });
}

describe("MenuPage", () => {
  it("UT-PAGE-MENU-01 shows the title of the menu", () => {
    const { t } = renderMenu();

    expect(screen.getByRole("heading", { level: 1, name: t("menu.title") })).toBeInTheDocument();
  });

  it("UT-PAGE-MENU-02 shows every category", () => {
    const { t } = renderMenu();

    for (const category of categories) {
      expect(
        screen.getByRole("button", { name: new RegExp(t(`categories.${category.id}`)) }),
      ).toBeInTheDocument();
    }
  });

  it("UT-PAGE-MENU-03 starts with the burgers", () => {
    renderMenu();

    expect(screen.getByRole("link", { name: dishes[0].name.ar })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: dishes[3].name.ar })).not.toBeInTheDocument();
  });

  it("UT-PAGE-MENU-04 marks the first category as active", () => {
    const { t } = renderMenu();

    expect(
      screen.getByRole("button", { name: new RegExp(t("categories.burger")) }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("UT-PAGE-MENU-05 filters the dishes with a category", async () => {
    const { user, t } = renderMenu();

    await user.click(screen.getByRole("button", { name: new RegExp(t("categories.pizza")) }));

    expect(screen.getByRole("link", { name: dishes[3].name.ar })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: dishes[0].name.ar })).not.toBeInTheDocument();
  });

  it("UT-PAGE-MENU-06 adds a dish to the cart", async () => {
    const { user, t } = renderMenu();

    await user.click(screen.getAllByRole("button", { name: t("product.addToCart") })[0]);

    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useUiStore.getState().toast?.message).toBe(t("toast.addedToCart"));
  });

  it("UT-PAGE-MENU-07 asks a guest to log in before a favorite", async () => {
    const { user, t } = renderMenu();

    await user.click(screen.getAllByRole("button", { name: t("product.favorite") })[0]);

    expect(useUiStore.getState().loginModalOpen).toBe(true);
  });

  it("UT-PAGE-MENU-08 opens the drawer from the header", async () => {
    const { user, t } = renderMenu();

    await user.click(screen.getByRole("button", { name: t("common.menu") }));

    expect(useUiStore.getState().drawerOpen).toBe(true);
  });

  it("UT-PAGE-MENU-09 saves a favorite for a logged-in user", async () => {
    const { user, t } = renderMenu({
      auth: { isLoggedIn: true, user: { id: "u1", name: "أحمد", phone: "01000000000" } },
    });

    await user.click(screen.getAllByRole("button", { name: t("product.favorite") })[0]);

    expect(useFavoritesStore.getState().ids).toHaveLength(1);
    expect(useUiStore.getState().toast?.message).toBe(t("toast.favoriteAdded"));
  });

  it("UT-PAGE-MENU-10 removes a favorite again", async () => {
    const { user, t } = renderMenu({
      auth: { isLoggedIn: true, user: { id: "u1", name: "أحمد", phone: "01000000000" } },
      favorites: { ids: [dishes.find((dish) => dish.categoryId === "burger")?.id ?? dishes[0].id] },
    });

    await user.click(screen.getAllByRole("button", { name: t("product.unfavorite") })[0]);

    expect(useFavoritesStore.getState().ids).toHaveLength(0);
    expect(useUiStore.getState().toast?.message).toBe(t("toast.favoriteRemoved"));
  });
});
