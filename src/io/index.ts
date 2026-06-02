// buildCardPdf / importCardFromPdf (which pull pdf-lib) are intentionally NOT
// re-exported here so the app's import graph keeps pdf-lib behind the dynamic
// imports in download.ts (export) and upload.ts (import). Tests import the
// pdf-lib-touching modules directly from ./pdf/*.
export type { ExportOptions, ExportResult } from "./pdf/export.ts";
export { exportCardPdf, downloadPdf, suggestFilename } from "./download.ts";

export { importCardFile } from "./upload.ts";
export type { FileImport, ImportSource } from "./upload.ts";
export { ImportError } from "./errors.ts";
export type { ImportErrorCode } from "./errors.ts";
export type { ImportedCard } from "./assemble.ts";
