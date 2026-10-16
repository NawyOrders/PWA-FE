"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n/DictionaryProvider";

export default function SplashPage() {
  const { locale, dict } = useI18n();
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => router.replace(`/${locale}`), 1600);
    return () => clearTimeout(timer);
  }, [locale, router]);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-bg-splash px-6">
      <p className="text-[0.875rem] font-medium text-muted">
        {dict.splash.tagline}
      </p>
    </main>
  );
}
