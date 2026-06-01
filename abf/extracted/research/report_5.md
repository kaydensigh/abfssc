# DIMENSION 5: Bridge card domain & form layout

## Summary
The form is a near-pixel reproduction of the ABF "Standard System Card", the regulated one-sheet (A4, folded into a booklet) on which a bridge partnership discloses its bidding and play agreements to opponents and directors. It has exactly two PDF pages mirroring the paper card: an OUTSIDE page (folded front+back = the "SIMPLE CARD") carrying the masthead, system Classification, and sections 1 OPENING BIDS, 2 PRE-ALERTS, 3 COMPETITIVE BIDS/OVERCALLS, 4 BASIC RESPONSES, 5 PLAY CONVENTIONS, 6 SLAM CONVENTIONS, 7 OTHER CONVENTIONS; and an INSIDE page holding the dense bid grids 8 RESPONSES TO OPENING BIDS, 9 CONVENTIONS, 10 OTHER NOTES. The defining domain object is the colour Classification (Green/Blue/Red/Yellow) plus an independent Brown Sticker flag â bridge system-regulation buckets â implemented NOT as four booleans but as a single Classification string field that recolours a big masthead circle, driven by click-handlers that call gFpB.

## Report
# What an ABF Standard System Card is

In duplicate bridge, opponents are entitled to full disclosure of a partnership's methods. The ABF Standard System Card is the standardised double-sided, folded A4 form a pair completes so opponents and the director can read its agreements at the table. The PDF reproduces that paper card almost exactly because the card's section layout and classification semantics are *themselves the regulated artifact* â a web rebuild must reproduce the same sections and the same classification model, not merely "a bridge form". Guide p.20 (PRINTING) confirms the physical model: "The card is designed to fill an A4 page... be folded in half for regular use, and folded again for pockets and handbags. Only two pages remain in the form after the 2016 update."

# IMPORTANT: page order in the FORM PDF is INSIDE-first

A correction to the common assumption: in the actual ABF_Card_FORM.pdf, **physical page 1 is the INSIDE page** (sections 8 RESPONSES TO OPENING BIDS, 9 CONVENTIONS, 10 OTHER NOTES) and **physical page 2 is the OUTSIDE page** (masthead + sections 1â7, overlaid with the yellow JavaScript-warning panel). The Usage Guide labels them the opposite way ("page 1 (the Outside Pages)" on guide p.2; "page 2 (the Inside Pages)" on guide p.3) because the guide numbers by the *folded reading order*, not the PDF page index. Any web rebuild must not conflate "guide page 1" with "PDF page 1".

# Outside vs Inside, and the right-side front panel

Guide p.2 ("The Outside Pages (= The SIMPLE CARD)"): "the outside pages can be used as an editable form of our SIMPLE card... basically the front and back of the STANDARD CARD, ie The Outside Pages folded down the middle." On the outside page the printed FRONT face (masthead + section 1) sits on the **right** column; guide p.2: "Why is the front page of the printed card at the right here? It simplifies printing. When printed, we fold the card in the middle and then the booklet opens at the right." So on-screen reading order is not top-to-bottom: the right column is the front (masthead, 1. OPENING BIDS, 2. PRE-ALERTS, 3. COMPETITIVE BIDS/OVERCALLS) and the left column is the back (4. BASIC RESPONSES, 5. PLAY CONVENTIONS, 6. SLAM CONVENTIONS, 7. OTHER CONVENTIONS).

# The numbered sections (verified from form images + guide)

