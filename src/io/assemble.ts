// The pure heart of import: a raw field map (+ optional app-state stamp) → Card.
// Both the PDF reader and the FDF parser converge here, so all the model-shaping
// logic — name normalisation, blank-sentinel handling, native-over-legacy
// precedence, classification/flag/grid mapping — lives in one tested, pdf-lib-
// free place. The final shaping/defaulting is delegated to model.migrate().

import type { Card } from "../model/index.ts";
import { migrate, allTextFieldKeys, FLAG_KEYS, OPENINGS, GRID_CELLS, gridFieldName } from "../model/index.ts";
import { normalizeFieldName } from "./rename.ts";
import { CLASSIFICATION_BY_LITERAL, normalizeFieldValue } from "./pdf/fieldmap.ts";

export interface RawImport {
  /** Raw field name → raw /V text, exactly as read from the file. */
  fields: Map<string, string>;
  /** The embedded app-state JSON (our own exports only), or null. */
  stampJson: string | null;
}

export interface ImportedCard {
  card: Card;
  /** Non-fatal issues surfaced to the user. */
  warnings: string[];
  /** True when a valid app-state stamp was present (our-own-export fast path). */
  stampPresent: boolean;
}

interface Slot {
  value: string;
  /** Whether this value came from a name that needed no rename (authoritative). */
  native: boolean;
}

/**
 * Collapse raw names onto canonical ones with precedence: a native (un-renamed)
 * value always beats a legacy alias, and within a tier a non-empty value beats a
 * blank one. This is what lets our own export — which still ships the dotted
 * legacy mirror fields (Resp1C._1H) alongside the flat editable cells — round-
 * trip cleanly: the flat native cell wins over the renamed blank mirror.
 */
function collapse(fields: Map<string, string>): Map<string, Slot> {
  const out = new Map<string, Slot>();
  for (const [rawName, rawValue] of fields) {
    const norm = normalizeFieldName(rawName);
    const native = norm === rawName;
    const value = normalizeFieldValue(rawValue, native);
    const existing = out.get(norm);
    if (!existing) {
      out.set(norm, { value, native });
    } else if (native && !existing.native) {
      out.set(norm, { value, native }); // native overrides a legacy alias
    } else if (native === existing.native && existing.value === "" && value !== "") {
      out.set(norm, { value, native }); // same tier: a real value beats a blank
    }
  }
  return out;
}

interface Stamp {
  id?: unknown;
  schemaVersion?: unknown;
  revision?: unknown;
  primaryPlayer?: unknown;
  settings?: unknown;
  savedAt?: unknown;
}

/** Assemble a Card from raw imported field values + an optional app-state stamp. */
export function assembleCard(input: RawImport): ImportedCard {
  const warnings: string[] = [];
  const values = collapse(input.fields);
  const get = (name: string): string => values.get(name)?.value ?? "";

  let stamp: Stamp | null = null;
  if (input.stampJson) {
    try {
      const parsed: unknown = JSON.parse(input.stampJson);
      if (parsed && typeof parsed === "object") stamp = parsed as Stamp;
    } catch {
      warnings.push("The file's embedded card data was unreadable; importing it as a new card.");
    }
  }

  // ---- text fields ----------------------------------------------------------
  const fields: Record<string, string> = {};
  for (const key of allTextFieldKeys()) fields[key] = get(key);

  // ---- §8 responses grid (read the flat editable cells directly) ------------
  const responses: Record<string, Record<string, string>> = {};
  for (const opening of OPENINGS) {
    const row: Record<string, string> = {};
    for (const bid of GRID_CELLS[opening]) {
      const v = get(gridFieldName(opening, bid));
      if (v !== "") row[bid] = v;
    }
    if (Object.keys(row).length > 0) responses[opening] = row;
  }

  // ---- checkboxes -----------------------------------------------------------
  const flags: Record<string, boolean> = {};
  for (const key of FLAG_KEYS) {
    const v = get(key).trim().toLowerCase();
    flags[key] = v === "yes" || v === "on";
  }

  // ---- classification (text literal → enum) ---------------------------------
  const classification = CLASSIFICATION_BY_LITERAL[get("Classification").trim()] ?? "unset";

  // ---- assemble + let migrate() shape, validate, and default ----------------
  const raw: Record<string, unknown> = {
    fields,
    responses,
    flags,
    classification,
  };
  if (stamp) {
    raw.id = stamp.id;
    raw.schemaVersion = stamp.schemaVersion;
    raw.revision = stamp.revision;
    raw.primaryPlayer = stamp.primaryPlayer;
    raw.settings = stamp.settings;
    raw.provenance = { savedAt: stamp.savedAt };
  }

  return { card: migrate(raw), warnings, stampPresent: stamp !== null };
}
