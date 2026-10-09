// Writes an SVG badge with the combined line coverage of every package.
// Usage: node scripts/coverage-badge.mjs <output.svg>
import { globSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const output = process.argv[2];
if (!output) throw new Error("Usage: coverage-badge.mjs <output.svg>");

const reports = globSync("packages/*/coverage/lcov.info");
if (reports.length === 0)
  throw new Error("No coverage reports found; run pnpm test:coverage first.");

// lcov records lines found (LF) and lines hit (LH) per source file.
const sum = (field) =>
  reports
    .flatMap(
      (file) =>
        readFileSync(file, "utf8").match(
          new RegExp(`^${field}:(\\d+)`, "gm"),
        ) ?? [],
    )
    .reduce((total, line) => total + Number(line.split(":")[1]), 0);

const percent = Math.floor((sum("LH") / sum("LF")) * 100);
const color =
  percent >= 90
    ? "#4c1"
    : percent >= 75
      ? "#97ca00"
      : percent >= 60
        ? "#dfb317"
        : "#e05d44";
const value = `${percent}%`;

const LABEL_WIDTH = 62;
const valueWidth = 12 + value.length * 7;
const width = LABEL_WIDTH + valueWidth;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="20" role="img" aria-label="coverage: ${value}">
  <title>coverage: ${value}</title>
  <clipPath id="r"><rect width="${width}" height="20" rx="3"/></clipPath>
  <g clip-path="url(#r)">
    <rect width="${LABEL_WIDTH}" height="20" fill="#555"/>
    <rect x="${LABEL_WIDTH}" width="${valueWidth}" height="20" fill="${color}"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="11">
    <text x="${LABEL_WIDTH / 2}" y="14">coverage</text>
    <text x="${LABEL_WIDTH + valueWidth / 2}" y="14">${value}</text>
  </g>
</svg>
`;

mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, svg);
console.log(`coverage: ${value} (${reports.length} packages) -> ${output}`);
