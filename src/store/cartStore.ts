"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getDish } from "@/data/dishes";
import { DELIVERY_FEE } from "@/data/orders";

export const COUPON_CODE = "WELCOME20";
export const COUPON_DISCOUNT = 2000;
export type FulfillmentMethod = "delivery" | "pickup";

export interface CartItem {
  dishId: string;
  quantity: number;
  unitPrice?: number;
}

export function getCartItemKey(item: CartItem): string {
  const basePrice = getDish(item.dishId)?.price ?? 0;
  return `${item.dishId}:${item.unitPrice ?? basePrice}`;
}

interface CartState {
  items: CartItem[];
  coupon: string | null;
  fulfillmentMethod: FulfillmentMethod;
  setFulfillmentMethod: (method: FulfillmentMethod) => void;
  add: (dishId: string, quantity?: number, unitPrice?: number) => void;
  remove: (itemKey: string) => void;
  increment: (itemKey: string) => void;
  decrement: (itemKey: string) => void;
  clear: () => void;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      coupon: null,
      fulfillmentMethod: "delivery",
      setFulfillmentMethod: (fulfillmentMethod) => set({ fulfillmentMethod }),
      add: (dishId, quantity = 1, unitPrice) =>
        set((state) => {
          const basePrice = getDish(dishId)?.price ?? 0;
          const selectedPrice = unitPrice ?? basePrice;
          const existing = state.items.find(
            (item) => item.dishId === dishId && (item.unitPrice ?? basePrice) === selectedPrice,
          );
          if (existing) {
            return {
              items: state.items.map((item) =>
                getCartItemKey(item) === getCartItemKey(existing)
                  ? { ...item, quantity: item.quantity + quantity, unitPrice: selectedPrice }
                  : item,
              ),
            };
          }
          return { items: [...state.items, { dishId, quantity, unitPrice: selectedPrice }] };
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
      clear: () => set({ items: [], coupon: null }),
      applyCoupon: (code) => {
        const normalized = code.trim().toUpperCase();
        if (normalized === COUPON_CODE) {
          set({ coupon: normalized });
          return true;
        }
        return false;
      },
      removeCoupon: () => set({ coupon: null }),
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
) {
  const { subtotal, discount } = getCartTotals(items, coupon);
  const deliveryFee = method === "delivery" ? DELIVERY_FEE : 0;
  return { subtotal, deliveryFee, discount, total: subtotal + deliveryFee - discount };
}
