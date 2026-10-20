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

const UPLOAD_MAX_EDGE = 1600;
const UPLOAD_QUALITY = 0.8;

export function isHeicFile(file: File): boolean {
  return file.type === "image/heic" || file.type === "image/heif" || /\.(heic|heif)$/i.test(file.name);
}

export async function prepareUploadImage(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, UPLOAD_MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(bitmap, 0, 0, width, height);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", UPLOAD_QUALITY),
    );
    if (!blob) return file;
    return blob;
  } finally {
    bitmap.close();
  }
}
