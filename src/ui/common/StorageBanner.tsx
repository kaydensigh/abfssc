import type { ReactElement } from "react";
import { storageAvailable, useCardStore } from "../../state/index.ts";

// Flow 1 (design §07): make it unmistakable that autosave is THIS device only —
// never a cloud. A persistent indicator names the loss vectors; the real backup
// is the official PDF (M1). Escalates to amber when storage is unavailable or
// the browser denied persistence (the known Safari/iOS gap).
export function StorageBanner(): ReactElement {
  const status = useCardStore((s) => s.saveStatus);
  const lastSavedAt = useCardStore((s) => s.lastSavedAt);
  const persistGranted = useCardStore((s) => s.persistGranted);
  const available = storageAvailable();
  const warn = !available || persistGranted === false;

  const when = lastSavedAt
    ? new Date(lastSavedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : null;

  let text: string;
  if (!available) text = "This browser can't save locally — export to keep your card.";
  else if (status === "saving") text = "Saving on this device…";
  else if (status === "error") text = "Couldn't save on this device.";
  else if (when) text = `Saved on this device · ${when}`;
  else text = "Saved on this device";

  return (
    <div className={`storage${warn ? " warn" : ""}`} role="status">
      <span className="dot" />
      <span className="device" aria-hidden="true">
        🖥️
      </span>
      <span>{text}</span>
      <details>
        <summary>What does this mean?</summary>
        <div className="explain">
          Your card is stored only in <strong>this browser on this device</strong> — not in the cloud and not synced
          to your partner. It can be lost if you clear site data, switch device, or use private browsing. The real,
          shareable backup is the official PDF export (a later milestone).
          {persistGranted === false && " This browser may also evict the data under storage pressure."}
        </div>
      </details>
    </div>
  );
}
