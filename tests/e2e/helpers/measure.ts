import type { Page } from "@playwright/test";

export interface PageMeasurement {
  path: string;
  width: number;
  height: number;
  locale: string;
  dir: string;
  headerHeight: number;
  containerWidth: number;
  containerLeft: number;
  containerRight: number;
  marginStart: number;
  marginEnd: number;
  horizontalOverflow: number;
  h1: string[];
  fixedBottom: number;
  imagesWithoutAlt: number;
  touchTargetsBelow44: number;
  smallTargets: string[];
}

export async function measurePage(page: Page, path: string): Promise<PageMeasurement> {
  return page.evaluate((currentPath) => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const dir = document.documentElement.dir || "ltr";
    const locale = document.documentElement.lang || "";
    const header = document.querySelector("header");
    const container = document.querySelector(".container-x");
    const containerRect = container?.getBoundingClientRect();
    const headerRect = header?.getBoundingClientRect();

    const interactive = Array.from(
      document.querySelectorAll<HTMLElement>("button, a[href], input, select, textarea"),
    ).filter((element) => {
      const style = window.getComputedStyle(element);
      return style.display !== "none" && style.visibility !== "hidden";
    });
    const small = interactive.filter((element) => {
      const rect = element.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return false;
      return rect.width < 44 || rect.height < 44;
    });
    const touchTargetsBelow44 = small.length;

    const fixedBottom = Array.from(document.querySelectorAll<HTMLElement>("body *")).filter((element) => {
      const style = window.getComputedStyle(element);
      if (style.position !== "fixed") return false;
      const rect = element.getBoundingClientRect();
      return rect.height > 0 && Math.abs(rect.bottom - height) <= 2;
    }).length;

    return {
      path: currentPath,
      width,
      height,
      locale,
      dir,
      headerHeight: Math.round(headerRect?.height ?? 0),
      containerWidth: Math.round(containerRect?.width ?? 0),
      containerLeft: Math.round(containerRect?.left ?? 0),
      containerRight: Math.round(containerRect?.right ?? 0),
      marginStart: Math.round(
        dir === "rtl" ? width - (containerRect?.right ?? 0) : (containerRect?.left ?? 0),
      ),
      marginEnd: Math.round(
        dir === "rtl" ? (containerRect?.left ?? 0) : width - (containerRect?.right ?? 0),
      ),
      horizontalOverflow: Math.max(0, document.documentElement.scrollWidth - width),
      h1: Array.from(document.querySelectorAll("h1")).map((element) => element.textContent?.trim() ?? ""),
      fixedBottom,
      imagesWithoutAlt: Array.from(document.querySelectorAll("img")).filter(
        (image) => !image.hasAttribute("alt"),
      ).length,
      touchTargetsBelow44,
      smallTargets: small.slice(0, 12).map((element) => {
        const rect = element.getBoundingClientRect();
        const name = element.getAttribute("aria-label") || element.textContent?.trim().slice(0, 30) || element.tagName;
        return `${name} (${Math.round(rect.width)}x${Math.round(rect.height)})`;
      }),
    };
  }, path);
}
