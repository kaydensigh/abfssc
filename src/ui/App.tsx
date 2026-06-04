import { type ReactElement, useState } from "react";
import { PAGES, PAGE_BY_ID, SECTION_BY_ID } from "../model/index.ts";
import { Section } from "./sections/index.ts";
import { TextField } from "./fields/index.ts";
import {
  type ActionStatus,
  BrandTitle,
  ExportButton,
  ImportButton,
  NewCardButton,
  PageNav,
} from "./common/index.ts";
import { useUnloadGuard } from "./useUnloadGuard.ts";

/** The revision-code field (MyRev.) is defined in the masthead section for the
 *  data model / round-trip, but surfaced in the persistent header above the page
 *  tabs — not on page 1 — so it stays visible (and editable) on every page. */
const REV_FIELD = SECTION_BY_ID.masthead.fields.find((f) => f.key === "Date_A")!;

/**
 * App shell: brand + save indicator + actions, then the revision stamp and the
 * 4-page nav, in a sticky header; the active page is just its stacked sections
 * (no per-page heading — the page nav names the page). The four pages mirror the
 * printed card's panels; within a page the sections keep natural 1→10 order and
 * their own sub-headings.
 */
export function App(): ReactElement {
  useUnloadGuard();
  const [activeId, setActiveId] = useState<string>(PAGES[0].id);
  const [importStatus, setImportStatus] = useState<ActionStatus | null>(null);
  const [exportStatus, setExportStatus] = useState<ActionStatus | null>(null);
  const page = PAGE_BY_ID[activeId] ?? PAGES[0];
  return (
    <div className="app">
      <header className="masthead-bar">
        {/* On narrow screens this row wraps: the brand stays on the first line and
            the save indicator + action buttons flow onto the next as needed. */}
        <div className="masthead-top">
          <BrandTitle />
          <div className="actions">
            <NewCardButton />
            <ImportButton onStatus={setImportStatus} />
            <ExportButton onStatus={setExportStatus} />
          </div>
        </div>
        {/* The export result sits on its own right-aligned row below the buttons,
            so a long message never squashes them. The import result rides the
            revision row below — beside MyRev. when the line has room. */}
        {exportStatus && (
          <div className="masthead-status">
            <span
              className={exportStatus.kind === "error" ? "export-error" : "export-notice"}
              role={exportStatus.kind === "error" ? "alert" : "status"}
            >
              {exportStatus.text}
            </span>
          </div>
        )}
        {/* The revision stamp hugs the right; the import result (when present)
            sits just to its left on the same row, wrapping above it when narrow. */}
        <div className="masthead-rev">
          {importStatus && (
            <span
              className={`rev-status ${importStatus.kind === "error" ? "export-error" : "export-notice"}`}
              role={importStatus.kind === "error" ? "alert" : "status"}
            >
              {importStatus.text}
            </span>
          )}
          <TextField def={REV_FIELD} />
        </div>
        <PageNav activeId={activeId} onSelect={setActiveId} />
      </header>

      <main className="page" id={`page-${page.id}`} aria-labelledby={`page-${page.id}-title`}>
        {/* No visible page heading (the nav names the page), but keep a level-1
            heading for the document outline / screen-reader navigation. */}
        <h1 className="visually-hidden" id={`page-${page.id}-title`}>
          {page.title}
        </h1>
        <div className="page-sections">
          {page.sectionIds.map((sid) => (
            <Section key={sid} section={SECTION_BY_ID[sid]} />
          ))}
        </div>
      </main>
    </div>
  );
}
