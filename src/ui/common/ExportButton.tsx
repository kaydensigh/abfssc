import { type ReactElement, useState } from "react";
import { useCardStore } from "../../state/index.ts";
import { downloadPdf, exportCardPdf, suggestFilename } from "../../io/index.ts";
import type { ActionStatus } from "./status.ts";

type ExportButtonProps = {
  /** Called with the export outcome (or null when a fresh attempt starts). */
  onStatus: (status: ActionStatus | null) => void;
};

// The export action, framed (design Flow 1) as the *real* save: the filled
// regulation PDF is the shareable, durable artifact — local autosave is only a
// convenience on this device. Reads the card lazily at click time so this
// button doesn't re-render on every keystroke.
export function ExportButton({ onStatus }: ExportButtonProps): ReactElement {
  const [busy, setBusy] = useState(false);

  const onExport = async (): Promise<void> => {
    if (busy) return;
    setBusy(true);
    onStatus(null);
    try {
      const card = useCardStore.getState().card;
      const { bytes, warnings } = await exportCardPdf(card);
      downloadPdf(bytes, suggestFilename(card));
      if (warnings.length > 0) {
        console.warn("PDF export warnings:", warnings);
        const n = warnings.length;
        onStatus({
          kind: "notice",
          text: `Exported — but ${n} item${n === 1 ? "" : "s"} couldn't be placed on the official form.`,
        });
      }
    } catch (e) {
      onStatus({ kind: "error", text: e instanceof Error ? e.message : "Export failed." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="export">
      <button
        type="button"
        className="export-btn"
        onClick={onExport}
        disabled={busy}
        aria-busy={busy}
        aria-label="Export card as PDF"
        title="Export the official ABF card (PDF). This file — not the browser — is your safe, shareable copy."
      >
        <span className="btn-label-long" aria-hidden="true">⬇</span>
        <span className="btn-label-long">{busy ? "Preparing…" : "Export card (PDF)"}</span>
        <span className="btn-label-short">{busy ? "Preparing…" : "Export"}</span>
      </button>
    </div>
  );
}
