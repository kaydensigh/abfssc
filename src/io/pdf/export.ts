// Export orchestrator — the regulation-faithful PDF. Walks the typed Card and
// fills the blank ABF_Card_FORM: every editable /V (so our own import round-trips
// losslessly) plus each D_ display twin's rich appearance (so it prints in any
// viewer, JS or not — design §06 Strategy A). pdf-lib never appears here; all of
// that lives behind the adapter. Pure orchestration over the model + render engine.

import type { Card } from "../../model/index.ts";
import { SECTIONS, FLAG_KEYS, OPENINGS, GRID_CELLS, gridFieldName } from "../../model/index.ts";
import type { Span } from "../../render/index.ts";
import { renderCoded } from "../../render/index.ts";
import { codeMap } from "../../content/codelists.ts";
import { loadTemplate } from "./adapter.ts";
import { CLASSIFICATION_LITERAL, MERGE_CHILD, ORPHAN_MERGE, PLAYER_SWAP, dTwin } from "./fieldmap.ts";

const BASE = { fieldDefaults: { sizePt: 10 } } as const;

/** Separator placed between a parent field and a merged "Other" child. */
const SEP_SPAN: Span = {
  text: "  ",
  color: "#000000",
  bold: false,
  italic: false,
  underline: false,
  vshift: 0,
  sizePt: 10,
};

export interface ExportResult {
  bytes: Uint8Array;
  /** Non-fatal issues (e.g. a model value with no home in the real form). */
  warnings: string[];
}

export interface ExportOptions {
  /** ISO timestamp stamped into the export; defaults to the card's savedAt. */
  now?: string;
}

function render(raw: string, codeListKey: string, multiline: boolean): Span[] {
  return renderCoded(raw, { ...BASE, codeList: codeMap(codeListKey), multiline });
}

/** Build the filled regulation PDF for `card` from the blank form bytes. */
export async function buildCardPdf(
  card: Card,
  templateBytes: Uint8Array | ArrayBuffer,
  opts: ExportOptions = {},
): Promise<ExportResult> {
  const tpl = await loadTemplate(templateBytes);
  const warnings: string[] = [];

  // ---- text fields (regulated sections + the §5 vs-NT/vs-suit pairs) ----------
  const textFields: { key: string; multiline: boolean }[] = [];
  for (const s of SECTIONS) {
    for (const fd of s.fields) {
      if (fd.kind === "checkbox") continue;
      textFields.push({ key: fd.key, multiline: !!fd.multiline });
    }
    if (s.pairs) {
      for (const p of s.pairs) {
        textFields.push({ key: p.ntKey, multiline: false }, { key: p.sKey, multiline: false });
      }
    }
  }

  const swap = card.primaryPlayer === 1;
  for (const { key, multiline } of textFields) {
    const raw = card.fields[key] ?? "";
    tpl.setEditableValue(key, raw); // editable /V stays canonical for re-import

    // The "Other" merge children have no D_ twin: their value rides into the
    // parent's appearance below, so skip authoring one here.
    if (key in ORPHAN_MERGE) continue;

    // Swap-to-print: when slot B is primary, a player twin shows the other
    // slot's value (the editable /V above is unchanged). Non-player fields and
    // primaryPlayer === 0 leave the source key untouched.
    const sourceKey = swap && PLAYER_SWAP[key] ? PLAYER_SWAP[key] : key;
    const displayRaw = card.fields[sourceKey] ?? "";

    const childKey = MERGE_CHILD[key];
    const childRaw = childKey ? card.fields[childKey] ?? "" : "";
    if (displayRaw === "" && childRaw === "") continue;

    let spans = displayRaw ? render(displayRaw, sourceKey, multiline) : [];
    if (childKey && childRaw) {
      if (spans.length) spans = [...spans, SEP_SPAN];
      spans = [...spans, ...render(childRaw, childKey, multiline)];
    }
    if (!tpl.writeRichField(dTwin(key), spans, multiline)) {
      warnings.push(`no D_ twin for field "${key}"`);
    }
  }

  // ---- §8 responses grid ------------------------------------------------------
  for (const opening of OPENINGS) {
    const row = card.responses[opening];
    if (!row) continue;
    for (const bid of GRID_CELLS[opening]) {
      const raw = row[bid];
      if (raw === undefined || raw === "") continue;
      const name = gridFieldName(opening, bid);
      tpl.setEditableValue(name, raw);
      const spans = render(raw, name, false);
      if (!tpl.writeRichField(dTwin(name), spans, false)) {
        warnings.push(`no D_ twin for grid cell ${name}`);
      }
    }
  }

  // ---- checkboxes (text "imitation checkboxes" + their B_ print twins) --------
  for (const flag of FLAG_KEYS) {
    tpl.writeCheckbox(flag, card.flags[flag], card.settings.checkboxStyle);
  }

  // ---- classification + brown-sticker cover boxes -----------------------------
  tpl.setClassification(
    CLASSIFICATION_LITERAL[card.classification],
    card.classification !== "unset",
    card.flags.IsBrownSticker,
  );

  // ---- app-state stamp (identity/version/settings the AcroForm can't carry) ---
  const stamp = {
    v: 1,
    id: card.id,
    schemaVersion: card.schemaVersion,
    revision: card.revision,
    primaryPlayer: card.primaryPlayer,
    settings: card.settings,
    savedAt: opts.now ?? card.provenance.savedAt,
  };
  tpl.addStamp(JSON.stringify(stamp));

  const bytes = await tpl.save();
  return { bytes, warnings };
}
