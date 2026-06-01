export const meta = {
  name: 'abf-card-architecture-research',
  description: 'Deep multi-agent analysis of the ABF convention-card PDF form for an architecture write-up',
  phases: [
    { title: 'Research', detail: '7 parallel deep-dives into the form, JS, fields, bookmarks, guide' },
    { title: 'Verify', detail: 'independently verify & deepen each dimension against source' },
    { title: 'Critique', detail: 'completeness critic finds gaps and cross-cutting insights' },
  ],
};

const ART = `
SOURCE FILES (all absolute paths; this is a Windows machine, forward slashes work for Read/Grep):
  Form PDF (2 pages — the actual convention card; read pages as IMAGES):
    c:/Users/quite/source/repos/abfssc/abf/ABF_Card_FORM.pdf
  Usage Guide PDF (53 pages; read specific pages as IMAGES when you need visuals/screenshots):
    c:/Users/quite/source/repos/abfssc/abf/ABF_Card_Form_Usage_Guide.pdf
  Extracted, human-readable artifacts (decompressed from the form PDF by the orchestrator):
    .../abf/extracted/clean_0_block36.js   (~59KB beautified — the CORE function library)
    .../abf/extracted/clean_1_block37.js   (~37KB beautified — more functions/actions)
    .../abf/extracted/clean_2_block20.js   (~15KB beautified)
    .../abf/extracted/clean_3_block35.js   (~8KB beautified)
    .../abf/extracted/clean_4_block26.js , clean_5_block32.js  (smaller blocks)
    .../abf/extracted/js_all_clean.js      (ALL 183 JS blocks concatenated & cleaned — grep this to find any function or call site)
    .../abf/extracted/field_names.txt      (601 unique AcroForm field /T names)
    .../abf/extracted/field_tooltips.txt   (690 field tooltips = embedded user help; note: 'r' chars are stripped CR line breaks)
    .../abf/extracted/bookmark_titles.txt  (127 PDF outline/bookmark titles = the command menu)
    .../abf/extracted/usage_guide_text.txt (~90KB full extracted text of the 53-page guide)

KEY CONTEXT (already established by the orchestrator — treat as given, verify if relevant):
  • This is the Australian Bridge Federation (ABF) "Standard System Card" — a bridge convention card — reimplemented as a
    JavaScript-heavy fillable PDF (Form Revision 21E29, authored "by RoL"). The goal of OUR project is to understand it so we
    can rebuild the parts users care about as a normal web page. You are producing research for an architecture write-up.
  • The form embeds ~148KB of minified JavaScript across 183 /JS action blocks: a library of ~76 helper functions with a
    terse naming convention (prefixes gF/gR/gM/gP/gS/gT/gA/gD; param names often end 'RoL'). Most-called: gFsH (show/hide,
    64x), gFaA (alert/confirm, 49x), gFsV (set value, 25x), gFpB (set a Boolean/bit, 14x), gFiF, gFbR.
  • Fields come in PAIRS: an editable field (e.g. BasicSystem) holds terse codes; a paired 'D_' field (D_BasicSystem) holds
    the rendered/printed text. The guide calls these 'rich fields'; the split exists partly to minimize saved file size.
  • Many fields accept SHORTCUT CODES: a field's tooltip lists codes like '1 : Standard / 2 : 2/1 / 3 : Acol', and typing the
    digit expands to the full phrase. 'Richness' has levels None/Basic/Rich.
  • The 127 bookmarks ARE the app's command menu (ToolBox, HELP, Richness, Date Format, CheckBox Format, Print Partner's Card,
    Load FDF, Status Check, Expose Java Console, etc.) because a PDF form can't add custom toolbar buttons.
  • The form warns: do NOT open in a browser; needs Acrobat/Reader JavaScript; a yellow overlay message vanishes once JS runs.

YOUR OUTPUT IS RESEARCH DATA, not a human-facing message. Be concrete and evidence-backed: cite exact function names, field
names, bookmark titles, tooltip text, guide quotes (with approximate page), and code snippets. Always explain WHY a thing is
done that way, and flag what is a workaround for a PDF/JavaScript limitation. Read the actual source files — do not rely only
on the context summary above.`;

const SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['dimension', 'summary', 'report', 'keyMechanisms', 'limitationsAndWorkarounds', 'userImpact', 'surprises'],
  properties: {
    dimension: { type: 'string' },
    summary: { type: 'string', description: '2-4 sentence overview of this dimension' },
    report: { type: 'string', description: 'Detailed findings, 700-1400 words, markdown allowed. Specific and evidence-backed.' },
    keyMechanisms: {
      type: 'array',
      items: {
        type: 'object', additionalProperties: false,
        required: ['name', 'whatItDoes', 'evidence', 'whyThisWay'],
        properties: {
          name: { type: 'string', description: 'function/field/bookmark/feature name' },
          whatItDoes: { type: 'string' },
          evidence: { type: 'string', description: 'exact code snippet, field name, tooltip, or guide quote+page' },
          whyThisWay: { type: 'string', description: 'design rationale / what constraint drove it' },
        },
      },
    },
    limitationsAndWorkarounds: { type: 'array', items: { type: 'string' }, description: 'PDF/JS platform limits and the clever workarounds' },
    userImpact: { type: 'array', items: { type: 'string' }, description: 'how this affects a real user filling the card; pain points & conveniences' },
    surprises: { type: 'array', items: { type: 'string' }, description: 'non-obvious / clever / odd findings worth highlighting' },
    openQuestions: { type: 'array', items: { type: 'string' } },
  },
};

