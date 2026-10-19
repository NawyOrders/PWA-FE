"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n/DictionaryProvider";
import { useAuthStore } from "@/store/authStore";
import { RateLimitError, sendFeedback, type FeedbackType } from "@/lib/api";
import { cn } from "@/lib/cn";
import { SettingsScreen } from "@/components/SettingsScreen";
import { StarRating } from "@/components/StarRating";
import { ImageUpload } from "@/components/ImageUpload";
import { Modal } from "@/components/Modal";
import { PrimaryButton } from "@/components/PrimaryButton";
import { CheckIcon, ExpandIcon, PaperPlaneIcon, SpinnerIcon } from "@/components/icons";

const DRAFT_KEY = "nawy-feedback-draft";
const FORM_ID = "feedback-form";
const RATING_CARD_ID = "feedback-rating-card";
const MIN_MESSAGE = 10;
const MAX_MESSAGE = 500;
const COUNTER_ACCENT_AT = 450;

interface FeedbackDraft {
  rating: number;
  type: FeedbackType;
  message: string;
}

const EMPTY_DRAFT: FeedbackDraft = { rating: 0, type: "suggestion", message: "" };

function readDraft(): FeedbackDraft {
  if (typeof window === "undefined") return EMPTY_DRAFT;
  try {
    const raw = window.sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return EMPTY_DRAFT;
    const parsed = JSON.parse(raw) as Partial<FeedbackDraft>;
    const type =
      parsed.type === "complaint" || parsed.type === "praise" || parsed.type === "other"
        ? parsed.type
        : "suggestion";
    return {
      rating: typeof parsed.rating === "number" ? parsed.rating : 0,
      type,
      message: typeof parsed.message === "string" ? parsed.message : "",
    };
  } catch {
    return EMPTY_DRAFT;
  }
}

function writeDraft(draft: FeedbackDraft): void {
  try {
    window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    return;
  }
}

function clearDraft(): void {
  try {
    window.sessionStorage.removeItem(DRAFT_KEY);
  } catch {
    return;
  }
}

