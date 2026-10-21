import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CartSummaryBar } from "./CartSummaryBar";
import { renderWithProviders } from "../../../tests/utils/render";
import { makeCartItem } from "../../../tests/factories";
import { formatPrice } from "@/lib/format";
import type { StoreSeed } from "../../../tests/utils/stores";

function renderBar(stores: StoreSeed = {}, route = "/ar") {
  return renderWithProviders(<CartSummaryBar />, { stores, route });
}

const cartWithItems = {
  cart: { items: [makeCartItem({ dishId: "crack-burger", quantity: 2, unitPrice: 12000 })] },
};

describe("CartSummaryBar", () => {
  it("UT-SUMMARY-01 shows the total of the cart", () => {
    renderBar(cartWithItems);

    expect(screen.getByText(formatPrice(24000, "ar"))).toBeInTheDocument();
  });

  it("UT-SUMMARY-02 shows the number of items", () => {
    renderBar(cartWithItems);

    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("UT-SUMMARY-03 links to the cart", () => {
    const { t } = renderBar(cartWithItems);

    expect(screen.getByRole("link", { name: t("cart.count", { count: 2 }) })).toHaveAttribute(
      "href",
      "/ar/cart",
    );
  });

  it("UT-SUMMARY-04 announces the count politely", () => {
    renderBar(cartWithItems);

    expect(screen.getByText("2")).toHaveAttribute("aria-live", "polite");
  });

  it("UT-SUMMARY-05 stays hidden with an empty cart", () => {
    renderBar({ cart: { items: [] } });

    expect(screen.queryByRole("complementary")).not.toBeInTheDocument();
  });

  it("UT-SUMMARY-06 stays hidden on the cart page", () => {
    renderBar(cartWithItems, "/ar/cart");

    expect(screen.queryByRole("complementary")).not.toBeInTheDocument();
  });

  it("UT-SUMMARY-07 shows up on the menu route", () => {
    renderBar(cartWithItems, "/ar/menu");

    expect(screen.getByRole("complementary")).toBeInTheDocument();
  });

  it("UT-SUMMARY-08 applies the coupon to the total", () => {
    renderBar({
      cart: {
        items: [makeCartItem({ dishId: "crack-burger", quantity: 1, unitPrice: 12000 })],
        coupon: "WELCOME20",
      },
    });

    expect(screen.getByText(formatPrice(10000, "ar"))).toBeInTheDocument();
  });

  it("UT-SUMMARY-09 uses the English copy in the English locale", () => {
    const { t } = renderWithProviders(<CartSummaryBar />, {
      stores: cartWithItems,
      route: "/en",
      locale: "en",
    });

    expect(screen.getByRole("link", { name: t("cart.count", { count: 2 }) })).toHaveAttribute(
      "href",
      "/en/cart",
    );
  });
});
