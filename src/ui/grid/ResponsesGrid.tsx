import { type ReactElement, memo, useCallback, useEffect, useRef, useState } from "react";
import { GRID_CELLS, OPENINGS, RESPONSE_BIDS, bidLabel, cellExists, openingLabel } from "../../model/index.ts";
import type { ResponseBid, SuitOpening } from "../../model/index.ts";
import { useCardStore } from "../../state/index.ts";
import { CodedText, SuitText } from "../../render/index.ts";
import { CodedInput } from "../fields/index.ts";

const cellKey = (op: SuitOpening, bid: ResponseBid) => `${op}|${bid}`;

interface TableCellProps {
  opening: SuitOpening;
  bid: ResponseBid;
  active: boolean;
  onActivate: (op: SuitOpening, bid: ResponseBid) => void;
  registerRef: (key: string, el: HTMLButtonElement | null) => void;
}

/**
 * Compact click-to-edit table cell. Roving tabindex (only the active cell is in
 * the tab order); Enter/F2 or a click enters edit mode — focusing alone does NOT,
 * so the matrix can be traversed by keyboard (arrows handled by the table).
 */
const TableCell = memo(function TableCell({ opening, bid, active, onActivate, registerRef }: TableCellProps) {
  const value = useCardStore((s) => s.card.responses[opening]?.[bid] ?? "");
  const setResponse = useCardStore((s) => s.setResponse);
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const label = `${openingLabel(opening)} → ${bidLabel(bid)}`;
  const key = cellKey(opening, bid);
  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);
  if (!editing) {
    return (
      <button
        type="button"
        className="cell-display"
        aria-label={label}
        tabIndex={active ? 0 : -1}
        ref={(el) => registerRef(key, el)}
        onFocus={() => onActivate(opening, bid)}
        onClick={() => setEditing(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === "F2") {
            e.preventDefault();
            setEditing(true);
          }
        }}
      >
        {value ? <CodedText value={value} /> : ""}
      </button>
    );
  }
  return (
    <input
      ref={inputRef}
      aria-label={label}
      value={value}
      onChange={(e) => setResponse(opening, bid, e.target.value)}
      onBlur={() => setEditing(false)}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.preventDefault();
          setEditing(false);
        }
      }}
    />
  );
});

/** Full-UX cell for the mobile accordion (room for the toolbar + preview). */
function AccordionCell({ opening, bid }: { opening: SuitOpening; bid: ResponseBid }): ReactElement {
  const value = useCardStore((s) => s.card.responses[opening]?.[bid] ?? "");
  const setResponse = useCardStore((s) => s.setResponse);
  return (
    <div className="field">
      <label>
        <SuitText>{bidLabel(bid)}</SuitText>
      </label>
      <CodedInput value={value} onChange={(v) => setResponse(opening, bid, v)} ariaLabel={`${openingLabel(opening)} ${bidLabel(bid)}`} />
    </div>
  );
}

/**
 * The §8 matrix: a real table with sticky header row + first column and
 * arrow-key cell navigation on desktop, a stacked accordion (one panel per
 * opening) on mobile. Both read/write the identical responses[opening][bid]
 * cells, so a viewport change never reshapes data. Non-existent cells render as
 * not-applicable holes and are skipped by keyboard navigation.
 */
export function ResponsesGrid(): ReactElement {
  const [active, setActive] = useState<{ op: SuitOpening; bid: ResponseBid }>({ op: OPENINGS[0], bid: GRID_CELLS[OPENINGS[0]][0] });
  const refs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const registerRef = useCallback((key: string, el: HTMLButtonElement | null) => {
    if (el) refs.current.set(key, el);
    else refs.current.delete(key);
  }, []);
  const onActivate = useCallback((op: SuitOpening, bid: ResponseBid) => setActive({ op, bid }), []);

  const focusCell = (op: SuitOpening, bid: ResponseBid) => {
    setActive({ op, bid });
    // The target cell is already in the DOM; focus it directly (works even while
    // its roving tabIndex is mid-update — programmatic focus ignores tabIndex).
    refs.current.get(cellKey(op, bid))?.focus();
  };

  const onGridKeyDown = (e: React.KeyboardEvent) => {
    if ((e.target as HTMLElement).tagName === "INPUT") return; // editing — let the caret move
    const { op, bid } = active;
    const r = OPENINGS.indexOf(op);
    const c = RESPONSE_BIDS.indexOf(bid);
    const seekCol = (step: number): ResponseBid | null => {
      for (let i = c + step; i >= 0 && i < RESPONSE_BIDS.length; i += step) {
        if (cellExists(op, RESPONSE_BIDS[i])) return RESPONSE_BIDS[i];
      }
      return null;
    };
    const seekRow = (step: number): SuitOpening | null => {
      for (let i = r + step; i >= 0 && i < OPENINGS.length; i += step) {
        if (cellExists(OPENINGS[i], bid)) return OPENINGS[i];
      }
      return null;
    };
    let next: { op: SuitOpening; bid: ResponseBid } | null = null;
    switch (e.key) {
      case "ArrowRight": {
        const b = seekCol(1);
        if (b) next = { op, bid: b };
        break;
      }
      case "ArrowLeft": {
        const b = seekCol(-1);
        if (b) next = { op, bid: b };
        break;
      }
      case "ArrowDown": {
        const o = seekRow(1);
        if (o) next = { op: o, bid };
        break;
      }
      case "ArrowUp": {
        const o = seekRow(-1);
        if (o) next = { op: o, bid };
        break;
      }
      default:
        return;
    }
    e.preventDefault();
    if (next) focusCell(next.op, next.bid);
  };

  return (
    <>
      <div className="grid-wrap">
        <table className="responses" onKeyDown={onGridKeyDown}>
          <caption className="visually-hidden">
            Responses to opening bids. Use the arrow keys to move between cells; Enter to edit.
          </caption>
          <thead>
            <tr>
              <th scope="col">Opening</th>
              {RESPONSE_BIDS.map((b) => (
                <th key={b} scope="col">
                  <SuitText>{bidLabel(b)}</SuitText>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {OPENINGS.map((op) => (
              <tr key={op}>
                <th scope="row">
                  <SuitText>{openingLabel(op)}</SuitText>
                </th>
                {RESPONSE_BIDS.map((b) =>
                  cellExists(op, b) ? (
                    <td key={b}>
                      <TableCell
                        opening={op}
                        bid={b}
                        active={active.op === op && active.bid === b}
                        onActivate={onActivate}
                        registerRef={registerRef}
                      />
                    </td>
                  ) : (
                    <td key={b} className="hole" aria-hidden="true" />
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid-accordion">
        {OPENINGS.map((op) => (
          <details key={op}>
            <summary>
              <SuitText>{openingLabel(op)}</SuitText> — responses
            </summary>
            <div className="acc-body">
              {GRID_CELLS[op].map((bid) => (
                <AccordionCell key={bid} opening={op} bid={bid} />
              ))}
            </div>
          </details>
        ))}
      </div>
    </>
  );
}
