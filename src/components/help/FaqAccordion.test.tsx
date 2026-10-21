import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FaqAccordion } from "./FaqAccordion";
import { faqItems } from "@/data/faq";
import { renderWithProviders } from "../../../tests/utils/render";

function renderAccordion(openId: string | null = null, tokens: string[] = []) {
  const onToggle = vi.fn();
  const view = renderWithProviders(
    <FaqAccordion items={faqItems} openId={openId} onToggle={onToggle} tokens={tokens} />,
  );
  return { ...view, onToggle };
}

describe("FaqAccordion", () => {
  it("UT-FAQ-01 renders the questions in a list", () => {
    renderAccordion();

    expect(screen.getByRole("list")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(faqItems.length);
  });

  it("UT-FAQ-02 marks the open question as expanded", () => {
    renderAccordion("delivery-time");

    const header = screen.getByRole("button", { name: /كم يستغرق/ });
    expect(header).toHaveAttribute("aria-expanded", "true");
  });

  it("UT-FAQ-03 keeps the closed questions collapsed", () => {
    renderAccordion("delivery-time");

    const header = screen.getByRole("button", { name: /ما هي طرق/ });
    expect(header).toHaveAttribute("aria-expanded", "false");
  });

  it("UT-FAQ-04 links the question to its answer", () => {
    renderAccordion("delivery-time");

    const header = screen.getByRole("button", { name: /كم يستغرق/ });
    const answer = document.getElementById(header.getAttribute("aria-controls")!);
    expect(answer).toHaveAttribute("role", "region");
    expect(answer).toHaveAttribute("aria-labelledby", header.id);
  });

  it("UT-FAQ-05 makes the closed answer inert", () => {
    renderAccordion("delivery-time");

    const closed = document.getElementById("faq-answer-payment-methods");
    expect(closed).toHaveAttribute("inert");
  });

  it("UT-FAQ-06 asks to toggle the clicked question", async () => {
    const { user, onToggle } = renderAccordion();

    await user.click(screen.getByRole("button", { name: /كم يستغرق/ }));

    expect(onToggle).toHaveBeenCalledWith("delivery-time");
  });

  it("UT-FAQ-07 marks the matched words with the mark element", () => {
    renderAccordion("delivery-time", ["التوصيل"]);

    const marks = document.querySelectorAll("mark");
    expect(marks.length).toBeGreaterThan(0);
    for (const mark of marks) {
      expect(mark.textContent).not.toContain("<");
    }
  });
});
