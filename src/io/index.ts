// buildCardPdf (which pulls pdf-lib) is intentionally NOT re-exported here so
// the app's import graph keeps it behind download.ts's dynamic import. Tests
// import it directly from ./pdf/export.ts.
export type { ExportOptions, ExportResult } from "./pdf/export.ts";
export { exportCardPdf, downloadPdf, suggestFilename } from "./download.ts";
