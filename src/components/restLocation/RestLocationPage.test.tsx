import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import RestLocationPage from "./RestLocationPage";
import { renderWithProviders } from "../../../tests/utils/render";
import { routerMock } from "../../../tests/mocks/router";
import { dictionaries } from "@/lib/i18n/dictionary";

const t = dictionaries.ar;

function renderBranches() {
  return renderWithProviders(<RestLocationPage />, { route: "/ar/restLocation" });
}

describe("RestLocationPage", () => {
  it("UT-BRANCH-01 shows the title and the four branches", () => {
    renderBranches();

    expect(screen.getByRole("heading", { level: 1, name: t.chooseBranch })).toBeInTheDocument();
    expect(screen.getByRole("radiogroup", { name: t.branches })).toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(4);
  });

  it("UT-BRANCH-02 selects the nearest branch by default", () => {
    renderBranches();

    const radios = screen.getAllByRole("radio");
    expect(radios[0]).toHaveAttribute("aria-checked", "true");
  });

  it("UT-BRANCH-03 disables the closed branches", () => {
    renderBranches();

    const radios = screen.getAllByRole("radio");
    expect(radios[0]).toBeEnabled();
    expect(radios[2]).toBeDisabled();
    expect(radios[3]).toBeDisabled();
  });

  it("UT-BRANCH-04 shows the open state of every branch", () => {
    renderBranches();

    expect(screen.getAllByText(t.openNow)).toHaveLength(2);
    expect(screen.getAllByText(t.closed)).toHaveLength(2);
  });

  it("UT-BRANCH-05 changes the selected branch", async () => {
    const { user } = renderBranches();

    const radios = screen.getAllByRole("radio");
    await user.click(radios[1]);

    expect(radios[1]).toHaveAttribute("aria-checked", "true");
    expect(radios[0]).toHaveAttribute("aria-checked", "false");
  });

  it("UT-BRANCH-06 continues to the payment with the selected branch", async () => {
    const { user } = renderBranches();

    await user.click(screen.getByRole("button", { name: t.confirmBranch }));

    expect(routerMock.push).toHaveBeenCalledWith("/ar/payment");
    const stored = JSON.parse(window.sessionStorage.getItem("nawyorders-selected-branch") ?? "{}");
    expect(stored.id).toBe("nakheel-1");
  });

  it("UT-BRANCH-07 links back to the delivery step", () => {
    renderBranches();

    expect(screen.getByRole("link", { name: t.backToDelivery })).toHaveAttribute(
      "href",
      "/ar/delivery",
    );
  });
});
