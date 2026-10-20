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

export type FeedbackType = "suggestion" | "complaint" | "praise" | "other";

export interface FeedbackInput {
  rating: number;
  type: FeedbackType;
  message: string;
  photoName?: string;
  userId?: string;
}

export class RateLimitError extends Error {}

const FEEDBACK_LIMIT = 5;
const FEEDBACK_WINDOW_MS = 60 * 60 * 1000;
const FEEDBACK_ATTEMPTS_KEY = "nawy-feedback-attempts";
const feedbackAttempts = new Map<string, number[]>();

function loadAttempts(key: string): number[] {
  if (typeof window === "undefined") return feedbackAttempts.get(key) ?? [];
  try {
    const raw = window.sessionStorage.getItem(FEEDBACK_ATTEMPTS_KEY);
    const all: Record<string, number[]> = raw ? (JSON.parse(raw) as Record<string, number[]>) : {};
    const list = Array.isArray(all[key]) ? all[key] : [];
    return list.filter((attempt) => typeof attempt === "number");
  } catch {
    return feedbackAttempts.get(key) ?? [];
  }
}

function saveAttempts(key: string, attempts: number[]): void {
  feedbackAttempts.set(key, attempts);
  if (typeof window === "undefined") return;
  try {
    const raw = window.sessionStorage.getItem(FEEDBACK_ATTEMPTS_KEY);
    const all: Record<string, number[]> = raw ? (JSON.parse(raw) as Record<string, number[]>) : {};
    all[key] = attempts;
    window.sessionStorage.setItem(FEEDBACK_ATTEMPTS_KEY, JSON.stringify(all));
  } catch {
    return;
  }
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
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    throw new Error("Offline");
  }
  const key = input.userId ?? "guest";
  const now = Date.now();
  const recent = loadAttempts(key).filter(
    (attempt) => now - attempt < FEEDBACK_WINDOW_MS,
  );
  if (recent.length >= FEEDBACK_LIMIT) {
    saveAttempts(key, recent);
    throw new RateLimitError("Feedback rate limit reached");
  }
  recent.push(now);
  saveAttempts(key, recent);
}

export async function sendReport(input: ReportInput): Promise<{ ticket: string }> {
  await new Promise((resolve) => setTimeout(resolve, SUPPORT_DELAY_MS));
  if (!input.description.trim()) {
    throw new Error("Description is required");
  }
  return { ticket: `TK-${Date.now().toString(36).toUpperCase().slice(-6)}` };
}
