"use client";

import { useI18n } from "@/lib/i18n/DictionaryProvider";
import { cn } from "@/lib/cn";
import { highlightSegments } from "@/lib/text";
import { ExpandIcon } from "@/components/icons";
import type { FaqItem } from "@/data/faq";

function Highlighted({ text, tokens }: { text: string; tokens: string[] }) {
  const segments = highlightSegments(text, tokens);
  return (
    <>
      {segments.map((segment, index) =>
        segment.match ? (
          <mark key={index} className="rounded-[4px] bg-tint-peach text-title">
            {segment.value}
          </mark>
        ) : (
          <span key={index}>{segment.value}</span>
        ),
      )}
    </>
  );
}

interface FaqAccordionProps {
  items: FaqItem[];
  openId: string | null;
  onToggle: (id: string) => void;
  tokens: string[];
}

export function FaqAccordion({ items, openId, onToggle, tokens }: FaqAccordionProps) {
  const { pick } = useI18n();

  return (
    <ul className="flex flex-col gap-[8px]">
      {items.map((item) => {
        const open = openId === item.id;
        return (
          <li key={item.id} id={item.id} className="anchor">
            <div className="overflow-hidden rounded-[24px] bg-surface-soft shadow-card">
              <button
                type="button"
                id={`faq-header-${item.id}`}
                aria-expanded={open}
                aria-controls={`faq-answer-${item.id}`}
                onClick={() => onToggle(item.id)}
                className="flex min-h-[64px] w-full items-center gap-[12px] px-[16px] py-[12px] text-start transition-colors duration-200 hover:bg-black/[0.03] active:bg-black/[0.05]"
              >
                <span
                  aria-hidden
                  className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-[12px] bg-primary-gradient text-[20px] font-extrabold text-white"
                >
                  ?
                </span>
                <span className="min-w-0 flex-1 text-[16px] font-bold leading-[1.4] text-title">
                  <Highlighted text={pick(item.question)} tokens={tokens} />
                </span>
                <ExpandIcon
                  className={cn(
                    "h-[20px] w-[20px] shrink-0 text-hint-amber transition-transform duration-200",
                    open && "rotate-180",
                  )}
                />
              </button>
              <div
                id={`faq-answer-${item.id}`}
                role="region"
                aria-labelledby={`faq-header-${item.id}`}
                inert={!open}
                className="grid transition-[grid-template-rows] duration-300 ease-smooth"
                style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
              >
                <div className="min-h-0 overflow-hidden">
                  <div
                    className={cn(
                      "px-[16px] pb-[16px] transition-opacity duration-300",
                      open ? "opacity-100" : "opacity-0",
                    )}
                  >
                    <div className="border-t border-line pt-[12px]">
                      <p className="text-[14px] leading-[2] text-muted">
                        <Highlighted text={pick(item.answer)} tokens={tokens} />
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
