import type { Order } from "@/data/orders";
import { getDish } from "@/data/dishes";
import { dictionaries } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/types";
import { formatPrice } from "@/lib/format";

type ReceiptCopy = (typeof dictionaries)[Locale];

const addonKeys = {
  lettuce: "addonLettuce",
  tomato: "addonTomato",
  onion: "addonOnion",
  cheese: "addonCheese",
  pickles: "addonPickles",
} as const;

export interface ReceiptLine {
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  details: string[];
}

export interface Receipt {
  orderNumber: string;
  orderId: string;
  date: string;
  restaurantName: string;
  branchName: string;
  fulfillment: string;
  zoneName: string;
  address: string;
  items: ReceiptLine[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  tax: number;
  total: number;
  locale: Locale;
  direction: "rtl" | "ltr";
  widthMm: 80;
  labels: {
    title: string;
    order: string;
    branch: string;
    fulfillment: string;
    zone: string;
    address: string;
    kitchenNotes: string;
    subtotal: string;
    deliveryFee: string;
    discount: string;
    tax: string;
    total: string;
    thankYou: string;
    delivery: string;
    pickup: string;
    currency: string;
    quantity: string;
  };
}

export function buildReceipt(order: Order, locale: Locale): Receipt {
  const copy: ReceiptCopy = dictionaries[locale];
  const sizeKeys = { small: "sizeSmall", medium: "sizeMedium", large: "sizeLarge" } as const;
  const items = order.items.map((item) => {
    const dish = getDish(item.dishId);
    const name = item.name?.[locale] ?? dish?.name[locale] ?? item.dishId;
    const unitPrice = item.unitPrice ?? dish?.price ?? 0;
    const details = [
      item.sizeId ? copy[sizeKeys[item.sizeId]] : "",
      ...(item.addonIds ?? []).map((id) => copy[addonKeys[id as keyof typeof addonKeys]] ?? ""),
      item.note ? `${copy.specialNotes}: ${item.note}` : "",
    ].filter(Boolean);
    return {
      name,
      quantity: item.quantity,
      unitPrice,
      lineTotal: unitPrice * item.quantity,
      details,
    };
  });
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const tax = order.tax ?? 0;
  const total = subtotal + order.deliveryFee - (order.discount ?? 0) + tax;
  const fulfillmentMethod = order.fulfillmentMethod ?? "delivery";

  return {
    orderNumber: order.number,
    orderId: order.id,
    date: new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(order.date)),
    restaurantName: dictionaries[locale].siteName,
    branchName: order.branchName?.[locale] ?? "",
    fulfillment: fulfillmentMethod === "pickup" ? copy.receiptPickup : copy.receiptDelivery,
    zoneName: order.zoneName?.[locale] ?? "",
    address: order.address ?? "",
    items,
    subtotal,
    deliveryFee: order.deliveryFee,
    discount: order.discount ?? 0,
    tax,
    total,
    locale,
    direction: locale === "ar" ? "rtl" : "ltr",
    widthMm: 80,
    labels: {
      title: copy.receiptTitle,
      order: copy.receiptOrder,
      branch: copy.receiptBranch,
      fulfillment: copy.receiptFulfillment,
      zone: copy.receiptZone,
      address: copy.receiptAddress,
      kitchenNotes: copy.receiptKitchenNotes,
      subtotal: copy.subtotal,
      deliveryFee: copy.deliveryFee,
      discount: copy.discount,
      tax: copy.receiptTax,
      total: copy.total,
      thankYou: copy.receiptThankYou,
      delivery: copy.receiptDelivery,
      pickup: copy.receiptPickup,
      currency: copy.currency,
      quantity: copy.quantity,
    },
  };
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function renderReceiptHtml(receipt: Receipt): string {
  const labels = receipt.labels;
  const detailNote = receipt.items
    .flatMap((item) => item.details.map((detail) => `${item.name}: ${detail}`))
    .join("\n");
  const metaRows = [
    [labels.branch, receipt.branchName],
    [labels.fulfillment, receipt.fulfillment],
    receipt.zoneName ? [labels.zone, receipt.zoneName] : null,
    receipt.address ? [labels.address, receipt.address] : null,
  ].filter((row): row is string[] => Boolean(row));

  const itemRows = receipt.items
    .map(
      (item) => `<tr>
        <td class="qty">${item.quantity}</td>
        <td class="item"><strong>${escapeHtml(item.name)}</strong>${
          item.details.length > 0
            ? `<div class="details">${item.details.map(escapeHtml).join(" آ· ")}</div>`
            : ""
        }</td>
        <td class="amount">${escapeHtml(formatPrice(item.lineTotal, receipt.locale))}</td>
      </tr>`,
    )
    .join("");

  const totals = [
    `<div class="total-row"><span>${escapeHtml(labels.subtotal)}</span><strong>${escapeHtml(formatPrice(receipt.subtotal, receipt.locale))}</strong></div>`,
    `<div class="total-row"><span>${escapeHtml(labels.deliveryFee)}</span><strong>${escapeHtml(formatPrice(receipt.deliveryFee, receipt.locale))}</strong></div>`,
    receipt.discount > 0
      ? `<div class="total-row"><span>${escapeHtml(labels.discount)}</span><strong>-${escapeHtml(formatPrice(receipt.discount, receipt.locale))}</strong></div>`
      : "",
    receipt.tax > 0
      ? `<div class="total-row"><span>${escapeHtml(labels.tax)}</span><strong>${escapeHtml(formatPrice(receipt.tax, receipt.locale))}</strong></div>`
      : "",
    `<div class="total-row grand"><span>${escapeHtml(labels.total)}</span><strong>${escapeHtml(formatPrice(receipt.total, receipt.locale))}</strong></div>`,
  ].join("");

  return `<!doctype html>
<html lang="${receipt.locale}" dir="${receipt.direction}">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(labels.title)} #${escapeHtml(receipt.orderNumber)}</title>
<style>
  @page { size: 80mm auto; margin: 3mm; }
  * { box-sizing: border-box; }
  body {
    width: 74mm;
    margin: 0;
    color: black;
    background: white;
    font-family: "Noto Kufi Arabic", "Segoe UI", Tahoma, Arial, sans-serif;
    font-size: 11px;
    line-height: 1.45;
  }
  .brand { text-align: center; border-bottom: 1px dashed black; padding-bottom: 3mm; }
  .brand h1 { margin: 0; font-size: 16px; }
  .brand p { margin: 1mm 0 0; font-size: 10px; }
  .meta { display: grid; gap: 1mm; margin: 3mm 0; font-size: 10px; }
  .meta div { display: flex; justify-content: space-between; gap: 4mm; }
  .meta span { color: gray; }
  .meta strong { text-align: end; }
  table { width: 100%; border-collapse: collapse; }
  th, td { padding: 1.5mm 0; vertical-align: top; text-align: start; }
  thead th { border-bottom: 1px solid black; font-size: 10px; }
  .qty { width: 8mm; }
  .amount { width: 20mm; text-align: end; white-space: nowrap; }
  .item .details { font-size: 9px; color: gray; }
  .totals { border-top: 1px dashed black; margin-top: 2mm; padding-top: 2mm; }
  .total-row { display: flex; justify-content: space-between; gap: 4mm; padding: 0.5mm 0; }
  .total-row.grand { border-top: 1px solid black; margin-top: 1.5mm; padding-top: 2mm; font-size: 14px; }
  .notes { border: 1px solid black; padding: 2mm; margin-top: 3mm; font-size: 10px; white-space: pre-wrap; }
  .notes h2 { margin: 0 0 1mm; font-size: 10px; }
  .footer { border-top: 1px dashed black; margin-top: 3mm; padding-top: 2mm; text-align: center; font-size: 10px; }
  .footer strong { display: block; font-size: 11px; }
</style>
</head>
<body data-order-id="${escapeHtml(receipt.orderId)}">
  <header class="brand">
    <h1>${escapeHtml(receipt.restaurantName)}</h1>
    <p>${escapeHtml(labels.title)} آ· #${escapeHtml(receipt.orderNumber)}</p>
    <p>${escapeHtml(receipt.date)}</p>
  </header>
  <section class="meta">
    ${metaRows.map(([label, value]) => `<div><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`).join("")}
  </section>
  <table>
    <thead><tr><th class="qty">${escapeHtml(labels.quantity)}</th><th>${escapeHtml(labels.order)}</th><th class="amount">${escapeHtml(labels.total)}</th></tr></thead>
    <tbody>${itemRows}</tbody>
  </table>
  <section class="totals">${totals}</section>
  ${detailNote ? `<section class="notes"><h2>${escapeHtml(labels.kitchenNotes)}</h2>${escapeHtml(detailNote)}</section>` : ""}
  <footer class="footer"><strong>${escapeHtml(labels.thankYou)}</strong>${escapeHtml(receipt.restaurantName)}</footer>
</body>
</html>`;
}
