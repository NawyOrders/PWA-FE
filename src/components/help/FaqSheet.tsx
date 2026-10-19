"use client";

// PLACEHOLDER UI — the FAQ destination is a proposal (DESIGN.md 12.6) until
// the owner sends its mockup.

import { useI18n } from "@/lib/i18n/DictionaryProvider";
import { Modal } from "@/components/Modal";
import { CircleIconButton } from "@/components/CircleIconButton";
import { CloseIcon } from "@/components/icons";
import { FaqList } from "@/components/help/FaqList";

interface FaqSheetProps {
  onClose: () => void;
}

export function FaqSheet({ onClose }: FaqSheetProps) {
  const { dict } = useI18n();

  return (
    <Modal open onClose={onClose} labelledBy="faq-title">
      <div className="flex items-center justify-between gap-3">
        <h2 id="faq-title" className="text-[1.25rem] font-extrabold text-title">
          {dict.help.faqTitle}
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
      <div className="mt-[-8px]">
        <FaqList />
      </div>
    </Modal>
  );
}
