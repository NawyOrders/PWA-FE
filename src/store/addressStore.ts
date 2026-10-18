"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Locale } from "@/lib/i18n/types";

export type AddressType = "home" | "work" | "other";

export interface Address {
  id: string;
  type: AddressType;
  customLabel: string;
  area: string;
  street: string;
  building: string;
  floorApartment: string;
  landmark: string;
  notes: string;
  isDefault: boolean;
}

const seedAddresses: Address[] = [
  {
    id: "seed-home",
    type: "home",
    customLabel: "",
    area: "حي النخيل",
    street: "شارع السلطان محمد",
    building: "12",
    floorApartment: "3 / 8",
    landmark: "",
    notes: "",
    isDefault: true,
  },
  {
    id: "seed-work",
    type: "work",
    customLabel: "",
    area: "كرموز",
    street: "شارع الورديانية",
    building: "4",
    floorApartment: "2 / 5",
    landmark: "بجوار الصيدلية",
    notes: "",
    isDefault: false,
  },
  {
    id: "seed-family",
    type: "other",
    customLabel: "منزل العائلة",
    area: "وسط البلد",
    street: "جريـنفل",
    building: "7",
    floorApartment: "1 / 3",
    landmark: "",
    notes: "",
    isDefault: false,
  },
];

interface AddressState {
  addresses: Address[];
  setAddresses: (addresses: Address[]) => void;
}

export const useAddressStore = create<AddressState>()(
  persist(
    (set) => ({
      addresses: seedAddresses,
      setAddresses: (addresses) => set({ addresses }),
    }),
    {
      name: "nawy-addresses",
      skipHydration: true,
      partialize: ({ addresses }) => ({ addresses }),
    },
  ),
);

export function createAddress(): Address {
  return {
    id: `addr-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    type: "home",
    customLabel: "",
    area: "",
    street: "",
    building: "",
    floorApartment: "",
    landmark: "",
    notes: "",
    isDefault: false,
  };
}

export function formatAddressLine(address: Address, locale: Locale): string {
  const separator = locale === "ar" ? "، " : ", ";
  return [address.area, address.street, address.building, address.floorApartment, address.landmark]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(separator);
}

export function sameAddressList(a: Address[], b: Address[]): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}
