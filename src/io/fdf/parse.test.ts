import { describe, it, expect } from "vitest";
import { parseFdf } from "./parse.ts";
import { importCardFromFdf } from "./import.ts";
import { ImportError } from "../errors.ts";

const FDF = (fields: string): string =>
  `%FDF-1.2\n1 0 obj\n<<\n/FDF\n<<\n/Fields [\n${fields}\n]\n>>\n>>\nendobj\ntrailer\n<<\n/Root 1 0 R\n>>\n%%EOF\n`;

describe("parseFdf (Kids-tree walker)", () => {
  it("reads flat /T(…)/V(…) pairs", () => {
    const map = parseFdf(FDF("<< /T (BasicSystem) /V (2 over 1) >>\n<< /T (Open1C) /V (better minor) >>"));
    expect(map.get("BasicSystem")).toBe("2 over 1");
    expect(map.get("Open1C")).toBe("better minor");
  });

  it("walks /Kids into dotted fully-qualified names (the §8 grid)", () => {
    const map = parseFdf(
      FDF("<< /T (Resp1C) /Kids [ << /T (_1D) /V (forcing) >> << /T (Other) /V (catch-all) >> ] >>"),
    );
    expect(map.get("Resp1C._1D")).toBe("forcing");
    expect(map.get("Resp1C.Other")).toBe("catch-all");
    expect(map.has("Resp1C")).toBe(false); // the parent carries no /V
  });

  it("handles /V-before-/T ordering", () => {
    const map = parseFdf(FDF("<< /V (val) /T (Open1NT) >>"));
    expect(map.get("Open1NT")).toBe("val");
  });

  it("decodes hex-string names and values", () => {
    // <426173696353797374656d> = "BasicSystem"
    const map = parseFdf(FDF("<< /T <426173696353797374656d> /V <322b32> >>"));
    expect(map.get("BasicSystem")).toBe("2+2"); // <322b32> = "2+2"
  });

  it("decodes literal-string escapes, balanced parens, and octal", () => {
    const map = parseFdf(FDF("<< /T (Open1S) /V (a\\(b\\)c \\\\d \\050) >>"));
    expect(map.get("Open1S")).toBe("a(b)c \\d (");
  });

  it("decodes a UTF-16BE value", () => {
    // FEFF 0041 0042 = "AB"
    const map = parseFdf(FDF("<< /T (Open2C) /V <FEFF00410042> >>"));
    expect(map.get("Open2C")).toBe("AB");
  });

  it("tolerates indirect-ref tails inside dicts", () => {
    const map = parseFdf(FDF("<< /T (Open2D) /V (ok) /Parent 3 0 R >>"));
    expect(map.get("Open2D")).toBe("ok");
  });

  it("returns an empty map when there is no /Fields array", () => {
    expect(parseFdf("%FDF-1.2\nnothing here\n%%EOF").size).toBe(0);
  });
});

describe("importCardFromFdf", () => {
  it("normalises dotted grid names through the rename map into the model", () => {
    const { card, stampPresent } = importCardFromFdf(
      FDF(
        "<< /T (BasicSystem) /V (2 over 1) >>\n" +
          "<< /T (Classification) /V (Blue) >>\n" +
          "<< /T (IsBlackwood) /V (Yes) >>\n" +
          "<< /T (Resp1C) /Kids [ << /T (_1H) /V (forcing 1 round) >> ] >>",
      ),
    );
    expect(card.fields.BasicSystem).toBe("2 over 1");
    expect(card.classification).toBe("blue");
    expect(card.flags.IsBlackwood).toBe(true);
    expect(card.responses["1C"]).toEqual({ "1H": "forcing 1 round" });
    expect(stampPresent).toBe(false); // FDF carries no app-state stamp
  });

  it("rejects an FDF with no recognisable fields", () => {
    expect(() => importCardFromFdf("%FDF-1.2\n%%EOF")).toThrow(ImportError);
  });

  it("rejects a structurally valid FDF that is not an ABF card", () => {
    // Real /Fields with real values, but no name maps onto the model — it must be
    // refused (not-abf) rather than silently producing a blank card.
    const foreign = FDF("<< /T (FullName) /V (Jane Doe) >>\n<< /T (TaxYear) /V (2026) >>");
    let code: string | undefined;
    try {
      importCardFromFdf(foreign);
    } catch (e) {
      code = e instanceof ImportError ? e.code : "(not an ImportError)";
    }
    expect(code).toBe("not-abf");
  });

  it("accepts an FDF carrying even a single recognisable model field", () => {
    // The signature gate must not reject a sparse-but-genuine card.
    const sparse = FDF("<< /T (Open1C) /V (better minor) >>");
    expect(importCardFromFdf(sparse).card.fields.Open1C).toBe("better minor");
  });
});

describe("parseFdf hardening (untrusted input)", () => {
  it("does not hang on a stray closing delimiter inside the /Fields array", () => {
    // Each of these would have spun forever before the progress guard.
    expect(parseFdf("%FDF\n/Fields [ ) ]").size).toBe(0);
    expect(parseFdf("%FDF\n/Fields [ > ]").size).toBe(0);
    expect(parseFdf("%FDF\n/Fields [ } ]").size).toBe(0);
    // …and still reads good fields sitting next to the junk.
    expect(parseFdf("%FDF\n/Fields [ ) << /T (BasicSystem) /V (x) >> ]").get("BasicSystem")).toBe("x");
  });

  it("throws a typed ImportError on pathologically deep nesting (no stack overflow)", () => {
    const deep = "%FDF\n/Fields " + "[".repeat(5000) + "]".repeat(5000);
    expect(() => importCardFromFdf(deep)).toThrow(ImportError);
  });

  it("is not hijacked by a decoy /Fields in a comment", () => {
    const fdf =
      "%FDF-1.2\n% look out for /Fields [ << /T (Fake) /V (x) >> ]\n" +
      "<< /FDF << /Fields [ << /T (BasicSystem) /V (real) >> ] >> >>\n%%EOF";
    const map = parseFdf(fdf);
    expect(map.get("BasicSystem")).toBe("real");
    expect(map.has("Fake")).toBe(false);
  });

  it("is not hijacked by a decoy /Fields inside an earlier value string", () => {
    const fdf =
      "%FDF-1.2\n<< /FDF << /Note (/Fields [ << /T (Fake) /V (x) >> ]) " +
      "/Fields [ << /T (BasicSystem) /V (real) >> ] >> >>\n%%EOF";
    expect(parseFdf(fdf).get("BasicSystem")).toBe("real");
  });

  it("resolves an indirect /Fields reference (/Fields N 0 R)", () => {
    const fdf =
      "%FDF-1.2\n1 0 obj\n<< /FDF << /Fields 5 0 R >> >>\nendobj\n" +
      "5 0 obj\n[ << /T (BasicSystem) /V (2 over 1) >> ]\nendobj\n%%EOF";
    expect(parseFdf(fdf).get("BasicSystem")).toBe("2 over 1");
  });

  it("does not throw on a truncated literal string ending in a lone backslash", () => {
    expect(() => parseFdf("%FDF\n/Fields [ << /T (X) /V (abc\\")).not.toThrow();
  });
});
