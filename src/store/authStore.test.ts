import { beforeEach, describe, expect, it } from "vitest";
import { useAuthStore } from "./authStore";
import { demoUser } from "@/data/user";
import { makeUser } from "../../tests/factories";
import { resetStores } from "../../tests/utils/stores";

const STORAGE_KEY = "nawy-auth";

describe("auth store", () => {
  beforeEach(() => {
    resetStores();
  });

  it("UT-AUTH-01 is a guest by default", () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isLoggedIn).toBe(false);
  });

  it("UT-AUTH-02 logs a user in", () => {
    const user = makeUser({ name: "جميل جمال" });

    useAuthStore.getState().login(user);

    expect(useAuthStore.getState().user).toEqual(user);
    expect(useAuthStore.getState().isLoggedIn).toBe(true);
  });

  it("UT-AUTH-03 keeps the user for the session when remember is false", () => {
    useAuthStore.getState().login(demoUser, false);

    expect(useAuthStore.getState().isLoggedIn).toBe(true);
    expect(useAuthStore.getState().persistent).toBe(false);
  });

  it("UT-AUTH-04 updates the display name of the logged user", () => {
    useAuthStore.getState().login(demoUser);

    useAuthStore.getState().setName("جميل جمال");

    expect(useAuthStore.getState().user?.name).toBe("جميل جمال");
  });

  it("UT-AUTH-05 keeps the guest state when the name changes without a user", () => {
    useAuthStore.getState().setName("جميل جمال");

    expect(useAuthStore.getState().user).toBeNull();
  });

  it("UT-AUTH-06 logs the user out", () => {
    useAuthStore.getState().login(demoUser);

    useAuthStore.getState().logout();

    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().isLoggedIn).toBe(false);
  });

  it("UT-AUTH-07 persists the user in local storage", () => {
    useAuthStore.getState().login(demoUser);

    const raw = window.localStorage.getItem(STORAGE_KEY);
    expect(raw).toBeTruthy();
    expect(JSON.parse(raw!).state.user.id).toBe(demoUser.id);
  });

  it("UT-AUTH-08 restores the user after a rehydration", async () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        state: { user: demoUser, isLoggedIn: true, persistent: true },
        version: 0,
      }),
    );

    await useAuthStore.persist.rehydrate();

    expect(useAuthStore.getState().user).toEqual(demoUser);
    expect(useAuthStore.getState().isLoggedIn).toBe(true);
  });

  it("UT-AUTH-09 does not persist a session user when remember is false", async () => {
    useAuthStore.getState().login(demoUser, false);

    const raw = window.localStorage.getItem(STORAGE_KEY);
    expect(raw).toBeTruthy();
    const stored = JSON.parse(raw!).state;
    expect(stored.user).toBeNull();
    expect(stored.isLoggedIn).toBe(false);
  });

  it("UT-AUTH-10 stays a guest after a corrupt storage", async () => {
    window.localStorage.setItem(STORAGE_KEY, "{not json");

    await useAuthStore.persist.rehydrate();

    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().isLoggedIn).toBe(false);
  });
});
