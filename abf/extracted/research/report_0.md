# DIMENSION 0: JS engine & function library

## Summary
The form is a single-file JavaScript application disguised as a 2-page PDF. Its code splits into two tiers: (1) a ~26KB document-level OpenAction script (PDF object 687, referenced as `/OpenAction 687 0 R`, with `/S/JavaScript`) that runs once at open â it declares ALL global state, defines the lowest-level primitives (gFXa, gFaA, gMDH, gSWH, gFpB, gFPTC, gFnS, gFfS) that the rest of the code only *calls*, builds the gFHash field-type map, and bootstraps via `gFiF('AtOpenUp')`; and (2) the ~76-function library lazily (re)defined across the 183 scattered /JS action blocks (block36 â59KB, block37 â37KB) plus the rendering engine (block20 â15KB) and Calculate scripts (block26 I_Format, block32 My_Rectangles). Every library function is wrapped in `if(typeof X==='undefined'){function X(){...}}` (exactly 78 guards in js_all_clean.js) so any of the 183 action strings can safely be the "first" to install the library. The naming convention is gF*=function helper, gR*=rich/rectangle, gM*=make/manage, gS*=set/screen; per-function locals use 3-char prefixes (hSX, vSX, yEX, mEX, qBX, jEXâ¦) and a recurring `RoL` parameter suffix.

## Report
# JS Engine & Function Library â Verified Architecture

## Two-tier code layout (verified, with one correction)
The draft's central finding is **correct and I confirmed it independently**: the lowest-level primitives are NOT in any of the 183 action blocks. `grep "function gFaA"`, `"function gFnS"`, `"function gFfS"` against `js_all_clean.js` = **0 hits each**. They live in the document-level OpenAction script, PDF **object 687** (`/OpenAction 687 0 R` is literally present in `ABF_Card_FORM.pdf`; the JS string `var gOzX...` sits in plaintext at byte offset 5400 â the object is NOT compressed, which is how it was extracted). The extracted copy is `extracted/_openaction_clean.js` (beautified) / `_openaction_init.js` (raw, **26,046 bytes â 26KB** â the draft's "27.5KB" in its packing paragraph is internally inconsistent with its own "26KB" elsewhere; the true size is ~26KB).

This OpenAction script: (1) declares every global (`var gOzX=' ';var gVrbL=0;...`), (2) defines gFXa, gFaA, gMDH, gSWH, gFpB, gFPTC, gFnS, gFfS, (3) runs the open-time bootstrap. Runtime model: **OpenAction defines core + globals once; the 183 action strings re-define the rest under typeof-guards on first use, then call into the core.**

## Document-open sequence (`_openaction_clean.js`)
Verified order: read `My_Options` into gOzX â hide `A_JN` (the JS-warning field, `display.hidden`, L13-17) â `var gDFH={};gMDH();` (build the editableâ`D_` display-field hash, L184-186) â **probe field actions** via `['T_ONE:gFiF','T_OMD:gFFc','T_OOF:gFcZ']` (L197): it flips each probe field's value (`hBXf.value=((hBXf.valueAsString=='Aq')?'Az':'Aq')`) to force the field's own action to fire, then `eval('var hBXxFt=typeof '+hBXxF)` to confirm the named function compiled (L209-212) â `gFiF('AtOpenUp')` (L215, master init) â set `I_THIS='x'` â `gFcZ(My_FormatA)` â build literal `gFHash` (L307-309) then prefix-fill it for all 601 fields (L314-359) â detect viewer: Nitro (L284), Foxit (`gAvT.substr(0,5)=='Foxit'`â`gTfXR=1`, L367), `app.formsVersion<9`â`gAfW=false` (L371) â `if(this.external)` alert "This form is not supported in a browser window" (L376-378) â define `gFnS`/`gFfS` (L385-408) â probe rich-text capability by writing a 2-span `richValue` to `T_SPANs` and reading it back (`if(typeof(hBXoprz)!=='undefined')gRMx=8`, L726-744) â finalize richness and run `gFiF('*FixUpALL')` if rich (L876-882).

## gFHash type-dispatch table (verified)
`gFHash` maps every field name to a one-char type code. The literal seed (L307-309) is real and I read it in full: e.g. `'A_JN':'j'`, `'Classification':'v'`, `'IsBlackwood':'K'`, `'My_Options':'S'`, `'T_SPANs':'i'`, `'Z_Sticker':'z'`. Prefix-fill (L325-345): `D_`â'R', `B_`â'B', `Q_`â'Q', `Box`â'x', `L_`â'L', `V_`/`v_`â'V'; plain text fields with `rect[1]>0`â'T'.

