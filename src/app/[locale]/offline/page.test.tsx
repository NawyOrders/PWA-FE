import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import OfflinePage from "./page";
import { renderWithProviders } from "../../../../tests/utils/render";
import { dictionaries } from "@/lib/i18n/dictionary";

const t = dictionaries.ar;

describe("offline page", () => {
  it("UT-OFFLINE-01 shows the offline title and the message", () => {
    renderWithProviders(<OfflinePage />, { route: "/ar/offline" });

    expect(screen.getByRole("heading", { level: 1, name: t.offlineTitle })).toBeInTheDocument();
    expect(screen.getByText(t.offlineMessage)).toBeInTheDocument();
  });

  it("UT-OFFLINE-02 links back to the home", () => {
    renderWithProviders(<OfflinePage />, { route: "/ar/offline" });

    expect(screen.getByRole("link", { name: new RegExp(t.backToHome) })).toHaveAttribute(
      "href",
      "/ar",
    );
  });
});
