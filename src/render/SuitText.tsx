import { type ReactElement, type ReactNode, Fragment } from "react";
import type { Suit } from "./types.ts";

// Glyph → suit code, so a plain label string ("1♣", "Multi 2♦") renders with the
// card's natural suit colours (♠♣ black, ♥♦ red) without the author hand-wrapping
// spans. The colours come from the .suit-S/.suit-H/.suit-D/.suit-C classes in
// styles.css; this only inserts the markup. Field values use CodedText instead —
// this is for static label / heading / caption text.
const GLYPH_TO_SUIT: Record<string, Suit> = { "♠": "S", "♥": "H", "♦": "D", "♣": "C" };
const SPLIT = /([♠♥♦♣])/;

/** Wrap each suit glyph in a coloured span; pass other text through unchanged. */
export function colorizeSuits(text: string): ReactNode {
  if (!text) return text;
  const parts = text.split(SPLIT);
  if (parts.length === 1) return text; // no suit glyphs — avoid extra spans
  return parts.map((part, i) => {
    const suit = GLYPH_TO_SUIT[part];
    if (!suit) return <Fragment key={i}>{part}</Fragment>;
    // Force text-presentation for ♥/♦ (VS-15) so browsers don't emoji-render them.
    return (
      <span className={`suit suit-${suit}`} key={i}>
        {part}
        {"︎"}
      </span>
    );
  });
}

/** Inline element rendering `children` (a string) with suit glyphs coloured. */
export function SuitText({ children }: { children: string }): ReactElement {
  return <>{colorizeSuits(children)}</>;
}
