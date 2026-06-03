import { type ReactElement, useState } from "react";
import { useCardStore } from "../../state/index.ts";
import { downloadPdf, exportCardPdf, suggestFilename } from "../../io/index.ts";
import type { ActionStatus } from "./status.ts";

type ExportButtonProps = {
  /** Called with the export outcome (or null when a fresh attempt starts). */
  onStatus: (status: ActionStatus | null) => void;
};

// The export action, framed (design Flow 1) as the *real* save: the filled
// regulation PDF is the shareable, durable artifact — the app keeps nothing on
// the device. The button itself is the save-status signal: prominent green while
// the card has unsaved edits, dropping to the same secondary look as Import once
// everything is captured in an export (a successful export marks the card clean,
// which also clears the unsaved-changes guard). Subscribes only to the `dirty`
// boolean — it flips at most once per edit session, not per keystroke — and reads
// the card lazily at click time.
export function ExportButton({ onStatus }: ExportButtonProps): ReactElement {
  const [busy, setBusy] = useState(false);
  const dirty = useCardStore((s) => s.dirty);

  const onExport = async (): Promise<void> => {
    if (busy) return;
    setBusy(true);
    onStatus(null);
    try {
      const card = useCardStore.getState().card;
      const { bytes, warnings } = await exportCardPdf(card);
      downloadPdf(bytes, suggestFilename(card));
      useCardStore.getState().markExported();
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
        className={`export-btn${dirty ? "" : " saved"}`}
        onClick={onExport}
        disabled={busy}
        aria-busy={busy}
        aria-label={`Export card as PDF — ${dirty ? "unsaved changes" : "all changes saved"}`}
        title={`${dirty ? "Unsaved changes — export to save. " : "All changes saved. "}The PDF, not the browser, is your safe, shareable copy.`}
      >
        <span className="btn-label-long" aria-hidden="true">⬇</span>
        <span className="btn-label-long">{busy ? "Preparing…" : "Export card (PDF)"}</span>
        <span className="btn-label-short">{busy ? "Preparing…" : "Export"}</span>
      </button>
    </div>
  );
}
