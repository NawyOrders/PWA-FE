import type { LocalizedText } from "@/lib/i18n/types";

export type CheckoutFulfillmentMethod = "delivery" | "pickup";
export type ItemAvailability = "available" | "out-of-stock" | "inactive" | "missing";

export type CheckoutIssueCode =
  | "PRICE_CHANGED"
  | "OUT_OF_STOCK"
  | "INACTIVE"
  | "MISSING_ITEM"
  | "INVALID_QUANTITY"
  | "ZONE_REQUIRED"
  | "INVALID_ZONE"
  | "BRANCH_REQUIRED"
  | "BRANCH_UNAVAILABLE"
  | "EMPTY_CART";

export interface CheckoutIssue {
  code: CheckoutIssueCode;
  lineId?: string;
  dishId?: string;
  itemName?: LocalizedText;
  previousUnitPrice?: number;
  unitPrice?: number;
}

export interface CheckoutLineInput {
  lineId: string;
  dishId: string;
  quantity: number;
  unitPrice?: number;
  sizeId?: "small" | "medium" | "large";
  addonIds?: string[];
  note?: string;
}

export interface CheckoutLineResult {
  lineId: string;
  dishId: string;
  name: LocalizedText;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  availability: ItemAvailability;
  issues: CheckoutIssue[];
}

export interface CheckoutTotals {
  subtotal: number;
  deliveryFee: number;
  discount: number;
  tax: number;
  total: number;
}

export interface CheckoutValidationInput {
  items: CheckoutLineInput[];
  coupon: string | null;
  fulfillmentMethod: CheckoutFulfillmentMethod;
  branchId?: string;
  zoneId?: string;
  requireDeliveryQuote?: boolean;
}

export interface CheckoutValidation {
  ok: boolean;
  branchId: string | null;
  branchName: LocalizedText | null;
  zoneId: string | null;
  zoneName: LocalizedText | null;
  lines: CheckoutLineResult[];
  totals: CheckoutTotals;
  issues: CheckoutIssue[];
}

export interface DeliveryQuote {
  zoneId: string;
  zoneName: LocalizedText;
  branchId: string;
  branchName: LocalizedText;
  fee: number;
}

export interface CreateOrderInput extends CheckoutValidationInput {
  paymentMethod: string;
  address?: string;
  idempotencyKey: string;
}

export interface CreateOrderResult {
  order: import("@/data/orders").Order;
  duplicated: boolean;
}

export function hasBlockingIssue(validation: CheckoutValidation): boolean {
  return !validation.ok;
}

export function issueForLine(
  validation: CheckoutValidation,
  lineId: string,
): CheckoutIssue[] {
  return validation.issues.filter((issue) => issue.lineId === lineId);
}
