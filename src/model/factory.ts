import { type Card, type CardFlags, DEFAULT_SETTINGS, FLAG_KEYS, SCHEMA_VERSION } from "./types.ts";
import { allTextFieldKeys } from "./sections.ts";

/** Mint a fresh plan identity (UUID v4). */
export function newId(): string {
  return crypto.randomUUID();
}

export function emptyFlags(): CardFlags {
  const flags = {} as CardFlags;
  for (const k of FLAG_KEYS) flags[k] = false;
  return flags;
}

/** A blank card: every text field empty, every flag off, classification unset. */
export function createEmptyCard(opts: { id?: string; now?: string } = {}): Card {
  const now = opts.now ?? new Date().toISOString();
  const fields: Record<string, string> = {};
  for (const key of allTextFieldKeys()) fields[key] = "";
  return {
    id: opts.id ?? newId(),
    schemaVersion: SCHEMA_VERSION,
    revision: { label: "", counter: 1 },
    provenance: { schemaVersion: SCHEMA_VERSION, savedAt: now },
    primaryPlayer: 0,
    classification: "unset",
    flags: emptyFlags(),
    fields,
    responses: {},
    settings: { ...DEFAULT_SETTINGS },
  };
}
