import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import DeliveryPage from "./DeliveryPage";
import { renderWithProviders } from "../../../tests/utils/render";
import { routerMock } from "../../../tests/mocks/router";
import { dictionaries } from "@/lib/i18n/dictionary";
import { useCartStore } from "@/store/cartStore";
import { getDish } from "@/data/dishes";
import { formatPrice } from "@/lib/format";

const t = dictionaries.ar;
const dish = getDish("crack-burger");

function renderDelivery(cart: Record<string, unknown> = {}) {
  return renderWithProviders(<DeliveryPage />, {
    route: "/ar/delivery",
    stores: { cart: { items: [], coupon: null, ...cart } },
  });
}

describe("DeliveryPage", () => {
  it("UT-DELIVERY-01 shows the title and the two options", () => {
    renderDelivery();

    expect(screen.getByRole("heading", { level: 1, name: t.deliveryMethod })).toBeInTheDocument();
    expect(screen.getByRole("radiogroup", { name: t.deliveryMethod })).toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(2);
  });

  it("UT-DELIVERY-02 selects the delivery by default", () => {
    renderDelivery();

    const options = screen.getAllByRole("radio");
    expect(options[0]).toHaveAttribute("aria-checked", "true");
    expect(options[1]).toHaveAttribute("aria-checked", "false");
  });

  it("UT-DELIVERY-03 changes the method to pickup", async () => {
    const { user } = renderDelivery();

    const options = screen.getAllByRole("radio");
    await user.click(options[1]);

    expect(options[1]).toHaveAttribute("aria-checked", "true");
    expect(options[0]).toHaveAttribute("aria-checked", "false");
  });

  it("UT-DELIVERY-04 shows the summary of the order", () => {
    renderDelivery({ items: [{ dishId: "crack-burger", quantity: 2 }] });

    const summary = screen.getByRole("region", { name: t.orderSummaryFulfillment });
    const subtotal = (dish?.price ?? 0) * 2;

    expect(summary).toHaveTextContent(formatPrice(subtotal, "ar"));
    expect(summary).toHaveTextContent(t.deliveryFeePending);
  });

  it("UT-DELIVERY-05 removes the delivery fee for the pickup", async () => {
    const { user } = renderDelivery({ items: [{ dishId: "crack-burger", quantity: 2 }] });

    await user.click(screen.getAllByRole("radio")[1]);

    const summary = screen.getByRole("region", { name: t.orderSummaryFulfillment });
    expect(summary).toHaveTextContent(formatPrice(0, "ar"));
  });

  it("UT-DELIVERY-06 goes to the address with a delivery", async () => {
    const { user } = renderDelivery();

    await user.click(screen.getByRole("button", { name: t.confirmFulfillment }));

    expect(routerMock.push).toHaveBeenCalledWith("/ar/address");
  });

  it("UT-DELIVERY-07 goes to the branch with a pickup", async () => {
    const { user } = renderDelivery();

    await user.click(screen.getAllByRole("radio")[1]);
    await user.click(screen.getByRole("button", { name: t.confirmFulfillment }));

    expect(routerMock.push).toHaveBeenCalledWith("/ar/restLocation");
  });

  it("UT-DELIVERY-08 stores the chosen method", async () => {
    const { user } = renderDelivery();

    await user.click(screen.getAllByRole("radio")[1]);
    await user.click(screen.getByRole("button", { name: t.confirmFulfillment }));

    expect(useCartStore.getState().fulfillmentMethod).toBe("pickup");
  });

  it("UT-DELIVERY-09 links back to the home", () => {
    renderDelivery();

    expect(screen.getByRole("link", { name: t.backToHome })).toHaveAttribute("href", "/ar");
  });
});
