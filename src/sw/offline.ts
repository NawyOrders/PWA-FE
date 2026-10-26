import { brand } from "../lib/brand";
import { ar } from "../lib/i18n/ar";
import { en } from "../lib/i18n/en";
import type { Dictionary } from "../lib/i18n/types";
import type { WorkerLocale } from "./strategies";

export interface OfflineTheme {
  bgSplash: string;
  primary: string;
  text: string;
  textMuted: string;
  surface: string;
}

const DICTIONARIES: Record<WorkerLocale, Dictionary> = { ar, en };

const HTML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => HTML_ESCAPES[character] ?? character);
}

export function renderOfflinePage(locale: WorkerLocale, theme: OfflineTheme): string {
  const dict = DICTIONARIES[locale];
  const title = dict.pwa.offline;
  const message = dict.pwa.offlineMessage;
  const retry = dict.pwa.retry;
  const dir = locale === "ar" ? "rtl" : "ltr";

  return `<!doctype html>
<html lang="${locale}" dir="${dir}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="${theme.bgSplash}">
<meta name="robots" content="noindex, nofollow">
<title>${escapeHtml(title)} | ${escapeHtml(brand.name[locale])}</title>
<style>
:root{color-scheme:light}
*{box-sizing:border-box}
html,body{height:100%}
body{margin:0;display:grid;place-items:center;padding:24px;background:${theme.bgSplash};color:${theme.text};font-family:"Cairo","Segoe UI",Tahoma,Arial,sans-serif}
main{width:100%;max-width:420px;text-align:center}
img{width:112px;height:112px;object-fit:contain;margin:0 auto 24px;display:block}
h1{margin:0 0 12px;font-size:1.5rem;line-height:1.4}
p{margin:0 0 24px;color:${theme.textMuted};font-size:1rem;line-height:1.7}
button{font:inherit;font-weight:700;border:0;border-radius:999px;padding:14px 28px;background:${theme.primary};color:${theme.surface};cursor:pointer;min-height:48px}
button:focus-visible{outline:3px solid ${theme.primary};outline-offset:3px}
</style>
</head>
<body>
<main>
<img src="${escapeHtml(brand.logo[locale])}" alt="${escapeHtml(brand.logo.alt[locale])}" width="112" height="112">
<h1>${escapeHtml(title)}</h1>
<p>${escapeHtml(message)}</p>
<button type="button" onclick="location.reload()">${escapeHtml(retry)}</button>
</main>
</body>
</html>`;
}
