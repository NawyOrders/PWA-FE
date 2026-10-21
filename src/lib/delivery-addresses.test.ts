import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  confirmDeliveryAddress,
  exampleAddresses,
  getAddressSnapshot,
  getExampleAddressSnapshot,
  getSavedAddresses,
  saveDeliveryAddress,
  subscribeToAddressChanges,
  type DeliveryAddress,
} from "./delivery-addresses";

const ADDRESS_LIST_KEY = "nawyorders-delivery-addresses";
const ACTIVE_ADDRESS_KEY = "nawyorders-active-delivery-address";

const newAddress: DeliveryAddress = {
  id: "new-address",
  label: "المكتب",
  address: "سموحة، شارع فوزي معاذ",
  latitude: 31.21,
  longitude: 29.95,
  kind: "work",
  isDefault: false,
};

describe("getSavedAddresses", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("UT-ADDR-01 returns the example addresses when nothing is stored", () => {
    expect(getSavedAddresses()).toEqual(exampleAddresses);
  });

  it("UT-ADDR-02 returns the stored addresses when they exist", () => {
    window.localStorage.setItem(ADDRESS_LIST_KEY, JSON.stringify([newAddress]));
    expect(getSavedAddresses()).toEqual([newAddress]);
  });

  it("UT-ADDR-03 falls back to the examples when the stored value is not JSON", () => {
    window.localStorage.setItem(ADDRESS_LIST_KEY, "{not json");
    expect(getSavedAddresses()).toEqual(exampleAddresses);
  });

  it("UT-ADDR-04 falls back to the examples when the stored value is not an array", () => {
    window.localStorage.setItem(ADDRESS_LIST_KEY, JSON.stringify({ id: "x" }));
    expect(getSavedAddresses()).toEqual(exampleAddresses);
  });

  it("UT-ADDR-05 drops the entries that do not have the expected shape", () => {
    window.localStorage.setItem(
      ADDRESS_LIST_KEY,
      JSON.stringify([newAddress, { id: "broken" }, null, 42]),
    );
    expect(getSavedAddresses()).toEqual([newAddress]);
  });
});

describe("saveDeliveryAddress", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("UT-ADDR-06 appends a new address", () => {
    const saved = saveDeliveryAddress(newAddress);
    expect(saved).toHaveLength(exampleAddresses.length + 1);
    expect(saved.at(-1)).toEqual(newAddress);
  });

  it("UT-ADDR-07 updates an existing address without duplicating it", () => {
    saveDeliveryAddress(newAddress);
    const updated = { ...newAddress, label: "العمل الجديد" };
    const saved = saveDeliveryAddress(updated);

    expect(saved.filter((item) => item.id === newAddress.id)).toHaveLength(1);
    expect(saved.find((item) => item.id === newAddress.id)?.label).toBe("العمل الجديد");
  });

  it("UT-ADDR-08 notifies the subscribers when the list changes", () => {
    const onChange = vi.fn();
    const unsubscribe = subscribeToAddressChanges(onChange);

    saveDeliveryAddress(newAddress);

    expect(onChange).toHaveBeenCalledTimes(1);
    unsubscribe();
  });

  it("UT-ADDR-09 stops notifying after the unsubscribe", () => {
    const onChange = vi.fn();
    const unsubscribe = subscribeToAddressChanges(onChange);
    unsubscribe();

    saveDeliveryAddress(newAddress);

    expect(onChange).not.toHaveBeenCalled();
  });
});

describe("confirmDeliveryAddress", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("UT-ADDR-10 marks the confirmed address as the default one", () => {
    const saved = confirmDeliveryAddress(newAddress);
    expect(saved.find((item) => item.id === newAddress.id)?.isDefault).toBe(true);
    expect(saved.filter((item) => item.isDefault)).toHaveLength(1);
  });

  it("UT-ADDR-11 keeps the default address in the list", () => {
    const saved = confirmDeliveryAddress(newAddress);
    expect(saved).toHaveLength(exampleAddresses.length + 1);
  });

  it("UT-ADDR-12 stores the active address id", () => {
    confirmDeliveryAddress(newAddress);
    expect(window.localStorage.getItem(ACTIVE_ADDRESS_KEY)).toBe(newAddress.id);
  });
});

describe("address snapshots", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("UT-ADDR-13 serializes the saved addresses", () => {
    expect(getAddressSnapshot()).toBe(JSON.stringify(exampleAddresses));
  });

  it("UT-ADDR-14 exposes the example snapshot", () => {
    expect(getExampleAddressSnapshot()).toBe(JSON.stringify(exampleAddresses));
  });
});
