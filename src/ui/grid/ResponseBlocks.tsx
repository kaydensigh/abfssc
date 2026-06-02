import type { ReactElement } from "react";
import { GRID_CELLS, OPENINGS, bidLabel, openingLabel } from "../../model/index.ts";
import type { ResponseBid, SuitOpening } from "../../model/index.ts";
import { useCardStore } from "../../state/index.ts";
import { SuitText } from "../../render/index.ts";
import { CodedInput } from "../fields/index.ts";

/**
 * Arrange an opening's response cells into the printed card's three sub-columns:
 * fill column-major (down col 1, then col 2, then col 3) and hang the per-opening
 * "Other" catch-all at the foot of column 1 — matching abf/screenshots/3-4.png.
 */
function columnsFor(opening: SuitOpening): ResponseBid[][] {
  const cells = GRID_CELLS[opening];
  const bids: ResponseBid[] = cells.filter((b) => b !== "Other");
  const per = Math.max(1, Math.ceil(bids.length / 3));
  const cols: ResponseBid[][] = [bids.slice(0, per), bids.slice(per, per * 2), bids.slice(per * 2)];
  if (cells.includes("Other")) cols[0] = [...cols[0], "Other"];
  return cols;
}

/** One response cell: bid label on the left, click-to-edit coded value on the right. */
function ResponseCell({ opening, bid }: { opening: SuitOpening; bid: ResponseBid }): ReactElement {
  const value = useCardStore((s) => s.card.responses[opening]?.[bid] ?? "");
  const setResponse = useCardStore((s) => s.setResponse);
  return (
    <div className="field rb-cell">
      <label>
        <SuitText>{bidLabel(bid)}</SuitText>
      </label>
      <CodedInput
        value={value}
        onChange={(v) => setResponse(opening, bid, v)}
        ariaLabel={`${openingLabel(opening)} → ${bidLabel(bid)}`}
      />
    </div>
  );
}

/**
 * §8 "Responses to Opening Bids": one block per opening, the opening label on
 * the left and its valid responses in three sub-columns — the printed card's
 * layout. Reads/writes responses[opening][bid] (the same model the matrix used);
 * not-applicable responses simply don't exist as cells.
 */
export function ResponseBlocks(): ReactElement {
  return (
    <div className="response-blocks">
      {OPENINGS.map((opening) => (
        <div className="response-block" key={opening}>
          <div className="rb-open">
            <SuitText>{openingLabel(opening)}</SuitText>
          </div>
          <div className="rb-cols">
            {columnsFor(opening).map((col, ci) => (
              <div className="rb-col" key={ci}>
                {col.map((bid) => (
                  <ResponseCell key={bid} opening={opening} bid={bid} />
                ))}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
