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
  it("UT-BRANCH-01 shows the title and the three branches", () => {
    renderBranches();

    expect(screen.getByRole("heading", { level: 1, name: t.chooseBranch })).toBeInTheDocument();
    expect(screen.getByRole("radiogroup", { name: t.branches })).toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(3);
  });

  it("UT-BRANCH-02 selects the first branch by default", () => {
    renderBranches();

    const radios = screen.getAllByRole("radio");
    expect(radios[0]).toHaveAttribute("aria-checked", "true");
  });

  it("UT-BRANCH-03 enables every branch", () => {
    renderBranches();

    for (const radio of screen.getAllByRole("radio")) {
      expect(radio).toBeEnabled();
    }
  });

  it("UT-BRANCH-04 shows the open state of every branch", () => {
    renderBranches();

    expect(screen.getAllByText(t.openNow)).toHaveLength(3);
    expect(screen.queryAllByText(t.closed)).toHaveLength(0);
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

    await user.click(screen.getAllByRole("radio")[1]);
    await user.click(screen.getByRole("button", { name: t.confirmBranch }));

    expect(routerMock.push).toHaveBeenCalledWith("/ar/payment");
    const stored = JSON.parse(window.sessionStorage.getItem("nawyorders-selected-branch") ?? "{}");
    expect(stored.id).toBe("nakheel");
  });

  it("UT-BRANCH-07 links back to the delivery step", () => {
    renderBranches();

    expect(screen.getByRole("link", { name: t.backToDelivery })).toHaveAttribute(
      "href",
      "/ar/delivery",
    );
  });
});
