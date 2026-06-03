// Pure model → PDF field mapping constants for export. No pdf-lib here; the
// adapter and orchestrator consume these. Every fact is grounded in the live
// ABF_Card_FORM.pdf (probed against the shipped asset) and the form's own JS.

import type { Classification } from "../../model/index.ts";

/** A field's display (print) twin and its checkbox print-mirror prefixes. */
export const D_PREFIX = "D_";
export const B_PREFIX = "B_";

export const dTwin = (name: string): string => D_PREFIX + name;
export const bTwin = (name: string): string => B_PREFIX + name;

/**
 * The literal the form writes into the `Classification` text field per colour
 * (from gFpB: `IsClassGreen` → "Green", …; cleared to "not set"). Verified in
 * abf/extracted/js_all_clean.js.
 */
export const CLASSIFICATION_LITERAL: Readonly<Record<Classification, string>> = {
  green: "Green",
  blue: "Blue",
  red: "Red",
  yellow: "Yellow",
  unset: "not set",
};

// The four "…Other / …More" overflow inputs (JumpRaiseMinorOther,
// JumpRaiseMajorOther, UnusualNTOther, Over1NTInterfMore) used to be merged into
// their parent's D_ appearance here. They are now dropped from the model
// entirely (see src/model/sections.ts §4): the real form keeps them off-page,
// Hidden, with no D_ twin and never displays them, so rendering them would print
// content that no Adobe-opened card shows — i.e. data a user could not recover.
// Export simply never touches them; import folds any legacy value into the
// parent via rename.ts. (Resp1NT2COther was the fifth such rule, never in our
// model.)

// Every imitation checkbox prints a plain Helvetica "X" (drawn by the adapter),
// matching the Q_* classification boxes and rendering in every viewer. The
// form's `My_CheckBoxValues` tick-style presets (cross/tick/square) were
// ZapfDingbats glyphs, which Chrome's PDF engine can't reliably draw, so we no
// longer use them on export. (The `checkboxStyle` setting still round-trips.)

/** Editable-field "on"/"off" values the form cycles a checkbox through. */
export const CHECKBOX_ON = "Yes";
export const CHECKBOX_OFF = "Off";

/** The front-cover button mirrors for classification + brown sticker. */
export const Z_MY_CLASS = "Z_MyClass";
export const Z_STICKER = "Z_Sticker";

/**
 * Fill RGB for the top-right `Z_MyClass` classification circle, per colour. The
 * form's blank `Z_*` on-state appearance is *white* (invisible) — the original
 * relies on Acrobat JS to recolour it at runtime. These are the exact triples
 * the `Classification` field's own `/AA /F` script applies (probed from the
 * asset): unset stays white, so the circle is an empty black-ringed outline.
 */
export const CLASSIFICATION_RGB: Readonly<Record<Exclude<Classification, "unset">, readonly [number, number, number]>> = {
  green: [0.03, 0.97, 0.03],
  blue: [0.03, 0.03, 0.97],
  red: [0.97, 0.03, 0.03],
  yellow: [0.97, 0.97, 0.03],
};

/** Fill RGB for the `Z_Sticker` circle when the brown sticker is set (else white). */
export const STICKER_RGB: readonly [number, number, number] = [0.937, 0.463, 0.129];

/** White — the "off"/unset circle fill (invisible against the page). */
export const WHITE_RGB: readonly [number, number, number] = [1, 1, 1];

/**
 * The on-page "imitation checkbox" text fields that show an "X" for the chosen
 * classification colour (the `Classification` `/AA /F` script sets the matching
 * one to "X" and the rest to " "). `Q_Brown` is the brown-sticker tick.
 */
export const Q_BOX: Readonly<Record<Exclude<Classification, "unset">, string>> = {
  green: "Q_Green",
  blue: "Q_Blue",
  red: "Q_Red",
  yellow: "Q_Yellow",
};
export const Q_BROWN = "Q_Brown";

