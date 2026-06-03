import { beforeEach, describe, expect, it } from "vitest";
import { renderHook } from "@testing-library/react";
import { useUnloadGuard } from "./useUnloadGuard.ts";
import { useCardStore } from "../state/index.ts";
import { createEmptyCard } from "../model/index.ts";

beforeEach(() => {
  useCardStore.setState({ card: createEmptyCard({ id: "t" }), dirty: false });
});

/** Dispatch a cancelable beforeunload; returns false when a listener prevented it. */
function fireBeforeUnload(): boolean {
  return window.dispatchEvent(new Event("beforeunload", { cancelable: true }));
}

describe("useUnloadGuard", () => {
  it("does not block unload when there are no unsaved changes", () => {
    renderHook(() => useUnloadGuard());
    expect(fireBeforeUnload()).toBe(true); // not prevented
  });

  it("blocks unload when the card has unsaved edits", () => {
    renderHook(() => useUnloadGuard());
    useCardStore.setState({ dirty: true });
    expect(fireBeforeUnload()).toBe(false); // prevented → browser shows its prompt
  });

  it("stops guarding once unmounted", () => {
    const { unmount } = renderHook(() => useUnloadGuard());
    useCardStore.setState({ dirty: true });
    unmount();
    expect(fireBeforeUnload()).toBe(true); // listener removed
  });
});
