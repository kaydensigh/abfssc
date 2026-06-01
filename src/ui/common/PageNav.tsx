import type { ReactElement } from "react";
import { PAGES } from "../../model/index.ts";

interface Props {
  activeId: string;
  onSelect: (id: string) => void;
}

/** Four page tabs on desktop; a page <select> at <=720px. Each page stacks
 *  several sections, which keep their own number + title sub-headings. */
export function PageNav({ activeId, onSelect }: Props): ReactElement {
  return (
    <>
      <nav className="pages" aria-label="Card pages">
        {PAGES.map((p) => (
          <button
            key={p.id}
            type="button"
            className={p.id === activeId ? "active" : ""}
            aria-current={p.id === activeId ? "page" : undefined}
            onClick={() => onSelect(p.id)}
          >
            <span className="pg-num" aria-hidden="true">
              {p.number}
            </span>
            <span className="pg-title">{p.title}</span>
          </button>
        ))}
      </nav>

      <select
        className="mobile-page-select"
        value={activeId}
        onChange={(e) => onSelect(e.target.value)}
        aria-label="Jump to page"
      >
        {PAGES.map((p) => (
          <option key={p.id} value={p.id}>
            {p.number}. {p.title}
          </option>
        ))}
      </select>
    </>
  );
}
