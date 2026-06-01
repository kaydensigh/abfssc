import { type IDBPDatabase, openDB } from "idb";
import type { Card } from "../model/index.ts";
import { migrate } from "../model/index.ts";

// Local-only persistence: a small IndexedDB wrapper (idb) holds the card on THIS
// device. There is no cloud sync — the storage banner makes that explicit, and
// the M1 PDF export is "the real save". Cards are keyed by id so the same store
// can hold history later (M3 keep-both); a `meta` store points at the active id.

const DB_NAME = "abf-system-card";
const DB_VERSION = 1;
const CARDS = "cards";
const META = "meta";
const CURRENT_KEY = "currentId";

/** Whether IndexedDB exists (false in jsdom/tests and very old browsers). */
export function storageAvailable(): boolean {
  return typeof indexedDB !== "undefined";
}

let dbPromise: Promise<IDBPDatabase> | null = null;
function db(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(d) {
        if (!d.objectStoreNames.contains(CARDS)) d.createObjectStore(CARDS, { keyPath: "id" });
        if (!d.objectStoreNames.contains(META)) d.createObjectStore(META);
      },
    });
  }
  return dbPromise;
}

/** Persist the card and mark it current. Stamps provenance.savedAt. */
export async function saveCard(card: Card): Promise<string> {
  const savedAt = new Date().toISOString();
  const stamped: Card = {
    ...card,
    provenance: { schemaVersion: card.schemaVersion, savedAt },
  };
  const d = await db();
  await d.put(CARDS, stamped);
  await d.put(META, card.id, CURRENT_KEY);
  return savedAt;
}

/** Load the active card (migrated to the current schema), or null if none. */
export async function loadCurrentCard(): Promise<Card | null> {
  const d = await db();
  const id = (await d.get(META, CURRENT_KEY)) as string | undefined;
  if (!id) return null;
  const raw = await d.get(CARDS, id);
  return raw ? migrate(raw) : null;
}

/**
 * Ask the browser to keep our storage from being evicted. Safari/iOS commonly
 * denies; the indicator escalates to amber when this returns false.
 */
export async function requestPersistentStorage(): Promise<boolean> {
  try {
    if (typeof navigator !== "undefined" && navigator.storage?.persist) {
      return await navigator.storage.persist();
    }
  } catch {
    /* ignore */
  }
  return false;
}
