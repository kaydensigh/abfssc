# `abf/` — the original ABF card and its reverse-engineering toolkit

This folder holds the **source PDFs** for the ABF Standard System Card, a written
**architecture analysis** of how the existing JavaScript-driven PDF form works, and the
**scripts + extracted artifacts** that analysis was built from. It exists to inform the
web reimplementation in [`../src/`](../src/).

If you just want the findings, open **[architecture.html](architecture.html)** in a browser.
Everything else here is the evidence behind it, kept so the rebuild can verify claims and
look up exact field names, function bodies, shortcut codes, and palette values.

---

## Contents at a glance

| Path | What it is |
| --- | --- |
| [ABF_Card_FORM.pdf](ABF_Card_FORM.pdf) | **Input.** The form itself — a 2‑page bridge convention card, Form Rev 21E29, with ~148 KB of embedded JavaScript. |
| [ABF_Card_Form_Usage_Guide.pdf](ABF_Card_Form_Usage_Guide.pdf) | **Input.** The 53‑page user manual (Guide Rev 21D24). |
| [architecture.html](architecture.html) | **Deliverable.** Self‑contained write‑up of how the form works and why. Open it directly; no server or build needed. |
| `*.js` (this folder) | The extraction + analysis scripts. Run with Node (see below). |
| [extracted/](extracted/) | Everything the scripts produce: decompressed JavaScript, field/tooltip/bookmark lists, guide text. |
| [extracted/research/](extracted/research/) | The seven verified deep‑dive reports + critique that `architecture.html` synthesises. |

---

## Prerequisites

- **Node.js** (uses only built‑in modules — `fs`, `zlib`, `path`; nothing to `npm install`).
- That's it. *Python is not used or required.*

All scripts assume the current working directory is `abf/`:

```sh
cd abf
```

---

## Quick start — regenerate everything

The scripts form a small pipeline. **Step 0 must run first** (it decompresses the PDF into
the intermediate file every other script reads); the rest are independent and can run in any order.

```sh
node decompress.js       # 0. PDF → extracted/all_inflated.txt   (run this first)
node extract_clean.js    # 1. → extracted/clean_*.js, js_all_clean.js   (the readable JavaScript)
node extract_fields.js   # 2. → extracted/field_names.txt, field_tooltips.txt, bookmark_titles.txt
node extract_guide.js    # 3. → extracted/usage_guide_text.txt   (text of the 53-page guide)
node analyze_js.js       # (optional) prints the function list + call-frequency to stdout
```

Re‑running the pipeline is deterministic — it reproduces the committed `extracted/` files
byte‑for‑byte.

---

## The scripts

