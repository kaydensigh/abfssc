// Pure model → PDF field mapping constants for export. No pdf-lib here; the
// adapter and orchestrator consume these. Every fact is grounded in the live
// ABF_Card_FORM.pdf (probed against the shipped asset) and the form's own JS.

import type { CheckboxStyle, Classification } from "../../model/index.ts";

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

/**
 * Five "Other/More" fields exist as editable inputs but have NO D_ print twin:
 * the form merges each into a parent's display (gRtFL merge rules — the source
 * `…Other>Parent` pairs). On export we write the child's own /V (so our import
 * round-trips it) AND append its rendered content to the parent's D_ appearance
 * so it prints. Keyed child → parent. (Resp1NT2COther is not in our model.)
 */
export const ORPHAN_MERGE: Readonly<Record<string, string>> = {
  JumpRaiseMinorOther: "JumpRaiseMinor",
  JumpRaiseMajorOther: "JumpRaiseMajor",
  UnusualNTOther: "UnusualNoTrump",
  Over1NTInterfMore: "Over1NTInterf",
};

/** Reverse of ORPHAN_MERGE: parent display field → the child merged into it. */
export const MERGE_CHILD: Readonly<Record<string, string>> = Object.fromEntries(
  Object.entries(ORPHAN_MERGE).map(([child, parent]) => [parent, child]),
);

/**
 * The "on" glyph for each tick style. The form's default `My_CheckBoxValues`
 * is the Helvetica letter "X" (Big-X). The other three presets are dingbats
 * (rendered via ZapfDingbats, already in the form's /DR). `dingbat:false` →
 * Helvetica-Bold; `dingbat:true` → ZapfDingbats with a Helvetica-"X" fallback.
 */
export const CHECKBOX_GLYPH: Readonly<Record<CheckboxStyle, { char: string; dingbat: boolean }>> = {
  bigX: { char: "X", dingbat: false },
  cross: { char: "✗", dingbat: true }, // ✗
  tick: { char: "✔", dingbat: true }, // ✔
  smallBlack: { char: "■", dingbat: true }, // ■
};

/** Editable-field "on"/"off" values the form cycles a checkbox through. */
export const CHECKBOX_ON = "Yes";
export const CHECKBOX_OFF = "Off";

/** The front-cover button mirrors for classification + brown sticker. */
export const Z_MY_CLASS = "Z_MyClass";
export const Z_STICKER = "Z_Sticker";

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
 */
export function normalizeFieldValue(raw: string, native: boolean): string {
  const set = native ? NATIVE_EMPTY_VALUES : LEGACY_EMPTY_VALUES;
  return set.has(raw) ? "" : raw;
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
