"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getDish } from "@/data/dishes";

export const COUPON_CODE = "WELCOME20";
export const COUPON_DISCOUNT = 2000;

export interface CartItem {
  dishId: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  coupon: string | null;
  add: (dishId: string) => void;
  remove: (dishId: string) => void;
  increment: (dishId: string) => void;
  decrement: (dishId: string) => void;
  clear: () => void;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      coupon: null,
      add: (dishId) =>
        set((state) => {
          const existing = state.items.find((item) => item.dishId === dishId);
          if (existing) {
            return {
              items: state.items.map((item) =>
                item.dishId === dishId
                  ? { ...item, quantity: item.quantity + 1 }
                  : item,
              ),
            };
          }
          return { items: [...state.items, { dishId, quantity: 1 }] };
        }),
      remove: (dishId) =>
        set((state) => ({
          items: state.items.filter((item) => item.dishId !== dishId),
        })),
      increment: (dishId) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.dishId === dishId
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          ),
        })),
      decrement: (dishId) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.dishId === dishId
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
    return sum + (dish ? dish.price * item.quantity : 0);
  }, 0);
}

export function getCartTotals(items: CartItem[], coupon: string | null) {
  const subtotal = getCartSubtotal(items);
  const discount = coupon === COUPON_CODE ? Math.min(COUPON_DISCOUNT, subtotal) : 0;
  return { subtotal, discount, total: subtotal - discount };
}
