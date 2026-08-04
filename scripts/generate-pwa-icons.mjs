import { chromium } from "playwright";
import { mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = join(ROOT, "public", "pwa");
const SVG = readFileSync(join(ROOT, "public", "icon.svg"), "utf8");
const SIZES = [192, 512];

mkdirSync(OUT_DIR, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage();
const dataUrl = `data:image/svg+xml;base64,${Buffer.from(SVG).toString("base64")}`;

for (const size of SIZES) {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(
    `<!DOCTYPE html><html><body style="margin:0;background:#f9f7f1"><img src="${dataUrl}" width="${size}" height="${size}" alt=""/></body></html>`,
  );
  await page.screenshot({
    path: join(OUT_DIR, `icon-${size}.png`),
    type: "png",
  });
  console.log(`wrote public/pwa/icon-${size}.png`);
}

await browser.close();
