import {
  DEFAULT_BRANCH_ID,
  getBranch,
  getDeliveryZone,
  type BranchId,
} from "@/data/branches";
import type { Order, OrderItem } from "@/data/orders";
import type {
  CheckoutIssue,
  CheckoutLineResult,
  CheckoutTotals,
  CheckoutValidation,
  CheckoutValidationInput,
  CreateOrderInput,
  CreateOrderResult,
  DeliveryQuote,
} from "@/lib/checkout";
import {
  COUPON_CODE,
  COUPON_DISCOUNT,
  calculateTax,
  calculateTotal,
} from "@/lib/pricing";
import {
  getAvailability,
  getCatalogEntry,
  getDishById,
  getUnitPrice,
} from "./catalog";

const orders = new Map<string, Order>();
const idempotency = new Map<string, string>();
let nextOrderNumber = 11255;

function emptyTotals(): CheckoutTotals {
  return { subtotal: 0, deliveryFee: 0, discount: 0, tax: 0, total: 0 };
}

export function quoteDelivery(zoneId: string): DeliveryQuote | null {
  const zone = getDeliveryZone(zoneId);
  if (!zone || !zone.isAvailable) return null;
  const branch = getBranch(zone.branchId);
  if (!branch || !branch.isOpen) return null;
  return {
    zoneId: zone.id,
    zoneName: zone.name,
    branchId: branch.id,
    branchName: branch.name,
    fee: zone.fee,
  };
}

function resolveBranch(
  input: CheckoutValidationInput,
  issues: CheckoutIssue[],
): { branchId: BranchId | null; zoneId: string | null; fee: number } {
  if (input.fulfillmentMethod === "pickup") {
    if (!input.branchId) {
      issues.push({ code: "BRANCH_REQUIRED" });
      return { branchId: null, zoneId: null, fee: 0 };
    }
    const branch = getBranch(input.branchId);
    if (!branch || !branch.isOpen) {
      issues.push({ code: "BRANCH_UNAVAILABLE" });
      return { branchId: null, zoneId: null, fee: 0 };
    }
    return { branchId: branch.id, zoneId: null, fee: 0 };
  }

  if (input.zoneId) {
    const quote = quoteDelivery(input.zoneId);
    if (!quote) {
      issues.push({ code: "INVALID_ZONE" });
      return { branchId: null, zoneId: input.zoneId, fee: 0 };
    }
    return {
      branchId: quote.branchId as BranchId,
      zoneId: quote.zoneId,
      fee: quote.fee,
    };
  }

  if (input.requireDeliveryQuote) {
    issues.push({ code: "ZONE_REQUIRED" });
  }
  if (input.branchId) {
    const branch = getBranch(input.branchId);
    if (branch && branch.isOpen) return { branchId: branch.id, zoneId: null, fee: 0 };
  }
  return { branchId: DEFAULT_BRANCH_ID, zoneId: null, fee: 0 };
}

