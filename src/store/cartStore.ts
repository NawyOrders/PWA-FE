"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getDish } from "@/data/dishes";

import { markAddedToCart } from "@/lib/pwa";
import { COUPON_CODE, COUPON_DISCOUNT } from "@/lib/pricing";
import type { CheckoutLineResult, ItemAvailability } from "@/lib/checkout";
export { COUPON_CODE, COUPON_DISCOUNT };
export type FulfillmentMethod = "delivery" | "pickup";

export interface CartItem {
  lineId?: string;
  dishId: string;
  quantity: number;
  unitPrice?: number;
  sizeId?: "small" | "medium" | "large";
  addonIds?: string[];
  note?: string;
  availability?: ItemAvailability;
  previousUnitPrice?: number;
}

export function getCartItemKey(item: CartItem): string {
  const basePrice = getDish(item.dishId)?.price ?? 0;
  const addonKey = [...(item.addonIds ?? [])].sort().join(",");
  const noteKey = encodeURIComponent(item.note?.trim() ?? "");
  return `${item.dishId}:${item.unitPrice ?? basePrice}:${addonKey}:${noteKey}`;
}

export function getCartLineId(item: CartItem): string {
  return item.lineId ?? getCartItemKey(item);
}

interface CartState {
  items: CartItem[];
  coupon: string | null;
  fulfillmentMethod: FulfillmentMethod;
  deliveryFee: number | null;
  setFulfillmentMethod: (method: FulfillmentMethod) => void;
  add: (
    dishId: string,
    quantity?: number,
    unitPrice?: number,
    customization?: { sizeId?: CartItem["sizeId"]; addonIds?: string[]; note?: string },
  ) => void;
  update: (itemKey: string, item: CartItem) => void;
  remove: (itemKey: string) => void;
  increment: (itemKey: string) => void;
  decrement: (itemKey: string) => void;
  clear: () => void;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  applyValidation: (lines: CheckoutLineResult[]) => void;
  setFulfillmentDeliveryFee: (fee: number) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      coupon: null,
      fulfillmentMethod: "delivery",
      deliveryFee: null,
      setFulfillmentMethod: (fulfillmentMethod) => set({ fulfillmentMethod }),
      add: (dishId, quantity = 1, unitPrice, customization) => {
        markAddedToCart();
        set((state) => {
          const basePrice = getDish(dishId)?.price ?? 0;
          const selectedPrice = unitPrice ?? basePrice;
          const addonIds = [...new Set(customization?.addonIds ?? [])].sort();
          const note = customization?.note?.trim() ?? "";
          const newItem: CartItem = {
            dishId,
            quantity,
            unitPrice: selectedPrice,
            ...(customization?.sizeId ? { sizeId: customization.sizeId } : {}),
            ...(addonIds.length > 0 ? { addonIds } : {}),
            ...(note ? { note } : {}),
          };
          newItem.lineId = getCartLineId(newItem);
          const newItemKey = getCartItemKey(newItem);
          const existing = state.items.find((item) => getCartItemKey(item) === newItemKey);
          if (existing) {
            return {
              items: state.items.map((item) =>
                getCartItemKey(item) === getCartItemKey(existing)
                  ? { ...item, quantity: item.quantity + quantity }
                  : item,
              ),
            };
          }
          return { items: [...state.items, newItem] };
        });
      },
      update: (itemKey, item) =>
        set((state) => {
          if (!state.items.some((current) => getCartItemKey(current) === itemKey)) {
            return state;
          }
          const normalized: CartItem = {
            ...item,
            addonIds: [...new Set(item.addonIds ?? [])].sort(),
            note: item.note?.trim() ?? "",
            lineId: item.lineId ?? itemKey,
          };
          const updatedKey = getCartItemKey(normalized);
          const matching = state.items.find(
            (current) => getCartItemKey(current) === updatedKey && getCartItemKey(current) !== itemKey,
          );
          if (matching) {
            return {
              items: state.items
                .filter((current) => getCartItemKey(current) !== itemKey)
                .map((current) =>
                  getCartItemKey(current) === updatedKey
                    ? { ...current, quantity: current.quantity + normalized.quantity }
                    : current,
                ),
            };
          }
          return {
            items: state.items.map((current) =>
              getCartItemKey(current) === itemKey ? normalized : current,
            ),
          };
        }),
      remove: (itemKey) =>
        set((state) => ({
          items: state.items.filter((item) => getCartItemKey(item) !== itemKey),
        })),
      increment: (itemKey) =>
        set((state) => ({
          items: state.items.map((item) =>
            getCartItemKey(item) === itemKey
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          ),
        })),
      decrement: (itemKey) =>
        set((state) => ({
          items: state.items.map((item) =>
            getCartItemKey(item) === itemKey
              ? { ...item, quantity: Math.max(1, item.quantity - 1) }
              : item,
          ),
        })),
      clear: () => set({ items: [], coupon: null, deliveryFee: null }),
      applyCoupon: (code) => {
        const normalized = code.trim().toUpperCase();
        if (normalized === COUPON_CODE) {
          set({ coupon: normalized });
          return true;
        }
        return false;
      },
      removeCoupon: () => set({ coupon: null }),
      applyValidation: (lines) =>
        set((state) => {
          const lineMap = new Map(lines.map((line) => [line.lineId, line]));
          return {
            items: state.items.map((item) => {
              const key = getCartLineId(item);
              const match = lineMap.get(key) ?? lineMap.get(getCartItemKey(item));
              if (!match) return item;
              return {
                ...item,
                lineId: key,
                unitPrice: match.unitPrice,
                previousUnitPrice: item.unitPrice,
                availability: match.availability,
              };
            }),
          };
        }),
      setFulfillmentDeliveryFee: (fee) => set({ deliveryFee: fee }),
    }),
    { name: "nawy-cart", skipHydration: true },
  ),
);

export function getCartCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function getCartSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => {
    const dish = getDish(item.dishId);
    return sum + (dish ? (item.unitPrice ?? dish.price) * item.quantity : 0);
  }, 0);
}

export function getCartTotals(items: CartItem[], coupon: string | null) {
  const subtotal = getCartSubtotal(items);
  const discount = coupon === COUPON_CODE ? Math.min(COUPON_DISCOUNT, subtotal) : 0;
  return { subtotal, discount, total: subtotal - discount };
}

export function getFulfillmentTotals(
  items: CartItem[],
  coupon: string | null,
  method: FulfillmentMethod,
  deliveryFee?: number | null,
) {
  const { subtotal, discount } = getCartTotals(items, coupon);
  const fee = method === "delivery" ? deliveryFee ?? 0 : 0;
  return { subtotal, deliveryFee: fee, discount, total: subtotal + fee - discount };
}
