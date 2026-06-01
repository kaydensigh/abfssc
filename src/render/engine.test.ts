import { describe, expect, it } from "vitest";
import { renderCoded, renderPlain } from "./engine.ts";
import type { Span } from "./types.ts";

// A default baseline span; override only the fields a case exercises.
const base = {
  color: "#000000",
  bold: false,
  italic: false,
  underline: false,
  vshift: 0 as const,
  sizePt: 10,
};
const sp = (text: string, o: Partial<Span> = {}): Span => ({ text, ...base, ...o });

describe("plain text", () => {
  it("passes plain text through as one span", () => {
    expect(renderCoded("12-14 Balanced")).toEqual([sp("12-14 Balanced")]);
  });
  it("returns no spans for empty input", () => {
    expect(renderCoded("")).toEqual([]);
  });
});

describe("suits", () => {
  it("renders the four suits with their natural colours", () => {
    expect(renderCoded("!S")).toEqual([sp("♠", { suit: "S", color: "#000000" })]);
    expect(renderCoded("!H")).toEqual([sp("♥", { suit: "H", color: "#ff0000" })]);
    expect(renderCoded("!D")).toEqual([sp("♦", { suit: "D", color: "#ff0000" })]);
    expect(renderCoded("!C")).toEqual([sp("♣", { suit: "C", color: "#000000" })]);
  });
  it("treats lowercase suit codes the same as uppercase", () => {
    expect(renderCoded("!h")).toEqual([sp("♥", { suit: "H", color: "#ff0000" })]);
    expect(renderCoded("!c")).toEqual([sp("♣", { suit: "C", color: "#000000" })]);
  });
  it("splits text around a suit", () => {
    expect(renderCoded("3+!C opening")).toEqual([
      sp("3+"),
      sp("♣", { suit: "C", color: "#000000" }),
      sp(" opening"),
    ]);
  });
  it("caps suit size at 11pt even when text size is larger", () => {
    const spans = renderCoded("!+!+!+!+!H"); // 10 → 14
    expect(spans[0].sizePt).toBe(11);
  });
});

describe("palette colours", () => {
  it("maps !0..!9 to the exact gClrA hex values", () => {
    const expected = [
      "#000000",
      "#ff0000",
      "#0000ff",
      "#ff00ff",
      "#00b34d",
      "#a121f0",
      "#007aa6",
      "#cc6600",
      "#663333",
      "#ffb333",
    ];
    expected.forEach((hex, i) => {
      expect(renderCoded(`!${i}x`)).toEqual([sp("x", { color: hex })]);
    });
  });
  it("maps the secondary bank !; ![ !] !: to greys/white", () => {
    expect(renderCoded("!;x")).toEqual([sp("x", { color: "#ffffff" })]);
    expect(renderCoded("![x")).toEqual([sp("x", { color: "#999999" })]);
    expect(renderCoded("!]x")).toEqual([sp("x", { color: "#bfbfbf" })]);
    expect(renderCoded("!:x")).toEqual([sp("x", { color: "#dbdbdb" })]);
  });
  it("colours text after the code and resets between spans", () => {
    expect(renderCoded("a!2b")).toEqual([sp("a"), sp("b", { color: "#0000ff" })]);
  });
});

describe("b / i / u", () => {
  it("toggles bold with !b and !B", () => {
    expect(renderCoded("!bX")).toEqual([sp("X", { bold: true })]);
    expect(renderCoded("!bX!bY")).toEqual([sp("X", { bold: true }), sp("Y")]);
    expect(renderCoded("!BX")).toEqual([sp("X", { bold: true })]);
  });
  it("toggles italic with !i and underline with !u", () => {
    expect(renderCoded("!iX")).toEqual([sp("X", { italic: true })]);
    expect(renderCoded("!uX")).toEqual([sp("X", { underline: true })]);
  });
});

describe("super / subscript", () => {
  it("superscripts with !^ and toggles back", () => {
    expect(renderCoded("1!^st")).toEqual([sp("1"), sp("st", { vshift: 1 })]);
    expect(renderCoded("x!^a!^b")).toEqual([sp("x"), sp("a", { vshift: 1 }), sp("b")]);
  });
  it("subscripts with !v", () => {
    expect(renderCoded("H!v2")).toEqual([sp("H"), sp("2", { vshift: -1 })]);
  });
});

describe("size", () => {
  it("increments with !+, resets with !=, decrements with !- (floor 6)", () => {
    expect(renderCoded("!+x")[0].sizePt).toBe(11);
    expect(renderCoded("!-x")[0].sizePt).toBe(9);
    expect(renderCoded("!+!+!=x")[0].sizePt).toBe(10);
    expect(renderCoded("!-!-!-!-!-x")[0].sizePt).toBe(6); // 10→9→8→7→6→6
  });
});

