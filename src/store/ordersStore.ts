"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { orders as seedOrders, type Order, type OrderItem } from "@/data/orders";

export interface NewOrderInput {
  items: OrderItem[];
  deliveryFee: number;
  discount: number;
}

interface OrdersState {
  orders: Order[];
  addOrder: (input: NewOrderInput) => Order;
  addExistingOrder: (order: Order) => void;
}

function nextNumber(existing: Order[]): string {
  const highest = existing.reduce(
    (value, order) => Math.max(value, Number(order.number) || 0),
    1000,
  );
  return String(highest + 1);
}

export const useOrdersStore = create<OrdersState>()(
  persist(
    (set, get) => ({
      orders: seedOrders,
      addOrder: (input) => {
        const current = get().orders;
        const number = nextNumber(current);
        const order: Order = {
          id: `order-${number}`,
          number,
          status: "processing",
          date: new Date().toISOString(),
          items: input.items,
          deliveryFee: input.deliveryFee,
          discount: input.discount,
        };
        set({ orders: [order, ...current] });
        return order;
      },
      addExistingOrder: (order) => {
        set((state) => ({
          orders: state.orders.some((existing) => existing.id === order.id)
            ? state.orders
            : [order, ...state.orders],
        }));
      },
    }),
    { name: "nawy-orders", skipHydration: true },
  ),
);
