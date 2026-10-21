import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import manifest from "./manifest";
import AppTemplate from "./[locale]/template";

describe("app shell metadata", () => {
  it("UT-MANIFEST-01 describes the app in Arabic", () => {
    const data = manifest();

    expect(data.name).toBe("كرم الشام | Karam El Sham");
    expect(data.short_name).toBe("كرم الشام");
    expect(data.lang).toBe("ar");
    expect(data.dir).toBe("rtl");
    expect(data.start_url).toBe("/ar");
    expect(data.display).toBe("standalone");
  });

  it("UT-MANIFEST-02 ships the three PWA icons", () => {
    const data = manifest();

    expect(data.icons?.map((icon) => icon.sizes)).toEqual(["192x192", "512x512", "512x512"]);
    expect(data.icons?.some((icon) => icon.purpose === "maskable")).toBe(true);
  });

  it("UT-TEMPLATE-01 wraps the page in the transition containers", () => {
    const { container } = render(
      <AppTemplate>
        <p>content</p>
      </AppTemplate>,
    );

    expect(container.firstElementChild?.className).toBe("page-fade");
    expect(container.querySelector(".page-rise")).not.toBeNull();
  });
});
