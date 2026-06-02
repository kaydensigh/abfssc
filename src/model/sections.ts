import { hasCodeList } from "../content/codelists.ts";

// The regulated card, section by section. The UI is data-driven from this
// registry: a generic renderer walks each section's fields and picks a control
// by `kind`. Sections that need bespoke layout carry a `layout` discriminator
// (the masthead, the §8 response blocks, the §5 vs-NT/vs-suit pairing).
//
// Field keys are the canonical names from abf/extracted/field_names.txt and are
// also the keys of Card.fields (text fields) or Card.flags (checkboxes).
//
// Field ORDER and `span` reproduce the printed PDF layout (recovered from the
// form's AcroForm rectangles — see abf/extracted/field_geometry.txt). Fields
// flow left→right across a 12-column grid: `span` is how many of the 12 columns
// the field (label + control) occupies, so two `span:6` fields share a row, a
// `span:8` + `span:4` make an uneven split, and `span:12` is a full row. On
// mobile every field collapses to the full width. The §5 vs-suit/vs-notrump
// leads use the bespoke PlayPairs layout. `group` inserts a sub-heading before a
// run of like-grouped fields; groups named in `boxedGroups` are drawn inside a
// bordered box (the PDF's "1NT Responses" / "Defence to strong" panels).

export type FieldKind = "rich" | "coded" | "notes" | "player" | "checkbox";

export interface FieldDef {
  key: string;
  label: string;
  /** Omitted → resolved as "coded" when the field ships a code list, else "rich". */
  kind?: FieldKind;
  multiline?: boolean;
  /** Columns (1..12) the field spans on desktop. Omitted → 12 (full row). */
  span?: number;
  /** Render the label visually-hidden (kept for a11y) — for the PDF's unlabelled boxes. */
  labelHidden?: boolean;
  /** Optional sub-heading rendered once before a run of fields sharing this label. */
  group?: string;
  /**
   * The form's own per-field guidance (the PDF tooltip question / faint in-field
   * hint). Retained as reference data extracted from the original card, but no
   * longer surfaced in the UI — the on-screen card mirrors the printed card's
   * clean blank boxes (the in-field hint text was removed by request).
   */
  hint?: string;
}

/** A vs-NT / vs-suit field pair for the §5 two-column layout. */
export interface FieldPair {
  label: string;
  ntKey: string;
  sKey: string;
  /** Optional sub-heading rendered once before a run of pairs sharing this label. */
  group?: string;
  /** Faint in-row hint after the label (the PDF's "Sequences:" / "on … lead:"). */
  note?: string;
}

export type SectionLayout = "generic" | "masthead" | "grid" | "playPairs";

export interface SectionDef {
  id: string;
  /** 1..10 for the regulated sections; absent for the masthead. */
  number?: number;
  title: string;
  /** Faint caption under the title — the PDF's instruction line for the section. */
  caption?: string;
  layout: SectionLayout;
  /** Fields rendered generically (and enumerated by the empty-card factory). */
  fields: FieldDef[];
  /** Group names (see FieldDef.group) drawn inside a bordered box. */
  boxedGroups?: readonly string[];
  /** §5 only: the vs-NT/vs-suit pairs rendered side by side. */
  pairs?: FieldPair[];
}

/** Resolve a field's control kind (code list presence decides "coded"). */
export function fieldKind(def: FieldDef): FieldKind {
  return def.kind ?? (hasCodeList(def.key) ? "coded" : "rich");
}

/** Resolve a field's desktop column span (1..12, defaults to a full 12-col row). */
export function fieldSpan(def: FieldDef): number {
  return def.span ?? 12;
}

type Extra = Omit<FieldDef, "key" | "label">;
const f = (key: string, label: string, extra: Extra = {}): FieldDef => ({ key, label, ...extra });
const notes = (key: string, label: string, extra: Extra = {}): FieldDef => ({
  key,
  label,
  kind: "notes",
  multiline: true,
  ...extra,
});
const cb = (key: string, label: string, extra: Extra = {}): FieldDef => ({ key, label, kind: "checkbox", ...extra });
const half: Extra = { span: 6 };

