import { StrictMode } from "react";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "./App";
import { useDemoStore } from "./store/demoStore";

describe("App WebMCP lifecycle", () => {
  beforeEach(() => {
    useDemoStore.getState().resetDemo();
  });

  afterEach(() => {
    cleanup();
    document.modelContext = undefined;
  });

  it("registers exactly seven active tools after mount and aborts them on unmount", async () => {
    const registerTool = vi.fn().mockResolvedValue(undefined);
    document.modelContext = { registerTool };

    const view = render(
      <StrictMode>
        <App />
      </StrictMode>,
    );

    expect(await screen.findByText("WebMCP active")).toBeTruthy();
    await waitFor(() => {
      const activeCalls = registerTool.mock.calls.filter(
        (call) => !(call[1]?.signal as AbortSignal | undefined)?.aborted,
      );
      expect(activeCalls).toHaveLength(7);
      expect(activeCalls.map((call) => call[0].name)).toEqual([
        "create_intent_session",
        "run_simulated_ad_auction",
        "get_market_recommendations",
        "inspect_recommendation_influence",
        "set_recommendation_policy",
        "compare_market_to_clean_room",
        "stage_demo_selection",
      ]);
    });

    const activeSignal = registerTool.mock.calls.find(
      (call) => !(call[1]?.signal as AbortSignal | undefined)?.aborted,
    )?.[1]?.signal as AbortSignal;
    view.unmount();
    expect(activeSignal.aborted).toBe(true);
  });
});