1. **OPENING BIDS** (NOT "Opening Leads" â a frequent mis-read). Subtitle "Describe strength, min. length, or specific meaning". Fields `Open1C/Open1D/Open1H/Open1S/Open1NT/Open2C` etc.; flag `OneNTMayHave5Major` ("may contain 5 card Major" shown on the form), `IsCanape`. Leads/carding does NOT live here â it lives in section 5.
2. **PRE-ALERTS** â "Rectangles" for unusual methods opponents must be warned of pre-play; the masthead cross-references it (guide p.24: "provide more details in section '2. PRE-ALERTS'").
3. **COMPETITIVE BIDS / OVERCALLS** â Doubles/Redoubles, Negative/Responsive/Support doubles, Jump overcalls, 1NT overcall (immediate/re-opening/sandwich), Unusual NT, Opening Threes, Opponent's transfers, Opponent's 1NT (fields `Compete1NT_1/2`, `Opponent's transfers`/`Opponent's 1NT`).
4. **BASIC RESPONSES** â `JumpRaiseMinor`/`JumpRaiseMajor` (+`...Other`), jump shifts after major/minor opening, responses to strong-2 and 2NT openings.
5. **PLAY CONVENTIONS** â Opening **Leads** (Sequences; vs Suit / vs NoTrump, up to 4 option columns), Discards, Count, Signal on partner's lead / on declarer's lead, plus a "Show priorities" toggle (bookmark 106 "Showing Priorities"). This is the carding heart.
6. **SLAM CONVENTIONS** â 4NT meaning (`IsBlackwood`, RKCB style `RKCBStyle`), Asking Bids (`IsAskingBids`), Cue Bids (`IsCueBids`), Gerber (`IsGerber`).
7. **OTHER CONVENTIONS** â free space / "Demo: [Show extra notes?]" layering area.
8. **RESPONSES TO OPENING BIDS** â the densest region: rows for 1C,1D,1H,1S,1NT,2C,2D,2H,2S,2NT, each enumerating response bids (2Dâ¦4C) and meanings. Subtitle "Describe strength, minimum length, or specific meaning".
9. **CONVENTIONS** â Unusual NT; 4th Suit Forcing (`Is4thForcing1Round` "One round" + `Is4thForcingGame` "Game force"); NT Checkback (`IsNTCheckback`, `CheckbackPriorities`); Defence to 3NT opening (`CompeteOpen3`); Defence to Opening Twos / weak-2s (`CompeteWeak2`); Multi 2D; RCO style 2-s; Defence to strong 1C/2C (`DefenceStrongC_1`); Lebensohl; Take out of 4-level pre-empts.
10. **OTHER NOTES** â free-form ruled notes with shortcut-code support ("All Shortcut Codes").

# Masthead identity & Basic System

The masthead ("The Main Heading of the Card", guide p.24) holds two players' identities: `PlayerName`/`PlayerName_A`/`PlayerName_B` and `PlayerNo`/`PlayerNo_A`/`PlayerNo_B`. The `_A`/`_B` pairs feed the **Swap Players** feature (bookmark 123; function `gFsP`, in clean_0_block36.js line 2126) which swaps the two names and numbers â including richText, value, fillColor and border â so each partner can print a personalised card from one file. Guide p.24: "Since 2020 update you can click on the Numbers and Names side heading to permanently swap the details." `BasicSystem` is the one-line system label; its tooltip lists shortcut codes "1 : Standard / 2 : 2/1 / 3 : Acol / 4 : Precision / 5 : Strong club / 6 : Honeymoon Moscito". Guide p.24: masthead text fields "are slightly taller and will allow a larger font size before overflowing" â a deliberate layout concession for the most-read field.

# Classification stickers â the regulatory core (mechanism corrected)

The single live store is the field **`Classification`** (a string), NOT four booleans. The names `IsClassGreen/Blue/Red/Yellow` are *virtual call-target names*, never real fields (they are absent from field_names.txt; only `Classification`, `IsBrownSticker`, the radio-group fields `Z_MyClass`/`Z_Sticker`, and query helpers `Q_Green/Q_Blue/Q_Red/Q_Yellow/Q_Brown` exist). The click handlers (JS blocks 4â8) are one-liners:
```
gFpB('1','IsClassGreen'); gFpB('1','IsClassBlue');
gFpB('1','IsClassRed');   gFpB('1','IsClassYellow');
gFpB('2','IsBrownSticker');
```
The body of `gFpB(hVXCxD, hVXRoL)` lives in _openaction_clean.js (line 439), not in the main library blocks. Decoded:
- **`hVXCxD==1`** (the four colours): the target field doesn't exist, so it falls to the `else if(hVXCxD==1)` branch, which checks the prefix `IsClass`, reads `Classification`, computes the colour from `substr(7)` (e.g. "Green"), and if `Classification` already equals it sets it to "not set" (toggle off), else sets `Classification` to that colour: `hVXf.value=hVXvv;`. So all four colours write ONE string field â genuinely radio-like via a single value, not four flags.
- **`hVXCxD==2`** (Brown Sticker): toggles the real `IsBrownSticker` field 'Yes'/'Off' â an independent flag that co-exists with any colour. The `'2'` vs the colours' `'1'` encodes exactly this independence.
- **`hVXCxD==0`** (most checkboxes, e.g. `IsGerber`, `Is4thForcing1Round`): cycles a checkbox through the value set in `My_CheckBoxValues` (the "CheckBox Format" Big-X/Small-Black option, bookmarks 38â40), updating a paired `B_`-prefixed display field.

