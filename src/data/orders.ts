export type OrderStatus = "delivered" | "cancelled" | "processing";

export interface OrderItem {
  dishId: string;
  quantity: number;
  unitPrice?: number;
  sizeId?: "small" | "medium" | "large";
  addonIds?: string[];
  note?: string;
}

export interface Order {
  id: string;
  number: string;
  status: OrderStatus;
  date: string;
  items: OrderItem[];
  deliveryFee: number;
  discount?: number;
}

export const DELIVERY_FEE = 2000;

export const orders: Order[] = [
  {
    id: "order-1042",
    number: "1042",
    status: "delivered",
    date: "2026-09-28T19:30:00.000Z",
    deliveryFee: 2000,
    items: [
      {
        dishId: "gourmet-burger",
        quantity: 2,
        addonIds: ["cheese", "pickles"],
        note: "No onions",
      },
      { dishId: "cheese-pizza", quantity: 1 },
    ],
  },
  {
    id: "order-1038",
    number: "1038",
    status: "cancelled",
    date: "2026-09-21T14:05:00.000Z",
    deliveryFee: 2000,
    items: [{ dishId: "chicken-shawarma", quantity: 3, note: "Extra spicy" }],
  },
  {
    id: "order-1031",
    number: "1031",
    status: "delivered",
    date: "2026-09-12T20:15:00.000Z",
    deliveryFee: 2000,
    items: [
      { dishId: "beef-shawarma", quantity: 1 },
      { dishId: "mixed-donuts", quantity: 2 },
    ],
  },
];
