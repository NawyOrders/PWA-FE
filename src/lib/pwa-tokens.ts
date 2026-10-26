import { readFileSync } from "node:fs";
import { join } from "node:path";

export interface PwaColors {
  bg: string;
  bgSplash: string;
  primary: string;
  text: string;
  textMuted: string;
  surface: string;
}

const TOKEN_FILE = join(process.cwd(), "src", "styles", "globals.css");

function readToken(css: string, name: string): string {
  const match = css.match(new RegExp(`${name}\\s*:\\s*(#[0-9a-fA-F]{3,8})`));
  if (!match) {
    throw new Error(`Missing PWA color token ${name} in src/styles/globals.css`);
  }
  return match[1];
}

let cached: PwaColors | null = null;

export function getPwaColors(): PwaColors {
  if (cached) return cached;
  const css = readFileSync(TOKEN_FILE, "utf8");
  cached = {
    bg: readToken(css, "--bg"),
    bgSplash: readToken(css, "--bg-splash"),
    primary: readToken(css, "--primary"),
    text: readToken(css, "--text"),
    textMuted: readToken(css, "--text-muted"),
    surface: readToken(css, "--surface"),
  };
  return cached;
}