const DIMENSIONS = [
  {
    key: 'js-engine',
    label: 'JS engine & function library',
    focus: `The embedded JavaScript ARCHITECTURE. Read extracted/clean_0_block36.js fully, skim clean_1/2/3, and grep
    js_all_clean.js for specifics. Map the function library: the naming convention (gF=function? gR/gM/gP/gS/gT/gA/gD prefixes,
    'RoL' params), how the code is initialized at document open, global state objects (e.g. gCXH, gOfPH/gOmPH, gVrbL, gSPNs,
    gThRm), and the most important helpers: gFsH (show/hide via display property), gFaA (alert/confirm wrapper), gFsV (set
    field value), gFpB (set a boolean), gFCX, gFnK, gFOP, gFTsB, gFsP (swap players), gFWRs, status-check (gFScK). Explain the
    event model (which actions fire on which events). Note the minification, the 'if(typeof X==="undefined")' guards (idempotent
    re-definition), and how 148KB of JS is packed into 183 PDF /JS string actions (incl. the \\\\+EOL line-continuation packing,
    and the 'D_*' two-field rendering loop / textSize auto-shrink logic seen at doc open).`,
  },
  {
    key: 'rich-fields',
    label: 'Rich fields & shortcut codes',
    focus: `The DUAL-FIELD 'rich field' model and SHORTCUT CODES. Read field_names.txt and field_tooltips.txt closely, plus the
    guide sections on Richness/Display Fields (search usage_guide_text.txt for 'Richness', 'Display', 'D_', 'shortcut', 'codes',
    'rich'). Explain: why each logical entry has an editable field + a paired 'D_' field (editing/export vs display/print, file-
    size minimization); how typing a digit/letter expands to a full phrase via per-field code lists embedded in tooltips (e.g.
    BasicSystem -> 1:Standard 2:2/1 3:Acol; CountType_NT -> 1:High-Low=Even ...); the Richness levels None/Basic/Rich and what
    each does; how the rendered text is built and printed; font auto-sizing/overflow handling. Cross-reference the JS functions
    that perform expansion/rendering (grep js_all_clean.js).`,
  },
  {
    key: 'bookmarks-ui',
    label: 'Bookmarks-as-command-menu',
    focus: `The BOOKMARK/OUTLINE menu as the application's primary command UI. Read bookmark_titles.txt fully and the guide
    sections on bookmarks (search usage_guide_text.txt for 'bookmark', 'menu', 'ToolBox', 'Status Check'). Catalogue the menu
    structure and group the 127 bookmarks into functional categories (ToolBox, HELP/help tree, Richness, Date Format, CheckBox
    Format, shortcut-code save/restore, Print Partner's Card, Load/Clear FDF, REFRESH, Show Settings, Expose Java Console,
    diagnostics). Explain WHY bookmarks are used as a menu (a PDF form/AcroForm cannot add custom toolbar buttons or app menus;
    bookmarks are the only built-in, always-visible, clickable command surface that can run JavaScript). Discuss discoverability
    pain (the guide must teach users to even reveal bookmarks). Map a few bookmarks to the JS they invoke (grep js_all_clean.js).`,
  },
  {
    key: 'user-workflow',
    label: 'User interaction & workflows',
    focus: `The END-USER EXPERIENCE and workflows, primarily from the usage guide. Read usage_guide_text.txt thoroughly and read
    representative guide PDF pages as images (e.g. pages 1-6 intro/TOC, the 'Getting Started – A Quick Guide' pages, and pages
    showing the filled sample card ~pages 2-3). Also read both form PDF pages as images. Describe the real end-to-end journey:
    first-time setup (enable JS, reveal bookmarks, the warnings), filling fields, using shortcut codes, clicking side labels,
    navigating the dense two-page card, previewing/printing, saving, sharing/printing a partner's card, loading data (FDF).
    Identify the biggest USABILITY PAIN POINTS that motivate a web rebuild, and which features users actually care about.`,
  },
  {
    key: 'pdf-limits',
    label: 'PDF/JS platform limits & workarounds',
    focus: `The PLATFORM CONSTRAINTS of building an app inside a PDF and the workarounds. Read the guide sections on the
    JavaScript warning, browser warning, and reader setup (search usage_guide_text.txt for 'javascript', 'browser', 'Reader',
    'Acrobat', 'warning', 'flatten', 'sign', 'save', 'overflow'). Read form PDF page 1 as image (the yellow JS-warning overlay
    box). Cover: Acrobat-only JS API (this.getField, app.alert, display.*); why browsers/Edge/Preview break it; the yellow
    overlay that hides itself once JS runs (and the field that vanishes); the 'you touched a field' error workaround; enabling
    runtimeHighlight, text-field-overflow-indicator, disabling online-storage-on-save; file-size minimization via D_ fields;
    flatten/sign disabling fields; per-reader differences (Adobe vs others, the Advanced Guide). Frame each as
    limitation -> workaround -> residual user cost.`,
  },
  {
    key: 'domain-layout',
    label: 'Bridge card domain & form layout',
    focus: `The DOMAIN being modeled and the form's LAYOUT. Read both form PDF pages as images carefully, plus the guide pages
    showing the outside/inside pages and the filled sample. Explain, for a developer who may not play bridge, what an ABF
    Standard System Card is and what each numbered section captures (e.g. 1 General/System, 2 Opening leads, 3 signals,
    4 Basic Responses, 5 Play/Defensive carding, 6 Slam conventions, 7 Other, 8 Responses to Opening Bids, 9 Conventions,
    10 Other Notes — verify exact section names/numbers from the card). Describe the outside vs inside page split, the
    classification 'sticker' colours (Green/Blue/Red/Yellow + Brown sticker — bridge system regulation categories; find
    IsClassGreen/Blue/Red/Yellow/IsBrownSticker in the JS and Classification field), partnership/player identity fields, and how
    the visual density of a paper card constrains the form. This grounds WHAT the web rebuild must represent.`,
  },
  {
    key: 'data-persistence',
    label: 'Data model, FDF, versioning & sync',
    focus: `DATA MODEL, PERSISTENCE, VERSIONING and PARTNER SYNC. Search usage_guide_text.txt for 'FDF', 'data file', 'partner',
    'revision', 'version', 'classification', 'export', 'import', 'Log', 'settings'. Grep js_all_clean.js for FDF/export/import
    helpers and field-value plumbing. Cover: how a filled card is saved/shared as data (FDF import/export, 'Make FDF in Log',
    'Load data file', 'Clear & Load FDF'); the form-revision tracking (21E29 / 'A_JN'/version fields) and migration of field
    names across versions (the 2020 rename to D_ fields); 'Print Partner's Card' / swapping player details (gFsP) for the two
    partners who share one system; persisting user settings and customized shortcut codes (Save/Restore shortcut codes); any
    classification/regulatory metadata. Explain what a clean web data model would need to capture.`,
  },
];