export default function FeedbackPage() {
  const { locale, dict } = useI18n();
  const router = useRouter();
  const userId = useAuthStore((state) => state.user?.id);

  const formRef = useRef<HTMLFormElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const bannerRef = useRef<HTMLDivElement>(null);

  const [baseline, setBaseline] = useState<FeedbackDraft>(EMPTY_DRAFT);
  const [rating, setRating] = useState(0);
  const [type, setType] = useState<FeedbackType>("suggestion");
  const [message, setMessage] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [ratingTouched, setRatingTouched] = useState(false);
  const [messageTouched, setMessageTouched] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [sending, setSending] = useState(false);
  const [failure, setFailure] = useState<"send" | "rateLimit" | null>(null);
  const [success, setSuccess] = useState(false);
  const [offline, setOffline] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const load = () => {
      const draft = readDraft();
      setBaseline(draft);
      setRating(draft.rating);
      setType(draft.type);
      setMessage(draft.message);
      setReady(true);
    };
    load();
  }, []);

  useEffect(() => {
    if (!ready || success) return;
    writeDraft({ rating, type, message });
  }, [ready, success, rating, type, message]);

  useEffect(() => {
    const update = () => setOffline(!navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  useEffect(() => {
    const element = messageRef.current;
    if (!element) return;
    element.style.height = "auto";
    element.style.height = `${element.scrollHeight}px`;
  }, [message]);

  const trimmed = message.trim();
  const ratingError = rating < 1;
  const messageError = trimmed.length > 0 && trimmed.length < MIN_MESSAGE;
  const valid = !ratingError && !messageError;
  const canSend = valid && !sending && !offline && ready;
  const showRatingError = (ratingTouched || submitAttempted) && ratingError;
  const showMessageError = (messageTouched || submitAttempted) && messageError;
  const dirty =
    rating !== baseline.rating ||
    type !== baseline.type ||
    message !== baseline.message ||
    photo !== null;

  const goBack = useCallback(() => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.replace(`/${locale}/profile/help`);
    }
  }, [locale, router]);

  const handleBack = () => {
    if (!success && dirty) {
      setDiscardOpen(true);
      return;
    }
    goBack();
  };

  const submit = async () => {
    if (sending || offline) return;
    setSending(true);
    setFailure(null);
    try {
      await sendFeedback({
        rating,
        type,
        message: trimmed,
        photoName: photo?.name,
        userId,
      });
    } catch (error) {
      setSending(false);
      setFailure(error instanceof RateLimitError ? "rateLimit" : "send");
      window.setTimeout(() => {
        bannerRef.current?.scrollIntoView({ block: "center" });
        bannerRef.current?.focus();
      }, 0);
      return;
    }
    clearDraft();
    setBaseline({ rating, type, message });
    setPhoto(null);
    setSending(false);
    setSuccess(true);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitAttempted(true);
    if (!valid) {
      if (ratingError) {
        document.getElementById(RATING_CARD_ID)?.scrollIntoView({ block: "center" });
      } else if (messageError) {
        messageRef.current?.focus();
      }
      return;
    }
    void submit();
  };

  const handleMessageKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
      event.preventDefault();
      formRef.current?.requestSubmit();
    }
  };

  const typeOptions: { value: FeedbackType; label: string }[] = [
    { value: "suggestion", label: dict.feedback.typeSuggestion },
    { value: "complaint", label: dict.feedback.typeComplaint },
    { value: "praise", label: dict.feedback.typePraise },
    { value: "other", label: dict.feedback.typeOther },
  ];

  const counterClass =
    message.length >= MAX_MESSAGE
      ? "text-danger"
      : message.length >= COUNTER_ACCENT_AT
        ? "text-accent"
        : "text-muted";

  return (
    <SettingsScreen
      title={dict.feedback.title}
      subtitle={dict.feedback.subtitle}
      backLabel={dict.common.back}
      onBack={handleBack}
      cta={
        success ? undefined : (
          <button
            type="submit"
            form={FORM_ID}
            disabled={!canSend}
            className={cn(
              "flex h-[60px] w-full items-center justify-center gap-[10px] rounded-full bg-primary-gradient text-[17px] font-extrabold text-white shadow-cta transition-transform duration-200 active:scale-[0.98] disabled:cursor-not-allowed",
              !sending && "disabled:opacity-50",
            )}
          >
            {sending ? <SpinnerIcon className="h-[20px] w-[20px] animate-spin" /> : null}
            {offline && !sending ? dict.feedback.offline : null}
            {!sending && !offline ? (
              <>
                {dict.feedback.send}
                <PaperPlaneIcon className="h-[20px] w-[20px] rtl:-scale-x-100" />
              </>
            ) : null}
          </button>
        )
      }
    >
      {success ? (
        <div role="status" className="mt-[48px] rounded-[28px] bg-surface p-[24px] text-center shadow-card">
          <span
            aria-hidden
            className="mx-auto flex h-[56px] w-[56px] items-center justify-center rounded-[17px] bg-primary-gradient text-white"
          >
            <CheckIcon className="h-[28px] w-[28px]" />
          </span>
          <p className="mt-[16px] text-[24px] font-extrabold leading-[1.4] text-title">
            {dict.feedback.successTitle}
          </p>
          <p className="mt-[8px] text-[15px] leading-[1.6] text-muted">{dict.feedback.successBody}</p>
          <button
            type="button"
            onClick={goBack}
            className="mt-[24px] flex h-[60px] w-full items-center justify-center rounded-full bg-primary-gradient text-[17px] font-extrabold text-white shadow-cta transition-transform duration-200 active:scale-[0.98]"
          >
            {dict.feedback.back}
          </button>
        </div>
      ) : (
        <>
          <section id={RATING_CARD_ID} className="mt-[48px] rounded-[28px] bg-surface p-[24px] shadow-card">
            <StarRating
              id="feedback-rating"
              label={dict.feedback.ratingLabel}
              value={rating}
              onChange={(next) => {
                setRating(next);
                setRatingTouched(true);
              }}
              onBlur={() => setRatingTouched(true)}
              starLabels={dict.feedback.starLabels}
              hints={dict.feedback.hints}
              chooseHint={dict.feedback.chooseRating}
              error={showRatingError ? dict.feedback.errorRating : null}
              disabled={sending}
            />
          </section>

          <section className="mt-[24px] rounded-[28px] bg-surface p-[24px] shadow-card">
            <form
              id={FORM_ID}
              ref={formRef}
              onSubmit={handleSubmit}
              noValidate
              className="flex flex-col gap-[24px]"
            >
              {failure ? (
                <div
                  ref={bannerRef}
                  tabIndex={-1}
                  aria-live="polite"
                  className="rounded-[16px] border-[1.5px] border-danger bg-danger-bg px-[16px] py-[12px] text-[14px] font-medium leading-[1.5] text-danger outline-none"
                >
                  {failure === "rateLimit" ? dict.feedback.rateLimit : dict.feedback.sendError}
                  <button
                    type="button"
                    onClick={() => void submit()}
                    className="ms-[8px] font-extrabold underline underline-offset-2"
                  >
                    {dict.help.retry}
                  </button>
                </div>
              ) : null}

              <div>
                <label
                  htmlFor="feedback-type"
                  className="mb-[12px] block text-[16px] font-extrabold leading-[1.4] text-title"
                >
                  {dict.feedback.typeLabel}
                </label>
                <div className="relative">
                  <select
                    id="feedback-type"
                    name="type"
                    value={type}
                    disabled={sending}
                    onChange={(event) => setType(event.target.value as FeedbackType)}
                    className="h-[56px] w-full appearance-none rounded-[24px] border-2 border-hint-amber bg-surface ps-[20px] pe-[48px] text-[16px] font-bold text-title outline-none transition-colors focus:border-primary disabled:opacity-60"
                  >
                    {typeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <span
                    aria-hidden
                    className="pointer-events-none absolute end-[20px] top-1/2 -translate-y-1/2 text-hint-amber"
                  >
                    <ExpandIcon className="h-[20px] w-[20px]" />
                  </span>
                </div>
              </div>

              <div>
                <label
                  htmlFor="feedback-message"
                  className="mb-[12px] block text-[16px] font-extrabold leading-[1.4] text-title"
                >
                  {dict.feedback.messageLabel}
                </label>
                <textarea
                  ref={messageRef}
                  id="feedback-message"
                  name="message"
                  rows={3}
                  value={message}
                  maxLength={MAX_MESSAGE}
                  placeholder={dict.feedback.messagePlaceholder}
                  disabled={sending}
                  onChange={(event) => setMessage(event.target.value)}
                  onBlur={() => setMessageTouched(true)}
                  onKeyDown={handleMessageKeyDown}
                  aria-invalid={showMessageError || undefined}
                  aria-describedby={`feedback-message-counter${
                    showMessageError ? " feedback-message-error" : ""
                  }`}
                  className={cn(
                    "block max-h-[186px] min-h-[112px] w-full resize-none rounded-[24px] bg-surface p-[16px] text-[16px] leading-[1.6] text-title outline-none transition-colors placeholder:text-muted disabled:opacity-60",
                    showMessageError
                      ? "border-2 border-danger"
                      : "border-2 border-hint-amber focus:border-primary",
                  )}
                />
                <div className="mt-[8px] flex items-start justify-between gap-[12px]">
                  <p
                    id="feedback-message-error"
                    aria-live="polite"
                    className="text-[12px] font-medium leading-[1.5] text-danger"
                  >
                    {showMessageError ? dict.feedback.errorShort : null}
                  </p>
                  <bdi
                    dir="ltr"
                    id="feedback-message-counter"
                    aria-live="off"
                    className={cn("text-[14px] leading-[1.5]", counterClass)}
                  >
                    {message.length}/{MAX_MESSAGE}
                  </bdi>
                </div>
              </div>

              <ImageUpload
                id="feedback-photo"
                label={dict.feedback.photoLabel}
                uploadTap={dict.feedback.uploadTap}
                uploadDesktop={dict.feedback.uploadDesktop}
                previewAlt={dict.feedback.photoPreview}
                removeLabel={dict.feedback.photoRemove}
                uploadingLabel={dict.feedback.uploading}
                errorSize={dict.feedback.errorPhotoSize}
                errorType={dict.feedback.errorFileType}
                disabled={sending}
                onChange={setPhoto}
              />
            </form>
          </section>
        </>
      )}

      <Modal
        open={discardOpen}
        onClose={() => setDiscardOpen(false)}
        labelledBy="feedback-discard-title"
      >
        <h2 id="feedback-discard-title" className="text-[1.25rem] font-extrabold text-title">
          {dict.feedback.discardTitle}
        </h2>
        <p className="mt-2 text-[0.875rem] text-muted">{dict.feedback.discardBody}</p>
        <div className="mt-5 space-y-3">
          <PrimaryButton
            onClick={() => {
              clearDraft();
              goBack();
            }}
          >
            {dict.feedback.discardConfirm}
          </PrimaryButton>
          <PrimaryButton variant="outline" onClick={() => setDiscardOpen(false)}>
            {dict.common.cancel}
          </PrimaryButton>
        </div>
      </Modal>
    </SettingsScreen>
  );
}
