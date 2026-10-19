import type { Address } from "@/store/addressStore";
import { faqItems, type FaqItem } from "@/data/faq";

const SAVE_NAME_DELAY_MS = 600;
const ADDRESSES_DELAY_MS = 600;

const FAQ_DELAY_MS = 500;
let faqCache: FaqItem[] | null = null;

export async function fetchFaq(): Promise<FaqItem[]> {
  if (faqCache) return faqCache;
  await new Promise((resolve) => setTimeout(resolve, FAQ_DELAY_MS));
  faqCache = faqItems;
  return faqCache;
}

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

const SUPPORT_DELAY_MS = 700;

export interface ChatMessageInput {
  name: string;
  phone: string;
  message: string;
}

export interface FeedbackInput {
  rating: number;
  message: string;
  email?: string;
}

export type ReportCategory = "order" | "payment" | "bug" | "other";

export interface ReportInput {
  category: ReportCategory;
  description: string;
  orderId?: string;
  attachmentName?: string;
}

export async function sendChatMessage(input: ChatMessageInput): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, SUPPORT_DELAY_MS));
  if (!input.message.trim()) {
    throw new Error("Message is required");
  }
}

export async function sendFeedback(input: FeedbackInput): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, SUPPORT_DELAY_MS));
  if (input.rating < 1 || input.rating > 5) {
    throw new Error("Rating must be between 1 and 5");
  }
}

export async function sendReport(input: ReportInput): Promise<{ ticket: string }> {
  await new Promise((resolve) => setTimeout(resolve, SUPPORT_DELAY_MS));
  if (!input.description.trim()) {
    throw new Error("Description is required");
  }
  return { ticket: `TK-${Date.now().toString(36).toUpperCase().slice(-6)}` };
}
