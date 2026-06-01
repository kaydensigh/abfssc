import type { Classification } from "../content/classification.ts";

export type { Classification };

/** Raw !-code source the user typed; the rendered form is DERIVED, never stored. */
export type CodedText = string;

/** The ten opening bids that head the §8 response grid (the bare Resp<x> rows). */
export type SuitOpening = "1C" | "1D" | "1H" | "1S" | "1NT" | "2C" | "2D" | "2H" | "2S" | "2NT";

/**
 * §8 response columns. "General" is the per-row "general approach" cell (the
 * bare `Resp<opening>` field, a distinct logical field, not a bid). "Other" is
 * the catch-all. The rest are response bids in bridge order.
 */
export type ResponseBid =
  | "General"
  | "1D"
  | "1H"
  | "1S"
  | "1NT"
  | "2C"
  | "2D"
  | "2H"
  | "2S"
  | "2NT"
  | "3C"
  | "3D"
  | "3H"
  | "3S"
  | "3NT"
  | "4C"
  | "4D"
  | "4H"
  | "4S"
  | "Other";

/** The §8 grid is RAGGED — only the cells that exist for an opening are present. */
export type ResponsesGrid = Partial<Record<SuitOpening, Partial<Record<ResponseBid, CodedText>>>>;

/** The ten boolean agreements (text "imitation checkboxes" in the PDF). */
export interface CardFlags {
  IsBlackwood: boolean;
  IsGerber: boolean;
  IsAskingBids: boolean;
  IsCueBids: boolean;
  IsNTCheckback: boolean;
  IsCanape: boolean;
  IsBrownSticker: boolean;
  Is4thForcing1Round: boolean;
  Is4thForcingGame: boolean;
  OneNTMayHave5Major: boolean;
}

export const FLAG_KEYS: readonly (keyof CardFlags)[] = [
  "IsBlackwood",
  "IsGerber",
  "IsAskingBids",
  "IsCueBids",
  "IsNTCheckback",
  "IsCanape",
  "IsBrownSticker",
  "Is4thForcing1Round",
  "Is4thForcingGame",
  "OneNTMayHave5Major",
];

export type CheckboxStyle = "bigX" | "smallBlack" | "tick" | "cross";

/** Display preferences — separate from card content. */
export interface CardSettings {
  /** Render suit glyphs with their natural colours (♥♦ red, ♠♣ black). */
  suitColours: boolean;
  /** Tick glyph written into the PDF "checkbox" text fields (M1 export). */
  checkboxStyle: CheckboxStyle;
  /** Whether the full rich language renders ("basic" existed only for old readers). */
  richness: "rich" | "basic";
  dateFormat: "iso";
}

export interface Revision {
  /** User-facing version label (coded text). */
  label: CodedText;
  /** Monotonic counter — replaces the original's I_LastSave ordering. */
  counter: number;
  /** Counter this revision descends from (distinguishes succession from a fork). */
  parent?: number;
}

/** Schema shape of OUR persisted model. Bump only when the shape changes. */
export const SCHEMA_VERSION = 1;

/**
 * The single typed source of truth. The on-screen card and (in M1) the exported
 * PDF are both projections of this. Rich rendering is derived, never stored.
 */
export interface Card {
  /** Stable UUID v4 — plan identity; never changes through edits / round-trips. */
  id: string;
  /** Which shape of our model this is (migration gate). */
  schemaVersion: number;
  revision: Revision;
  /** ISO timestamp + schema; NO identity / viewer / OS leak (privacy win). */
  provenance: { schemaVersion: number; savedAt: string };

  /** Which player slot prints first; swap = a pointer flip, no data movement. */
  primaryPlayer: 0 | 1;
  classification: Classification;
  flags: CardFlags;

  /**
   * Flat map of every scalar logical field, keyed by its canonical name
   * (Open1C, Doubles_1, PlayerName_A, OtherNotes_0, …). One value per field;
   * the D_/B_/V_/… PDF machinery is dropped.
   */
  fields: Record<string, CodedText>;

  /** §8 grid as a nested partial map. */
  responses: ResponsesGrid;

  settings: CardSettings;
}

export const DEFAULT_SETTINGS: CardSettings = {
  suitColours: true,
  checkboxStyle: "bigX",
  richness: "rich",
  dateFormat: "iso",
};
