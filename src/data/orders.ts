import type { LocalizedText } from "@/lib/i18n/types";

export type OrderStatus = "accepted" | "delivered" | "cancelled" | "processing";

export interface OrderItem {
  dishId: string;
  name?: LocalizedText;
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
  tax?: number;
  fulfillmentMethod?: "delivery" | "pickup";
  branchId?: string;
  branchName?: LocalizedText;
  zoneId?: string;
  zoneName?: LocalizedText;
  address?: string;
}

export const orders: Order[] = [
  {
    id: "order-1051",
    number: "1051",
    status: "accepted",
    date: "2026-10-23T18:12:00.000Z",
    deliveryFee: 3000,
    tax: 0,
    fulfillmentMethod: "delivery",
    branchId: "downtown",
    branchName: { ar: "فرع وسط البلد", en: "Downtown Branch" },
    zoneId: "zamalek",
    zoneName: { ar: "الزمالك", en: "Zamalek" },
    address: "الزمالك، شارع البرازيل، مبنى 14",
    items: [
      {
        dishId: "gourmet-burger",
        quantity: 1,
        unitPrice: 14500,
        addonIds: ["cheese", "pickles"],
        note: "بدون بصل",
      },
      { dishId: "mixed-donuts", quantity: 2 },
    ],
  },
  {
    id: "order-1042",
    number: "1042",
    status: "delivered",
    date: "2026-09-28T19:30:00.000Z",
    deliveryFee: 2000,
    fulfillmentMethod: "delivery",
    branchId: "nakheel",
    branchName: { ar: "فرع النخيل", en: "El Nakheel Branch" },
    zoneId: "nakheel",
    zoneName: { ar: "حي النخيل", en: "El Nakheel" },
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
