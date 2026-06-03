import { describe, it, expect } from "vitest";
import { buildRenameMap, RENAME_MAP, normalizeFieldName, currentModelNames } from "./rename.ts";

describe("gRtFL rename port (gMRFL)", () => {
  it("materialises the three templated dotted→flat rules against the live model", () => {
    expect(RENAME_MAP.get("Resp1C._1D")).toBe("Resp1C_1D"); // Resp ._>_ (grid cell)
    expect(RENAME_MAP.get("Resp2NT._4D")).toBe("Resp2NT_4D"); // a deeper opening's cell
    expect(RENAME_MAP.get("Resp1C.Other")).toBe("Resp1C_Other"); // Resp .O>_O (Other)
    expect(RENAME_MAP.get("PlayerName.A")).toBe("PlayerName_A"); // Player .>_
    expect(RENAME_MAP.get("PlayerNo.B")).toBe("PlayerNo_B");
  });

  it("keeps the one non-model legacy alias (Resp1NT2COther → Resp1NT2CStyle)", () => {
    expect(RENAME_MAP.get("Resp1NT2COther")).toBe("Resp1NT2CStyle");
  });

  it("folds the four …Other/More overflow fields into their parent (they are not model fields)", () => {
    // The overflow inputs are dropped from the model (off-page/Hidden, no D_
    // twin — src/model/sections.ts §4), so their gRtFL merge rules are active:
    // a legacy value under the old name lands on the visible parent, not lost.
    expect(RENAME_MAP.get("JumpRaiseMinorOther")).toBe("JumpRaiseMinor");
    expect(RENAME_MAP.get("JumpRaiseMajorOther")).toBe("JumpRaiseMajor");
    expect(RENAME_MAP.get("UnusualNTOther")).toBe("UnusualNoTrump");
    expect(RENAME_MAP.get("Over1NTInterfMore")).toBe("Over1NTInterf");
  });

  it("never self-maps a current canonical name", () => {
    for (const name of currentModelNames()) {
      expect(RENAME_MAP.has(name)).toBe(false);
    }
  });

  it("passes unknown / already-canonical names through unchanged", () => {
    expect(normalizeFieldName("BasicSystem")).toBe("BasicSystem");
    expect(normalizeFieldName("Resp1C_1D")).toBe("Resp1C_1D");
    expect(normalizeFieldName("totally-unknown")).toBe("totally-unknown");
  });

  it("isolated loop: prefix substitution + ignore-tokens + new-must-exist + merge-exclusion", () => {
    const map = buildRenameMap([
      "PlayerName_A",
      "Resp1C_1D",
      "Resp1C_Other",
      "JumpRaiseMinor",
      "JumpRaiseMinorOther", // old IS a current field → excluded
      "Resp1NT2CStyle",
    ]);
    expect(map.get("PlayerName.A")).toBe("PlayerName_A");
    expect(map.get("Resp1C._1D")).toBe("Resp1C_1D");
    expect(map.get("Resp1C.Other")).toBe("Resp1C_Other");
    expect(map.get("Resp1NT2COther")).toBe("Resp1NT2CStyle");
    expect(map.has("JumpRaiseMinorOther")).toBe(false);
    // The "Oth" ignore-token keeps the Other cell out of the dotted-cell rule…
    expect(map.get("Resp1C.Other")).not.toBe("Resp1C._Other");
  });
});
