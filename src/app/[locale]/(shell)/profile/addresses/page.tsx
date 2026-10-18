"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import "./addresses.css";
import { useI18n } from "@/lib/i18n/DictionaryProvider";
import { useAuthStore } from "@/store/authStore";
import { useUiStore } from "@/store/uiStore";
import {
  createAddress,
  formatAddressLine,
  sameAddressList,
  useAddressStore,
  type Address,
} from "@/store/addressStore";
import { fetchAddresses, saveAddresses } from "@/lib/api";
import { cn } from "@/lib/cn";
import { SettingsScreen } from "@/components/SettingsScreen";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Modal } from "@/components/Modal";
import { AddressFormSheet } from "@/components/address/AddressFormSheet";
import {
  BriefcaseIcon,
  HomeIcon,
  LocationIcon,
  PlusIcon,
  StorePinIcon,
  TrashIcon,
} from "@/components/icons";
import type { Dictionary } from "@/lib/i18n/types";

const MAX_ADDRESSES = 5;
const COLLAPSE_MS = 250;
const UNDO_MS = 5000;

type Status = "loading" | "ready" | "error";

function displayName(address: Address, dict: Dictionary): string {
  if (address.type === "home") return dict.addresses.home;
  if (address.type === "work") return dict.addresses.work;
  return address.customLabel.trim() || dict.addresses.other;
}

function TypeIcon({ type, className }: { type: Address["type"]; className?: string }) {
  if (type === "home") return <HomeIcon className={className} />;
  if (type === "work") return <BriefcaseIcon className={className} />;
  return <StorePinIcon className={className} />;
}

