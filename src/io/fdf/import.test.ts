// The real-world FDF round-trip. abf/roundtrip-export_adobe.fdf is Adobe Reader's
// FDF export of roundtrip-export_ours.pdf, which is in turn our own PDF export of
// the canonical fullyPopulated() fixture. So importing that FDF must reproduce the
// fixture's CONTENT — proving we read a genuine Acrobat-produced FDF (flat field
// names, tab-separated /T·/V, default-valued fields omitted), not just our own.
//
// What an FDF cannot carry is our app-state stamp: id, savedAt, settings, and the
// primaryPlayer pointer all live in JSON we embed in the PDF, never in AcroForm
// /V values. So those legitimately differ here — the card imports as fresh
// (stampPresent === false) — and the comparison is scoped to the carried content.

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { importCardFromFdf } from "./import.ts";
import { fullyPopulated } from "../../test/cards.ts";

// vitest runs from the project root; the Adobe-exported sample lives under abf/.
const ADOBE_FDF = readFileSync("abf/roundtrip-export_adobe.fdf");

describe("importCardFromFdf — the Adobe FDF round-trip", () => {
  it("reproduces the canonical fixture's content from Adobe's FDF export", () => {
    const expected = fullyPopulated();
    const { card, warnings, stampPresent } = importCardFromFdf(new Uint8Array(ADOBE_FDF));

    // An FDF carries form values only — no app-state stamp — so it imports fresh,
    // and Adobe's meta fields (aaNote_*, I_LastSave) are dropped without complaint.
    expect(stampPresent).toBe(false);
    expect(warnings).toEqual([]);

    // The content an FDF DOES carry must survive Acrobat's export losslessly:
    // every text field, every flag, the classification, and every grid cell.
    expect(card.fields).toEqual(expected.fields);
    expect(card.flags).toEqual(expected.flags);
    expect(card.classification).toBe(expected.classification);
    expect(card.responses).toEqual(expected.responses);
  });

  it("does not recover stamp-only state an FDF cannot carry (settings reset to default)", () => {
    const { card } = importCardFromFdf(new Uint8Array(ADOBE_FDF));
    // fullyPopulated() set checkboxStyle:"cross"/suitColours:false in the stamp;
    // the FDF can't carry them, so they fall back to defaults rather than silently
    // claiming to have round-tripped. (Documented divergence, asserted on purpose.)
    expect(card.settings.checkboxStyle).toBe("bigX");
    expect(card.settings.suitColours).toBe(true);
  });
});
