import type { CartItem } from "./types";

const CART_KEY = "nawyorders-cart";

export function addCartItem(item: Omit<CartItem, "addedAt">) {
  let currentItems: CartItem[] = [];

  try {
    const savedCart = window.localStorage.getItem(CART_KEY);
    const parsedCart: unknown = savedCart ? JSON.parse(savedCart) : [];
    if (Array.isArray(parsedCart)) currentItems = parsedCart as CartItem[];
  } catch {
    currentItems = [];
  }

  const nextItems = [...currentItems, { ...item, addedAt: Date.now() }];
  try {
    window.localStorage.setItem(CART_KEY, JSON.stringify(nextItems));
  } catch {
    // The current session still receives the cart update if storage is unavailable.
  }
  window.dispatchEvent(new CustomEvent("nawyorders:cart-updated", { detail: nextItems }));

  return nextItems.reduce((count, cartItem) => count + cartItem.quantity, 0);
}

export function getCartCount() {
  try {
    const savedCart = window.localStorage.getItem(CART_KEY);
    const parsedCart: unknown = savedCart ? JSON.parse(savedCart) : [];
    if (!Array.isArray(parsedCart)) return 0;
    return parsedCart.reduce((count, item) => count + (typeof item.quantity === "number" ? item.quantity : 0), 0);
  } catch {
    return 0;
  }
}
