import type { ReactElement } from "react";
import { useCardStore } from "../../state/index.ts";

// "New card": clears every field back to a blank card. Sits beside Import as a
// secondary action. Because the only durable copy is the exported PDF (Flow 1),
// we confirm before discarding on-screen work.
export function NewCardButton(): ReactElement {
  const resetCard = useCardStore((s) => s.resetCard);
  const onNew = (): void => {
    if (
      window.confirm(
        "Start a new card? This clears every field on screen. Export the current card first if you want to keep it.",
      )
    ) {
      resetCard();
    }
  };
  return (
    <button
      type="button"
      className="import-btn"
      onClick={onNew}
      aria-label="Start a new blank card"
      title="Clear every field and start a blank card. Export first if you want to keep the current one."
    >
      <span aria-hidden="true">＋</span>
      <span>New card</span>
    </button>
  );
}
