"use client";

import { useI18n } from "@/lib/i18n/DictionaryProvider";
import { Modal } from "@/components/Modal";
import { PrimaryButton } from "@/components/PrimaryButton";
import { CloudUploadIcon } from "@/components/icons";

export function IosInstallSheet({ onClose }: { onClose: () => void }) {
  const { dict } = useI18n();

  return (
    <Modal open onClose={onClose} labelledBy="ios-install-title" bottomSheet>
      <div className="text-center">
        <span
          aria-hidden
          className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-tint text-primary"
        >
          <CloudUploadIcon className="h-7 w-7" />
        </span>
        <h2 id="ios-install-title" className="mt-4 text-[1.25rem] font-extrabold text-title">
          {dict.pwa.installApp}
        </h2>
        <p className="mt-3 text-[15px] leading-[1.7] text-muted">{dict.pwa.iosInstall}</p>
        <div className="mt-6">
          <PrimaryButton size="lg" onClick={onClose}>
            {dict.common.close}
          </PrimaryButton>
        </div>
      </div>
    </Modal>
  );
}
