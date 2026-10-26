import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const SRC = join(ROOT, "src");

const ALLOWLIST = new Map([
  ["src/app/[locale]/layout.tsx", ["hardcoded-color"]],
  ["src/components/address/MapView.tsx", ["hardcoded-color"]],
  ["src/components/CartSummaryBar/CartSummaryBar.tsx", ["hardcoded-color"]],
  ["src/components/OrderTrackingCard/OrderTrackingCard.tsx", ["hardcoded-color"]],
  ["src/components/item/data.ts", ["hardcoded-color"]],
]);

const RULES = [
  {
    id: "hardcoded-color",
    pattern: /#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(/g,
    replace: "a design token or a Tailwind token colour",
  },
  {
    id: "physical-direction",
    pattern: /\b(?:ml|mr|pl|pr|left|right)-[0-9a-z[]|\btext-(?:left|right)\b/g,
    replace: "a logical property (ms/me/ps/pe/start/end/text-start/text-end)",
  },
  {
    id: "viewport-hack",
    pattern: /\b100(?:vw|vh)\b|overflow-x-hidden/g,
    replace: "fluid layout primitives (Container, min/max, clamp) and real overflow fixes",
  },
];

function walk(directory) {
  const files = [];
  for (const entry of readdirSync(directory)) {
    if (entry === "node_modules" || entry === ".next") continue;
    const path = join(directory, entry);
    const stats = statSync(path);
    if (stats.isDirectory()) files.push(...walk(path));
    else if (/\.(?:ts|tsx)$/.test(entry) && !/\.test\.(?:ts|tsx)$/.test(entry)) files.push(path);
  }
  return files;
}

const findings = [];
let arbitraryValues = 0;

for (const file of walk(SRC)) {
  const relativePath = relative(ROOT, file).replaceAll("\\", "/");
  const lines = readFileSync(file, "utf8").split(/\r?\n/);
  const allowed = ALLOWLIST.get(relativePath) ?? [];

  lines.forEach((line, index) => {
    arbitraryValues += (line.match(/\[[^\]]+\]/g) ?? []).length;

    for (const rule of RULES) {
      if (allowed.includes(rule.id)) continue;
      rule.pattern.lastIndex = 0;
      const match = rule.pattern.exec(line);
      if (!match) continue;
      findings.push({
        rule: rule.id,
        file: relativePath,
        line: index + 1,
        value: match[0],
        replace: rule.replace,
      });
    }
  });
}

if (findings.length === 0) {
  console.log("check:norm  OK — no hardcoded colours, physical direction utilities or viewport hacks.");
  console.log(`check:norm  info — ${arbitraryValues} bracketed values remain; arbitrary-value enforcement is tracked in REPORT-MASTER.md.`);
  process.exit(0);
}

console.log("rule                 file:line                         value            replacement");
for (const finding of findings) {
  console.log(
    `${finding.rule.padEnd(20)} ${`${finding.file}:${finding.line}`.padEnd(33)} ${finding.value.padEnd(16)} ${finding.replace}`,
  );
}
console.error(`\ncheck:norm  FAILED — ${findings.length} violation(s).`);
process.exit(1);

