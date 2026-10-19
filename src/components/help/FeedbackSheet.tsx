"use client";

// PLACEHOLDER UI — the feedback destination is a proposal (DESIGN.md 12.6)
// until the owner sends its mockup.

import { useState, type FormEvent } from "react";
import { useI18n } from "@/lib/i18n/DictionaryProvider";
import { useAuthStore } from "@/store/authStore";
import { useUiStore } from "@/store/uiStore";
import { sendFeedback } from "@/lib/api";
import { cn } from "@/lib/cn";
import { Modal } from "@/components/Modal";
import { PrimaryButton } from "@/components/PrimaryButton";
import { CircleIconButton } from "@/components/CircleIconButton";
import { CloseIcon, StarIcon } from "@/components/icons";

const MIN = 10;
const MAX = 500;

interface FeedbackSheetProps {
  onClose: () => void;
}

export function FeedbackSheet({ onClose }: FeedbackSheetProps) {
  const { dict, t } = useI18n();
  const email = useAuthStore((state) => state.user?.email ?? "");
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const showToast = useUiStore((state) => state.showToast);

  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState("");
  const [contactEmail, setContactEmail] = useState(isLoggedIn ? email : "");
  const [sending, setSending] = useState(false);
  const [touched, setTouched] = useState(false);

  const messageError = message.trim().length < MIN || message.trim().length > MAX;
  const emailError = contactEmail.trim() !== "" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail);
  const ratingError = rating < 1;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTouched(true);
    if (ratingError || messageError || emailError) return;

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      showToast(dict.help.offlineForm, "danger");
      return;
    }

    setSending(true);
    try {
      await sendFeedback({ rating, message: message.trim(), email: contactEmail.trim() || undefined });
    } catch {
      showToast(dict.help.sendError, "danger");
      return;
    } finally {
      setSending(false);
    }
    showToast(dict.help.feedbackSent, "success");
    onClose();
  };

  return (
    <Modal open onClose={onClose} labelledBy="feedback-title" bottomSheet>
      <form onSubmit={handleSubmit} noValidate>
        <div className="flex items-center justify-between gap-3">
          <h2 id="feedback-title" className="text-[1.25rem] font-extrabold text-title">
            {dict.help.feedbackTitle}
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
            {dict.help.ratingLabel}
          </legend>
          <div className="flex items-center gap-[8px]">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                aria-label={t(dict.help.ratingStars, { count: value })}
                aria-pressed={rating === value}
                onClick={() => setRating(value)}
                className="flex h-[44px] w-[44px] items-center justify-center transition-transform active:scale-90"
              >
                <StarIcon
                  className={cn("h-[30px] w-[30px]", value <= rating ? "text-brand-gold" : "text-line")}
                  filled={value <= rating}
                />
              </button>
            ))}
          </div>
          {touched && ratingError ? (
            <p aria-live="polite" className="mt-[4px] text-[12px] font-medium text-danger">
              {dict.help.errorRating}
            </p>
          ) : null}
        </fieldset>

        <div className="mt-[16px]">
          <label htmlFor="feedback-message" className="mb-[12px] block text-[14px] font-bold text-title">
            {dict.help.feedbackMessageLabel}
          </label>
          <textarea
            id="feedback-message"
            value={message}
            maxLength={MAX}
            onBlur={() => setTouched(true)}
            onChange={(event) => setMessage(event.target.value)}
            aria-invalid={touched && messageError}
            rows={4}
            placeholder={dict.help.feedbackMessagePlaceholder}
            className={cn(
              "w-full rounded-[20px] bg-surface p-[16px] text-[16px] text-title outline-none transition-colors placeholder:text-muted",
              touched && messageError
                ? "border-2 border-danger"
                : "border-[1.5px] border-line focus:border-2 focus:border-primary",
            )}
          />
          <div className="flex items-center justify-between">
            <p aria-live="polite" className="text-[12px] font-medium text-danger">
              {touched && messageError
                ? message.trim().length < MIN
                  ? dict.help.errorShort
                  : dict.help.errorLong
                : null}
            </p>
            <span className="text-[12px] text-muted">
              {message.length}/{MAX}
            </span>
          </div>
        </div>

        <div className="mt-[12px]">
          <label htmlFor="feedback-email" className="mb-[12px] block text-[14px] font-bold text-title">
            {dict.help.emailLabel}
          </label>
          <input
            id="feedback-email"
            type="email"
            dir="ltr"
            value={contactEmail}
            onBlur={() => setTouched(true)}
            onChange={(event) => setContactEmail(event.target.value)}
            aria-invalid={touched && emailError}
            placeholder="name@example.com"
            className={cn(
              "h-[56px] w-full rounded-[20px] bg-surface px-4 font-latin text-[16px] text-title outline-none transition-colors placeholder:text-muted",
              touched && emailError
                ? "border-2 border-danger"
                : "border-[1.5px] border-line focus:border-2 focus:border-primary",
            )}
          />
          <p aria-live="polite" className="text-[12px] font-medium text-danger">
            {touched && emailError ? dict.help.errorEmail : null}
          </p>
        </div>

        <div className="mt-[20px]">
          <PrimaryButton type="submit" size="lg" loading={sending}>
            {sending ? dict.help.sending : dict.help.send}
          </PrimaryButton>
        </div>
      </form>
    </Modal>
  );
}
