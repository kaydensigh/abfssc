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

export interface CardStore {
  card: Card;
  /**
   * True when the on-screen card has edits not yet captured in an exported PDF.
   * There is no local persistence — the card lives only in this browser tab and
   * the exported PDF is the single durable copy — so this drives both the save
   * indicator and the before-unload guard. Opening the app in a second tab gives
   * a fully independent card, which is how two cards are compared side by side.
   */
  dirty: boolean;

  setField: (key: string, value: string) => void;
  setResponse: (opening: SuitOpening, bid: ResponseBid, value: string) => void;
  setFlag: (key: keyof CardFlags, value: boolean) => void;
  toggleClassification: (value: Exclude<Classification, "unset">) => void;
  setPrimaryPlayer: (p: 0 | 1) => void;
  swapPlayers: () => void;
  setRevisionLabel: (label: string) => void;
  bumpRevision: () => void;
  setSetting: <K extends keyof CardSettings>(key: K, value: CardSettings[K]) => void;
  /** Replace the whole card (import). Lands clean: it matches the file just read. */
  replaceCard: (card: Card) => void;
  /** Clear to a blank card. Lands clean: there is nothing on screen to lose. */
  resetCard: () => void;
  /** Mark the current card as captured in an exported PDF (clears dirty). */
  markExported: () => void;
}

export const useCardStore = create<CardStore>((set) => {
  // Every field edit flags the card dirty; a wholesale replace/reset/export
  // clears it. There is no autosave — the exported PDF is the only durable
  // artifact, and the before-unload guard leans on `dirty` to warn first.
  const mutate = (fn: (c: Card) => Card) => set((s) => ({ card: fn(s.card), dirty: true }));

  return {
    card: createEmptyCard(),
    dirty: false,

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

    replaceCard: (card) => set({ card, dirty: false }),
    resetCard: () => set({ card: createEmptyCard(), dirty: false }),
    markExported: () => set({ dirty: false }),
  };
});
