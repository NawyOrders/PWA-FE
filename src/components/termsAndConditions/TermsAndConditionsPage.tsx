"use client";

import { PrivacyPolicyPage } from "@/components/privacyPolicy/PrivacyPolicyPage";
import { useI18n } from "@/lib/i18n/DictionaryProvider";

export function TermsAndConditionsPage() {
  const { dict } = useI18n();
  return <PrivacyPolicyPage title={dict.aboutRestaurant.terms} />;
}
