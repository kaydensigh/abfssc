import { type ReactElement, useState } from "react";
import { SECTIONS, SECTION_BY_ID } from "../model/index.ts";
import { Section } from "./sections/index.ts";
import { SectionNav, StorageBanner } from "./common/index.ts";

/**
 * App shell: brand + section nav in a sticky header, the local-only storage
 * banner, then one section at a time (keeps a ~295-field form from rendering
 * wholesale). Sections are presented in natural order 1→10 — the PDF's front-
 * cover ordering is a print constraint and must not leak into editing.
 */
export function App(): ReactElement {
  const [activeId, setActiveId] = useState<string>(SECTIONS[0].id);
  const active = SECTION_BY_ID[activeId] ?? SECTIONS[0];
  return (
    <div className="app">
      <header className="masthead-bar">
        <div className="brand">
          <span className="suits">
            <span>♠</span>
            <span className="r">♥</span>
            <span className="r">♦</span>
            <span>♣</span>
          </span>
          ABF System Card
        </div>
        <SectionNav activeId={activeId} onSelect={setActiveId} />
      </header>
      <StorageBanner />
      <Section section={active} />
    </div>
  );
}
