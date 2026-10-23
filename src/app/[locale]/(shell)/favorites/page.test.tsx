import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import FavoritesPage from "./page";
import { renderWithProviders } from "../../../../../tests/utils/render";
import { useCartStore } from "@/store/cartStore";
import { useFavoritesStore } from "@/store/favoritesStore";
import { useUiStore } from "@/store/uiStore";
import { makeUser } from "../../../../../tests/factories";
import { getDish } from "@/data/dishes";

function renderFavorites(stores = {}) {
  return renderWithProviders(<FavoritesPage />, {
    route: "/ar/favorites",
    stores: { ui: { hydrated: true }, favorites: { ids: ["crack-burger"] }, ...stores },
  });
}

describe("FavoritesPage", () => {
  it("UT-PAGE-FAV-01 shows the empty state without favorites", () => {
    const { t } = renderFavorites({ favorites: { ids: [] } });

    expect(screen.getByRole("heading", { name: t("favorites.empty") })).toBeInTheDocument();
  });

  it("UT-PAGE-FAV-02 lists the favorite dishes", () => {
    renderFavorites();

    const dish = getDish("crack-burger");
    expect(screen.getByRole("heading", { name: dish?.name.ar })).toBeInTheDocument();
  });

  it("UT-PAGE-FAV-03 shows the number of favorites", () => {
    const { t } = renderFavorites();

    expect(screen.getByText(t("favorites.count", { count: 1 }))).toBeInTheDocument();
  });

  it("UT-PAGE-FAV-04 adds a favorite dish to the cart", async () => {
    const { user, t } = renderFavorites();

    await user.click(screen.getByRole("button", { name: t("product.addToCart") }));

    expect(useCartStore.getState().items[0].dishId).toBe("crack-burger");
  });

  it("UT-PAGE-FAV-05 removes a favorite for a logged in user", async () => {
    const { user, t } = renderFavorites({
      auth: { isLoggedIn: true, user: makeUser(), hydrated: true },
    });

    await user.click(screen.getByRole("button", { name: t("product.unfavorite") }));

    expect(useFavoritesStore.getState().ids).toHaveLength(0);
  });

  it("UT-PAGE-FAV-06 asks a guest to log in before removing a favorite", async () => {
    const { user, t } = renderFavorites();

    await user.click(screen.getByRole("button", { name: t("product.unfavorite") }));

    expect(useUiStore.getState().loginModalOpen).toBe(true);
    expect(useFavoritesStore.getState().ids).toHaveLength(1);
  });
});
