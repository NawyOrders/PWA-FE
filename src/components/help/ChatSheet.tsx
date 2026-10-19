"use client";

// PLACEHOLDER UI — the live chat destination is a proposal (DESIGN.md 12.6)
// until the owner sends its mockup. Online: a simple chat panel. Offline:
// a "leave a message" form that keeps the draft when offline.

import { useState, type FormEvent } from "react";
import { useI18n } from "@/lib/i18n/DictionaryProvider";
import { useAuthStore } from "@/store/authStore";
import { useUiStore } from "@/store/uiStore";
import { sendChatMessage } from "@/lib/api";
import { cn } from "@/lib/cn";
import { Modal } from "@/components/Modal";
import { PrimaryButton } from "@/components/PrimaryButton";
import { CircleIconButton } from "@/components/CircleIconButton";
import { CloseIcon } from "@/components/icons";
import { brand } from "@/lib/brand";

const DRAFT_KEY = "nawy-support-chat-draft";

interface ChatSheetProps {
  online: boolean;
  onlineLabel: string;
  onClose: () => void;
}

function readDraft(): string {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(DRAFT_KEY) ?? "";
  } catch {
    return "";
  }
}

export function ChatSheet({ online, onlineLabel, onClose }: ChatSheetProps) {
  const { dict, t } = useI18n();
  const user = useAuthStore((state) => state.user);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const showToast = useUiStore((state) => state.showToast);

  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [message, setMessage] = useState(readDraft);
  const [sending, setSending] = useState(false);
  const [errors, setErrors] = useState<{ name?: boolean; phone?: boolean; message?: boolean }>({});

  const persistDraft = (value: string) => {
    setMessage(value);
    try {
      window.localStorage.setItem(DRAFT_KEY, value);
    } catch {
      // ignore quota / privacy mode
    }
  };

  const validate = () => {
    const next: typeof errors = {};
    if (!isLoggedIn && !name.trim()) next.name = true;
    if (!isLoggedIn && phone.trim().length < 10) next.phone = true;
    if (message.trim().length < 10) next.message = true;
    return next;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      showToast(dict.help.offlineForm, "danger");
      return;
    }

    setSending(true);
    try {
      await sendChatMessage({
        name: isLoggedIn ? user?.name ?? "" : name,
        phone: isLoggedIn ? user?.phone ?? "" : phone,
        message,
      });
    } catch {
      showToast(dict.help.sendError, "danger");
      return;
    } finally {
      setSending(false);
    }
    try {
      window.localStorage.removeItem(DRAFT_KEY);
    } catch {
      // ignore
    }
    showToast(dict.help.chatSent, "success");
    onClose();
  };

  const whatsappHref = brand.support.whatsapp;

  return (
    <Modal open onClose={onClose} labelledBy="chat-title" bottomSheet>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 id="chat-title" className="text-[1.25rem] font-extrabold text-title">
            {dict.help.chatTitle}
          </h2>
          <p role="status" className="mt-[2px] flex items-center gap-[6px] text-[13px] text-muted">
            <span
              aria-hidden
              className={cn("h-[8px] w-[8px] rounded-full", online ? "bg-success" : "bg-ring-inactive")}
            />
            {onlineLabel}
          </p>
        </div>
        <CircleIconButton
          label={dict.common.close}
          variant="muted"
          onClick={onClose}
          className="!h-[44px] !w-[44px]"
        >
          <CloseIcon className="h-[20px] w-[20px]" />
        </CircleIconButton>
      </div>

      {online ? (
        <div className="mt-[20px]">
          <div className="rounded-[20px] bg-tint-peach p-[16px] text-[15px] leading-[1.7] text-title">
            {dict.help.chatSent}
          </div>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-[16px] flex min-h-[56px] items-center justify-center rounded-full bg-primary-gradient text-[16px] font-extrabold text-white shadow-cta transition-transform active:scale-[0.98]"
          >
            {dict.help.contactWhatsapp}
          </a>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="mt-[20px] flex flex-col gap-[16px]">
          <p className="text-[13px] text-muted">{dict.help.offlineDraft}</p>

          {!isLoggedIn ? (
            <>
              <Field
                id="chat-name"
                label={dict.help.nameLabel}
                value={name}
                onChange={setName}
                onBlur={() => setErrors((prev) => ({ ...prev, name: !name.trim() }))}
                error={Boolean(errors.name)}
                errorText={dict.help.errorRequired}
                autoComplete="name"
                placeholder={dict.help.namePlaceholder}
              />
              <Field
                id="chat-phone"
                label={dict.help.phoneLabel}
                value={phone}
                onChange={setPhone}
                onBlur={() => setErrors((prev) => ({ ...prev, phone: phone.trim().length < 10 }))}
                error={Boolean(errors.phone)}
                errorText={dict.help.errorRequired}
                autoComplete="tel"
                inputMode="tel"
                placeholder={dict.help.phonePlaceholder}
              />
            </>
          ) : null}

          <div>
            <label htmlFor="chat-message" className="mb-[12px] block text-[14px] font-bold text-title">
              {dict.help.messageLabel}
            </label>
            <textarea
              id="chat-message"
              value={message}
              onChange={(event) => persistDraft(event.target.value)}
              onBlur={() => setErrors((prev) => ({ ...prev, message: message.trim().length < 10 }))}
              aria-invalid={Boolean(errors.message)}
              rows={4}
              placeholder={dict.help.messagePlaceholder}
              className={cn(
                "w-full rounded-[20px] bg-surface p-[16px] text-[16px] text-title outline-none transition-colors placeholder:text-muted",
                errors.message
                  ? "border-2 border-danger"
                  : "border-[1.5px] border-line focus:border-2 focus:border-primary",
              )}
            />
            <p aria-live="polite" className="text-[12px] font-medium text-danger">
              {errors.message ? t(dict.help.errorShort) : null}
            </p>
          </div>

          <PrimaryButton type="submit" size="lg" loading={sending}>
            {sending ? dict.help.sending : dict.help.send}
          </PrimaryButton>
        </form>
      )}
    </Modal>
  );
}

interface FieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  error: boolean;
  errorText: string;
  placeholder?: string;
  autoComplete?: string;
  inputMode?: "tel" | "email" | "text";
}

function Field({
  id,
  label,
  value,
  onChange,
  onBlur,
  error,
  errorText,
  placeholder,
  autoComplete,
  inputMode,
}: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-[12px] block text-[14px] font-bold text-title">
        {label}
      </label>
      <input
        id={id}
        type={inputMode === "tel" ? "tel" : "text"}
        inputMode={inputMode}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        aria-invalid={error}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={cn(
          "h-[56px] w-full rounded-[20px] bg-surface px-4 text-[16px] text-title outline-none transition-colors placeholder:text-muted",
          error
            ? "border-2 border-danger"
            : "border-[1.5px] border-line focus:border-2 focus:border-primary",
        )}
      />
      <p aria-live="polite" className="text-[12px] font-medium text-danger">
        {error ? errorText : null}
      </p>
    </div>
  );
}
