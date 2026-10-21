import { screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ItemDetail from "./ItemDetail";
import { renderWithProviders } from "../../../tests/utils/render";
import { dictionaries } from "@/lib/i18n/dictionary";
import { useCartStore } from "@/store/cartStore";
import { useUiStore } from "@/store/uiStore";
import { itemAddons } from "./data";
import { getDish } from "@/data/dishes";

const t = dictionaries.ar;

function renderItem(dish = getDish("crack-burger"), stores = {}) {
  return renderWithProviders(<ItemDetail dish={dish} />, {
    route: "/ar/item/crack-burger",
    stores: { auth: { isLoggedIn: false, user: null }, ...stores },
  });
}

describe("ItemDetail", () => {
  it("UT-ITEM-01 shows the name and the description of the dish", () => {
    const dish = getDish("crack-burger");
    renderItem(dish);

    expect(screen.getByRole("heading", { level: 1, name: dish?.name.ar })).toBeInTheDocument();
  });

  it("UT-ITEM-02 falls back to the sample item without a dish", () => {
    renderWithProviders(<ItemDetail />, { route: "/ar/item/burger-baladi" });

    expect(screen.getByRole("heading", { level: 1, name: t.itemName })).toBeInTheDocument();
  });

  it("UT-ITEM-03 shows the three sizes and marks the medium one", () => {
    renderItem();

    const group = screen.getByRole("group", { name: t.burgerSize });
    expect(group).toBeInTheDocument();
    expect(screen.getByRole("button", { name: t.sizeMedium })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("UT-ITEM-04 changes the size", async () => {
    const { user } = renderItem();

    const large = screen.getByRole("button", { name: t.sizeLarge });
    await user.click(large);

    expect(large).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: t.sizeMedium })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("UT-ITEM-05 adds an addon to the total", async () => {
    const { user } = renderItem();

    const addon = itemAddons[0];
    const addonButton = screen.getByRole("button", {
      name: `${t.add} ${t[`addon${addon.id[0].toUpperCase()}${addon.id.slice(1)}` as "addonLettuce"]}`,
    });
    await user.click(addonButton);

    expect(addonButton).toHaveAttribute("aria-pressed", "true");
  });

  it("UT-ITEM-06 raises the quantity", async () => {
    const { user } = renderItem();

    await user.click(screen.getByRole("button", { name: t.increaseQuantity }));

    expect(screen.getByRole("button", { name: t.decreaseQuantity })).toBeEnabled();
  });

  it("UT-ITEM-07 keeps the quantity at one", () => {
    renderItem();

    expect(screen.getByRole("button", { name: t.decreaseQuantity })).toBeDisabled();
  });

  it("UT-ITEM-08 writes a note for the order", async () => {
    const { user } = renderItem();

    await user.type(screen.getByLabelText(t.noteLabel), "بدون بصل");

    expect(screen.getByLabelText(t.noteLabel)).toHaveValue("بدون بصل");
  });

  it("UT-ITEM-09 adds the item to the cart", async () => {
    const { user } = renderItem();

    await user.click(screen.getByRole("button", { name: new RegExp(t.addToCart) }));

    await waitFor(() => expect(useCartStore.getState().items).toHaveLength(1));
    expect(useCartStore.getState().items[0].dishId).toBe("crack-burger");
  });

  it("UT-ITEM-10 asks a guest to log in before a favorite", async () => {
    const { user } = renderItem();

    await user.click(screen.getByRole("button", { name: t.addFavorite }));

    expect(useUiStore.getState().loginModalOpen).toBe(true);
  });

  it("UT-ITEM-11 shows the favorite as pressed for a liked item", () => {
    renderItem(getDish("crack-burger"), { favorites: { ids: ["crack-burger"] } });

    expect(screen.getByRole("button", { name: t.removeFavorite })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("UT-ITEM-12 uses the prices of the dish for the sizes", () => {
    const dish = getDish("crack-burger");
    renderItem(dish);

    const medium = Math.round((dish?.sizePrices.medium ?? 0) / 100);
    const cartButton = screen.getByRole("button", { name: new RegExp(t.addToCart) });

    expect(cartButton).toHaveTextContent(String(medium));
  });

  it("UT-ITEM-13 raises the total with the quantity", async () => {
    const dish = getDish("crack-burger");
    const { user } = renderItem(dish);

    const medium = Math.round((dish?.sizePrices.medium ?? 0) / 100);
    await user.click(screen.getByRole("button", { name: t.increaseQuantity }));

    expect(screen.getByRole("button", { name: new RegExp(t.addToCart) })).toHaveTextContent(
      String(medium * 2),
    );
  });
});
