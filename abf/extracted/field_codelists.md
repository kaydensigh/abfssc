# Embedded shortcut-code lists

_Auto-extracted from the form's field tooltips by `extract_codelists.js`. 52 fields ship a selectable code list. In the PDF a user types the code (a digit, `x`, `9`, or `?`) and it expands to the phrase; `x` usually marks a "standard/default" answer and `9 : See Note #` redirects to a numbered note. These are the natural source for the web form's dropdowns / autocomplete. Expansions may themselves contain rich `!` codes (e.g. `!H` = ♥)._

### `BasicSystem`
Briefly describe your system: for example...

- `1` — Standard
- `2` — 2/1
- `3` — Acol
- `4` — Precision
- `5` — Strong club
- `6` — Honeymoon Moscito

### `CountType_NT`
Against notrump contracts, how do you show count ?

- `1` — High-Low = Even
- `2` — Low-High = Even
- `x` — Not used
- `9` — See Note #

### `CountType_S`
Against suit contracts, how do you show count ?

- `1` — High-Low = Even
- `2` — Low-High = Even
- `x` — Not used
- `9` — See Note #

### `DiscardType_NT`
Against notrump contracts, how do you signal when discarding ?

- `1` — McKenney
- `2` — Odd=ENCRG, Even=McKenney
- `3` — Even=ENCRG, Odd=McKenney
- `4` — Odd/Even
- `5` — Low Encourage
- `6` — High Encourage
- `8` — Revolving
- `9` — See Note #

### `DiscardType_S`
Against suit contracts, how do you signal when discarding ?

- `1` — McKenney
- `2` — Odd=ENCRG, Even=McKenney
- `3` — Even=ENCRG, Odd=McKenney
- `4` — Odd/Even
- `5` — Low Encourage
- `6` — High Encourage
- `8` — Revolving
- `9` — See Note #

### `Doubles_1`
Which other Doubles and Redoubles do you use ? E.g.

- `1` — Support Doubles & Redoubles
- `2` — Rosenkranz
- `3` — Balancing
- `4` — Lead-Directing

### `Doubles_2`
More details about your Doubles and Redoubles E.g.

- `1` — Support Doubles & Redoubles
- `2` — Rosenkranz
- `3` — Balancing
- `4` — Lead-Directing

### `FourHonourLead_NT`
Against notrump contracts, which card do you lead from 4 or more headed by an honour card ?

- `4` — 4th highest
- `1` — attitude
- `3` — 3rd/Low
- `5` — 3rd/5th
- `9` — See Note #

### `FourHonourLead_S`
Against suit contracts, which card do you lead from 4 or more headed by an honour card ?

- `4` — 4th highest
- `1` — attitude
- `3` — 3rd/Low
- `5` — 3rd/5th
- `9` — See Note #

### `FourNTOther`
Describe your other uses of 4NT

- `1` — Natural
- `2` — Quantitative
- `3` — NAT, QUANT

### `FourSmallLead_NT`
Against notrump contracts, which card do you lead from four small cards ?

- `1` — TOP
- `2` — 2nd highest
- `3` — 3rd highest
- `4` — 4th highest
- `9` — See Note #

### `FourSmallLead_S`
Against suit contracts, which card do you lead from four small cards ?

- `1` — TOP
- `2` — 2nd highest
- `3` — 3rd highest
- `4` — 4th highest
- `9` — See Note #

### `ImmedCueMajor`
What is your immediate cue of a major suit opening ?

- `1` — 5 other Major & 5 minor 6-10
- `9` — natural

### `ImmedCueMinor`
What is your immediate cue of a minor suit opening ?

- `1` — Michaels 5/5 Majors 6-10
- `9` — natural

### `JumpOvercall`
Briefly describe the method you use for a jump overcall in a suit

- `1` — weak
- `3` — intermediate
- `5` — strong
- `9` — roman

### `JumpRaiseMajor`
Describe your jump raise of an opening bid of one in a major suit.

- `1` — Preempt 0-6 HCP, 5+ cards
- `3` — Limit  10-12 HCP, 4+ cards
- `4` — Limit  7-9 HCP, 4+ cards
- `9` — Forcing

### `JumpRaiseMinor`
Describe your jump raise of an opening bid of one in a minor suit.

- `1` — Preempt 0-6 HCP, 5+ cards
- `2` — Inverted: 6-9 HCP, 4+ cards
- `3` — Limit  10-12 HCP, 4+ cards
- `9` — Forcing

