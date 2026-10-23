import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ItemCustomizationDetails } from "./ItemCustomizationDetails";
import { renderWithProviders } from "../../tests/utils/render";
import { dictionaries as legacyDictionaries } from "@/lib/i18n/dictionary";

function renderDetails(props: Partial<Parameters<typeof ItemCustomizationDetails>[0]> = {}) {
  return renderWithProviders(<ItemCustomizationDetails {...props} />);
}

describe("ItemCustomizationDetails", () => {
  it("UT-DETAILS-01 renders nothing without addons and note", () => {
    const { container } = renderDetails();

    expect(container).toBeEmptyDOMElement();
  });

  it("UT-DETAILS-02 lists the selected addons", () => {
    renderDetails({ addonIds: ["lettuce", "tomato"] });

    const details = screen.getByText(/./);
    expect(details).toHaveTextContent(legacyDictionaries.ar.addonLettuce);
    expect(details).toHaveTextContent(legacyDictionaries.ar.addonTomato);
  });

  it("UT-DETAILS-03 shows the note", () => {
    renderDetails({ note: "بدون بصل" });

    expect(screen.getByText(/بدون بصل/)).toBeInTheDocument();
  });

  it("UT-DETAILS-04 ignores an unknown addon", () => {
    const { container } = renderDetails({ addonIds: ["unknown"] });

    expect(container).toBeEmptyDOMElement();
  });

  it("UT-DETAILS-05 keeps the direction of the text automatic", () => {
    renderDetails({ note: "extra cheese" });

    expect(screen.getByText(/extra cheese/)).toHaveAttribute("dir", "auto");
  });
});
