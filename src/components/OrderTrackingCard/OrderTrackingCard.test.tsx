import { screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { OrderTrackingCard } from "./OrderTrackingCard";
import { renderWithProviders } from "../../../tests/utils/render";
import { markOrderConfirmed } from "@/lib/orderStatus";
import { dictionaries } from "@/lib/i18n/dictionary";

const t = dictionaries.ar;

function renderCard(route = "/ar/menu") {
  return renderWithProviders(<OrderTrackingCard />, { route });
}

describe("OrderTrackingCard", () => {
  afterEach(() => {
    window.sessionStorage.clear();
  });

  it("UT-TRACKCARD-01 stays hidden while no order is confirmed", () => {
    renderCard();

    expect(screen.queryByRole("complementary")).not.toBeInTheDocument();
  });

  it("UT-TRACKCARD-02 appears after the order is confirmed", () => {
    markOrderConfirmed();
    renderCard();

    expect(screen.getByRole("complementary", { name: t.deliveryTimeRemaining })).toBeInTheDocument();
  });

  it("UT-TRACKCARD-03 stays hidden outside the allowed routes", () => {
    markOrderConfirmed();
    renderCard("/ar/cart");

    expect(screen.queryByRole("complementary")).not.toBeInTheDocument();
  });

  it("UT-TRACKCARD-04 links to the tracking page", () => {
    markOrderConfirmed();
    renderCard();

    expect(screen.getByRole("link", { name: t.trackOrder })).toHaveAttribute(
      "href",
      "/ar/tracking",
    );
  });

  it("UT-TRACKCARD-05 shows the remaining time", () => {
    markOrderConfirmed();
    renderCard();

    expect(screen.getByRole("complementary")).toHaveTextContent(t.deliveryTime);
  });
});
