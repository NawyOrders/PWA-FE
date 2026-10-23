import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import TrackingPage from "./TrackingPage";
import { renderWithProviders } from "../../../tests/utils/render";
import { dictionaries } from "@/lib/i18n/dictionary";

const t = dictionaries.ar;

function renderTracking() {
  return renderWithProviders(<TrackingPage />, { route: "/ar/tracking" });
}

describe("TrackingPage", () => {
  it("UT-TRACK-01 shows the title and the order number", () => {
    renderTracking();

    expect(screen.getByRole("heading", { level: 1, name: t.trackingTitle })).toBeInTheDocument();
    expect(screen.getByText("#NOELB-11254")).toBeInTheDocument();
  });

  it("UT-TRACK-02 shows the four stages of the order", () => {
    renderTracking();

    const timeline = screen.getByRole("list", { name: t.trackingStages });
    expect(timeline).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(4);
  });

  it("UT-TRACK-03 marks the preparation as the current stage", () => {
    renderTracking();

    const current = screen.getByText(t.inProgress);
    expect(current).toBeInTheDocument();
    expect(current.closest("li")).toHaveAttribute("aria-current", "step");
  });

  it("UT-TRACK-04 shows the remaining delivery time", () => {
    renderTracking();

    const eta = screen.getByRole("region", { name: t.deliveryTimeRemaining });
    expect(eta).toHaveTextContent(t.deliveryTime);
  });

  it("UT-TRACK-05 shows the courier", () => {
    renderTracking();

    const courier = screen.getByRole("region", { name: t.courier });
    expect(courier).toHaveTextContent(t.courierName);
  });

  it("UT-TRACK-06 opens the contact notice", async () => {
    const { user } = renderTracking();

    await user.click(screen.getByRole("button", { name: t.callRestaurant }));

    const dialog = await screen.findByRole("dialog");
    expect(dialog).toHaveTextContent(t.contactRestaurant);
    expect(dialog).toHaveTextContent(t.phoneUnavailable);
  });

  it("UT-TRACK-07 opens the cancel notice", async () => {
    const { user } = renderTracking();

    await user.click(screen.getByRole("button", { name: new RegExp(t.cancelOrder) }));

    const dialog = await screen.findByRole("dialog");
    expect(dialog).toHaveTextContent(t.cancelUnavailable);
  });

  it("UT-TRACK-08 closes the notice", async () => {
    const { user } = renderTracking();

    await user.click(screen.getByRole("button", { name: t.callRestaurant }));
    await user.click(await screen.findByRole("button", { name: t.okay }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("UT-TRACK-09 closes the notice with the close button", async () => {
    const { user } = renderTracking();

    await user.click(screen.getByRole("button", { name: new RegExp(t.cancelOrder) }));
    await user.click(await screen.findByRole("button", { name: t.close }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("UT-TRACK-10 links back to the home", () => {
    renderTracking();

    expect(screen.getByRole("link", { name: t.backToHome })).toHaveAttribute("href", "/ar");
  });
});
