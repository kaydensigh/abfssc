import { beforeEach, describe, expect, it } from "vitest";
import { useCardStore } from "./store.ts";
import { createEmptyCard } from "../model/index.ts";

beforeEach(() => {
  useCardStore.setState({ card: createEmptyCard({ id: "t", now: "2026-06-01T00:00:00.000Z" }), dirty: false });
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

describe("unsaved-changes tracking", () => {
  it("an edit flags the card dirty", () => {
    expect(useCardStore.getState().dirty).toBe(false);
    useCardStore.getState().setField("Open1NT", "12-14");
    expect(useCardStore.getState().dirty).toBe(true);
  });

  it("markExported clears the dirty flag", () => {
    useCardStore.getState().setField("Open1NT", "12-14");
    useCardStore.getState().markExported();
    expect(useCardStore.getState().dirty).toBe(false);
  });

  it("import (replaceCard) lands clean — it matches the file just read", () => {
    useCardStore.setState({ dirty: true });
    useCardStore.getState().replaceCard(createEmptyCard({ id: "imported" }));
    expect(useCardStore.getState().dirty).toBe(false);
  });

  it("a new card (resetCard) lands clean — nothing on screen to lose", () => {
    useCardStore.setState({ dirty: true });
    useCardStore.getState().resetCard();
    expect(useCardStore.getState().dirty).toBe(false);
  });
});
