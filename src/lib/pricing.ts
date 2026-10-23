export const COUPON_CODE = "WELCOME20";
export const COUPON_DISCOUNT = 2000;
export const TAX_RATE = 0;

export interface PriceTotalsInput {
  subtotal: number;
  deliveryFee: number;
  discount: number;
  tax: number;
}

export function calculateTotal({
  subtotal,
  deliveryFee,
  discount,
  tax,
}: PriceTotalsInput): number {
  return Math.max(0, subtotal - discount + deliveryFee + tax);
}

export function calculateTax(subtotal: number, discount: number): number {
  return Math.round(Math.max(0, subtotal - discount) * TAX_RATE);
}
