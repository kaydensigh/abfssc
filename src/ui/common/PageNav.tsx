import type { ReactElement } from "react";
import { PAGES } from "../../model/index.ts";

interface Props {
  activeId: string;
  onSelect: (id: string) => void;
}

/** Four page tabs. When the row gets narrow the unselected tabs collapse to
 *  just their number and the active tab takes the remaining width (see the
 *  `nav.pages` rules in styles.css). Each page stacks several sections, which
 *  keep their own number + title sub-headings. */
export function PageNav({ activeId, onSelect }: Props): ReactElement {
  return (
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
  );
}
