"use client";

import { useState } from "react";
import type { Order } from "@/data/orders";
import { useI18n } from "@/lib/i18n";
import { buildReceipt } from "@/lib/receipt";
import { printReceipt, type PrintJob } from "@/lib/thermal-print";

type PrintState = "idle" | "printing" | "done" | "error";

export function PrintSlipButton({ order }: { order: Order }) {
  const { locale, t } = useI18n();
  const [state, setState] = useState<PrintState>("idle");
  const [job, setJob] = useState<PrintJob | null>(null);
  const [error, setError] = useState("");

  async function handlePrint() {
    if (state === "printing") {
      setError(t("printDuplicateBlocked"));
      return;
    }
    setState("printing");
    setError("");
    try {
      const receipt = buildReceipt(order, locale);
      const result = await printReceipt(receipt);
      setJob(result);
      setState("done");
    } catch (err) {
      setError(err instanceof Error && err.message === "PRINT_ALREADY_RUNNING" ? t("printDuplicateBlocked") : t("printFailed"));
      setState("error");
    }
  }

  return (
    <div className="print-slip">
      <button
        type="button"
        className="print-slip-button"
        onClick={() => void handlePrint()}
        disabled={state === "printing"}
        aria-busy={state === "printing"}
      >
        {state === "printing"
          ? t("printingSlip")
          : state === "done"
            ? t("reprintSlip")
            : t("printSlip")}
      </button>
      <p className={`print-slip-status${error ? " is-error" : ""}`} role={error ? "alert" : "status"}>
        {state === "printing"
          ? t("printingSlip")
          : error ||
            (state === "done" ? t("printDialogOpened") : "")}
      </p>
      {job ? (
        <dl className="print-slip-diagnostics">
          <div><dt>{t("printDiagnostics")}</dt><dd>{t("printTarget")}: {t("printTargetValue")}</dd></div>
          <div><dt>{t("printJob")}</dt><dd dir="ltr">{job.jobId}</dd></div>
          <div><dt>{t("printTime")}</dt><dd dir="ltr">{new Date(job.startedAt).toLocaleTimeString(locale)}</dd></div>
        </dl>
      ) : null}
    </div>
  );
}
