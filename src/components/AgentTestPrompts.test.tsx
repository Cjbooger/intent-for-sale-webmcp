import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AGENT_TEST_PROMPTS, AgentTestPrompts } from "./AgentTestPrompts";

describe("AgentTestPrompts", () => {
  afterEach(() => cleanup());

  it("offers four native-WebMCP tests without treating fallback as proof", () => {
    render(<AgentTestPrompts />);

    expect(AGENT_TEST_PROMPTS).toHaveLength(4);
    expect(screen.getByText("Get a recommendation")).toBeTruthy();
    expect(screen.getByText("Audit the influence")).toBeTruthy();
    expect(screen.getByText("Verify native WebMCP")).toBeTruthy();
    expect(screen.getByText("Test the confirmation boundary")).toBeTruthy();
    expect(screen.getAllByRole("button", { name: "Copy prompt" })).toHaveLength(4);
    expect(screen.getByText(/the result does not verify WebMCP/)).toBeTruthy();
  });

  it("copies the exact selected prompt", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    render(<AgentTestPrompts />);

    fireEvent.click(screen.getAllByRole("button", { name: "Copy prompt" })[0]!);

    await waitFor(() => expect(writeText).toHaveBeenCalledWith(AGENT_TEST_PROMPTS[0].prompt));
    expect(await screen.findByRole("button", { name: "Copied" })).toBeTruthy();
  });
});