export function validateCheckout(input: CheckoutValidationInput): CheckoutValidation {
  const issues: CheckoutIssue[] = [];
  if (input.items.length === 0) issues.push({ code: "EMPTY_CART" });

  const resolved = resolveBranch(input, issues);
  const branchId = resolved.branchId ?? DEFAULT_BRANCH_ID;
  const lines: CheckoutLineResult[] = [];
  let subtotal = 0;

  for (const item of input.items) {
    const entry = getCatalogEntry(item.dishId);
    const dish = getDishById(item.dishId);
    const lineIssues: CheckoutIssue[] = [];

    if (!dish || !entry) {
      lineIssues.push({ code: "MISSING_ITEM", lineId: item.lineId, dishId: item.dishId });
      lines.push({
        lineId: item.lineId,
        dishId: item.dishId,
        name: dish?.name ?? { ar: item.dishId, en: item.dishId },
        quantity: item.quantity,
        unitPrice: 0,
        lineTotal: 0,
        availability: "missing",
        issues: lineIssues,
      });
      issues.push(...lineIssues);
      continue;
    }

    const quantity = Number.isInteger(item.quantity) && item.quantity > 0 ? item.quantity : 0;
    if (quantity === 0) {
      lineIssues.push({
        code: "INVALID_QUANTITY",
        lineId: item.lineId,
        dishId: item.dishId,
        itemName: dish.name,
      });
    }

    const unitPrice = getUnitPrice(entry, item.sizeId);
    if (typeof item.unitPrice === "number" && item.unitPrice !== unitPrice) {
      lineIssues.push({
        code: "PRICE_CHANGED",
        lineId: item.lineId,
        dishId: item.dishId,
        itemName: dish.name,
        previousUnitPrice: item.unitPrice,
        unitPrice,
      });
    }

    const availability = getAvailability(entry, branchId);
    if (availability === "out-of-stock") {
      lineIssues.push({
        code: "OUT_OF_STOCK",
        lineId: item.lineId,
        dishId: item.dishId,
        itemName: dish.name,
        unitPrice,
      });
    } else if (availability === "inactive") {
      lineIssues.push({
        code: "INACTIVE",
        lineId: item.lineId,
        dishId: item.dishId,
        itemName: dish.name,
        unitPrice,
      });
    }

    const lineTotal = unitPrice * quantity;
    subtotal += lineTotal;
    lines.push({
      lineId: item.lineId,
      dishId: item.dishId,
      name: dish.name,
      quantity,
      unitPrice,
      lineTotal,
      availability,
      issues: lineIssues,
    });
    issues.push(...lineIssues);
  }

  const discount = input.coupon === COUPON_CODE ? COUPON_DISCOUNT : 0;
  const tax = calculateTax(subtotal, discount);
  const totals: CheckoutTotals = {
    subtotal,
    deliveryFee: resolved.fee,
    discount,
    tax,
    total: calculateTotal({
      subtotal,
      deliveryFee: resolved.fee,
      discount,
      tax,
    }),
  };
  const branch = getBranch(branchId);
  const zone = resolved.zoneId ? getDeliveryZone(resolved.zoneId) : undefined;

  return {
    ok: issues.length === 0,
    branchId,
    branchName: branch?.name ?? null,
    zoneId: resolved.zoneId,
    zoneName: zone?.name ?? null,
    lines,
    totals,
    issues,
  };
}

function toOrderItems(validation: CheckoutValidation): OrderItem[] {
  return validation.lines.map((line) => ({
    dishId: line.dishId,
    name: line.name,
    quantity: line.quantity,
    unitPrice: line.unitPrice,
  }));
}

export function createOrder(input: CreateOrderInput): CreateOrderResult | { issues: CheckoutIssue[] } {
  const existingId = idempotency.get(input.idempotencyKey);
  if (existingId) {
    const existing = orders.get(existingId);
    if (existing) return { order: existing, duplicated: true };
  }

  const validation = validateCheckout({ ...input, requireDeliveryQuote: true });
  const blockingIssues = validation.issues.filter(
    (issue) => issue.code !== "PRICE_CHANGED",
  );
  if (blockingIssues.length > 0) return { issues: blockingIssues };

  const id = `order-${nextOrderNumber}`;
  const order: Order = {
    id,
    number: String(nextOrderNumber),
    status: "accepted",
    date: new Date().toISOString(),
    items: toOrderItems(validation),
    deliveryFee: validation.totals.deliveryFee,
    discount: validation.totals.discount,
    tax: validation.totals.tax,
    fulfillmentMethod: input.fulfillmentMethod,
    branchId: validation.branchId ?? undefined,
    branchName: validation.branchName ?? undefined,
    zoneId: validation.zoneId ?? undefined,
    zoneName: validation.zoneName ?? undefined,
    address: input.address,
  };
  nextOrderNumber += 1;
  orders.set(id, order);
  idempotency.set(input.idempotencyKey, id);
  return { order, duplicated: false };
}

export function getServerOrder(id: string): Order | undefined {
  return orders.get(id);
}

export function resetServerOrders(): void {
  orders.clear();
  idempotency.clear();
  nextOrderNumber = 11255;
}

export function emptyCheckoutTotals(): CheckoutTotals {
  return emptyTotals();
}