### `LeadPartnersSuit_NT`
How do you lead in partner's bid suit against NT contracts ? E.g. several of: Top of sequence [Ssx] Top of 2 [Xx] Low from 2 [xX] Top of 3 small [Xxx] Middle of 3 small [xXx] Honour doubleton [Hx] or 

- `x` — !|As above
- `1` — standard
- `5` — Ssx Xx Xxx Hx hxX

### `LeadPartnersSuit_S`
How do you lead in partner's bid suit against suit contracts ? E.g. several of: Top of sequence [Ssx] Top of 2 [Xx] Low from 2 [xX] Top of 3 small [Xxx] Middle of 3 small [xXx] Honour doubleton [Hx] o

- `x` — !|As above
- `1` — standard
- `4` — Ssx Xx xXx Hx hxX

### `MajorJumpShift`
What do you show by a jump shift response to a major suit opening ?

- `1` — Natural, weak at 2 level
- `2` — Fit showing: 5+ cards & 4 card support
- `5` — Natural, game forcing
- `9` — Splinter: 0-1 cards, 4+ card support

### `MinorJumpShift`
What do you show by a jump shift response to a minor suit opening ?

- `1` — Natural, weak at 2 level
- `2` — Fit showing: 5+ cards & 4 card support
- `5` — Natural, game forcing
- `9` — Splinter: 0-1 cards, 4+ card support

### `Open1C`
Describe your 1C opening

- `1` — 12+ HCP, !T3+!C
- `2` — 11+ HCP, !T2+!C
- `9` — STRONG, 16+ HCP, any shape

### `Open1D`
Describe your 1D opening

- `2` — 11+, !T2`+!D
- `3` — 11-20 HCP, !T3`+!D
- `4` — 11+ HCP, !T4`+!D
- `8` — 11+, better minor, 3`+!D

### `Open1H`
Describe your 1H opening

- `1` — 12-20 HCP !T5+!H
- `3` — 11-22 HCP !T4+!H
- `5` — 11-15 HCP !T5+!H
- `8` — 10-15 HCP, 4+!H, <4!S

### `Open1NT`
Describe your 1NT opening

- `1` — 12-14 Balanced
- `2` — 15-17 Balanced
- `3` — 16-18 Balanced
- `4` — 10-15 HCP, !T4+/4+ MAJORS
- `5` — Any 20+
- `6` — 12-14 BAL,   14-16 BAL in 3!^rd!n seat

### `Open1S`
Describe your 1S opening

- `4` — 11+ HCP, !T4`+!S
- `5` — 11-20 HCP, !T5`+!S

### `Open2C`
Describe your 2C opening

- `1` — 11-15 HCP, 5+!C UNBAL
- `2` — 11-15 HCP precision style: 6+!C or 5!C & 4Major
- `4` — 23+ BAL or any game force
- `6` — Any game force

### `Open2D`
Describe your 2D opening

- `1` — Weak, 6-9 HCP, 6+!D
- `2` — Multi : weak Major OR 20-22 BAL
- `3` — Weak Major
- `9` — 8 Playing tricks, 6+!D

### `Open2H`
Describe your 2H opening

- `1` — Weak, 6-10 HCP, 6!H
- `2` — Multi : weak, 5+!H & 5 any other suit
- `9` — 8 Playing tricks, 6+!H

### `Open2NT`
Describe your 2NT opening

- `1` — 20-22 balanced
- `2` — minors: 5+!C&5+!D 6-9 HCP

### `Open2S`
Describe your 2S opening

- `1` — Weak, 6-10 HCP, 6!S
- `2` — Multi : weak, 5+!S & 5 in either minor
- `9` — 8 Playing tricks, 6+!S

### `Open3NT`
Describe your 3NT opening

- `1` — Gambling, solid minor, no side A or K
- `2` — 27-28 Balanced

### `Over1NTInterf`
What method do you use after your opponents compete over your 1NT bid ? Does this apply when 1NT was not your opening bid ?

- `1` — lebensohl
- `2` — rubinsohl

### `Overcall1NT`
What does you direct 1NT overcall mean ? i.e. in second seat

- `1` — 15-17 BAL
- `2` — 15-18 BAL
- `4` — Single suit takeout
- `5` — Strong takeout
- `6` — Two suited takeout

