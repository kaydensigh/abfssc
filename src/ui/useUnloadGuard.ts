import { useEffect } from "react";
import { useCardStore } from "../state/index.ts";

/**
 * Warn before the tab is closed or reloaded while the card has unsaved edits.
 * There is no local persistence — the exported PDF is the only durable copy — so
 * losing the tab loses the work. Browsers only permit the *native* generic prompt
 * here; its wording is the browser's, and a custom dialog cannot block unload.
 * The listener reads `dirty` at fire time, so it is registered just once.
 */
export function useUnloadGuard(): void {
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent): void => {
      if (!useCardStore.getState().dirty) return;
      e.preventDefault();
      e.returnValue = ""; // legacy: some browsers need returnValue set to prompt
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);
}
