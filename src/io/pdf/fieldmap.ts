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
