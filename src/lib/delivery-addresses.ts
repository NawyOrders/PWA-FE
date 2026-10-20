export type AddressKind = "home" | "work" | "family" | "other";

export type DeliveryAddress = {
  id: string;
  label: string;
  address: string;
  latitude: number;
  longitude: number;
  details?: string;
  kind: AddressKind;
  isDefault: boolean;
};

export const exampleAddresses: DeliveryAddress[] = [
  {
    id: "sample-home",
    label: "المنزل",
    address: "حي النخيل، شارع السلطان محمد",
    latitude: 31.20082,
    longitude: 29.91836,
    kind: "home",
    isDefault: true,
  },
  {
    id: "sample-work",
    label: "العمل",
    address: "كرموز، شارع الورديانية",
    latitude: 31.19438,
    longitude: 29.90042,
    kind: "work",
    isDefault: false,
  },
  {
    id: "sample-family",
    label: "منزل العائلة",
    address: "وسط البلد، جريـنفل",
    latitude: 31.20544,
    longitude: 29.91263,
    kind: "family",
    isDefault: false,
  },
];

const ADDRESS_LIST_KEY = "nawyorders-delivery-addresses";
const ACTIVE_ADDRESS_KEY = "nawyorders-active-delivery-address";
const ADDRESS_CHANGE_EVENT = "nawyorders:addresses-changed";
const exampleAddressSnapshot = JSON.stringify(exampleAddresses);

export function subscribeToAddressChanges(onChange: () => void) {
  if (typeof window === "undefined") return () => undefined;
  window.addEventListener("storage", onChange);
  window.addEventListener(ADDRESS_CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(ADDRESS_CHANGE_EVENT, onChange);
  };
}

export function getAddressSnapshot() {
  return JSON.stringify(getSavedAddresses());
}

export function getExampleAddressSnapshot() {
  return exampleAddressSnapshot;
}

export function getSavedAddresses(): DeliveryAddress[] {
  if (typeof window === "undefined") return exampleAddresses;
  try {
    const saved = window.localStorage.getItem(ADDRESS_LIST_KEY);
    if (!saved) return exampleAddresses;
    const parsed: unknown = JSON.parse(saved);
    if (!Array.isArray(parsed)) return exampleAddresses;
    return parsed.filter(isDeliveryAddress);
  } catch {
    return exampleAddresses;
  }
}

export function saveDeliveryAddress(address: DeliveryAddress): DeliveryAddress[] {
  const existing = getSavedAddresses();
  const addresses = existing.some((item) => item.id === address.id)
    ? existing.map((item) => (item.id === address.id ? address : item))
    : [...existing, address];
  writeAddresses(addresses);
  return addresses;
}

export function confirmDeliveryAddress(address: DeliveryAddress): DeliveryAddress[] {
  const addresses = getSavedAddresses().map((item) => ({
    ...item,
    isDefault: item.id === address.id,
  }));
  const updated = addresses.some((item) => item.id === address.id)
    ? addresses.map((item) => (item.id === address.id ? { ...address, isDefault: true } : item))
    : [...addresses, { ...address, isDefault: true }];
  writeAddresses(updated);
  window.localStorage.setItem(ACTIVE_ADDRESS_KEY, address.id);
  return updated;
}

function writeAddresses(addresses: DeliveryAddress[]) {
  if (typeof window === "undefined") throw new Error("التخزين غير متاح على هذا الجهاز.");
  window.localStorage.setItem(ADDRESS_LIST_KEY, JSON.stringify(addresses));
  window.dispatchEvent(new Event(ADDRESS_CHANGE_EVENT));
}

function isDeliveryAddress(value: unknown): value is DeliveryAddress {
  if (!value || typeof value !== "object") return false;
  const address = value as Partial<DeliveryAddress>;
  return (
    typeof address.id === "string" &&
    typeof address.label === "string" &&
    typeof address.address === "string" &&
    typeof address.latitude === "number" &&
    typeof address.longitude === "number" &&
    typeof address.kind === "string" &&
    typeof address.isDefault === "boolean"
  );
}
