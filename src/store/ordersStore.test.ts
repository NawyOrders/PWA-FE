import { beforeEach, describe, expect, it } from "vitest";
import { useOrdersStore } from "./ordersStore";
import { orders as seedOrders } from "@/data/orders";
import { makeOrderItem } from "../../tests/factories";
import { resetStores } from "../../tests/utils/stores";

const STORAGE_KEY = "nawy-orders";

describe("orders store", () => {
  beforeEach(() => {
    resetStores();
  });

  it("UT-ORDERS-01 starts with the seeded orders", () => {
    expect(useOrdersStore.getState().orders).toHaveLength(seedOrders.length);
  });

  it("UT-ORDERS-02 adds an order at the top of the list", () => {
    const order = useOrdersStore.getState().addOrder({
      items: [makeOrderItem()],
      deliveryFee: 2000,
      discount: 0,
    });

    const list = useOrdersStore.getState().orders;
    expect(list).toHaveLength(seedOrders.length + 1);
    expect(list[0].id).toBe(order.id);
  });

  it("UT-ORDERS-03 numbers the new order after the highest existing number", () => {
    const order = useOrdersStore.getState().addOrder({
      items: [makeOrderItem()],
      deliveryFee: 2000,
      discount: 0,
    });

    expect(order.number).toBe("1052");
    expect(order.id).toBe("order-1052");
  });

  it("UT-ORDERS-04 creates a processing order", () => {
    const order = useOrdersStore.getState().addOrder({
      items: [makeOrderItem()],
      deliveryFee: 2000,
      discount: 500,
    });

    expect(order.status).toBe("processing");
    expect(order.deliveryFee).toBe(2000);
    expect(order.discount).toBe(500);
  });

  it("UT-ORDERS-05 keeps the items of the new order", () => {
    const order = useOrdersStore.getState().addOrder({
      items: [makeOrderItem({ dishId: "cheese-pizza", quantity: 2 })],
      deliveryFee: 2000,
      discount: 0,
    });

    expect(order.items).toEqual([makeOrderItem({ dishId: "cheese-pizza", quantity: 2 })]);
  });

  it("UT-ORDERS-06 numbers the next order after a manual change", () => {
    useOrdersStore.setState({
      orders: [{ ...seedOrders[0], number: "2000" }],
    });

    const order = useOrdersStore.getState().addOrder({
      items: [makeOrderItem()],
      deliveryFee: 2000,
      discount: 0,
    });

    expect(order.number).toBe("2001");
  });

  it("UT-ORDERS-07 persists the orders in local storage", () => {
    useOrdersStore.getState().addOrder({ items: [makeOrderItem()], deliveryFee: 2000, discount: 0 });

    const raw = window.localStorage.getItem(STORAGE_KEY);
    expect(raw).toBeTruthy();
    expect(JSON.parse(raw!).state.orders).toHaveLength(seedOrders.length + 1);
  });

  it("UT-ORDERS-08 restores the orders after a rehydration", async () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ state: { orders: [] }, version: 0 }),
    );

    await useOrdersStore.persist.rehydrate();

    expect(useOrdersStore.getState().orders).toEqual([]);
  });

  it("UT-ORDERS-09 survives a corrupt storage", async () => {
    window.localStorage.setItem(STORAGE_KEY, "{not json");

    await useOrdersStore.persist.rehydrate();

    expect(useOrdersStore.getState().orders).toHaveLength(seedOrders.length);
  });

  it("UT-ORDERS-10 starts the numbering at 1001 when there is no order", () => {
    useOrdersStore.setState({ orders: [] });

    const order = useOrdersStore.getState().addOrder({
      items: [makeOrderItem()],
      deliveryFee: 2000,
      discount: 0,
    });

    expect(order.number).toBe("1001");
    expect(order.id).toBe("order-1001");
  });

  it("UT-ORDERS-11 ignores an order number that is not a number", () => {
    useOrdersStore.setState({
      orders: [{ ...seedOrders[0], number: "not-a-number" }],
    });

    const order = useOrdersStore.getState().addOrder({
      items: [makeOrderItem()],
      deliveryFee: 2000,
      discount: 0,
    });

    expect(order.number).toBe("1001");
  });
});
