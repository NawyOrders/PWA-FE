import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { StarRating } from "./StarRating";
import { renderWithProviders } from "../../tests/utils/render";

const STAR_LABELS = ["سيء جدا", "سيء", "مقبول", "جيد", "ممتاز"];

function renderStars(value = 0, locale: "ar" | "en" = "ar") {
  const onChange = vi.fn();
  const view = renderWithProviders(
    <StarRating
      id="rating"
      label="تقييمك"
      value={value}
      onChange={onChange}
      starLabels={STAR_LABELS}
      hints={["ضعيف", "سيء", "مقبول", "جيد", "ممتاز"]}
      chooseHint="اختر تقييما"
    />,
    { locale },
  );
  return { ...view, onChange };
}

describe("StarRating", () => {
  it("UT-STAR-01 renders five radios inside a labelled radiogroup", () => {
    renderStars();

    const group = screen.getByRole("radiogroup", { name: "تقييمك" });
    expect(group).toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(5);
  });

  it("UT-STAR-02 gives every star its own accessible name", () => {
    renderStars();

    expect(screen.getByRole("radio", { name: "ممتاز" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "سيء جدا" })).toBeInTheDocument();
  });

  it("UT-STAR-03 selects the rating on click", async () => {
    const { user, onChange } = renderStars();

    await user.click(screen.getByRole("radio", { name: "جيد" }));

    expect(onChange).toHaveBeenCalledWith(4);
  });

  it("UT-STAR-04 marks the selected star as checked", () => {
    renderStars(3);

    expect(screen.getByRole("radio", { name: "مقبول" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    expect(screen.getByRole("radio", { name: "جيد" })).toHaveAttribute(
      "aria-checked",
      "false",
    );
  });

  it("UT-STAR-05 increases the rating with the left arrow in Arabic", async () => {
    const { user, onChange } = renderStars(3, "ar");

    screen.getByRole("radio", { name: "مقبول" }).focus();
    await user.keyboard("{ArrowLeft}");

    expect(onChange).toHaveBeenCalledWith(4);
  });

  it("UT-STAR-06 increases the rating with the right arrow in English", async () => {
    const { user, onChange } = renderStars(3, "en");

    screen.getByRole("radio", { name: "مقبول" }).focus();
    await user.keyboard("{ArrowRight}");

    expect(onChange).toHaveBeenCalledWith(4);
  });

  it("UT-STAR-07 jumps to the first star with Home and to the last with End", async () => {
    const { user, onChange } = renderStars(3);

    screen.getByRole("radio", { name: "مقبول" }).focus();
    await user.keyboard("{Home}");
    expect(onChange).toHaveBeenLastCalledWith(1);

    await user.keyboard("{End}");
    expect(onChange).toHaveBeenLastCalledWith(5);
  });

  it("UT-STAR-08 announces the hint of the chosen rating", () => {
    renderStars(4);

    expect(screen.getByText("جيد")).toBeInTheDocument();
  });

  it("UT-STAR-09 asks to choose a rating while nothing is selected", () => {
    renderStars(0);

    expect(screen.getByText("اختر تقييما")).toBeInTheDocument();
  });
});
