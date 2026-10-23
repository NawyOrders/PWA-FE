import { screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ImageUpload } from "./ImageUpload";
import { renderWithProviders } from "../../tests/utils/render";

function makeFile(name: string, type: string, size: number) {
  const file = new File(["x"], name, { type });
  Object.defineProperty(file, "size", { value: size });
  return file;
}

function renderUpload(onChange?: (file: File | null) => void, applyAccept = true) {
  const view = renderWithProviders(
    <ImageUpload
      id="photo"
      label="صورة (اختياري)"
      uploadTap="اضغط لرفع صورة"
      uploadDesktop="اسحب صورة هنا"
      previewAlt="معاينة الصورة"
      removeLabel="حذف الصورة"
      uploadingLabel="جارٍ الرفع"
      errorSize="الحجم كبير"
      errorType="نوع غير مدعوم"
      onChange={onChange}
    />,
    // `user-event` filters files that do not match the `accept` attribute, so
    // the guard of the component itself is only reachable with the filter off.
    { userOptions: { applyAccept } },
  );
  const input = view.container.querySelector('input[type="file"]') as HTMLInputElement;
  return { ...view, input };
}

describe("ImageUpload", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "createImageBitmap",
      vi.fn(async () => ({ width: 100, height: 100, close: vi.fn() })),
    );
    vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation(function (
      this: HTMLCanvasElement,
      callback: BlobCallback,
    ) {
      callback(new Blob(["x"], { type: "image/jpeg" }));
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("UT-IMGUP-01 accepts only the allowed image types", () => {
    const { input } = renderUpload();

    expect(input).toHaveAttribute("accept", expect.stringContaining("image/jpeg"));
    expect(input.accept).not.toContain("image/gif");
  });

  it("UT-IMGUP-02 rejects a file with the wrong type", async () => {
    const { user, input } = renderUpload(undefined, false);

    await user.upload(input, makeFile("doc.pdf", "application/pdf", 1000));

    expect(await screen.findByText("نوع غير مدعوم")).toBeInTheDocument();
  });

  it("UT-IMGUP-03 rejects a file over five megabytes", async () => {
    const { user, input } = renderUpload();

    await user.upload(input, makeFile("big.png", "image/png", 6 * 1024 * 1024));

    expect(await screen.findByText("الحجم كبير")).toBeInTheDocument();
  });

  it("UT-IMGUP-04 announces the error politely", async () => {
    const { user, input } = renderUpload(undefined, false);

    await user.upload(input, makeFile("doc.pdf", "application/pdf", 1000));

    const error = await screen.findByText("نوع غير مدعوم");
    expect(error).toHaveAttribute("aria-live", "polite");
  });

  it("UT-IMGUP-05 reports the chosen file to the parent", async () => {
    const onChange = vi.fn();
    const { user, input } = renderUpload(onChange);

    const file = makeFile("photo.png", "image/png", 1000);
    await user.upload(input, file);

    expect(onChange).toHaveBeenCalledWith(file);
  });

  it("UT-IMGUP-06 shows the name and the size of the accepted file", async () => {
    const { user, input } = renderUpload();

    await user.upload(input, makeFile("photo.png", "image/png", 2048));

    expect(await screen.findByText("photo.png")).toBeInTheDocument();
    expect(screen.getByText("2 KB")).toBeInTheDocument();
  });

  it("UT-IMGUP-07 removes the file again", async () => {
    const onChange = vi.fn();
    const { user, input } = renderUpload(onChange);

    await user.upload(input, makeFile("photo.png", "image/png", 1000));
    await screen.findByText("photo.png");

    await user.click(screen.getByRole("button", { name: "حذف الصورة" }));

    expect(screen.queryByText("photo.png")).not.toBeInTheDocument();
    expect(onChange).toHaveBeenLastCalledWith(null);
  });

  it("UT-IMGUP-08 shows the upload progress", async () => {
    const { user, input } = renderUpload();

    await user.upload(input, makeFile("photo.png", "image/png", 1000));

    expect(await screen.findByText("جارٍ الرفع")).toBeInTheDocument();
  });

  it("UT-IMGUP-09 shows the preview of the accepted file", async () => {
    const { user, input } = renderUpload();

    await user.upload(input, makeFile("photo.png", "image/png", 1000));

    await waitFor(() => expect(screen.getByRole("img", { name: "معاينة الصورة" })).toBeInTheDocument());
  });
});
