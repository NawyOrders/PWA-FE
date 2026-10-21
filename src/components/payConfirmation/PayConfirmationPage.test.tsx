import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import PayConfirmationPage from "./PayConfirmationPage";
import { renderWithProviders } from "../../../tests/utils/render";
import { dictionaries } from "@/lib/i18n/dictionary";

const t = dictionaries.ar;

function renderConfirmation() {
  return renderWithProviders(<PayConfirmationPage />, { route: "/ar/payConfirmation" });
}

describe("PayConfirmationPage", () => {
  it("UT-CONFIRM-01 shows the confirmation title", () => {
    renderConfirmation();

    expect(screen.getByRole("heading", { level: 1, name: t.orderReceived })).toBeInTheDocument();
  });

  it("UT-CONFIRM-02 shows the order number", () => {
    renderConfirmation();

    const order = screen.getByRole("region", { name: t.orderNumber });
    expect(order).toHaveTextContent("#NOELB-11254");
  });

  it("UT-CONFIRM-03 shows the delivery time and the total", () => {
    renderConfirmation();

    const summary = screen.getByRole("region", { name: t.orderSummaryPayment });
    expect(summary).toHaveTextContent(t.deliveryTime);
    expect(summary).toHaveTextContent("250");
  });

  it("UT-CONFIRM-04 links to the tracking page", () => {
    renderConfirmation();

    expect(screen.getByRole("link", { name: t.trackOrder })).toHaveAttribute("href", "/ar/tracking");
  });

  it("UT-CONFIRM-05 links back to the home", () => {
    renderConfirmation();

    expect(screen.getByRole("link", { name: t.backToHome })).toHaveAttribute("href", "/ar");
  });

  it("UT-CONFIRM-06 closes with a labelled link", () => {
    renderConfirmation();

    expect(
      screen.getByRole("link", { name: `${t.close} · ${t.backToHome}` }),
    ).toHaveAttribute("href", "/ar");
  });
});
