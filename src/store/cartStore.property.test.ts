import { describe, expect, it } from "vitest";
import { fc, fcOptions } from "../../tests/utils/fc";
import {
  COUPON_CODE,
  getCartItemKey,
  getCartSubtotal,
  getCartTotals,
  getFulfillmentTotals,
  useCartStore,
  type CartItem,
  type FulfillmentMethod,
} from "@/store/cartStore";
import { dishes } from "@/data/dishes";

const dishIds = dishes.map((dish) => dish.id);

const row = fc.record({
  dishId: fc.constantFrom(...dishIds),
  price: fc.integer({ min: 0, max: 1_000_000 }),
  quantity: fc.integer({ min: 1, max: 20 }),
});

function resetCart() {
  useCartStore.setState({ items: [], coupon: null, fulfillmentMethod: "delivery" });
}

describe("property: cart totals", () => {
  it("UT-CART-P1 keeps the total between zero and the subtotal", () => {
    fc.assert(
      fc.property(
        fc.array(row, { maxLength: 12 }),
        fc.constantFrom(null, COUPON_CODE),
        fc.constantFrom<null | FulfillmentMethod>(null, "delivery", "pickup"),
        (rows, coupon, method) => {
          const items: CartItem[] = rows.map((entry) => ({
            dishId: entry.dishId,
            quantity: entry.quantity,
            unitPrice: entry.price,
          }));

          const { subtotal, discount, total } = getCartTotals(items, coupon);
          expect(subtotal).toBeGreaterThanOrEqual(0);
          expect(discount).toBeGreaterThanOrEqual(0);
          expect(discount).toBeLessThanOrEqual(subtotal);
          expect(total).toBeGreaterThanOrEqual(0);
          expect(total).toBeLessThanOrEqual(subtotal);

          const fulfillment = getFulfillmentTotals(items, coupon, method ?? "delivery");
          expect(fulfillment.total).toBeGreaterThanOrEqual(fulfillment.deliveryFee);
          expect(fulfillment.total).toBeLessThanOrEqual(fulfillment.subtotal + fulfillment.deliveryFee);
        },
      ),
      fcOptions,
    );
  });

  it("UT-CART-P2 restores the totals after adding and removing the same items", () => {
    fc.assert(
      fc.property(fc.array(row, { maxLength: 10 }), (rows) => {
        resetCart();
        const store = useCartStore.getState();

        for (const entry of rows) {
          store.add(entry.dishId, entry.quantity, entry.price);
        }
        const before = getCartTotals(useCartStore.getState().items, null);

        for (const item of useCartStore.getState().items) {
          useCartStore.getState().remove(getCartItemKey(item));
        }
        const after = getCartTotals(useCartStore.getState().items, null);

        expect(after.subtotal).toBe(0);
        expect(after.discount).toBe(0);
        expect(after.total).toBe(0);
        expect(before.subtotal).toBeGreaterThanOrEqual(after.subtotal);
      }),
      fcOptions,
    );
  });

  it("UT-CART-P3 does not depend on the order of the additions", () => {
    fc.assert(
      fc.property(fc.array(row, { maxLength: 10 }), (rows) => {
        resetCart();
        for (const entry of rows) {
          useCartStore.getState().add(entry.dishId, entry.quantity, entry.price);
        }
        const forward = getCartSubtotal(useCartStore.getState().items);

        resetCart();
        for (const entry of [...rows].reverse()) {
          useCartStore.getState().add(entry.dishId, entry.quantity, entry.price);
        }
        const backward = getCartSubtotal(useCartStore.getState().items);

        expect(backward).toBe(forward);
      }),
      fcOptions,
    );
  });

  it("UT-CART-P4 never loses an item that was added", () => {
    fc.assert(
      fc.property(fc.array(row, { maxLength: 10 }), (rows) => {
        resetCart();
        for (const entry of rows) {
          useCartStore.getState().add(entry.dishId, entry.quantity, entry.price);
        }

        const expected = new Map<string, number>();
        for (const entry of rows) {
          const key = `${entry.dishId}:${entry.price}`;
          expected.set(key, (expected.get(key) ?? 0) + entry.quantity);
        }

        const actual = new Map<string, number>();
        for (const item of useCartStore.getState().items) {
          const key = `${item.dishId}:${item.unitPrice}`;
          actual.set(key, (actual.get(key) ?? 0) + item.quantity);
        }

        expect(actual).toEqual(expected);
      }),
      fcOptions,
    );
  });
});
