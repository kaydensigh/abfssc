import { describe, expect, it } from "vitest";
import { fieldActions, todayISO } from "./quickActions.ts";

describe("todayISO", () => {
  it("formats a date as local-time yyyy-mm-dd, zero-padded", () => {
    // Month is 0-indexed: 5 = June. Single-digit month/day are padded.
    expect(todayISO(new Date(2026, 5, 4))).toBe("2026-06-04");
    expect(todayISO(new Date(2026, 0, 9))).toBe("2026-01-09");
    expect(todayISO(new Date(2026, 11, 31))).toBe("2026-12-31");
  });
});

describe("fieldActions", () => {
  it("gives the MyRev. (Date_A) field a Today action that returns an ISO date", () => {
    const actions = fieldActions("Date_A");
    expect(actions).toHaveLength(1);
    expect(actions![0].label).toBe("Today");
    expect(actions![0].run()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("gives ordinary fields no actions", () => {
    expect(fieldActions("Open1NT")).toBeUndefined();
  });
});
