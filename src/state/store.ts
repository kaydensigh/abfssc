import { create } from "zustand";
import {
  type Card,
  type CardFlags,
  type CardSettings,
  type Classification,
  type ResponseBid,
  type SuitOpening,
  createEmptyCard,
} from "../model/index.ts";
import { loadCurrentCard, requestPersistentStorage, saveCard, storageAvailable } from "./persist.ts";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

export interface CardStore {
  card: Card;
  saveStatus: SaveStatus;
  lastSavedAt: string | null;
  /** Result of navigator.storage.persist(): true granted, false denied, null unknown. */
  persistGranted: boolean | null;
  hydrated: boolean;

  setField: (key: string, value: string) => void;
  setResponse: (opening: SuitOpening, bid: ResponseBid, value: string) => void;
  setFlag: (key: keyof CardFlags, value: boolean) => void;
  toggleClassification: (value: Exclude<Classification, "unset">) => void;
  setPrimaryPlayer: (p: 0 | 1) => void;
  swapPlayers: () => void;
  setRevisionLabel: (label: string) => void;
  bumpRevision: () => void;
  setSetting: <K extends keyof CardSettings>(key: K, value: CardSettings[K]) => void;
  replaceCard: (card: Card) => void;
  resetCard: () => void;
  /** Load the persisted card and request persistent storage (browser only). */
  hydrate: () => Promise<void>;
}

const SAVE_DEBOUNCE_MS = 600;
let saveTimer: ReturnType<typeof setTimeout> | null = null;

export const useCardStore = create<CardStore>((set, get) => {
  // Debounced local autosave. Coalesces rapid edits; swallows storage errors
  // (e.g. private browsing) into the save status rather than throwing.
  const scheduleSave = () => {
    if (!storageAvailable()) return;
    set({ saveStatus: "saving" });
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      void (async () => {
        try {
          const savedAt = await saveCard(get().card);
          set({ saveStatus: "saved", lastSavedAt: savedAt });
        } catch {
          set({ saveStatus: "error" });
        }
      })();
    }, SAVE_DEBOUNCE_MS);
  };

  const mutate = (fn: (c: Card) => Card) => {
    set((s) => ({ card: fn(s.card) }));
    scheduleSave();
  };

  return {
    card: createEmptyCard(),
    saveStatus: "idle",
    lastSavedAt: null,
    persistGranted: null,
    hydrated: false,

    setField: (key, value) => mutate((c) => ({ ...c, fields: { ...c.fields, [key]: value } })),

    setResponse: (opening, bid, value) =>
      mutate((c) => {
        const row: Partial<Record<ResponseBid, string>> = { ...(c.responses[opening] ?? {}) };
        if (value === "") delete row[bid];
        else row[bid] = value;
        const responses = { ...c.responses };
        if (Object.keys(row).length === 0) delete responses[opening];
        else responses[opening] = row;
        return { ...c, responses };
      }),

    setFlag: (key, value) => mutate((c) => ({ ...c, flags: { ...c.flags, [key]: value } })),

    toggleClassification: (value) =>
      mutate((c) => ({ ...c, classification: c.classification === value ? "unset" : value })),

    setPrimaryPlayer: (p) => mutate((c) => ({ ...c, primaryPlayer: p })),
    swapPlayers: () => mutate((c) => ({ ...c, primaryPlayer: c.primaryPlayer === 0 ? 1 : 0 })),

    setRevisionLabel: (label) => mutate((c) => ({ ...c, revision: { ...c.revision, label } })),
    bumpRevision: () =>
      mutate((c) => ({
        ...c,
        revision: { label: c.revision.label, counter: c.revision.counter + 1, parent: c.revision.counter },
      })),

    setSetting: (key, value) => mutate((c) => ({ ...c, settings: { ...c.settings, [key]: value } })),

    replaceCard: (card) => {
      set({ card });
      scheduleSave();
    },
    resetCard: () => {
      set({ card: createEmptyCard() });
      scheduleSave();
    },

    hydrate: async () => {
      if (get().hydrated) return;
      const granted = await requestPersistentStorage();
      const existing = storageAvailable() ? await loadCurrentCard() : null;
      set((s) => ({
        card: existing ?? s.card,
        hydrated: true,
        persistGranted: granted,
        lastSavedAt: existing?.provenance.savedAt ?? s.lastSavedAt,
        saveStatus: existing ? "saved" : "idle",
      }));
    },
  };
});
