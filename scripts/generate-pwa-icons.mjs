#!/usr/bin/env node
/**
 * Generate iOS / PWA PNG assets from public/icon.svg (official qb mark).
 *
 *   npm i -D @resvg/resvg-js
 *   npm run icons:gen
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const PUBLIC = join(ROOT, "public");
const SVG = join(PUBLIC, "icon.svg");

function loadResvg() {
  const require = createRequire(import.meta.url);
  try {
    return require("@resvg/resvg-js");
  } catch {
    console.error(
      "Missing @resvg/resvg-js.\n  npm i -D @resvg/resvg-js && npm run icons:gen"
    );
    process.exit(1);
  }
}

function raster(svg, Resvg, size) {
  const r = new Resvg(svg, {
    fitTo: { mode: "width", value: size },
    background: "transparent",
  });
  return Buffer.from(r.render().asPng());
}

function main() {
  const { Resvg } = loadResvg();
  mkdirSync(PUBLIC, { recursive: true });
  const svg = readFileSync(SVG);

  for (const [name, size] of [
    ["apple-touch-icon.png", 180],
    ["icon-192.png", 192],
    ["icon-512.png", 512],
  ]) {
    writeFileSync(join(PUBLIC, name), raster(svg, Resvg, size));
    console.log("wrote", name);
  }

  const splashW = 1290;
  const splashH = 2796;
  const iconSize = 256;
  const x = Math.round((splashW - iconSize) / 2);
  const y = Math.round((splashH - iconSize) / 2);
  const iconHref = pathToFileURL(SVG).href;
  const splashSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${splashW}" height="${splashH}" viewBox="0 0 ${splashW} ${splashH}">
  <rect width="100%" height="100%" fill="#1d1d1f"/>
  <image href="${iconHref}" x="${x}" y="${y}" width="${iconSize}" height="${iconSize}"/>
</svg>`;
  writeFileSync(
    join(PUBLIC, "apple-touch-startup-image.png"),
    raster(Buffer.from(splashSvg), Resvg, splashW)
  );
  console.log("wrote apple-touch-startup-image.png");
}

main();