The masthead's big circle recolours from the `Classification` string. The repaint is forced by `gFxC()` (clean_1_block37.js line 671), which simply re-assigns the field to its own value (`uBXa.value=uBXv;`) for both `Classification` and `IsBrownSticker`, re-triggering the field's format/appearance script. Guide p.20 tutorial: "set the classification to GREEN by clicking... the big circle at the top right... should be green." Click semantics (guide p.24): "set by clicking anywhere between the start of the side heading and the right edge of the box. Click it again to turn it off, or click the box for another classification colour." A reader-specific exception: "Master PDF Editor â is different: please click on the side heading label and not in the box."

# Density constrains the form

Two regulated sides force brutal density (section 8 is roughly a 10-row Ã multi-column bid matrix). This is the direct cause of the form's two signature mechanisms: the **rich-field pair split** (terse editable field + `D_`/`B_` display field, e.g. `DefenceOpening2`/`D_DefenceOpening2`) so codes typed into tiny cells print as full phrases (guide p.3: "B:" = Basic display, "R:" = Rich display, "T:" = typed text, "X:" = expanded); and **overflow indicators** (guide p.3 points to a field "2 lines below the '9. CONVENTIONS' heading" with an overflow marker; guide p.20: "The fields in this PDF form have fixed width and height. Overflowing text in a field is invisible"). The SIMPLE CARD (outside page only) exists because the full inside grid is too dense for casual pairs.

## Key Mechanisms

### Classification (single string field) + gFpB hVXCxD==1 branch
- What: Stores the system's regulatory colour as ONE string ('Green'/'Blue'/'Red'/'Yellow' or 'not set'). Clicking a colour calls gFpB('1','IsClass<Color>'); since no such field exists, gFpB reads the suffix after 'IsClass', and either sets Classification to that colour or, if it already equals it, sets it to 'not set' (toggle). Recolours the big masthead circle.
- Evidence: _openaction_clean.js:473-482: `}else if(hVXCxD==1){ if(hVXxn.substr(0,7)=='IsClass'){ var hVXf=this.getField('Classification'); var hVXvv=hVXxn.substr(7); ... if(hVXfv==hVXvv)hVXvv='not set'; hVXf.value=hVXvv; }`. field_names.txt has 'Classification' (line 32) but NO IsClassGreen/Blue/Red/Yellow fields.
- Why: Only one colour can apply at a time, so a single string is the natural radio store; a PDF radio-button group cannot recolour a distant masthead graphic, so JS sets the string and a format script repaints. The four IsClass* names are just convenient call targets sharing one handler.

### IsBrownSticker independent flag (gFpB hVXCxD==2)
- What: A real boolean field toggled 'Yes'/'Off', shown as a separate small filled circle, independent of the colour. A system can be e.g. Green AND carry a Brown Sticker.
- Evidence: _openaction_clean.js:468-471: `}else if(hVXCxD==2){ var hVXbv='Yes'; if(hVXm.valueAsString!='Off')hVXbv='Off'; hVXm.value=hVXbv; }`. Call site JS block 4: gFpB('2','IsBrownSticker'). field_names.txt line 321. Guide p.20: 'The appearance of the smaller filled circle shows that the Brown Sticker applies (whether... grayscale or brown).'
- Why: A Brown Sticker co-exists with any colour, so it is a distinct field and circle, not part of the colour group â encoded by passing '2' (independent toggle) rather than the colours' '1'.

### gFpB hVXCxD==0 checkbox cycler with B_ display field
- What: For ordinary imitation-checkboxes (IsGerber, IsBlackwood, Is4thForcing1Round, IsNTCheckback, etc.) it advances the field through the character set in My_CheckBoxValues and updates a paired 'B_'-prefixed display field, supporting the Big-X / Small-Black render options.
- Evidence: _openaction_clean.js:445-467: reads `getField('B_'+hVXxn)`, `getField('My_CheckBoxValues')`, increments hVXt through the value list, maps 0->'Off', 1->'Yes'. Bookmarks 38 'CheckBox Format', 39 'Big X', 40 'Small Black'.
- Why: PDF AcroForm checkboxes can't render a Big-X vs Small-Black style choice nor carry a paired display value, so checkboxes are imitated by a text field whose value is cycled by JS and mirrored to a B_ display field.

