import { beforeEach, describe, expect, it } from "vitest";
import { useUiStore } from "./uiStore";
import { resetStores } from "../../tests/utils/stores";

describe("ui store", () => {
  beforeEach(() => {
    resetStores();
  });

  it("UT-UI-01 starts with nothing open", () => {
    const state = useUiStore.getState();
    expect(state.drawerOpen).toBe(false);
    expect(state.loginModalOpen).toBe(false);
    expect(state.toast).toBeNull();
    expect(state.hydrated).toBe(false);
  });

  it("UT-UI-02 opens and closes the drawer", () => {
    useUiStore.getState().openDrawer();
    expect(useUiStore.getState().drawerOpen).toBe(true);

    useUiStore.getState().closeDrawer();
    expect(useUiStore.getState().drawerOpen).toBe(false);
  });

  it("UT-UI-03 opens and closes the login modal", () => {
    useUiStore.getState().openLoginModal();
    expect(useUiStore.getState().loginModalOpen).toBe(true);

    useUiStore.getState().closeLoginModal();
    expect(useUiStore.getState().loginModalOpen).toBe(false);
  });

  it("UT-UI-04 shows a toast with the default tone", () => {
    useUiStore.getState().showToast("تمت الإضافة إلى السلة");

    const toast = useUiStore.getState().toast;
    expect(toast?.message).toBe("تمت الإضافة إلى السلة");
    expect(toast?.tone).toBe("default");
  });

  it("UT-UI-05 shows a toast with a tone", () => {
    useUiStore.getState().showToast("تم الحفظ", "success");

    expect(useUiStore.getState().toast?.tone).toBe("success");
  });

  it("UT-UI-06 shows a toast with an action", () => {
    const onAction = () => {};

    useUiStore.getState().showToast("تم الحذف", "danger", { duration: 5000, action: { label: "تراجع", onAction } });

    const toast = useUiStore.getState().toast;
    expect(toast?.duration).toBe(5000);
    expect(toast?.action?.label).toBe("تراجع");
    expect(toast?.action?.onAction).toBe(onAction);
  });

  it("UT-UI-07 gives every toast a new id", () => {
    useUiStore.getState().showToast("الأولى");
    const first = useUiStore.getState().toast?.id;

    useUiStore.getState().showToast("الثانية");
    const second = useUiStore.getState().toast?.id;

    expect(second).toBeGreaterThan(first!);
  });

  it("UT-UI-08 hides the toast", () => {
    useUiStore.getState().showToast("تمت الإضافة إلى السلة");

    useUiStore.getState().hideToast();

    expect(useUiStore.getState().toast).toBeNull();
  });

  it("UT-UI-09 marks the store as hydrated", () => {
    useUiStore.getState().setHydrated();

    expect(useUiStore.getState().hydrated).toBe(true);
  });
});
