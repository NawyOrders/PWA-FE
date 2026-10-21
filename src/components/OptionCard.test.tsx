import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { OptionCard } from "./OptionCard";
import { renderWithProviders } from "../../tests/utils/render";

const icon = <svg aria-hidden />;

function renderCard(props: Partial<React.ComponentProps<typeof OptionCard>> = {}) {
  const onClick = vi.fn();
  const view = renderWithProviders(
    <OptionCard
      icon={icon}
      title="الأسئلة الشائعة"
      subtitle="كل ما تحتاج معرفته"
      onClick={onClick}
      {...props}
    />,
  );
  return { ...view, onClick };
}

describe("OptionCard", () => {
  it("UT-OPTION-01 shows the title and the subtitle", () => {
    renderCard();

    expect(screen.getByText("الأسئلة الشائعة")).toBeInTheDocument();
    expect(screen.getByText("كل ما تحتاج معرفته")).toBeInTheDocument();
  });

  it("UT-OPTION-02 names the card with its title and its subtitle", () => {
    renderCard();

    expect(
      screen.getByRole("button", { name: "الأسئلة الشائعة، كل ما تحتاج معرفته" }),
    ).toBeInTheDocument();
  });

  it("UT-OPTION-03 calls the click handler", async () => {
    const { user, onClick } = renderCard();

    await user.click(screen.getByRole("button", { name: /الأسئلة الشائعة/ }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("UT-OPTION-04 renders a link when it has a destination", () => {
    renderCard({ href: "/ar/profile/help/faq" });

    const link = screen.getByRole("link", { name: /الأسئلة الشائعة/ });
    expect(link).toHaveAttribute("href", "/ar/profile/help/faq");
  });

  it("UT-OPTION-05 replaces the subtitle with the live status", () => {
    renderCard({ status: { open: true, label: "متصل الآن" } });

    expect(screen.getByText("متصل الآن")).toBeInTheDocument();
    expect(screen.queryByText("كل ما تحتاج معرفته")).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("متصل الآن");
  });

  it("UT-OPTION-06 hides the decorative icon from the accessibility tree", () => {
    renderCard();

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});
