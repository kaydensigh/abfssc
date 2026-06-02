import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ResponseBlocks } from "./ResponseBlocks.tsx";
import { useCardStore } from "../../state/index.ts";
import { createEmptyCard } from "../../model/index.ts";

beforeEach(() => {
  useCardStore.setState({ card: createEmptyCard({ id: "t", now: "2026-06-01T00:00:00.000Z" }) });
});

describe("§8 response blocks", () => {
  it("renders a cell for each valid opening→response, including the per-opening Other", () => {
    render(<ResponseBlocks />);
    // A real response and the opening's "Other" catch-all both render as cells.
    expect(screen.getByRole("textbox", { name: "1♣ → 2♦" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "1♣ → Other" })).toBeInTheDocument();
  });

  it("does not render not-applicable responses as cells", () => {
    render(<ResponseBlocks />);
    // 1NT has no 1-level responses, so there is no "1NT → 1♦" cell.
    expect(screen.queryByRole("textbox", { name: "1NT → 1♦" })).toBeNull();
  });

  it("writes an edited cell to responses[opening][bid]", async () => {
    const user = userEvent.setup();
    render(<ResponseBlocks />);
    // Cells are click-to-edit: focusing the display reveals the raw input.
    await user.click(screen.getByRole("textbox", { name: "1♣ → 2♦" }));
    await user.type(screen.getByRole("textbox", { name: "1♣ → 2♦" }), "inverted");
    expect(useCardStore.getState().card.responses["1C"]?.["2D"]).toBe("inverted");
  });
});