**Correction/depth the draft missed:** there is NOT one dispatch string â there are at least three. The dominant one is `'T|>RLyzBQxKvwoiSjV'` (used in gFrSS@OpenAction L574 and many places). But **gFCX uses a DIFFERENT ordering**: `'T|>RoOSijVxBKQvwyz'` (clean_1 L466), and shorter variants `'T|>RLxV'` and `'T|>RL'` appear too. Each function picks the position-string whose index ranges encode the category tests it needs (e.g. gFCX treats index 3 = display field `R`, index<3 = editable, index 3-5 = "old/settings", 9-10 = `V`-rectangles). So the "one string encodes the whole taxonomy" claim is only true per-function; the *ordering* is re-tuned per call site.

## Key helpers (all verified against source)
- **gFaA(hSXt,hSXi,hSXl,hSXm)** (OpenAction L41) â universal alert/confirm wrapper, called 49Ã. Confirmed: (a) long-message pagination â `hSXmlA=hSXm.split('\r')`, threshold `hSXmx` = 10/20/40 lines depending on `gTMF` (L67-69), splitting into sequential "`>>> Long message...click <OK> to proceed >>>`" dialogs (L117); (b) auto-OK "hot cancel" via `oCheckbox:gMyABs.oHotCancel` triggered by `_?_`/`_?_*` markers in the message (L51-60); (c) Foxit return-code fix `if(hSXr>4)hSXr=gFXa(hSXr)` (L88,121).
- **gFXa(zSXv)** (OpenAction L35) â verified literally: `if(zSXr==6)zSXr=4;if(zSXr==7)zSXr=3;` â remaps Foxit's nonstandard Yes/No codes to Acrobat's 4/3.
- **gFsH(qDXRoL)** (clean_1 L954) â **CONFIRMED: this is the HELP-text display function, NOT show/hide.** It looks up `gHlpH[tag]`, falls back to `gHlpH['MISSING']`, expands markup `<n>`âCR, `<T>`âtab, `<L>`â`(`, `<R>`â`)`, `<HELPTAG>`âthe tag, splits title from body on `|||` (L977-980), and calls `gFaA(0,3,title,body)`. The original brief's "gFsH = show/hide, 64Ã" is wrong: the 64 occurrences are 64 genuine HELP calls. Real display toggling is done inline via `f.display=display.*` â only **9** such assignments exist in js_all_clean.js (e.g. block20 L909-910), so there is no single 64Ã-called show/hide primitive.
- **gFsV(mJXf,mJXv)** (clean_3 L2) â set-field-value with a `*`-prefix switch. **Correction:** the draft's mapping omitted one case. Full set: `*C`âMy_Colours, `*D`âMy_DateFormat, `*F`âMy_FillColours, **`*I`âI_Format** (missed by draft), `*O`âMy_Font, `*X`âMy_CheckBoxValues, `*Z`âMy_Codes.
- **gFpB(hVXCxD,hVXRoL)** (OpenAction L439) â set checkbox boolean. Verified 3 modes: mode 0 cycles a multi-state box through `My_CheckBoxValues` chars and writes Off/Yes/digit (L445-467); mode 2 toggles Yes/Off (L468-471); mode 1 sets the `Classification` radio from an `IsClass*` field name (L473-482). Has a typo bug shipped in production: `cosole.println` (missing 'n', L484).
- **gFCX(qBXRoL)** (clean_1 L415) â status/consistency scan behind Status Check. Verified bitmask `qBXrs`: bit 1 = Dfâ Dv (display fieldsâ visible), +2 = Tfâ Tq (textâ required), +4 = Dfâ Tf (display countâ text count), +16 = TX<6 (too few formatted), +32 = Df-Dr>10 (rich shortfall) (L545-549). Adding 10 to opt makes it interactive (L419-422); rs>15 prompts Richness=Rich, else prompts gFiF('+*FixUpALL') (L579-587). Tallies ~24 counters into `gCXH` (Df/Dv/Dr/Do/Dh/DnP/DnV/Tf/Tq/Tr/To/Tv/Th/TnP/TnV/TX/Vv/Vn/NL/Sf/NXâ¦).
- **gFiF(yEXRoL)** (clean_0 L2224) â internal-function dispatcher. Verified tokenânumeric map: AskRâ0/42, *FixUpALLâ42, *FixUpALLXXâ42 (xm=1), *ReSetâ36, *Repairâ42, AtOpenUpâ0, F+Râ59, DltRdotsâ66, MakeRdotsâ67, MakeRetiredFieldsâ71, SetFocus:â75, Jiggle:â76, TfR:â80, CancelRichFieldsâ77, TrimSpacesâ79, ResetCodesâ83, AnnRest/Hide/Remv/Fadeâ91/92/93/94. **Code 42 = REFRESH** (L2385-2575): re-writes My_Colours/My_Font/My_Codes/My_DateFormat (set value then reset to fire their Format scripts), toggles My_Richness to a different mode and back, then loops `this.numFields` and for every `required` text field re-asserts its value (`yEXdgf.value=yEXwvA[yEXwni]`, L2550-2554) to force the Format event to re-render. Uses `app.thermometer` for a progress bar (L2476-2493) and `delay=true/false` to batch repaint.
- **gFbR(xDXRoL)** (clean_1 L1067) â Richness switch. **Confirmed two-pass requirement:** to reach 'Rich' it alerts "We need to set mode NONE before RICH mode i.e. there will be 2 refresh cyclesâ¦ The screen may not refresh until this completes" (L1072), sets `My_Richness='Nothing'`â`'None'`, runs `gFiF('+*FixUpALLXX')`, then sets `='Rich'` and runs `gFiF('+*FixUpALL')` â two full refreshes.
- **gFsP()** (clean_0 L2126) â swap players. Verified: saves richText/value/fillColor/borderStyle/strokeColor/lineWidth of PlayerName_A/B and PlayerNo_A/B, cross-assigns, `this.delay=true` to batch; only swaps richText when `gRMo==8`; only swaps borders when `My_Options` contains `SwpBrdr`.
- **gFOP(pBXRoL)** (clean_1 L595) â toggle space-delimited flags in My_Options, parsing `+`/`-` prefixes (`'-+'.indexOf(pBXos)`, L607).
- **gFxWS()** (clean_1 L1573) â WillSave hook. Stamps `I_LastSave` with `gRevC.gBldT` (rev 21E29 / build 2115), timestamp, app.formsVersion/viewerVersion/viewerType/viewerVariation/platform, `identity.name`/`loginName`, and refresh count `gNumR` (L1605-1634); warns when `this.filesize` exceeds 1,550,000 bytes (1,810,000 for Foxit) to "SAVE_ASâ¦ to optimize" (L1580-1581); keeps the A_JN JS-warning hidden.