export const SECTIONS: readonly SectionDef[] = [
  {
    id: "masthead",
    title: "Standard System Card",
    caption: "Australian Bridge Federation Ltd.",
    layout: "masthead",
    // PDF front cover: "ABF Nos." / "& Names:" each a row of [number][name] for a
    // partner, Basic System, and the Classification row. The player fields' own
    // labels are hidden — the row labels ("ABF Nos." / "& Names:") name them.
    fields: [
      f("PlayerNo_A", "ABF no. (you)", { kind: "player", labelHidden: true, hint: "Your ABF number" }),
      f("PlayerName_A", "Name (you)", { kind: "player", labelHidden: true, hint: "Your name" }),
      f("PlayerNo_B", "ABF no. (partner)", { kind: "player", labelHidden: true, hint: "Partner's ABF number" }),
      f("PlayerName_B", "Name (partner)", { kind: "player", labelHidden: true, hint: "Partner's name" }),
      f("BasicSystem", "Basic System"),
      f("Date_A", "MyRev.", { span: 6, hint: "Optional revision code — date or version number" }),
      cb("IsBrownSticker", "Brown Sticker"),
      cb("IsCanape", "Canapé"),
    ],
  },
  {
    id: "s1",
    number: 1,
    title: "Opening Bids",
    caption: "Describe strength, min.length, or specific meaning",
    layout: "generic",
    boxedGroups: ["1NT Responses"],
    // PDF rows: 1♣|1♥, 1♦|1♠, 1NT (+ "may contain 5 card Major"), the boxed
    // "1NT Responses" block, then 2♣/2♦/2♥/2♠ (full), 2NT|3NT, other.
    fields: [
      f("Open1C", "1♣", half),
      f("Open1H", "1♥", half),
      f("Open1D", "1♦", half),
      f("Open1S", "1♠", half),
      f("Open1NT", "1NT", { span: 8 }),
      cb("OneNTMayHave5Major", "may contain 5 card Major", { span: 4 }),
      f("Resp1NT2CStyle", "2♣", { group: "1NT Responses" }),
      f("Resp1NT2D", "2♦", { span: 6, group: "1NT Responses" }),
      f("Resp1NT2S", "2♠", { span: 6, group: "1NT Responses" }),
      f("Resp1NT2H", "2♥", { span: 6, group: "1NT Responses" }),
      f("Resp1NT2NT", "2NT", { span: 6, group: "1NT Responses" }),
      f("Resp1NTDoubled", "(Dbl)", { span: 6, group: "1NT Responses" }),
      f("Resp1NTOther", "other", { span: 6, group: "1NT Responses", hint: "Add notes about responses to 1NT" }),
      f("Open2C", "2♣"),
      f("Open2D", "2♦"),
      f("Open2H", "2♥"),
      f("Open2S", "2♠"),
      f("Open2NT", "2NT", half),
      f("Open3NT", "3NT", half),
      f("OpenOther", "other", { hint: "Describe your other opening bids" }),
    ],
  },
  {
    id: "s2",
    number: 2,
    title: "Pre-Alerts",
    layout: "generic",
    // PDF: a summary line over a 2-col × 3-row grid of unlabelled boxes.
    fields: [
      notes("PreAlert_0", "Pre-alerts", { labelHidden: true, hint: "Describe your pre-alerts" }),
      f("PreAlert_1_1", "Pre-alert 1", { span: 6, labelHidden: true, hint: "Pre-alert" }),
      f("PreAlert_2_1", "Pre-alert 4", { span: 6, labelHidden: true, hint: "Pre-alert" }),
      f("PreAlert_1_2", "Pre-alert 2", { span: 6, labelHidden: true, hint: "Pre-alert" }),
      f("PreAlert_2_2", "Pre-alert 5", { span: 6, labelHidden: true, hint: "Pre-alert" }),
      f("PreAlert_1_3", "Pre-alert 3", { span: 6, labelHidden: true, hint: "Pre-alert" }),
      f("PreAlert_2_3", "Pre-alert 6", { span: 6, labelHidden: true, hint: "Pre-alert" }),
    ],
  },
  {
    id: "s3",
    number: 3,
    title: "Competitive Bids / Overcalls",
    layout: "generic",
    // PDF printed-row order. "Negative/Responsive DBL thru" are narrow bid-level
    // fields in the right column; the cue / 1NT-overcall rows pair left|right.
    fields: [
      f("Doubles_1", "Doubles", { span: 8, hint: "Other doubles and redoubles" }),
      f("NegXLimit", "Negative DBL thru", { span: 4, hint: "Highest bid where your double is negative (not for penalties)" }),
      f("Doubles_2", "Other doubles & redoubles", { span: 8, hint: "e.g. support doubles and redoubles" }),
      f("RespXLimit", "Responsive DBL thru", { span: 4, hint: "Highest bid where your double is responsive (not for penalties)" }),
      f("JumpOvercall", "Jump overcalls", half),
      f("UnusualNT", "Unusual NT", half),
      f("Overcall1NT", "1NT overcall: (immediate)", half),
      f("Reopen1NT", "(re-opening)", half),
      f("ImmedCueMinor", "Immediate cue: (minor)", half),
      f("ImmedCueMajor", "(Major)", half),
      f("CompeteWeak2", "Over: Weak Twos", { span: 6, hint: "How do you compete over natural weak 2 openings?" }),
      f("CompeteOpen3", "Opening Threes", { span: 6, hint: "How do you compete over 3-level openings?" }),
      f("Transfers_1", "Opponent's transfers", { hint: "i.e. over opponent's transfer bids" }),
      f("Compete1NT_1", "Opponent's 1NT", { hint: "How do you compete over their 1NT opening?" }),
      f("Compete1NT_2", "Opponent's 1NT (continued)", { hint: "How do you compete over their 1NT opening?" }),
      f("Compete1NT_3", "Opponent's 1NT (more)", { hint: "How do you compete over their 1NT opening?" }),
      notes("Competitive_0", "Notes"),
    ],
  },
  {
    id: "s4",
    number: 4,
    title: "Basic Responses",
    layout: "generic",
    // PDF: six full-width rows. The "…Other" overflow fields (merged into their
    // parent's print appearance) follow as extra space, then the notes.
    fields: [
      f("JumpRaiseMinor", "Jump raises - minors"),
      f("JumpRaiseMajor", "Jump raises - Majors"),
      f("MinorJumpShift", "Jump shifts after minor opening"),
      f("MajorJumpShift", "Jump shifts after Major opening"),
      f("ResponseStrong2", "Responses to strong 2 suit open.", { hint: "Responses to any strong 2-level suit opening in your system" }),
      f("Response2NT", "Responses to 2NT opening", { hint: "Describe responses to your opening 2NT bid" }),
      f("JumpRaiseMinorOther", "Jump raises - minors (more)", { hint: "More space for your minor-suit jump raise" }),
      f("JumpRaiseMajorOther", "Jump raises - Majors (more)", { hint: "More space for your major-suit jump raise" }),
      notes("BasicResponses_0", "Notes"),
    ],
  },
  {
    id: "s5",
    number: 5,
    title: "Play Conventions",
    layout: "playPairs",
    // PDF columns: Show priorities | Versus Suit (or both) | Versus NoTrump
    // (if different). The lead agreements are grouped under "Leads".
    pairs: [
      { label: "Sequences:", group: "Leads", ntKey: "SeqLead_NT", sKey: "SeqLead_S" },
      { label: "Four or more with an honour", group: "Leads", ntKey: "FourHonourLead_NT", sKey: "FourHonourLead_S" },
      { label: "From 4 small", group: "Leads", ntKey: "FourSmallLead_NT", sKey: "FourSmallLead_S" },
      { label: "From 3 cards (no honour)", group: "Leads", ntKey: "ThreeSmallLead_NT", sKey: "ThreeSmallLead_S" },
      { label: "In partner's suit", group: "Leads", ntKey: "LeadPartnersSuit_NT", sKey: "LeadPartnersSuit_S" },
      { label: "Discards", ntKey: "DiscardType_NT", sKey: "DiscardType_S" },
      { label: "Count", ntKey: "CountType_NT", sKey: "CountType_S" },
      { label: "Signal", note: "on partner's lead:", ntKey: "SignalPartnerLead_NT", sKey: "SignalPartnerLead_S" },
    ],
    fields: [
      f("SignalDeclarerLead", "Signal on declarer's lead:"),
      notes("PlayConventions_0", "Notes"),
      notes("PlayNotes_1", "Play notes 1"),
      notes("PlayNotes_2", "Play notes 2"),
      notes("PlayNotes_3", "Play notes 3"),
    ],
  },
  {
    id: "s6",
    number: 6,
    title: "Slam Conventions",
    layout: "generic",
    // PDF: 4♣ Gerber ☐ {when}; 4NT: Blackwood ☐ RKCB; Asking Bids ☐ Cue Bids ☐.
    fields: [
      cb("IsGerber", "4♣ Gerber", half),
      f("GerberWhen", "Gerber applies when", { span: 6, hint: "When is Gerber used?" }),
      cb("IsBlackwood", "4NT: Blackwood", half),
      f("RKCBStyle", "RKCB", half),
      f("FourNTOther", "Other 4NT meanings", { hint: "4NT other meanings?" }),
      cb("IsAskingBids", "Asking Bids", half),
      cb("IsCueBids", "Cue Bids", half),
      notes("SlamNotes_1", "Slam notes 1"),
      notes("SlamNotes_2", "Slam notes 2"),
      notes("SlamNotes_3", "Slam notes 3"),
    ],
  },
  {
    id: "s7",
    number: 7,
    title: "Other Conventions",
    layout: "generic",
    // PDF: a 2-col × 5-row grid of unlabelled boxes plus overflow notes.
    fields: [
      f("Other_1_1", "Convention 1", { span: 6, labelHidden: true, hint: "Space for other conventions" }),
      f("Other_2_1", "Convention 6", { span: 6, labelHidden: true, hint: "Space for other conventions" }),
      f("Other_1_2", "Convention 2", { span: 6, labelHidden: true, hint: "Space for other conventions" }),
      f("Other_2_2", "Convention 7", { span: 6, labelHidden: true, hint: "Space for other conventions" }),
      f("Other_1_3", "Convention 3", { span: 6, labelHidden: true, hint: "Space for other conventions" }),
      f("Other_2_3", "Convention 8", { span: 6, labelHidden: true, hint: "Space for other conventions" }),
      f("Other_1_4", "Convention 4", { span: 6, labelHidden: true, hint: "Space for other conventions" }),
      f("Other_2_4", "Convention 9", { span: 6, labelHidden: true, hint: "Space for other conventions" }),
      f("Other_1_5", "Convention 5", { span: 6, labelHidden: true, hint: "Space for other conventions" }),
      f("Other_2_5", "Convention 10", { span: 6, labelHidden: true, hint: "Space for other conventions" }),
      notes("Other_0", "Notes"),
    ],
  },
  {
    id: "s8",
    number: 8,
    title: "Responses to Opening Bids",
    caption: "Describe strength, minimum length, or specific meaning",
    layout: "grid",
    // The per-opening response blocks are rendered above; the only fields are the
    // closing notes (the 2-level 1NT responses live in §1, strong-two in §4).
    fields: [
      notes("ResponseNotes_1", "Notes", { group: "Notes", hint: "Space for more notes about responses" }),
      notes("ResponseNotes_2", "Notes (continued)", { group: "Notes" }),
      notes("ResponseNotes_3", "Notes (more)", { group: "Notes" }),
    ],
  },
  {
    id: "s9",
    number: 9,
    title: "Conventions",
    layout: "generic",
    boxedGroups: ["Defence to strong 1♣ / 2♣"],
    fields: [
      f("UnusualNoTrump", "Unusual NT:"),
      f("UnusualNTOther", "Unusual NT — more", { hint: "More space for your unusual NT methods" }),
      cb("Is4thForcing1Round", "One round", { span: 6, group: "4th Suit Forcing" }),
      cb("Is4thForcingGame", "Game force", { span: 6, group: "4th Suit Forcing" }),
      f("FourthSuitForcing", "Notes", { group: "4th Suit Forcing", hint: "Additional notes on your use of 4th suit forcing" }),
      cb("IsNTCheckback", "NT Checkback", { span: 5 }),
      f("CheckbackPriorities", "Priorities:", { span: 7, hint: "Priority sequence for checkback replies (e.g. 2-way Checkback, NMF, XYZ)" }),
      f("Defence3NT", "Defence to 3NT opening", { hint: "How do you bid after an opponent opens 3NT?" }),
      f("DefenceOpening2", "Defence to Opening Twos", { hint: "Common notes on your defences to opening two bids" }),
      f("DefenceMulti", "Multi 2♦", { hint: "Describe your defence to multi-two opening bids" }),
      f("DefenceRCO", "RCO style 2-s", { hint: "Defence to unanchored two-level openings (R=Rank C=Colour O=Odd)" }),
      f("DefenceOtherTwos", "Other 2-s", { hint: "Describe your defence to other two-level opening bids" }),
      f("DefenceStrongC_1", "(1♣) :", { group: "Defence to strong 1♣ / 2♣", hint: "Replace with your defence to strong 1♣ openings" }),
      f("DefenceStrongC_2", "(1♣) — more", { group: "Defence to strong 1♣ / 2♣", hint: "More space for your defence to strong 1♣" }),
      f("DefenceStrongC_3", "(2♣) :", { group: "Defence to strong 1♣ / 2♣", hint: "Your defence to strong 2♣ openings" }),
      f("DefenceStrongC_4", "(2♣) — more", { group: "Defence to strong 1♣ / 2♣", hint: "More space for your defence to strong 2♣" }),
      f("Over1NTInterf", "Over 1NT Interference"),
      f("Over1NTInterfMore", "Over 1NT Interference — more", { hint: "More space for methods after interference over your 1NT" }),
      f("LebensohlOther", "Lebensohl - other uses", { hint: "Other uses of lebensohl (e.g. vs 2-level openings)" }),
      f("TakeOutOf4C4D", "Take out of 4 level pre-empts — 4♣/4♦", { hint: "Takeout after a 4-minor opening (e.g. DBL and/or 4NT)" }),
      f("TakeOutOf4H", "4♥", { span: 6, hint: "Takeout after 4♥ (e.g. DBL and/or 4NT)" }),
      f("TakeOutOf4S", "4♠", { span: 6, hint: "Takeout after 4♠ (e.g. DBL and/or 4NT)" }),
      notes("Conventions_0", "Notes"),
    ],
  },
  {
    id: "s10",
    number: 10,
    title: "Other Notes",
    layout: "generic",
    fields: [
      notes("OtherNotes_0", "Notes", { hint: "Space for other notes (e.g. define abbreviations used on this side of the card)" }),
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
