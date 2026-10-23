import type { LocalizedText } from "@/lib/i18n/types";

export type BranchId = "downtown" | "nakheel" | "karmouz";

export interface Branch {
  id: BranchId;
  name: LocalizedText;
  address: LocalizedText;
  isOpen: boolean;
}

export interface DeliveryZone {
  id: string;
  name: LocalizedText;
  branchId: BranchId;
  fee: number;
  isAvailable: boolean;
}

export const branches: Branch[] = [
  {
    id: "downtown",
    name: { ar: "فرع وسط البلد", en: "Downtown Branch" },
    address: { ar: "وسط البلد، القاهرة", en: "Downtown, Cairo" },
    isOpen: true,
  },
  {
    id: "nakheel",
    name: { ar: "فرع النخيل", en: "El Nakheel Branch" },
    address: { ar: "حي النخيل، الإسكندرية", en: "El Nakheel, Alexandria" },
    isOpen: true,
  },
  {
    id: "karmouz",
    name: { ar: "فرع كرموز", en: "Karmouz Branch" },
    address: { ar: "كرموز، الإسكندرية", en: "Karmouz, Alexandria" },
    isOpen: true,
  },
];

export const deliveryZones: DeliveryZone[] = [
  {
    id: "zamalek",
    name: { ar: "الزمالك", en: "Zamalek" },
    branchId: "downtown",
    fee: 3000,
    isAvailable: true,
  },
  {
    id: "downtown",
    name: { ar: "وسط البلد", en: "Downtown" },
    branchId: "downtown",
    fee: 2500,
    isAvailable: true,
  },
  {
    id: "mohandessin",
    name: { ar: "المهندسين", en: "Mohandessin" },
    branchId: "downtown",
    fee: 3500,
    isAvailable: true,
  },
  {
    id: "nakheel",
    name: { ar: "حي النخيل", en: "El Nakheel" },
    branchId: "nakheel",
    fee: 2000,
    isAvailable: true,
  },
  {
    id: "karmouz",
    name: { ar: "كرموز", en: "Karmouz" },
    branchId: "karmouz",
    fee: 2000,
    isAvailable: true,
  },
];

export const DEFAULT_BRANCH_ID: BranchId = "downtown";

export function getBranch(id: string): Branch | undefined {
  return branches.find((branch) => branch.id === id);
}

export function getDeliveryZone(id: string): DeliveryZone | undefined {
  return deliveryZones.find((zone) => zone.id === id);
}
