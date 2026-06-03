import { type ChangeEvent, type ReactElement, useRef, useState } from "react";
import { useCardStore } from "../../state/index.ts";
import { classifyImport, type ImportRelation } from "../../state/index.ts";
import { importCardFile, ImportError, type FileImport } from "../../io/index.ts";
import { renderPlain } from "../../render/index.ts";
import type { ActionStatus } from "./status.ts";

type ImportButtonProps = {
  /** Called with the import outcome (or null when a fresh attempt starts). */
  onStatus: (status: ActionStatus | null) => void;
};

// Minimal import entry (M2). Reads an ABF card PDF or FDF, classifies it against
// what's on screen, and — after a single confirm — replaces the current card.
// The full resolution UI (Replace / Keep both / Compare, the field-level diff)
// is M3; here replace-or-cancel is the only choice, but the messaging already
// uses the real new-vs-newer-vs-fork branch so it reads honestly.

function who(fields: Record<string, string>): string {
  const a = renderPlain(fields.PlayerName_A ?? "").trim();
  const b = renderPlain(fields.PlayerName_B ?? "").trim();
  const names = [a, b].filter(Boolean).join(" & ");
  return names || "this card";
}

/** The confirm prompt for each import relation (replace is the only M2 action). */
function confirmPrompt(rel: ImportRelation, incoming: FileImport): string {
  const name = who(incoming.imported.card.fields);
  const src = incoming.source.toUpperCase();
  switch (rel.kind) {
    case "new":
      return `This ${src} looks like a different card (${name}). Replace what's on screen with it?`;
    case "succession":
      return rel.newer === "incoming"
        ? `This ${src} is a newer revision of ${name}. Load it, replacing what's on screen?`
        : `This ${src} is an older revision of ${name} than what's on screen. Load it anyway?`;
    case "fork":
      return `This ${src} and the card on screen have diverged from a shared revision. Load it, replacing what's on screen? (A side-by-side compare is coming in a later version.)`;
  }
}

export function ImportButton({ onStatus }: ImportButtonProps): ReactElement {
  const inputRef = useRef<HTMLInputElement>(null);
  const replaceCard = useCardStore((s) => s.replaceCard);
  const [busy, setBusy] = useState(false);

  const onPick = async (e: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-choosing the same file
    if (!file || busy) return;
    setBusy(true);
    onStatus(null);
    try {
      const result = await importCardFile(file);
      const local = useCardStore.getState().card;
      const relation = classifyImport(local, result.imported.card);
      if (!window.confirm(confirmPrompt(relation, result))) {
        onStatus({ kind: "notice", text: "Import cancelled." });
        return;
      }
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
