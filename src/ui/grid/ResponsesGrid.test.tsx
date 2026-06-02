import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ResponsesGrid } from "./ResponsesGrid.tsx";
import { useCardStore } from "../../state/index.ts";
import { createEmptyCard } from "../../model/index.ts";

beforeEach(() => {
  useCardStore.setState({ card: createEmptyCard({ id: "t", now: "2026-06-01T00:00:00.000Z" }) });
});

describe("§8 responses grid", () => {
  it("renders the response and Other columns", () => {
    expect(screen.queryByRole("columnheader", { name: "Other" })).toBeNull(); // not yet rendered
    render(<ResponsesGrid />);
    // Suit glyphs carry a VS-15 (text-presentation) char so CSS colour applies,
    // so match the header by substring rather than exact accessible name.
    expect(screen.getByRole("columnheader", { name: /1♦/ })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Other" })).toBeInTheDocument();
  });

  it("does not render holes in the matrix as editable cells", () => {
    render(<ResponsesGrid />);
    // 1NT has no 1-level responses, so there is no "1NT → 1♦" cell.
    expect(screen.queryByRole("button", { name: "1NT → 1♦" })).toBeNull();
    // but a real cell exists
    expect(screen.getAllByRole("button", { name: "1♣ → 2♦" }).length).toBeGreaterThan(0);
  });

  it("writes an edited cell to responses[opening][bid]", async () => {
    const user = userEvent.setup();
    render(<ResponsesGrid />);
    await user.click(screen.getByRole("button", { name: "1♣ → 2♦" }));
    await user.type(screen.getByRole("textbox", { name: "1♣ → 2♦" }), "inverted");
    expect(useCardStore.getState().card.responses["1C"]?.["2D"]).toBe("inverted");
  });

  it("moves between existing cells with the arrow keys, skipping holes", async () => {
    const user = userEvent.setup();
    render(<ResponsesGrid />);
    screen.getByRole("button", { name: "1♣ → 1♦" }).focus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("button", { name: "1♣ → 1♥" })).toHaveFocus(); // next existing cell

    screen.getByRole("button", { name: "1♣ → 2♦" }).focus();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("button", { name: "1♦ → 2♦" })).toHaveFocus(); // 1D row also has 2♦
  });

  it("does not enter edit mode merely on focus (keyboard-navigable)", () => {
    render(<ResponsesGrid />);
    const cell = screen.getByRole("button", { name: "1♣ → 1♦" });
    cell.focus();
    // still a button (display), not an input
    expect(cell.tagName).toBe("BUTTON");
    expect(screen.queryByRole("textbox", { name: "1♣ → 1♦" })).toBeNull();
  });
});
