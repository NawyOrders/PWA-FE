import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import CartPage from "./page";
import { renderWithProviders } from "../../../../../tests/utils/render";
import { routerMock } from "../../../../../tests/mocks/router";
import { useCartStore } from "@/store/cartStore";
import { useUiStore } from "@/store/uiStore";
import { makeCartItem, makeUser } from "../../../../../tests/factories";
import { getDish } from "@/data/dishes";
import { formatPrice } from "@/lib/format";

const cartWithItems = {
  cart: {
    items: [makeCartItem({ dishId: "crack-burger", quantity: 2, unitPrice: 12000 })],
  },
};

function renderCart(stores = {}, locale: "ar" | "en" = "ar") {
  return renderWithProviders(<CartPage />, {
    locale,
    route: "/ar/cart",
    stores: { ui: { hydrated: true }, ...stores },
  });
}

describe("CartPage", () => {
  it("UT-PAGE-CART-01 shows the skeleton while the store is not hydrated", () => {
    const { container } = renderWithProviders(<CartPage />, {
      route: "/ar/cart",
      stores: { ui: { hydrated: false } },
    });

    expect(container.querySelectorAll(".skeleton").length).toBeGreaterThan(0);
  });

  it("UT-PAGE-CART-02 shows the empty state without items", () => {
    const { t } = renderCart({ cart: { items: [] } });

    expect(screen.getByRole("heading", { name: t("cart.empty") })).toBeInTheDocument();
  });

  it("UT-PAGE-CART-03 lists the items of the cart", () => {
    const { t } = renderCart(cartWithItems);
    const dish = getDish("crack-burger");

    expect(screen.getByRole("heading", { name: dish?.name.ar })).toBeInTheDocument();
    expect(screen.getByText(t("cart.summary"))).toBeInTheDocument();
  });

  it("UT-PAGE-CART-04 shows the total of the cart", () => {
    renderCart(cartWithItems);

    expect(screen.getAllByText(formatPrice(24000, "ar")).length).toBeGreaterThan(0);
  });

  it("UT-PAGE-CART-05 increases the quantity of an item", async () => {
    const { user, t } = renderCart(cartWithItems);

    await user.click(screen.getByRole("button", { name: t("product.increase") }));

    expect(useCartStore.getState().items[0].quantity).toBe(3);
  });

  it("UT-PAGE-CART-06 decreases the quantity of an item", async () => {
    const { user, t } = renderCart(cartWithItems);

    await user.click(screen.getByRole("button", { name: t("product.decrease") }));

    expect(useCartStore.getState().items[0].quantity).toBe(1);
  });

  it("UT-PAGE-CART-07 applies the welcome coupon", async () => {
    const { user, t } = renderCart(cartWithItems);

    await user.type(screen.getByLabelText(t("cart.couponPlaceholder")), "WELCOME20");
    await user.click(screen.getByRole("button", { name: t("cart.couponApply") }));

    expect(useCartStore.getState().coupon).toBe("WELCOME20");
    expect(screen.getByText(t("cart.couponSuccess"))).toBeInTheDocument();
  });

  it("UT-PAGE-CART-08 refuses an unknown coupon", async () => {
    const { user, t } = renderCart(cartWithItems);

    await user.type(screen.getByLabelText(t("cart.couponPlaceholder")), "NOPE");
    await user.click(screen.getByRole("button", { name: t("cart.couponApply") }));

    expect(useCartStore.getState().coupon).toBeNull();
    expect(screen.getByText(t("cart.couponError"))).toBeInTheDocument();
  });

  it("UT-PAGE-CART-09 asks before deleting everything", async () => {
    const { user, t } = renderCart(cartWithItems);

    await user.click(screen.getByRole("button", { name: t("cart.deleteAll") }));

    expect(screen.getByRole("dialog", { name: t("cart.deleteTitle") })).toBeInTheDocument();
    expect(useCartStore.getState().items).toHaveLength(1);
  });

  it("UT-PAGE-CART-10 empties the cart after the confirmation", async () => {
    const { user, t } = renderCart(cartWithItems);

    await user.click(screen.getByRole("button", { name: t("cart.deleteAll") }));
    const dialog = screen.getByRole("dialog");
    await user.click(within(dialog).getByRole("button", { name: t("common.delete") }));

    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it("UT-PAGE-CART-11 keeps the cart when the confirmation is cancelled", async () => {
    const { user, t } = renderCart(cartWithItems);

    await user.click(screen.getByRole("button", { name: t("cart.deleteAll") }));
    const dialog = screen.getByRole("dialog");
    await user.click(within(dialog).getByRole("button", { name: t("common.cancel") }));

    expect(useCartStore.getState().items).toHaveLength(1);
  });

  it("UT-PAGE-CART-12 asks a guest to log in before the checkout", async () => {
    const { user, t } = renderCart(cartWithItems);

    await user.click(screen.getAllByRole("button", { name: t("cart.checkout") })[0]);

    expect(useUiStore.getState().loginModalOpen).toBe(true);
    expect(routerMock.push).not.toHaveBeenCalledWith("/ar/delivery");
  });

  it("UT-PAGE-CART-13 sends a logged in user to the delivery screen", async () => {
    const { user, t } = renderCart({
      ...cartWithItems,
      auth: { isLoggedIn: true, user: makeUser(), hydrated: true },
    });

    await user.click(screen.getAllByRole("button", { name: t("cart.checkout") })[0]);

    expect(routerMock.push).toHaveBeenCalledWith("/ar/delivery");
  });

  it("UT-PAGE-CART-14 deletes a single item", async () => {
    const { user, t } = renderCart(cartWithItems);

    await user.click(screen.getByRole("button", { name: t("common.delete") }));

    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it("UT-PAGE-CART-15 shows the count of the items in the header", () => {
    const { t } = renderCart(cartWithItems);

    expect(screen.getByText(t("cart.count", { count: 2 }))).toBeInTheDocument();
  });
});