## Bonus mechanism the draft listed as an open question â now resolved
**gFVbR(kEXRoL)** (clean_1 L1093) is the complete `!`-markup legend/decoder. It documents the full code set: colours `!0`=BLACK `!1`=RED `!2`=BLUE `!3`=FUCHSIA `!4`=GREEN `!5`=PURPLE `!6`=CERULEAN `!7`=BROWN `!8`=DARKBROWN `!9`=ORANGE `![`=60%GRAY `!]`=SILVER `!:`=GAINSBORO `!;`=WHITE; styles `!i`=ITALIC `!b`=BOLD; alignment `!<`=LEFT-J `!|`=CENTERED `!>`=RIGHT-J; sizing `!+`=LARGER `!-`=SMALLER; and `!N`/`!=` which are context-dependent (`!=` means NormalSize in rich mode gRMd==8, but LOCK otherwise). This is the precise catalog needed for a faithful web re-implementation of the render mini-language.

## Rendering engine (block20) â verified
block20 is the shared Format handler. Confirmed: reads `event.value` (L6), builds rich span objects into `cBXSP[]`, assigns `event.richValue=cBXSP` (L872) and also to the paired display field (`cBXdf.richValue=cBXSP`, L878). Suit symbols use `fontFamily=['Cards']` (L448) with the Bridge/Cards fonts; unicode via `String.fromCharCode(cBXucd)` (L332). The two-field display swap is verified at L909-910: `cBXRf.display=display.noView` (display twin hidden while editing) / `cBXf.display=display.noPrint` (editable hidden on paper). Tab-out handling keys on `event.commitKey==3` (L917).

## Packing / minification (verified)
The OpenAction `/JS(...)` is one PDF string literal in plaintext (object 687 uncompressed). In-alert newlines are written as the escaped two-char sequence `\r` (rendered by app.alert as a line break); these appear throughout. 78 `if(typeof gâ¦==='undefined')` guards make every action idempotent.

## Key Mechanisms

