// Shared card fixtures for the import/export round-trip contract. Keeping them in
// one place lets the PDF round-trip test (io/pdf/import.test.ts) and the Adobe-FDF
// round-trip test (io/fdf/import.test.ts) assert against the SAME canonical data:
// abf/roundtrip-export_adobe.fdf is Adobe's FDF export of our PDF export of
// fullyPopulated(), so importing that FDF must reproduce this fixture's content.

import {
  createEmptyCard,
  allTextFieldKeys,
  FLAG_KEYS,
  OPENINGS,
  GRID_CELLS,
  type Card,
  type ResponseBid,
} from "../model/index.ts";

/** Fixed timestamp so an exported `now` matches the fixture's savedAt (the PDF
 *  round-trip carries savedAt in its app-state stamp and must compare equal). */
export const NOW = "2026-06-02T00:00:00.000Z";

/** A representative, fully-populated card exercising every channel. */
export function populated(): Card {
  const card = createEmptyCard({ id: "11111111-1111-4111-8111-111111111111", now: NOW });
  card.fields.BasicSystem = "2 over 1";
  card.fields.Open1C = "!1better minor!S"; // raw !-codes + a suit glyph
  card.fields.PlayerName_A = "Smith";
  card.fields.PlayerName_B = "Jones";
  card.fields.PlayerNo_A = "12345";
  card.fields.JumpRaiseMinor = "limit"; // a normal field with a D_ twin
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
export function fullyPopulated(): Card {
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
