"use client";

// PLACEHOLDER destination — the FAQ is a proposal (DESIGN.md 12.6) until the
// owner sends its mockup.

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n/DictionaryProvider";
import { SettingsScreen } from "@/components/SettingsScreen";
import { FaqList } from "@/components/help/FaqList";

export default function HelpFaqPage() {
  const { locale, dict } = useI18n();
  const router = useRouter();

  const goBack = useCallback(() => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.replace(`/${locale}/profile/help`);
    }
  }, [locale, router]);

  return (
    <SettingsScreen
      title={dict.help.faqTitle}
      subtitle={dict.help.faqSub}
      backLabel={dict.common.back}
      onBack={goBack}
    >
      <FaqList />
    </SettingsScreen>
  );
}
