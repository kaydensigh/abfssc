// The shared contract between the !-code interpreter and its two consumers
// (the React on-screen renderer in M0, and — in M1 — the PDF appearance
// builder). One pure function, renderCoded(), produces Span[]; the test table
// asserts against this boundary so both consumers are covered at once.

export type Suit = "S" | "H" | "D" | "C";
export type Align = "left" | "center" | "right";

/** A run of text with a single resolved visual style. */
export interface Span {
  /** Plain text (suit glyphs are carried as Unicode in `text` too). */
  text: string;
  /** Set when this span is a suit symbol; drives glyph + default colour. */
  suit?: Suit;
  /** CSS colour string, e.g. "#ff0000". */
  color: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  /** Vertical shift: 1 = superscript, -1 = subscript, 0 = baseline. */
  vshift: 0 | 1 | -1;
  /** Point size after !+/!=/!- adjustments (suits capped at 11). */
  sizePt: number;
  /** Paragraph alignment; applies to the whole rendered value. */
  align?: Align;
}

export interface RenderOptions {
  /** Per-field starting size; defaults to the form's body size (10pt = gTFz). */
  fieldDefaults?: { sizePt: number };
  /** Layer-A tooltip code-list for THIS field (digit/`x` → phrase). */
  codeList?: Record<string, string>;
  /** Layer-B grave-accent shortcut table (defaults to the built-in gCdH). */
  graveTable?: Record<string, string>;
  /** Whether a lone `!r` produces a line break (multiline fields). */
  multiline?: boolean;
}
