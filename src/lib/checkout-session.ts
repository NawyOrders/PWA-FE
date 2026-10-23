import type { DeliveryQuote } from "./checkout";

const QUOTE_KEY = "nawyorders-delivery-quote";
const BRANCH_KEY = "nawyorders-selected-branch";
const ADDRESS_KEY = "nawyorders-selected-address";
const IDEMPOTENCY_KEY = "nawyorders-checkout-key";

function readJson<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can be unavailable in private browsing; checkout still works in-session.
  }
}

export function saveDeliveryQuote(quote: DeliveryQuote): void {
  writeJson(QUOTE_KEY, quote);
}

export function readDeliveryQuote(): DeliveryQuote | null {
  return readJson<DeliveryQuote>(QUOTE_KEY);
}

export function saveSelectedBranch(branch: {
  id: string;
  name: { ar: string; en: string };
}): void {
  writeJson(BRANCH_KEY, branch);
}

export function readSelectedBranch(): {
  id: string;
  name: { ar: string; en: string };
} | null {
  return readJson(BRANCH_KEY);
}

export interface SelectedAddressDetails {
  address: string;
  latitude: number;
  longitude: number;
  zoneId: string;
  zoneName: { ar: string; en: string };
  branchId: string;
  branchName: { ar: string; en: string };
  deliveryFee: number;
}

export function saveSelectedAddress(details: SelectedAddressDetails): void {
  writeJson(ADDRESS_KEY, details);
}

export function readSelectedAddress(): SelectedAddressDetails | null {
  const value = readJson<Partial<SelectedAddressDetails>>(ADDRESS_KEY);
  if (!value || typeof value.address !== "string") return null;
  return {
    address: value.address,
    latitude: typeof value.latitude === "number" ? value.latitude : 0,
    longitude: typeof value.longitude === "number" ? value.longitude : 0,
    zoneId: typeof value.zoneId === "string" ? value.zoneId : "",
    zoneName: value.zoneName ?? { ar: "", en: "" },
    branchId: typeof value.branchId === "string" ? value.branchId : "",
    branchName: value.branchName ?? { ar: "", en: "" },
    deliveryFee: typeof value.deliveryFee === "number" ? value.deliveryFee : 0,
  };
}

export function clearCheckoutQuote(): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(QUOTE_KEY);
}

export function getCheckoutIdempotencyKey(): string {
  if (typeof window === "undefined") return "server-render";
  const existing = window.sessionStorage.getItem(IDEMPOTENCY_KEY);
  if (existing) return existing;
  const key =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `checkout-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  window.sessionStorage.setItem(IDEMPOTENCY_KEY, key);
  return key;
}

export function rotateCheckoutIdempotencyKey(): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(IDEMPOTENCY_KEY);
}