### `Reopen1NT`
What does your re-opening 1NT overcall mean ? i.e. in fourth seat. Also do you use sandwich 1NT after both opponents bid ?

- `1` — 10-14
- `5` — 15-18

### `Resp1NT2CStyle`
What does your 2 club response to 1NT opening bid mean ? Add details if this varies by seat position or vulnerability.

- `1` — Simple Stayman
- `2` — Extended Stayman
- `5` — 5 card Major enquiry
- `8` — Game force relay

### `Resp1NT2D`
What is 2D response to 1NT ? Note that responses are no longer assumed to be transfers so you need to state which are transfers.

- `x` — Natural, To Play
- `1` — Transfer !H
- `8` — Forcing Stayman ?

### `Resp1NT2H`
What is 2H response to 1NT ? Note that responses are no longer assumed to be transfers so you need to state which are transfers.

- `x` — Natural, To Play
- `1` — TRF !S

### `Resp1NT2NT`
What is 2NT response to 1NT ? Note that responses are no longer assumed to be transfers so you need to state which are transfers.

- `1` — Invite 3NT
- `2` — TRF !D

### `Resp1NT2S`
What is 2S response to 1NT ? Note that responses are no longer assumed to be transfers so you need to state which are transfers.

- `x` — Natural, To Play
- `1` — TRF minor
- `2` — TRF !C
- `7` — Range probe
- `8` — Range Probe/TRF !C

### `Resp1NTDoubled`
Describe your methods when your 1NT opening is doubled. See also Over 1NT Interference in section 9.

- `0` — Same
- `2` — Rubinsohl
- `3` — Lebensohl

### `RKCBStyle`
RKCB response style:

- `1` — 1430
- `3` — 3041
- `9` — 1430 exc.!C

### `SeqLead_NT`
Against notrump contracts, which style do you use when leading from sequences of honour cards ?

- `1` — Overlead All
- `2` — Overlead except AKx(+)
- `3` — Overlead, A-Attitude  K-Count
- `4` — Underlead
- `5` — Journalist
- `6` — A-Attitude  K-Count
- `7` — Slavinsky
- `8` — Rusinow
- `9` — See Note #

### `SeqLead_S`
Against suit contracts, what style do you use when leading from sequences of honour cards ? 7 : Slavi nsky

- `1` — Overlead All
- `2` — Overlead except AKx(+)
- `3` — Overlead, A-Attitude  K-Count
- `4` — Underlead
- `5` — Journalist
- `6` — A-Attitude  K-Count
- `8` — Rusinow
- `9` — See Note #

### `SignalDeclarerLead`
What signals do you use when declarer leads a suit ?

- `1` — Count
- `3` — Smith Echo in trumps
- `9` — Prism hand pattern signal

### `SignalPartnerLead_NT`
Against notrump contracts, how do you signal on partners lead ? Use numbers for priorities.

- `1` — Low Encourage
- `2` — High Encourage
- `3` — Suit Preference
- `4` — Count
- `5` — Low = Even
- `6` — Low = Odd

### `SignalPartnerLead_S`
Against suit contracts, how do you signal on partners lead ? Use numbers for priorities.

- `1` — Low Encourage
- `2` — High Encourage
- `3` — Suit Preference
- `4` — Count
- `5` — Low = Even
- `6` — Low = Odd

### `ThreeSmallLead_NT`
Against notrump contracts, which card do you lead from three small cards ?

- `1` — Top
- `2` — Middle
- `3` — Bottom

### `ThreeSmallLead_S`
Against suit contracts, which card do you lead from three small cards ?

- `1` — Top
- `2` — Middle
- `3` — Bottom

### `Transfers_1`
Descrbe your methods after opponents use a transfer bid. E.g.

- `1` — Double = takeout
- `2` — Cue = strong
- `3` — Cue = good 2 suiter
- `4` — Double = Lead-Directing

### `UnusualNoTrump`
What does your unusual leap in NT show ?

- `1` — minors
- `2` — Other suits
- `3` — Lower 2 unbid suits
- `4` — 2 non-touching suits
- `5` — Any 2 unbid suits

### `UnusualNT`
Briefly describe your use of the Unusual NT convention. See also Conventions on the inside pages. If you need more space, please use selection 9. 5 : Any 2 unbid suits

- `1` — minors
- `2` — Other suits
- `3` — Lower 2 unbid suits
- `4` — 2 non-touching suits
- `9` — !1!B!|See section 9!#y