### OpenAction object 687 (document-level /S/JavaScript)
- What: Runs once at open. Declares ALL globals and defines the core primitives (gFXa, gFaA, gMDH, gSWH, gFpB, gFPTC, gFnS, gFfS), builds gFHash, then bootstraps via gFiF('AtOpenUp').
- Evidence: `/OpenAction 687 0 R` present in ABF_Card_FORM.pdf; JS string `var gOzX` at raw byte offset 5400 (uncompressed). gFaA@_openaction_clean.js L41, gMDH@L127, gSWH@L164, gFpB@L439, gFnS/gFfS@L385/389. grep `function gFaA`/`function gFnS`/`function gFfS` in js_all_clean.js = 0 hits each (they exist only here).
- Why: A PDF runs code automatically only via OpenAction or field AA events. Core primitives must exist before any field action fires, so they go in the one script guaranteed to run first.

### typeof-undefined idempotency guards (exactly 78)
- What: Wraps each library function in `if(typeof X==='undefined'){function X(){...}}` so re-execution from any of the 183 scattered action strings is safe and the library self-installs lazily.
- Evidence: `grep -oE "if\(typeof g...==='undefined'\)" js_all_clean.js` = 78 matches; every function in clean_0/clean_1/clean_3 opens with this guard (e.g. gFnK@clean_3 L28, gFOP@clean_1 L594).
- Why: PDF /JS actions share no module system and have no guaranteed load order; guards make every action self-sufficient and prevent 'function already defined' errors when multiple actions carry the same library copy.

### gFHash type-dispatch with per-callsite ordering strings
- What: Maps every field name to a one-char type code (T,|,R,B,Q,x,V,S,K,j,o,zâ¦); hot loops branch on indexOf into a position string. Different functions use different orderings.
- Evidence: Literal seed gFHash@OpenAction L307-309; prefix-fill L325-345. Dominant string `'T|>RLyzBQxKvwoiSjV'` (gFrSS@OpenAction L574). gFCX uses a DIFFERENT string `'T|>RoOSijVxBKQvwyz'` (clean_1 L466); variants `'T|>RLxV'`, `'T|>RL'` also occur.
- Why: Single-char codes + a position string give a compact fast switch over 601 fields; each function re-orders the string so its own index-range tests (e.g. <3 = editable, ==3 = display field) line up â there is no single canonical ordering.

### gFaA alert wrapper: long-message pagination + Foxit code fix
- What: Centralizes all dialogs; splits over-long messages into sequential 'click OK to proceed' alerts (threshold 10/20/40 lines per gTMF), supports an auto-OK 'hot cancel' checkbox, and normalizes Foxit return codes via gFXa.
- Evidence: _openaction_clean.js L41-126: `hSXmx=20; if(gTMF<1)hSXmx=10; if(gTMF>1)hSXmx=40;` (L67-69); paged loop appends `'>>> Long message...click <OK> to proceed >>>'` (L117); `oCheckbox:gMyABs.oHotCancel` (L77); `if(hSXr>4)hSXr=gFXa(hSXr)` (L88). gFXa@L35: `if(zSXr==6)zSXr=4;if(zSXr==7)zSXr=3;`. Called 49Ã.
- Why: Acrobat/Reader alerts grow downward and push OK off-screen for long text; pagination keeps OK reachable. gFXa exists because Foxit returns 6/7 instead of Acrobat's 4/3 for Yes/No.

### gFsH HELP-text display (markup mini-language)
- What: Looks up help text in gHlpH[tag], falls back to gHlpH['MISSING'], expands custom markup, splits title|||body, and shows it via gFaA. This is the form's entire context-help system.
- Evidence: clean_1 L954-994: `qDXm=gHlpH[qDXxv]`; replaces `<n>`â\r, `<T>`â\t, `<L>`â'(', `<R>`â')', `<HELPTAG>`âtag (L968-973); `qDXmi=qDXm.indexOf('|||')` splits title from body (L977-980); `gFaA(0,3,qDXttl,qDXm)`. 64 occurrences = 64 help calls, not show/hide.
- Why: A PDF form has no help framework; help text is stored in fields (gHFldH maps A_Helpâ¦A_Help5/A_MyHelp to slots 1-6) and rendered through the same alert pipeline as everything else.

