import { hasCodeList } from "../content/codelists.ts";

// The regulated card, section by section. The UI is data-driven from this
// registry: a generic renderer walks each section's fields and picks a control
// by `kind`. Sections that need bespoke layout carry a `layout` discriminator
// (the masthead, the §8 grid, the §5 vs-NT/vs-suit pairing).
//
// Field keys are the canonical names from abf/extracted/field_names.txt and are
// also the keys of Card.fields (text fields) or Card.flags (checkboxes).

export type FieldKind = "rich" | "coded" | "notes" | "player" | "checkbox";

export interface FieldDef {
  key: string;
  label: string;
  /** Omitted → resolved as "coded" when the field ships a code list, else "rich". */
  kind?: FieldKind;
  multiline?: boolean;
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

const f = (key: string, label: string, extra: Omit<FieldDef, "key" | "label"> = {}): FieldDef => ({
  key,
  label,
  ...extra,
});
const notes = (key: string, label: string): FieldDef => ({ key, label, kind: "notes", multiline: true });
const cb = (key: string, label: string): FieldDef => ({ key, label, kind: "checkbox" });

export const SECTIONS: readonly SectionDef[] = [
  {
    id: "masthead",
    title: "Players & system",
    layout: "masthead",
    fields: [
      f("PlayerName_A", "Player A — name", { kind: "player" }),
      f("PlayerNo_A", "Player A — number", { kind: "player" }),
      f("PlayerName_B", "Player B — name", { kind: "player" }),
      f("PlayerNo_B", "Player B — number", { kind: "player" }),
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
    fields: [
      f("Open1C", "1♣"),
      f("Open1D", "1♦"),
      f("Open1H", "1♥"),
      f("Open1S", "1♠"),
      f("Open1NT", "1NT"),
      f("Open2C", "2♣"),
      f("Open2D", "2♦"),
      f("Open2H", "2♥"),
      f("Open2S", "2♠"),
      f("Open2NT", "2NT"),
      f("Open3NT", "3NT"),
      f("OpenOther", "Other openings"),
    ],
  },
  {
    id: "s2",
    number: 2,
    title: "Pre-alerts",
    layout: "generic",
    fields: [
      notes("PreAlert_0", "Pre-alert summary"),
      f("PreAlert_1_1", "Pre-alert 1"),
      f("PreAlert_1_2", "Pre-alert 2"),
      f("PreAlert_1_3", "Pre-alert 3"),
      f("PreAlert_2_1", "Pre-alert 4"),
      f("PreAlert_2_2", "Pre-alert 5"),
      f("PreAlert_2_3", "Pre-alert 6"),
    ],
  },
  {
    id: "s3",
    number: 3,
    title: "Competitive bids & overcalls",
    layout: "generic",
    fields: [
      f("Doubles_1", "Doubles & redoubles"),
      f("Doubles_2", "More doubles / redoubles"),
      f("JumpOvercall", "Jump overcall"),
      f("Overcall1NT", "1NT overcall (direct)"),
      f("Reopen1NT", "1NT overcall (re-opening)"),
      f("ImmedCueMajor", "Cue of their major"),
      f("ImmedCueMinor", "Cue of their minor"),
      f("UnusualNT", "Unusual notrump"),
      f("Over1NTInterf", "Over interference to our 1NT"),
      f("Over1NTInterfMore", "Over interference — more"),
      f("Transfers_1", "Over their transfers"),
      f("NegXLimit", "Negative double — upper limit"),
      f("Compete1NT_1", "Defence to their 1NT (1)"),
      f("Compete1NT_2", "Defence to their 1NT (2)"),
      f("Compete1NT_3", "Defence to their 1NT (3)"),
      f("CompeteWeak2", "Defence to weak twos"),
      f("CompeteOpen3", "Defence to three-openings"),
      notes("Competitive_0", "Notes"),
    ],
  },
  {
    id: "s4",
    number: 4,
    title: "Basic responses",
    layout: "generic",
    fields: [
      f("JumpRaiseMinor", "Jump raise of a minor"),
      f("JumpRaiseMinorOther", "Jump raise of a minor — other"),
      f("JumpRaiseMajor", "Jump raise of a major"),
      f("JumpRaiseMajorOther", "Jump raise of a major — other"),
      f("MinorJumpShift", "Jump shift over a minor"),
      f("MajorJumpShift", "Jump shift over a major"),
      notes("BasicResponses_0", "Notes"),
    ],
  },
  {
    id: "s5",
    number: 5,
    title: "Play conventions — leads & carding",
    layout: "playPairs",
    pairs: [
      { label: "Lead from a sequence", ntKey: "SeqLead_NT", sKey: "SeqLead_S" },
      { label: "Lead from 4+ to an honour", ntKey: "FourHonourLead_NT", sKey: "FourHonourLead_S" },
      { label: "Lead from four small", ntKey: "FourSmallLead_NT", sKey: "FourSmallLead_S" },
      { label: "Lead from three small", ntKey: "ThreeSmallLead_NT", sKey: "ThreeSmallLead_S" },
      { label: "Lead in partner's suit", ntKey: "LeadPartnersSuit_NT", sKey: "LeadPartnersSuit_S" },
      { label: "Signal on partner's lead", ntKey: "SignalPartnerLead_NT", sKey: "SignalPartnerLead_S" },
      { label: "Count signal", ntKey: "CountType_NT", sKey: "CountType_S" },
      { label: "Discard signal", ntKey: "DiscardType_NT", sKey: "DiscardType_S" },
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
      cb("IsBlackwood", "Blackwood"),
      f("RKCBStyle", "RKCB style"),
      cb("IsAskingBids", "Asking bids"),
      cb("IsCueBids", "Cue bids"),
      cb("IsGerber", "Gerber"),
      f("GerberWhen", "Gerber applies when"),
      f("FourNTOther", "Other uses of 4NT"),
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
    fields: [
      notes("Other_0", "Notes"),
      f("Other_1_1", "Convention 1"),
      f("Other_1_2", "Convention 2"),
      f("Other_1_3", "Convention 3"),
      f("Other_1_4", "Convention 4"),
      f("Other_1_5", "Convention 5"),
      f("Other_2_1", "Convention 6"),
      f("Other_2_2", "Convention 7"),
      f("Other_2_3", "Convention 8"),
      f("Other_2_4", "Convention 9"),
      f("Other_2_5", "Convention 10"),
    ],
  },
  {
    id: "s8",
    number: 8,
    title: "Responses to opening bids",
    layout: "grid",
    fields: [
      f("Resp1NT2CStyle", "2♣ response to 1NT"),
      f("Resp1NT2D", "2♦ response to 1NT"),
      f("Resp1NT2H", "2♥ response to 1NT"),
      f("Resp1NT2S", "2♠ response to 1NT"),
      f("Resp1NT2NT", "2NT response to 1NT"),
      f("Resp1NTDoubled", "When our 1NT is doubled"),
      f("Resp1NTOther", "Other responses to 1NT"),
      f("Response2NT", "Responses to 2NT (general)"),
      f("ResponseStrong2", "Responses to a strong two"),
      f("RespXLimit", "Responsive double — upper limit"),
      notes("ResponseNotes_1", "Response notes 1"),
      notes("ResponseNotes_2", "Response notes 2"),
      notes("ResponseNotes_3", "Response notes 3"),
    ],
  },
  {
    id: "s9",
    number: 9,
    title: "Conventions",
    layout: "generic",
    fields: [
      f("UnusualNoTrump", "Unusual notrump (detail)"),
      f("UnusualNTOther", "Unusual notrump — other"),
      f("FourthSuitForcing", "Fourth suit forcing"),
      cb("Is4thForcing1Round", "4SF — forcing one round"),
      cb("Is4thForcingGame", "4SF — forcing to game"),
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
      f("TakeOutOf4H", "Takeout of 4♥"),
      f("TakeOutOf4S", "Takeout of 4♠"),
      notes("Conventions_0", "Notes"),
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
