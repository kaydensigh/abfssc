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
  it("renders the brand, storage banner, and the masthead first", () => {
    render(<App />);
    expect(screen.getByText("ABF System Card")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(/this device/i);
    expect(screen.getByText("Partnership")).toBeInTheDocument(); // masthead body
    expect(screen.getByRole("radiogroup", { name: "System classification" })).toBeInTheDocument();
  });

  it("navigates between sections", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "8. Responses to opening bids" }));
    expect(screen.getByRole("columnheader", { name: "Gen." })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "1. Opening bids" }));
    // the §1 field labels appear (1NT opening field)
    expect(screen.getByText("1NT")).toBeInTheDocument();
  });
});
