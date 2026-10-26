import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const root = fileURLToPath(new URL("..", import.meta.url));
const require = createRequire(import.meta.url);
const tokensPath = join(root, "src", "styles", "globals.css");

function buildId() {
  try {
    return execFileSync("git", ["rev-parse", "--short", "HEAD"], {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return String(Date.now());
  }
}

function readToken(css, name) {
  const match = css.match(new RegExp(`${name}\\s*:\\s*(#[0-9a-fA-F]{3,8})`));
  if (!match) throw new Error(`Missing color token ${name} in src/styles/globals.css`);
  return match[1];
}

async function readPrecache() {
  const result = await build({
    entryPoints: [join(root, "src", "sw", "precache.ts")],
    bundle: true,
    write: false,
    platform: "node",
    format: "cjs",
    target: "node18",
    logLevel: "silent",
  });
  const code = result.outputFiles[0].text;
  const module = { exports: {} };
  new Function("module", "exports", "require", code)(module, module.exports, require);
  const urls = module.exports.precacheUrls;
  if (!Array.isArray(urls) || urls.some((url) => typeof url !== "string")) {
    throw new Error("precache.ts must export a string array named precacheUrls");
  }
  return urls;
}

const colors = readFileSync(tokensPath, "utf8");
const theme = {
  bgSplash: readToken(colors, "--bg-splash"),
  primary: readToken(colors, "--primary"),
  text: readToken(colors, "--text"),
  textMuted: readToken(colors, "--text-muted"),
  surface: readToken(colors, "--surface"),
};
const version = buildId();
const precache = await readPrecache();

for (const url of precache) {
  const file = join(root, "public", url.replace(/^\//, "").split("?")[0]);
  if (!existsSync(file)) {
    console.warn(`[build-sw] precache file missing: ${file}`);
  }
}

await build({
  entryPoints: [join(root, "src", "sw", "index.ts")],
  bundle: true,
  minify: true,
  format: "iife",
  platform: "browser",
  target: ["es2020"],
  charset: "utf8",
  legalComments: "none",
  outfile: join(root, "public", "sw.js"),
  logLevel: "silent",
  define: {
    __BUILD_ID__: JSON.stringify(version),
    __PRECACHE__: JSON.stringify(precache),
    __PWA_BG_SPLASH__: JSON.stringify(theme.bgSplash),
    __PWA_PRIMARY__: JSON.stringify(theme.primary),
    __PWA_TEXT__: JSON.stringify(theme.text),
    __PWA_TEXT_MUTED__: JSON.stringify(theme.textMuted),
    __PWA_SURFACE__: JSON.stringify(theme.surface),
  },
});

console.log(`[build-sw] wrote public/sw.js (build ${version}, ${precache.length} precache entries)`);
