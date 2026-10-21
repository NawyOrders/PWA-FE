import { render, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StoreHydrator } from "./StoreHydrator";
import { useUiStore } from "@/store/uiStore";
import { useLanguageStore } from "@/store/languageStore";

describe("StoreHydrator", () => {
  it("UT-HYDRATE-01 renders nothing", () => {
    const { container } = render(<StoreHydrator locale="ar" />);

    expect(container).toBeEmptyDOMElement();
  });

  it("UT-HYDRATE-02 marks the app as hydrated once the stores are rehydrated", async () => {
    render(<StoreHydrator locale="ar" />);

    await waitFor(() => expect(useUiStore.getState().hydrated).toBe(true));
  });

  it("UT-HYDRATE-03 applies the locale to the language store", async () => {
    render(<StoreHydrator locale="en" />);

    await waitFor(() => expect(useLanguageStore.getState().locale).toBe("en"));
  });
});
