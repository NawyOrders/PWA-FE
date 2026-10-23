import { act } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useCartStore } from "@/store/cartStore";
import { useLanguageStore } from "@/store/languageStore";
import { useFavoritesStore } from "@/store/favoritesStore";
import { useOrdersStore } from "@/store/ordersStore";
import { resetStores } from "../../utils/stores";
import { dishes } from "@/data/dishes";

/**
 * Persistence and cross-tab behaviour (TESTING.md section 8.8).
 *
 * Every store uses `persist(..., { skipHydration: true })`, so the tests drive
 * `persist.rehydrate()` explicitly instead of relying on module load order.
 */
describe("persistence: round trip", () => {
  it("UT-PERSIST-01 keeps the cart equal after save and rehydrate", async () => {
    resetStores();
    act(() => {
      useCartStore.getState().add(dishes[0].id, 2, dishes[0].price);
    });

    const saved = JSON.parse(JSON.stringify(useCartStore.getState().items));
    const payload = window.localStorage.getItem("nawy-cart");
    expect(payload).toBeTruthy();

    act(() => useCartStore.setState({ items: [] }));
    // A second tab (or a fresh load) still holds the saved payload.
    window.localStorage.setItem("nawy-cart", payload!);
    await act(() => useCartStore.persist.rehydrate());

    expect(useCartStore.getState().items).toEqual(saved);
  });

  it("UT-PERSIST-02 keeps the language equal after save and rehydrate", async () => {
    resetStores();
    act(() => useLanguageStore.getState().setLocale("en"));

    const payload = window.localStorage.getItem("nawy-language");
    expect(payload).toBeTruthy();

    act(() => useLanguageStore.setState({ locale: "ar" }));
    window.localStorage.setItem("nawy-language", payload!);
    await act(() => useLanguageStore.persist.rehydrate());

    expect(useLanguageStore.getState().locale).toBe("en");
  });

  it("UT-PERSIST-03 keeps the favorites equal after save and rehydrate", async () => {
    resetStores();
    act(() => {
      useFavoritesStore.getState().toggle(dishes[0].id);
      useFavoritesStore.getState().toggle(dishes[1].id);
    });

    const saved = [...useFavoritesStore.getState().ids];
    const payload = window.localStorage.getItem("nawy-favorites");
    expect(payload).toBeTruthy();

    act(() => useFavoritesStore.setState({ ids: [] }));
    window.localStorage.setItem("nawy-favorites", payload!);
    await act(() => useFavoritesStore.persist.rehydrate());

    expect(useFavoritesStore.getState().ids).toEqual(saved);
  });

  it("UT-PERSIST-04 merges the persisted orders with the seed only once", async () => {
    resetStores();
    const initial = useOrdersStore.getState().orders.length;

    await act(() => useOrdersStore.persist.rehydrate());

    expect(useOrdersStore.getState().orders.length).toBe(initial);
  });
});

describe("persistence: missing and older payloads", () => {
  it("UT-PERSIST-05 falls back to the default language when the key is absent", async () => {
    resetStores();
    window.localStorage.removeItem("nawy-language");

    await act(() => useLanguageStore.persist.rehydrate());

    expect(useLanguageStore.getState().locale).toBe("ar");
  });

  it("UT-PERSIST-06 accepts an unversioned payload", async () => {
    resetStores();
    window.localStorage.setItem(
      "nawy-favorites",
      JSON.stringify({ state: { ids: [dishes[0].id] } }),
    );

    await act(() => useFavoritesStore.persist.rehydrate());

    expect(useFavoritesStore.getState().ids).toEqual([dishes[0].id]);
  });

  it("UT-PERSIST-07 discards a payload whose version is not the store version", async () => {
    resetStores();
    window.localStorage.setItem(
      "nawy-favorites",
      JSON.stringify({ state: { ids: [dishes[0].id], unknown: "ignored" }, version: 999 }),
    );

    await act(() => useFavoritesStore.persist.rehydrate());

    // FINDING: no store declares a `version`, so an unknown version marker
    // makes zustand persist drop the stored value instead of merging it.
    expect(useFavoritesStore.getState().ids).toEqual([]);
    expect(useFavoritesStore.getState()).not.toHaveProperty("unknown");
  });
});

describe("persistence: storage failures", () => {
  it("UT-PERSIST-08 surfaces a storage quota error to the caller", () => {
    resetStores();
    const setItem = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("QuotaExceededError");
    });

    // FINDING: the persist middleware does not catch a failing `setItem`, so a
    // full storage throws out of the store action. The in-memory state still
    // updates, so the session stays usable until the next reload.
    let thrown: unknown = null;
    try {
      useCartStore.getState().add(dishes[0].id, 1, dishes[0].price);
    } catch (error) {
      thrown = error;
    }

    setItem.mockRestore();
    expect(thrown).toBeInstanceOf(DOMException);
    expect(useCartStore.getState().items).toHaveLength(1);
  });

  it("UT-PERSIST-09 survives a failing rehydrate and keeps a usable state", async () => {
    resetStores();
    window.localStorage.setItem("nawy-orders", "%%%% not json %%%%");

    await act(() => useOrdersStore.persist.rehydrate());

    expect(Array.isArray(useOrdersStore.getState().orders)).toBe(true);
  });
});

describe("persistence: cross-tab synchronisation", () => {
  /**
   * The app reads the same `localStorage` keys. A second tab writes directly to
   * storage and dispatches a `storage` event, which is what the browser does.
   */
  function writeFromAnotherTab(key: string, value: unknown): void {
    const raw = JSON.stringify(value);
    window.localStorage.setItem(key, raw);
    window.dispatchEvent(
      new StorageEvent("storage", { key, newValue: raw, storageArea: window.localStorage }),
    );
  }

  it("UT-PERSIST-10 never duplicates items when the cart changes in another tab", async () => {
    resetStores();
    act(() => useCartStore.getState().add(dishes[0].id, 1, dishes[0].price));

    writeFromAnotherTab("nawy-cart", {
      state: {
        items: [{ dishId: dishes[0].id, quantity: 2, unitPrice: dishes[0].price, addonIds: [], note: "" }],
        coupon: null,
        fulfillmentMethod: "delivery",
      },
      version: 0,
    });
    await act(() => useCartStore.persist.rehydrate());

    const items = useCartStore.getState().items;
    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(2);
  });

  it("UT-PERSIST-11 keeps the cart stable when an unrelated key changes", async () => {
    resetStores();
    act(() => useCartStore.getState().add(dishes[0].id, 1, dishes[0].price));
    const before = JSON.parse(JSON.stringify(useCartStore.getState().items));

    writeFromAnotherTab("nawy-language", { state: { locale: "en" }, version: 0 });
    const after = JSON.parse(JSON.stringify(useCartStore.getState().items));

    expect(after).toEqual(before);
  });

  it("UT-PERSIST-12 reads the language written by another tab", async () => {
    resetStores();

    writeFromAnotherTab("nawy-language", { state: { locale: "en" }, version: 0 });
    await act(() => useLanguageStore.persist.rehydrate());

    expect(useLanguageStore.getState().locale).toBe("en");
  });
});
