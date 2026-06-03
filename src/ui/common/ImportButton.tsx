import { type ChangeEvent, type ReactElement, useRef, useState } from "react";
import { useCardStore } from "../../state/index.ts";
import { importCardFile, ImportError } from "../../io/index.ts";
import { renderPlain } from "../../render/index.ts";
import type { ActionStatus } from "./status.ts";

type ImportButtonProps = {
  /** Called with the import outcome (or null when a fresh attempt starts). */
  onStatus: (status: ActionStatus | null) => void;
};

// Import entry. Reads an ABF card PDF or FDF and replaces the card on screen.
// The only thing that can be lost is *unsaved on-screen edits* — the card
// otherwise lives only in this tab and the exported PDF is the durable copy — so
// we confirm only when the current card is dirty (not based on what the incoming
// file looks like). A clean (exported or blank) card is replaced silently.

function who(fields: Record<string, string>): string {
  const a = renderPlain(fields.PlayerName_A ?? "").trim();
  const b = renderPlain(fields.PlayerName_B ?? "").trim();
  const names = [a, b].filter(Boolean).join(" & ");
  return names || "this card";
}

const UNSAVED_WARNING =
  "Replace the card on screen? You have unsaved changes that will be lost — export the current card first if you want to keep it.";

export function ImportButton({ onStatus }: ImportButtonProps): ReactElement {
  const inputRef = useRef<HTMLInputElement>(null);
  const replaceCard = useCardStore((s) => s.replaceCard);
  const [busy, setBusy] = useState(false);

  const onPick = async (e: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-choosing the same file
    if (!file || busy) return;

    // Warn only when there are unsaved edits to lose; ask before reading the
    // file so a cancel does no work.
    if (useCardStore.getState().dirty && !window.confirm(UNSAVED_WARNING)) {
      onStatus({ kind: "notice", text: "Import cancelled." });
      return;
    }

    setBusy(true);
    onStatus(null);
    try {
      const result = await importCardFile(file);
      replaceCard(result.imported.card);
      const warnings = result.imported.warnings;
      if (warnings.length > 0) {
        console.warn("Import warnings:", warnings);
        onStatus({
          kind: "notice",
          text: `Imported ${who(result.imported.card.fields)} — with ${warnings.length} note${warnings.length === 1 ? "" : "s"}.`,
        });
      } else {
        onStatus({
          kind: "notice",
          text: `Imported ${who(result.imported.card.fields)} (from ${result.source.toUpperCase()}).`,
        });
      }
    } catch (err) {
      if (err instanceof ImportError) onStatus({ kind: "error", text: err.message });
      else onStatus({ kind: "error", text: err instanceof Error ? err.message : "Import failed." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="import">
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.fdf,application/pdf,application/vnd.fdf"
        className="visually-hidden"
        onChange={onPick}
        aria-hidden="true"
        tabIndex={-1}
      />
      <button
        type="button"
        className="import-btn"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        aria-busy={busy}
        aria-label="Import card from a PDF or FDF file"
        title="Open an ABF System Card you (or a partner) exported earlier — a filled official PDF, or an FDF."
      >
        <span className="btn-label-long" aria-hidden="true">⬆</span>
        <span className="btn-label-long">{busy ? "Reading…" : "Import card"}</span>
        <span className="btn-label-short">{busy ? "Reading…" : "Import"}</span>
      </button>
    </div>
  );
}
