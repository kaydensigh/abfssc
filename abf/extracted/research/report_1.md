# DIMENSION 1: Rich fields & shortcut codes

## Summary
Every fillable rich entry on the card is a PAIR of AcroForm text fields sharing one screen position: an editable/exportable field holding terse codes (e.g. `BasicSystem`, value `1` or `!C 12+ HCP`) and a `D_`-prefixed twin (`D_BasicSystem`) holding the pre-rendered rich/printable text. There are exactly 245 `D_*` fields (out of ~600). Three layered expansion mechanisms turn short input into formatted output: (1) tooltip code-lists â the field VALIDATE script reads its own tooltip (`event.target.userName`) and expands a typed digit/`x`/`?` by string-searching the hint for `\rN : phrase`; (2) grave-accent shortcut codes via the `gCdH` hash (`` `2 ``â2â¿áµ, `` `@ ``âÂ½, `` `a ``âÎ±), expanded inside the FORMAT script; and (3) `!`-introduced rich-text codes (`!S`âspade symbol in the embedded `Cards` font, `!^`âsuperscript, `!-`âsmaller font, `!U+XXXX`âUnicode). One ~15.5KB master FORMAT script (the largest field-action block) parses `!` codes char-by-char into a `richValue` span array written to the `D_` field, and three richness modes (Rich/Basic/None, scaled internally 8â¦1 by `gRMd`) decide whether to emit coloured spans, flattened plain text, or raw codes. Crucially, the Rich ceiling `gRMx` is set at open time by a runtime capability probe (write a rich span, read it back), so unsupported readers auto-downgrade to Basic.

## Report
# Rich fields & shortcut codes (verified & deepened)

## 1. The dual-field 'rich field' model (editable vs `D_` twin)

Verified against `field_names.txt`: exactly **245** field names begin `D_` (the 271 raw matches in the draft's count include substrings; the prefix count is 245), out of ~600 total fields. The split is documented verbatim in the guide:

- p.6 (PDF form changes since 2013): *"The 2020 update has changed the fields... Rich fields now use one field for editing & export, & printing. This is to help minimize the size of the filled form. Also many fields have new names."*
- p.16 (View Editable Fields Function): *"Since 2020, rich text fields have twin PDF fields sitting in the same position on their page. One is used for data entry/editing and exporting to FDF file. Only this one has a hint with relevant bridge details. The other is used for showing the encoded value on the screen and for printing. The hint for this one shows only the field name (same name with D_ prefix). The REFRESHed display shows the D_* fields. When you click in one of these, then its partner field is exposed."*

Evidence in `field_tooltips.txt`: editable `BasicSystem` carries a code list (`1 : Standard...6 : Honeymoon Moscito`); `D_BasicSystem` has a bare tooltip; the editableâdisplay pairing is materialised at runtime by a hash **`gDFH`** (display-field hash). In the FORMAT script `cBXRf=gDFH[gLRFN]` fetches the partner and `cBXNoR=(cBXRf==null)` flags "no rich partner present"; `gDFH` entries are built by `getField('D_'+name)`.

WHY the split (three converging reasons):
- **File-size minimization (stated primary reason, p.6).** Rich values are verbose XFA-style span markup; keeping the editable field as a plain terse code and only materialising the bulky rich value into `D_` minimizes the saved file. The editable field is also exactly what exports to FDF (p.31: "Our FDF files are much smaller (at about 30kB) than the filled PDF form").
- **Editing/export vs display/print separation** â clean round-trippable codes vs formatted output.
- **A workaround for a reader optimization (p.27, "Unchanged Text Fields"):** *"PDF processing programs try to improve speed by not using the formatting process for text fields that have been entered (via mouse click or tabbing into the field) and not changed before exiting... This leaves our editable field exposed, so we try to then swap over to showing the display field. This works in Foxit Reader but not in Adobe Reader. From revision 21E09, in Adobe Reader we provide a message to warn you... and the need to later REFRESH."* Because Adobe skips the format event for an untouched field, a pre-rendered `D_` must exist and be toggled.

Visibility toggling is explicit at the tail of the FORMAT block (`clean_2_block20.js` l.900-911): when the rendered field is the `D_` partner (`cBXvf==cBXRf`) it sets `cBXRf.display=display.visible; cBXf.display=display.hidden;`; otherwise (editable showing) `cBXRf.display=display.noView; cBXf.display=display.noPrint;` â i.e. while editing, the editable shows on screen but won't print, and `D_` won't show but will print.

## 2. Shortcut codes â three layers, not two

**(a) Tooltip code-lists (digit/`x`/`9`/`?` â phrase).** Implemented in the field VALIDATE script (variable prefix `bAX`). Verified logic: it strips a leading caret (`bAXzz.replace(/^ *\^? ?/,'')`), and **only when `bAXzz.length<3`** treats input as a code:
```
var bAXf=event.target; var bAXhint=bAXf.userName;
if(bAXv==='?'){...app.alert({cMsg:'INFO:'+bAXhint,cTitle:'Field info:',nIcon:3});bAXrj=1;}
else{var bAXpp=((gSHc==0)?'':'!B!1'+bAXv+'!6:!0!n ');
     var bAXvs='\r'+bAXv+' : '; var bAXik=bAXhint.indexOf(bAXvs);
     if(bAXik>=0){...bAXzz=bAXpp+bAXhint.substring(bAXik,bAXjk);gRisN++;}}
```
So typing `1` in `BasicSystem` (tooltip `...\r1 : Standard\r2 : 2/1...`) yields "Standard"; typing `?` pops the whole hint as an alert (guide p.29 "Lists in Text Fields": *"A new feature of Rich Text fields in the 2015 version... allows selection of text from a list embedded in the hint... This provides a combobox (dropdown list)-like function"*). The optional bold echo prefix `!B!1`+code+`!6:!0!n ` is added only when `gSHc!=0`. There is also a default-value fallback: empty fields revert to `^ ` (the caret) or `event.target.defaultValue`. Note the guide (p.30, Combo Boxes) confirms this *replaced* real dropdowns: *"These were the dropdown lists used in the 2013 version... In the 2015 version, they have transformed into rich text fields and a code selection method added."*

The code tables live entirely in tooltips (`field_tooltips.txt`; the literal `r` chars are stripped CRs). Verified examples â `CountType_NT`: `1 : High-Low = Even / 2 : Low-High = Even / x : Not used / 9 : See Note #`; `DiscardType_NT`: `1 : McKenney ... 8 : Revolving / 9 : See Note #`; `Open1NT`: `1 : 12-14 Balanced ... 6 : 12-14 BAL, 14-16 BAL in 3!^rd!n seat`; `Resp1NT2D`: `x : Natural, To Play / 1 : Transfer !H / 8 : Forcing Stayman ?`. The special codes `x :` (a default/standard value) and `9 : See Note #` (redirect to a numbered note) are a tiny DSL. Expanded values can embed further rich codes â `Open1C`'s `1 : 12+ HCP, !T3+!C` contains `!T` (tab) and `!C` (club), so the tooltip expansion seeds the second rich-expansion stage.

**(b) Grave-accent shortcut codes.** The `` ` `` introducer maps through hash **`gCdH`**, default-populated by `gFrC()` (`clean_3_block35.js` l.38): `` `1 ``â`1!^st!^`, `` `2 ``â`2!^nd!^`, â¦`` `5 ``, `` `@ ``âÂ½, `` `- ``â`!^!U+2013; !^` (en-dash, superscripted), `` `. ``â`!U+2026;` (ellipsis), `` `(`/`` `) `` and `` `[`/`` `] `` â super/subscript brackets, `` `_ ``âen-dash, and Greek `` `a ``âÎ± (`!U+03B1;`) through `` `e ``âÎµ. Expansion happens at the top of the FORMAT block (l.53-75): while there is a `gCdS` char with `gCdN>0` codes loaded, it looks up `gCdH[char]`, splices in the replacement, leaves unknown codes intact, and treats a **doubled grave as an escape** (`if(cBXvC==gCdS)`). Users extend the table via the **`My_Codes`** field (whose validate at js_all_clean.js l.89 parses a `,`-separated `code:replacement` string, supports `*ReSet*` and an `R` flag that re-calls `gFrC()`, then sets `gCdN=gFnK(gCdH)`); `gFsV('*Z',...)` aliases `*Z`â`My_Codes`. The guide (p.17) notes the grave system arrived in the 2016 update.

**(c) `!` rich-text codes** â the third layer, parsed by the FORMAT engine (Â§4).

## 3. Richness levels None / Basic / Rich â and the runtime capability probe

`gFsR(mode)` (`clean_1_block37.js` l.1414) sets `gMode` and the numeric `gRMd`: **Rich**â`gRMd=gRMx`; **Basic**â`gRMd=2` (with `gPfx/gSfx` from `gBPA/gBSA` unless `gBMd==0`); **None**â`gRMd=1`; with a clamp `if(gRMd>5){if(gNTrL>0)gRMd=5}`. Guide p.17 defines the three: Rich (coloured suits, size changes, underline, super/subscript â "Only Adobe (and recent updates to Foxit) products can produce Rich Text"), Basic ("plain text with the richness codes converted to plain equivalents"), None ("the raw text values... mostly useful for viewing the codes").

**Key mechanism the draft missed:** `gRMx` (the Rich ceiling) is NOT a constant. At open (`_openaction_clean.js` l.730-774) the form writes a test span to a probe field and reads its `richValue` back; if defined â `gRMx=8`; if the reader can't round-trip rich text, or for old Foxit (`gVfV<92`) it falls to `gRMx=5`; for Nitro (`gNTrL>0`) `gRMx=5; gRMd=5`. This is the engine behind the guide's "reverts to Basic when... a PDF Reader which appears to not handle rich text." So richness is a continuous scale (8=full Rich, 5=enhanced-basic ceiling, 2=Basic, 1=None). The FORMAT block copies `var cBXmd=gRMd` and immediately forces `cBXmd=1` if `!gVCds` (JS codes not validated); it branches `cBXmd>2` â rich-span path, 2â5 â flatten path, `<2` â raw passthrough.

## 4. The render engine (the master FORMAT block)

The largest field action (raw `top_2_block_20.js` = 15,677 chars; beautified `clean_2_block20.js`). For the rich path it walks the string on the `!` introducer (`cBXbg='!'`), maintaining a run buffer `cBXstr` and span array `cBXSP`. Codes set state: alignment (`!<`/`!|`/`!>`); colours `!0`â`!9` etc. via `gClrA`; bold/italic/underline; the four suits `!S!H!D!C` â `cBXSP[i].fontFamily=['Cards']`, coloured, **hard-capped at 11pt** (`if(cBXrsz>11){...textSize=11}else{...=cBXrsz}`, l.448-453); tab/columns (`!t`/`!T`); super/subscript (`!^`/`!v`); size step `!+`/`!-`/`!=` where `!-` floors at 6pt (`if(cBXrsz>6)cBXrsz--`, l.477); and `!U+XXXX;` Unicode (`String.fromCharCode`). Other custom fonts referenced: ZapfDingbats, Symbol, Cards, Bridge (l.261). The finished array is assigned via `event.richValue=cBXSP` (no `D_` partner) or `cBXdf.richValue=cBXSP` (to the `D_` field), after forcing `cBXdf.richText=true`. The `Â«FieldNameÂ»` guillemet syntax (`\xAB`) is resolved by **`gFCLN()`** (`clean_1_block37.js` l.241): it matches `Â«â¦Â»` tokens, substitutes another field's `valueAsString`, and â if the name isn't a field â `eval()`s it as a JS variable, with special tokens `Â«tCÂ»`/`Â«tFÂ»`/`Â«tCRÂ»`/`Â«tFRÂ»` pulling the live textColor/textFont of the editable or `D_` partner.

Whole-card **REFRESH** (`gFiF`, `clean_0_block36.js` l.2224, the case-42 handler) regenerates everything indirectly: it iterates fields, `continue`s on `D_*` (l.2495) and on `!yEXdgf.required` (l.2502), then re-assigns each value to itself â but cleverly with a leading `^ ` caret and sometimes a doubled assignment that appends `-` (l.2509-2553) precisely so the value *differs* and the reader cannot apply its "unchanged field" skip-optimization. This forces validate+format to re-fire and rebuild every `D_`.

## 5. Font sizing & overflow â manual, by design

No auto-shrink-to-fit. Default size is `gTFz=10` (10pt since 2015, p.27). Suit symbols match current size "up to maximum of 11pt" (p.18/49). `!-` minimum is 6pt (p.50: "Decrement font size (minimum=6pt.)"). Overflow is acknowledged as a hard PDF limit (p.20): *"BEWARE: The fields in this PDF form have fixed width and height. Overflowing text in a field is invisible."* Mitigation: enable the reader's `+` overflow indicator (p.28; configure in Preferences/Forms), authored overflow markers, and "redirection" to numbered Notes sections (p.22/27). The form only warns; the user shrinks or redirects.

## Key Mechanisms

### 245 D_ display fields + gDFH partner hash
- What: Each editable rich field has a same-position twin named D_<name> holding the pre-rendered rich-text spans; a runtime hash gDFH maps editable name â D_ partner field object so the renderer knows where to write.
- Evidence: field_names.txt has exactly 245 names starting `D_`. clean_2_block20.js l.18 `var cBXRf=gDFH[gLRFN]; var cBXNoR=(cBXRf==null);`; tail l.905-906 `cBXRf.display=display.visible; cBXf.display=display.hidden;`. Guide p.16 'twin PDF fields sitting in the same position... same name with D_ prefix.'
- Why: File-size minimization (guide p.6: 'one field for editing & export, & printing... to help minimize the size'); plus a workaround for Adobe skipping the format event on untouched fields (p.27, 'works in Foxit Reader but not in Adobe Reader').

### VALIDATE tooltip code-expansion (bAX*)
- What: On commit, strips a leading caret, and if value length<3 reads the field's own tooltip (userName) and replaces the typed code with the phrase after `\rN : `; `?` pops the whole hint as an alert.
- Evidence: `var bAXhint=bAXf.userName; if(bAXv==='?'){app.alert({cMsg:'INFO:'+bAXhint,nIcon:3})...} else{var bAXvs='\r'+bAXv+' : '; var bAXik=bAXhint.indexOf(bAXvs); ... bAXzz=bAXpp+bAXhint.substring(bAXik,bAXjk);gRisN++;}` plus `bAXzz.replace(/^ *\^? ?/,'')`. Guide p.29 'a combobox (dropdown list)-like function for selecting a value from a list' embedded in the hint.
- Why: PDF combo boxes can't render coloured rich text (guide p.30: dropdowns 'transformed into rich text fields'), so the per-field code list lives in the tooltip â one structure serves both user help AND the lookup table, no extra widget.

### gFrC() / gCdH grave-accent hash + My_Codes
- What: Builds the grave (`) shortcut table (`1â1st,`2â2nd,`@âÂ½,`-âen-dash,`.âellipsis,Greek `aâÎ±â¦) and lets users override it via the My_Codes field (comma-separated code:replacement, *ReSet* / R flag).
- Evidence: clean_3_block35.js l.44 `gCdH['1']='1!^st!^'; gCdH['2']='2!^nd!^'; gCdH['@']='Â½'; gCdH['-']='!^!U+2013; !^';`. My_Codes validate (js_all_clean l.89) sets gCdS, deletes/rebuilds gCdH, `gCdN=gFnK(gCdH)`. gFsV alias `case '*Z':mJXn='My_Codes'`.
- Why: Raw super/subscript via !^ is fiddly (guide p.9/17), so common ordinals/fractions/Greek get a one-keystroke alias; users extend it without touching JS, and a doubled grave escapes.

### FORMAT engine â richValue span array (BLOCK 20, ~15.5KB)
- What: Parses ! codes char-by-char into styled spans (colour via gClrA, suits in 'Cards' font, bold/italic/underline, super/sub, size, tab, !U+ Unicode) and assigns the array to the D_ field's richValue; a parallel path flattens to plain text for Basic mode.
- Evidence: raw top_2_block_20.js=15,677 chars. `cBXdf.richValue=cBXSP; ... cBXSP[cBXsi].fontFamily=['Cards']; if(cBXrsz>11){cBXSP[cBXsi].textSize=11}`; `!-` floor `if(cBXrsz>6)cBXrsz--`. Fonts list l.261 'fZ=ZapfDingbats fS=Symbol fC=Cards fB=Bridge'.
- Why: A PDF form has no markup engine, so all rich text must be hand-built as span arrays in JS; centralizing it in one shared script keeps the per-field actions tiny.

### gFsR() richness setter + runtime gRMx probe
- What: Maps RichâgRMd=gRMx, Basicâ2, Noneâ1; gRMx itself is decided at open by writing a test span and reading richValue back â 8 if the reader supports rich text, else 5 (or 5 for Nitro).
- Evidence: clean_1_block37.js l.1414 gFsR; _openaction_clean.js l.743 `hBXopry.richValue=hBXoS; if(typeof(hBXoprz)!=='undefined'){gRMx=8;...}` else `gRMx=5`; `if(gNTrL>0){gRMx=5;gRMd=5;}`. Guide p.17 'reverts to Basic... a PDF Reader which appears to not handle rich text.'
- Why: One stored value must feed Adobe (rich), readers without rich-text (auto-downgraded Basic), and a code-inspection view (None); the probe auto-detects capability instead of asking the user.

### REFRESH (gFiF) self-reassign with caret to defeat skip-optimization
- What: Walks all fields, skips D_* and non-required, and re-assigns each value to itself â prefixing a leading '^ ' caret (and sometimes appending '-') so the value DIFFERS, forcing the reader to re-run validate+format and rebuild every D_.
- Evidence: clean_0_block36.js l.2495 `if(yEXdgfn.substr(0,2)==='D_')continue;` l.2502 `if(!yEXdgf.required)continue;` l.2514 `yEXwvA[yEXwnv]='^ '+yEXwfv;` l.2553 `yEXdgf.value=yEXwvA[yEXwni];`.
- Why: Bookmark-driven mode/style changes don't auto-repaint (guide p.16), and readers skip formatting unchanged fields â so the form must make each value look changed to re-trigger Acrobat's per-field format in bulk.

### gFCLN() Â«fieldÂ» cross-reference interpolation
- What: Substitutes a Â«FieldNameÂ» token with another field's live valueAsString; if the name isn't a field it eval()s it as a JS variable, with special tokens Â«tCÂ»/Â«tFÂ»/Â«tCRÂ»/Â«tFRÂ» pulling live textColor/textFont of the editable or D_ partner.
- Evidence: clean_1_block37.js l.241; l.254 `lAXstr=lAXstr.replace(lAXqnz,lAXqf.valueAsString);` l.259-260 `var lAXsx='lAXst=typeof('+lAXqn+')'; eval(lAXsx);`. Called from BLOCK 20 `if(cBXvm.indexOf('\xAB')>0)cBXvm=gFCLN(cBXvm,0,cBXf,cBXRf);`.
- Why: Lets one field mirror another's live value (and even introspect field colour/font) without re-typing, reducing duplicated data â though the eval path is far beyond what a convention card needs.

## Limitations & Workarounds
- Fixed field geometry: 'The fields in this PDF form have fixed width and height. Overflowing text in a field is invisible' (guide p.20). No auto-shrink-to-fit exists; the form relies on the reader's optional '+' overflow indicator (urged to enable, p.28) and on manual redirection to numbered Notes sections.
- No native rich-text widget: PDF combo/list boxes can't render coloured suit symbols, so the 2013 dropdowns were converted (guide p.30) into plain text fields whose option list is stored inside the tooltip and expanded by the validate script when the user types a digit, 'x', '9', or '?'.
- Adobe skips the format event for fields entered but not changed, leaving the raw editable field exposed; the dual D_ field plus a 'you must REFRESH' warning is the workaround â auto-swaps in Foxit but not Adobe (guide p.27, since rev 21E09 a warning is shown).
- Rich-text span markup bloats the saved file, so the editable field is kept as terse plain codes and only the D_ field materializes the bulky richValue (the explicit file-size rationale, guide p.6; FDF files are ~30kB vs the larger filled PDF, p.31).
- Reader capability is unknown until runtime, so the form probes it at open (write a test richValue, read it back): gRMx=8 if rich text round-trips, else 5; Nitro forced to 5. Changing richness then REFRESH on a non-rich reader 'will remove all richness in previously saved fields' (guide p.16) â a destructive edge case the form warns about.
- Italics 'can massively boost the file size' (guide p.49 note 2) â a rich-text platform cost flagged to users and historically discouraged.
- Single-char code namespace pressure: '!#' is overloaded ('multiple uses in the rich fields', guide p.17, users told to avoid it), and in September 2017 the !U/!V/!I codes were deleted to reclaim '!U+' for Unicode (guide p.49).
- Suit symbols must be entered as the !S/!H/!D/!C codes (guide p.18 'entered as: !S !H !D or !C'), not as pasted Unicode glyphs, or they are lost on FDF export â a non-obvious gotcha tied to the export-the-editable-field design.
- Tooltip line breaks are carriage returns ('\r'); they appear as literal stripped 'r' in the extracted artifacts, but the validate searches the real key '\r'+code+' : ' â code length is gated at <3 chars, so only short codes expand.
- Suit/symbol glyphs depend on embedded custom fonts ('Cards', plus Symbol/ZapfDingbats/Bridge) being present and capped at 11pt; if a printer mishandles them the guide tells users to 'Print-as-image' or switch to Richness=Basic to print plain S H D C letters (p.20).

## User Impact
- Fast filling: type '1' (or '?' then read the list) in a field like Open1NT and it expands to '12-14 Balanced'; the embedded code lists act as a per-field cheat-sheet so users needn't memorize syntax.
- Per-field guidance is always one hover (tooltip) or one '?'-then-Tab keystroke away, with the same string doubling as both the data-entry lookup table and the help text.
- Confusion risk: in Adobe, entering a field but not changing its value can leave the raw editable code showing instead of the formatted D_ display; users must learn the REFRESH bookmark to repaint â a friction point the guide addresses repeatedly (p.16/27).
- The leading caret '^' that appears while editing is cosmetic and is auto-stripped by the validate when you add text (guide devotes a whole section, p.28: 'These are nothing to worry about'), but it confuses first-time users.
- Overflow is silent: text past the fixed field box just vanishes on print unless the user enabled the '+' overflow indicator â easy to lose content unknowingly (guide p.20/28).
- Power users get rich formatting (coloured suits, super/subscript, grave ordinals, custom My_Codes, even Â«fieldÂ» cross-references) but must learn a terse !/grave code language; casual users can stay in plain/Basic mode, which the form may auto-select for them.
- Suit symbols should always be entered as !S/!H/!D/!C codes, not pasted Unicode, or they are dropped on FDF export (guide p.18) â a non-obvious gotcha.
- Readers without rich-text support are auto-downgraded to Basic by the open-time probe, so the card still looks reasonable (plain S/H/D/C, flattened sizes) rather than breaking â but switching richness and refreshing on such a reader can permanently strip richness from saved fields.

## Surprises
- The 'dropdown lists' are not PDF list/combo boxes at all â the 2013 combo boxes were converted (guide p.30) into plain text fields whose option list lives inside the field TOOLTIP (userName); the validate string-searches the tooltip for '\rN : ' to expand a typed code. The help text IS the lookup table.
- THREE shortcut systems stack on one field value: tooltip-digit codes (1âa full phrase), grave-accent codes (gCdH, `2â2nd), and the ! rich-code language â and a tooltip expansion can itself contain ! codes (e.g. Open1C '1 : 12+ HCP, !T3+!C'), so one keystroke can fire all three stages.
- Richness is a runtime-probed continuous scale, not a fixed 8/2/1: at open the form writes a test richValue and reads it back, setting gRMx=8 if supported, else 5 (or 5 for Nitro). Capability is auto-detected, not configured.
- REFRESH regenerates everything by re-assigning each field's value to itself â but deliberately prepends a '^ ' caret (and may append '-') so the value DIFFERS, defeating the reader's 'skip formatting for unchanged fields' optimization. A hack to force a hack.
- Only fields with the AcroForm `required` flag are treated as rich/rendered â the form repurposes `required` as an internal 'this is a rich field' marker (REFRESH does `if(!yEXdgf.required)continue;`).
- gFCLN's Â«fieldÂ» interpolation doesn't just copy another field's value â if the token isn't a field name it eval()s it as a JavaScript variable, and special tokens Â«tCÂ»/Â«tFÂ»/Â«tCRÂ»/Â«tFRÂ» read the live textColor/textFont of the editable or D_ twin. Far beyond what a convention card needs.
- A tiny DSL hides in the help strings: 'x :' marks a default/standard answer (e.g. Resp1NT2D 'x : Natural, To Play') and '9 : See Note #' is a redirect-to-numbered-note convention, distinct from the numeric codes.
- Suit symbols are drawn from a custom embedded font literally named 'Cards' (alongside Symbol/ZapfDingbats/Bridge) and hard-capped at 11pt regardless of surrounding text size.
- Namespace exhaustion is visible in the history: '!#' is overloaded with 'multiple uses' (users told to avoid it), and in Sept 2017 the !U/!V/!I codes had to be deleted to free '!U+' for Unicode â a single-char code scheme running out of room.

## Open Questions
