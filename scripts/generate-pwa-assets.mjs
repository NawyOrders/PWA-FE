import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = fileURLToPath(new URL("..", import.meta.url));
const iconsDir = join(root, "public", "icons");
const tokens = readFileSync(join(root, "src", "styles", "globals.css"), "utf8");

function token(name) {
  const match = tokens.match(new RegExp(`${name}\\s*:\\s*(#[0-9a-fA-F]{3,8})`));
  if (!match) throw new Error(`Missing color token ${name} in src/styles/globals.css`);
  return match[1];
}

function hexToRgb(hex) {
  const value = hex.replace("#", "");
  const full = value.length === 3 ? value.split("").map((part) => part + part).join("") : value;
  return {
    r: Number.parseInt(full.slice(0, 2), 16),
    g: Number.parseInt(full.slice(2, 4), 16),
    b: Number.parseInt(full.slice(4, 6), 16),
  };
}

const background = hexToRgb(token("--bg-splash"));
const primary = token("--primary");
const opaqueBackground = { ...background, alpha: 1 };

const candidates = [
  join(root, "public", "LOGO1.png"),
  join(root, "public", "logo.png"),
  join(iconsDir, "logo.png"),
];
const source = candidates.find((path) => existsSync(path));
if (!source) throw new Error("No logo source found: expected LOGO1.png, logo.png, or icons/logo.png");

const metadata = await sharp(source).metadata();
console.log(`[pwa-assets] source: ${source} (${metadata.width}x${metadata.height})`);

async function renderIcon(size, { maskable = false, opaque = false, padding = 0.08 } = {}) {
  const inner = Math.max(1, Math.round(size * (1 - padding * 2)));
  const logo = await sharp(source)
    .resize(inner, inner, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  const canvasBackground = opaque || maskable
    ? { ...opaqueBackground }
    : { r: 0, g: 0, b: 0, alpha: 0 };
  return sharp({
    create: { width: size, height: size, channels: 4, background: canvasBackground },
  })
    .composite([{ input: logo, gravity: "center" }])
    .png()
    .toBuffer();
}

await sharp(await renderIcon(192)).toFile(join(iconsDir, "icon-192.png"));
await sharp(await renderIcon(512)).toFile(join(iconsDir, "icon-512.png"));
await sharp(
  await renderIcon(512, { maskable: true, padding: 0.2 }),
).toFile(join(iconsDir, "icon-maskable-512.png"));
await sharp(
  await renderIcon(180, { opaque: true, padding: 0.1 }),
).toFile(join(iconsDir, "apple-touch-icon.png"));

const faviconSizes = [16, 32, 48];
const faviconImages = await Promise.all(
  faviconSizes.map(async (size) => renderIcon(size, { padding: 0.04 })),
);
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(faviconSizes.length, 4);
const entries = [];
let offset = 6 + faviconSizes.length * 16;
faviconSizes.forEach((size, index) => {
  const image = faviconImages[index];
  const entry = Buffer.alloc(16);
  entry.writeUInt8(size >= 256 ? 0 : size, 0);
  entry.writeUInt8(size >= 256 ? 0 : size, 1);
  entry.writeUInt8(0, 2);
  entry.writeUInt8(0, 3);
  entry.writeUInt16LE(1, 4);
  entry.writeUInt16LE(32, 6);
  entry.writeUInt32LE(image.length, 8);
  entry.writeUInt32LE(offset, 12);
  offset += image.length;
  entries.push(entry);
});
writeFileSync(join(iconsDir, "favicon.ico"), Buffer.concat([header, ...entries, ...faviconImages]));

function shortcutSvg(glyph) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
<rect width="96" height="96" rx="20" fill="${token("--bg-splash")}"/>
<g fill="none" stroke="${primary}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">${glyph}</g>
</svg>`;
}

const shortcuts = {
  "shortcut-menu": '<path d="M26 34h44M26 48h44M26 62h28"/>',
  "shortcut-cart": '<path d="M28 32h8l7 30h26l7-22H40"/><circle cx="46" cy="72" r="4"/><circle cx="66" cy="72" r="4"/>',
  "shortcut-orders": '<path d="M34 26h28v46l-7-5-7 5-7-5-7 5V26z"/><path d="M42 40h12M42 50h12M42 60h8"/>',
};

for (const [name, glyph] of Object.entries(shortcuts)) {
  await sharp(Buffer.from(shortcutSvg(glyph))).png().toFile(join(iconsDir, `${name}.png`));
}

console.log("[pwa-assets] wrote 192, 512, maskable, apple-touch, favicon.ico, and 3 shortcut icons");
