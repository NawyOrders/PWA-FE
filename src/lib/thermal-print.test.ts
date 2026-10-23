import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { buildReceipt } from "./receipt";
import { printReceipt } from "./thermal-print";
import { makeOrder, makeOrderItem } from "../../tests/factories";

function fakeFrame(printError = false) {
  const print = vi.fn(() => {
    if (printError) throw new Error("PRINT_FAILED");
  });
  const focus = vi.fn();
  const remove = vi.fn();
  const iframe = {
    style: {} as Record<string, string>,
    srcdoc: "",
    setAttribute: vi.fn(),
    addEventListener: vi.fn((type: string, listener: () => void) => {
      if (type === "load") listener();
    }),
    remove,
    contentWindow: { focus, print },
  };
  return { iframe, print, focus, remove };
}

function receiptFixture() {
  return buildReceipt(
    makeOrder({
      id: "order-test",
      number: "1051",
      items: [makeOrderItem({ dishId: "crack-burger", quantity: 1 })],
    }),
    "ar",
  );
}

describe("printReceipt", () => {
  let frame: ReturnType<typeof fakeFrame>;

  beforeEach(() => {
    frame = fakeFrame();
    vi.spyOn(document, "createElement").mockReturnValue(frame.iframe as unknown as HTMLElement);
    vi.spyOn(document.body, "appendChild").mockReturnValue(frame.iframe as unknown as Node);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("UT-PRINT-01 opens the browser print dialog for the 80mm receipt", async () => {
    const job = await printReceipt(receiptFixture());

    expect(document.createElement).toHaveBeenCalledWith("iframe");
    expect(frame.iframe.setAttribute).toHaveBeenCalledWith("aria-hidden", "true");
    expect(frame.iframe.srcdoc).toContain("@page { size: 80mm auto;");
    expect(frame.focus).toHaveBeenCalled();
    expect(frame.print).toHaveBeenCalledTimes(1);
    expect(job).toMatchObject({
      orderId: "order-test",
      target: "browser-print-dialog-80mm",
      status: "dialog-opened",
    });
    expect(job.jobId).toContain("print-order-test-");
  });

  it("UT-PRINT-02 blocks a concurrent duplicate job for the same order", async () => {
    const first = printReceipt(receiptFixture());

    await expect(printReceipt(receiptFixture())).rejects.toThrow(
      "PRINT_ALREADY_RUNNING",
    );
    await expect(first).resolves.toMatchObject({ status: "dialog-opened" });
  });

  it("UT-PRINT-03 reports a failed print and releases the order lock", async () => {
    vi.restoreAllMocks();
    const failing = fakeFrame(true);
    vi.spyOn(document, "createElement").mockReturnValue(failing.iframe as unknown as HTMLElement);
    vi.spyOn(document.body, "appendChild").mockReturnValue(failing.iframe as unknown as Node);
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(printReceipt(receiptFixture())).rejects.toThrow("PRINT_FAILED");

    expect(errorSpy).toHaveBeenCalledWith(
      "[receipt-print]",
      expect.objectContaining({ status: "failed", orderId: "order-test" }),
    );

    await expect(printReceipt(receiptFixture())).rejects.toThrow("PRINT_FAILED");
    expect(failing.print).toHaveBeenCalledTimes(2);
  });
});
