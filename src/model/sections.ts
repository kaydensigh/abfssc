import { hasCodeList } from "../content/codelists.ts";

// The regulated card, section by section. The UI is data-driven from this
// registry: a generic renderer walks each section's fields and picks a control
// by `kind`. Sections that need bespoke layout carry a `layout` discriminator
// (the masthead, the §8 grid, the §5 vs-NT/vs-suit pairing).
//
// Field keys are the canonical names from abf/extracted/field_names.txt and are
// also the keys of Card.fields (text fields) or Card.flags (checkboxes).
//
// Field ORDER and `width` reproduce the printed PDF layout (recovered from the
// form's AcroForm rectangles): a `half` field shares a desktop row with the next
// `half` (the card's side-by-side pairings — 1♣|1♥, the §7 two-column grid); a
// `full` field spans the row. On mobile every field stacks to one column. The §5
// vs-suit/vs-notrump leads are NOT `width` pairs — they use the bespoke PlayPairs
// layout. `group` inserts a sub-heading before a run of like-grouped fields (used
// by §8 to separate the 1NT / strong-two response blocks).

export type FieldKind = "rich" | "coded" | "notes" | "player" | "checkbox";
export type FieldWidth = "full" | "half";

export interface FieldDef {
  key: string;
  label: string;
  /** Omitted → resolved as "coded" when the field ships a code list, else "rich". */
  kind?: FieldKind;
  multiline?: boolean;
  /** Desktop column span. Omitted → "full" (single column, always safe on mobile). */
  width?: FieldWidth;
  /** Optional sub-heading rendered once before a run of fields sharing this label. */
  group?: string;
}

/** A vs-NT / vs-suit field pair for the §5 two-column layout. */
export interface FieldPair {
  label: string;
  ntKey: string;
  sKey: string;
}

export type SectionLayout = "generic" | "masthead" | "grid" | "playPairs";

export interface SectionDef {
  id: string;
  /** 1..10 for the regulated sections; absent for the masthead. */
  number?: number;
  title: string;
  layout: SectionLayout;
  /** Fields rendered generically (and enumerated by the empty-card factory). */
  fields: FieldDef[];
  /** §5 only: the vs-NT/vs-suit pairs rendered side by side. */
  pairs?: FieldPair[];
}

/** Resolve a field's control kind (code list presence decides "coded"). */
export function fieldKind(def: FieldDef): FieldKind {
  return def.kind ?? (hasCodeList(def.key) ? "coded" : "rich");
}

/** Resolve a field's desktop column span (defaults to full-width). */
export function fieldWidth(def: FieldDef): FieldWidth {
  return def.width ?? "full";
}

type Extra = Omit<FieldDef, "key" | "label">;
const f = (key: string, label: string, extra: Extra = {}): FieldDef => ({ key, label, ...extra });
const notes = (key: string, label: string, extra: Extra = {}): FieldDef => ({
  key,
  label,
  kind: "notes",
  multiline: true,
  width: "full",
  ...extra,
});
const cb = (key: string, label: string, extra: Extra = {}): FieldDef => ({ key, label, kind: "checkbox", ...extra });
const half: Extra = { width: "half" };

