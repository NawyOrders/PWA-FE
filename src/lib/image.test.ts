import { afterEach, describe, expect, it, vi } from "vitest";
import {
  dishAspect,
  dishBlur,
  dishImage,
  isHeicFile,
  prepareUploadImage,
} from "./image";

interface BlobCall {
  type: string | undefined;
  quality: number | undefined;
  width: number;
  height: number;
}

function stubCanvas(
  blobCalls: BlobCall[],
  result: Blob | null = new Blob(["x"], { type: "image/jpeg" }),
) {
  vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation(function (
    this: HTMLCanvasElement,
    callback: BlobCallback,
    type?: string,
    quality?: number,
  ) {
    blobCalls.push({ type, quality, width: this.width, height: this.height });
    callback(result);
  });
}

function stubBitmap(width: number, height: number) {
  const close = vi.fn();
  vi.stubGlobal(
    "createImageBitmap",
    vi.fn(async () => ({ width, height, close })),
  );
  return close;
}

describe("dishImage", () => {
  it("UT-IMAGE-01 builds the large image path from the image metadata", () => {
    expect(dishImage("crack-burgers")).toBe("/images/crack-burgers-736.webp");
    expect(dishImage("beef-shawarma")).toBe("/images/beef-shawarma-626.webp");
  });

  it("UT-IMAGE-02 builds the thumbnail path", () => {
    expect(dishImage("crack-burgers", "thumb")).toBe("/images/crack-burgers-128.webp");
  });

  it("UT-IMAGE-03 builds the small image path", () => {
    expect(dishImage("crack-burgers", "small")).toBe("/images/crack-burgers-256.webp");
  });

  it("UT-IMAGE-04 falls back to the large width for an unknown slug", () => {
    expect(dishImage("unknown-slug")).toBe("/images/unknown-slug-736.webp");
  });

  it("UT-IMAGE-05 encodes the slug", () => {
    expect(dishImage("dish with space")).toBe("/images/dish%20with%20space-736.webp");
  });
});

describe("dishBlur", () => {
  it("UT-IMAGE-06 returns the blur placeholder of a known dish", () => {
    expect(dishBlur("crack-burgers")).toMatch(/^data:image\/webp;base64,/);
  });

  it("UT-IMAGE-07 returns undefined for an unknown dish", () => {
    expect(dishBlur("unknown-slug")).toBeUndefined();
  });
});

describe("dishAspect", () => {
  it("UT-IMAGE-08 returns the width to height ratio", () => {
    expect(dishAspect("crack-burgers")).toBe(1);
    expect(dishAspect("gourmet-burger")).toBeCloseTo(736 / 420, 5);
  });

  it("UT-IMAGE-09 returns undefined for an unknown dish", () => {
    expect(dishAspect("unknown-slug")).toBeUndefined();
  });
});

describe("isHeicFile", () => {
  it("UT-IMAGE-10 detects the heic mime type", () => {
    const file = new File(["x"], "photo", { type: "image/heic" });
    expect(isHeicFile(file)).toBe(true);
  });

  it("UT-IMAGE-11 detects the heif mime type", () => {
    const file = new File(["x"], "photo", { type: "image/heif" });
    expect(isHeicFile(file)).toBe(true);
  });

  it("UT-IMAGE-12 detects the heic extension whatever the case", () => {
    expect(isHeicFile(new File(["x"], "PHOTO.HEIC", { type: "" }))).toBe(true);
    expect(isHeicFile(new File(["x"], "photo.heif", { type: "" }))).toBe(true);
  });

  it("UT-IMAGE-13 rejects other image types", () => {
    expect(isHeicFile(new File(["x"], "photo.png", { type: "image/png" }))).toBe(false);
    expect(isHeicFile(new File(["x"], "photo.jpg", { type: "image/jpeg" }))).toBe(false);
  });
});

describe("prepareUploadImage", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("UT-IMAGE-14 caps the long edge at 1600 pixels", async () => {
    const calls: BlobCall[] = [];
    stubCanvas(calls);
    stubBitmap(3200, 2400);

    await prepareUploadImage(new File(["x"], "big.png", { type: "image/png" }));

    expect(calls).toHaveLength(1);
    expect(calls[0].width).toBe(1600);
    expect(calls[0].height).toBe(1200);
  });

  it("UT-IMAGE-15 does not upscale a smaller image", async () => {
    const calls: BlobCall[] = [];
    stubCanvas(calls);
    stubBitmap(800, 600);

    await prepareUploadImage(new File(["x"], "small.png", { type: "image/png" }));

    expect(calls[0].width).toBe(800);
    expect(calls[0].height).toBe(600);
  });

  it("UT-IMAGE-16 encodes the output as a JPEG with the configured quality", async () => {
    const calls: BlobCall[] = [];
    stubCanvas(calls);
    stubBitmap(400, 400);

    const result = await prepareUploadImage(
      new File(["x"], "photo.png", { type: "image/png" }),
    );

    expect(calls[0].type).toBe("image/jpeg");
    expect(calls[0].quality).toBe(0.8);
    expect(result.type).toBe("image/jpeg");
  });

  it("UT-IMAGE-17 releases the bitmap", async () => {
    const calls: BlobCall[] = [];
    stubCanvas(calls);
    const close = stubBitmap(400, 400);

    await prepareUploadImage(new File(["x"], "photo.png", { type: "image/png" }));

    expect(close).toHaveBeenCalledTimes(1);
  });

  it("UT-IMAGE-18 returns the original file when the canvas cannot produce a blob", async () => {
    const calls: BlobCall[] = [];
    stubCanvas(calls, null);
    stubBitmap(400, 400);

    const file = new File(["x"], "photo.png", { type: "image/png" });
    const result = await prepareUploadImage(file);

    expect(result).toBe(file);
  });

  it("UT-IMAGE-19 returns the original file when the 2d context is unavailable", async () => {
    const calls: BlobCall[] = [];
    stubCanvas(calls);
    stubBitmap(400, 400);
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);

    const file = new File(["x"], "photo.png", { type: "image/png" });
    const result = await prepareUploadImage(file);

    expect(result).toBe(file);
    expect(calls).toHaveLength(0);
  });
});
