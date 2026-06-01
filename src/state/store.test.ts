import { beforeEach, describe, expect, it } from "vitest";
import { useCardStore } from "./store.ts";
import { classifyImport } from "./identity.ts";
import { createEmptyCard } from "../model/index.ts";

// jsdom has no IndexedDB, so autosave no-ops here — these test pure store logic.
beforeEach(() => {
  useCardStore.setState({ card: createEmptyCard({ id: "t", now: "2026-06-01T00:00:00.000Z" }) });
});

describe("card store mutations", () => {
  it("sets a text field", () => {
    useCardStore.getState().setField("Open1NT", "12-14");
    expect(useCardStore.getState().card.fields.Open1NT).toBe("12-14");
  });

  it("toggles classification off when the active swatch is re-clicked", () => {
    const s = useCardStore.getState();
    s.toggleClassification("green");
    expect(useCardStore.getState().card.classification).toBe("green");
    useCardStore.getState().toggleClassification("green");
    expect(useCardStore.getState().card.classification).toBe("unset");
    useCardStore.getState().toggleClassification("red");
    expect(useCardStore.getState().card.classification).toBe("red");
  });

  it("keeps the response grid sparse (empty cells are removed)", () => {
    const s = useCardStore.getState();
    s.setResponse("1C", "2D", "inverted");
    expect(useCardStore.getState().card.responses).toEqual({ "1C": { "2D": "inverted" } });
    useCardStore.getState().setResponse("1C", "2D", "");
    expect(useCardStore.getState().card.responses).toEqual({});
  });

  it("swap is a pointer flip — no data movement", () => {
    const s = useCardStore.getState();
    s.setField("PlayerName_A", "Smith");
    s.setField("PlayerName_B", "Jones");
    s.swapPlayers();
    const c = useCardStore.getState().card;
    expect(c.primaryPlayer).toBe(1);
    expect(c.fields.PlayerName_A).toBe("Smith"); // values stay put
    expect(c.fields.PlayerName_B).toBe("Jones");
  });

  it("bumpRevision records lineage via parent", () => {
    useCardStore.getState().bumpRevision();
    const r = useCardStore.getState().card.revision;
    expect(r.counter).toBe(2);
    expect(r.parent).toBe(1);
  });
});

describe("import resolution branch", () => {
  const base = createEmptyCard({ id: "plan-1", now: "2026-06-01T00:00:00.000Z" });
  it("treats an unknown id as a new card", () => {
    const other = createEmptyCard({ id: "plan-2" });
    expect(classifyImport(base, other)).toEqual({ kind: "new" });
    expect(classifyImport(null, other)).toEqual({ kind: "new" });
  });
  it("recognises linear succession via parent", () => {
    const local = { ...base, revision: { label: "", counter: 5 } };
    const incoming = { ...base, revision: { label: "", counter: 6, parent: 5 } };
    expect(classifyImport(local, incoming)).toEqual({ kind: "succession", newer: "incoming" });
  });
  it("routes ambiguous histories to a fork (no timestamp auto-pick)", () => {
    const local = { ...base, revision: { label: "", counter: 5 } };
    const incoming = { ...base, revision: { label: "", counter: 6 } }; // no parent link
    expect(classifyImport(local, incoming)).toEqual({ kind: "fork" });
  });
});
