"use client";

import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n/DictionaryProvider";
import { useUiStore } from "@/store/uiStore";
import { Modal } from "@/components/Modal";
import { PrimaryButton } from "@/components/PrimaryButton";
import { CircleIconButton } from "@/components/CircleIconButton";
import { ClockIcon, CloseIcon, LockIcon } from "@/components/icons";

export function LoginRequiredModal() {
  const { locale, dict } = useI18n();
  const router = useRouter();
  const open = useUiStore((state) => state.loginModalOpen);
  const close = useUiStore((state) => state.closeLoginModal);

  return (
    <Modal open={open} onClose={close} labelledBy="login-required-title" className="text-center">
      <div className="flex justify-end">
        <CircleIconButton label={dict.common.close} variant="muted" size="sm" onClick={close}>
          <CloseIcon className="h-5 w-5" />
        </CircleIconButton>
      </div>

      <div className="mx-auto -mt-4 flex h-[6.25rem] w-[6.25rem] items-center justify-center rounded-full bg-glow text-primary">
        <LockIcon className="h-12 w-12" />
      </div>

      <h2 id="login-required-title" className="mt-5 text-[1.375rem] font-extrabold text-title">
        {dict.loginRequired.title}
      </h2>
      <p className="mx-auto mt-2 max-w-[17.5rem] text-[0.875rem] text-muted">
        {dict.loginRequired.body}
      </p>

      <div className="mt-5">
        <PrimaryButton
          onClick={() => {
            close();
            router.push(`/${locale}/login`);
          }}
        >
          {dict.loginRequired.cta}
        </PrimaryButton>
      </div>

      <p className="mt-3 flex items-center justify-center gap-1.5 text-[0.75rem] text-muted">
        <ClockIcon className="h-4 w-4" />
        {dict.loginRequired.hint}
      </p>
    </Modal>
  );
}