export default function AddressesPage() {
  const { locale, dict } = useI18n();
  const router = useRouter();
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const setStoredAddresses = useAddressStore((state) => state.setAddresses);
  const openLoginModal = useUiStore((state) => state.openLoginModal);
  const closeLoginModal = useUiStore((state) => state.closeLoginModal);
  const showToast = useUiStore((state) => state.showToast);

  const loadStartedRef = useRef(false);
  const loadRef = useRef<() => void>(() => undefined);
  const collapseTimerRef = useRef<number | null>(null);
  const cardRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const addBtnRef = useRef<HTMLButtonElement>(null);

  const [status, setStatus] = useState<Status>("loading");
  const [saved, setSaved] = useState<Address[]>([]);
  const [draft, setDraft] = useState<Address[] | null>(null);
  const [collapsingId, setCollapsingId] = useState<string | null>(null);
  const [sheet, setSheet] = useState<{ mode: "add" | "edit"; address: Address } | null>(null);
  const [discardOpen, setDiscardOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      await fetchAddresses();
      await useAddressStore.persist.rehydrate();
      const data = useAddressStore.getState().addresses;
      setSaved(data);
      setDraft(data);
      setStatus("ready");
    } catch {
      setStatus("error");
      showToast(dict.addresses.loadError, "danger", {
        duration: UNDO_MS,
        action: { label: dict.addresses.retry, onAction: () => loadRef.current() },
      });
    }
  }, [dict, showToast]);

  useEffect(() => {
    loadRef.current = () => void load();
  }, [load]);

  useEffect(() => {
    if (loadStartedRef.current) return;
    loadStartedRef.current = true;
    void load();
  }, [load]);

  useEffect(() => {
    if (!isLoggedIn) {
      openLoginModal();
    } else {
      closeLoginModal();
    }
  }, [isLoggedIn, openLoginModal, closeLoginModal]);

  useEffect(() => {
    return () => {
      if (collapseTimerRef.current !== null) {
        window.clearTimeout(collapseTimerRef.current);
      }
    };
  }, []);

  const list = draft ?? [];
  const dirty = draft !== null && !sameAddressList(draft, saved);
  const canSave = dirty && !saving && status === "ready";
  const atLimit = list.length >= MAX_ADDRESSES;

  const goBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.replace(`/${locale}/profile`);
    }
  };

  const handleBack = () => {
    if (dirty) {
      setDiscardOpen(true);
      return;
    }
    goBack();
  };

  const handleSave = async () => {
    if (!draft || !dirty || saving) return;
    const next = draft;
    setSaving(true);
    try {
      await saveAddresses(next);
    } catch {
      showToast(dict.addresses.saveError, "danger");
      return;
    } finally {
      setSaving(false);
    }
    setStoredAddresses(next);
    setSaved(next);
    setDraft(next);
    showToast(dict.addresses.saved, "success");
    router.replace(`/${locale}/profile`);
  };

  const removeAddress = (id: string) => {
    if (!draft || saving || collapsingId) return;
    const index = draft.findIndex((address) => address.id === id);
    if (index < 0) return;
    const removed = draft[index];
    const nextFocus = draft[index + 1] ?? draft[index - 1] ?? null;
    setCollapsingId(id);
    collapseTimerRef.current = window.setTimeout(() => {
      collapseTimerRef.current = null;
      setDraft((prev) => (prev ? prev.filter((address) => address.id !== id) : prev));
      setCollapsingId(null);
      if (nextFocus) {
        cardRefs.current[nextFocus.id]?.focus();
      } else {
        addBtnRef.current?.focus();
      }
      showToast(dict.addresses.removed, "default", {
        duration: UNDO_MS,
        action: {
          label: dict.addresses.undo,
          onAction: () => {
            setDraft((prev) => {
              if (!prev) return prev;
              const restored = [...prev];
              restored.splice(Math.min(index, restored.length), 0, removed);
              return restored;
            });
            requestAnimationFrame(() => cardRefs.current[id]?.focus());
          },
        },
      });
    }, COLLAPSE_MS);
  };

  const commitSheet = (address: Address) => {
    setDraft((prev) => {
      if (!prev) return prev;
      const exists = prev.some((item) => item.id === address.id);
      const next = exists
        ? prev.map((item) => (item.id === address.id ? address : item))
        : [...prev, address];
      return address.isDefault
        ? next.map((item) => (item.id === address.id ? item : { ...item, isDefault: false }))
        : next;
    });
    setSheet(null);
  };

  return (
    <SettingsScreen
      title={dict.addresses.title}
      subtitle={dict.addresses.subtitle}
      backLabel={dict.common.back}
      onBack={handleBack}
      cta={
        <PrimaryButton size="lg" disabled={!canSave} loading={saving} onClick={() => void handleSave()}>
          {dict.addresses.save}
        </PrimaryButton>
      }
    >
      {status === "loading" ? (
        <div className="mt-[48px] flex flex-col gap-[16px]" aria-hidden>
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className="min-h-[84px] rounded-[24px] border-[1.5px] border-line bg-surface p-[16px]"
            >
              <div className="flex h-full items-center gap-[12px]">
                <div className="skeleton h-[40px] w-[40px] shrink-0 rounded-[12px]" />
                <div className="min-w-0 flex-1 space-y-[8px]">
                  <div className="skeleton h-[14px] w-[35%] rounded-full" />
                  <div className="skeleton h-[12px] w-[65%] rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {status === "ready" ? (
        <>
          {list.length === 0 ? (
            <div className="mt-[48px] flex flex-col items-center text-center">
              <span
                aria-hidden
                className="flex h-[40px] w-[40px] items-center justify-center rounded-[12px] bg-primary-gradient shadow-[0_4px_12px_var(--primary-soft)]"
              >
                <LocationIcon className="h-[22px] w-[22px] text-white" />
              </span>
              <h2 className="mt-[16px] text-[16px] font-bold text-title">{dict.addresses.empty}</h2>
              <p className="mt-[4px] text-[14px] text-muted">{dict.addresses.emptyHint}</p>
            </div>
          ) : (
            <ul className="mt-[48px] flex flex-col gap-[16px]">
              {list.map((address) => {
                const label = displayName(address, dict);
                const collapsing = collapsingId === address.id;
                return (
                  <li
                    key={address.id}
                    className={cn("min-w-0", collapsing && "ad-collapse ad-collapse--out")}
                  >
                    <div className="relative">
                      <button
                        type="button"
                        ref={(element) => {
                          cardRefs.current[address.id] = element;
                        }}
                        aria-label={`${dict.addresses.editLabel}: ${label}`}
                        onClick={() => {
                          if (collapsing || saving) return;
                          setSheet({ mode: "edit", address });
                        }}
                        className="flex min-h-[84px] w-full items-center gap-[12px] rounded-[24px] border-[1.5px] border-line bg-surface p-[16px] pe-[60px] text-start transition-transform duration-200 active:scale-[0.99]"
                      >
                        <span
                          aria-hidden
                          className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-[12px] bg-primary-gradient shadow-[0_4px_12px_var(--primary-soft)]"
                        >
                          <TypeIcon type={address.type} className="h-[22px] w-[22px] text-white" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[16px] font-bold leading-[1.4] text-title">
                            {label}
                          </span>
                          <span className="mt-[2px] block truncate text-[14px] leading-[1.5] text-muted">
                            {formatAddressLine(address, locale)}
                          </span>
                        </span>
                      </button>
                      <button
                        type="button"
                        aria-label={`${dict.addresses.deleteLabel}: ${label}`}
                        disabled={collapsing || saving}
                        onClick={() => removeAddress(address.id)}
                        className="absolute end-[8px] top-1/2 flex h-[44px] w-[44px] -translate-y-1/2 items-center justify-center text-primary transition-transform duration-200 active:scale-90 disabled:opacity-50"
                      >
                        <TrashIcon className="h-[20px] w-[20px]" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          <button
            ref={addBtnRef}
            type="button"
            disabled={atLimit || saving}
            onClick={() => setSheet({ mode: "add", address: createAddress() })}
            className="mt-[24px] flex min-h-[80px] w-full items-center justify-center gap-[8px] rounded-[24px] border-[1.5px] border-dashed border-primary bg-transparent text-[15px] font-bold text-primary transition-transform duration-200 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <PlusIcon className="h-[24px] w-[24px]" />
            {dict.addresses.add}
          </button>
          {atLimit ? (
            <p className="mt-[8px] text-center text-[14px] text-muted">{dict.addresses.limit}</p>
          ) : null}
        </>
      ) : null}

      <Modal open={discardOpen} onClose={() => setDiscardOpen(false)} labelledBy="discard-title">
        <h2 id="discard-title" className="text-[1.25rem] font-extrabold text-title">
          {dict.addresses.discardTitle}
        </h2>
        <p className="mt-2 text-[0.875rem] text-muted">{dict.addresses.discardBody}</p>
        <div className="mt-5 space-y-3">
          <PrimaryButton onClick={goBack}>{dict.addresses.discardConfirm}</PrimaryButton>
          <PrimaryButton variant="outline" onClick={() => setDiscardOpen(false)}>
            {dict.common.cancel}
          </PrimaryButton>
        </div>
      </Modal>

      {sheet ? (
        <AddressFormSheet
          key={`${sheet.mode}-${sheet.address.id}`}
          address={sheet.address}
          mode={sheet.mode}
          onClose={() => setSheet(null)}
          onSubmit={commitSheet}
        />
      ) : null}
    </SettingsScreen>
  );
}
