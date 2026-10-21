import { screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import SplashPage from "./page";
import { renderWithProviders } from "../../../../tests/utils/render";
import { routerMock } from "../../../../tests/mocks/router";
import { useFakeTimers, useDateOnlyTimers } from "../../../../tests/utils/timers";
import { act } from "react";

describe("splash page", () => {
  afterEach(() => {
    useDateOnlyTimers();
  });

  it("UT-SPLASH-01 shows the tagline", () => {
    const { t } = renderWithProviders(<SplashPage />, { route: "/ar/splash" });

    expect(screen.getByText(t("splash.tagline"))).toBeInTheDocument();
  });

  it("UT-SPLASH-02 redirects to the home after the splash", async () => {
    useFakeTimers();
    renderWithProviders(<SplashPage />, { route: "/ar/splash" });

    expect(routerMock.replace).not.toHaveBeenCalled();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1600);
    });

    expect(routerMock.replace).toHaveBeenCalledWith("/ar");
  });
});