### REFRESH via gFiF code 42 (brute-force re-render)
- What: Re-writes every required text field's value back onto itself, and re-pokes My_Colours/Font/Codes/DateFormat/CheckBoxValues, to force each field's Format event to re-fire and rebuild all rendered display text.
- Evidence: clean_0 L2385-2575: pokes My_Colours `value=v+'*'` then `=v` (L2389-2392); toggles My_Richness to a different mode and back (L2432-2447); loops `this.numFields`, for each `required` text field `yEXdgf.value=yEXwvA[yEXwni]` (L2550-2554); uses app.thermometer progress bar (L2476-2493).
- Why: PDF has no 'invalidate & recompute formatting' API; writing a field's value is the ONLY trigger for its Format script, so REFRESH brute-forces a full re-render.

### gFbR Richness switch â mandatory two refresh passes
- What: To enable Rich text it must first set None then Rich, running two full refresh cycles, because rich-text spans can't be enabled in a single pass.
- Evidence: clean_1 L1067-1091: alert 'We need to set mode NONE before RICH mode i.e. there will be 2 refresh cyclesâ¦The screen may not refresh until this completes' (L1072); `xDXMR.value='None'; gFiF('+*FixUpALLXX')` then `xDXMR.value='Rich'; gFiF('+*FixUpALL')`.
- Why: Setting field.richText and assigning richValue spans only takes effect on a clean Format pass; the None pass clears prior state so the Rich pass can rebuild spans without stale formatting.

### Dynamic setAction wiring for click 'checkboxes' and rich fields
- What: At runtime attaches OnFocus/MouseUp JS to D_ display fields (and V_/Box overlay fields) so clicking them runs library functions â emulating buttons and checkboxes a PDF form can't otherwise provide.
- Evidence: gFmkR@clean_1 L1131: creates `D_`+name via this.addField then `jEXf.setAction('OnFocus','gRFF();'); jEXf.setAction('MouseUp','gRMU();')` (L1156-1157). block32 wires V_/Box overlays similarly.
- Why: A PDF form cannot add custom toolbar buttons, so all interactive controls are emulated as fields whose mouse/focus events call g-functions.

### gFxWS WillSave provenance stamp
- What: On every save, writes a provenance string into I_LastSave (revision, build, timestamp, viewer identity, user identity, refresh count) and nags when the file grows too large.
- Evidence: clean_1 L1573-1648: builds kMXs = `gRevC.gBldT`+timestamp+` f:`formsVersion+` v:`viewerVersion+` T:`viewerType+` V:`viewerVariation+` o:`platform+` n:`identity.name+` R:`gNumR (L1605-1634); size warning at filesize>1550000 (1810000 Foxit) (L1580-1581).
- Why: Lets the form self-diagnose which viewer last wrote it (Foxit vs Acrobat) so OpenAction can decide whether a refresh is needed after a viewer swap, and reminds users to SAVE_AS to compact the incrementally-growing PDF.

