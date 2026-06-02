// @vitest-environment node
/// <reference types="node" />
// pdf-lib's instanceof checks need the node realm's typed arrays; jsdom swaps
// the global Uint8Array, which makes PDFDocument.load reject a node Buffer. The
// node reference is scoped to this test file (not the app's type roots).
import { describe, it, expect, beforeAll } from "vitest";
import { readFileSync } from "node:fs";
import { PDFDocument, PDFName, PDFDict, PDFString, PDFHexString, decodePDFRawStream } from "pdf-lib";
import { createEmptyCard, type Card } from "../../model/index.ts";
import { buildCardPdf } from "./export.ts";
import { STAMP_INFO_KEY } from "./fieldmap.ts";

// vitest runs from the project root; the shipped asset lives under src/assets.
const TEMPLATE = readFileSync("src/assets/ABF_Card_FORM.pdf");

/** Decode a field's /V to text (handles literal + hex strings). */
function readV(doc: PDFDocument, name: string): string | undefined {
  const f = doc.getForm().getFields().find((x) => x.getName() === name);
  if (!f) return undefined;
  const v = f.acroField.dict.lookup(PDFName.of("V"));
  if (v instanceof PDFString || v instanceof PDFHexString) return v.decodeText();
  return v ? v.toString() : undefined;
}

/** The appearance state name (/AS) on a field's first widget, e.g. "/" or "/Off". */
function readAS(doc: PDFDocument, name: string): string | undefined {
  const f = doc.getForm().getFields().find((x) => x.getName() === name);
  const as = f?.acroField.getWidgets()[0]?.dict.lookup(PDFName.of("AS"));
  return as ? as.toString() : undefined;
}

/** Decode a field's N appearance stream to its operator text. */
function readAp(doc: PDFDocument, name: string): string {
  const f = doc.getForm().getFields().find((x) => x.getName() === name);
  if (!f) return "";
  const w = f.acroField.getWidgets()[0];
  const ap = w?.dict.lookup(PDFName.of("AP"));
  if (!(ap instanceof PDFDict)) return "";
  const n = ap.lookup(PDFName.of("N"));
  if (!n || !("dict" in (n as object))) return "";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new TextDecoder("latin1").decode(decodePDFRawStream(n as any).decode());
}

function populated(): Card {
  const card = createEmptyCard({ id: "11111111-1111-4111-8111-111111111111", now: "2026-06-02T00:00:00.000Z" });
  card.fields.BasicSystem = "2 over 1";
  card.fields.Open1C = "!1better minor!S"; // red text + a spade glyph
  card.fields.PlayerName_A = "Smith";
  card.fields.PlayerName_B = "Jones";
  card.fields.JumpRaiseMinor = "limit"; // parent of a merge child…
  card.fields.JumpRaiseMinorOther = "splinter"; // …no D_ twin; merges into D_JumpRaiseMinor
  card.flags.IsBlackwood = true;
  card.flags.IsBrownSticker = true;
  card.classification = "green";
  card.responses["1C"] = { "1H": "forcing 1 round" };
  return card;
}

