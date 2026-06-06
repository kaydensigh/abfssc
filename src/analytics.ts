// Thin wrapper over Google Analytics (GA4 / gtag.js). The gtag.js snippet in
// index.html defines the global `gtag()` and configures the property; this module
// is the *only* place the rest of the app talks to it, so feature code stays
// analytics-unaware. Every call is a safe no-op when gtag is missing — blocked by
// an ad-blocker, or simply absent under jsdom in tests — so analytics can never
// break the app.

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/** Send a GA4 event. No-op (and never throws) when gtag is unavailable. */
export function track(event: string, params?: Record<string, unknown>): void {
  try {
    window.gtag?.("event", event, params);
  } catch {
    // Analytics is best-effort; swallow anything so it can't surface to the user.
  }
}

// ── Active-use timing ──────────────────────────────────────────────────────────
//
// GA4 already reports "engagement time" for free, and it only counts time the tab
// is in the *foreground* (visible) — a tab merely left open in the background is
// not counted. What GA4 still counts, though, is foreground *idle* time (the card
// is on screen but the user isn't touching it).
//
// To measure time the user is *actually doing things*, we accumulate seconds only
// while (a) the tab is visible AND (b) the user has interacted within IDLE_TIMEOUT,
// then report the total to GA4 as an `active_use` event carrying `active_seconds`.
// Register `active_seconds` as a GA4 custom metric (Admin → Custom definitions) to
// sum/average it in reports. We flush on a cadence and whenever the tab is hidden
// or the page unloads, so time is banked even if the user never comes back.

const IDLE_TIMEOUT_MS = 30_000; // no interaction for this long ⇒ treat as idle
const HEARTBEAT_MS = 5_000; // accumulator resolution
const FLUSH_AFTER_MS = 60_000; // report to GA once this much active time piles up

// Interactions that count as "doing something". Passive listeners so we never
// affect scrolling/typing latency.
const ACTIVITY_EVENTS = ["pointerdown", "keydown", "input", "wheel", "touchstart"] as const;

/**
 * Start accumulating and reporting active-use time. Returns a teardown function
 * (removes listeners + flushes) — mainly for tests; in the app it runs for the
 * lifetime of the page.
 */
export function trackActiveEngagement(): () => void {
  let lastActivity = performance.now();
  let lastTick = performance.now();
  let pendingMs = 0;

  const visible = (): boolean => document.visibilityState === "visible";
  const markActive = (): void => {
    lastActivity = performance.now();
  };

  const flush = (): void => {
    const seconds = Math.round(pendingMs / 1000);
    if (seconds <= 0) return;
    pendingMs = 0;
    track("active_use", { active_seconds: seconds });
  };

  const tick = (): void => {
    const now = performance.now();
    const elapsed = now - lastTick;
    lastTick = now;
    // Count the slice only when foreground and recently interacted-with.
    if (visible() && now - lastActivity <= IDLE_TIMEOUT_MS) {
      pendingMs += elapsed;
      if (pendingMs >= FLUSH_AFTER_MS) flush();
    }
  };

  const onVisibility = (): void => {
    if (!visible()) {
      flush(); // leaving the foreground — bank what we have now
    } else {
      // Returning: reset clocks so the hidden gap isn't counted as active.
      lastTick = performance.now();
      markActive();
    }
  };

  for (const type of ACTIVITY_EVENTS) {
    window.addEventListener(type, markActive, { passive: true });
  }
  const interval = window.setInterval(tick, HEARTBEAT_MS);
  document.addEventListener("visibilitychange", onVisibility);
  // pagehide is the reliable cross-platform "page is going away" hook (mobile
  // Safari never fires a dependable beforeunload). gtag sends via sendBeacon.
  window.addEventListener("pagehide", flush);

  return (): void => {
    window.clearInterval(interval);
    for (const type of ACTIVITY_EVENTS) window.removeEventListener(type, markActive);
    document.removeEventListener("visibilitychange", onVisibility);
    window.removeEventListener("pagehide", flush);
    flush();
  };
}
