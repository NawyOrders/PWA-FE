import { beforeEach, describe, expect, it } from "vitest";
import {
  createAddress,
  formatAddressLine,
  sameAddressList,
  useAddressStore,
  type Address,
} from "./addressStore";
import { makeAddress } from "../../tests/factories";
import { resetStores } from "../../tests/utils/stores";

const STORAGE_KEY = "nawy-addresses";

describe("address store", () => {
  beforeEach(() => {
    resetStores();
  });

  it("UT-ADDR-STORE-01 starts with the seeded addresses", () => {
    const addresses = useAddressStore.getState().addresses;
    expect(addresses.length).toBe(3);
    expect(addresses[0].isDefault).toBe(true);
  });

  it("UT-ADDR-STORE-02 replaces the address list", () => {
    const addresses: Address[] = [makeAddress({ id: "addr-1" })];

    useAddressStore.getState().setAddresses(addresses);

    expect(useAddressStore.getState().addresses).toEqual(addresses);
  });

  it("UT-ADDR-STORE-03 persists the addresses in local storage", () => {
    useAddressStore.getState().setAddresses([makeAddress({ id: "addr-1" })]);

    const raw = window.localStorage.getItem(STORAGE_KEY);
    expect(raw).toBeTruthy();
    expect(JSON.parse(raw!).state.addresses).toHaveLength(1);
  });

  it("UT-ADDR-STORE-04 restores the addresses after a rehydration", async () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ state: { addresses: [makeAddress({ id: "stored" })] }, version: 0 }),
    );

    await useAddressStore.persist.rehydrate();

    expect(useAddressStore.getState().addresses).toHaveLength(1);
    expect(useAddressStore.getState().addresses[0].id).toBe("stored");
  });

  it("UT-ADDR-STORE-05 survives a corrupt storage", async () => {
    window.localStorage.setItem(STORAGE_KEY, "{not json");

    await useAddressStore.persist.rehydrate();

    expect(useAddressStore.getState().addresses).toHaveLength(3);
  });

  it("UT-ADDR-STORE-06 creates an empty home address with a unique id", () => {
    const first = createAddress();
    const second = createAddress();

    expect(first.type).toBe("home");
    expect(first.isDefault).toBe(false);
    expect(first.id).not.toBe(second.id);
  });

  it("UT-ADDR-STORE-07 joins the address parts in Arabic", () => {
    const line = formatAddressLine(
      makeAddress({
        area: "حي النخيل",
        street: "شارع السلطان محمد",
        building: "12",
        floorApartment: "3 / 8",
        landmark: "",
      }),
      "ar",
    );

    expect(line).toBe("حي النخيل، شارع السلطان محمد، 12، 3 / 8");
  });

  it("UT-ADDR-STORE-08 joins the address parts in English", () => {
    const line = formatAddressLine(
      makeAddress({
        area: "حي النخيل",
        street: "شارع السلطان محمد",
        building: "12",
        floorApartment: "3 / 8",
        landmark: "",
      }),
      "en",
    );

    expect(line).toBe("حي النخيل, شارع السلطان محمد, 12, 3 / 8");
  });

  it("UT-ADDR-STORE-09 skips the empty address parts", () => {
    const line = formatAddressLine(
      makeAddress({ area: "حي النخيل", street: "", building: "12", floorApartment: "  ", landmark: "" }),
      "ar",
    );

    expect(line).toBe("حي النخيل، 12");
  });

  it("UT-ADDR-STORE-10 compares two address lists", () => {
    const list = [makeAddress({ id: "a" })];

    expect(sameAddressList(list, [makeAddress({ id: "a" })])).toBe(true);
    expect(sameAddressList(list, [makeAddress({ id: "b" })])).toBe(false);
  });
});
