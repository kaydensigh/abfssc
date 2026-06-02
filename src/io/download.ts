// Browser-side export entry: fetch the shipped blank form once, build the
// filled PDF from the current Card, and hand the bytes to the download path.
// Kept apart from export.ts so the orchestrator stays environment-free (and
// node-testable) — only this module touches fetch / Blob / the asset URL.

import templateUrl from "../assets/ABF_Card_FORM.pdf?url";
import type { Card } from "../model/index.ts";
import { renderPlain } from "../render/index.ts";
import type { ExportResult } from "./pdf/export.ts";

let cached: ArrayBuffer | null = null;

async function templateBytes(): Promise<ArrayBuffer> {
  if (cached) return cached;
  const res = await fetch(templateUrl);
  if (!res.ok) throw new Error(`Could not load the form template (HTTP ${res.status}).`);
  cached = await res.arrayBuffer();
  return cached;
}

/**
 * Build the regulation PDF for the current card (browser; fetches the asset).
 * The exporter (and pdf-lib) is dynamically imported so the ~180 KB library
 * only loads on the first export, not in the initial bundle.
 */
export async function exportCardPdf(card: Card): Promise<ExportResult> {
  const [tpl, { buildCardPdf }] = await Promise.all([templateBytes(), import("./pdf/export.ts")]);
  // pdf-lib mutates the document it loads; hand it a fresh copy each time.
  return buildCardPdf(card, tpl.slice(0), { now: new Date().toISOString() });
}

/** Trigger a browser download of the produced PDF bytes. */
export function downloadPdf(bytes: Uint8Array, filename: string): void {
  const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** A friendly file name from the players, e.g. "ABF System Card — Smith & Jones.pdf". */
export function suggestFilename(card: Card): string {
  const a = renderPlain(card.fields.PlayerName_A ?? "").trim();
  const b = renderPlain(card.fields.PlayerName_B ?? "").trim();
  const who = [a, b].filter(Boolean).join(" & ");
  const safe = who.replace(/[\\/:*?"<>|]+/g, "").trim();
  return safe ? `ABF System Card — ${safe}.pdf` : "ABF System Card.pdf";
}
