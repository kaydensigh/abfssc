import type { ResponseBid, SuitOpening } from "./types.ts";

// The §8 "Responses to Opening Bids" matrix. Rows are the ten openings; columns
// are response bids. The grid is RAGGED — each opening allows a different set of
// responses — taken verbatim from the form's field tree (the Resp<opening>_<bid>
// fields in abf/extracted/field_names.txt). "General" is the bare Resp<opening>
// row-level "general approach" cell; "Other" is the per-row catch-all.
//
// Note (design §03): the 2-level responses to 1NT (Resp1NT2C/2D/2H/2S/Doubled)
// are SEPARATE top-level coded fields with their own code-lists, NOT grid cells.
// The real 1NT grid cells are only the 3- and 4-level jumps below.

/** Display order of opening rows. */
export const OPENINGS: readonly SuitOpening[] = [
  "1C",
  "1D",
  "1H",
  "1S",
  "1NT",
  "2C",
  "2D",
  "2H",
  "2S",
  "2NT",
];

/** Full column axis (union), in bridge order: level ascending, suit C<D<H<S<NT. */
export const RESPONSE_BIDS: readonly ResponseBid[] = [
  "General",
  "1D",
  "1H",
  "1S",
  "1NT",
  "2C",
  "2D",
  "2H",
  "2S",
  "2NT",
  "3C",
  "3D",
  "3H",
  "3S",
  "3NT",
  "4C",
  "4D",
  "4H",
  "4S",
  "Other",
];

/** The exact ragged cells present for each opening (incl. the General cell). */
export const GRID_CELLS: Readonly<Record<SuitOpening, readonly ResponseBid[]>> = {
  "1C": ["General", "1D", "1H", "1S", "1NT", "2C", "2D", "2H", "2S", "2NT", "3C", "3D", "3H", "3S", "3NT", "4C", "Other"],
  "1D": ["General", "1H", "1S", "1NT", "2C", "2D", "2H", "2S", "2NT", "3C", "3D", "3H", "3S", "3NT", "4C", "4D", "Other"],
  "1H": ["General", "1S", "1NT", "2C", "2D", "2H", "2S", "2NT", "3C", "3D", "3H", "3S", "3NT", "Other"],
  "1S": ["General", "1NT", "2C", "2D", "2H", "2S", "2NT", "3C", "3D", "3H", "3S", "3NT", "4C", "Other"],
  "1NT": ["General", "3C", "3D", "3H", "3S", "3NT", "4C", "4D", "4H", "4S", "Other"],
  "2C": ["General", "2D", "2H", "2S", "2NT", "3C", "3D", "3H", "3S", "3NT", "Other"],
  "2D": ["General", "2H", "2S", "2NT", "3C", "3D", "3H", "3S", "3NT", "4C", "Other"],
  "2H": ["General", "2S", "2NT", "3C", "3D", "3H", "3S", "3NT", "4C", "4H", "Other"],
  "2NT": ["General", "3C", "3D", "3H", "3S", "3NT", "4C", "4D", "4H", "4S", "Other"],
  "2S": ["General", "2NT", "3C", "3D", "3H", "3S", "3NT", "4C", "4H", "4S", "Other"],
};

/** Whether opening × bid is a real cell (vs. a not-applicable hole in the matrix). */
export function cellExists(opening: SuitOpening, bid: ResponseBid): boolean {
  return GRID_CELLS[opening].includes(bid);
}

const SUIT_GLYPH: Record<string, string> = { C: "♣", D: "♦", H: "♥", S: "♠" };

/** Short header label for a column, e.g. "2H" → "2♥", "1NT" → "1NT". */
export function bidLabel(bid: ResponseBid): string {
  if (bid === "General") return "Gen.";
  if (bid === "Other") return "Other";
  if (bid.endsWith("NT")) return bid;
  const level = bid.slice(0, -1);
  const suit = bid.slice(-1);
  return `${level}${SUIT_GLYPH[suit] ?? suit}`;
}

/** The opening's row label, e.g. "2H" → "2♥". */
export function openingLabel(opening: SuitOpening): string {
  if (opening.endsWith("NT")) return opening;
  const level = opening.slice(0, -1);
  const suit = opening.slice(-1);
  return `${level}${SUIT_GLYPH[suit] ?? suit}`;
}

/**
 * Map a grid coordinate to its canonical PDF field name (used by M1/M2 IO; here
 * it keeps the naming convention in one place). "General" → bare Resp<opening>;
 * "Other" → Resp<opening>_Other; otherwise Resp<opening>_<bid>.
 */
export function gridFieldName(opening: SuitOpening, bid: ResponseBid): string {
  if (bid === "General") return `Resp${opening}`;
  return `Resp${opening}_${bid}`;
}
