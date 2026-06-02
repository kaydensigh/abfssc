// @vitest-environment node
/// <reference types="node" />
// pdf-lib's instanceof checks need the node realm's typed arrays (see the note
// in export.test.ts); the node reference is scoped to this test file.
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { PDFDocument } from "pdf-lib";
import {
  createEmptyCard,
  allTextFieldKeys,
  FLAG_KEYS,
  OPENINGS,
  GRID_CELLS,
  type Card,
  type ResponseBid,
} from "../../model/index.ts";
import { buildCardPdf } from "./export.ts";
import { importCardFromPdf } from "./import.ts";

const TEMPLATE = readFileSync("src/assets/ABF_Card_FORM.pdf");
const NOW = "2026-06-02T00:00:00.000Z";

/** A representative, fully-populated card exercising every channel. */
function populated(): Card {
  const card = createEmptyCard({ id: "11111111-1111-4111-8111-111111111111", now: NOW });
  card.fields.BasicSystem = "2 over 1";
  card.fields.Open1C = "!1better minor!S"; // raw !-codes + a suit glyph
  card.fields.PlayerName_A = "Smith";
  card.fields.PlayerName_B = "Jones";
  card.fields.PlayerNo_A = "12345";
  card.fields.JumpRaiseMinor = "limit"; // parent of a merge child…
  card.fields.JumpRaiseMinorOther = "splinter"; // …distinct field, must round-trip on its own
  card.fields.Doubles_1 = "2S) transfer (4+) a\\b :)"; // stray parens / backslash
  card.flags.IsBlackwood = true;
  card.flags.IsBrownSticker = true;
  card.classification = "green";
  card.responses["1C"] = { "1H": "forcing 1 round" };
  card.responses["1NT"] = { "3C": "puppet" };
  card.settings.checkboxStyle = "tick";
  card.settings.suitColours = false;
  return card;
}

/**
 * Every field, flag, and grid cell carrying a DISTINCT value — so the round-trip
 * proves each one has a real editable home and maps to/from the right name. (The
 * `populated()` card above only fills a handful, so an empty field's "" → "" hides
 * a silently-dropped or mis-named field; this card cannot.)
 */
function fullyPopulated(): Card {
  const card = createEmptyCard({ id: "22222222-2222-4222-8222-222222222222", now: NOW });
  for (const key of allTextFieldKeys()) card.fields[key] = `v ${key}`;
  for (const flag of FLAG_KEYS) card.flags[flag] = true;
  card.classification = "yellow";
  for (const opening of OPENINGS) {
    const row: Partial<Record<ResponseBid, string>> = {};
    for (const bid of GRID_CELLS[opening]) row[bid] = `r ${opening} ${bid}`;
    card.responses[opening] = row;
  }
  card.settings.checkboxStyle = "cross";
  card.settings.suitColours = false;
  return card;
}

describe("importCardFromPdf — the M1+M2 round-trip contract", () => {
  it("re-imports our own export losslessly (export → import deep-equals)", async () => {
    const card = populated();
    const { bytes } = await buildCardPdf(card, TEMPLATE.slice(0), { now: NOW });
    const { card: back, stampPresent } = await importCardFromPdf(bytes);
    expect(stampPresent).toBe(true);
    expect(back).toEqual(card); // THE gate: nothing lost across the round-trip
  });

  it("round-trips EVERY field, flag, and grid cell with a distinct value", async () => {
    const card = fullyPopulated();
    const { bytes, warnings } = await buildCardPdf(card, TEMPLATE.slice(0), { now: NOW });
    const { card: back } = await importCardFromPdf(bytes);
    expect(back).toEqual(card); // no field silently dropped, mis-named, or swapped
    expect(warnings).toEqual([]); // …and every field has a real editable + D_ home
  });

  it("recovers identity/version/settings from the app-state stamp", async () => {
    const card = populated();
    const { bytes } = await buildCardPdf(card, TEMPLATE.slice(0), { now: NOW });
    const { card: back } = await importCardFromPdf(bytes);
    expect(back.id).toBe(card.id);
    expect(back.schemaVersion).toBe(card.schemaVersion);
    expect(back.revision).toEqual(card.revision);
    expect(back.settings).toEqual(card.settings);
  });

  it("keeps editable /V canonical under swap-to-print (slots not swapped on import)", async () => {
    const card = createEmptyCard({ id: "swap", now: NOW });
    card.fields.PlayerName_A = "Alice";
    card.fields.PlayerName_B = "Bob";
    card.primaryPlayer = 1;
    const { bytes } = await buildCardPdf(card, TEMPLATE.slice(0), { now: NOW });
    const { card: back } = await importCardFromPdf(bytes);
    expect(back.fields.PlayerName_A).toBe("Alice");
    expect(back.fields.PlayerName_B).toBe("Bob");
    expect(back.primaryPlayer).toBe(1);
  });

  it("imports the blank template as an empty card (sentinels → empty, no throw)", async () => {
    const { card, stampPresent } = await importCardFromPdf(TEMPLATE.slice(0));
    expect(stampPresent).toBe(false); // blank carries no stamp
    expect(card.fields.BasicSystem).toBe("");
    expect(card.fields.Open1C).toBe("");
    expect(card.classification).toBe("unset");
    expect(card.responses).toEqual({});
    expect(Object.values(card.flags).every((v) => v === false)).toBe(true);
  });

  it("rejects a flattened / fieldless PDF with a typed error", async () => {
    const doc = await PDFDocument.create();
    doc.addPage();
    const flat = await doc.save();
    await expect(importCardFromPdf(flat)).rejects.toMatchObject({ code: "flattened" });
  });

  it("rejects a form PDF that isn't an ABF card", async () => {
    const doc = await PDFDocument.create();
    const page = doc.addPage();
    const tf = doc.getForm().createTextField("foo");
    tf.addToPage(page, { x: 10, y: 10, width: 80, height: 16 });
    const other = await doc.save();
    await expect(importCardFromPdf(other)).rejects.toMatchObject({ code: "not-abf" });
  });
});
