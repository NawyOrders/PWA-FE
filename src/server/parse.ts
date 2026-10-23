import type {
  CheckoutLineInput,
  CheckoutValidationInput,
  CreateOrderInput,
} from "@/lib/checkout";

type RecordValue = Record<string, unknown>;

function isRecord(value: unknown): value is RecordValue {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseItems(value: unknown): CheckoutLineInput[] | null {
  if (!Array.isArray(value)) return null;
  const items: CheckoutLineInput[] = [];
  for (const raw of value) {
    if (!isRecord(raw)) return null;
    if (typeof raw.lineId !== "string" || typeof raw.dishId !== "string") return null;
    if (typeof raw.quantity !== "number") return null;
    const sizeId =
      raw.sizeId === "small" || raw.sizeId === "medium" || raw.sizeId === "large"
        ? raw.sizeId
        : undefined;
    items.push({
      lineId: raw.lineId,
      dishId: raw.dishId,
      quantity: raw.quantity,
      unitPrice: typeof raw.unitPrice === "number" ? raw.unitPrice : undefined,
      sizeId,
      addonIds: Array.isArray(raw.addonIds)
        ? raw.addonIds.filter((id): id is string => typeof id === "string")
        : undefined,
      note: typeof raw.note === "string" ? raw.note : undefined,
    });
  }
  return items;
}

export function parseCheckoutInput(value: unknown): CheckoutValidationInput | null {
  if (!isRecord(value)) return null;
  const items = parseItems(value.items);
  if (!items) return null;
  const fulfillmentMethod =
    value.fulfillmentMethod === "pickup" || value.fulfillmentMethod === "delivery"
      ? value.fulfillmentMethod
      : null;
  if (!fulfillmentMethod) return null;
  return {
    items,
    coupon: typeof value.coupon === "string" ? value.coupon : null,
    fulfillmentMethod,
    branchId: typeof value.branchId === "string" ? value.branchId : undefined,
    zoneId: typeof value.zoneId === "string" ? value.zoneId : undefined,
    requireDeliveryQuote: value.requireDeliveryQuote === true,
  };
}

export function parseCreateOrderInput(value: unknown): CreateOrderInput | null {
  const base = parseCheckoutInput(value);
  if (!base || !isRecord(value)) return null;
  if (typeof value.paymentMethod !== "string" || !value.paymentMethod) return null;
  if (typeof value.idempotencyKey !== "string" || !value.idempotencyKey) return null;
  return {
    ...base,
    requireDeliveryQuote: true,
    paymentMethod: value.paymentMethod,
    idempotencyKey: value.idempotencyKey,
    address: typeof value.address === "string" ? value.address : undefined,
  };
}
