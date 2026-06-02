// Browser-side import entry: sniff a dropped/chosen file as PDF or FDF and route
// it to the matching importer. The PDF importer (and pdf-lib) is dynamically
// imported so the library stays out of the initial bundle — symmetric with
// download.ts on the export side.

import { ImportError } from "./errors.ts";
import type { ImportedCard } from "./assemble.ts";

export type ImportSource = "pdf" | "fdf";

export interface FileImport {
  imported: ImportedCard;
  source: ImportSource;
}

// Real ABF cards are well under 2 MB (the blank form itself is ~535 KB). Reject
// larger uploads BEFORE reading any bytes: an untrusted multi-hundred-MB PDF/FDF
// would otherwise pin the main thread (whole-file load + synchronous parse) and
// OOM the tab. A generous ceiling that still admits any real card.
const MAX_IMPORT_BYTES = 16 * 1024 * 1024; // 16 MB

/** Read the first bytes of a file as a Latin1 signature string. */
function signature(buf: ArrayBuffer): string {
  return new TextDecoder("latin1").decode(buf.slice(0, 1024));
}

/** Import a user-chosen ABF card file (PDF or FDF) into a Card. */
export async function importCardFile(file: File): Promise<FileImport> {
  if (file.size > MAX_IMPORT_BYTES) {
    throw new ImportError(
      "unreadable",
      "That file is too large to be an ABF System Card — choose the exported PDF or FDF.",
    );
  }
  const buf = await file.arrayBuffer();
  const sig = signature(buf);
  const isPdf = sig.includes("%PDF") || /\.pdf$/i.test(file.name);
  const isFdf = sig.includes("%FDF") || /\.fdf$/i.test(file.name);

  if (isFdf && !isPdf) {
    const { importCardFromFdf } = await import("./fdf/import.ts");
    return { imported: importCardFromFdf(buf), source: "fdf" };
  }
  if (isPdf) {
    const { importCardFromPdf } = await import("./pdf/import.ts");
    return { imported: await importCardFromPdf(buf), source: "pdf" };
  }
  throw new ImportError("unreadable", "Unrecognised file — choose an ABF System Card PDF or an FDF file.");
}
