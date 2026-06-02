# ABFSSC webform

This is a port of the [Australian Bridge Federation Standard System Card](https://www.abf.com.au/wp-content/uploads/2021/05/ABF_Card_Blank_21D24.pdf) to a web page for easier use.

This also uses the [ABF Card Usage Guide](https://abfevents.com.au/system/ABF_Card_Form_Usage_Guide.pdf) to inform how the web form should behave.

Most of it was created using Claude Code. [architecture.html](abf/architecture.html) has a fantastic (if a little snarky) write-up of how the existing PDF manages to do what it does.

## Web app

The rebuild follows the implementation design in [docs/web-rebuild-design.html](docs/web-rebuild-design.html). It is a 100% static React + Vite + TypeScript app; a single typed `Card` model is the source of truth and the on-screen card is a projection of it.

**Milestone M0 (current): model + render engine + screen form + autosave.** You can fill a card on screen — all ten regulated sections, the masthead, and the §8 responses grid — with the full `!`-code markup (suits, the 10-colour palette, b/i/u, super/sub, size, tabs, Unicode, grave shortcuts), and it autosaves locally on your device. PDF import/export is a later milestone.

```sh
npm install
npm run dev        # local dev server
npm run build      # static production build → dist/
npm test           # vitest (render engine, model, store, components)
npm run typecheck  # tsc project build, no emit
npm run shots      # screenshot all 4 pages → abf/screenshots/app/page-1..4.png
```

### Visual inspection

`npm run shots` boots Vite in-process and drives a headless Chromium over all
four page tabs, writing one full-height PNG per page to `abf/screenshots/app/`
(git-ignored). It's the quick way to eyeball the browser-rendered card — e.g.
diffing it against the blank reference pages tracked directly under
`abf/screenshots/1-4.png` (those are the four pages of the printed ABF PDF).
Pass a directory to write elsewhere: `node scripts/screenshot.mjs <out-dir>`.

It needs the one-time Playwright browser download: `npx playwright install chromium`.

### Layout

```
src/
  render/   the !-code engine (renderCoded → Span[]), palette, grave table, React renderer
  model/    Card type, §8 grid axes, sections registry, empty-card factory, migrate guard
  content/  the 52 embedded code lists (generated from abf/extracted/) + classification
  state/    zustand store, IndexedDB autosave, import-resolution identity logic
  ui/       data-driven sections, the six field kinds, the §8 grid, storage banner, nav
```

The code lists are generated from the extracted catalogue with `node scripts/build-codelists.mjs`.
