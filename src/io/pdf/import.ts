// PDF import orchestration — pdf-lib-free, exactly like export.ts. It drives the
// adapter's read surface, guards the two import dead-ends (flattened/signed and
// not-an-ABF-card), and hands the raw field map to the shared assembler. Reading
// our own export here closes the M1+M2 round-trip contract test.

import { readForm, type FormReadResult } from "./adapter.ts";
import { ABF_SIGNATURE_FIELDS } from "./fieldmap.ts";
import { assembleCard, type ImportedCard } from "../assemble.ts";
import { ImportError } from "../errors.ts";

/** Read a filled ABF PDF (legacy or our own export) into a Card. */
export async function importCardFromPdf(bytes: Uint8Array | ArrayBuffer): Promise<ImportedCard> {
  let read: FormReadResult;
  try {
    read = await readForm(bytes);
  } catch {
    // pdf-lib's parser is strict; an exotic re-save can throw here. This is the
    // typed hook a pdf.js read-only fallback would slot into (deferred — M2 doc).
    throw new ImportError("unreadable", "This PDF couldn't be read. It may be damaged or password-protected.");
  }

  if (read.numFields === 0) {
    throw new ImportError(
      "flattened",
      "This PDF has no fillable form fields — it was flattened, signed, or printed to PDF, so the card data can't be read. Import the original editable card instead.",
    );
  }

  if (!ABF_SIGNATURE_FIELDS.some((name) => read.fields.has(name))) {
    throw new ImportError("not-abf", "This PDF doesn't look like an ABF System Card.");
  }

  return assembleCard({ fields: read.fields, stampJson: read.stampJson });
}

export type { ImportedCard };
