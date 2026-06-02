import { describe, expect, it } from "vitest";
import { GRID_CELLS, OPENINGS, RESPONSE_BIDS, cellExists, gridFieldName } from "./grid.ts";
import { allTextFieldKeys, fieldKind, SECTIONS } from "./sections.ts";
import { createEmptyCard, emptyFlags } from "./factory.ts";
import { migrate } from "./migrate.ts";
import { FLAG_KEYS } from "./types.ts";
import { hasCodeList } from "../content/codelists.ts";

describe("§8 grid axes", () => {
  it("has the ten opening rows", () => {
    expect(OPENINGS).toEqual(["1C", "1D", "1H", "1S", "1NT", "2C", "2D", "2H", "2S", "2NT"]);
  });
  it("matches the ragged cell sets from the field tree", () => {
    expect(GRID_CELLS["1C"]).toHaveLength(16); // 16 response cells
    expect(GRID_CELLS["1H"]).toHaveLength(13); // 13 response cells
    expect(GRID_CELLS["1NT"]).toEqual(["3C", "3D", "3H", "3S", "3NT", "4C", "4D", "4H", "4S", "Other"]);
  });
  it("every cell is a member of the column union", () => {
    for (const opening of OPENINGS) {
      for (const bid of GRID_CELLS[opening]) {
        expect(RESPONSE_BIDS).toContain(bid);
        expect(cellExists(opening, bid)).toBe(true);
      }
    }
  });
  it("rejects holes in the matrix", () => {
    expect(cellExists("1NT", "1D")).toBe(false); // 1NT has no 1-level responses
    expect(cellExists("1H", "1D")).toBe(false);
  });
  it("maps grid coordinates to canonical PDF field names", () => {
    expect(gridFieldName("1C", "2D")).toBe("Resp1C_2D");
    expect(gridFieldName("2S", "Other")).toBe("Resp2S_Other");
  });
});

describe("sections registry", () => {
  it("covers all ten regulated sections plus a masthead", () => {
    const numbers = SECTIONS.filter((s) => s.number).map((s) => s.number);
    expect(numbers).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(SECTIONS.some((s) => s.id === "masthead")).toBe(true);
  });
  it("resolves 'coded' from the presence of a code list", () => {
    const open1nt = SECTIONS.find((s) => s.id === "s1")!.fields.find((f) => f.key === "Open1NT")!;
    expect(fieldKind(open1nt)).toBe("coded");
    expect(hasCodeList("Open1NT")).toBe(true);
    const openOther = SECTIONS.find((s) => s.id === "s1")!.fields.find((f) => f.key === "OpenOther")!;
    expect(fieldKind(openOther)).toBe("rich");
  });
  it("places every flag in exactly one section as a checkbox", () => {
    const cbKeys = SECTIONS.flatMap((s) => s.fields).filter((f) => f.kind === "checkbox").map((f) => f.key);
    expect(new Set(cbKeys)).toEqual(new Set(FLAG_KEYS));
    expect(cbKeys).toHaveLength(FLAG_KEYS.length); // no duplicates
  });
  it("text-field keys are unique and exclude flags", () => {
    const keys = allTextFieldKeys();
    expect(new Set(keys).size).toBe(keys.length);
    for (const flag of FLAG_KEYS) expect(keys).not.toContain(flag);
  });
});

describe("empty-card factory", () => {
  it("creates a blank, fully-shaped card", () => {
    const card = createEmptyCard({ id: "fixed", now: "2026-06-01T00:00:00.000Z" });
    expect(card.id).toBe("fixed");
    expect(card.classification).toBe("unset");
    expect(card.flags).toEqual(emptyFlags());
    expect(Object.values(card.flags).every((v) => v === false)).toBe(true);
    expect(Object.values(card.fields).every((v) => v === "")).toBe(true);
    expect(card.responses).toEqual({});
    expect(card.fields.Open1C).toBe("");
    expect(card.settings.suitColours).toBe(true);
    expect(card.settings.checkboxStyle).toBe("bigX");
  });
});

describe("migration guard", () => {
  it("returns a valid empty card for garbage input", () => {
    for (const junk of [null, undefined, 42, "x", [], {}]) {
      const c = migrate(junk);
      expect(typeof c.id).toBe("string");
      expect(c.schemaVersion).toBe(1);
      expect(c.classification).toBe("unset");
    }
  });
  it("mints an id when a legacy value has none", () => {
    const c = migrate({ fields: { Open1C: "12+" } });
    expect(c.id).toMatch(/[0-9a-f-]{36}/);
    expect(c.fields.Open1C).toBe("12+");
  });
  it("round-trips a populated card losslessly (ignoring re-stamped provenance)", () => {
    const original = createEmptyCard({ id: "abc", now: "2026-06-01T00:00:00.000Z" });
    original.fields.Open1NT = "12-14 Balanced";
    original.fields.PlayerName_A = "Smith";
    original.flags.IsBlackwood = true;
    original.classification = "green";
    original.primaryPlayer = 1;
    original.revision = { label: "v2", counter: 4, parent: 3 };
    original.responses = { "1C": { "1D": "natural", "2D": "inverted" } };

    const restored = migrate(JSON.parse(JSON.stringify(original)));
    expect(restored.id).toBe("abc");
    expect(restored.fields).toEqual(original.fields);
    expect(restored.flags).toEqual(original.flags);
    expect(restored.classification).toBe("green");
    expect(restored.primaryPlayer).toBe(1);
    expect(restored.revision).toEqual(original.revision);
    expect(restored.responses).toEqual(original.responses);
    expect(restored.settings).toEqual(original.settings);
  });
  it("preserves the stored save timestamp (banner shows last save, not reload)", () => {
    const saved = createEmptyCard({ id: "x", now: "2020-01-01T00:00:00.000Z" });
    saved.provenance = { schemaVersion: 1, savedAt: "2026-05-30T10:00:00.000Z" };
    const c = migrate(JSON.parse(JSON.stringify(saved)));
    expect(c.provenance.savedAt).toBe("2026-05-30T10:00:00.000Z");
  });
  it("drops unknown fields, invalid classification, and matrix holes", () => {
    const c = migrate({
      classification: "purple",
      fields: { Open1C: "ok", NotARealField: "drop me" },
      responses: { "1NT": { "1D": "hole", "3C": "valid" }, NotAnOpening: { x: 1 } },
      flags: { IsBlackwood: "yes", IsGerber: true },
    });
    expect(c.classification).toBe("unset");
    expect(c.fields.Open1C).toBe("ok");
    expect("NotARealField" in c.fields).toBe(false);
    expect(c.responses["1NT"]).toEqual({ "3C": "valid" }); // 1D hole dropped
    expect("NotAnOpening" in c.responses).toBe(false);
    expect(c.flags.IsBlackwood).toBe(false); // "yes" is not a boolean
    expect(c.flags.IsGerber).toBe(true);
  });
  it("drops a legacy 'General' approach cell (removed from the §8 grid)", () => {
    // Old autosaves may carry responses[opening].General; sanitizeResponses keeps
    // only cells still present in GRID_CELLS, so the stray key is cleaned on load.
    const c = migrate({ responses: { "1C": { General: "old approach", "1D": "keep" } } });
    expect(c.responses["1C"]).toEqual({ "1D": "keep" });
  });
});
