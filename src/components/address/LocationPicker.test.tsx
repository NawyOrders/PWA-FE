import { screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import LocationPicker from "./LocationPicker";
import { renderWithProviders } from "../../../tests/utils/render";
import { routerMock } from "../../../tests/mocks/router";
import { dictionaries } from "@/lib/i18n/dictionary";

const t = dictionaries.ar;
const REVERSED = "حي النخيل، شارع السلطان محمد، الإسكندرية، مصر";

function renderPicker() {
  return renderWithProviders(<LocationPicker />, { route: "/ar/address" });
}

describe("LocationPicker", () => {
  it("UT-LOC-01 shows the title and the three saved addresses", () => {
    renderPicker();

    expect(screen.getByRole("heading", { level: 1, name: t.addressTitle })).toBeInTheDocument();
    const group = screen.getByRole("radiogroup", { name: t.savedAddresses });
    expect(group).toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(3);
  });

  it("UT-LOC-02 selects the home address by default", () => {
    renderPicker();

    const radios = screen.getAllByRole("radio");
    expect(radios[0]).toHaveAttribute("aria-checked", "true");
    expect(radios[1]).toHaveAttribute("aria-checked", "false");
  });

  it("UT-LOC-03 shows the coordinates of the store", () => {
    renderPicker();

    expect(screen.getByText("31.200100")).toBeInTheDocument();
    expect(screen.getByText("29.918700")).toBeInTheDocument();
  });

  it("UT-LOC-04 resolves the address of the map position", async () => {
    renderPicker();

    expect(await screen.findByText(REVERSED, undefined, { timeout: 4000 })).toBeInTheDocument();
  });

  it("UT-LOC-05 refuses an empty search", async () => {
    const { user } = renderPicker();

    await user.click(screen.getByRole("button", { name: t.search }));

    expect(await screen.findByRole("alert")).toHaveTextContent(t.searchEmpty);
  });

  it("UT-LOC-06 shows the results of a search", async () => {
    const { user } = renderPicker();

    await user.type(screen.getByLabelText(t.searchPlace), "كرموز");
    await user.click(screen.getByRole("button", { name: t.search }));

    expect(
      await screen.findByRole("button", { name: /كرموز، شارع الورديانية/ }, { timeout: 4000 }),
    ).toBeInTheDocument();
  });

  it("UT-LOC-07 fills the address with the picked result", async () => {
    const { user } = renderPicker();

    await user.type(screen.getByLabelText(t.searchPlace), "كرموز");
    await user.click(screen.getByRole("button", { name: t.search }));
    await user.click(
      await screen.findByRole("button", { name: /كرموز، شارع الورديانية/ }, { timeout: 4000 }),
    );

    expect(screen.getByLabelText(t.searchPlace)).toHaveValue(
      "كرموز، شارع الورديانية، الإسكندرية، مصر",
    );
  });

  it("UT-LOC-08 asks to pick a point on the map for a new address", async () => {
    const { user } = renderPicker();

    await user.click(screen.getByRole("button", { name: t.addAddress }));

    expect(await screen.findByRole("alert")).toHaveTextContent(t.chooseOnMap);
  });

  it("UT-LOC-09 reports that the geolocation is not supported", async () => {
    const { user } = renderPicker();

    await user.click(screen.getByRole("button", { name: t.locateMe }));

    expect(await screen.findByRole("alert")).toHaveTextContent(t.geolocationUnsupported);
  });

  it("UT-LOC-10 enables the confirmation once the address is known", async () => {
    renderPicker();

    const confirm = screen.getByRole("button", { name: t.confirmAddress });
    expect(confirm).toBeDisabled();

    await waitFor(() => expect(confirm).toBeEnabled(), { timeout: 4000 });
  });

  it("UT-LOC-11 continues to the payment and stores the address", async () => {
    const { user } = renderPicker();

    const confirm = screen.getByRole("button", { name: t.confirmAddress });
    await waitFor(() => expect(confirm).toBeEnabled(), { timeout: 4000 });

    await user.selectOptions(screen.getByLabelText(t.deliveryArea), "zamalek");
    await waitFor(() => expect(screen.queryByText(t.deliveryFeePending)).not.toBeInTheDocument());

    await user.click(confirm);

    expect(routerMock.push).toHaveBeenCalledWith("/ar/payment");
    const stored = JSON.parse(window.sessionStorage.getItem("nawyorders-selected-address") ?? "{}");
    expect(stored.address).toBe(REVERSED);
    expect(stored.latitude).toBeCloseTo(31.2001);
    expect(stored.zoneId).toBe("zamalek");
    expect(stored.deliveryFee).toBe(3000);
  });

  it("UT-LOC-12 links back to the delivery step", () => {
    renderPicker();

    expect(screen.getByRole("link", { name: t.backToDelivery })).toHaveAttribute(
      "href",
      "/ar/delivery",
    );
  });
});
