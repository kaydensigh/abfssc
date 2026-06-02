// Dump every AcroForm widget's page + rectangle from the original PDF, so the
// web rebuild can mirror the printed layout (which fields share a row, their
// relative widths, full vs half vs uneven splits) from ground truth rather than
// by eyeballing screenshots.
//
//   node abf/extract_geometry.mjs   →  abf/extracted/field_geometry.json + .txt
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { PDFDocument, PDFName, PDFDict, PDFArray, PDFNumber } from "pdf-lib";

const here = dirname(fileURLToPath(import.meta.url));
const bytes = fs.readFileSync(resolve(here, "ABF_Card_FORM.pdf"));
const doc = await PDFDocument.load(bytes, { updateMetadata: false });
const ctx = doc.context;

function fieldName(dict) {
  const parts = [];
  let cur = dict;
  let guard = 0;
  while (cur instanceof PDFDict && guard++ < 20) {
    const t = cur.lookup(PDFName.of("T"));
    if (t && typeof t.decodeText === "function") parts.unshift(t.decodeText());
    else if (t) parts.unshift(String(t));
    const parent = cur.get(PDFName.of("Parent"));
    cur = parent ? ctx.lookup(parent) : null;
  }
  return parts.join(".");
}

const pages = doc.getPages();
const rows = [];
pages.forEach((page, pageIndex) => {
  const { width: pw, height: ph } = page.getSize();
  const annots = page.node.Annots();
  if (!annots) return;
  const arr = annots.asArray();
  for (const ref of arr) {
    const dict = ctx.lookup(ref);
    if (!(dict instanceof PDFDict)) continue;
    const subtype = dict.lookup(PDFName.of("Subtype"));
    if (!subtype || String(subtype) !== "/Widget") continue;
    const rect = dict.lookup(PDFName.of("Rect"));
    if (!(rect instanceof PDFArray)) continue;
    const n = rect.asArray().map((v) => (v instanceof PDFNumber ? v.asNumber() : Number(v)));
    const [x1, y1, x2, y2] = n;
    const ft = dict.lookup(PDFName.of("FT")) ?? "(inherited)";
    rows.push({
      page: pageIndex + 1,
      name: fieldName(dict),
      ft: String(ft),
      x: Math.round(x1),
      // top measured from the top of the page (intuitive reading order)
      top: Math.round(ph - y2),
      w: Math.round(x2 - x1),
      h: Math.round(y2 - y1),
      pageW: Math.round(pw),
      pageH: Math.round(ph),
    });
  }
});

// Sort into reading order: page, then top (down the page), then x (left→right).
rows.sort((a, b) => a.page - b.page || a.top - b.top || a.x - b.x);

fs.writeFileSync(resolve(here, "extracted/field_geometry.json"), JSON.stringify(rows, null, 2));

// Human-readable: group by page, cluster widgets whose tops are within 6pt into
// one printed "row", and show each widget's x-span + width.
const lines = [];
let curPage = 0;
let lastTop = -999;
for (const r of rows) {
  if (r.page !== curPage) {
    curPage = r.page;
    lastTop = -999;
    lines.push(`\n===== PAGE ${r.page}  (${r.pageW} x ${r.pageH} pt) =====`);
  }
  if (Math.abs(r.top - lastTop) > 6) lines.push(`  --- row @top≈${r.top} ---`);
  lastTop = r.top;
  const pct = ((r.w / r.pageW) * 100).toFixed(0);
  lines.push(
    `    ${r.name.padEnd(28)} x=${String(r.x).padStart(3)}..${String(r.x + r.w).padStart(3)} w=${String(r.w).padStart(3)} (${pct}% pg) ${r.ft}`,
  );
}
fs.writeFileSync(resolve(here, "extracted/field_geometry.txt"), lines.join("\n").trimStart());
console.log(`widgets: ${rows.length}, pages: ${pages.length}`);
console.log(`→ extracted/field_geometry.json + .txt`);
