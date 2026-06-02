// Capture full-page screenshots of every screen page of the running app, so a
// human (or a future agent) can eyeball the browser-rendered card without
// standing up a server and driving a browser by hand.
//
//   node scripts/screenshot.mjs              # → abf/screenshots/app/page-1..4.png
//   node scripts/screenshot.mjs <out-dir>    # write the PNGs somewhere else
//   npm run shots                            # same as the first form
//
// It boots Vite's dev server in-process (no build needed), opens each of the
// four page tabs in Chromium, and writes one full-height PNG per page. The card
// is whatever is persisted in the throwaway browser profile — i.e. empty — which
// is what we want when diffing layout against the blank reference PDF pages in
// abf/screenshots/1-4.png.
//
// Requires the one-time Playwright browser download:  npx playwright install chromium

import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { createServer } from "vite";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const outDir = resolve(root, process.argv[2] ?? "abf/screenshots/app");

// The four page tabs, in order. Labels are only used for log lines; we click by
// position so a title tweak never breaks capture.
const PAGE_LABELS = [
  "Openings & Competitive",
  "Responses & Play",
  "Responses to Openings",
  "Conventions & Notes",
];

const server = await createServer({
  root,
  // A high, rarely-used port; strictPort:false lets Vite hop if it's taken.
  server: { port: 5189, strictPort: false },
  logLevel: "warn",
});
await server.listen();
const addr = server.httpServer?.address();
if (!addr || typeof addr === "string") throw new Error("Vite dev server did not bind a TCP port");
const url = `http://localhost:${addr.port}/`;
console.log(`dev server: ${url}`);

const browser = await chromium.launch();
try {
  const page = await browser.newPage({
    // Wide enough for the desktop layout (the nav collapses to a <select> at
    // <=720px); the app itself is capped at max-width:1180px. 2x for crisp text.
    viewport: { width: 1280, height: 1600 },
    deviceScaleFactor: 2,
  });
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".pages button", { state: "visible" });
  await page.evaluate(() => document.fonts.ready);

  await mkdir(outDir, { recursive: true });
  const tabs = page.locator(".pages button");
  const count = await tabs.count();
  if (count !== PAGE_LABELS.length) {
    console.warn(`expected ${PAGE_LABELS.length} page tabs, found ${count}`);
  }

  for (let i = 0; i < count; i++) {
    await tabs.nth(i).click();
    await page.waitForFunction((n) => {
      const btn = document.querySelectorAll(".pages button")[n];
      return btn?.getAttribute("aria-current") === "page";
    }, i);
    await page.evaluate(() => document.fonts.ready);
    const file = resolve(outDir, `page-${i + 1}.png`);
    await page.screenshot({ path: file, fullPage: true });
    console.log(`captured page ${i + 1} (${PAGE_LABELS[i] ?? "?"}) → ${file}`);
  }
} finally {
  await browser.close();
  await server.close();
}