describe("tabs and breaks", () => {
  it("inserts whitespace for !t and !T", () => {
    expect(renderPlain("a!tb")).toBe("a   b");
    expect(renderPlain("a!Tb")).toBe("a    b");
  });
  it("breaks lines with !r only in multiline fields", () => {
    expect(renderPlain("a!rb")).toBe("a b");
    expect(renderPlain("a!rb", { multiline: true })).toBe("a\n b");
  });
});

describe("unicode escapes", () => {
  it("renders !U+XXXX; as a literal character", () => {
    expect(renderCoded("!U+2660;")).toEqual([sp("♠")]);
    expect(renderPlain("!U+2013;")).toBe("–");
  });
  it("renders consecutive 4-hex groups", () => {
    expect(renderPlain("!U+26602661;")).toBe("♠♡");
  });
  it("degrades a malformed escape to a literal", () => {
    expect(renderPlain("!U+ZZ;")).toBe("!U+ZZ;");
  });
});

describe("alignment", () => {
  it("applies !< !| !> to the whole value", () => {
    expect(renderCoded("!|mid")).toEqual([sp("mid", { align: "center" })]);
    expect(renderCoded("!>end")).toEqual([sp("end", { align: "right" })]);
    expect(renderCoded("!<start")).toEqual([sp("start", { align: "left" })]);
  });
});

describe("save / restore / reset", () => {
  it("!/ saves and !? restores colour + format", () => {
    expect(renderCoded("!1!/red!2blue!?back")).toEqual([
      sp("red", { color: "#ff0000" }),
      sp("blue", { color: "#0000ff" }),
      sp("back", { color: "#ff0000" }),
    ]);
  });
  it("!n resets format but keeps colour", () => {
    expect(renderCoded("!2!b!ix!ny")).toEqual([
      sp("x", { color: "#0000ff", bold: true, italic: true }),
      sp("y", { color: "#0000ff" }),
    ]);
  });
  it("!N resets format and restores the saved colour", () => {
    expect(renderCoded("!1!/!2!bx!Ny")).toEqual([
      sp("x", { color: "#0000ff", bold: true }),
      sp("y", { color: "#ff0000" }),
    ]);
  });
});

describe("literals and dropped codes", () => {
  it("!! is a literal bang", () => {
    expect(renderPlain("a!!b")).toBe("a!b");
  });
  it("drops diagnostic injectors entirely", () => {
    expect(renderPlain("a!$b")).toBe("ab");
    expect(renderCoded("!~")).toEqual([]);
    expect(renderCoded("!F!f!%")).toEqual([]);
  });
  it("emits an unknown code as its literal text (totality)", () => {
    expect(renderPlain("!z")).toBe("!z");
    expect(renderPlain("!a")).toBe("!a"); // symbol codes are out of scope on web
  });
  it("never throws on malformed input", () => {
    for (const junk of ["!", "!!!", "!U+", "!{x!}", "!#", "!^!^!^", "`"]) {
      expect(() => renderCoded(junk)).not.toThrow();
    }
  });
});

describe("Layer B — grave shortcuts", () => {
  it("expands ordinal shortcuts via super-script !-codes", () => {
    expect(renderCoded("`1")).toEqual([sp("1"), sp("st", { vshift: 1 })]);
    expect(renderCoded("`3")).toEqual([sp("3"), sp("rd", { vshift: 1 })]);
  });
  it("expands symbol shortcuts", () => {
    expect(renderPlain("`@")).toBe("½");
    expect(renderPlain("`a")).toBe("α");
    expect(renderPlain("`_")).toBe("– ");
  });
  it("collapses a doubled backtick to a literal", () => {
    expect(renderPlain("``")).toBe("`");
  });
});

describe("Layer A — code-list expansion", () => {
  const list = { "1": "12-20 HCP !T5+!H", x: "Natural" };
  it("expands a bare code to its phrase, then renders the phrase's !-codes", () => {
    const spans = renderCoded("1", { codeList: list });
    expect(spans.at(-1)).toEqual(sp("♥", { suit: "H", color: "#ff0000" }));
    expect(renderPlain("1", { codeList: list })).toBe("12-20 HCP     5+♥");
  });
  it("does NOT expand already-expanded text (the saved-card case)", () => {
    expect(renderCoded("12-20 HCP", { codeList: list })).toEqual([sp("12-20 HCP")]);
  });
  it("expands the 'x' default code too", () => {
    expect(renderCoded("x", { codeList: list })).toEqual([sp("Natural")]);
  });
});

describe("!# mode markers (collapsed single rich parser)", () => {
  it("strips a leading !# / !## marker", () => {
    expect(renderPlain("!#Hello")).toBe("Hello");
    expect(renderPlain("!##Hello")).toBe("Hello");
  });
  it("only honours !## as a 3-char marker on long values (source length>4 guard)", () => {
    expect(renderPlain("!##")).toBe("#"); // short → strips just "!#"
    expect(renderPlain("!##X")).toBe("#X");
  });
  it("strips a trailing fill-colour directive", () => {
    expect(renderCoded("!1!B!|See section 9!#y")).toEqual([
      sp("See section 9", { color: "#ff0000", bold: true, align: "center" }),
    ]);
  });
});