/**
 * Swap-to-print (design Flow 3): primaryPlayer is a pointer, not data movement.
 * When it points at slot B, the printed D_ twins show the other slot's value
 * (B prints first) while the editable /V fields stay in canonical A/B slots so
 * re-import is unaffected. Maps each player field → the slot feeding its D_ twin.
 */
export const PLAYER_SWAP: Readonly<Record<string, string>> = {
  PlayerName_A: "PlayerName_B",
  PlayerName_B: "PlayerName_A",
  PlayerNo_A: "PlayerNo_B",
  PlayerNo_B: "PlayerNo_A",
};

/** Custom Info-dict key + hidden-field name carrying our app-state stamp. */
export const STAMP_INFO_KEY = "ABFCardState";
export const STAMP_FIELD = "ABF_AppState";

// ---------------------------------------------------------------------------
// Import direction (M2). The inverse of the export maps above.
// ---------------------------------------------------------------------------

/** Reverse of CLASSIFICATION_LITERAL: the form's Classification text → our enum. */
export const CLASSIFICATION_BY_LITERAL: Readonly<Record<string, Classification>> = Object.fromEntries(
  Object.entries(CLASSIFICATION_LITERAL).map(([cls, literal]) => [literal, cls as Classification]),
);

/**
 * Blank sentinels that occur on CURRENT editable fields. The blank template
 * parks `^ ` in 231 fields and a lone space in the four "Other/More" overflow
 * inputs; our own export writes a true empty string. These three are the only
 * blanks that ever sit on a native field, so they normalise to "" universally.
 * (`^ ` is also covered after normalizeFieldValue strips the leading guard caret,
 * leaving a lone space; it stays listed here so blanks survive even if that strip
 * is ever removed.)
 */
export const NATIVE_EMPTY_VALUES: ReadonlySet<string> = new Set(["", " ", "^ "]);

/**
 * The wider sentinel set the form's *retired-field migration* uses (gFaRFs in
 * abf/extracted/beautified_1_block37.js iterates gOfPH — the OLD placeholder
 * map — and blanks these). Crucially the original applies them ONLY to retired
 * fields, never to current editable ones: `!+`, `!-`, `!=`, `!n` and a lone
 * space-run are meaningful rich-code / user content on a live field. So these
 * extra entries apply ONLY to renamed legacy aliases, not native fields.
 */
export const LEGACY_EMPTY_VALUES: ReadonlySet<string> = new Set([
  ...NATIVE_EMPTY_VALUES,
  "  ",
  "!n ",
  "!= ",
  "!+",
  "!+ ",
  "!-",
  "!- ",
]);

/**
 * Normalise a raw imported /V to "" when it is a blank sentinel. A native
 * (un-renamed) field only ever blanks to "", " ", or "^ " in the real form, so
 * for those we must NOT strip legacy-migration sentinels like "!+" / "!- " —
 * they are legitimate values a current field can hold and must round-trip.
 *
 * First, strip a leading '^': it is the form's leading-space GUARD, never
 * content. AcroForm trims a value's leading whitespace, so the form prepends '^'
 * whenever a value would start with a space and strips it back off on read
 * (clean_0_block36.js:1353/1375, clean_2_block20.js:613/777; documented
 * "cosmetic, nothing to worry about" in the usage guide p.28). We are that
 * reader here: skipping the strip leaks the caret into the model, the on-screen
 * render (a bare '^' is literal text — only `!^` is the superscript code), and
 * the /V we re-export, where Acrobat then quietly drops it on the next refresh.
 */
export function normalizeFieldValue(raw: string, native: boolean): string {
  const unguarded = raw.startsWith("^") ? raw.slice(1) : raw;
  const set = native ? NATIVE_EMPTY_VALUES : LEGACY_EMPTY_VALUES;
  return set.has(unguarded) ? "" : unguarded;
}

/**
 * A handful of machinery fields present on every ABF card (and on no ordinary
 * PDF). Used to reject "this isn't an ABF System Card" before producing a card
 * full of empty defaults from an unrelated form.
 */
export const ABF_SIGNATURE_FIELDS: readonly string[] = [
  "My_Options",
  "My_CheckBoxValues",
  "Classification",
  "BasicSystem",
];