phase('Research');
const reports = await pipeline(
  DIMENSIONS,
  (d) => agent(
    `${ART}\n\nDIMENSION TO ANALYZE: "${d.label}"\n\nFOCUS:\n${d.focus}\n\nProduce a thorough, evidence-backed analysis as the schema requires.`,
    { label: `research:${d.key}`, phase: 'Research', schema: SCHEMA }
  ),
  (draft, d, i) => agent(
    `${ART}\n\nYou are independently VERIFYING and DEEPENING a colleague's draft analysis of the dimension "${DIMENSIONS[i].label}".\n\n` +
    `Re-open the relevant source files yourself. (1) Verify every concrete claim (function names, field names, bookmark titles, ` +
    `tooltip/guide quotes, code behavior); silently correct anything wrong. (2) Add depth the draft missed: more exact names, ` +
    `real code snippets, additional mechanisms, sharper 'why' rationale, and any limitation/workaround it overlooked. (3) Keep ` +
    `it concrete — no vague generalities. Return the improved, authoritative version in the same schema (do not just echo the draft).\n\n` +
    `DRAFT TO VERIFY AND IMPROVE:\n${JSON.stringify(draft)}`,
    { label: `verify:${DIMENSIONS[i].key}`, phase: 'Verify', schema: SCHEMA }
  )
).then(rs => rs.filter(Boolean));

phase('Critique');
const CRIT_SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['gaps', 'corrections', 'crossCuttingInsights', 'additionalFindings', 'recommendedOutline', 'mostInterestingPoints'],
  properties: {
    gaps: { type: 'array', items: { type: 'string' }, description: 'important aspects not yet covered by any dimension' },
    corrections: { type: 'array', items: { type: 'string' }, description: 'likely inaccuracies or contradictions across the reports' },
    crossCuttingInsights: { type: 'array', items: { type: 'string' }, description: 'themes that span dimensions (esp. "why it works this way")' },
    additionalFindings: { type: 'array', items: { type: 'string' }, description: 'new concrete findings you dug up to fill gaps (cite evidence)' },
    recommendedOutline: { type: 'array', items: { type: 'string' }, description: 'ordered section list for the final architecture.html' },
    mostInterestingPoints: { type: 'array', items: { type: 'string' }, description: 'the most insightful/surprising points the write-up MUST include' },
  },
};
const critique = await agent(
  `${ART}\n\nYou are the COMPLETENESS CRITIC for an architecture write-up about this PDF form. Below are ${reports.length} ` +
  `verified dimension analyses. Read them, then spot-check the source files yourself (especially js_all_clean.js, the guide ` +
  `text, bookmark_titles.txt, field_tooltips.txt) to (a) find GAPS — anything important about how/why the form works that no ` +
  `dimension covered; (b) find CORRECTIONS — claims that look wrong or that conflict between reports; (c) surface CROSS-CUTTING ` +
  `insights, especially the throughline of "this is an entire app smuggled into a PDF, and almost every odd choice traces back ` +
  `to a PDF/JavaScript limitation"; (d) do real digging to add concrete additionalFindings; (e) propose the section outline for ` +
  `the final document and list the must-include points. Be specific and evidence-backed.\n\nVERIFIED DIMENSION ANALYSES:\n${JSON.stringify(reports)}`,
  { label: 'completeness-critic', phase: 'Critique', schema: CRIT_SCHEMA }
);

return { reports, critique };
