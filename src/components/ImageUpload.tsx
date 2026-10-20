"use client";

import {
  useEffect,
  useRef,
  useState,
  type DragEvent,
  type ChangeEvent,
} from "react";
import { cn } from "@/lib/cn";
import { isHeicFile, prepareUploadImage } from "@/lib/image";
import { CloseIcon, CloudUploadIcon } from "@/components/icons";

const MAX_BYTES = 5 * 1024 * 1024;
const UPLOAD_MS = 700;
const MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
const EXTENSION_RE = /\.(jpe?g|png|webp|heic|heif)$/i;
const ACCEPT = "image/jpeg,image/png,image/webp,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.heic,.heif";

type Phase = "empty" | "uploading" | "ready";

interface ImageUploadProps {
  id: string;
  label: string;
  uploadTap: string;
  uploadDesktop: string;
  previewAlt: string;
  removeLabel: string;
  uploadingLabel: string;
  errorSize: string;
  errorType: string;
  disabled?: boolean;
  onChange?: (file: File | null) => void;
}

function formatSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export function ImageUpload({
  id,
  label,
  uploadTap,
  uploadDesktop,
  previewAlt,
  removeLabel,
  uploadingLabel,
  errorSize,
  errorType,
  disabled,
  onChange,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null);
  const jobRef = useRef(0);

  const [phase, setPhase] = useState<Phase>("empty");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [desktop, setDesktop] = useState(false);

  const errorId = `${id}-error`;

  useEffect(() => {
    const media = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setDesktop(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  const clearPreview = () => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = null;
    setPreview(null);
  };

  const reset = () => {
    jobRef.current += 1;
    clearPreview();
    setPhase("empty");
    setFile(null);
    setProgress(0);
    onChange?.(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const fail = (message: string) => {
    reset();
    setError(message);
  };

  const processFile = async (next: File, jobId: number) => {
    const started = Date.now();
    const timer = window.setInterval(() => {
      setProgress((current) => Math.min(0.9, current + 0.05));
    }, 50);

    let url: string | null = null;
    try {
      const blob = await prepareUploadImage(next);
      url = URL.createObjectURL(blob);
    } catch {
      url = isHeicFile(next) ? URL.createObjectURL(next) : null;
    }

    if (jobId !== jobRef.current) {
      window.clearInterval(timer);
      if (url) URL.revokeObjectURL(url);
      return;
    }

    if (!url) {
      window.clearInterval(timer);
      fail(errorType);
      return;
    }

    setPreview(url);
    previewUrlRef.current = url;

    const elapsed = Date.now() - started;
    if (elapsed < UPLOAD_MS) await sleep(UPLOAD_MS - elapsed);
    if (jobId !== jobRef.current) return;

    window.clearInterval(timer);
    setProgress(1);
    setPhase("ready");
  };

  const handleFile = (next: File | undefined) => {
    if (!next || disabled) return;
    const typeOk = MIME_TYPES.includes(next.type) || EXTENSION_RE.test(next.name);
    if (!typeOk) {
      fail(errorType);
      return;
    }
    if (next.size > MAX_BYTES) {
      fail(errorSize);
      return;
    }
    setError(null);
    setDragging(false);
    const jobId = jobRef.current + 1;
    jobRef.current = jobId;
    clearPreview();
    setFile(next);
    setProgress(0);
    setPhase("uploading");
    onChange?.(next);
    void processFile(next, jobId);
  };

  const handleInput = (event: ChangeEvent<HTMLInputElement>) => {
    handleFile(event.target.files?.[0]);
  };

  const handleDrop = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setDragging(false);
    handleFile(event.dataTransfer.files?.[0]);
  };

  const handleDragOver = (event: DragEvent<HTMLButtonElement>) => {
    if (disabled) return;
    event.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLButtonElement>) => {
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
    setDragging(false);
  };

  return (
    <div>
      <label htmlFor={id} className="mb-[12px] block text-[16px] font-extrabold leading-[1.4] text-title">
        {label}
      </label>
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={ACCEPT}
        tabIndex={-1}
        className="sr-only"
        disabled={disabled}
        onChange={handleInput}
      />

      {phase === "empty" ? (
        <button
          type="button"
          disabled={disabled}
          aria-describedby={error ? errorId : undefined}
          onClick={() => inputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "flex min-h-[150px] w-full flex-col items-center justify-center gap-[12px] rounded-[28px] border-2 border-dashed bg-tint-peach px-[16px] py-[24px] transition-colors",
            dragging
              ? "border-primary"
              : error
                ? "border-danger"
                : "border-hint-amber",
          )}
        >
          <span
            aria-hidden
            className="flex h-[50px] w-[50px] items-center justify-center rounded-[14px] bg-hint-amber text-white"
          >
            <CloudUploadIcon className="h-[26px] w-[26px]" />
          </span>
          <span className="text-center text-[15px] leading-[1.5] text-muted">
            {desktop ? uploadDesktop : uploadTap}
          </span>
        </button>
      ) : (
        <div className="flex items-center gap-[12px] rounded-[20px] border-[1.5px] border-line bg-surface p-[12px]">
          <span className="relative flex h-[72px] w-[72px] shrink-0 items-center justify-center overflow-hidden rounded-[16px] bg-tint-peach">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt={previewAlt} className="h-full w-full object-cover" />
            ) : null}
            {phase === "uploading" ? (
              <svg viewBox="0 0 44 44" aria-hidden className="absolute h-[40px] w-[40px]">
                <circle cx="22" cy="22" r="17" fill="none" stroke="var(--surface)" strokeWidth="4" />
                <circle
                  cx="22"
                  cy="22"
                  r="17"
                  fill="none"
                  stroke="var(--primary)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray="106.8"
                  strokeDashoffset={106.8 * (1 - progress)}
                  transform="rotate(-90 22 22)"
                />
              </svg>
            ) : null}
          </span>

          <span className="min-w-0 flex-1">
            <span className="block truncate text-[14px] font-bold text-title">{file?.name}</span>
            <bdi dir="ltr" className="block text-[13px] leading-[1.5] text-muted">
              {file ? formatSize(file.size) : ""}
            </bdi>
            {phase === "uploading" ? (
              <span role="status" className="block text-[13px] leading-[1.5] text-muted">
                {uploadingLabel}
              </span>
            ) : null}
          </span>

          <button
            type="button"
            aria-label={removeLabel}
            disabled={disabled}
            onClick={reset}
            className="flex h-[44px] w-[44px] shrink-0 items-center justify-center text-primary transition-transform active:scale-90"
          >
            <CloseIcon className="h-[20px] w-[20px]" />
          </button>
        </div>
      )}

      <p id={errorId} aria-live="polite" className={cn("text-[12px] font-medium text-danger", error && "mt-[8px]")}>
        {error}
      </p>
    </div>
  );
}
