import { screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { renderWithProviders, LOCALES } from "../../utils/render";
import { ScreenHeader } from "@/components/ScreenHeader";
import { ListRow } from "@/components/ListRow";
import { StarRating } from "@/components/StarRating";
import { PhoneInput } from "@/components/PhoneInput";
import { OtpInput } from "@/components/OtpInput";
import { SearchPill } from "@/components/SearchPill";
import { ProductCard } from "@/components/ProductCard";
import { FeaturedCarousel } from "@/components/FeaturedCarousel";
import { PlusIcon } from "@/components/icons";
import { dishes } from "@/data/dishes";

const ARABIC_INDIC = /[\u0660-\u0669\u06F0-\u06F9]/;

describe.each(LOCALES)("RTL/LTR matrix (%s)", (locale, dir) => {
  it(`UT-RTL-01 sets dir="${dir}" and lang="${locale}" on the document`, () => {
    renderWithProviders(<ProductCard dish={dishes[0]} isFavorite={false} onAdd={() => undefined} onToggleFavorite={() => undefined} />, { locale });

    expect(document.documentElement).toHaveAttribute("dir", dir);
    expect(document.documentElement).toHaveAttribute("lang", locale);
  });

  it(`UT-RTL-02 flips the back arrow with a direction aware class in ${dir}`, () => {
    const { container } = renderWithProviders(
      <ScreenHeader title="السلة" action="back" onAction={() => undefined} actionLabel="رجوع" />,
      { locale },
    );

    const flipped = [...container.querySelectorAll("svg")].filter((svg) => {
      const className = svg.getAttribute("class") ?? "";
      return className.includes("rtl:") || className.includes("ltr:");
    });

    expect(flipped.length).toBeGreaterThan(0);
  });

  it(`UT-RTL-03 flips the row chevron with a direction aware class in ${dir}`, () => {
    const { container } = renderWithProviders(
      <ListRow icon={<PlusIcon />} title="العناوين" onClick={() => undefined} />,
      { locale },
    );

    const flipped = [...container.querySelectorAll("svg")].filter((svg) =>
      (svg.getAttribute("class") ?? "").includes("rtl:rotate-180"),
    );

    expect(flipped).toHaveLength(1);
  });

  it(`UT-RTL-04 keeps the phone field reading left to right in ${dir}`, () => {
    renderWithProviders(
      <PhoneInput
        value="0101234567"
        onChange={() => undefined}
        onSend={() => undefined}
        sendLabel="إرسال"
        ariaLabel="رقم الجوال"
      />,
      { locale },
    );

    expect(screen.getByRole("textbox", { name: "رقم الجوال" })).toHaveAttribute("dir", "ltr");
    expect(screen.getByText("+20")).toHaveAttribute("dir", "ltr");
  });

  it(`UT-RTL-05 keeps the OTP boxes reading left to right in ${dir}`, () => {
    renderWithProviders(<OtpInput value="1234" onChange={() => undefined} ariaLabel="رمز التحقق" />, {
      locale,
    });

    const group = screen.getByRole("group", { name: "رمز التحقق" });
    expect(group).toHaveAttribute("dir", "ltr");
  });

  it(`UT-RTL-06 prints the price with Latin digits in ${dir}`, () => {
    const { container } = renderWithProviders(
      <ProductCard dish={dishes[0]} isFavorite={false} onAdd={() => undefined} onToggleFavorite={() => undefined} />,
      { locale },
    );

    expect(container.textContent ?? "").not.toMatch(ARABIC_INDIC);
  });

  it(`UT-RTL-07 moves the search text to the start of the field in ${dir}`, () => {
    renderWithProviders(
      <SearchPill value="" onChange={() => undefined} onSubmit={() => undefined} placeholder="ابحث" buttonLabel="بحث" />,
      { locale },
    );

    expect(screen.getByRole("textbox")).toHaveAttribute("dir", "auto");
  });

  it(`UT-RTL-08 points the carousel arrows with a direction aware class in ${dir}`, () => {
    const { container } = renderWithProviders(
      <FeaturedCarousel dishes={dishes.slice(0, 3)} onAdd={() => undefined} />,
      { locale },
    );

    const arrows = container.querySelectorAll("button svg");
    expect(arrows.length).toBeGreaterThan(0);

    const classes = [...arrows].map((arrow) => arrow.getAttribute("class") ?? "").join(" ");
    expect(classes).toMatch(/rtl:/);
  });
});

describe.each(LOCALES)("RTL/LTR matrix keyboard (%s)", (locale, dir) => {
  const starLabels = ["1", "2", "3", "4", "5"];

  /** The stars are controlled, so the wrapper keeps the value under test. */
  function RatedStars() {
    const [value, setValue] = useState(0);
    return (
      <StarRating
        id="rating"
        label="التقييم"
        value={value}
        onChange={setValue}
        starLabels={starLabels}
      />
    );
  }

  it(`UT-RTL-09 moves the stars towards the end in ${dir}`, async () => {
    const { user } = renderWithProviders(<RatedStars />, { locale });

    const stars = screen.getAllByRole("radio");
    await user.click(stars[0]);
    await user.keyboard(dir === "rtl" ? "{ArrowLeft}" : "{ArrowRight}");

    expect(stars[1]).toHaveAttribute("aria-checked", "true");
  });

  it(`UT-RTL-10 moves the stars towards the start in ${dir}`, async () => {
    const { user } = renderWithProviders(<RatedStars />, { locale });

    const stars = screen.getAllByRole("radio");
    await user.click(stars[4]);
    await user.keyboard(dir === "rtl" ? "{ArrowRight}" : "{ArrowLeft}");

    expect(stars[3]).toHaveAttribute("aria-checked", "true");
  });
});
