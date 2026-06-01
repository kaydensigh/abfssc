# DIMENSION 3: User interaction & workflows

## Summary
The ABF Standard System Card is a two-page A4 bridge convention card reimplemented as a JavaScript-driven Adobe fillable PDF whose entire command surface is delivered through 127 PDF bookmarks acting as a menu, field tooltips (the PDF userName property) acting as inline help and as the data source for an in-field code picker, and paired editable/"D_" display fields acting as a render layer. The intended journey (download locally, enable Acrobat JS + trust, expose bookmarks, disable Highlight Form Fields, run Status Check, fill fields with !/grave/digit codes, REFRESH, swap-print, Save_As, share PDF or FDF) is formally split into Phase 1 (environment) and Phase 2 (codes), and is riddled with workarounds for things a PDF form cannot do. The result is powerful for a committed partnership but dominated by first-run friction, modal-dialog data entry, blur-only code rendering, and "did it work?" ambiguity that strongly motivate a web rebuild.

## Report
# User Interaction & Workflows (verified against source)

Note on versions: the **form** is Rev. **21E29 by RoL**, "Copyright (c) ABF 2021" (confirmed on the page-1 image); the **Usage Guide** PDF supplied is Rev. **21D24, 2021-05-29** (header on every extracted page). Page citations below are the guide's printed page numbers.

## The intended journey ("Getting Started - A Quick Guide", guide pp.7-10)

**Phase 1 - environment (pp.7-8).** Before any bridge content the user must: download the kit; install Adobe Reader DC/XI (or "Foxit Reader 9.6.0 or later"); set Adobe as default; double-click the *empty* form; then run a literal checklist: "Does the big JavaScript warning message remain visible after opening the form?", "do any colour-filled lines with warning messages appear near the top of the window?", "can you see the bookmarks? ... try ... <View> <Show/Hide> <Navigation Panes> <Bookmarks>". They must "Action the Status Check bookmark by clicking on its flag ... If no message is shown - please report it! JavaScript may not be active." Then fill "just a few fields ... the player names and basic system", set Classification to GREEN by clicking the circle ("Does the big circle at the top right ... change colour? It should be green. If not ... you need to disable Highlight Form Fields"), then "<File> <Save_As> ... with a new file name ... then Close your PDF Reader", reopen "in a fresh Adobe Reader session", and verify persistence. This ceremony exists entirely because the form cannot guarantee its own runtime; it must teach the user to provision Acrobat's JS engine and trust.

**Phase 2 - codes (pp.9-10).** The user experiments in a long field, ignores the leading caret, types suit codes "!S !H !D !C", then shortcut codes "`2 `4" (-> 2nd 4th). The guide states the blur rule three times: "you must exit the field to initiate the rich enhancement" (p.9), "you need to exit a field before the codes are actioned" (p.17), "When finished with changes to a field, you need to exit the field for the changes to take effect" (p.22). From the 2020 update users "need to View Editable Fields to expose the hints when hovering" then "use Refresh to show the rich fields that are printed."

## Core interaction mechanisms (with corrected code citations)

