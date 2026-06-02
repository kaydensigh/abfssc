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

  it("DROPS the four …Other/More merges whose old name is a distinct model field", () => {
    // These overflow inputs round-trip on their own /V — folding them would
    // corrupt the round-trip, so they must not appear in the rename map.
    expect(RENAME_MAP.has("JumpRaiseMinorOther")).toBe(false);
    expect(RENAME_MAP.has("JumpRaiseMajorOther")).toBe(false);
    expect(RENAME_MAP.has("UnusualNTOther")).toBe(false);
    expect(RENAME_MAP.has("Over1NTInterfMore")).toBe(false);
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
