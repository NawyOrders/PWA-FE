"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n/DictionaryProvider";
import { brand } from "@/lib/brand";
import { getSupportStatusNow } from "@/lib/supportHours";
import { SettingsScreen } from "@/components/SettingsScreen";
import { OptionCard, type OptionCardStatus } from "@/components/OptionCard";
import { ContactModal } from "@/components/help/ContactModal";
import { ChatSheet } from "@/components/help/ChatSheet";
import { FeedbackSheet } from "@/components/help/FeedbackSheet";
import { ReportSheet } from "@/components/help/ReportSheet";
import { FaqSheet } from "@/components/help/FaqSheet";
import {
  ChatIcon,
  PaperPlaneIcon,
  PhoneIcon,
  QuestionCircleIcon,
  WarningIcon,
} from "@/components/icons";
import "./help.css";

type Sheet = "faq" | "chat" | "feedback" | "report" | "contact" | null;

export default function HelpPage() {
  const { locale, dict, t } = useI18n();
  const router = useRouter();
  const [sheet, setSheet] = useState<Sheet>(null);
  const [status, setStatus] = useState(() =>
    getSupportStatusNow(locale === "ar" ? "ar" : "en"),
  );

  useEffect(() => {
    const id = window.setInterval(() => {
      setStatus(getSupportStatusNow(locale === "ar" ? "ar" : "en"));
    }, 60_000);
    return () => window.clearInterval(id);
  }, [locale]);

  const goBack = useCallback(() => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.replace(`/${locale}/profile`);
    }
  }, [locale, router]);

  const chatStatus: OptionCardStatus = {
    open: status.open,
    label: status.open
      ? dict.help.chatSub
      : status.opensAtLabel
        ? t(dict.help.chatOfflineWithTime, { time: status.opensAtLabel })
        : dict.help.chatOffline,
  };

  const cards = [
    {
      key: "faq",
      href: `/${locale}/profile/help/faq`,
      icon: <QuestionCircleIcon />,
      title: dict.help.faq,
      subtitle: dict.help.faqSub,
    },
    {
      key: "chat",
      onClick: () => setSheet("chat"),
      icon: <ChatIcon />,
      title: dict.help.chat,
      subtitle: dict.help.chatSub,
      status: chatStatus,
    },
    {
      key: "feedback",
      onClick: () => setSheet("feedback"),
      icon: <PaperPlaneIcon />,
      title: dict.help.feedback,
      subtitle: dict.help.feedbackSub,
    },
    {
      key: "report",
      onClick: () => setSheet("report"),
      icon: <WarningIcon />,
      title: dict.help.report,
      subtitle: dict.help.reportSub,
    },
  ];

  const handleContact = () => {
    // On phones (no hover, coarse pointer) use the native dialer; on desktop
    // open the contact modal. A real tel: link is always used on phone.
    const isPhone =
      typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
    if (isPhone) {
      window.location.href = `tel:${brand.support.phone}`;
      return;
    }
    setSheet("contact");
  };

  return (
    <SettingsScreen
      title={dict.help.title}
      subtitle={dict.help.subtitle}
      backLabel={dict.common.back}
      onBack={goBack}
      cta={
        <a
          href={`tel:${brand.support.phone}`}
          onClick={(event) => {
            if (event.metaKey || event.ctrlKey) return;
            event.preventDefault();
            handleContact();
          }}
          className="flex h-[60px] w-full items-center justify-center gap-[10px] rounded-full bg-primary-gradient text-[17px] font-extrabold text-white shadow-cta transition-transform duration-200 active:scale-[0.98]"
        >
          <PhoneIcon className="h-[20px] w-[20px]" />
          {dict.help.contactCta}
        </a>
      }
    >
      <ul className="hp-grid">
        {cards.map((card) => (
          <li key={card.key} className="min-w-0">
            <OptionCard
              icon={card.icon}
              title={card.title}
              subtitle={card.subtitle}
              status={card.status}
              href={card.href}
              onClick={card.onClick}
            />
          </li>
        ))}
      </ul>

      {/* PLACEHOLDER destinations — proposals until the owner sends their mockups (DESIGN.md 12.6). */}
      {sheet === "faq" ? <FaqSheet onClose={() => setSheet(null)} /> : null}
      {sheet === "chat" ? (
        <ChatSheet
          online={status.open}
          onlineLabel={chatStatus.label}
          onClose={() => setSheet(null)}
        />
      ) : null}
      {sheet === "feedback" ? <FeedbackSheet onClose={() => setSheet(null)} /> : null}
      {sheet === "report" ? <ReportSheet onClose={() => setSheet(null)} /> : null}
      {sheet === "contact" ? <ContactModal onClose={() => setSheet(null)} /> : null}
    </SettingsScreen>
  );
}
