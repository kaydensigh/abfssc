import { describe, it, expect } from "vitest";
import { assembleCard } from "./assemble.ts";
import { createEmptyCard } from "../model/index.ts";

const m = (entries: Record<string, string>): Map<string, string> => new Map(Object.entries(entries));

describe("assembleCard (the shared PDF/FDF → Card step)", () => {
  it("normalises a native field's true blank sentinels (^ , space, empty) to empty", () => {
    const { card } = assembleCard({
      fields: m({ BasicSystem: "^ ", Open1C: " ", Open1D: "", Open1H: "real" }),
      stampJson: null,
    });
    expect(card.fields.BasicSystem).toBe("");
    expect(card.fields.Open1C).toBe("");
    expect(card.fields.Open1D).toBe("");
    expect(card.fields.Open1H).toBe("real");
  });

  it("preserves legacy-migration sentinels as content on a NATIVE field (round-trip safety)", () => {
    // `!+` `!-` `!=` `!n` and multi-space runs are real rich-code / user content
    // on a current field; the form only blanks them when migrating RETIRED fields.
    const { card } = assembleCard({
      fields: m({ BasicSystem: "!+", Open1C: "!- ", Open1D: "  ", Open1H: "!n " }),
      stampJson: null,
    });
    expect(card.fields.BasicSystem).toBe("!+");
    expect(card.fields.Open1C).toBe("!- ");
    expect(card.fields.Open1D).toBe("  ");
    expect(card.fields.Open1H).toBe("!n ");
  });

  it("maps the Classification literal back to the enum", () => {
    expect(assembleCard({ fields: m({ Classification: "Green" }), stampJson: null }).card.classification).toBe("green");
    expect(assembleCard({ fields: m({ Classification: "Red" }), stampJson: null }).card.classification).toBe("red");
    expect(assembleCard({ fields: m({ Classification: "not set" }), stampJson: null }).card.classification).toBe("unset");
    expect(assembleCard({ fields: m({}), stampJson: null }).card.classification).toBe("unset");
  });

  it("reads checkbox text values into flags (Yes ⇒ true)", () => {
    const { card } = assembleCard({
      fields: m({ IsBlackwood: "Yes", IsGerber: "Off", IsBrownSticker: "yes" }),
      stampJson: null,
    });
    expect(card.flags.IsBlackwood).toBe(true);
    expect(card.flags.IsGerber).toBe(false);
    expect(card.flags.IsBrownSticker).toBe(true); // case-insensitive
    expect(card.flags.IsCanape).toBe(false); // absent ⇒ false
  });

  it("builds the §8 grid only from non-empty cells", () => {
    const { card } = assembleCard({
      fields: m({ Resp1C_1H: "forcing 1 round", Resp1C_1D: "^ ", Resp1D_1H: "" }),
      stampJson: null,
    });
    expect(card.responses["1C"]).toEqual({ "1H": "forcing 1 round" });
    expect(card.responses["1D"]).toBeUndefined();
  });

  it("gives a native (flat) cell precedence over its renamed dotted mirror", () => {
    // This is what protects the round-trip: our own export ships both names.
    const { card } = assembleCard({
      fields: m({ Resp1C_1H: "real", "Resp1C._1H": "stale mirror" }),
      stampJson: null,
    });
    expect(card.responses["1C"]).toEqual({ "1H": "real" });
  });

  it("falls back to a dotted legacy name when no flat cell is present", () => {
    const { card } = assembleCard({ fields: m({ "Resp1C._1H": "legacy value" }), stampJson: null });
    expect(card.responses["1C"]).toEqual({ "1H": "legacy value" });
  });

  it("normalises legacy dotted player names", () => {
    const { card } = assembleCard({
      fields: m({ "PlayerName.A": "Smith", "PlayerNo.B": "12345" }),
      stampJson: null,
    });
    expect(card.fields.PlayerName_A).toBe("Smith");
    expect(card.fields.PlayerNo_B).toBe("12345");
  });

  it("reads the app-state stamp on the fast path", () => {
    const stamp = JSON.stringify({
      v: 1,
      id: "abc-123",
      schemaVersion: 1,
      revision: { label: "v2", counter: 5, parent: 4 },
      primaryPlayer: 1,
      settings: { suitColours: false, checkboxStyle: "tick", richness: "rich", dateFormat: "iso" },
      savedAt: "2026-06-02T00:00:00.000Z",
    });
    const { card, stampPresent } = assembleCard({ fields: m({}), stampJson: stamp });
    expect(stampPresent).toBe(true);
    expect(card.id).toBe("abc-123");
    expect(card.revision).toEqual({ label: "v2", counter: 5, parent: 4 });
    expect(card.primaryPlayer).toBe(1);
    expect(card.settings.checkboxStyle).toBe("tick");
    expect(card.settings.suitColours).toBe(false);
  });

  it("mints a fresh id and reports no stamp for a stampless (legacy) file", () => {
    const { card, stampPresent } = assembleCard({ fields: m({ BasicSystem: "x" }), stampJson: null });
    expect(stampPresent).toBe(false);
    expect(card.id).toMatch(/^[0-9a-f]{8}-/i); // a minted UUID
  });

  it("survives a malformed stamp with a warning, not a throw", () => {
    const { card, warnings, stampPresent } = assembleCard({ fields: m({}), stampJson: "{not json" });
    expect(stampPresent).toBe(false);
    expect(warnings.length).toBe(1);
    expect(card.id).toMatch(/^[0-9a-f]{8}-/i);
  });

  it("produces a fully-shaped empty card from an empty map", () => {
    const { card } = assembleCard({ fields: m({}), stampJson: null });
    const empty = createEmptyCard({ id: card.id, now: card.provenance.savedAt });
    // Same shape & defaults (ids/savedAt aligned above); responses empty, flags off.
    expect(card.responses).toEqual({});
    expect(card.flags).toEqual(empty.flags);
    expect(Object.keys(card.fields).sort()).toEqual(Object.keys(empty.fields).sort());
  });
});
