// The form's embedded /Cards font draws ♥ and ♦ as OUTLINE glyphs: each has an
// inner counter-contour winding opposite the outer silhouette, so filling them
// the normal way (text render mode 0, nonzero winding) yields a coloured ring
// with a hollow, page-coloured centre — "red outline, white middle". ♠ and ♣
// are single solid contours and fill correctly, so they keep drawing the glyph.
//
// To print ♥/♦ solid we fill the glyph's *outer silhouette* ourselves as a
// vector path instead of drawing the hollow glyph. Below are the silhouette
// contours of Cards 'H' and 'D' in 1000-unit em space (glyph origin at 0,0,
// y-up) as PDF path operators; the appearance builder scales them by sizePt/1000
// and translates to the run's baseline (see EncodedRun.fill).
//
// These are derived directly from the embedded font and asserted against the
// shipped asset in suitGlyphs.test.ts, which fails if the font ever changes
// without these being regenerated.

import type { Suit } from "../../render/types.ts";

export const SOLID_SUIT_PATHS: Partial<Record<Suit, string>> = {
  H:
    "617 522 m 617 481.333 606.667 442.333 586 405 c 574.667 383.667 548.667 347 508 295 c " +
    "442.667 210.333 398.667 148 376 108 c 358 76 341.333 35.333 326 -14 c 314.667 28 298 68.333 276 107 c " +
    "250.667 151 206.667 213.667 144 295 c 104 347 78 383.667 66 405 c 44.667 443.667 34 482.667 34 522 c " +
    "34 568 49 605.333 79 634 c 109 662.667 147.333 677 194 677 c 242 677 286 654 326 608 c " +
    "365.333 654 409.333 677 458 677 c 504.667 677 542.833 662.833 572.5 634.5 c 602.167 606.167 617 568.667 617 522 c h",
  D:
    "540 333 m 435.333 209.667 351 94.333 287 -13 c 225 93 140.667 208.333 34 333 c " +
    "134.667 449.667 219 564.667 287 678 c 351 568.667 435.333 453.667 540 333 c h",
};
