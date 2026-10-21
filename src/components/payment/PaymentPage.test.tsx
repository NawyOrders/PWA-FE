import { screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import PaymentPage from "./PaymentPage";
import { renderWithProviders } from "../../../tests/utils/render";
import { routerMock } from "../../../tests/mocks/router";
import { dictionaries } from "@/lib/i18n/dictionary";
import { useCartStore } from "@/store/cartStore";
import { useOrdersStore } from "@/store/ordersStore";
import { getDish } from "@/data/dishes";
import { formatPrice } from "@/lib/format";

const t = dictionaries.ar;
const dish = getDish("crack-burger");

function renderPayment(
  cart: Record<string, unknown> = {},
  options: Parameters<typeof renderWithProviders>[1] = {},
) {
  return renderWithProviders(<PaymentPage />, {
    route: "/ar/payment",
    stores: {
      cart: { items: [], coupon: null, fulfillmentMethod: "delivery", ...cart },
      orders: { orders: [] },
    },
    ...options,
  });
}

function pngFile(name = "receipt.png", type = "image/png", size = 1024) {
  const file = new File(["x".repeat(size)], name, { type });
  return file;
}

describe("PaymentPage", () => {
  it("UT-PAY-01 shows the title and the three methods", () => {
    renderPayment();

    expect(screen.getByRole("heading", { level: 1, name: t.paymentTitle })).toBeInTheDocument();
    expect(screen.getByRole("radiogroup", { name: t.paymentTitle })).toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(3);
  });

  it("UT-PAY-02 selects instapay by default and shows the upload", () => {
    renderPayment();

    const options = screen.getAllByRole("radio");
    expect(options[1]).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("heading", { name: t.paymentProof })).toBeInTheDocument();
  });

  it("UT-PAY-03 hides the upload for the cash method", async () => {
    const { user } = renderPayment();

    await user.click(screen.getAllByRole("radio")[0]);

    expect(screen.queryByRole("heading", { name: t.paymentProof })).not.toBeInTheDocument();
  });

  it("UT-PAY-04 asks for a receipt before paying with instapay", async () => {
    const { user } = renderPayment();

    await user.click(screen.getByRole("button", { name: new RegExp(t.paymentConfirmOrder) }));

    expect(await screen.findByRole("alert")).toHaveTextContent(t.uploadReceiptFirst);
    expect(routerMock.push).not.toHaveBeenCalled();
  });

  it("UT-PAY-05 saves the order and clears the cart for the cash method", async () => {
    const { user } = renderPayment({ items: [{ dishId: "crack-burger", quantity: 1 }] });

    await user.click(screen.getAllByRole("radio")[0]);
    await user.click(screen.getByRole("button", { name: new RegExp(t.paymentConfirmOrder) }));

    expect(routerMock.push).toHaveBeenCalledWith("/ar/payConfirmation");
    expect(useOrdersStore.getState().orders).toHaveLength(1);
    expect(useCartStore.getState().items).toHaveLength(0);
    expect(window.sessionStorage.getItem("nawy-payment-method")).toBe("cash");
  });

  it("UT-PAY-06 refuses a file that is not an image", async () => {
    const { user } = renderPayment({}, { userOptions: { applyAccept: false } });
    const input = screen.getByLabelText(t.receiptImageLabel);

    await user.upload(input, new File(["x"], "note.pdf", { type: "application/pdf" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(t.invalidReceiptType);
  });

  it("UT-PAY-07 refuses a file bigger than five megabytes", async () => {
    const { user } = renderPayment();
    const input = screen.getByLabelText(t.receiptImageLabel);

    await user.upload(input, pngFile("big.png", "image/png", 6 * 1024 * 1024));

    expect(await screen.findByRole("alert")).toHaveTextContent(t.receiptTooLarge);
  });

  it("UT-PAY-08 opens the receipt review for a valid image", async () => {
    const { user } = renderPayment();

    await user.upload(screen.getByLabelText(t.receiptImageLabel), pngFile());

    const dialog = await screen.findByRole("dialog");
    expect(dialog).toHaveTextContent("receipt.png");
  });

  it("UT-PAY-09 attaches the receipt and confirms the order", async () => {
    const { user } = renderPayment({ items: [{ dishId: "crack-burger", quantity: 1 }] });

    await user.upload(screen.getByLabelText(t.receiptImageLabel), pngFile());
    await user.click(await screen.findByRole("button", { name: t.receiptConfirm }));

    await waitFor(() => expect(routerMock.push).toHaveBeenCalledWith("/ar/payConfirmation"));
    expect(window.sessionStorage.getItem("nawy-payment-method")).toBe("instapay");
    expect(useOrdersStore.getState().orders).toHaveLength(1);
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it("UT-PAY-10 closes the receipt review without attaching it", async () => {
    const { user } = renderPayment();

    await user.upload(screen.getByLabelText(t.receiptImageLabel), pngFile());
    await user.click(await screen.findByRole("button", { name: t.close }));

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("UT-PAY-11 shows the totals of the order", () => {
    renderPayment({ items: [{ dishId: "crack-burger", quantity: 2 }] });

    const summary = screen.getByRole("region", { name: t.orderSummaryPayment });
    expect(summary).toHaveTextContent(formatPrice((dish?.price ?? 0) * 2, "ar"));
  });

  it("UT-PAY-12 links back to the delivery step", () => {
    renderPayment();

    expect(screen.getByRole("link", { name: t.backToBranch })).toHaveAttribute("href", "/ar/delivery");
  });
});
