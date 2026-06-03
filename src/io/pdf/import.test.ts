// @vitest-environment node
/// <reference types="node" />
// pdf-lib's instanceof checks need the node realm's typed arrays (see the note
// in export.test.ts); the node reference is scoped to this test file.
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { PDFDocument } from "pdf-lib";
import { createEmptyCard } from "../../model/index.ts";
import { buildCardPdf } from "./export.ts";
import { importCardFromPdf } from "./import.ts";
import { populated, fullyPopulated, NOW } from "../../test/cards.ts";

const TEMPLATE = readFileSync("src/assets/ABF_Card_FORM.pdf");

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
