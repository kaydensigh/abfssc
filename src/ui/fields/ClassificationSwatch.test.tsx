import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ClassificationSwatch } from "./ClassificationSwatch.tsx";
import { useCardStore } from "../../state/index.ts";
import { createEmptyCard } from "../../model/index.ts";

beforeEach(() => {
  useCardStore.setState({ card: createEmptyCard({ id: "t", now: "2026-06-01T00:00:00.000Z" }) });
});

describe("ClassificationSwatch", () => {
  it("selects a colour on click and clears it when re-clicked", async () => {
    const user = userEvent.setup();
    render(<ClassificationSwatch />);
    const green = screen.getByRole("radio", { name: "Green" });
    await user.click(green);
    expect(useCardStore.getState().card.classification).toBe("green");
    expect(green).toHaveAttribute("aria-checked", "true");
    await user.click(green);
    expect(useCardStore.getState().card.classification).toBe("unset");
  });

  it("is a single tab stop and selects with the arrow keys", async () => {
    const user = userEvent.setup();
    render(<ClassificationSwatch />);
    // unset → only the first swatch is tabbable
    expect(screen.getByRole("radio", { name: "Green" })).toHaveAttribute("tabindex", "0");
    expect(screen.getByRole("radio", { name: "Blue" })).toHaveAttribute("tabindex", "-1");
    screen.getByRole("radio", { name: "Green" }).focus();
    await user.keyboard("{ArrowRight}");
    expect(useCardStore.getState().card.classification).toBe("blue");
    expect(screen.getByRole("radio", { name: "Blue" })).toHaveFocus();
  });
});