## Limitations & Workarounds
- No toolbar/menu API: the 127 PDF bookmarks ARE the command menu (verified bookmark_titles.txt: 'Status Check', 'Expose Java Console', 'ToolBox', 'Print Partner's Card', 'Load an FDF file', 'Richness = None/Basic/Rich', 'REFRESH', 'Date Format', 'CheckBox Format', 'Swap Players', 'Popup Messages', 'Refresh at Open'), each bookmark's action calling a g-function.
- No module system / load-order guarantee across /JS actions: solved with exactly 78 `if(typeof X==='undefined')` guards so any of the 183 actions can lazily install the library.
- No 'recompute formatting' API: REFRESH (gFiF code 42) re-writes every required field's value to force its Format event to re-render; even the global style fields (My_Colours/Font/Codes/DateFormat/CheckBoxValues) are poked valueâreset to fan out the re-render.
- Alert dialogs push OK off-screen for long text: gFaA paginates long messages into sequential alerts; threshold gTMF controls 10/20/40 lines.
- Viewer incompatibilities: gTfXR branch for Foxit (4-space tab instead of \t, no thermometer gThRm=0, no addField gAfW=false, gDFK=0 to skip .delay); gFXa remaps Foxit alert codes 6/7â4/3; Nitro flagged via gNTrL with its own warning; rich-text (gRMx=8) only when the T_SPANs richValue round-trip probe succeeds.
- Cannot store formatted text compactly: editable field holds terse !-codes (small), separate D_ field (paired by gMDH into gDFH) holds rendered rich spans; this is why a NoneâRich refresh cycle is needed to (re)build spans after edits.
- PDF can only auto-run code from OpenAction or field AA: the open sequence deliberately flips probe fields T_ONE/T_OMD/T_OOF and eval()s `typeof gFiF` to confirm the library compiled â using field events as a 'did my code load?' self-test.
- addField unavailable in some readers (gAfW=false when formsVersion<9 or Foxit Reader): gFmkR creates D_ fields only when addField works, and verifies `jEXf.name===jEXn` afterwards, removing and marking gFHash[name]='*' on failure rather than crashing.
- Browser viewing breaks JS: OpenAction detects `this.external` and alerts 'This form is not supported in a browser window'; the A_JN JavaScript-warning field is hidden by JS once it runs (its visibility on save is managed by gFxWS), so a still-visible warning proves JS never executed.
- Incrementally-saved PDFs bloat over time: gFxWS warns past ~1.55MB and tells users to SAVE_AS to optimize, since fillable PDFs append rather than rewrite on save.

## User Impact
- Users never see the code but feel it: typing a digit shortcut expands to a phrase, and suit symbols/bold/colour appear â all via the block20 Format engine using the gFVbR-documented !-codes.
- After many edits users are nagged to run [REFRESH] or set Richness=Rich/Basic; this is gFCX detecting display/value drift (its qBXrs bitmask) â a real friction point unique to the two-field design.
- Switching to Rich is deliberately slow: gFbR forces None then Rich (two full refresh passes) and explicitly warns 'The screen may not refresh until this completes' â confusing but unavoidable given PDF rendering.
- Long help/status dialogs arrive as several sequential OK-clicks (gFaA pagination); users can shorten them via the 'Popup Messages' bookmark which sets gTMF (TINY/SHORT/LONG â 10/20/40-line threshold).
- Print is safe-by-default: WillPrintâgFxWPâgFbP hides the yellow/pink action-area layers and offers a player-swap before printing, and gFaP restores everything after â so the printed card is clean.
- Foxit/Reader users get degraded features (no thermometer progress bar, no .delay batching, no font-size tweak, no added fields, 4-space tabs) with explanatory alerts rather than silent failure.
- Opening in a browser shows 'not supported in a browser window' and the form won't work, steering users to save locally and open in Acrobat/Reader.
- Status Check (gFCX/gFScK) gives power users a deep console report (per-type field counts in gCXH, file size, viewer identity from I_LastSave) and can auto-fire a refresh when drift is detected.
- On save the form silently records who/which-viewer last edited it (gFxWS stamps I_LastSave with identity.name and app.viewerType) and reminds users to SAVE_AS once the file passes ~1.55MB.

## Surprises
- The original brief's premise was wrong: the 'core' primitives (gFaA, gFpB, gMDH, gSWH, gFnS, gFfS, gFXa, gFPTC) are NOT in the 183 action blocks â grep confirms 0 hits. They live ONLY in the uncompressed OpenAction object 687, the actual heart of the app.
- gFsH is the HELP-text display function, not a show/hide helper. Its 64 occurrences are 64 help calls. Real display toggling (`f.display=display.*`) appears only 9 times total in js_all_clean.js â there is no 64Ã-called show/hide primitive.
- There is no single field-type ordering string: the dominant 'T|>RLyzBQxKvwoiSjV' coexists with gFCX's distinct 'T|>RoOSijVxBKQvwyz' plus 'T|>RLxV' and 'T|>RL' â each function re-tunes the indexOf ordering to its own category tests.
- gVrbL==666 is a developer backdoor shipped in production: `for(var x in this){console.println(typeof(this[x])+' '+x)}` dumps every member of the Doc object; values 88/111/221 progressively unlock deeper logging (.delay/.calculate/.dirty/.layout/.mouse dumps).
- REFRESH 'works' purely by re-writing each field's value back onto itself to re-fire its Format event â there is no real redraw API; the entire visual render is a side effect of value-commit.
- The open sequence provokes its own field actions (flipping T_ONE/T_OMD/T_OOF between 'Aq' and 'Az') and then eval()s `typeof gFiF` to verify the library compiled â using PDF field events as a self-test probe.
- gFsV's shortcut switch includes an undocumented (by the draft) `*I`âI_Format case alongside *C/*D/*F/*O/*X/*Z.
- gFpB ships a typo bug in production: its error path calls `cosole.println` (missing the 'n' in console) â dead code that would throw if reached.
- gFVbR is a self-contained, human-readable legend for the entire !-markup language (16 colours + bold/italic/3 alignments + larger/smaller + context-dependent !N/!=), effectively the spec for the render mini-language â exactly what a web rebuild needs.
- gFxWS embeds surveillance-grade provenance in every save: revision, build, exact timestamp, viewer type/version/variation, OS platform, and the user's identity.name/loginName.

## Open Questions
