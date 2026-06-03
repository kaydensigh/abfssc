import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TextField } from "./TextField.tsx";
import { useCardStore } from "../../state/index.ts";
import { createEmptyCard } from "../../model/index.ts";

beforeEach(() => {
  useCardStore.setState({ card: createEmptyCard({ id: "t", now: "2026-06-01T00:00:00.000Z" }) });
});

describe("TextField", () => {
  it("seeds a coded field's autocomplete from its code list and inserts the phrase", async () => {
    const user = userEvent.setup();
    render(<TextField def={{ key: "Open1NT", label: "1NT" }} />);
    await user.click(screen.getByRole("textbox", { name: "1NT" }));
    // selecting a preset inserts the phrase, still free-text editable afterwards
    await user.click(screen.getByText("12-14 Balanced"));
    expect(useCardStore.getState().card.fields.Open1NT).toBe("12-14 Balanced");
  });

  it("renders suit codes as glyphs in the display", async () => {
    useCardStore.getState().setField("OpenOther", "5+ !H");
    render(<TextField def={{ key: "OpenOther", label: "Other" }} />);
    // the display shows the heart glyph, not the raw code
    expect(screen.getByLabelText("Other").textContent).toContain("♥");
    expect(screen.getByLabelText("Other").textContent).not.toContain("!H");
  });

  it("edits flow back into the store", async () => {
    const user = userEvent.setup();
    render(<TextField def={{ key: "GerberWhen", label: "Gerber when" }} />);
    await user.click(screen.getByRole("textbox", { name: "Gerber when" }));
    await user.type(screen.getByRole("textbox", { name: "Gerber when" }), "over 1NT");
    expect(useCardStore.getState().card.fields.GerberWhen).toBe("over 1NT");
  });

  it("MyRev. (Date_A) offers a Today quick action that stamps an ISO date", async () => {
    const user = userEvent.setup();
    render(<TextField def={{ key: "Date_A", label: "MyRev." }} />);
    await user.click(screen.getByRole("textbox", { name: "MyRev." }));
    await user.click(screen.getByRole("button", { name: "Today" }));
    expect(useCardStore.getState().card.fields.Date_A).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("does not show quick actions for an ordinary field", async () => {
    const user = userEvent.setup();
    render(<TextField def={{ key: "GerberWhen", label: "Gerber when" }} />);
    await user.click(screen.getByRole("textbox", { name: "Gerber when" }));
    expect(screen.queryByRole("button", { name: "Today" })).toBeNull();
  });
});
