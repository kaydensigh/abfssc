// @vitest-environment node
/// <reference types="node" />
// Guards SOLID_SUIT_PATHS against the shipped /Cards font: re-derives the solid
// silhouette of ♥/♦ straight from the embedded font program and asserts it still
// matches the hardcoded constants. If the font asset is ever swapped, this fails
// loudly rather than letting the export silently draw the wrong (or hollow) shape.
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { PDFDocument, PDFName, PDFDict, decodePDFRawStream } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { SOLID_SUIT_PATHS } from "./suitGlyphs.ts";

const TEMPLATE = readFileSync("src/assets/ABF_Card_FORM.pdf");

// number → compact PDF operand (matches src/io/pdf/appearance.ts `fmt`).
const n = (v: number): string => {
  const s = (Math.round(v * 1000) / 1000).toFixed(3).replace(/\.?0+$/, "");
  return s === "-0" ? "0" : s;
};

interface Cmd {
  command: string;
  args: number[];
}

function signedArea(cmds: Cmd[]): number {
  let a = 0, px = 0, py = 0, sx = 0, sy = 0;
  for (const c of cmds) {
    if (c.command === "moveTo") { sx = px = c.args[0]; sy = py = c.args[1]; continue; }
    if (c.command === "closePath") { a += px * sy - sx * py; px = sx; py = sy; continue; }
    const nx = c.args[c.args.length - 2], ny = c.args[c.args.length - 1];
    a += px * ny - nx * py; px = nx; py = ny;
  }
  return a / 2;
}

function contourToPdf(cmds: Cmd[]): string {
  const ops: string[] = [];
  let px = 0, py = 0;
  for (const c of cmds) {
    if (c.command === "moveTo") { px = c.args[0]; py = c.args[1]; ops.push(`${n(px)} ${n(py)} m`); }
    else if (c.command === "lineTo") { px = c.args[0]; py = c.args[1]; ops.push(`${n(px)} ${n(py)} l`); }
    else if (c.command === "bezierCurveTo") {
      const [c1x, c1y, c2x, c2y, x, y] = c.args;
      ops.push(`${n(c1x)} ${n(c1y)} ${n(c2x)} ${n(c2y)} ${n(x)} ${n(y)} c`); px = x; py = y;
    } else if (c.command === "quadraticCurveTo") {
      const [qx, qy, x, y] = c.args;
      const c1x = px + (2 / 3) * (qx - px), c1y = py + (2 / 3) * (qy - py);
      const c2x = x + (2 / 3) * (qx - x), c2y = y + (2 / 3) * (qy - y);
      ops.push(`${n(c1x)} ${n(c1y)} ${n(c2x)} ${n(c2y)} ${n(x)} ${n(y)} c`); px = x; py = y;
    } else if (c.command === "closePath") { ops.push("h"); }
  }
  return ops.join(" ");
}

/** Derive the solid silhouette (drop opposite-winding counters) for one char. */
function deriveSolid(font: ReturnType<typeof fontkit.create>, ch: string): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const glyph: any = (font as any).glyphForCodePoint(ch.charCodeAt(0));
  const contours: Cmd[][] = [];
  let cur: Cmd[] | null = null;
  for (const c of glyph.path.commands as Cmd[]) {
    if (c.command === "moveTo") { cur = []; contours.push(cur); }
    if (cur) cur.push(c);
  }
  const areas = contours.map(signedArea);
  const dom = areas.reduce((bi, a, i, arr) => (Math.abs(a) > Math.abs(arr[bi]) ? i : bi), 0);
  const sign = Math.sign(areas[dom]);
  return contours
    .filter((_, i) => Math.sign(areas[i]) === sign)
    .map(contourToPdf)
    .join("\n");
}

describe("SOLID_SUIT_PATHS", () => {
  it("matches the silhouette of ♥/♦ in the shipped /Cards font", async () => {
    const doc = await PDFDocument.load(TEMPLATE.slice(0), { ignoreEncryption: true, updateMetadata: false });
    const acro = doc.catalog.lookup(PDFName.of("AcroForm"), PDFDict);
    const dr = acro.lookup(PDFName.of("DR"), PDFDict);
    const drFonts = dr.lookup(PDFName.of("Font"), PDFDict);
    const cards = drFonts.lookup(PDFName.of("Cards"), PDFDict);
    const fd = cards.lookup(PDFName.of("FontDescriptor"), PDFDict);
    const ff = fd.lookup(PDFName.of("FontFile2"));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const program = Buffer.from(decodePDFRawStream(ff as any).decode());
    const font = fontkit.create(program);

    expect(deriveSolid(font, "H")).toBe(SOLID_SUIT_PATHS.H);
    expect(deriveSolid(font, "D")).toBe(SOLID_SUIT_PATHS.D);

    // Sanity: the raw glyphs really are 2-contour outlines (the bug's premise).
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const heart: any = (font as any).glyphForCodePoint("H".charCodeAt(0));
    const moves = (heart.path.commands as Cmd[]).filter((c) => c.command === "moveTo").length;
    expect(moves).toBe(2);
  });
});
