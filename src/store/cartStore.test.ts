import { beforeEach, describe, expect, it } from "vitest";
import {
  COUPON_CODE,
  COUPON_DISCOUNT,
  getCartCount,
  getCartItemKey,
  getCartSubtotal,
  getCartTotals,
  getFulfillmentTotals,
  useCartStore,
  type CartItem,
} from "./cartStore";
import { DELIVERY_FEE } from "@/data/orders";
import { resetStores } from "../../tests/utils/stores";

const STORAGE_KEY = "nawy-cart";

function currentItems(): CartItem[] {
  return useCartStore.getState().items;
}

function keyOf(item: CartItem): string {
  return getCartItemKey(item);
}

describe("cart store", () => {
  beforeEach(() => {
    resetStores();
  });

  it("UT-CART-01 starts empty with the delivery method", () => {
    const state = useCartStore.getState();
    expect(state.items).toEqual([]);
    expect(state.coupon).toBeNull();
    expect(state.fulfillmentMethod).toBe("delivery");
  });

  it("UT-CART-02 adds a new item with the dish price", () => {
    useCartStore.getState().add("crack-burger");

    const items = currentItems();
    expect(items).toHaveLength(1);
    expect(items[0].dishId).toBe("crack-burger");
    expect(items[0].quantity).toBe(1);
    expect(items[0].unitPrice).toBe(12000);
  });

  it("UT-CART-03 adds the requested quantity", () => {
    useCartStore.getState().add("crack-burger", 3);

    expect(currentItems()[0].quantity).toBe(3);
  });

  it("UT-CART-04 increments the quantity of an identical item", () => {
    useCartStore.getState().add("crack-burger");
    useCartStore.getState().add("crack-burger");

    const items = currentItems();
    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(2);
  });

  it("UT-CART-05 keeps a different note as a separate item", () => {
    useCartStore.getState().add("crack-burger", 1, undefined, { note: "بدون بصل" });
    useCartStore.getState().add("crack-burger", 1, undefined, { note: "مع جبنة" });

    expect(currentItems()).toHaveLength(2);
  });

  it("UT-CART-06 normalizes the addons and the note of a new item", () => {
    useCartStore.getState().add("crack-burger", 1, undefined, {
      addonIds: ["pickles", "cheese", "pickles"],
      note: "  بدون بصل  ",
    });

    const item = currentItems()[0];
    expect(item.addonIds).toEqual(["cheese", "pickles"]);
    expect(item.note).toBe("بدون بصل");
  });

  it("UT-CART-07 increments an item by one", () => {
    useCartStore.getState().add("crack-burger", 2);
    const key = keyOf(currentItems()[0]);

    useCartStore.getState().increment(key);

    expect(currentItems()[0].quantity).toBe(3);
  });

  it("UT-CART-08 decrements an item by one", () => {
    useCartStore.getState().add("crack-burger", 2);
    const key = keyOf(currentItems()[0]);

    useCartStore.getState().decrement(key);

    expect(currentItems()[0].quantity).toBe(1);
  });

  it("UT-CART-09 never decrements below one", () => {
    useCartStore.getState().add("crack-burger", 1);
    const key = keyOf(currentItems()[0]);

    useCartStore.getState().decrement(key);

    expect(currentItems()[0].quantity).toBe(1);
  });

  it("UT-CART-10 removes an item", () => {
    useCartStore.getState().add("crack-burger");
    const key = keyOf(currentItems()[0]);

    useCartStore.getState().remove(key);

    expect(currentItems()).toEqual([]);
  });

  it("UT-CART-11 clears the items and the coupon", () => {
    useCartStore.getState().add("crack-burger");
    useCartStore.getState().applyCoupon(COUPON_CODE);

    useCartStore.getState().clear();

    expect(currentItems()).toEqual([]);
    expect(useCartStore.getState().coupon).toBeNull();
  });

  it("UT-CART-12 updates an item", () => {
    useCartStore.getState().add("crack-burger", 1, undefined, { note: "بدون بصل" });
    const key = keyOf(currentItems()[0]);

    useCartStore
      .getState()
      .update(key, { dishId: "crack-burger", quantity: 4, unitPrice: 12000, note: "بدون بصل" });

    expect(currentItems()[0].quantity).toBe(4);
  });

  it("UT-CART-13 counts the items by quantity", () => {
    useCartStore.getState().add("crack-burger", 2);
    useCartStore.getState().add("cheese-pizza", 3);

    expect(getCartCount(currentItems())).toBe(5);
  });

  it("UT-CART-14 sums the subtotal in piaster", () => {
    useCartStore.getState().add("crack-burger", 2);
    useCartStore.getState().add("cheese-pizza", 1);

    const subtotal = getCartSubtotal(currentItems());
    expect(subtotal).toBe(12000 * 2 + 11000);
  });

  it("UT-CART-15 applies the coupon once", () => {
    useCartStore.getState().add("crack-burger", 2);
    const items = currentItems();

    const totals = getCartTotals(items, COUPON_CODE);

    expect(totals.discount).toBe(COUPON_DISCOUNT);
    expect(totals.total).toBe(totals.subtotal - COUPON_DISCOUNT);
  });

  it("UT-CART-16 never returns a negative total", () => {
    const totals = getCartTotals([{ dishId: "crack-burger", quantity: 1, unitPrice: 500 }], COUPON_CODE);

    expect(totals.subtotal).toBe(500);
    expect(totals.discount).toBe(500);
    expect(totals.total).toBe(0);
  });

  it("UT-CART-17 has no discount without a coupon", () => {
    useCartStore.getState().add("crack-burger", 2);

    const totals = getCartTotals(currentItems(), null);

    expect(totals.discount).toBe(0);
    expect(totals.total).toBe(totals.subtotal);
  });

  it("UT-CART-18 accepts the coupon code in any case", () => {
    expect(useCartStore.getState().applyCoupon("  welcome20 ")).toBe(true);
    expect(useCartStore.getState().coupon).toBe(COUPON_CODE);
  });

  it("UT-CART-19 rejects an unknown coupon code", () => {
    expect(useCartStore.getState().applyCoupon("NOPE")).toBe(false);
    expect(useCartStore.getState().coupon).toBeNull();
  });

  it("UT-CART-20 removes the coupon", () => {
    useCartStore.getState().applyCoupon(COUPON_CODE);

    useCartStore.getState().removeCoupon();

    expect(useCartStore.getState().coupon).toBeNull();
  });

  it("UT-CART-21 adds the delivery fee for the delivery method", () => {
    useCartStore.getState().add("crack-burger", 1);

    const totals = getFulfillmentTotals(currentItems(), null, "delivery");

    expect(totals.deliveryFee).toBe(DELIVERY_FEE);
    expect(totals.total).toBe(totals.subtotal + DELIVERY_FEE);
  });

  it("UT-CART-22 has no delivery fee for the pickup method", () => {
    useCartStore.getState().add("crack-burger", 1);

    const totals = getFulfillmentTotals(currentItems(), null, "pickup");

    expect(totals.deliveryFee).toBe(0);
    expect(totals.total).toBe(totals.subtotal);
  });

  it("UT-CART-23 changes the fulfillment method", () => {
    useCartStore.getState().setFulfillmentMethod("pickup");

    expect(useCartStore.getState().fulfillmentMethod).toBe("pickup");
  });

  it("UT-CART-24 persists the cart in local storage", () => {
    useCartStore.getState().add("crack-burger", 2);

    const raw = window.localStorage.getItem(STORAGE_KEY);
    expect(raw).toBeTruthy();
    expect(JSON.parse(raw!).state.items).toHaveLength(1);
  });

  it("UT-CART-25 restores the cart after a rehydration", async () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        state: { items: [{ dishId: "cheese-pizza", quantity: 3, unitPrice: 11000 }], coupon: null },
        version: 0,
      }),
    );

    await useCartStore.persist.rehydrate();

    expect(currentItems()).toHaveLength(1);
    expect(currentItems()[0].dishId).toBe("cheese-pizza");
    expect(currentItems()[0].quantity).toBe(3);
  });

  it("UT-CART-26 migrates an older stored shape without a coupon", async () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        state: { items: [{ dishId: "crack-burger", quantity: 1, unitPrice: 12000 }] },
        version: 0,
      }),
    );

    await useCartStore.persist.rehydrate();

    expect(currentItems()).toHaveLength(1);
    expect(useCartStore.getState().coupon).toBeNull();
    expect(useCartStore.getState().fulfillmentMethod).toBe("delivery");
  });

  it("UT-CART-27 survives a corrupt stored cart", async () => {
    window.localStorage.setItem(STORAGE_KEY, "{not json");

    await useCartStore.persist.rehydrate();

    expect(currentItems()).toEqual([]);
  });

  it("UT-CART-28 builds the same key for the same item", () => {
    const item: CartItem = {
      dishId: "crack-burger",
      quantity: 1,
      unitPrice: 12000,
      addonIds: ["cheese", "pickles"],
      note: "بدون بصل",
    };
    const same: CartItem = { ...item, addonIds: ["pickles", "cheese"] };

    expect(keyOf(item)).toBe(keyOf(same));
  });

  it("UT-CART-29 builds a different key for a different note", () => {
    const item: CartItem = { dishId: "crack-burger", quantity: 1, unitPrice: 12000, note: "أ" };
    const other: CartItem = { dishId: "crack-burger", quantity: 1, unitPrice: 12000, note: "ب" };

    expect(keyOf(item)).not.toBe(keyOf(other));
  });

  it("UT-CART-30 keeps the price that was passed to add", () => {
    useCartStore.getState().add("crack-burger", 1, 13500);

    expect(currentItems()[0].unitPrice).toBe(13500);
  });

  it("UT-CART-31 keeps the selected size", () => {
    useCartStore.getState().add("crack-burger", 1, 13500, { sizeId: "large" });

    expect(currentItems()[0].sizeId).toBe("large");
  });

  it("UT-CART-32 falls back to a zero price for an unknown dish", () => {
    useCartStore.getState().add("unknown-dish");

    expect(currentItems()[0].unitPrice).toBe(0);
  });

  it("UT-CART-33 ignores the update of an item that is not in the cart", () => {
    useCartStore.getState().add("crack-burger");

    useCartStore.getState().update("missing-key", {
      dishId: "cheese-pizza",
      quantity: 2,
      unitPrice: 11000,
    });

    expect(currentItems()).toHaveLength(1);
    expect(currentItems()[0].dishId).toBe("crack-burger");
  });

  it("UT-CART-34 merges the quantities when the update makes two items identical", () => {
    useCartStore.getState().add("crack-burger", 1);
    useCartStore.getState().add("cheese-pizza", 2);
    const key = keyOf(currentItems()[0]);

    useCartStore.getState().update(key, {
      dishId: "cheese-pizza",
      quantity: 3,
      unitPrice: 11000,
    });

    const items = currentItems();
    expect(items).toHaveLength(1);
    expect(items[0].dishId).toBe("cheese-pizza");
    expect(items[0].quantity).toBe(5);
  });

  it("UT-CART-35 skips the items of an unknown dish in the subtotal", () => {
    const subtotal = getCartSubtotal([
      { dishId: "unknown-dish", quantity: 2, unitPrice: 900 },
    ]);

    expect(subtotal).toBe(0);
  });

  it("UT-CART-36 falls back to the dish price in the subtotal", () => {
    const subtotal = getCartSubtotal([{ dishId: "crack-burger", quantity: 2 }]);

    expect(subtotal).toBe(12000 * 2);
  });

  it("UT-CART-37 falls back to the dish price in the item key", () => {
    const item: CartItem = { dishId: "crack-burger", quantity: 1 };

    expect(keyOf(item)).toBe("crack-burger:12000::");
  });
});