describe("buildCardPdf (export half of the round-trip)", () => {
  let bytes: Uint8Array;
  let warnings: string[];
  let out: PDFDocument;
  const card = populated();

  beforeAll(async () => {
    const r = await buildCardPdf(card, TEMPLATE.slice(0), { now: "2026-06-02T00:00:00.000Z" });
    bytes = r.bytes;
    warnings = r.warnings;
    out = await PDFDocument.load(bytes, { ignoreEncryption: true, updateMetadata: false });
  });

  it("produces a valid, non-trivial PDF that reloads", () => {
    expect(bytes.length).toBeGreaterThan(400_000);
    expect(out.getForm().getFields().length).toBeGreaterThan(680);
  });

  it("writes editable /V for round-trip (the value, not codes mangled)", () => {
    expect(readV(out, "BasicSystem")).toBe("2 over 1");
    expect(readV(out, "PlayerName_A")).toBe("Smith");
    expect(readV(out, "Open1C")).toBe("!1better minor!S"); // raw !-code preserved
  });

  it("authors the D_ display twin's rich appearance", () => {
    const ap = readAp(out, "D_BasicSystem");
    expect(ap).toContain("(2 over 1)");
    expect(ap).toContain("/F1"); // body font
  });

  it("renders suit glyphs in the D_ twin via the embedded Cards font", () => {
    const ap = readAp(out, "D_Open1C");
    expect(ap).toContain("/Cards");
    expect(ap).toContain("1 0 0 rg"); // !1 → red "better minor"
    expect(ap).toContain("(S) Tj"); // ♠ is a solid glyph — drawn from the font
  });

  it("prints ♥/♦ as a solid filled silhouette, not the font's hollow outline", async () => {
    // The Cards font draws ♥/♦ as outline glyphs; we fill the solid silhouette
    // ourselves so they don't print as a red ring with a white centre.
    const c = createEmptyCard({ id: "suits", now: "2026-06-02T00:00:00.000Z" });
    c.fields.BasicSystem = "!H!D!S!C"; // one of each suit
    const r = await buildCardPdf(c, TEMPLATE.slice(0), { now: "2026-06-02T00:00:00.000Z" });
    const d = await PDFDocument.load(r.bytes, { ignoreEncryption: true, updateMetadata: false });
    const ap = readAp(d, "D_BasicSystem");
    // ♥ and ♦ are filled silhouettes (own q…cm…f Q), NOT drawn as Cards glyphs.
    expect(ap).not.toContain("(H) Tj");
    expect(ap).not.toContain("(D) Tj");
    expect(ap).toContain("617 522 m"); // start of the solid ♥ silhouette
    expect(ap).toContain("540 333 m"); // start of the solid ♦ silhouette
    expect(ap).toMatch(/q 1 0 0 rg [0-9.]+ 0 0 [0-9.]+ [0-9.]+ [0-9.]+ cm .*f Q/);
    // ♠ and ♣ are already solid — still drawn straight from the font.
    expect(ap).toContain("(S) Tj");
    expect(ap).toContain("(C) Tj");
  });

  it("merges an Other field with no twin into the parent's appearance", () => {
    const ap = readAp(out, "D_JumpRaiseMinor");
    expect(ap).toContain("(limit)");
    expect(ap).toContain("(splinter)");
    expect(readV(out, "JumpRaiseMinorOther")).toBe("splinter"); // child /V still round-trips
  });

  it("sets a checkbox to Yes and paints its B_ print twin", () => {
    expect(readV(out, "IsBlackwood")).toBe("Yes");
    expect(readAp(out, "B_IsBlackwood")).toContain("(X)"); // bigX default tick
    expect(readV(out, "IsGerber")).toBe("Off"); // untouched flag cleared
  });

  it("writes the classification literal and turns on the cover boxes", () => {
    expect(readV(out, "Classification")).toBe("Green");
    // the printed mirror is the Z_MyClass/Z_Sticker button (on-state name = "/")
    expect(readAS(out, "Z_MyClass.undefined")).toBe("/");
    expect(readAS(out, "Z_Sticker.undefined")).toBe("/"); // brown sticker set
  });

  it("fills the §8 grid cell and authors its D_ twin", () => {
    expect(readV(out, "Resp1C_1H")).toBe("forcing 1 round");
    expect(readAp(out, "D_Resp1C_1H")).toContain("(forcing 1 round)");
    expect(warnings).toEqual([]); // a fully-mapped card emits no warnings
  });

  it("embeds the app-state stamp in the Info dict", () => {
    const infoRef = out.context.trailerInfo.Info;
    const info = out.context.lookup(infoRef, PDFDict);
    const raw = info.lookup(PDFName.of(STAMP_INFO_KEY));
    expect(raw).toBeInstanceOf(PDFHexString);
    const stamp = JSON.parse((raw as PDFHexString).decodeText());
    expect(stamp.id).toBe(card.id);
    expect(stamp.schemaVersion).toBe(card.schemaVersion);
  });

  it("keeps NeedAppearances false so viewers honour our appearances", () => {
    const acro = out.catalog.lookup(PDFName.of("AcroForm"), PDFDict);
    const na = acro.lookup(PDFName.of("NeedAppearances"));
    expect(na?.toString() ?? "false").toBe("false");
  });

  it("survives values with stray parens/backslashes (PDF stays openable)", async () => {
    // The literal-string corruption bug: a lone ')' or '\' once made the file
    // unopenable. /V must be hex-encoded so these round-trip losslessly.
    const c = createEmptyCard({ id: "paren", now: "2026-06-02T00:00:00.000Z" });
    c.fields.BasicSystem = "2S) transfer (4+) a\\b :)";
    const r = await buildCardPdf(c, TEMPLATE.slice(0));
    // reloads without throwing (this is what regressed before the fix)…
    const d = await PDFDocument.load(r.bytes, { ignoreEncryption: true, updateMetadata: false });
    expect(readV(d, "BasicSystem")).toBe("2S) transfer (4+) a\\b :)");
  });

  it("round-trips an empty card without throwing", async () => {
    const r = await buildCardPdf(createEmptyCard({ id: "x", now: "2026-06-02T00:00:00.000Z" }), TEMPLATE.slice(0));
    expect(r.bytes.length).toBeGreaterThan(400_000);
  });

  it("leaves the cover boxes off for an unset, no-sticker card", async () => {
    const blank = createEmptyCard({ id: "blank", now: "2026-06-02T00:00:00.000Z" });
    const r = await buildCardPdf(blank, TEMPLATE.slice(0));
    const d = await PDFDocument.load(r.bytes, { ignoreEncryption: true, updateMetadata: false });
    expect(readAS(d, "Z_MyClass.undefined")).toBe("/Off");
    expect(readAS(d, "Z_Sticker.undefined")).toBe("/Off");
  });

  it("honours swap-to-print: B prints in slot A while editable /V stays canonical", async () => {
    const c = createEmptyCard({ id: "swap", now: "2026-06-02T00:00:00.000Z" });
    c.fields.PlayerName_A = "Alice";
    c.fields.PlayerName_B = "Bob";
    c.primaryPlayer = 1;
    const r = await buildCardPdf(c, TEMPLATE.slice(0), { now: "2026-06-02T00:00:00.000Z" });
    const d = await PDFDocument.load(r.bytes, { ignoreEncryption: true, updateMetadata: false });
    // editable values unchanged (canonical slots → re-import is unaffected)
    expect(readV(d, "PlayerName_A")).toBe("Alice");
    expect(readV(d, "PlayerName_B")).toBe("Bob");
    // but the printed twins are swapped: slot A shows Bob, slot B shows Alice
    expect(readAp(d, "D_PlayerName_A")).toContain("(Bob)");
    expect(readAp(d, "D_PlayerName_B")).toContain("(Alice)");
    // and the pointer is carried in the stamp for lossless round-trip
    const info = d.context.lookup(d.context.trailerInfo.Info, PDFDict);
    const stamp = JSON.parse((info.lookup(PDFName.of(STAMP_INFO_KEY)) as PDFHexString).decodeText());
    expect(stamp.primaryPlayer).toBe(1);
  });
});
