"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { useI18n } from "@/lib/i18n";
import { markOrderConfirmed } from "@/lib/orderStatus";
import { useCartStore, getFulfillmentTotals, getCartItemKey } from "@/store/cartStore";
import { getDish } from "@/data/dishes";
import { dishImage } from "@/lib/image";
import { formatPrice } from "@/lib/format";

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

function OrderSummary({ subtotal, deliveryFee, discount, total, items }: { subtotal: number; deliveryFee: number; discount: number; total: number; items: ReturnType<typeof useCartStore.getState>["items"] }) {
  const { locale, t } = useI18n();
  const summaryItems = items
    .map((item) => ({ item, dish: getDish(item.dishId) }))
    .filter((entry): entry is { item: (typeof items)[number]; dish: NonNullable<typeof entry.dish> } => Boolean(entry.dish));
  return <section className="payment-summary" aria-labelledby="payment-summary-title">
    <h2 id="payment-summary-title">{t("orderSummaryPayment")}</h2>
    <div className="payment-summary-lines"><div className="payment-summary-labels"><span>{t("subtotal")}</span><span>{t("deliveryFee")}</span><span>{t("discount")}</span></div>
      <div className="payment-summary-values"><strong>{formatPrice(subtotal, locale)}</strong><strong>{formatPrice(deliveryFee, locale)}</strong><strong className="payment-discount">{discount > 0 ? `-${formatPrice(discount, locale)}` : formatPrice(0, locale)}</strong></div></div>
    <div className="payment-summary-divider" /><div className="payment-summary-bottom">
      <div className="payment-summary-items" aria-label={t("orderItemsCount")}>{summaryItems.map(({ item, dish }) => <span className="payment-summary-thumb" key={getCartItemKey(item)}><Image src={dishImage(dish.image, "thumb")} alt={t("itemImageAlt")} fill sizes="60px" /></span>)}</div>
      <div className="payment-summary-total"><span>{t("total")}</span><strong>{formatPrice(total, locale)}</strong></div>
    </div>
  </section>;
}

function ReceiptModal({ file, onClose, onConfirm }: { file: PaymentFile; onClose: () => void; onConfirm: () => void }) {
  const { t } = useI18n();
  const sizeInMb = (file.file.size / (1024 * 1024)).toFixed(1);
  return <div className="payment-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="receipt-modal" role="dialog" aria-modal="true" aria-labelledby="receipt-modal-title">
      <button type="button" className="receipt-modal-close" onClick={onClose} aria-label={t("close")}><span aria-hidden="true">×</span></button>
      <Image className="receipt-modal-art" src="/icons/audit.png" alt="" width={86} height={86} />
      <div className="receipt-file-row"><span className="receipt-preview"><Image src={file.previewUrl} alt={t("receiptPreview")} fill unoptimized sizes="64px" /></span>
        <div className="receipt-file-copy"><h2 id="receipt-modal-title" title={file.file.name}>{file.file.name}</h2><p><span>{sizeInMb} MB</span><span aria-hidden="true"> · </span><strong>{t("receiptSelected")}</strong><span className="receipt-ready-check" aria-hidden="true">✓</span></p></div>
      </div>
      <div className="receipt-progress" aria-label={t("receiptReady")}><span /></div>
      <p className="receipt-modal-note"><Image src="/icons/inforect.png" alt="" width={28} height={28} />{t("receiptReview")}</p>
      <button type="button" className="receipt-modal-confirm" onClick={onConfirm}><span aria-hidden="true">✓</span>{t("receiptConfirm")}</button>
    </section>
  </div>;
}

export default function PaymentPage() {
  const { locale, t, href } = useI18n();
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const coupon = useCartStore((state) => state.coupon);
  const fulfillmentMethod = useCartStore((state) => state.fulfillmentMethod);
  const clearCart = useCartStore((state) => state.clear);
  const totals = getFulfillmentTotals(items, coupon, fulfillmentMethod);
  const [method, setMethod] = useState<PaymentMethod>("instapay");
  const [pendingFile, setPendingFile] = useState<PaymentFile | null>(null);
  const [receipt, setReceipt] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const [notice, setNotice] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  function confirmReceipt() {
    if (!pendingFile) return;
    setReceipt(pendingFile.file); sessionStorage.setItem("nawy-payment-method", "instapay"); markOrderConfirmed(); clearCart(); setPendingFile(null); router.push(href("/payConfirmation"));
  }
  function confirmPayment() {
    if ((method === "instapay" || method === "wallet") && !receipt) { setNotice(t("uploadReceiptFirst")); return; }
    sessionStorage.setItem("nawy-payment-method", method); markOrderConfirmed(); clearCart(); router.push(href("/payConfirmation"));
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
    <header className="payment-header"><Link className="payment-back" href={href("/restLocation")} aria-label={t("backToBranch")}><ArrowIcon /></Link><div><h1>{t("paymentTitle")}</h1><p>{t("paymentSubtitle")}</p></div></header>
    <section className="payment-method-list" role="radiogroup" aria-label={t("paymentTitle")}>
      <PaymentOption method="cash" selected={method === "cash"} title={t("cashOnDelivery")} description={t("payCashOnArrival")} image="/icons/money.png" onSelect={changeMethod} />
      <PaymentOption method="instapay" selected={method === "instapay"} title={t("instaPay")} description={t("instaPayDescription")} image="/icons/instapay.png" onSelect={changeMethod} />
      {method === "instapay" && proofUpload()}
      <PaymentOption method="wallet" selected={method === "wallet"} title={t("wallet")} description={t("walletDescription")} image="/icons/creditcard.png" onSelect={changeMethod} />
      {method === "wallet" && proofUpload()}
    </section>
    <OrderSummary {...totals} items={items} /><footer className="payment-action-wrap">{notice && <p className="payment-notice is-error" role="alert">{notice}</p>}
      <button type="button" className="payment-confirm" onClick={confirmPayment}>{t("paymentConfirmOrder")} <span aria-hidden="true">-</span> {formatPrice(totals.total, locale)}</button></footer>
    <div className="payment-home-indicator" aria-hidden="true" /></div>
    {pendingFile && <ReceiptModal file={pendingFile} onClose={() => setPendingFile(null)} onConfirm={confirmReceipt} />}
  </main>;
}
