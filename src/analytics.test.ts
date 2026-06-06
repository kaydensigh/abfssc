import type { Mock } from "vitest";
import { track, trackActiveEngagement } from "./analytics.ts";

type Gtag = (...args: unknown[]) => void;

function clearGtag(): void {
  delete window.gtag;
}

describe("track", () => {
  afterEach(() => {
    clearGtag();
    vi.restoreAllMocks();
  });

  it("forwards events to gtag when present", () => {
    const gtag = vi.fn<Gtag>();
    window.gtag = gtag;
    track("import_card", { source: "pdf", warnings: 0 });
    expect(gtag).toHaveBeenCalledWith("event", "import_card", { source: "pdf", warnings: 0 });
  });

  it("is a silent no-op when gtag is absent", () => {
    clearGtag();
    expect(() => track("import_card")).not.toThrow();
  });

  it("swallows errors from gtag so they never reach the user", () => {
    window.gtag = () => {
      throw new Error("blocked");
    };
    expect(() => track("import_card")).not.toThrow();
  });
});

describe("trackActiveEngagement", () => {
  const HEARTBEAT_MS = 5_000;
  let gtag: Mock<Gtag>;
  let now = 0;
  let stop: (() => void) | undefined;

  /** Advance both the heartbeat scheduler and the (mocked) performance clock by
   *  one heartbeat, so each tick reads a coherent timestamp. */
  function step(): void {
    now += HEARTBEAT_MS;
    vi.advanceTimersByTime(HEARTBEAT_MS);
  }

  function interact(): void {
    window.dispatchEvent(new Event("pointerdown"));
  }

  beforeEach(() => {
    now = 0;
    vi.spyOn(performance, "now").mockImplementation(() => now);
    vi.useFakeTimers();
    gtag = vi.fn<Gtag>();
    window.gtag = gtag;
  });

  afterEach(() => {
    stop?.();
    stop = undefined;
    vi.useRealTimers();
    vi.restoreAllMocks();
    clearGtag();
  });

  it("reports active_use once a minute of continuous interaction accrues", () => {
    stop = trackActiveEngagement();
    // Interact at the start of every 5s slice for a full minute (12 slices).
    for (let i = 0; i < 12; i++) {
      interact();
      step();
    }
    expect(gtag).toHaveBeenCalledWith("event", "active_use", { active_seconds: 60 });
  });

  it("stops counting after the idle timeout following the last interaction", () => {
    stop = trackActiveEngagement();
    interact(); // single interaction at t=0
    for (let i = 0; i < 12; i++) step(); // a minute passes with no further input
    stop();
    stop = undefined;
    // Only the 30s idle window after the lone interaction is credited.
    expect(gtag).toHaveBeenCalledWith("event", "active_use", { active_seconds: 30 });
  });

  it("does not count time while the tab is hidden", () => {
    const visibility = vi.spyOn(document, "visibilityState", "get").mockReturnValue("hidden");
    stop = trackActiveEngagement();
    interact();
    for (let i = 0; i < 12; i++) step();
    stop();
    stop = undefined;
    visibility.mockRestore();
    expect(gtag).not.toHaveBeenCalled();
  });
});
