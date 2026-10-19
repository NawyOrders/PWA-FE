"use client";

// Contact modal shown on desktop when the CTA is pressed (on phones the CTA
// uses a tel: link instead). All details come from src/lib/brand.ts.

import { useState } from "react";
import { useI18n } from "@/lib/i18n/DictionaryProvider";
import { brand } from "@/lib/brand";
import { Modal } from "@/components/Modal";
import { CircleIconButton } from "@/components/CircleIconButton";
import { CloseIcon, CopyIcon, MailIcon, WhatsAppIcon } from "@/components/icons";

function formatMinutes(minutes: number, locale: "ar" | "en"): string {
  const hours24 = Math.floor(minutes / 60) % 24;
  const mins = minutes % 60;
  const suffix = hours24 < 12 ? (locale === "ar" ? "ص" : "AM") : locale === "ar" ? "م" : "PM";
  let hours12 = hours24 % 12;
  if (hours12 === 0) hours12 = 12;
  return `${hours12}:${String(mins).padStart(2, "0")} ${suffix}`;
}

interface ContactModalProps {
  onClose: () => void;
}

export function ContactModal({ onClose }: ContactModalProps) {
  const { locale, dict, t } = useI18n();
  const [copied, setCopied] = useState(false);
  const { hours } = brand.support;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(brand.support.phone);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Modal open onClose={onClose} labelledBy="contact-title">
      <div className="flex items-center justify-between gap-3">
        <h2 id="contact-title" className="text-[1.25rem] font-extrabold text-title">
          {dict.help.contactTitle}
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

      <p className="mt-[4px] text-[13px] text-muted">
        {t(dict.help.contactHours, {
          from: formatMinutes(hours.opensAt, locale),
          to: formatMinutes(hours.closesAt, locale),
        })}
      </p>

      <div className="mt-[20px] rounded-[20px] border-[1.5px] border-line bg-surface p-[16px]">
        <p className="text-[13px] font-bold text-muted">{dict.help.contactPhoneLabel}</p>
        <div className="mt-[6px] flex items-center justify-between gap-3">
          <a
            href={`tel:${brand.support.phone}`}
            dir="ltr"
            className="font-latin text-[18px] font-extrabold text-title"
          >
            {brand.support.phoneDisplay}
          </a>
          <button
            type="button"
            onClick={() => void handleCopy()}
            className="flex h-[44px] items-center gap-[6px] rounded-full bg-primary-tint px-[16px] text-[13px] font-bold text-primary transition-transform active:scale-95"
          >
            <CopyIcon className="h-[18px] w-[18px]" />
            {copied ? dict.help.contactCopied : dict.help.contactCopy}
          </button>
        </div>
      </div>

      <div className="mt-[12px] flex flex-col gap-[12px]">
        <a
          href={brand.support.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-[56px] items-center gap-[12px] rounded-[20px] border-[1.5px] border-line bg-surface px-[16px] text-[16px] font-bold text-title transition-transform active:scale-[0.99]"
        >
          <WhatsAppIcon className="h-[22px] w-[22px] text-success" />
          {dict.help.contactWhatsapp}
        </a>
        <a
          href={`mailto:${brand.support.email}`}
          className="flex min-h-[56px] items-center gap-[12px] rounded-[20px] border-[1.5px] border-line bg-surface px-[16px] text-[16px] font-bold text-title transition-transform active:scale-[0.99]"
        >
          <MailIcon className="h-[22px] w-[22px] text-primary" />
          <span className="min-w-0 truncate">
            {dict.help.contactEmail}
            <span dir="ltr" className="ms-2 font-latin text-[13px] font-normal text-muted">
              {brand.support.email}
            </span>
          </span>
        </a>
      </div>
    </Modal>
  );
}