**1. Bookmarks ARE the menu.** The 127 titles (bookmark_titles.txt) are the whole command surface: Status Check, REFRESH, View editable fields, Popup Messages, Richness = None/Basic/Rich, ToolBox (Set Date, Swap Players, Print the Card, Print Partner's Card, Trim Leading Spaces, Encode Unicode, Make/Append/Remove Retired Fields, Check Old Fields), Load an FDF file, Clear & Load FDF, CheckBox Format (Big X / Small Black / Tick / Cross / All Black), Date Format (NoDates / 19/09/2017 / 19 Sep 17 / 2017-09-19 ...), Fill Colours (Hide / Gray and white / Normal), Text Colours / Suits Black.R.B.G. / Suits Blue.R.O.G., Expose Java Console, Make FDF in Log, plus a deep HELP tree. Guide p.21: "our bookmarks function more like a menu of commands rather than links ... it is best to click on the action box/flag rather than the name." Most group headings also pop a descriptive message, so bookmarks double as help.

**2. The "?" -> pick-a-code popup (Lists in Text Fields).** CORRECTION to the draft: this is NOT at clean_1_block37.js:1341. The real logic is a field **Validate** script (js_all_clean.js line 68). It reads the field's tooltip via `bAXhint=bAXf.userName;` (the AcroForm /TU). If the typed value is "?", it shows the tooltip verbatim: `app.alert({cMsg:'INFO:'+bAXhint,cTitle:'Field info:',nIcon:3});event.rc=false;`. If instead a single digit was typed, it searches the tooltip for the newline-delimited entry `'\r'+bAXv+' : '` and substitutes the phrase: `bAXzz=bAXpp+bAXhint.substring(bAXik,bAXjk)`. So "1" in BasicSystem expands to "Standard" because field_tooltips.txt line 18 holds `1 : Standard r 2 : 2/1 r 3 : Acol r 4 : Precision r 5 : Strong club r 6 : Honeymoon Moscito` (the 'r' are stripped CR breaks). The combobox dance: Tab in (selects all) -> type "?" -> Tab -> alert shows list -> Enter/space dismiss -> contents return selected -> type the digit -> blur -> phrase expands. Guide p.30 explains why: "Combo Boxes ... were the dropdown lists used in the 2013 version ... In the 2015 version, they have transformed into rich text fields and a code selection method added." The dropdown was removed and reimplemented as a modal loop because rich-text fields cannot be combo boxes.

**3. Shortcut (grave) and rich (!) codes.** Grave accent introduces preloaded shortcuts ("From 2016 update", p.17); the demo `2 `4 -> 2nd 4th (p.9). CORRECTION: clean_1_block37.js:494 `if(qBXfv.indexOf('`')>=0)` is inside `gFCX` (the Status Check field-counter, counting fields that contain codes) - it does NOT perform expansion; expansion happens in the field keystroke/format scripts. "!" introduces rich codes: `!s/!h/!d/!c` -> coloured suit symbols (uppercase S H D C when rich unavailable), `!u` underline, `!b/!B` bold, `!i` italic, `!^` superscript, `!v` subscript, `!-` shrink font, `!T` tab/column spaces, `!U+` Unicode, colour codes (Appendix 9, pp.49-52). The guide warns "avoid the !# code as it has multiple uses", and "any use of italics can massively boost the file size" (p.49).

**4. Imitation checkboxes & classification.** Guide p.30: "Since the 2015 form, the old fields are now imitation checkboxes (our terminology)." The 2017 update lets you "click anywhere between the start of the side heading to the left of the box and the right edge of the box. This also applies to Classification colours." Default style is "a big X to avoid printing problems reported by some users of the 2013 version which used a cross." The state is stored in `My_CheckBoxValues`. Classification colour and the big top-right circle are driven by JS; crucially `gFcb` (js_all_clean.js) sets `app.runtimeHighlight` directly: clicking the classification circle toggles Acrobat's own "Highlight Form Fields" feature, which is exactly why that feature hides the form's fill colours and must be disabled first (p.30: "The background fill colour of checkboxes may not be visible if field highlighting is enabled").

**5. Action Areas (p.25).** Pale-pink/yellow clickable rectangles overlay the card. "Top left of both pages: provides a short menu to allow REFRESH or View Editable Fields. Show Priorities provides a popup ... MyRev. provides an option to update the date ... ABF Nos. & Names allows Swap Player details ... Click on the ABF Logo will expose the big field with the JavaScript and bookmarks warning." Genuine platform defeat (p.25): "in Adobe Reader the layers will be hidden but the active print process will still print them. We will warn you ... when you may need to reprint the card." ToolBox / Print the Card "minimizes this problem in Adobe Reader." Stored in `My_Rectangles`.

**6. Swap-to-print.** On print (unsigned), js_all_clean.js: `if(gFaA(1,2,'Swap Players?','Click <OK> to swap Player details ')==1)gFsP();`. `gFsP()` swaps `PlayerName_A` and `PlayerName_B` (and their richText/fillColor/border state, and numbers), then swaps back after printing (pp.20,24). ToolBox / Swap Players makes it permanent. WillPrint calls `gFbP(0)` for pre-print preparation.

## Saving, sharing, loading

Save_As-with-new-name is mandated; guide p.10 "Save it often, with a new name occasionally, to maximize your recovery options." Sharing: send the PDF, or export a ~30kB FDF (p.31 "Our FDF files are much smaller (at about 30kB)"). The killer caveat (p.31): "Exporting to FDF files ... is possible with Foxit Reader, and with Adobe Acrobat (Professional or Standard) ... Sadly, this is not available in any version of Adobe Reader" - the recommended free reader cannot perform the recommended sharing/upgrade path. The form added a workaround: the **Make FDF in Log** bookmark (bookmark_titles.txt line 2) uses `this.exportAsFDFStr({bAllFields:1,bFlags:1})` - the *string* variant that DOES work in Reader - and prints it to the JS console for manual copy ("around version 21E15 we added a method of making FDF files using only Adobe Reader", p.31). Upgrades rely on FDF round-tripping plus retired-field merge bookmarks (Append Old Fields, Make/Check/Remove Retired Fields), implemented by `gMRFL` building gOfPH/gOmPH old-vs-new field hashes.

## Biggest pain points (motivating a web rebuild)

- Fragile configuration-dependent runtime: enable Acrobat JavaScript, trust the document, disable Highlight Form Fields, enable the overflow indicator - all global Reader settings.
- The yellow JS-warning overlay (page-1 image) literally instructs the three preference changes (Enable_Acrobat_JavaScript, Show_text_field_overflow_indicator, disable Show_online_storage_when_saving_files) and self-erases when JS runs.
- Edit-then-REFRESH split + twin fields: you edit a hidden editable field, REFRESH to repaint the D_ display field; tooltips live only on the editable twin, so help needs View Editable Fields first.
- Modal-heavy entry: "?", dismiss, retype digit; long help chunked into multiple alerts whose height the user pre-picks via Popup Messages ("the default is middle sized to make this easier for users with small screens", p.10).
- Invisible overflow: "Overflowing text in a field is invisible" (p.20); only the optional "+" overflow indicator warns, and it prints.
- Print fiddliness: LANDSCAPE, "FLIP on SHORT SIDE" duplex, custom 90-94% scale, Print-as-image for suit symbols, action-area reprint warnings.
- Browser-hostile: "Do NOT attempt to use the form in a browser window. Avoid EDGE on Windows X" (p.7) - the irony that motivates rebuilding it as a web page.

## What users actually care about

The bridge content: player names/numbers, classification + brown sticker, opening bids/responses (sections 1-10), leads/signals/discards/count, defensive conventions. The valued conveniences: shortcut/preset code lists, coloured suit symbols, WBF abbreviations (pp.21,42-43; note "WBF abbreviations use FG (not GF) for Forcing to Game, and TRF ... for transfer"), swap-to-print personal cards, compact FDF sharing. Everything else (richness modes, font tweaks, twin fields, retired-field migration, Java console) is machinery tolerated rather than wanted.

## Key Mechanisms

### Bookmarks-as-command-menu (127 bookmarks)
- What: Provides the entire app command surface: Status Check, REFRESH, View editable fields, Richness=None/Basic/Rich, ToolBox (Swap Players, Set Date, Print the Card/Partner, Trim Leading Spaces, Encode Unicode, Make/Append/Check/Remove Retired Fields), Load an FDF file, Clear & Load FDF, CheckBox Format, Date Format, Fill/Text Colours, Make FDF in Log, Expose Java Console, and a deep HELP tree. Clicking a bookmark's flag runs JS.
- Evidence: bookmark_titles.txt lists 'Status Check','REFRESH','View editable fields','Richness = Rich','Swap Players','Load an FDF file','Make FDF in Log','Expose Java Console' etc. Guide p.21: 'our bookmarks function more like a menu of commands rather than links'; 'it is best to click on the action box/flag rather than the name.'
- Why: A PDF form cannot add custom toolbar/menu buttons, so the PDF outline (bookmarks) is repurposed as the only available menu affordance; users must be taught to click the flag, not the name, and that editing bookmarks is 'unwise.'

### '?' hint-popup code picker (field Validate script)
- What: Typing '?' in a field and tabbing out pops up that field's tooltip as an alert; typing a single digit instead substitutes the matching phrase from the tooltip on blur. Reimplements a dropdown as a modal loop.
- Evidence: js_all_clean.js line 68 (field Validate): reads `bAXhint=bAXf.userName`; `if(bAXv==='?'){... app.alert({cMsg:'INFO:'+bAXhint,cTitle:'Field info:',nIcon:3}); ... event.rc=false;}` else searches `'\r'+bAXv+' : '` and sets `bAXzz=bAXpp+bAXhint.substring(bAXik,bAXjk)`. Tooltip source: field_tooltips.txt l.18 BasicSystem '1 : Standard /2 : 2/1 /3 : Acol /4 : Precision /5 : Strong club /6 : Honeymoon Moscito'. Guide p.9-10 step-by-step. (Draft mis-cited clean_1_block37.js:1341, which is unrelated font-array logging.)
- Why: The 2015 rich-text rewrite removed the 2013 combo boxes (guide p.30 'Combo Boxes ... have transformed into rich text fields'); the dropdown was rebuilt from the tooltip text + an alert because a rich-text field cannot also be a combo box.

### Rich '!' codes and grave-accent shortcut codes
- What: '!' introduces rich formatting (!s/!h/!d/!c coloured suits or uppercase S H D C as fallback, !u underline, !b/!B bold, !i italic, !^ superscript, !v subscript, !- shrink font, !T tab/columns, !U+ Unicode, colour codes); grave accent '`' introduces preloaded shortcuts (`2->2nd, `4->4th). Codes render only after the field loses focus.
- Evidence: Guide pp.9,17,49-52 code tables; blur rule stated 3x (pp.9,17,22): 'you need to exit a field before the codes are actioned.' Italics warning p.49 'any use of italics can massively boost the file size.' NOTE: clean_1_block37.js:494 `qBXfv.indexOf('`')>=0` is in gFCX status-counting, not expansion (draft implied otherwise).
- Why: PDF text fields have no rich-text toolbar; inline ASCII escape codes are the only way to encode suit symbols/formatting that survive FDF text export and round-trip across form revisions.

### Editable/Display twin fields + REFRESH + View Editable Fields
- What: Each rich field is two overlapping PDF fields: an editable one (holds codes, exports to FDF, carries the tooltip/userName) and a D_-prefixed display one (rendered/printed, noView while editing). 'View Editable Fields' (gFDC) flips display flags so codes/tooltips are reachable; REFRESH repaints all display fields.
- Evidence: Guide p.10 'you need to View Editable Fields to expose the hints when hovering ... use Refresh to show the rich fields that are printed'; gFDC in js_all_clean.js sets `xAXrf.display=display.noView` on D_ field and `xAXf.display=display.noPrint` on editable; field_tooltips.txt shows D_* fields whose only hint is '... see bookmark [HELP / General / The Display Fields]'.
- Why: Adobe skips reformatting unchanged fields, leaving raw editable codes exposed; the twin-field split isolates the printable render layer and (per context) minimizes saved file size, at the cost of an edit->REFRESH friction and tooltip-only-on-the-twin help.

### JavaScript-warning overlay field (yellow box)
- What: A large field covering page 1 listing setup steps; it auto-hides when JS runs, and 'Click in this field should hide this message'; residual scrollbar is cleared by clicking the card. Clicking the ABF logo re-exposes it.
- Evidence: Form page-1 image (verbatim): 'ALERTS: 1. Can you see the bookmarks? 2. This form needs javaScript. ... In <JavaScript>, tick Enable_Acrobat_JavaScript ... When opening this form, this field should vanish if javascript is active. Click in this field should hide this message. IF....that leaves a scroll bar or other residue ... click once or twice anywhere in the card should clear it.' Guide p.7 'Does the big JavaScript warning message remain visible after opening?'
- Why: The form has no way to detect a dead JS engine except by showing static content that working JS removes on success - a self-test whose persistence IS the failure message.

### Imitation checkboxes & classification colour / highlight toggle
- What: Clicking from a side-label to the right box edge toggles a pseudo-checkbox or cycles classification colour, filling the big circle and brown-sticker dot. Clicking the classification circle also toggles Acrobat's own field highlighting.
- Evidence: Guide p.30 'imitation checkboxes (our terminology)', '2017 update allows click anywhere between the start of the side heading ... and the right edge of the box. This also applies to Classification colours'; default 'big X to avoid printing problems'. State in My_CheckBoxValues. js_all_clean.js gFcb sets `app.runtimeHighlight=lBXnfx` directly; guide p.8 'Click in the circle should toggle highlighting form fields.'
- Why: Real checkbox widgets printed poorly (the 2013 cross) and field highlighting hid fill colours; JS-driven appearance fields give a consistent grayscale-printable classification indicator and let the form fight Acrobat's Highlight Form Fields default in-place.

### Swap-Players print workflow (gFsP)
- What: On print (unsigned), offers to swap PlayerName_A/PlayerName_B (names, numbers, fill/border state) so each partner prints a personal card, then swaps back; ToolBox/Swap Players makes it permanent.
- Evidence: js_all_clean.js `if(gFaA(1,2,'Swap Players?','Click <OK> to swap Player details ')==1)gFsP();`; gFsP body swaps `PlayerName_A` and `PlayerName_B` (valueAsString, richText, fillColor, borderStyle, strokeColor, lineWidth). Guide pp.20,24.
- Why: One physical card serves both partners; rather than duplicate data, JS reorders the heading at print time - impossible in a static PDF.

### FDF export/import + Make FDF in Log (Adobe Reader workaround)
- What: Field data exports to a ~30kB FDF and imports into a newer form via Load an FDF file. Because Adobe Reader can't write FDF, the Make FDF in Log bookmark dumps an FDF string to the JS console for manual copy.
- Evidence: Guide p.31 'Our FDF files ... about 30kB'; 'Exporting to FDF files ... Sadly, this is not available in any version of Adobe Reader'; '21E09 update ... adds a method of preparing an FDF file in Adobe Reader.' js_all_clean.js uses `this.exportAsFDFStr({bAllFields:1,bFlags:1})` (the string method available in Reader) and console.println's it; bookmark_titles.txt l.2 'Make FDF in Log'.
- Why: FDF lets a card outlive any single form revision and shrinks the share payload, but Adobe Reader lacks file-level FDF export, so the form falls back to the exportAsFDFStr string method piped through the console.

## Limitations & Workarounds
- PDF forms cannot add toolbar/menu buttons -> the 127 PDF outline bookmarks are repurposed as the command menu, and users must be taught to click the flag (action box) not the name, and never edit the bookmarks.
- No way to verify the JS engine is alive -> a static yellow overlay field is shown that working JS deletes on open; if it stays, JS is off. The overlay itself lists the exact preference toggles (Enable_Acrobat_JavaScript, Show_text_field_overflow_indicator, disable Show_online_storage_when_saving_files).
- No native rich-text editor in PDF fields -> inline '!' escape codes and '`' shortcut codes that only render on field blur (rule stated 3x: pp.9,17,22); suit symbols must be coded, not pasted, so they survive FDF text export.
- Lost real combo boxes in the 2015 rich-text rewrite -> dropdowns rebuilt as a '?'-types-into-field, tooltip(userName)-alert popup, pick-a-digit substitution loop in a field Validate script.
- Adobe skips reformatting unchanged fields, exposing raw editable codes -> twin editable/D_ display fields plus a manual REFRESH and 'View Editable Fields' (gFDC) command; tooltips live only on the editable twin, so help requires exposing it first.
- Acrobat 'Highlight Form Fields' hides the form's own fill/classification colours -> the form both instructs users to disable it AND, via gFcb setting app.runtimeHighlight, toggles it off when you click the classification circle.
- Overflowing field text is silently clipped (fixed width/height) -> rely on the reader's optional '+' overflow indicator (Show_text_field_overflow_indicator), which users must enable and which prints.
- Adobe Reader (the recommended free reader) cannot write FDF files -> the Make FDF in Log bookmark uses exportAsFDFStr (string variant) dumped to the JS console as a manual copy/paste workaround; otherwise users need Foxit or paid Acrobat.
- Action-area overlay layers can't be reliably hidden at print in Adobe -> JS hides them on screen but 'the active print process will still print them', so the form pops a reprint warning and provides ToolBox/Print bookmarks that minimize it (works in Foxit 9+).
- Same-name SAVE bloats the file in some readers -> Save_As with a new name is mandated; guide advises saving 'with a new name occasionally' to maximize recovery options.
- Browsers/Edge break JS, saving, or flatten the form -> guide repeatedly forbids browser use ('Do NOT attempt to use the form in a browser window. Avoid EDGE on Windows X').
- Long help/messages exceed small-screen dialog height -> messages are chunked into multiple alerts and a Popup Messages bookmark lets users pre-pick a dialog height (default middle 'to make this easier for users with small screens').
- Clearing a field or leaving spaces can be auto-reset -> the form may revert to the default caret code '^ ' (guide p.22 warning; '^ ' literal appears in the JS), risking surprise data loss.

## User Impact
- First run is heavy: install Adobe, set default, enable JS + trust, expose bookmarks, disable Highlight Form Fields, enable the overflow indicator, run Status Check, Save_As, reopen in a fresh session to verify - all before entering real bridge content (guide pp.7-8).
- Constant 'did it work?' ambiguity: codes render only on blur (stated 3x), rich changes need a manual REFRESH, and the editable-vs-display twin means what you edit is not what you see/print.
- Tooltips (the inline help) are invisible until you run 'View Editable Fields'; beginners hover and see nothing, just the field name, or a bare D_ pointer to a HELP bookmark.
- Choosing a preset value is a modal dance ('?' -> dismiss alert -> retype digit) instead of a simple dropdown, a direct UX regression from the 2013 combo boxes.
- Silent data loss risk: overflow clips text invisibly, clearing a field can reset it to the caret default '^ ', and flatten/sign/Preview can wipe or disable the card (Status Check reports 'no fields ... FLATtened/signed ... MOST bookmarks will do nothing').
- Sharing is awkward: the recommended free reader (Adobe) cannot export the compact FDF, so partners must align on reader software or use the console-log FDF hack.
- Save fatigue: Save_As-with-new-name is the sanctioned workflow, plus manual cleanup of accumulating files.
- Printing requires manual landscape / flip-on-short-side duplex / 90-94% scale tweaks, may need Print-as-image for suit symbols, and may reprint because action-area layers print through in Adobe.
- Convenience upside: shortcut/preset code lists, coloured suit symbols, WBF abbreviations, and swap-to-print personal cards are genuinely useful once mastered; completing the full two-page card is praised as a partnership-agreement exercise (p.10).

## Surprises
- The '?'-picker reads the AcroForm tooltip (event.target.userName) at runtime as a live data source for substitution - the help text and the autocomplete data are literally the same field property, so a single tooltip string does double duty as help, popup, and value source.
- The classification circle click does not just set a colour - gFcb directly flips Acrobat's app.runtimeHighlight, so the form actively reaches into and toggles a host-application setting to defeat the feature that would hide its own colours.
- Adobe Reader, the recommended free reader, cannot write the recommended FDF share format; the workaround is exportAsFDFStr piped to the JavaScript console (Make FDF in Log) for manual copy - the happy path requires opening the Java Console.
- The yellow overlay is a self-erasing self-test: it lists the exact three preferences to change and then deletes itself when JS runs; a stuck overlay IS the error message, and clicking the ABF logo deliberately brings it back.
- Onboarding is formally Phase 1 (environment) + Phase 2 (codes) - a 4-page tutorial before productivity, signalling how much the platform fights the user.
- Dropdowns were real combo boxes in 2013, removed in the 2015 rich-text rewrite, and reimplemented as the clumsy '?'+alert+digit loop - a documented UX regression driven by the rich-text architecture (guide p.30).
- Action areas are hidden on screen but Adobe still prints them, so the form must pop a reprint warning - a candid admission the workaround only fully works in Foxit 9+.
- Even trivial formatting carries a file-size penalty: 'any use of italics can massively boost the file size' (p.49), so the guide discourages a basic formatting choice.
- The draft's two code citations (clean_1_block37.js:1341 for the hint, :494 for grave expansion) were both wrong: :1341 is font-array console logging and :494 is status-check counting; the actual '?'/digit logic is a field Validate script in js_all_clean.js.

## Open Questions
