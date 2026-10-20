"use client";

import { useRef, useState, type ReactNode } from "react";
import { useI18n } from "@/lib/i18n/DictionaryProvider";
import { TrashIcon } from "@/components/icons";

interface SwipeToDeleteProps {
  onDelete: () => void;
  deleteLabel: string;
  children: ReactNode;
}

export function SwipeToDelete({ onDelete, deleteLabel, children }: SwipeToDeleteProps) {
  const { dir } = useI18n();
  const [translate, setTranslate] = useState(0);
  const [dragging, setDragging] = useState(false);
  const gesture = useRef<{ pointerId: number; startX: number } | null>(null);
  const draggingRef = useRef(false);
  const reveal = 88;
  const threshold = 8;
  const rtl = dir === "rtl";

  const clamp = (value: number) =>
    rtl ? Math.min(0, Math.max(-reveal, value)) : Math.max(0, Math.min(reveal, value));

  const reset = () => {
    gesture.current = null;
    draggingRef.current = false;
    setDragging(false);
  };

  return (
    <div className="relative overflow-hidden rounded-card">
      <button
        type="button"
        aria-label={deleteLabel}
        onClick={onDelete}
        className="absolute inset-y-0 start-0 flex w-[88px] items-center justify-center bg-danger-strong text-white"
      >
        <TrashIcon className="h-6 w-6" />
      </button>

      <div
        className="relative touch-pan-y"
        style={{
          transform: `translateX(${translate}px)`,
          transition: dragging ? "none" : "transform 240ms cubic-bezier(0.16,1,0.3,1)",
        }}
        onPointerDown={(event) => {
          if (event.pointerType === "mouse" && event.button !== 0) return;
          gesture.current = { pointerId: event.pointerId, startX: event.clientX };
        }}
        onPointerMove={(event) => {
          const active = gesture.current;
          if (!active || active.pointerId !== event.pointerId) return;
          const delta = event.clientX - active.startX;

          if (!draggingRef.current) {
            if (Math.abs(delta) < threshold) return;
            draggingRef.current = true;
            setDragging(true);
            event.currentTarget.setPointerCapture(event.pointerId);
          }

          setTranslate(clamp(delta));
        }}
        onPointerUp={(event) => {
          const active = gesture.current;
          if (!active || active.pointerId !== event.pointerId) return;
          if (draggingRef.current) {
            setTranslate((current) =>
              Math.abs(current) > reveal / 2 ? (rtl ? -reveal : reveal) : 0,
            );
          }
          reset();
        }}
        onPointerCancel={() => {
          setTranslate(0);
          reset();
        }}
      >
        {children}
      </div>
    </div>
  );
}
