"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n/DictionaryProvider";
import { brand } from "@/lib/brand";
import { fetchFaq } from "@/lib/api";
import { matchesQuery, normalizeTokens } from "@/lib/text";
import { faqItems, type FaqItem } from "@/data/faq";
import { SettingsScreen } from "@/components/SettingsScreen";
import { SearchPill } from "@/components/SearchPill";
import { FaqAccordion } from "@/components/help/FaqAccordion";
import { ContactModal } from "@/components/help/ContactModal";
import { PhoneIcon, SearchIcon } from "@/components/icons";
import "./faq.css";

type Phase = "loading" | "ready";

export default function HelpFaqPage() {
  const { locale, dict, t, pick } = useI18n();
  const router = useRouter();

  const [items, setItems] = useState<FaqItem[]>([]);
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("loading");
  const [isOffline, setIsOffline] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  const pickRef = useRef(pick);
  const initializedRef = useRef(false);
  const lastTokensRef = useRef("");
  const tokensRef = useRef<string[]>([]);

  useEffect(() => {
    pickRef.current = pick;
  }, [pick]);

  // Load the FAQ through the mock API (cached, so it stays readable offline).
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      let data: FaqItem[];
      try {
        data = await fetchFaq();
      } catch {
        data = faqItems;
      }
      if (cancelled) return;

      const activeTokens = tokensRef.current;
      const hashed = window.location.hash.replace(/^#/, "");
      const hashExists = hashed.length > 0 && data.some((item) => item.id === hashed);
      const firstMatch = data.find((item) =>
        matchesQuery(
          `${pickRef.current(item.question)} ${pickRef.current(item.answer)}`,
          activeTokens,
        ),
      );

      setItems(data);
      setPhase("ready");
      setOpenId(
        hashExists ? hashed : (firstMatch?.id ?? data[0]?.id ?? null),
      );
      lastTokensRef.current = activeTokens.join("\u0000");
      initializedRef.current = true;

      if (hashExists) {
        window.setTimeout(() => {
          document.getElementById(hashed)?.scrollIntoView({ block: "start" });
        }, 80);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Deep link: ?q= prefills the search.
  useEffect(() => {
    const init = () => {
      const params = new URLSearchParams(window.location.search);
      const q = params.get("q");
      if (q) {
        setQuery(q);
        setDebounced(q);
      }
    };
    init();
  }, []);

  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(query), 150);
    return () => window.clearTimeout(id);
  }, [query]);

  useEffect(() => {
    const update = () => setIsOffline(!navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  const tokens = useMemo(() => normalizeTokens(debounced), [debounced]);

  const filtered = useMemo(
    () =>
      items.filter((item) =>
        matchesQuery(`${pick(item.question)} ${pick(item.answer)}`, tokens),
      ),
    [items, pick, tokens],
  );

  // With a query the first result opens; clearing restores the first item.
  useEffect(() => {
    tokensRef.current = tokens;
    if (!initializedRef.current) return;
    const key = tokens.join("\u0000");
    if (key === lastTokensRef.current) return;
    lastTokensRef.current = key;
    setOpenId(tokens.length > 0 ? (filtered[0]?.id ?? null) : (items[0]?.id ?? null));
  }, [tokens, filtered, items]);

  const goBack = useCallback(() => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.replace(`/${locale}/profile/help`);
    }
  }, [locale, router]);

  const handleContact = () => {
    const isPhone =
      typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
    if (isPhone) {
      window.location.href = `tel:${brand.support.phone}`;
      return;
    }
    setContactOpen(true);
  };

  const handleSubmit = () => {
    setDebounced(query);
    if (typeof document !== "undefined") {
      (document.activeElement as HTMLElement | null)?.blur();
    }
  };

  const toggle = (id: string) => setOpenId((current) => (current === id ? null : id));

  const label =
    tokens.length > 0 ? t(dict.faq.results, { n: filtered.length }) : dict.faq.section;
  const searching = tokens.length > 0;

  return (
    <SettingsScreen
      title={dict.faq.title}
      subtitle={dict.faq.subtitle}
      backLabel={dict.common.back}
      onBack={goBack}
      cta={
        <div className="faq-cta">
          <span aria-hidden className="faq-cta-fade" />
          <a
            href={`tel:${brand.support.phone}`}
            onClick={(event) => {
              if (event.metaKey || event.ctrlKey) return;
              event.preventDefault();
              handleContact();
            }}
            className="flex min-h-[60px] w-full items-center justify-center gap-[10px] rounded-full bg-primary-gradient px-[20px] py-[10px] text-center text-[16px] font-extrabold leading-tight text-white shadow-cta transition-transform duration-200 active:scale-[0.98]"
          >
            <PhoneIcon className="h-[20px] w-[20px] shrink-0" />
            {dict.faq.cta}
          </a>
        </div>
      }
    >
      <div className="mt-[48px]">
        <SearchPill
          size="lg"
          value={query}
          onChange={setQuery}
          onSubmit={handleSubmit}
          placeholder={dict.faq.searchPlaceholder}
          buttonLabel={dict.faq.searchButton}
          clearLabel={dict.faq.clear}
        />
      </div>

      {isOffline ? (
        <p
          role="status"
          className="mt-[12px] rounded-[12px] bg-tint-peach px-[16px] py-[8px] text-[13px] text-hint-amber-text"
        >
          {dict.faq.offline}
        </p>
      ) : null}

      <div className="mt-[24px] flex items-center gap-[8px]" aria-live="polite">
        <span aria-hidden className="h-[10px] w-[10px] shrink-0 rounded-full bg-primary" />
        <p className="text-[14px] font-bold text-muted">{label}</p>
      </div>

      <div className="mt-[16px]">
        {phase === "loading" ? (
          <ul aria-label={dict.faq.loading} className="flex flex-col gap-[8px]">
            {[0, 1, 2].map((index) => (
              <li
                key={index}
                className="h-[64px] animate-pulse rounded-[24px] bg-surface-soft shadow-card"
              />
            ))}
          </ul>
        ) : items.length === 0 ? (
          <p className="py-[32px] text-center text-[14px] text-muted">{dict.faq.empty}</p>
        ) : searching && filtered.length === 0 ? (
          <div className="py-[32px] text-center">
            <SearchIcon className="mx-auto h-[40px] w-[40px] text-muted" />
            <p className="mt-[12px] text-[16px] font-bold text-title">
              {dict.faq.noResults}
            </p>
            <p className="mt-[4px] text-[14px] text-muted">{dict.faq.noResultsHint}</p>
          </div>
        ) : (
          <FaqAccordion items={filtered} openId={openId} onToggle={toggle} tokens={tokens} />
        )}
      </div>

      {contactOpen ? <ContactModal onClose={() => setContactOpen(false)} /> : null}
    </SettingsScreen>
  );
}
