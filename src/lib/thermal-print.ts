import type { Receipt } from "./receipt";
import { renderReceiptHtml } from "./receipt";

export interface PrintJob {
  jobId: string;
  orderId: string;
  target: "browser-print-dialog-80mm";
  startedAt: string;
  status: "printing" | "dialog-opened" | "failed";
}

const inFlight = new Map<string, PrintJob>();

function waitForIframe(iframe: HTMLIFrameElement): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error("PRINT_TIMEOUT")), 10000);
    iframe.addEventListener(
      "load",
      () => {
        window.clearTimeout(timer);
        resolve();
      },
      { once: true },
    );
  });
}

export async function printReceipt(receipt: Receipt): Promise<PrintJob> {
  if (typeof document === "undefined") throw new Error("PRINT_UNAVAILABLE");
  if (inFlight.has(receipt.orderId)) throw new Error("PRINT_ALREADY_RUNNING");

  const job: PrintJob = {
    jobId: `print-${receipt.orderId}-${Date.now()}`,
    orderId: receipt.orderId,
    target: "browser-print-dialog-80mm",
    startedAt: new Date().toISOString(),
    status: "printing",
  };
  inFlight.set(receipt.orderId, job);

  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.setAttribute("title", "Receipt print frame");
  iframe.style.position = "fixed";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  iframe.style.opacity = "0";
  iframe.style.pointerEvents = "none";
  iframe.srcdoc = renderReceiptHtml(receipt);

  try {
    document.body.appendChild(iframe);
    await waitForIframe(iframe);
    const printWindow = iframe.contentWindow;
    if (!printWindow) throw new Error("PRINT_WINDOW_UNAVAILABLE");
    printWindow.focus();
    printWindow.print();
    job.status = "dialog-opened";
    console.info("[receipt-print]", {
      jobId: job.jobId,
      orderId: job.orderId,
      target: job.target,
      status: job.status,
    });
    return { ...job };
  } catch (err) {
    job.status = "failed";
    console.error("[receipt-print]", {
      jobId: job.jobId,
      orderId: job.orderId,
      target: job.target,
      status: job.status,
      error: err instanceof Error ? err.message : "PRINT_FAILED",
    });
    throw err;
  } finally {
    inFlight.delete(receipt.orderId);
    window.setTimeout(() => iframe.remove(), 1500);
  }
}
