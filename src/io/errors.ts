// Typed import failures, so the UI can show a precise message (and a future
// pdf.js read-only fallback can hook the "unreadable" case) instead of a bare
// catch. All non-fatal issues ride in ImportedCard.warnings; these are the
// fatal "no card could be produced" cases.

export type ImportErrorCode =
  | "flattened" // a PDF with no AcroForm fields (flattened / signed / printed)
  | "not-abf" // a form PDF, but not an ABF System Card
  | "empty-fdf" // an FDF that yielded no field values
  | "unreadable"; // the bytes couldn't be parsed at all

export class ImportError extends Error {
  readonly code: ImportErrorCode;
  constructor(code: ImportErrorCode, message: string) {
    super(message);
    this.name = "ImportError";
    this.code = code;
  }
}