### gFxC() classification repaint trigger
- What: Forces the colour circle and brown-sticker circle to redraw by re-assigning Classification and IsBrownSticker to their own current values (no value change), re-running their appearance/format scripts.
- Evidence: clean_1_block37.js:671-683: `function gFxC(){ ... var uBXa=this.getField('Classification'); var uBXv=uBXa.valueAsString; uBXa.value=uBXv; uBXa=this.getField('IsBrownSticker'); uBXv=uBXa.valueAsString; uBXa.value=uBXv; this.dirty=uBXfxd; }` (preserves this.dirty so the touch isn't recorded as an edit).
- Why: A PDF field's painted appearance only refreshes when its value is set; re-assigning the same value is the idiomatic Acrobat hack to repaint a colour that depends on the value, without marking the document dirty.

### gFcb() field-highlighting manager
- What: Reads/sets app.runtimeHighlight and alerts the user, because field highlighting overpaints the classification circle's fill so the colour 'may not be visible or may not change'.
- Evidence: clean_1_block37.js:685-706: `function gFcb(lBXRoLA){ if(typeof(app.runtimeHighlight)==='boolean'){ ... app.runtimeHighlight=lBXnfx; ... cMsg:'Runtime field highlighting has been '+(...)+'.\r \rSee bookmark HELP / BLUE Fill for more details.' }`. Guide p.24: 'The background fill colour of the circles may not be visible or may not change if field highlighting is enabled.'
- Why: Reader field-highlighting is an app-level paint that conflicts with field-fill colour; the form ships code to toggle it and a HELP/BLUE Fill bookmark because it is a recurring support issue.

### Z_MyClass / Z_Sticker radio-button mirror fields
- What: Radio-button-type fields that mirror the classification/brown-sticker as printable boxes below 'Basic System', usable when the colour circle prints only in grayscale.
- Evidence: clean_0_block36.js:397 `var sAXaRBFields=new Array('Z_MyClass','Z_Sticker');` then reads `sAXrbf.type` (treated as radio-button fields); field_names.txt lines 582-583. Guide p.20: 'the boxes below "Basic System" can be used to identify the classification if the fill colour in the larger circle is printed in grayscale.'
- Why: Colour does not survive grayscale/B&W printing, so a second, glyph-based representation (radio boxes) is kept in parallel for printed legibility â a print-fidelity workaround.

### Two-page OUTSIDE/INSIDE split (PDF page order reversed vs guide)
- What: PDF physical page 1 = INSIDE (sections 8-10 grids); physical page 2 = OUTSIDE (masthead + sections 1-7, with the JS-warning overlay). The printed FRONT (masthead + section 1) is the RIGHT column of the outside page.
- Evidence: Form images: page-1 image shows '8. RESPONSES TO OPENING BIDS / 9. CONVENTIONS / 10. OTHER NOTES'; page-2 image shows '4. BASIC RESPONSES / 5. PLAY... / masthead + yellow JS warning'. Guide p.2 labels outside as 'page 1' and explains 'Why is the front page... at the right here? ...we fold the card in the middle and then the booklet opens at the right.'
- Why: Reproduces the folded paper booklet and simplifies duplex printing (guide p.20: 'FLIP on SHORT SIDE'); the right-side-front placement makes the printed sheet fold so the booklet opens correctly. Web rebuild must treat reading order as non-linear and not equate PDF page index with guide page numbering.

### Section 8 Responses-to-Openings grid + rich-field split
- What: A large opening-by-response matrix; each cell is an editable code field paired with a D_/B_ display field so terse codes typed in tiny cells render as full phrases.
- Evidence: Form page-1 image '8. RESPONSES TO OPENING BIDS / Describe strength, minimum length, or specific meaning' with rows 1C..2NT and response columns 2D..4C. Guide p.3: 'T:' typed, 'R:' Rich display, 'B:' Basic display, 'X:' expanded; paired fields e.g. DefenceOpening2 / D_DefenceOpening2 (field_names.txt 290/57).
- Why: Bidding agreements are inherently a 2-D table; the fixed cell density forces the rich-field architecture and overflow indicators because full text won't fit and overflow is invisible (guide p.20).

## Limitations & Workarounds
- Classification is stored in ONE string field ('Classification'), not four booleans; the IsClassGreen/Blue/Red/Yellow names are virtual call targets handled by gFpB's hVXCxD==1 branch (they do not appear in field_names.txt). A web rebuild should model it as a single enum, not four flags.
- Imitation checkboxes: ordinary checkmarks (IsGerber, Is4thForcing*, etc.) are text fields whose value is cycled through My_CheckBoxValues by gFpB(0) and mirrored to a B_ display field, because native AcroForm checkboxes can't offer the Big-X/Small-Black style choice (bookmarks 38-40) nor carry a paired display value.
- Colour repaint requires re-assigning the field to its own value (gFxC), the standard Acrobat hack to force an appearance refresh, with this.dirty preserved so the touch isn't recorded as an edit.
- Field highlighting (app.runtimeHighlight) overpaints the classification circle so 'the fill colour may not be visible or may not change' (guide p.24); the form ships gFcb() to toggle it and a HELP/BLUE Fill bookmark - a recurring Reader rendering conflict.
- Colour does not survive grayscale printing, so parallel radio-button fields Z_MyClass/Z_Sticker render printable boxes below 'Basic System' as a B&W fallback (guide p.20).
- PDF page order is INSIDE-first/OUTSIDE-second, while the Usage Guide numbers pages OUTSIDE-first - do not equate 'guide page 1' with 'PDF page 1'.
- The printed FRONT panel sits on the RIGHT of the outside page purely to make duplex booklet folding open correctly (guide p.2; p.20 'FLIP on SHORT SIDE'), making on-screen reading order non-linear.
- Fixed-width/height fields make overflow invisible (guide p.20), forcing the rich-field code/display split and overflow indicators (guide p.3) plus shortcut codes so content fits tiny cells.
- Adobe Reader 'SAVE INK' is explicitly warned against (guide p.20) because it saves a pre-JavaScript state that disables the form's runtime print options (including hiding pale-gray in-field hints).

## User Impact
- A pair fills identity once (two ABF numbers + names) and one Basic System line; shortcut codes (type '2' for 2/1, '4' for Precision) make this fast.
- Setting classification is a single click on a coloured word and the big circle gives instant confirmation - but only if form-field highlighting is OFF; otherwise the colour silently fails to show even though the Classification value is stored correctly (a real support pain the guide spends most of p.24 on).
- Swap Players (or clicking the Numbers & Names side heading) lets each partner print a personalised card from one shared file, swapping names, numbers, fonts and fill colours.
- The right-side-front print layout disorients on-screen users; the guide repeatedly reassures them about where the masthead is.
- Section 8's large grid is the most laborious area; many pairs complete only a few cells, which is why the SIMPLE CARD (outside page only) is offered as a lighter standalone form.
- Because cells have fixed size and overflow is invisible, users must watch for overflow indicators and abbreviate or push detail into section 10 OTHER NOTES / 2 PRE-ALERTS.
- Master PDF Editor users must click the side-heading label (not the box) to set classification - a reader-specific quirk that will confuse anyone following the default instructions.
- Printing in B&W still conveys classification via the grayscale circle plus the Z_MyClass/Z_Sticker boxes, so a printed card remains legible without colour.

## Surprises
- The four colour classifications are NOT four boolean fields - they all write a single 'Classification' STRING field; IsClassGreen/Blue/Red/Yellow are virtual names that gFpB resolves via substr(7). The draft's 'four mutually-exclusive flags' was mechanically wrong.
- In the actual FORM PDF the page order is reversed from the guide: physical page 1 is the INSIDE grids (sections 8-10) and physical page 2 is the OUTSIDE/masthead - the guide numbers them the other way because it counts folded reading order.
- Section 1 is 'OPENING BIDS' (fields Open1C/1D/1H/1S/1NT/2C), not 'Opening Leads' - leads/carding actually live in section 5 PLAY CONVENTIONS.
- gFpB's body is not in the main beautified library blocks at all - it sits in the document OpenAction script (_openaction_clean.js line 439), which is why a colleague searching only the block files couldn't find it.
- The colour circle is repainted by gFxC() simply re-assigning the field to its own value, and it carefully restores this.dirty so the repaint isn't logged as a document edit.
- Brown Sticker passes '2' (an independent toggle) while the colours pass '1' (the single-string radio branch) - the literal parameter encodes the conceptual independence of the sticker from the colour.
- There are effectively two products in one file - the full STANDARD CARD (both pages) and the SIMPLE CARD (the outside page folded) - reusing the same fields.
- The form ships JavaScript (gFcb) that programmatically reads and sets the reader's own field-highlighting preference, because that setting otherwise hides the classification colour.

## Open Questions
- The exact value strings stored in 'Classification' ('Green'/'Blue'/'Red'/'Yellow'/'not set') are inferred from gFpB's substr(7) of the call-target names; the format/appearance script that maps each value to a circle fill colour was not fully read and would confirm the colour-to-value mapping.
- The precise regulatory meaning of Green/Blue/Red/Yellow categories is NOT embedded in the form (it defers to 'Checking National Regulations in an appendix', guide p.24/bookmark 80) and must be sourced from current ABF regulations for a web rebuild.
- Whether Z_MyClass/Z_Sticker are kept perfectly in sync with the Classification string on every click, or only refreshed at print/status time, was not traced end-to-end (they appear in a diagnostic/Status loop in clean_0_block36.js).
- The full set of characters in My_CheckBoxValues (which defines how far the gFpB(0) checkbox cycler advances, i.e. how many tick styles a checkbox can show) was not located and would clarify the Big-X vs Small-Black behaviour.