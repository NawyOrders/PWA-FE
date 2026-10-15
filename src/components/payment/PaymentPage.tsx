"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";

type PaymentMethod = "cash" | "instapay" | "wallet";
type PaymentFile = { file: File; previewUrl: string };

const orderItems = [
  { id: "burger-1", image: "/burger.png", name: "برجر لحم بلدي" },
  { id: "burger-2", image: "/burger.png", name: "برجر لحم بلدي" },
];

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M19 12H5m7 7-7-7 7-7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Radio({ selected }: { selected: boolean }) {
  return (
    <span
      className={`payment-radio${selected ? " is-selected" : ""}`}
      aria-hidden="true"
    >
      {selected && <span />}
    </span>
  );
}

function PaymentOption({
  method,
  selected,
  title,
  description,
  image,
  onSelect,
}: {
  method: PaymentMethod;
  selected: boolean;
  title: string;
  description: string;
  image: string;
  onSelect: (method: PaymentMethod) => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      className={`payment-option${selected ? " is-selected" : ""}`}
      onClick={() => onSelect(method)}
    >
      <Radio selected={selected} />
      <span className="payment-option-copy">
        <strong>{title}</strong>
        <small>{description}</small>
      </span>
      <span className={`payment-method-icon method-${method}`}>
        <Image src={image} alt="" width={42} height={42} />
      </span>
    </button>
  );
}

function OrderSummary() {
  return (
    <section
      className="payment-summary"
      aria-labelledby="payment-summary-title"
    >
      <h2 id="payment-summary-title">ملخص الطلب بعد اختيار طريقة الدفع</h2>
      <div className="payment-summary-lines">
        <div className="payment-summary-labels">
          <span>المجموع الفرعي</span>
          <span>رسوم التوصيل</span>
          <span>الخصم</span>
        </div>
        <div className="payment-summary-values">
          <strong>240 جـ</strong>
          <strong>30 جـ</strong>
          <strong className="payment-discount">20 جـ</strong>
        </div>
      </div>
      <div className="payment-summary-divider" />
      <div className="payment-summary-bottom">
        <div className="payment-summary-items" aria-label="عنصران في الطلب">
          {orderItems.map((item) => (
            <span className="payment-summary-thumb" key={item.id}>
              <Image src={item.image} alt={item.name} fill sizes="60px" />
            </span>
          ))}
        </div>
        <div className="payment-summary-total">
          <span>الإجمالي</span>
          <strong>250 جـ</strong>
        </div>
      </div>
    </section>
  );
}

