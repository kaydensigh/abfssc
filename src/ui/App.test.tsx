import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { App } from "./App.tsx";
import { useCardStore } from "../state/index.ts";
import { createEmptyCard } from "../model/index.ts";

beforeEach(() => {
  useCardStore.setState({ card: createEmptyCard({ id: "t", now: "2026-06-01T00:00:00.000Z" }) });
});

describe("App shell", () => {
  it("renders the brand, the storage indicator, and page 1 (masthead) first", () => {
    render(<App />);
    expect(screen.getByText("ABF System Card")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /storage/i })).toBeInTheDocument();
    expect(screen.getByText("Partnership")).toBeInTheDocument(); // masthead body
    expect(screen.getByRole("radiogroup", { name: "System classification" })).toBeInTheDocument();
  });

  it("navigates between the four pages", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "Responses to Openings" }));
    expect(screen.getByRole("columnheader", { name: "Gen." })).toBeInTheDocument(); // §8 grid
    await user.click(screen.getByRole("button", { name: "Openings & Competitive" }));
    expect(screen.getByText("1NT")).toBeInTheDocument(); // §1 opening field label
  });

  it("expands the storage indicator to explain device-only storage", async () => {
    const user = userEvent.setup();
    render(<App />);
    expect(screen.queryByText(/this browser on this device/i)).toBeNull(); // collapsed
    await user.click(screen.getByRole("button", { name: /storage/i }));
    expect(screen.getByText(/this browser on this device/i)).toBeInTheDocument();
  });
});
