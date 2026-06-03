# Card content model — what the web version must capture

This is the **design input** for the web reimplementation: the card&rsquo;s content, organised
by section, with each field&rsquo;s *kind* and where its embedded help/codes come from. It is
distilled from the original form&rsquo;s 601 fields, its tooltips, and the two page images.

It deliberately does **not** re-explain how the PDF works — see
[`../abf/architecture.html`](../abf/architecture.html) for that, and especially its §10
(&ldquo;Implications for a web rebuild&rdquo;) for the keep / collapse / drop guidance. This file is the
&ldquo;what,&rdquo; not the &ldquo;how.&rdquo;

> **One collapsing rule first.** In the PDF every rich entry is two fields — an editable
> code field plus a `D_` display twin (245 of those). The web version stores **one value per
> field and renders it live**, so this document lists only the ~295 *logical* fields and
> ignores the `D_`/`B_`/`V_`/`Box`/`My_`/`I_`/`A_`/`Z_` machinery, which has no place in a web build.

---

## Field kinds

The whole card reduces to six kinds of input:

| Kind | Description | Web control |
| --- | --- | --- |
| **Rich text** | Free text with optional suit symbols / colour / super-subscript (the `!`-code language). The bulk of the card. | Text input/area with live rendering of suits & light markup |
| **Coded text** | A rich-text field that *also* ships a list of preset answers in its tooltip (52 fields, 211 codes — see below). | Combo box / autocomplete seeded from the code list, still free-text editable |
| **Checkbox** | A true on/off agreement. Only **7** exist: `IsBlackwood`, `IsGerber`, `IsAskingBids`, `IsCueBids`, `IsNTCheckback`, `IsCanape`, `IsBrownSticker`. (Also two split flags `Is4thForcing1Round` / `Is4thForcingGame`, and `OneNTMayHave5Major`.) | Checkbox |
| **Classification enum** | One value: Green / Blue / Red / Yellow / *not set*. Stored as a single `Classification` string (the `IsClass*` names are virtual, not fields). | Single-select (radio / swatch) |
| **Identity** | Two players: `PlayerName`/`PlayerNo` with `_A`/`_B` slots; `BasicSystem`; `Date_A` (revision). | Text inputs |
| **Free notes** | Open ruled areas for overflow / extra detail (`*Notes_*`, `Other_*`, `MoreNotes_*`). | Text areas |

---

## Content by section

PDF **page 1 (Outside)** holds the masthead + §1–7; **page 2 (Inside)** holds §8–10. Field
names below are the real ones from [`../abf/extracted/field_names.txt`](../abf/extracted/field_names.txt).

### Masthead / identity (page 1, right column)
- **Players:** `PlayerName`, `PlayerName_A`, `PlayerName_B`, `PlayerNo`, `PlayerNo_A`, `PlayerNo_B` — two partners; the `_A`/`_B` slots drive the cosmetic *swap-to-print* ("two views of one document," not data sync).
- **System:** `BasicSystem` *(coded)*, `OneNTMayHave5Major` *(checkbox)*, `IsCanape` *(checkbox)*.
- **Classification:** `Classification` *(enum: Green/Blue/Red/Yellow)* + `IsBrownSticker` *(independent checkbox)*. Printable grayscale mirrors: `Z_MyClass`, `Z_Sticker`.
- **Revision:** `Date_A` (a date *or* a free version code).

### §1 Opening Bids
`Open1C` `Open1D` `Open1H` `Open1S` `Open1NT` `Open2C` `Open2D` `Open2H` `Open2S` `Open2NT` `Open3NT` `OpenOther` — describe strength / min length / meaning of each opening. All rich text.

### §2 Pre-Alerts
`PreAlert_0`, `PreAlert_1_1…1_3`, `PreAlert_2_1…2_3` — unusual methods opponents must be warned of before play.

### §3 Competitive Bids / Overcalls
`Doubles_1` `Doubles_2` `JumpOvercall` `Overcall1NT` `Reopen1NT` `ImmedCueMajor` `ImmedCueMinor`
`UnusualNT` `Over1NTInterf` `Compete1NT_1…_3` `CompeteWeak2` `CompeteOpen3`
`Transfers_1` `NegXLimit` `Competitive_0`. (Doubles, jump overcalls, 1NT overcall/re-open, cue bids, defences over our/their 1NT, etc.)

### §4 Basic Responses
`JumpRaiseMinor`, `JumpRaiseMajor`, `MinorJumpShift`, `MajorJumpShift`, `BasicResponses_0`.

> **Dropped: the four "…Other / …More" overflow inputs** — `JumpRaiseMinorOther`,
> `JumpRaiseMajorOther`, `UnusualNTOther` (§9), `Over1NTInterfMore` (§9). In the real
> form these sit **off-page, Hidden, with no `D_` print twin**, so the original never
> displays them (Adobe shows nothing; the form's `gRtFL` DSL treats them as legacy
> aliases that fold into the parent). Modelling them would let a user type content
> that no Adobe-rendered card can show back — unrecoverable data. We omit them; the
> parent field (`JumpRaiseMinor`, …) is the home for that text. On import a legacy
> value under an old `…Other` name is folded into the parent rather than lost.

