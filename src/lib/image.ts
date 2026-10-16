import { imageMeta } from "@/data/image-meta";

export type DishImageKind = "thumb" | "small" | "large";

const FIXED_WIDTHS: Record<Exclude<DishImageKind, "large">, number> = {
  thumb: 128,
  small: 256,
};

export function dishImage(slug: string, kind: DishImageKind = "large"): string {
  const meta = imageMeta[slug];
  const width = kind === "large" ? meta?.large ?? 736 : FIXED_WIDTHS[kind];
  return encodeURI(`/images/${slug}-${width}.webp`);
}

export function dishBlur(slug: string): string | undefined {
  return imageMeta[slug]?.blur;
}

export function dishAspect(slug: string): number | undefined {
  const meta = imageMeta[slug];
  return meta ? meta.w / meta.h : undefined;
}
