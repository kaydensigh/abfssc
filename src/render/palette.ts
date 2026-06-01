import type { Suit } from "./types.ts";

// The colour palette, copied verbatim from the form's `gClrA` array
// (_openaction_clean.js:705). These RGB triples (0..1 floats) are the
// authoritative source; hex is derived below so there is no second copy to
// drift. Bank 0 — indices 0..13 — is the only one the !-code language reaches:
//   !0..!9  -> 0..9   (the documented 10-colour palette)
//   !;      -> 10 (white)   ![ -> 11 (grey)   !] -> 12   !: -> 13
// The alternate banks (14+) existed only for the legacy "basic" reader and are
// intentionally dropped (see design §04: "Use bank 0 ... not the alternate banks").
export const PALETTE_RGB: ReadonlyArray<readonly [number, number, number]> = [
  [0, 0, 0], //  0  black
  [1, 0, 0], //  1  red
  [0, 0, 1], //  2  blue
  [1, 0, 1], //  3  fuchsia
  [0, 0.7, 0.3], //  4  green
  [0.63, 0.13, 0.94], //  5  purple
  [0, 0.48, 0.65], //  6  cerulean
  [0.8, 0.4, 0], //  7  brown
  [0.4, 0.2, 0.2], //  8  dark brown
  [1, 0.7, 0.2], //  9  orange
  [1, 1, 1], // 10  white
  [0.6, 0.6, 0.6], // 11  grey
  [0.75, 0.75, 0.75], // 12  light grey
  [0.86, 0.86, 0.86], // 13  lighter grey
];

function toHex(rgb: readonly [number, number, number]): string {
  const h = (v: number) =>
    Math.round(Math.min(1, Math.max(0, v)) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${h(rgb[0])}${h(rgb[1])}${h(rgb[2])}`;
}

/** Hex form of bank 0, indices 0..13. */
export const PALETTE_HEX: readonly string[] = PALETTE_RGB.map(toHex);

export const DEFAULT_COLOR = PALETTE_HEX[0]; // black

/** Resolve a palette index to a CSS hex colour (clamped to the known bank). */
export function paletteColor(index: number): string {
  if (index >= 0 && index < PALETTE_HEX.length) return PALETTE_HEX[index];
  return DEFAULT_COLOR;
}

// Suit-symbol default colour indices, from `gScxA` (= [0,1,1,0,0,1,1,0] for
// S,H,D,C,s,h,d,c): spades/clubs black, hearts/diamonds red.
const SUIT_COLOR_INDEX: Record<Suit, number> = { S: 0, H: 1, D: 1, C: 0 };

export function suitDefaultColor(suit: Suit): string {
  return paletteColor(SUIT_COLOR_INDEX[suit]);
}

// On-screen glyphs for each suit (the embedded "Cards" font is a PDF-export
// concern; the browser uses Unicode with text-presentation, per design §04).
export const SUIT_GLYPH: Record<Suit, string> = {
  S: "♠", // ♠
  H: "♥", // ♥
  D: "♦", // ♦
  C: "♣", // ♣
};