function ReceiptModal({
  file,
  onClose,
  onConfirm,
}: {
  file: PaymentFile;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const sizeInMb = (file.file.size / (1024 * 1024)).toFixed(1);
  return (
    <div
      className="payment-modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="receipt-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="receipt-modal-title"
      >
        <button
          type="button"
          className="receipt-modal-close"
          onClick={onClose}
          aria-label="إغلاق"
        >
          <span aria-hidden="true">×</span>
        </button>
        <Image
          className="receipt-modal-art"
          src="/icons/audit.png"
          alt=""
          width={86}
          height={86}
        />
        <div className="receipt-file-row">
          <span className="receipt-preview">
            <Image
              src={file.previewUrl}
              alt="معاينة إيصال الدفع"
              fill
              unoptimized
              sizes="64px"
            />
          </span>
          <div className="receipt-file-copy">
            <h2 id="receipt-modal-title" title={file.file.name}>
              {file.file.name}
            </h2>
            <p>
              <span>{sizeInMb} ميجابايت</span>
              <span aria-hidden="true"> · </span>
              <strong>تم الاختيار</strong>
              <span className="receipt-ready-check" aria-hidden="true">
                ✓
              </span>
            </p>
          </div>
        </div>
        <div className="receipt-progress" aria-label="الإيصال جاهز للإرفاق">
          <span />
        </div>
        <p className="receipt-modal-note">
          <Image src="/icons/inforect.png" alt="" width={28} height={28} />
          سيتم مراجعة الاثبات من قبل المطعم خلال دقائق قليلة, وسيصلك اشعار فور
          تاكيد الطلب
        </p>
        <button
          type="button"
          className="receipt-modal-confirm"
          onClick={onConfirm}
        >
          <span aria-hidden="true">✓</span>تأكيد
        </button>
      </section>
    </div>
  );
}

export default function PaymentPage() {
  const router = useRouter();
  const [method, setMethod] = useState<PaymentMethod>("instapay");
  const [pendingFile, setPendingFile] = useState<PaymentFile | null>(null);
  const [receipt, setReceipt] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const [notice, setNotice] = useState("");
  const [noticeType, setNoticeType] = useState<"error" | "info">("info");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(
    () => () => {
      if (pendingFile) URL.revokeObjectURL(pendingFile.previewUrl);
    },
    [pendingFile],
  );

  function changeMethod(next: PaymentMethod) {
    setMethod(next);
    setNotice("");
    setFileError("");
  }

  function chooseFile(file?: File) {
    if (!file) return;
    if (!/^image\/(jpeg|png)$/.test(file.type)) {
      setFileError("اختر إيصالاً بصيغة JPG أو PNG.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setFileError("حجم الإيصال يجب ألا يتجاوز 5 ميجابايت.");
      return;
    }
    setFileError("");
    setNotice("");
    setPendingFile({ file, previewUrl: URL.createObjectURL(file) });
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    chooseFile(event.target.files?.[0]);
    event.target.value = "";
  }

  function handleDrop(event: DragEvent<HTMLButtonElement>) {
    event.preventDefault();
    chooseFile(event.dataTransfer.files[0]);
  }

  function confirmReceipt() {
    if (!pendingFile) return;
    setReceipt(pendingFile.file);
    sessionStorage.setItem("nawy-payment-method", "instapay");
    setPendingFile(null);
    router.push("/payConfirmation");
  }

  function confirmPayment() {
    if (method === "instapay" && !receipt) {
      setNotice("ارفع إيصال التحويل أولاً لإكمال الطلب.");
      setNoticeType("error");
      return;
    }
    if (method === "wallet" && !receipt) {
      setNotice("ارفع إيصال التحويل أولاً لإكمال الطلب.");
      setNoticeType("error");
      return;
    }
    sessionStorage.setItem("nawy-payment-method", method);
    router.push("/payConfirmation");
  }

  return (
    <main className="payment-page">
      <div className="payment-shell">
        <header className="payment-header">
          <Link
            className="payment-back"
            href="/restLocation"
            aria-label="العودة لاختيار الفرع"
          >
            <ArrowIcon />
          </Link>
          <div>
            <h1>طريقة الدفع</h1>
            <p>اختر أي طريقة تريد للدفع</p>
          </div>
        </header>

        <section
          className="payment-method-list"
          role="radiogroup"
          aria-label="طرق الدفع"
        >
          <PaymentOption
            method="cash"
            selected={method === "cash"}
            title="الدفع عند الاستلام"
            description="ادفع نقداً عند وصول الطلب"
            image="/icons/money.png"
            onSelect={changeMethod}
          />
          <PaymentOption
            method="instapay"
            selected={method === "instapay"}
            title="انستا باي"
            description="تحويل فوري عبر انستا باي"
            image="/icons/instapay.png"
            onSelect={changeMethod}
          />
          {method === "instapay" && (
            <section
              className="payment-proof"
              aria-labelledby="payment-proof-title"
            >
              <h2 id="payment-proof-title">
                <Image src="/icons/audit.png" alt="" width={22} height={22} />
                إثبات الدفع
              </h2>
              <button
                className={`payment-dropzone${receipt ? " has-receipt" : ""}`}
                type="button"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(event) => event.preventDefault()}
                onDrop={handleDrop}
                aria-describedby={fileError ? "payment-file-error" : undefined}
              >
                <Image src="/icons/upload.png" alt="" width={58} height={58} />
                <strong>{receipt ? receipt.name : "ارفع إيصال الدفع"}</strong>
                <span>
                  {receipt
                    ? "تم إرفاق الإيصال · اضغط لتغييره"
                    : "بحد أقصى 5 ميجا JPG, PNG"}
                </span>
                <input
                  ref={fileInputRef}
                  className="payment-file-input"
                  type="file"
                  accept="image/jpeg,image/png,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  aria-label="اختر صورة إيصال الدفع"
                />
              </button>
              {fileError && (
                <p
                  className="payment-file-error"
                  id="payment-file-error"
                  role="alert"
                >
                  {fileError}
                </p>
              )}
              {receipt && (
                <p className="payment-receipt-attached" role="status">
                  الإيصال المرفق: {receipt.name}
                </p>
              )}
            </section>
          )}
          <PaymentOption
            method="wallet"
            selected={method === "wallet"}
            title="محفظة إلكترونية"
            description="فودافون كاش وغيرها"
            image="/icons/creditcard.png"
            onSelect={changeMethod}
          />
          {method === "wallet" && (
            <section
              className="payment-proof"
              aria-labelledby="payment-proof-title"
            >
              <h2 id="payment-proof-title">
                <Image src="/icons/audit.png" alt="" width={22} height={22} />
                إثبات الدفع
              </h2>
              <button
                className={`payment-dropzone${receipt ? " has-receipt" : ""}`}
                type="button"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(event) => event.preventDefault()}
                onDrop={handleDrop}
                aria-describedby={fileError ? "payment-file-error" : undefined}
              >
                <Image src="/icons/upload.png" alt="" width={58} height={58} />
                <strong>{receipt ? receipt.name : "ارفع إيصال الدفع"}</strong>
                <span>
                  {receipt
                    ? "تم إرفاق الإيصال · اضغط لتغييره"
                    : "بحد أقصى 5 ميجا JPG, PNG"}
                </span>
                <input
                  ref={fileInputRef}
                  className="payment-file-input"
                  type="file"
                  accept="image/jpeg,image/png,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  aria-label="اختر صورة إيصال الدفع"
                />
              </button>
              {fileError && (
                <p
                  className="payment-file-error"
                  id="payment-file-error"
                  role="alert"
                >
                  {fileError}
                </p>
              )}
              {receipt && (
                <p className="payment-receipt-attached" role="status">
                  الإيصال المرفق: {receipt.name}
                </p>
              )}
            </section>
          )}
        </section>

        <OrderSummary />

        <footer className="payment-action-wrap">
          {notice && (
            <p
              className={`payment-notice is-${noticeType}`}
              role={noticeType === "error" ? "alert" : "status"}
            >
              {notice}
            </p>
          )}
          <button
            type="button"
            className="payment-confirm"
            onClick={confirmPayment}
          >
            تأكيد الطلب <span aria-hidden="true">-</span> 250 جـ
          </button>
        </footer>
        <div className="payment-home-indicator" aria-hidden="true" />
      </div>
      {pendingFile && (
        <ReceiptModal
          file={pendingFile}
          onClose={() => setPendingFile(null)}
          onConfirm={confirmReceipt}
        />
      )}
    </main>
  );
}