### §5 Play Conventions — opening leads & carding
*Each comes in a `_NT` (vs notrump) and `_S` (vs suit) variant:*
`SeqLead_NT/_S`, `FourHonourLead_NT/_S`, `FourSmallLead_NT/_S`, `ThreeSmallLead_NT/_S`,
`LeadPartnersSuit_NT/_S`, `SignalPartnerLead_NT/_S`, `SignalDeclarerLead`,
`CountType_NT/_S` *(coded)*, `DiscardType_NT/_S` *(coded)*, plus `PlayConventions_0`, `PlayNotes_1…_3`.

### §6 Slam Conventions
`IsBlackwood` *(cb)*, `RKCBStyle`, `IsAskingBids` *(cb)*, `IsCueBids` *(cb)*, `IsGerber` *(cb)*, `GerberWhen`, `FourNTOther`, `SlamNotes_1…_3`.

### §7 Other Conventions
`Other_0`, `Other_1_1…1_5`, `Other_2_1…2_5`, plus a layered &ldquo;extra notes&rdquo; area. (Some `*Notes_*` fields blur between §7 and §10 on the paper card.)

### §8 Responses to Opening Bids — the big grid (page 2)
142 fields named `Resp<opening>_<response>`: rows are each opening bid (`Resp1C`, `Resp1D`,
`Resp1H`, `Resp1S`, `Resp1NT`, `Resp2C`, `Resp2D`, …), columns are response bids
(`_1D … _4S`, plus `_Other`). The bare `_1D … _4S` fields are the column header labels. This
is a **2-D matrix** — model it as `responses[opening][bid]`, not 142 flat fields.

### §9 Conventions
`UnusualNT` / `UnusualNoTrump`, `Is4thForcing1Round` & `Is4thForcingGame` *(cb)* / `FourthSuitForcing`,
`IsNTCheckback` *(cb)* / `CheckbackPriorities`, `Defence3NT`, `DefenceOpening2`, `DefenceMulti`, `DefenceRCO`,
`DefenceOtherTwos`, `DefenceStrongC_1…_4`, `Over1NTInterf`, `LebensohlOther`, `TakeOutOf4C4D`, `TakeOutOf4H`, `TakeOutOf4S`, `Conventions_0`.

### §10 Other Notes
`OtherNotes_0…_7`, `MoreNotes_1…_4` — free ruled text with full code support.

---

## Embedded shortcut-code lists (the domain content)

52 fields ship a list of preset answers inside their tooltip — e.g. `Open1NT` → `1 : 12-14
Balanced`, `BasicSystem` → `1 : Standard / 2 : 2/1 / 3 : Acol / 4 : Precision`. In the PDF a
user types the code and it expands; these are exactly what the web form&rsquo;s **dropdowns /
autocomplete** should offer (while still allowing free text). The full, cleanly-extracted
catalogue is **[`../abf/extracted/field_codelists.md`](../abf/extracted/field_codelists.md)**
(regenerate with `node abf/extract_codelists.js`). Conventions in those lists:
`x :` marks a standard/default answer, `9 : See Note #` redirects to a numbered note, and an
expansion may itself contain rich codes (e.g. `!H` → ♥).

The rich `!`-code language and the exact colour palette (RGB values for `!0`–`!9`) are
documented in [`../abf/architecture.html`](../abf/architecture.html) §4.

---

## Decisions to make / things to source externally

These are genuinely **not in the file** or are open choices — settle them while designing,
not mid-build. (Consolidated from the research reports&rsquo; open-questions.)

1. **Classification semantics.** The form stores the colour but *not* what Green/Blue/Red/Yellow
   regulate. Source the current meanings from **ABF system-regulation documents** (the form
   defers to &ldquo;the latest national Regulations&rdquo;).
2. **Abbreviation glossary.** The card uses a controlled WBF/ABF vocabulary (FG = *Forcing to
   game*, TRF = *transfer*, RKCB, T/O, NAT, BAL, plus ABF `*`-marked extensions). The list is in
   the Usage Guide (Abbreviations appendix); decide whether to embed it as autocomplete/validation.
3. **Suit & light-markup support.** Decide how much of the `!`-code language to keep. Suit
   symbols (♣♦♥♠) and colour are clearly worth it; super/subscript and font-size tweaks are
   marginal. A small subset covers ~all real use.
4. **Legacy import?** Decide whether to import existing cards. If yes, FDF is the source format
   and the cross-version field-rename map (`gRtFL`, decoded in report 6) is the migration table.
   If no, skip the entire retired-field apparatus.
5. **Print / output.** Decide whether the web version still produces the folded A4 booklet
   (and the Simple-vs-Standard card distinction, and per-partner printouts) or targets
   screen/PDF/share-link only. This shapes layout heavily.
6. **Unknowns to confirm from the source if needed:** exact `Classification` value strings,
   the `My_CheckBoxValues` tick styles (Big-X / Small-Black / Tick / Cross), and the date-format
   options — all minor and recoverable from the JS if they matter.

---

## Translating to a data model

The clean shape (expanded in `architecture.html` §10): a flat map of logical field values
(no `D_` twins), the §8 grid as a nested `responses[opening][bid]` object, the 7 checkboxes as
booleans, classification as an enum + a brown-sticker boolean, identity as a 2-element player
array with a &ldquo;primary&rdquo; pointer (instead of physically swapping), and a small provenance block
(schema-version + timestamp) — **without** the original&rsquo;s identity/viewer leakage. Versioning
is a one-time migration on load, not self-modifying fields.