export const SECTIONS: readonly SectionDef[] = [
  {
    id: "masthead",
    title: "Players & system",
    layout: "masthead",
    fields: [
      f("PlayerNo_A", "Player A — no.", { kind: "player", width: "half" }),
      f("PlayerName_A", "Player A — name", { kind: "player", width: "half" }),
      f("PlayerNo_B", "Player B — no.", { kind: "player", width: "half" }),
      f("PlayerName_B", "Player B — name", { kind: "player", width: "half" }),
      f("BasicSystem", "Basic system"),
      f("Date_A", "Revision / date"),
      cb("OneNTMayHave5Major", "1NT may contain a 5-card major"),
      cb("IsCanape", "Canapé style"),
      cb("IsBrownSticker", "Brown sticker convention(s)"),
    ],
  },
  {
    id: "s1",
    number: 1,
    title: "Opening bids",
    layout: "generic",
    // PDF rows: 1♣|1♥, 1♦|1♠, 1NT full, 2♣/2♦/2♥/2♠ full, 2NT|3NT, Other full.
    fields: [
      f("Open1C", "1♣", half),
      f("Open1H", "1♥", half),
      f("Open1D", "1♦", half),
      f("Open1S", "1♠", half),
      f("Open1NT", "1NT"),
      f("Open2C", "2♣"),
      f("Open2D", "2♦"),
      f("Open2H", "2♥"),
      f("Open2S", "2♠"),
      f("Open2NT", "2NT", half),
      f("Open3NT", "3NT", half),
      f("OpenOther", "Other openings"),
    ],
  },
  {
    id: "s2",
    number: 2,
    title: "Pre-alerts",
    layout: "generic",
    // PDF: a summary line over a 2-col × 3-row grid (left = _1_n, right = _2_n).
    fields: [
      notes("PreAlert_0", "Pre-alert summary"),
      f("PreAlert_1_1", "Pre-alert 1", half),
      f("PreAlert_2_1", "Pre-alert 4", half),
      f("PreAlert_1_2", "Pre-alert 2", half),
      f("PreAlert_2_2", "Pre-alert 5", half),
      f("PreAlert_1_3", "Pre-alert 3", half),
      f("PreAlert_2_3", "Pre-alert 6", half),
    ],
  },
  {
    id: "s3",
    number: 3,
    title: "Competitive bids & overcalls",
    layout: "generic",
    // Reordered into PDF printed-row order (sections.ts previously grouped by topic).
    fields: [
      notes("Competitive_0", "Notes"),
      f("Doubles_1", "Doubles & redoubles", half),
      f("NegXLimit", "Neg. X limit", half),
      f("Doubles_2", "More doubles / redoubles"),
      f("JumpOvercall", "Jump overcall", half),
      f("UnusualNT", "Unusual notrump", half),
      f("Overcall1NT", "1NT overcall (direct)", half),
      f("Reopen1NT", "1NT overcall (re-opening)", half),
      f("ImmedCueMinor", "Cue of their minor", half),
      f("ImmedCueMajor", "Cue of their major", half),
      f("CompeteWeak2", "Defence to weak twos", half),
      f("CompeteOpen3", "Defence to three-openings", half),
      f("Transfers_1", "Over their transfers"),
      f("Compete1NT_1", "Defence to their 1NT (1)"),
      f("Compete1NT_2", "Defence to their 1NT (2)"),
      f("Compete1NT_3", "Defence to their 1NT (3)"),
      f("Over1NTInterf", "Over interference to our 1NT", half),
      f("Over1NTInterfMore", "Over interference — more", half),
    ],
  },
  {
    id: "s4",
    number: 4,
    title: "Basic responses",
    layout: "generic",
    fields: [
      notes("BasicResponses_0", "Notes"),
      f("JumpRaiseMinor", "Jump raise of a minor", half),
      f("JumpRaiseMinorOther", "Jump raise of a minor — other", half),
      f("JumpRaiseMajor", "Jump raise of a major", half),
      f("JumpRaiseMajorOther", "Jump raise of a major — other", half),
      f("MinorJumpShift", "Jump shift over a minor", half),
      f("MajorJumpShift", "Jump shift over a major", half),
    ],
  },
  {
    id: "s5",
    number: 5,
    title: "Play conventions — leads & carding",
    layout: "playPairs",
    // Pair order follows the printed card (discards before count; signal last).
    pairs: [
      { label: "Lead from a sequence", ntKey: "SeqLead_NT", sKey: "SeqLead_S" },
      { label: "Lead from 4+ to an honour", ntKey: "FourHonourLead_NT", sKey: "FourHonourLead_S" },
      { label: "Lead from four small", ntKey: "FourSmallLead_NT", sKey: "FourSmallLead_S" },
      { label: "Lead from three small", ntKey: "ThreeSmallLead_NT", sKey: "ThreeSmallLead_S" },
      { label: "Lead in partner's suit", ntKey: "LeadPartnersSuit_NT", sKey: "LeadPartnersSuit_S" },
      { label: "Discard signal", ntKey: "DiscardType_NT", sKey: "DiscardType_S" },
      { label: "Count signal", ntKey: "CountType_NT", sKey: "CountType_S" },
      { label: "Signal on partner's lead", ntKey: "SignalPartnerLead_NT", sKey: "SignalPartnerLead_S" },
    ],
    fields: [
      f("SignalDeclarerLead", "Signal when declarer leads"),
      notes("PlayConventions_0", "Notes"),
      notes("PlayNotes_1", "Play notes 1"),
      notes("PlayNotes_2", "Play notes 2"),
      notes("PlayNotes_3", "Play notes 3"),
    ],
  },
  {
    id: "s6",
    number: 6,
    title: "Slam conventions",
    layout: "generic",
    fields: [
      cb("IsBlackwood", "Blackwood", half),
      cb("IsGerber", "Gerber", half),
      cb("IsCueBids", "Cue bids", half),
      cb("IsAskingBids", "Asking bids", half),
      f("GerberWhen", "Gerber applies when"),
      f("RKCBStyle", "RKCB style", half),
      f("FourNTOther", "Other uses of 4NT", half),
      notes("SlamNotes_1", "Slam notes 1"),
      notes("SlamNotes_2", "Slam notes 2"),
      notes("SlamNotes_3", "Slam notes 3"),
    ],
  },
  {
    id: "s7",
    number: 7,
    title: "Other conventions",
    layout: "generic",
    // PDF: a summary note over a 2-col × 5-row grid (left = _1_n, right = _2_n).
    fields: [
      notes("Other_0", "Notes"),
      f("Other_1_1", "Convention 1", half),
      f("Other_2_1", "Convention 6", half),
      f("Other_1_2", "Convention 2", half),
      f("Other_2_2", "Convention 7", half),
      f("Other_1_3", "Convention 3", half),
      f("Other_2_3", "Convention 8", half),
      f("Other_1_4", "Convention 4", half),
      f("Other_2_4", "Convention 9", half),
      f("Other_1_5", "Convention 5", half),
      f("Other_2_5", "Convention 10", half),
    ],
  },
  {
    id: "s8",
    number: 8,
    title: "Responses to opening bids",
    layout: "grid",
    // The matrix is rendered above these; the coded fields fall into two PDF
    // blocks (responses to 1NT, then to strong twos / 2NT) plus the notes.
    fields: [
      f("Resp1NT2CStyle", "2♣ response to 1NT", { group: "Responses to 1NT" }),
      f("Resp1NT2D", "2♦ response to 1NT", { width: "half", group: "Responses to 1NT" }),
      f("Resp1NT2S", "2♠ response to 1NT", { width: "half", group: "Responses to 1NT" }),
      f("Resp1NT2H", "2♥ response to 1NT", { width: "half", group: "Responses to 1NT" }),
      f("Resp1NT2NT", "2NT response to 1NT", { width: "half", group: "Responses to 1NT" }),
      f("Resp1NTDoubled", "When our 1NT is doubled", { width: "half", group: "Responses to 1NT" }),
      f("Resp1NTOther", "Other responses to 1NT", { width: "half", group: "Responses to 1NT" }),
      f("ResponseStrong2", "Responses to a strong two", { group: "Responses to strong twos & 2NT" }),
      f("Response2NT", "Responses to 2NT (general)", { group: "Responses to strong twos & 2NT" }),
      f("RespXLimit", "Responsive double — upper limit", { width: "half", group: "Responses to strong twos & 2NT" }),
      notes("ResponseNotes_1", "Response notes 1", { group: "Notes" }),
      notes("ResponseNotes_2", "Response notes 2", { group: "Notes" }),
      notes("ResponseNotes_3", "Response notes 3", { group: "Notes" }),
    ],
  },
  {
    id: "s9",
    number: 9,
    title: "Conventions",
    layout: "generic",
    fields: [
      notes("Conventions_0", "Notes"),
      f("UnusualNoTrump", "Unusual notrump (detail)"),
      f("UnusualNTOther", "Unusual notrump — other"),
      f("FourthSuitForcing", "Fourth suit forcing"),
      cb("Is4thForcing1Round", "4SF — forcing one round", half),
      cb("Is4thForcingGame", "4SF — forcing to game", half),
      f("CheckbackPriorities", "Checkback priorities"),
      cb("IsNTCheckback", "NT checkback"),
      f("Defence3NT", "Defence to 3NT openings"),
      f("DefenceOpening2", "Defence to two-openings"),
      f("DefenceMulti", "Defence to Multi 2♦"),
      f("DefenceRCO", "Defence to RCO twos"),
      f("DefenceOtherTwos", "Defence to other twos"),
      f("DefenceStrongC_1", "Defence to strong ♣ (1)"),
      f("DefenceStrongC_2", "Defence to strong ♣ (2)"),
      f("DefenceStrongC_3", "Defence to strong ♣ (3)"),
      f("DefenceStrongC_4", "Defence to strong ♣ (4)"),
      f("LebensohlOther", "Lebensohl / other"),
      f("TakeOutOf4C4D", "Takeout of 4♣ / 4♦"),
      f("TakeOutOf4H", "Takeout of 4♥", half),
      f("TakeOutOf4S", "Takeout of 4♠", half),
    ],
  },
  {
    id: "s10",
    number: 10,
    title: "Other notes",
    layout: "generic",
    fields: [
      notes("OtherNotes_0", "Notes 1"),
      notes("OtherNotes_1", "Notes 2"),
      notes("OtherNotes_2", "Notes 3"),
      notes("OtherNotes_3", "Notes 4"),
      notes("OtherNotes_4", "Notes 5"),
      notes("OtherNotes_5", "Notes 6"),
      notes("OtherNotes_6", "Notes 7"),
      notes("OtherNotes_7", "Notes 8"),
      notes("MoreNotes_1", "More notes 1"),
      notes("MoreNotes_2", "More notes 2"),
      notes("MoreNotes_3", "More notes 3"),
      notes("MoreNotes_4", "More notes 4"),
    ],
  },
];

/** Every section that maps to a regulated number (1..10), plus the masthead first. */
export const SECTION_BY_ID: Readonly<Record<string, SectionDef>> = Object.fromEntries(
  SECTIONS.map((s) => [s.id, s]),
);

/**
 * All canonical keys of text fields (Card.fields). Excludes checkboxes (which
 * live in Card.flags) and the §8 grid (which lives in Card.responses), but
 * includes the §5 pair members. Used by the empty-card factory.
 */
export function allTextFieldKeys(): string[] {
  const keys: string[] = [];
  for (const s of SECTIONS) {
    for (const fd of s.fields) {
      if (fd.kind === "checkbox") continue;
      keys.push(fd.key);
    }
    if (s.pairs) {
      for (const p of s.pairs) keys.push(p.ntKey, p.sKey);
    }
  }
  return keys;
}
