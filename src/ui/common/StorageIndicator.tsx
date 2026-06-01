import { type ReactElement, useEffect, useId, useRef, useState } from "react";
import { storageAvailable, useCardStore } from "../../state/index.ts";

// Flow 1 (design §07): make it unmistakable that autosave is THIS device only —
// never a cloud. Shrunk from a full-width banner to a compact icon in the page
// header; clicking expands a popover with the loss-vector detail. A polite live
// region keeps "Saving…/Saved" announcements for screen readers. Escalates to
// amber when storage is unavailable or the browser denied persistence.
export function StorageIndicator(): ReactElement {
  const status = useCardStore((s) => s.saveStatus);
  const lastSavedAt = useCardStore((s) => s.lastSavedAt);
  const persistGranted = useCardStore((s) => s.persistGranted);
  const available = storageAvailable();
  const warn = !available || persistGranted === false;

  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  const when = lastSavedAt
    ? new Date(lastSavedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : null;

  let statusText: string;
  if (!available) statusText = "This browser can't save locally — export to keep your card.";
  else if (status === "saving") statusText = "Saving on this device…";
  else if (status === "error") statusText = "Couldn't save on this device.";
  else if (when) statusText = `Saved on this device · ${when}`;
  else statusText = "Saved on this device";

  // Stable accessible name (the timestamped sentence lives in title + live region).
  const accName = warn ? "Storage: needs attention" : "Storage: saved on this device";

  // Dismiss on click-outside + Escape (Escape returns focus to the trigger).
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        btnRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className={`storage-ind${warn ? " warn" : ""}`} ref={rootRef}>
      <button
        ref={btnRef}
        type="button"
        className="storage-btn"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        aria-label={accName}
        title={statusText}
        onClick={() => setOpen((v) => !v)}
      >
        <span className={`dot${status === "saving" ? " pulsing" : ""}`} aria-hidden="true" />
        <span className="device" aria-hidden="true">
          🖥️
        </span>
      </button>

      {/* Polite live region: announces save state without stealing focus. */}
      <span className="visually-hidden" role="status">
        {statusText}
      </span>

      {open && (
        <div className="storage-pop" id={panelId} role="dialog" aria-label="Storage details">
          <p className="sp-status">
            <span className="dot" aria-hidden="true" />
            {statusText}
          </p>
          <p className="sp-explain">
            Your card is stored only in <strong>this browser on this device</strong> — not in the cloud and not synced
            to your partner. It can be lost if you clear site data, switch device, or use private browsing. The real,
            shareable backup is the official PDF export (a later milestone).
            {persistGranted === false && " This browser may also evict the data under storage pressure."}
          </p>
        </div>
      )}
    </div>
  );
}
