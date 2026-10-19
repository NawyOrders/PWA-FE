"use client";

// PLACEHOLDER UI — the FAQ destination is a proposal (DESIGN.md 12.6) until
// the owner sends its mockup. Searchable accordion grouped by topic. Shared
// by the FAQ modal and the FAQ route.

import { useMemo, useState } from "react";
import { useI18n } from "@/lib/i18n/DictionaryProvider";
import { cn } from "@/lib/cn";
import { ExpandIcon, SearchIcon } from "@/components/icons";

export function FaqList() {
  const { dict } = useI18n();
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const items = useMemo(
    () => [
      { id: "orders", topic: dict.help.topicOrders, q: dict.help.faqQ1, a: dict.help.faqA1 },
      { id: "payment", topic: dict.help.topicPayment, q: dict.help.faqQ2, a: dict.help.faqA2 },
      { id: "delivery", topic: dict.help.topicDelivery, q: dict.help.faqQ3, a: dict.help.faqA3 },
      { id: "account", topic: dict.help.topicAccount, q: dict.help.faqQ4, a: dict.help.faqA4 },
    ],
    [dict],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (item) =>
        item.q.toLowerCase().includes(q) ||
        item.a.toLowerCase().includes(q) ||
        item.topic.toLowerCase().includes(q),
    );
  }, [items, query]);

  return (
    <>
      <div className="relative mt-[24px]">
        <SearchIcon className="pointer-events-none absolute top-1/2 h-[20px] w-[20px] -translate-y-1/2 text-muted start-[16px]" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={dict.help.faqSearchPlaceholder}
          aria-label={dict.help.faqSearchPlaceholder}
          className="h-[56px] w-full rounded-[20px] border-[1.5px] border-line bg-surface px-4 ps-[48px] text-[16px] text-title outline-none transition-colors placeholder:text-muted focus:border-2 focus:border-primary"
        />
      </div>

      <div className="mt-[16px] flex flex-col gap-[12px]">
        {filtered.length === 0 ? (
          <p className="py-[24px] text-center text-[14px] text-muted">{dict.help.faqEmpty}</p>
        ) : (
          filtered.map((item) => {
            const open = openId === item.id;
            return (
              <div key={item.id} className="rounded-[20px] border-[1.5px] border-line bg-surface">
                <button
                  type="button"
                  aria-expanded={open}
                  onClick={() => setOpenId(open ? null : item.id)}
                  className="flex min-h-[56px] w-full items-center justify-between gap-3 px-[16px] text-start"
                >
                  <span className="min-w-0">
                    <span className="block text-[12px] font-bold text-primary">{item.topic}</span>
                    <span className="block text-[15px] font-bold text-title">{item.q}</span>
                  </span>
                  <ExpandIcon
                    className={cn(
                      "h-[20px] w-[20px] shrink-0 text-muted transition-transform duration-200",
                      open && "rotate-180",
                    )}
                  />
                </button>
                {open ? (
                  <p className="px-[16px] pb-[16px] text-[14px] leading-[1.7] text-muted">{item.a}</p>
                ) : null}
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
