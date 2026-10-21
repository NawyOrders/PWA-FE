/**
 * Object factories for the unit tests (TESTING.md section 4).
 * Every factory returns a valid object and accepts overrides.
 */
import type { Dish } from "@/data/dishes";
import type { Order, OrderItem, OrderStatus } from "@/data/orders";
import type { User } from "@/data/user";
import type { Address, AddressType } from "@/store/addressStore";
import type { CartItem } from "@/store/cartStore";
import type { ChatMessageInput } from "@/lib/api";

export function makeDish(overrides: Partial<Dish> = {}): Dish {
  return {
    id: "test-dish",
    name: { ar: "طبق تجريبي", en: "Test dish" },
    description: { ar: "وصف تجريبي", en: "Test description" },
    price: 12000,
    sizePrices: { small: 9600, medium: 12000, large: 14400 },
    image: "crack-burgers",
    categoryId: "burger",
    ...overrides,
  };
}

export function makeCartItem(overrides: Partial<CartItem> = {}): CartItem {
  return {
    dishId: "crack-burger",
    quantity: 1,
    unitPrice: 12000,
    ...overrides,
  };
}

export function makeAddress(overrides: Partial<Address> = {}): Address {
  return {
    id: "addr-test",
    type: "home" as AddressType,
    customLabel: "",
    area: "حي النخيل",
    street: "شارع السلطان محمد",
    building: "12",
    floorApartment: "3 / 8",
    landmark: "",
    notes: "",
    isDefault: false,
    ...overrides,
  };
}

export function makeOrderItem(overrides: Partial<OrderItem> = {}): OrderItem {
  return {
    dishId: "crack-burger",
    quantity: 1,
    ...overrides,
  };
}

export function makeOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: "order-test",
    number: "1000",
    status: "delivered" as OrderStatus,
    date: "2026-10-01T12:00:00.000Z",
    items: [makeOrderItem()],
    deliveryFee: 2000,
    discount: 0,
    ...overrides,
  };
}

/**
 * The repository has no persisted chat store yet, so the message factory
 * produces the shape accepted by the chat API (`src/lib/api.ts`).
 */
export function makeMessage(overrides: Partial<ChatMessageInput> = {}): ChatMessageInput {
  return {
    name: "محمد",
    phone: "01012345678",
    message: "مرحبا، اريد معرفة تفاصيل الطلب",
    ...overrides,
  };
}

export function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: "user-test",
    name: "جميل جمال",
    email: "user@nawyorders.com",
    phone: "01012345678",
    points: 120,
    ...overrides,
  };
}
