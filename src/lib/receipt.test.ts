import { describe, expect, it } from "vitest";
import { buildReceipt, renderReceiptHtml } from "./receipt";
import { makeOrder, makeOrderItem } from "../../tests/factories";
import { dictionaries } from "./i18n/dictionary";
import { getDish } from "@/data/dishes";
import { getBranch, getDeliveryZone } from "@/data/branches";

const dish = getDish("gourmet-burger");
const branchName = getBranch("downtown")?.name ?? { ar: "branch", en: "Branch" };
const zoneName = getDeliveryZone("zamalek")?.name ?? { ar: "zone", en: "Zone" };

function sampleOrder(overrides = {}) {
  return makeOrder({
    number: "1051",
    id: "order-1051",
    fulfillmentMethod: "delivery",
    branchName,
    zoneName,
    address: "12 Nile Street",
    deliveryFee: 3000,
    discount: 2000,
    tax: 500,
    items: [
      makeOrderItem({
        dishId: dish?.id ?? "gourmet-burger",
        quantity: 2,
        unitPrice: 14500,
        addonIds: ["cheese", "pickles"],
        note: "No onions",
      }),
    ],
    ...overrides,
  });
}

describe("buildReceipt", () => {
  it("UT-RECEIPT-01 builds authoritative totals and item details", () => {
    const receipt = buildReceipt(sampleOrder(), "ar");

    expect(receipt.widthMm).toBe(80);
    expect(receipt.direction).toBe("rtl");
    expect(receipt.subtotal).toBe(29000);
    expect(receipt.total).toBe(29000 + 3000 - 2000 + 500);
    expect(receipt.items[0]).toMatchObject({
      quantity: 2,
      unitPrice: 14500,
      lineTotal: 29000,
    });
    expect(receipt.items[0].details.join(" ")).toContain("No onions");
  });

  it("UT-RECEIPT-02 marks pickup orders and uses LTR for English", () => {
    const receipt = buildReceipt(
      sampleOrder({ fulfillmentMethod: "pickup", deliveryFee: 0 }),
      "en",
    );

    expect(receipt.direction).toBe("ltr");
    expect(receipt.fulfillment).toBe(dictionaries.en.receiptPickup);
    expect(receipt.deliveryFee).toBe(0);
  });
});

describe("renderReceiptHtml", () => {
  it("UT-RECEIPT-03 renders 80mm RTL HTML with escaped order data", () => {
    const receipt = buildReceipt(
      sampleOrder({ address: `<script>alert("x")</script>` }),
      "ar",
    );
    const html = renderReceiptHtml(receipt);

    expect(html).toContain('dir="rtl"');
    expect(html).toContain("@page { size: 80mm auto;");
    expect(html).toContain("width: 74mm;");
    expect(html).toContain("data-order-id=\"order-1051\"");
    expect(html).not.toContain("<script>alert");
    expect(html).toContain("&lt;script&gt;");
  });

  it("UT-RECEIPT-04 includes tax and kitchen notes only when present", () => {
    const withExtras = renderReceiptHtml(buildReceipt(sampleOrder(), "en"));
    expect(withExtras).toContain(dictionaries.en.receiptTax);
    expect(withExtras).toContain(dictionaries.en.receiptKitchenNotes);
    expect(withExtras).toContain("No onions");

    const plain = renderReceiptHtml(
      buildReceipt(
        sampleOrder({
          tax: 0,
          discount: 0,
          items: [makeOrderItem({ dishId: dish?.id ?? "", quantity: 1, unitPrice: 14500 })],
        }),
        "en",
      ),
    );
    expect(plain).not.toContain(dictionaries.en.receiptTax);
    expect(plain).not.toContain(dictionaries.en.receiptKitchenNotes);
  });

  it("UT-RECEIPT-05 renders the correct direction for English", () => {
    const html = renderReceiptHtml(buildReceipt(sampleOrder(), "en"));

    expect(html).toContain('lang="en" dir="ltr"');
  });
});
