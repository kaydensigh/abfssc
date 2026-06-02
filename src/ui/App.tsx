import { type ReactElement, useState } from "react";
import { PAGES, PAGE_BY_ID, SECTION_BY_ID } from "../model/index.ts";
import { Section } from "./sections/index.ts";
import { ExportButton, PageNav, StorageIndicator } from "./common/index.ts";

/**
 * App shell: brand + 4-page nav in a sticky header, then the active page — a
 * header row (page title left, storage indicator right) above its stacked
 * sections. The four pages mirror the printed card's panels; within a page the
 * sections keep natural 1→10 order and their own sub-headings.
 */
export function App(): ReactElement {
  const [activeId, setActiveId] = useState<string>(PAGES[0].id);
  const page = PAGE_BY_ID[activeId] ?? PAGES[0];
  return (
    <div className="app">
      <header className="masthead-bar">
        <div className="masthead-top">
          <div className="brand">
            <span className="suits">
              <span>♠</span>
              <span className="r">♥</span>
              <span className="r">♦</span>
              <span>♣</span>
            </span>
            ABF System Card
          </div>
          <ExportButton />
        </div>
        <PageNav activeId={activeId} onSelect={setActiveId} />
      </header>

      <main className="page" id={`page-${page.id}`} aria-labelledby={`page-${page.id}-title`}>
        <div className="page-header">
          <h1 className="page-heading" id={`page-${page.id}-title`}>
            <span className="page-num" aria-hidden="true">
              {page.number}
            </span>
            <span className="page-name">{page.title}</span>
          </h1>
          <StorageIndicator />
        </div>

        <div className="page-sections">
          {page.sectionIds.map((sid) => (
            <Section key={sid} section={SECTION_BY_ID[sid]} />
          ))}
        </div>
      </main>
    </div>
  );
}
