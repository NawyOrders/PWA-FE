"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n/DictionaryProvider";
import { useAuthStore } from "@/store/authStore";
import { useUiStore } from "@/store/uiStore";
import { saveDisplayName } from "@/lib/api";
import {
  normalizeDisplayName,
  validateDisplayName,
  type DisplayNameError,
} from "@/lib/validators";
import { cn } from "@/lib/cn";
import { SettingsScreen } from "@/components/SettingsScreen";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Modal } from "@/components/Modal";
import { EditIcon, InfoIcon, ShieldUserIcon } from "@/components/icons";

export default function PersonalInfoPage() {
  const { locale, dict } = useI18n();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const setName = useAuthStore((state) => state.setName);
  const openLoginModal = useUiStore((state) => state.openLoginModal);
  const closeLoginModal = useUiStore((state) => state.closeLoginModal);
  const showToast = useUiStore((state) => state.showToast);

  const inputRef = useRef<HTMLInputElement>(null);
  const initializedRef = useRef(false);

  const [draft, setDraft] = useState<string | null>(null);
  const [errorKey, setErrorKey] = useState<DisplayNameError | null>(null);
  const [saving, setSaving] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      openLoginModal();
    } else {
      closeLoginModal();
    }
  }, [isLoggedIn, openLoginModal, closeLoginModal]);

  useEffect(() => {
    if (!initializedRef.current && user) {
      initializedRef.current = true;
      setDraft(user.name);
    }
  }, [user]);

  const value = draft ?? user?.name ?? "";
  const currentName = user?.name ?? "";
  const validationError = validateDisplayName(value);
  const dirty = normalizeDisplayName(value) !== normalizeDisplayName(currentName);
  const canSave = dirty && validationError === null && !saving;

  const errorMessages: Record<DisplayNameError, string> = {
    required: dict.personalInfo.errorRequired,
    short: dict.personalInfo.errorShort,
    letters: dict.personalInfo.errorLetters,
    long: dict.personalInfo.errorLong,
  };

  const goBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.replace(`/${locale}/profile`);
    }
  };

  const handleBack = () => {
    if (dirty) {
      setDiscardOpen(true);
      return;
    }
    goBack();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = validateDisplayName(value);
    if (result) {
      setErrorKey(result);
      inputRef.current?.focus();
      return;
    }
    const normalized = normalizeDisplayName(value);
    if (normalized === normalizeDisplayName(currentName)) return;
    setSaving(true);
    try {
      await saveDisplayName(normalized);
    } catch {
      return;
    } finally {
      setSaving(false);
    }
    setName(normalized);
    showToast(dict.personalInfo.saved, "success");
    router.replace(`/${locale}/profile`);
  };

  return (
    <SettingsScreen
      title={dict.personalInfo.title}
      subtitle={dict.personalInfo.subtitle}
      backLabel={dict.common.back}
      onBack={handleBack}
      cta={
        <PrimaryButton type="submit" form="pi-form" size="lg" disabled={!canSave} loading={saving}>
          {dict.personalInfo.save}
        </PrimaryButton>
      }
    >
      <form id="pi-form" onSubmit={handleSubmit} noValidate>
        <div className="mt-[48px] rounded-[28px] bg-surface p-[24px] shadow-card">
          <label htmlFor="display-name" className="mb-[12px] block text-[14px] font-bold text-title">
            {dict.personalInfo.label}
          </label>
          <div className="relative">
            <input
              ref={inputRef}
              id="display-name"
              type="text"
              name="name"
              autoComplete="name"
              enterKeyHint="done"
              value={value}
              onChange={(event) => {
                setDraft(event.target.value);
                if (errorKey) setErrorKey(null);
              }}
              onBlur={() => setErrorKey(validateDisplayName(value))}
              aria-invalid={Boolean(errorKey)}
              aria-describedby={errorKey ? "display-name-hint display-name-error" : "display-name-hint"}
              className={cn(
                "h-[56px] w-full rounded-[20px] bg-surface px-4 pe-[48px] text-[16px] font-bold text-title outline-none transition-colors placeholder:font-normal placeholder:text-muted",
                errorKey
                  ? "border-2 border-danger"
                  : "border-[1.5px] border-line focus:border-2 focus:border-primary",
              )}
              placeholder={dict.auth.fullNamePlaceholder}
            />
            <span
              aria-hidden
              onClick={() => inputRef.current?.focus()}
              className="absolute end-[16px] top-1/2 -translate-y-1/2 cursor-pointer text-hint-amber"
            >
              <EditIcon className="h-[20px] w-[20px]" />
            </span>
          </div>
          <p
            id="display-name-error"
            aria-live="polite"
            className={cn("text-[12px] font-medium text-danger", errorKey && "mt-[8px]")}
          >
            {errorKey ? errorMessages[errorKey] : null}
          </p>
          <p
            id="display-name-hint"
            className="mt-[16px] flex items-center gap-[8px] text-[14px] font-medium leading-[1.5] text-hint-amber-text"
          >
            <InfoIcon className="h-[20px] w-[20px] shrink-0 text-hint-amber" />
            {dict.personalInfo.hint}
          </p>
        </div>

        <div className="mt-[24px] flex min-h-[80px] items-center gap-[12px] rounded-[28px] bg-tint-peach p-[20px]">
          <p className="flex-1 text-[14px] leading-[1.6] text-muted">{dict.personalInfo.note}</p>
          <ShieldUserIcon className="h-[28px] w-[28px] shrink-0 text-primary" />
        </div>
      </form>

      <Modal open={discardOpen} onClose={() => setDiscardOpen(false)} labelledBy="discard-title">
        <h2 id="discard-title" className="text-[1.25rem] font-extrabold text-title">
          {dict.personalInfo.discardTitle}
        </h2>
        <p className="mt-2 text-[0.875rem] text-muted">{dict.personalInfo.discardBody}</p>
        <div className="mt-5 space-y-3">
          <PrimaryButton onClick={goBack}>{dict.personalInfo.discardConfirm}</PrimaryButton>
          <PrimaryButton variant="outline" onClick={() => setDiscardOpen(false)}>
            {dict.common.cancel}
          </PrimaryButton>
        </div>
      </Modal>
    </SettingsScreen>
  );
}