| Script | Reads | Writes | Purpose |
| --- | --- | --- | --- |
| [decompress.js](decompress.js) | `ABF_Card_FORM.pdf` | `extracted/all_inflated.txt` | **Step 0.** Inflates all 570 FlateDecode streams in the PDF into one readable dump. |
| [extract_clean.js](extract_clean.js) | `all_inflated.txt` | `extracted/clean_*.js`, `js_all_clean.js` | **Canonical JS extractor.** Parses all 183 `/JS(...)` action blocks, unescapes the PDF string literals (incl. the `\`+EOL line‑continuation packing), and beautifies the largest blocks. |
| [extract_fields.js](extract_fields.js) | `all_inflated.txt`, the form PDF | `extracted/field_names.txt`, `field_tooltips.txt`, `bookmark_titles.txt` | Pulls the AcroForm field names (`/T`), tooltips (`/TU`), and outline/bookmark titles (`/Title`). |
| [extract_guide.js](extract_guide.js) | `ABF_Card_Form_Usage_Guide.pdf` | `extracted/usage_guide_text.txt` | Decompresses the guide and extracts its text from the `Tj`/`TJ` operators. Self‑contained (does its own inflate). |
| [extract_codelists.js](extract_codelists.js) | `all_inflated.txt` | `extracted/field_codelists.md` | Pulls the per‑field shortcut‑code lists out of the tooltips (with proper `\r` unescaping) — the domain content for the web form's dropdowns/autocomplete. |
| [analyze_js.js](analyze_js.js) | `all_inflated.txt` | *(stdout)* | Diagnostic: lists every `function` definition and ranks helper‑function call frequency. |
| [extract_js.js](extract_js.js) | `all_inflated.txt` | `extracted/js_blocks.txt`, `top_*_block_*.js` | *Earlier/raw* block dump (escapes **not** fully cleaned). Superseded by `extract_clean.js`; kept for provenance. |
| [beautify_and_guide.js](beautify_and_guide.js) | `all_inflated.txt`, guide PDF | `extracted/beautified_*.js` | *Earlier* beautifier (leaves stray `\` from line‑continuation). Superseded by `extract_clean.js`; kept for provenance. |
| [architecture_research.wf.js](architecture_research.wf.js) | the `extracted/` artifacts | `extracted/research/*` | The multi‑agent research workflow. **Not a Node script** — see below. |

---

## The extracted artifacts

### Readable JavaScript — start here

The form's JavaScript splits into a document‑level bootstrap plus ~76 helper functions
duplicated across 183 `/JS` action blocks. The useful, beautified views:

| File | Block | What lives there |
| --- | --- | --- |
| [extracted/_openaction_clean.js](extracted/_openaction_clean.js) | OpenAction | **Tier‑1 bootstrap.** Declares all globals + the lowest‑level primitives (`gFaA`, `gFpB`, `gMDH`, `gFXa`), builds the `gFHash` type map, runs the capability probes. *(Extracted separately during the research pass — `decompress.js` captures it inside `all_inflated.txt` but doesn't split it out.)* |
| [extracted/clean_0_block36.js](extracted/clean_0_block36.js) | 36 | The bulk of the function library (REFRESH, Status Check, swap players, migration…). |
| [extracted/clean_1_block37.js](extracted/clean_1_block37.js) | 37 | More library functions (`gFsH` help, `gFcb` highlight, `gFsR` richness, WillSave stamp…). |
| [extracted/clean_2_block20.js](extracted/clean_2_block20.js) | 20 | **The rich‑text render engine** — parses `!`/grave codes into `richValue` span arrays. |
| [extracted/clean_4_block26.js](extracted/clean_4_block26.js) | 26 | `I_Format` Calculate script — the global "restyle every field" broadcaster. |
| [extracted/clean_5_block32.js](extracted/clean_5_block32.js) | 32 | `My_Rectangles` Calculate script — builds the `V_`/`Box` overlay hot‑zones. |
| [extracted/clean_3_block35.js](extracted/clean_3_block35.js) | 35 | Grave‑accent shortcut defaults (`gFrC`), `gFsV` settings router, etc. |
| [extracted/js_all_clean.js](extracted/js_all_clean.js) | *all 183* | Every block, cleaned but **not** beautified. The right target for grepping across the whole codebase. |

### Field / menu / help data

| File | Count | Notes |
| --- | --- | --- |
| [extracted/field_names.txt](extracted/field_names.txt) | 601 | All AcroForm field names. 245 begin `D_` (display twins). |
| [extracted/field_tooltips.txt](extracted/field_tooltips.txt) | 690 | Field tooltips. These double as **help text and the shortcut‑code lookup tables** — lines like `1 : Standard`. (The stray `r` characters are stripped carriage returns.) |
| [extracted/bookmark_titles.txt](extracted/bookmark_titles.txt) | 127 | The bookmark/outline titles — i.e. the form's command menu, in storage order. |
| [extracted/usage_guide_text.txt](extracted/usage_guide_text.txt) | — | Full text of the 53‑page usage guide (searchable). |
| [extracted/field_codelists.md](extracted/field_codelists.md) | 52 | The shortcut‑code lists distilled from the tooltips (domain content for dropdowns/autocomplete). See also [`../docs/card-content-model.md`](../docs/card-content-model.md). |

### Intermediate / raw (kept for reference, not the canonical view)

- [extracted/all_inflated.txt](extracted/all_inflated.txt) — the raw decompressed PDF dump (`decompress.js` output; the pipeline's input).
- `extracted/js_blocks.txt`, `largest_js_block.txt`, `top_*_block_*.js` — raw, still‑escaped blocks from `extract_js.js`.
- `extracted/beautified_*.js` — the earlier beautifier's output; **prefer the `clean_*.js` versions** (these contain stray `\` from un‑stripped line continuations).

### The research reports

[extracted/research/](extracted/research/) holds the source material for `architecture.html`:
`report_0.md`…`report_6.md` (JS engine, rich fields, bookmark menu, user workflow, platform
limits, bridge domain, data model) plus `critique.md` (the completeness/accuracy pass). Each
report is evidence‑backed with exact function names, line numbers, and guide quotes.

---

## Re-running the research workflow

[architecture_research.wf.js](architecture_research.wf.js) is a **Claude Code Workflow
script**, not a Node script. It orchestrates ~15 subagents (7 parallel deep‑dives → 7
verification passes → 1 critic) over the `extracted/` artifacts. The committed
`extracted/research/*` files are its saved output, so you normally don't need to re‑run it.
To regenerate (it will spawn many agents and consume significant tokens), launch it with the
Workflow tool, pointing `scriptPath` at this file.

---

## Field & code naming cheat‑sheet

Handy when reading the extracted JS or planning the data model:

**Function prefixes:** `gF*` general helper · `gR*` rich/rectangle · `gM*` make/manage ·
`gS*` set/screen · `gT*` toggle. Most parameters end in `RoL` (the author's initials).

**Field prefixes:** `D_` rendered display twin · `B_` checkbox display · `My_*` user settings ·
`I_*` internal (`I_LastSave` provenance, `I_Format` style broadcaster) · `Q_*` query · `V_`/`v_`/`Box*`
overlay click‑zones · `Z_*` printable radio mirrors · `A_JN` the JavaScript‑warning canary ·
`Open1C…Open2NT` openings · `IsClassGreen/Blue/Red/Yellow`, `IsBrownSticker`, `IsGerber`… are
**virtual call targets** resolved by `gFpB`, not all real fields.

**In‑value codes:** rich `!0…!9` (colours), `!b`/`!i`/`!u` (bold/italic/underline), `!^`/`!v`
(super/subscript), `!+`/`!-` (size), `!S!H!D!C` (suits, in the `Cards` font), `!U+XXXX;` (Unicode),
`!N!=` (force/lock). Grave shortcuts: `` `2 `` → 2ⁿᵈ, `` `@ `` → ½, `` `a `` → α. Tooltip codes:
a digit expands via the `\r<digit> : phrase` line in that field's tooltip; `?` pops the whole list.

---

## Notes & caveats

- **Encoding.** Scripts read/write as `latin1` so raw PDF bytes round‑trip exactly. Non‑ASCII
  may look odd in a UTF‑8 editor; that's intentional fidelity, not corruption.
- **Line‑continuation packing.** The minified JS is stored hard‑wrapped with `\`+EOL escapes.
  `decompress.js` keeps them; `extract_clean.js` strips them. If you write your own parser,
  handle `\`‑followed‑by‑CR/LF or you'll get stray backslashes mid‑token (the bug visible in the
  `beautified_*.js` files).
- **`clean_*` vs `beautified_*`.** Use `clean_*` — they're the corrected output. `beautified_*`
  predate the line‑continuation fix.
