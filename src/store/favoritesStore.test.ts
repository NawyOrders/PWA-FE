import { beforeEach, describe, expect, it } from "vitest";
import { useFavoritesStore } from "./favoritesStore";
import { resetStores } from "../../tests/utils/stores";

const STORAGE_KEY = "nawy-favorites";

describe("favorites store", () => {
  beforeEach(() => {
    resetStores();
  });

  it("UT-FAV-01 starts with no favorite", () => {
    expect(useFavoritesStore.getState().ids).toEqual([]);
  });

  it("UT-FAV-02 adds a favorite", () => {
    useFavoritesStore.getState().toggle("crack-burger");

    expect(useFavoritesStore.getState().ids).toEqual(["crack-burger"]);
  });

  it("UT-FAV-03 removes a favorite on the second toggle", () => {
    useFavoritesStore.getState().toggle("crack-burger");

    useFavoritesStore.getState().toggle("crack-burger");

    expect(useFavoritesStore.getState().ids).toEqual([]);
  });

  it("UT-FAV-04 never stores the same id twice", () => {
    useFavoritesStore.getState().toggle("crack-burger");
    useFavoritesStore.getState().toggle("crack-burger");
    useFavoritesStore.getState().toggle("crack-burger");

    expect(useFavoritesStore.getState().ids).toEqual(["crack-burger"]);
  });

  it("UT-FAV-05 puts the newest favorite first", () => {
    useFavoritesStore.getState().toggle("crack-burger");
    useFavoritesStore.getState().toggle("cheese-pizza");

    expect(useFavoritesStore.getState().ids).toEqual(["cheese-pizza", "crack-burger"]);
  });

  it("UT-FAV-06 removes a favorite", () => {
    useFavoritesStore.getState().toggle("crack-burger");
    useFavoritesStore.getState().toggle("cheese-pizza");

    useFavoritesStore.getState().remove("crack-burger");

    expect(useFavoritesStore.getState().ids).toEqual(["cheese-pizza"]);
  });

  it("UT-FAV-07 ignores the removal of an unknown id", () => {
    useFavoritesStore.getState().toggle("crack-burger");

    useFavoritesStore.getState().remove("unknown-dish");

    expect(useFavoritesStore.getState().ids).toEqual(["crack-burger"]);
  });

  it("UT-FAV-08 persists the favorites in local storage", () => {
    useFavoritesStore.getState().toggle("crack-burger");

    const raw = window.localStorage.getItem(STORAGE_KEY);
    expect(raw).toBeTruthy();
    expect(JSON.parse(raw!).state.ids).toEqual(["crack-burger"]);
  });

  it("UT-FAV-09 restores the favorites after a rehydration", async () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ state: { ids: ["crack-burger", "cheese-pizza"] }, version: 0 }),
    );

    await useFavoritesStore.persist.rehydrate();

    expect(useFavoritesStore.getState().ids).toEqual(["crack-burger", "cheese-pizza"]);
  });

  it("UT-FAV-10 survives a corrupt storage", async () => {
    window.localStorage.setItem(STORAGE_KEY, "{not json");

    await useFavoritesStore.persist.rehydrate();

    expect(useFavoritesStore.getState().ids).toEqual([]);
  });
});
