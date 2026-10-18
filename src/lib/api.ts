import type { Address } from "@/store/addressStore";

const SAVE_NAME_DELAY_MS = 600;
const ADDRESSES_DELAY_MS = 600;

export async function saveDisplayName(name: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, SAVE_NAME_DELAY_MS));
  if (!name.trim()) {
    throw new Error("Name is required");
  }
}

export async function fetchAddresses(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ADDRESSES_DELAY_MS));
}

export async function saveAddresses(addresses: Address[]): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ADDRESSES_DELAY_MS));
  if (addresses.length > 5) {
    throw new Error("Maximum of 5 addresses");
  }
}
