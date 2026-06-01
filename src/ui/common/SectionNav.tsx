import type { ReactElement } from "react";
import { SECTIONS } from "../../model/index.ts";

interface Props {
  activeId: string;
  onSelect: (id: string) => void;
}

const label = (number: number | undefined, title: string) => (number ? `${number}. ${title}` : title);

/** Tab strip on desktop; a section <select> on mobile (sections in order 1→10). */
export function SectionNav({ activeId, onSelect }: Props): ReactElement {
  return (
    <>
      <nav className="sections" aria-label="Card sections">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            type="button"
            className={s.id === activeId ? "active" : ""}
            aria-current={s.id === activeId ? "page" : undefined}
            onClick={() => onSelect(s.id)}
          >
            {label(s.number, s.title)}
          </button>
        ))}
      </nav>
      <select
        className="mobile-section-select"
        value={activeId}
        onChange={(e) => onSelect(e.target.value)}
        aria-label="Jump to section"
      >
        {SECTIONS.map((s) => (
          <option key={s.id} value={s.id}>
            {label(s.number, s.title)}
          </option>
        ))}
      </select>
    </>
  );
}
