"use client";

// PLACEHOLDER UI — the report destination is a proposal (DESIGN.md 12.6)
// until the owner sends its mockup.

import { useRef, useState, type FormEvent } from "react";
import { useI18n } from "@/lib/i18n/DictionaryProvider";
import { useOrdersStore } from "@/store/ordersStore";
import { useAuthStore } from "@/store/authStore";
import { useUiStore } from "@/store/uiStore";
import { sendReport, type ReportCategory } from "@/lib/api";
import { cn } from "@/lib/cn";
import { Modal } from "@/components/Modal";
import { PrimaryButton } from "@/components/PrimaryButton";
import { CircleIconButton } from "@/components/CircleIconButton";
import { CloseIcon, ImageIcon, TrashIcon, WarningIcon } from "@/components/icons";

const MIN = 10;
const MAX = 1000;
const MAX_BYTES = 5 * 1024 * 1024;

const CATEGORIES: ReportCategory[] = ["order", "payment", "bug", "other"];

interface ReportSheetProps {
  onClose: () => void;
}

export function ReportSheet({ onClose }: ReportSheetProps) {
  const { dict, t } = useI18n();
  const orders = useOrdersStore((state) => state.orders);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const showToast = useUiStore((state) => state.showToast);

  const fileRef = useRef<HTMLInputElement>(null);
  const [category, setCategory] = useState<ReportCategory>("order");
  const [description, setDescription] = useState("");
  const [orderId, setOrderId] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [touched, setTouched] = useState(false);
  const [ticket, setTicket] = useState<string | null>(null);

  const descError = description.trim().length < MIN || description.trim().length > MAX;

  const categoryLabel = (value: ReportCategory) => {
    if (value === "order") return dict.help.categoryOrder;
    if (value === "payment") return dict.help.categoryPayment;
    if (value === "bug") return dict.help.categoryBug;
    return dict.help.categoryOther;
  };

  const handleFile = (file: File | undefined) => {
    if (!file) {
      setFileName(null);
      return;
    }
    if (file.size > MAX_BYTES) {
      showToast(dict.help.attachmentTooLarge, "danger");
      if (fileRef.current) fileRef.current.value = "";
      return;
    }
    setFileName(file.name);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTouched(true);
    if (descError) return;

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      showToast(dict.help.offlineForm, "danger");
      return;
    }

    setSending(true);
    try {
      const result = await sendReport({
        category,
        description: description.trim(),
        orderId: orderId || undefined,
        attachmentName: fileName ?? undefined,
      });
      setTicket(result.ticket);
    } catch {
      showToast(dict.help.sendError, "danger");
      return;
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal open onClose={onClose} labelledBy="report-title" bottomSheet>
      {ticket ? (
        <div className="text-center">
          <div className="flex items-center justify-between gap-3">
            <h2 id="report-title" className="text-[1.25rem] font-extrabold text-title">
              {dict.help.reportSent}
            </h2>
            <CircleIconButton
              label={dict.common.close}
              variant="muted"
              onClick={onClose}
              className="!h-[44px] !w-[44px]"
            >
              <CloseIcon className="h-[20px] w-[20px]" />
            </CircleIconButton>
          </div>
          <span
            aria-hidden
            className="mx-auto mt-[20px] flex h-[56px] w-[56px] items-center justify-center rounded-[17px] bg-primary-gradient text-white"
          >
            <WarningIcon className="h-[28px] w-[28px]" />
          </span>
          <p className="mt-[16px] text-[15px] font-bold text-title">
            {t(dict.help.ticketNumber, { ticket })}
          </p>
          <div className="mt-[24px]">
            <PrimaryButton size="lg" onClick={onClose}>
              {dict.common.close}
            </PrimaryButton>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          <div className="flex items-center justify-between gap-3">
            <h2 id="report-title" className="text-[1.25rem] font-extrabold text-title">
              {dict.help.reportTitle}
            </h2>
            <CircleIconButton
              label={dict.common.close}
              variant="muted"
              onClick={onClose}
              className="!h-[44px] !w-[44px]"
            >
              <CloseIcon className="h-[20px] w-[20px]" />
            </CircleIconButton>
          </div>

          <fieldset className="mt-[20px]">
            <legend className="mb-[12px] block text-[14px] font-bold text-title">
              {dict.help.categoryLabel}
            </legend>
            <div className="flex flex-wrap gap-[8px]">
              {CATEGORIES.map((value) => {
                const active = category === value;
                return (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setCategory(value)}
                    className={cn(
                      "flex h-[44px] items-center rounded-full border-[1.5px] px-[16px] text-[14px] font-bold transition-colors",
                      active
                        ? "border-primary bg-primary-tint text-primary"
                        : "border-line bg-surface text-muted",
                    )}
                  >
                    {categoryLabel(value)}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="mt-[16px]">
            <label htmlFor="report-description" className="mb-[12px] block text-[14px] font-bold text-title">
              {dict.help.descriptionLabel}
            </label>
            <textarea
              id="report-description"
              value={description}
              maxLength={MAX}
              onBlur={() => setTouched(true)}
              onChange={(event) => setDescription(event.target.value)}
              aria-invalid={touched && descError}
              rows={4}
              placeholder={dict.help.descriptionPlaceholder}
              className={cn(
                "w-full rounded-[20px] bg-surface p-[16px] text-[16px] text-title outline-none transition-colors placeholder:text-muted",
                touched && descError
                  ? "border-2 border-danger"
                  : "border-[1.5px] border-line focus:border-2 focus:border-primary",
              )}
            />
            <div className="flex items-center justify-between">
              <p aria-live="polite" className="text-[12px] font-medium text-danger">
                {touched && descError
                  ? description.trim().length < MIN
                    ? dict.help.errorShort
                    : dict.help.errorLong
                  : null}
              </p>
              <span className="text-[12px] text-muted">
                {description.length}/{MAX}
              </span>
            </div>
          </div>

          {isLoggedIn && orders.length > 0 ? (
            <div className="mt-[12px]">
              <label htmlFor="report-order" className="mb-[12px] block text-[14px] font-bold text-title">
                {dict.help.orderPickerLabel}
              </label>
              <select
                id="report-order"
                value={orderId}
                onChange={(event) => setOrderId(event.target.value)}
                className="h-[56px] w-full rounded-[20px] border-[1.5px] border-line bg-surface px-4 text-[16px] font-bold text-title outline-none transition-colors focus:border-2 focus:border-primary"
              >
                <option value="">{dict.help.orderPickerOptional}</option>
                {orders.map((order) => (
                  <option key={order.id} value={order.id}>
                    #{order.number}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          <div className="mt-[12px]">
            <span className="mb-[12px] block text-[14px] font-bold text-title">
              {dict.help.attachmentLabel}
            </span>
            <input
              ref={fileRef}
              id="report-file"
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(event) => handleFile(event.target.files?.[0])}
            />
            {fileName ? (
              <div className="flex items-center gap-[12px] rounded-[20px] border-[1.5px] border-line bg-surface p-[12px]">
                <ImageIcon className="h-[22px] w-[22px] shrink-0 text-primary" />
                <span className="min-w-0 flex-1 truncate text-[14px] text-title">{fileName}</span>
                <button
                  type="button"
                  aria-label={dict.help.attachmentRemove}
                  onClick={() => {
                    setFileName(null);
                    if (fileRef.current) fileRef.current.value = "";
                  }}
                  className="flex h-[44px] w-[44px] items-center justify-center text-primary transition-transform active:scale-90"
                >
                  <TrashIcon className="h-[20px] w-[20px]" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex min-h-[56px] w-full items-center justify-center gap-[8px] rounded-[20px] border-[1.5px] border-dashed border-primary bg-transparent px-[16px] text-[14px] font-bold text-primary transition-transform active:scale-[0.99]"
              >
                <ImageIcon className="h-[20px] w-[20px]" />
                {dict.help.attachmentHint}
              </button>
            )}
          </div>

          <div className="mt-[20px]">
            <PrimaryButton type="submit" size="lg" loading={sending}>
              {sending ? dict.help.sending : dict.help.send}
            </PrimaryButton>
          </div>
        </form>
      )}
    </Modal>
  );
}
