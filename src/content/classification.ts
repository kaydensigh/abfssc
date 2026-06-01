// System classification. The form stores the colour but deliberately NOT what
// Green/Blue/Red/Yellow regulate — those defer to "the latest national
// Regulations" (card-content-model §"Decisions"). So we model the colour and
// link out, rather than hard-coding semantics that drift.

export type Classification = "green" | "blue" | "red" | "yellow" | "unset";

export interface ClassificationOption {
  value: Exclude<Classification, "unset">;
  label: string;
  /** Swatch colour for the radio control. */
  swatch: string;
}

export const CLASSIFICATIONS: readonly ClassificationOption[] = [
  { value: "green", label: "Green", swatch: "#1f7a4d" },
  { value: "blue", label: "Blue", swatch: "#2d4a7c" },
  { value: "red", label: "Red", swatch: "#c2152e" },
  { value: "yellow", label: "Yellow", swatch: "#d6a400" },
];

// Out-of-file by design: the colour semantics live in the ABF's current system
// regulations. Link there rather than embedding a snapshot. (Deep path may move;
// confirm against abf.com.au when revisiting.)
export const ABF_REGULATIONS_URL = "https://www.abf.com.au/";
export const ABF_REGULATIONS_LABEL = "current ABF system regulations";
