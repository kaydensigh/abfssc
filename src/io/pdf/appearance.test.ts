import { describe, it, expect } from "vitest";
import { renderCoded } from "../../render/index.ts";
import { buildAppearance, type FontShop, type FontStyle } from "./appearance.ts";

// A deterministic monospace shop so layout assertions don't depend on real
// font metrics: every glyph is 0.5em wide; the font name reflects the style.
const fakeShop: FontShop = {
  encode(text: string, style: FontStyle) {
    if (style.suit) return { fontName: "Cards", literal: style.suit, width: style.sizePt * 0.5 };
    const fontName = style.bold && style.italic ? "HeBO" : style.bold ? "Fn1" : style.italic ? "HeOb" : "F1";
    const literal = text.replace(/[()\\]/g, (c) => "\\" + c);
    return { fontName, literal, width: text.length * style.sizePt * 0.5 };
  },
};

const box = { width: 200, height: 14 };
const opts = (multiline = false) => ({ baseSizePt: 10, multiline, bgColor: null, font: fakeShop });

describe("buildAppearance", () => {
  it("wraps each run in /Tx BMC … EMC with a clip", () => {
    const out = buildAppearance(renderCoded("hello"), box, opts());
    expect(out).toContain("/Tx BMC");
    expect(out).toContain("W\nn");
    expect(out).toContain("EMC");
    expect(out).toContain("(hello) Tj");
  });

  it("emits per-span colour and uses /Cards for suit glyphs", () => {
    const out = buildAppearance(renderCoded("!1A!S"), box, opts());
    expect(out).toContain("1 0 0 rg"); // !1 → red text
    expect(out).toContain("(A) Tj");
    expect(out).toContain("/Cards"); // !S → suit font
    expect(out).toContain("(S) Tj"); // suit letter, not the ♠ glyph
  });

  it("renders bold and italic with the right font resource", () => {
    expect(buildAppearance(renderCoded("!bBold!b"), box, opts())).toContain("/Fn1");
    expect(buildAppearance(renderCoded("!iIt!i"), box, opts())).toContain("/HeOb");
  });

  it("raises superscripts with a text rise and resets it", () => {
    const out = buildAppearance(renderCoded("X!^2"), box, opts());
    expect(out).toMatch(/[0-9.]+ Ts/); // a non-zero rise
    expect(out).toContain("0 Ts"); // reset afterwards
  });

  it("draws an underline as a thin filled rule", () => {
    const out = buildAppearance(renderCoded("!uU!u"), box, opts());
    expect(out).toMatch(/re f/);
  });

  it("offsets a centred line from the left padding", () => {
    const out = buildAppearance(renderCoded("!|hi"), box, opts());
    // centred: the text-matrix x should be well past the 2pt left pad
    const m = out.match(/1 0 0 1 ([0-9.]+) [0-9.]+ Tm/);
    expect(m).toBeTruthy();
    expect(Number(m![1])).toBeGreaterThan(2);
  });

  it("paints a background when given a colour", () => {
    const out = buildAppearance(renderCoded("x"), box, { ...opts(), bgColor: [0.95, 0.95, 0.95] });
    expect(out).toContain("0.95 0.95 0.95 rg");
    expect(out).toContain("re\nf");
  });

  it("wraps long multiline text onto several baselines", () => {
    const long = "one two three four five six seven eight nine ten eleven twelve";
    const out = buildAppearance(renderCoded(long, { multiline: true }), box, opts(true));
    const ys = [...out.matchAll(/1 0 0 1 [0-9.]+ (-?[0-9.]+) Tm/g)].map((m) => m[1]);
    const distinct = new Set(ys);
    expect(distinct.size).toBeGreaterThan(1); // wrapped to multiple lines
  });

  it("is total — never throws on malformed input", () => {
    expect(() => buildAppearance(renderCoded("!q!!!", { multiline: true }), box, opts(true))).not.toThrow();
  });
});
