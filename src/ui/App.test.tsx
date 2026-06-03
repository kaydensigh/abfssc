import { beforeEach, describe, expect, it } from "vitest";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { App } from "./App.tsx";
import { useCardStore } from "../state/index.ts";
import { createEmptyCard } from "../model/index.ts";

beforeEach(() => {
  useCardStore.setState({ card: createEmptyCard({ id: "t", now: "2026-06-01T00:00:00.000Z" }), dirty: false });
});

describe("App shell", () => {
  it("renders the brand, the export button (clean state), and page 1 (masthead) first", () => {
    render(<App />);
    expect(screen.getByText("ABF Standard System Card")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /export card as pdf — all changes saved/i })).toBeInTheDocument();
    expect(screen.getByText("ABF Numbers & Names")).toBeInTheDocument(); // masthead body
    expect(screen.getByRole("radiogroup", { name: "System classification" })).toBeInTheDocument();
  });

  it("navigates between the four pages", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "Responses to Openings" }));
    expect(screen.getByRole("textbox", { name: "1♣ → Other" })).toBeInTheDocument(); // §8 response block
    await user.click(screen.getByRole("button", { name: "Openings & Competitive" }));
    expect(screen.getByText("1NT")).toBeInTheDocument(); // §1 opening field label
  });

  it("the Export button doubles as the save-status signal (clean ↔ unsaved)", () => {
    render(<App />);
    // Clean on load: the button shows its secondary (Import-like) "saved" state.
    expect(screen.getByRole("button", { name: /export card as pdf — all changes saved/i })).toBeInTheDocument();
    act(() => {
      useCardStore.getState().setField("Open1NT", "12-14");
    });
    // First edit flips it to the prominent "unsaved changes" state.
    expect(screen.getByRole("button", { name: /export card as pdf — unsaved changes/i })).toBeInTheDocument();
  });
});
