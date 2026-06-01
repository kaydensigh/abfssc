import {
  type Card,
  type CardSettings,
  type CheckboxStyle,
  type Classification,
  DEFAULT_SETTINGS,
  FLAG_KEYS,
  type ResponsesGrid,
  SCHEMA_VERSION,
  type SuitOpening,
} from "./types.ts";
import { allTextFieldKeys } from "./sections.ts";
import { GRID_CELLS, OPENINGS, cellExists } from "./grid.ts";
import { createEmptyCard } from "./factory.ts";

const VALID_CLASS = new Set<Classification>(["green", "blue", "red", "yellow", "unset"]);
const VALID_CHECKBOX = new Set<CheckboxStyle>(["bigX", "smallBlack", "tick", "cross"]);

function sanitizeResponses(raw: unknown): ResponsesGrid {
  const out: ResponsesGrid = {};
  if (!raw || typeof raw !== "object") return out;
  const r = raw as Record<string, unknown>;
  for (const opening of OPENINGS) {
    const row = r[opening];
    if (!row || typeof row !== "object") continue;
    const cells = row as Record<string, unknown>;
    const kept: Partial<Record<(typeof GRID_CELLS)[SuitOpening][number], string>> = {};
    let any = false;
    for (const bid of GRID_CELLS[opening]) {
      const v = cells[bid];
      if (typeof v === "string" && cellExists(opening, bid)) {
        kept[bid] = v;
        any = true;
      }
    }
    if (any) out[opening] = kept;
  }
  return out;
}

function sanitizeSettings(raw: unknown): CardSettings {
  const s = { ...DEFAULT_SETTINGS };
  if (!raw || typeof raw !== "object") return s;
  const r = raw as Record<string, unknown>;
  if (typeof r.suitColours === "boolean") s.suitColours = r.suitColours;
  if (typeof r.checkboxStyle === "string" && VALID_CHECKBOX.has(r.checkboxStyle as CheckboxStyle)) {
    s.checkboxStyle = r.checkboxStyle as CheckboxStyle;
  }
  if (r.richness === "rich" || r.richness === "basic") s.richness = r.richness;
  return s;
}

/**
 * Bring a loaded value up to the current schema. v1 has exactly one schema, so
 * this is a single defensive guard, not a ladder (design §10 YAGNI): it returns
 * a fully-shaped Card, filling any missing field with its empty default and
 * minting an id when absent. A second schema would add one more branch here.
 */
export function migrate(raw: unknown): Card {
  const card = createEmptyCard();
  if (!raw || typeof raw !== "object") return card;
  const r = raw as Record<string, unknown>;

  if (typeof r.id === "string" && r.id) card.id = r.id; // else keep the minted id
  if (typeof r.classification === "string" && VALID_CLASS.has(r.classification as Classification)) {
    card.classification = r.classification as Classification;
  }
  if (r.primaryPlayer === 1) card.primaryPlayer = 1;

  if (r.flags && typeof r.flags === "object") {
    const rf = r.flags as Record<string, unknown>;
    for (const k of FLAG_KEYS) if (typeof rf[k] === "boolean") card.flags[k] = rf[k];
  }

  if (r.fields && typeof r.fields === "object") {
    const rfields = r.fields as Record<string, unknown>;
    for (const key of allTextFieldKeys()) {
      const v = rfields[key];
      if (typeof v === "string") card.fields[key] = v;
    }
  }

  card.responses = sanitizeResponses(r.responses);

  if (r.revision && typeof r.revision === "object") {
    const rv = r.revision as Record<string, unknown>;
    if (typeof rv.counter === "number" && Number.isFinite(rv.counter)) card.revision.counter = rv.counter;
    if (typeof rv.label === "string") card.revision.label = rv.label;
    if (typeof rv.parent === "number" && Number.isFinite(rv.parent)) card.revision.parent = rv.parent;
  }

  card.settings = sanitizeSettings(r.settings);
  // Preserve the stored save time so the storage indicator shows when the card
  // was last persisted, not when it was reloaded. (saveCard re-stamps on write.)
  if (r.provenance && typeof r.provenance === "object") {
    const rp = r.provenance as Record<string, unknown>;
    if (typeof rp.savedAt === "string") card.provenance.savedAt = rp.savedAt;
  }
  card.schemaVersion = SCHEMA_VERSION;
  return card;
}
