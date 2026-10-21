import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import OrdersPage from "./page";
import { renderWithProviders } from "../../../../../tests/utils/render";
import { routerMock } from "../../../../../tests/mocks/router";
import { useCartStore } from "@/store/cartStore";
import { useUiStore } from "@/store/uiStore";
import { makeOrder, makeUser } from "../../../../../tests/factories";

const orders = [
  makeOrder({
    id: "order-1",
    number: "1001",
    status: "delivered",
    date: "2026-10-01T12:00:00.000Z",
    items: [{ dishId: "crack-burger", quantity: 2 }],
  }),
  makeOrder({
    id: "order-2",
    number: "1002",
    status: "cancelled",
    date: "2026-10-05T12:00:00.000Z",
    items: [{ dishId: "classic-burger", quantity: 1 }],
  }),
];

function renderOrders(stores = {}) {
  return renderWithProviders(<OrdersPage />, {
    route: "/ar/orders",
    stores: { ui: { hydrated: true }, orders: { orders }, ...stores },
  });
}

describe("OrdersPage", () => {
  it("UT-PAGE-ORDERS-01 lists the orders", () => {
    renderOrders();

    expect(screen.getByText("#1001")).toBeInTheDocument();
    expect(screen.getByText("#1002")).toBeInTheDocument();
  });

  it("UT-PAGE-ORDERS-02 shows the empty state without orders", () => {
    const { t } = renderOrders({ orders: { orders: [] } });

    expect(screen.getByRole("heading", { name: t("orders.empty") })).toBeInTheDocument();
  });

  it("UT-PAGE-ORDERS-03 filters the delivered orders", async () => {
    const { user, t } = renderOrders();

    await user.click(screen.getByRole("button", { name: t("orders.filterDelivered") }));

    expect(screen.getByText("#1001")).toBeInTheDocument();
    expect(screen.queryByText("#1002")).not.toBeInTheDocument();
  });

  it("UT-PAGE-ORDERS-04 filters the cancelled orders", async () => {
    const { user, t } = renderOrders();

    await user.click(screen.getByRole("button", { name: t("orders.filterCancelled") }));

    expect(screen.getByText("#1002")).toBeInTheDocument();
    expect(screen.queryByText("#1001")).not.toBeInTheDocument();
  });

  it("UT-PAGE-ORDERS-05 shows the status of an order", () => {
    const { t } = renderOrders();

    expect(screen.getAllByText(t("orders.delivered")).length).toBeGreaterThan(0);
    expect(screen.getAllByText(t("orders.cancelled")).length).toBeGreaterThan(0);
  });

  it("UT-PAGE-ORDERS-06 adds the items of an order back to the cart", async () => {
    const { user, t } = renderOrders({
      auth: { isLoggedIn: true, user: makeUser(), hydrated: true },
    });

    await user.click(screen.getAllByRole("button", { name: t("orders.reorder") })[0]);

    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useCartStore.getState().items[0].dishId).toBe("crack-burger");
    expect(routerMock.push).toHaveBeenCalledWith("/ar/cart");
  });

  it("UT-PAGE-ORDERS-07 asks a guest to log in before the reorder", async () => {
    const { user, t } = renderOrders();

    await user.click(screen.getAllByRole("button", { name: t("orders.reorder") })[0]);

    expect(useUiStore.getState().loginModalOpen).toBe(true);
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it("UT-PAGE-ORDERS-08 shows the number of items of an order", () => {
    const { t } = renderOrders();

    expect(screen.getByText(t("orders.itemsCount", { count: 2 }))).toBeInTheDocument();
  });
});
