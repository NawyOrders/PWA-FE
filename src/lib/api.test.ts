import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  RateLimitError,
  fetchAddresses,
  fetchFaq,
  saveAddresses,
  saveDisplayName,
  sendChatMessage,
  sendFeedback,
  sendReport,
  type FeedbackInput,
} from "./api";
import { faqItems } from "@/data/faq";
import { useFakeTimers } from "../../tests/utils/timers";
import { makeAddress, makeMessage } from "../../tests/factories";

const SUPPORT_DELAY = 700;
const FAQ_DELAY = 500;
const NAME_DELAY = 600;
const ADDRESSES_DELAY = 600;

async function settle(ms: number): Promise<void> {
  await vi.advanceTimersByTimeAsync(ms);
}

function feedbackInput(overrides: Partial<FeedbackInput> = {}): FeedbackInput {
  return {
    rating: 5,
    type: "praise",
    message: "خدمة ممتازة",
    userId: "user-test",
    ...overrides,
  };
}

describe("api mock layer", () => {
  beforeEach(() => {
    useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("UT-API-01 resolves the FAQ items after the simulated latency", async () => {
    const pending = fetchFaq();
    await settle(FAQ_DELAY);
    await expect(pending).resolves.toEqual(faqItems);
  });

  it("UT-API-02 caches the FAQ items between calls", async () => {
    const first = fetchFaq();
    await settle(FAQ_DELAY);
    const firstResult = await first;

    const second = fetchFaq();
    await expect(second).resolves.toBe(firstResult);
  });

  it("UT-API-03 resolves a display name save after the simulated latency", async () => {
    const pending = saveDisplayName("جميل جمال");
    await settle(NAME_DELAY);
    await expect(pending).resolves.toBeUndefined();
  });

  it("UT-API-04 rejects an empty display name", async () => {
    const assertion = expect(saveDisplayName("   ")).rejects.toThrow("Name is required");
    await settle(NAME_DELAY);
    await assertion;
  });

  it("UT-API-05 resolves an addresses fetch after the simulated latency", async () => {
    const pending = fetchAddresses();
    await settle(ADDRESSES_DELAY);
    await expect(pending).resolves.toBeUndefined();
  });

  it("UT-API-06 rejects more than five addresses", async () => {
    const addresses = Array.from({ length: 6 }, (_, index) =>
      makeAddress({ id: `addr-${index}` }),
    );
    const assertion = expect(saveAddresses(addresses)).rejects.toThrow(
      "Maximum of 5 addresses",
    );
    await settle(ADDRESSES_DELAY);
    await assertion;
  });

  it("UT-API-07 accepts exactly five addresses", async () => {
    const addresses = Array.from({ length: 5 }, (_, index) =>
      makeAddress({ id: `addr-${index}` }),
    );
    const pending = saveAddresses(addresses);
    await settle(ADDRESSES_DELAY);
    await expect(pending).resolves.toBeUndefined();
  });

  it("UT-API-08 rejects an empty chat message", async () => {
    const assertion = expect(
      sendChatMessage(makeMessage({ message: "   " })),
    ).rejects.toThrow("Message is required");
    await settle(SUPPORT_DELAY);
    await assertion;
  });

  it("UT-API-09 resolves a chat message with a body", async () => {
    const pending = sendChatMessage(makeMessage());
    await settle(SUPPORT_DELAY);
    await expect(pending).resolves.toBeUndefined();
  });

  it("UT-API-10 rejects a rating outside 1 to 5", async () => {
    const low = expect(sendFeedback(feedbackInput({ rating: 0 }))).rejects.toThrow(
      "Rating must be between 1 and 5",
    );
    await settle(SUPPORT_DELAY);
    await low;

    const high = expect(sendFeedback(feedbackInput({ rating: 6 }))).rejects.toThrow(
      "Rating must be between 1 and 5",
    );
    await settle(SUPPORT_DELAY);
    await high;
  });

  it("UT-API-11 rejects the feedback when the device is offline", async () => {
    const online = window.navigator.onLine;
    Object.defineProperty(window.navigator, "onLine", { value: false, configurable: true });
    const assertion = expect(sendFeedback(feedbackInput())).rejects.toThrow("Offline");
    await settle(SUPPORT_DELAY);
    await assertion;
    Object.defineProperty(window.navigator, "onLine", { value: online, configurable: true });
  });

  it("UT-API-12 rejects the sixth feedback of the hour with a rate limit error", async () => {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const pending = sendFeedback(feedbackInput());
      await settle(SUPPORT_DELAY);
      await expect(pending).resolves.toBeUndefined();
    }

    const blocked = expect(sendFeedback(feedbackInput())).rejects.toBeInstanceOf(
      RateLimitError,
    );
    await settle(SUPPORT_DELAY);
    await blocked;
  });

  it("UT-API-13 accepts the feedback again once the rate limit window passed", async () => {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const pending = sendFeedback(feedbackInput());
      await settle(SUPPORT_DELAY);
      await expect(pending).resolves.toBeUndefined();
    }

    const blocked = expect(sendFeedback(feedbackInput())).rejects.toBeInstanceOf(
      RateLimitError,
    );
    await settle(SUPPORT_DELAY);
    await blocked;

    vi.setSystemTime(new Date(Date.now() + 60 * 60 * 1000 + 1000));

    const allowed = sendFeedback(feedbackInput());
    await settle(SUPPORT_DELAY);
    await expect(allowed).resolves.toBeUndefined();
  });

  it("UT-API-14 counts the rate limit per user", async () => {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const pending = sendFeedback(feedbackInput({ userId: "user-a" }));
      await settle(SUPPORT_DELAY);
      await expect(pending).resolves.toBeUndefined();
    }

    const blocked = expect(
      sendFeedback(feedbackInput({ userId: "user-a" })),
    ).rejects.toBeInstanceOf(RateLimitError);
    await settle(SUPPORT_DELAY);
    await blocked;

    const otherUser = sendFeedback(feedbackInput({ userId: "user-b" }));
    await settle(SUPPORT_DELAY);
    await expect(otherUser).resolves.toBeUndefined();
  });

  it("UT-API-15 rejects a report without a description", async () => {
    const assertion = expect(
      sendReport({ category: "other", description: "  " }),
    ).rejects.toThrow("Description is required");
    await settle(SUPPORT_DELAY);
    await assertion;
  });

  it("UT-API-16 resolves a report with a ticket number", async () => {
    const pending = sendReport({ category: "order", description: "الطلب متأخر" });
    await settle(SUPPORT_DELAY);
    const result = await pending;
    expect(result.ticket).toMatch(/^TK-[0-9A-Z]{1,6}$/);
  });

  it("UT-API-17 keeps working when the stored attempts are corrupted", async () => {
    window.sessionStorage.setItem("nawy-feedback-attempts", "{not json");

    const pending = sendFeedback(feedbackInput());
    await settle(SUPPORT_DELAY);
    await expect(pending).resolves.toBeUndefined();
  });

  it("UT-API-18 ignores stored attempts that are not a list of numbers", async () => {
    window.sessionStorage.setItem(
      "nawy-feedback-attempts",
      JSON.stringify({ "user-test": "not-a-list" }),
    );

    const pending = sendFeedback(feedbackInput());
    await settle(SUPPORT_DELAY);
    await expect(pending).resolves.toBeUndefined();
  });

  it("UT-API-19 ignores stored attempts that are not numbers", async () => {
    window.sessionStorage.setItem(
      "nawy-feedback-attempts",
      JSON.stringify({ "user-test": ["now", null] }),
    );

    const pending = sendFeedback(feedbackInput());
    await settle(SUPPORT_DELAY);
    await expect(pending).resolves.toBeUndefined();
  });

  it("UT-API-20 keeps the rate limit in memory when there is no window", async () => {
    vi.stubGlobal("window", undefined);

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const pending = sendFeedback(feedbackInput({ userId: "user-ssr" }));
      await settle(SUPPORT_DELAY);
      await expect(pending).resolves.toBeUndefined();
    }

    const blocked = expect(
      sendFeedback(feedbackInput({ userId: "user-ssr" })),
    ).rejects.toBeInstanceOf(RateLimitError);
    await settle(SUPPORT_DELAY);
    await blocked;

    vi.unstubAllGlobals();
  });
});
