"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { useI18n } from "@/lib/i18n";
import { markOrderConfirmed } from "@/lib/orderStatus";
import {
  useCartStore,
  getFulfillmentTotals,
  getCartLineId,
  type CartItem,
} from "@/store/cartStore";
import { useOrdersStore } from "@/store/ordersStore";
import { getDish } from "@/data/dishes";
import { dishImage } from "@/lib/image";
import { formatPrice } from "@/lib/format";
import type {
  CheckoutIssue,
  CheckoutValidation,
  CheckoutValidationInput,
} from "@/lib/checkout";
import {
  CheckoutRequestError,
  createServerOrder,
  validateCheckout,
} from "@/lib/checkout-client";
import {
  getCheckoutIdempotencyKey,
  readDeliveryQuote,
  readSelectedAddress,
  readSelectedBranch,
  rotateCheckoutIdempotencyKey,
} from "@/lib/checkout-session";

type PaymentMethod = "cash" | "instapay" | "wallet";
type PaymentFile = { file: File; previewUrl: string };

function ArrowIcon() {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M19 12H5m7 7-7-7 7-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function Radio({ selected }: { selected: boolean }) {
  return <span className={`payment-radio${selected ? " is-selected" : ""}`} aria-hidden="true">{selected && <span />}</span>;
}

function PaymentOption({ method, selected, title, description, image, onSelect }: { method: PaymentMethod; selected: boolean; title: string; description: string; image: string; onSelect: (method: PaymentMethod) => void }) {
  return <button type="button" role="radio" aria-checked={selected} className={`payment-option${selected ? " is-selected" : ""}`} onClick={() => onSelect(method)}>
    <Radio selected={selected} /><span className="payment-option-copy"><strong>{title}</strong><small>{description}</small></span>
    <span className={`payment-method-icon method-${method}`}><Image src={image} alt="" width={42} height={42} /></span>
  </button>;
}

function OrderSummary({ subtotal, deliveryFee, discount, tax, total, items }: { subtotal: number; deliveryFee: number; discount: number; tax: number; total: number; items: CartItem[] }) {
  const { locale, t } = useI18n();
  const summaryItems = items
    .map((item) => ({ item, dish: getDish(item.dishId) }))
    .filter((entry): entry is { item: CartItem; dish: NonNullable<typeof entry.dish> } => Boolean(entry.dish));
  return <section className="payment-summary" aria-labelledby="payment-summary-title">
    <h2 id="payment-summary-title">{t("orderSummaryPayment")}</h2>
    <div className="payment-summary-lines"><div className="payment-summary-labels"><span>{t("subtotal")}</span><span>{t("deliveryFee")}</span><span>{t("discount")}</span>{tax > 0 ? <span>{t("receiptTax")}</span> : null}</div>
      <div className="payment-summary-values"><strong>{formatPrice(subtotal, locale)}</strong><strong>{formatPrice(deliveryFee, locale)}</strong><strong className="payment-discount">{discount > 0 ? `-${formatPrice(discount, locale)}` : formatPrice(0, locale)}</strong>{tax > 0 ? <strong>{formatPrice(tax, locale)}</strong> : null}</div></div>
    <div className="payment-summary-divider" /><div className="payment-summary-bottom">
      <div className="payment-summary-items" aria-label={t("orderItemsCount")}>{summaryItems.map(({ item, dish }) => <span className="payment-summary-thumb" key={getCartLineId(item)}><Image src={dishImage(dish.image, "thumb")} alt={t("itemImageAlt")} fill sizes="60px" /></span>)}</div>
      <div className="payment-summary-total"><span>{t("total")}</span><strong>{formatPrice(total, locale)}</strong></div>
    </div>
  </section>;
}

function ReceiptModal({ file, onClose, onConfirm }: { file: PaymentFile; onClose: () => void; onConfirm: () => void }) {
  const { t } = useI18n();
  const sizeInMb = (file.file.size / (1024 * 1024)).toFixed(1);
  return <div className="payment-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="receipt-modal" role="dialog" aria-modal="true" aria-labelledby="receipt-modal-title">
      <button type="button" className="receipt-modal-close" onClick={onClose} aria-label={t("close")}><span aria-hidden="true">{"\u00d7"}</span></button>
      <Image className="receipt-modal-art" src="/icons/audit.png" alt="" width={86} height={86} />
      <div className="receipt-file-row"><span className="receipt-preview"><Image src={file.previewUrl} alt={t("receiptPreview")} fill unoptimized sizes="64px" /></span>
        <div className="receipt-file-copy"><h2 id="receipt-modal-title" title={file.file.name}>{file.file.name}</h2><p><span>{sizeInMb} MB</span><span aria-hidden="true">{"\u2022"}</span><strong>{t("receiptSelected")}</strong><span className="receipt-ready-check" aria-hidden="true">{"\u2713"}</span></p></div>
      </div>
      <div className="receipt-progress" aria-label={t("receiptReady")}><span /></div>
      <p className="receipt-modal-note"><Image src="/icons/inforect.png" alt="" width={28} height={28} />{t("receiptReview")}</p>
      <button type="button" className="receipt-modal-confirm" onClick={onConfirm}><span aria-hidden="true">{"\u2713"}</span>{t("receiptConfirm")}</button>
    </section>
  </div>;
}

type LegacyTranslate = ReturnType<typeof useI18n>["t"];

function issueNotice(issues: CheckoutIssue[], t: LegacyTranslate): string {
  if (issues.some((issue) => issue.code === "ZONE_REQUIRED" || issue.code === "INVALID_ZONE")) {
    return t("paymentZoneRequired");
  }
  if (issues.some((issue) => issue.code === "PRICE_CHANGED")) {
    return t("paymentPriceUpdated");
  }
  if (issues.some((issue) => issue.code === "OUT_OF_STOCK" || issue.code === "INACTIVE")) {
    return t("cartOutOfStock");
  }
  if (issues.some((issue) => issue.code === "MISSING_ITEM")) {
    return t("cartMissingItem");
  }
  return t("paymentValidationFailed");
}

export default function PaymentPage() {
  const { locale, t, href } = useI18n();
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const coupon = useCartStore((state) => state.coupon);
  const fulfillmentMethod = useCartStore((state) => state.fulfillmentMethod);
  const clearCart = useCartStore((state) => state.clear);
  const applyValidation = useCartStore((state) => state.applyValidation);
  const addExistingOrder = useOrdersStore((state) => state.addExistingOrder);
  const quote = readDeliveryQuote();
  const initialTotals = getFulfillmentTotals(
    items,
    coupon,
    fulfillmentMethod,
    fulfillmentMethod === "delivery" ? quote?.fee ?? null : 0,
  );
  const [validation, setValidation] = useState<CheckoutValidation | null>(null);
  const [method, setMethod] = useState<PaymentMethod>("instapay");
  const [pendingFile, setPendingFile] = useState<PaymentFile | null>(null);
  const [receipt, setReceipt] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const [notice, setNotice] = useState("");
  const [priceNotice, setPriceNotice] = useState("");
  const [isValidating, setIsValidating] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const didInitialValidation = useRef(false);

  const totals = validation?.totals ?? { ...initialTotals, tax: 0 };

  const buildInput = useCallback((currentItems: CartItem[], requireDeliveryQuote: boolean): CheckoutValidationInput => {
    const currentQuote = readDeliveryQuote();
    const currentBranch = readSelectedBranch();
    return {
      items: currentItems.map((item) => ({
        lineId: getCartLineId(item),
        dishId: item.dishId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        sizeId: item.sizeId,
        addonIds: item.addonIds,
        note: item.note,
      })),
      coupon: useCartStore.getState().coupon,
      fulfillmentMethod: useCartStore.getState().fulfillmentMethod,
      branchId: currentQuote?.branchId ?? currentBranch?.id,
      zoneId: currentQuote?.zoneId,
      requireDeliveryQuote,
    };
  }, []);

  const runValidation = useCallback(async (): Promise<CheckoutValidation | null> => {
    setIsValidating(true);
    setNotice("");
    try {
      const currentItems = useCartStore.getState().items;
      const first = await validateCheckout(buildInput(currentItems, true));
      applyValidation(first.lines);
      const priceOnly = first.issues.length > 0 && first.issues.every((issue) => issue.code === "PRICE_CHANGED");
      if (priceOnly) {
        setPriceNotice(t("paymentPriceUpdated"));
        const refreshed = await validateCheckout(buildInput(useCartStore.getState().items, true));
        applyValidation(refreshed.lines);
        setValidation(refreshed);
        return refreshed;
      }
      setValidation(first);
      return first;
    } catch {
      setNotice(t("paymentValidationFailed"));
      return null;
    } finally {
      setIsValidating(false);
    }
  }, [applyValidation, buildInput, t]);

  useEffect(() => {
    if (didInitialValidation.current) return;
    didInitialValidation.current = true;
    void runValidation();
  }, [runValidation]);

  useEffect(() => () => { if (pendingFile) URL.revokeObjectURL(pendingFile.previewUrl); }, [pendingFile]);

  function changeMethod(next: PaymentMethod) { setMethod(next); setNotice(""); setFileError(""); }

  function chooseFile(file?: File) {
    if (!file) return;
    if (!/^image\/(jpeg|png)$/.test(file.type)) { setFileError(t("invalidReceiptType")); return; }
    if (file.size > 5 * 1024 * 1024) { setFileError(t("receiptTooLarge")); return; }
    setFileError(""); setNotice(""); setPendingFile({ file, previewUrl: URL.createObjectURL(file) });
  }
  function handleFileChange(event: ChangeEvent<HTMLInputElement>) { chooseFile(event.target.files?.[0]); event.target.value = ""; }
  function handleDrop(event: DragEvent<HTMLButtonElement>) { event.preventDefault(); chooseFile(event.dataTransfer.files[0]); }

  async function submitOrder(paymentMethod: PaymentMethod, receiptOverride?: File) {
    if (isSubmitting) return;
    const effectiveReceipt = receiptOverride ?? receipt;
    if ((paymentMethod === "instapay" || paymentMethod === "wallet") && !effectiveReceipt) {
      setNotice(t("uploadReceiptFirst"));
      return;
    }
    setIsSubmitting(true);
    setNotice("");
    try {
      const currentQuote = readDeliveryQuote();
      const currentAddress = readSelectedAddress();
      if (useCartStore.getState().fulfillmentMethod === "delivery" && !currentQuote) {
        setNotice(t("paymentZoneRequired"));
        return;
      }
      const freshItems = useCartStore.getState().items;
      const fresh = await validateCheckout(buildInput(freshItems, true));
      applyValidation(fresh.lines);
      setValidation(fresh);
      if (!fresh.ok) {
        setNotice(issueNotice(fresh.issues, t));
        if (fresh.issues.some((issue) => issue.code === "PRICE_CHANGED")) {
          setPriceNotice(t("paymentPriceUpdated"));
        }
        return;
      }

      const result = await createServerOrder({
        ...buildInput(useCartStore.getState().items, true),
        paymentMethod,
        address: currentAddress?.address,
        idempotencyKey: getCheckoutIdempotencyKey(),
      });
      addExistingOrder(result.order);
      sessionStorage.setItem("nawy-payment-method", paymentMethod);
      markOrderConfirmed();
      clearCart();
      rotateCheckoutIdempotencyKey();
      setPendingFile(null);
      router.push(href("/payConfirmation"));
    } catch (err) {
      if (err instanceof CheckoutRequestError && err.issues.length > 0) {
        setNotice(issueNotice(err.issues, t));
      } else {
        setNotice(t("paymentSubmitFailed"));
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  function confirmReceipt() {
    if (!pendingFile) return;
    setReceipt(pendingFile.file);
    sessionStorage.setItem("nawy-payment-method", "instapay");
    void submitOrder("instapay", pendingFile.file);
  }
  function confirmPayment() {
    void submitOrder(method);
  }
  function proofUpload() {
    return <section className="payment-proof" aria-labelledby="payment-proof-title"><h2 id="payment-proof-title"><Image src="/icons/audit.png" alt="" width={22} height={22} />{t("paymentProof")}</h2>
      <button className={`payment-dropzone${receipt ? " has-receipt" : ""}`} type="button" onClick={() => fileInputRef.current?.click()} onDragOver={(event) => event.preventDefault()} onDrop={handleDrop} aria-describedby={fileError ? "payment-file-error" : undefined}>
        <Image src="/icons/upload.png" alt="" width={58} height={58} /><strong>{receipt ? receipt.name : t("uploadReceipt")}</strong><span>{receipt ? t("receiptAttachedChange") : t("receiptLimit")}</span>
        <input ref={fileInputRef} className="payment-file-input" type="file" accept="image/jpeg,image/png,.jpg,.jpeg,.png" onChange={handleFileChange} aria-label={t("receiptImageLabel")} />
      </button>
      {fileError && <p className="payment-file-error" id="payment-file-error" role="alert">{fileError}</p>}{receipt && <p className="payment-receipt-attached" role="status">{t("receiptAttached")}: {receipt.name}</p>}
    </section>;
  }

  return <main className="payment-page"><div className="payment-shell">
    <header className="payment-header"><Link className="payment-back" href={href("/delivery")} aria-label={t("backToBranch")}><ArrowIcon /></Link><div><h1>{t("paymentTitle")}</h1><p>{t("paymentSubtitle")}</p></div></header>
    <section className="payment-method-list" role="radiogroup" aria-label={t("paymentTitle")}>
      <PaymentOption method="cash" selected={method === "cash"} title={t("cashOnDelivery")} description={t("payCashOnArrival")} image="/icons/money.png" onSelect={changeMethod} />
      <PaymentOption method="instapay" selected={method === "instapay"} title={t("instaPay")} description={t("instaPayDescription")} image="/icons/instapay.png" onSelect={changeMethod} />
      {method === "instapay" && proofUpload()}
      <PaymentOption method="wallet" selected={method === "wallet"} title={t("wallet")} description={t("walletDescription")} image="/icons/creditcard.png" onSelect={changeMethod} />
      {method === "wallet" && proofUpload()}
    </section>
    <OrderSummary {...totals} items={items} /><footer className="payment-action-wrap">
      {isValidating ? <p className="payment-notice" role="status">{t("paymentValidating")}</p> : null}
      {priceNotice ? <p className="payment-notice is-info" role="status">{priceNotice}</p> : null}
      {notice && <p className="payment-notice is-error" role="alert">{notice}</p>}
      <button type="button" className="payment-confirm" onClick={confirmPayment} disabled={isSubmitting}>{t("paymentConfirmOrder")} <span aria-hidden="true">-</span> {formatPrice(totals.total, locale)}</button>
      {isSubmitting ? <p className="payment-notice" role="status">{t("paymentSubmitting")}</p> : null}
      </footer>
    <div className="payment-home-indicator" aria-hidden="true" /></div>
    {pendingFile && <ReceiptModal file={pendingFile} onClose={() => setPendingFile(null)} onConfirm={confirmReceipt} />}
  </main>;
}
