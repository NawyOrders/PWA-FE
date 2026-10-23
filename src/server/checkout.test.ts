import { beforeEach, describe, expect, it } from "vitest";
import { getDish } from "@/data/dishes";
import { resetCatalog, updateCatalogEntry } from "./catalog";
import {
  createOrder,
  quoteDelivery,
  resetServerOrders,
  validateCheckout,
} from "./checkout";
import type { CheckoutValidationInput, CreateOrderInput } from "@/lib/checkout";

const dish = getDish("crack-burger");

function line(overrides: Partial<CheckoutValidationInput["items"][number]> = {}) {
  return {
    lineId: "line-1",
    dishId: dish?.id ?? "",
    quantity: 1,
    unitPrice: dish?.price ?? 0,
    ...overrides,
  };
}

function deliveryInput(
  overrides: Partial<CheckoutValidationInput> = {},
): CheckoutValidationInput {
  return {
    items: [line()],
    coupon: null,
    fulfillmentMethod: "delivery",
    zoneId: "zamalek",
    requireDeliveryQuote: true,
    ...overrides,
  };
}

function orderInput(overrides: Partial<CreateOrderInput> = {}): CreateOrderInput {
  return {
    ...deliveryInput(),
    paymentMethod: "cash",
    idempotencyKey: "checkout-test-key",
    ...overrides,
  };
}

beforeEach(() => {
  resetCatalog();
  resetServerOrders();
});

describe("delivery quotes", () => {
  it("UT-QUOTE-01 quotes the zone branch and authoritative fee", () => {
    expect(quoteDelivery("zamalek")).toEqual({
      zoneId: "zamalek",
      zoneName: expect.objectContaining({ en: "Zamalek" }),
      branchId: "downtown",
      branchName: expect.objectContaining({ en: "Downtown Branch" }),
      fee: 3000,
    });
  });

  it("UT-QUOTE-02 rejects an unknown zone", () => {
    expect(quoteDelivery("unknown-zone")).toBeNull();
  });
});

describe("checkout validation", () => {
  it("UT-VALIDATE-01 corrects a client price and reports the change", () => {
    const result = validateCheckout(
      deliveryInput({ items: [line({ unitPrice: 1 })] }),
    );

    expect(result.lines[0].unitPrice).toBe(dish?.price);
    expect(result.lines[0].lineTotal).toBe(dish?.price);
    expect(result.totals.subtotal).toBe(dish?.price);
    expect(result.issues).toContainEqual(
      expect.objectContaining({
        code: "PRICE_CHANGED",
        previousUnitPrice: 1,
        unitPrice: dish?.price,
      }),
    );
  });

  it("UT-VALIDATE-02 uses the zone fee and ignores pickup fees", () => {
    const delivery = validateCheckout(deliveryInput());
    expect(delivery.totals.deliveryFee).toBe(3000);
    expect(delivery.branchId).toBe("downtown");

    const pickup = validateCheckout(
      deliveryInput({
        fulfillmentMethod: "pickup",
        branchId: "nakheel",
        zoneId: undefined,
      }),
    );
    expect(pickup.totals.deliveryFee).toBe(0);
    expect(pickup.branchId).toBe("nakheel");
  });

  it("UT-VALIDATE-03 requires a delivery zone", () => {
    const result = validateCheckout(deliveryInput({ zoneId: undefined }));

    expect(result.ok).toBe(false);
    expect(result.issues).toContainEqual(
      expect.objectContaining({ code: "ZONE_REQUIRED" }),
    );
  });

  it("UT-VALIDATE-04 rejects availability only in the selected branch", () => {
    updateCatalogEntry({
      dishId: dish?.id ?? "",
      branchId: "nakheel",
      availability: "out-of-stock",
    });

    const nakheel = validateCheckout(
      deliveryInput({
        fulfillmentMethod: "pickup",
        branchId: "nakheel",
        zoneId: undefined,
      }),
    );
    expect(nakheel.ok).toBe(false);
    expect(nakheel.issues).toContainEqual(
      expect.objectContaining({ code: "OUT_OF_STOCK", dishId: dish?.id }),
    );

    const downtown = validateCheckout(
      deliveryInput({
        fulfillmentMethod: "pickup",
        branchId: "downtown",
        zoneId: undefined,
      }),
    );
    expect(downtown.ok).toBe(true);
    expect(downtown.lines[0].availability).toBe("available");
  });

  it("UT-VALIDATE-05 rejects inactive and missing dishes", () => {
    updateCatalogEntry({ dishId: dish?.id ?? "", active: false });
    const inactive = validateCheckout(deliveryInput());
    expect(inactive.issues).toContainEqual(
      expect.objectContaining({ code: "INACTIVE" }),
    );

    const missing = validateCheckout(
      deliveryInput({ items: [line({ dishId: "not-a-dish" })] }),
    );
    expect(missing.issues).toContainEqual(
      expect.objectContaining({ code: "MISSING_ITEM" }),
    );
    expect(missing.lines[0].availability).toBe("missing");
  });

  it("UT-VALIDATE-06 computes coupon and totals", () => {
    const result = validateCheckout(
      deliveryInput({ items: [line({ quantity: 2 })], coupon: "WELCOME20" }),
    );

    expect(result.totals.subtotal).toBe((dish?.price ?? 0) * 2);
    expect(result.totals.discount).toBe(2000);
    expect(result.totals.total).toBe((dish?.price ?? 0) * 2 - 2000 + 3000);
  });

  it("UT-VALIDATE-07 rejects an empty cart", () => {
    const result = validateCheckout(deliveryInput({ items: [] }));

    expect(result.ok).toBe(false);
    expect(result.issues).toContainEqual(
      expect.objectContaining({ code: "EMPTY_CART" }),
    );
  });
});

describe("server order creation", () => {
  it("UT-ORDER-01 creates an accepted order with authoritative values", () => {
    const result = createOrder(
      orderInput({ items: [line({ unitPrice: 1, quantity: 2 })] }),
    );

    expect("order" in result).toBe(true);
    if (!("order" in result)) return;
    expect(result.order.status).toBe("accepted");
    expect(result.order.deliveryFee).toBe(3000);
    expect(result.order.branchId).toBe("downtown");
    expect(result.order.items[0].unitPrice).toBe(dish?.price);
    expect(result.duplicated).toBe(false);
  });

  it("UT-ORDER-02 is idempotent for the same key", () => {
    const first = createOrder(orderInput());
    const second = createOrder(orderInput());

    expect("order" in first && "order" in second).toBe(true);
    if (!("order" in first) || !("order" in second)) return;
    expect(second.order.id).toBe(first.order.id);
    expect(second.duplicated).toBe(true);
  });

  it("UT-ORDER-03 refuses an unavailable line", () => {
    updateCatalogEntry({
      dishId: dish?.id ?? "",
      branchId: "downtown",
      availability: "out-of-stock",
    });
    const result = createOrder(orderInput());

    expect("issues" in result).toBe(true);
    if (!("issues" in result)) return;
    expect(result.issues).toContainEqual(
      expect.objectContaining({ code: "OUT_OF_STOCK" }),
    );
  });
});
