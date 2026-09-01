import { describe, expect, it, vi } from "vitest";
import { TOOL_DEFINITIONS, getRegisteredToolNames, registerWebMcpTools } from "./registerTools";
import { inputValidators, inputSchemas } from "./schemas";
import { TOOL_NAMES } from "./types";
import { useDemoStore } from "../store/demoStore";

describe("WebMCP tool contract", () => {
  it("defines exactly the seven core tools with strict object schemas", () => {
    expect(TOOL_DEFINITIONS.map((tool) => tool.name)).toEqual([...TOOL_NAMES]);
    expect(getRegisteredToolNames()).toEqual(TOOL_NAMES);

    for (const tool of TOOL_DEFINITIONS) {
      expect(tool.inputSchema.type).toBe("object");
      expect(tool.inputSchema.additionalProperties).toBe(false);
      expect(tool.annotations.readOnlyHint).toBe(false);
    }

    expect(TOOL_DEFINITIONS.find((tool) => tool.name === "get_market_recommendations")?.annotations)
      .toMatchObject({ untrustedContentHint: true });
    expect(TOOL_DEFINITIONS.find((tool) => tool.name === "inspect_recommendation_influence")?.annotations)
      .toMatchObject({ untrustedContentHint: true });
  });

  it("rejects unknown keys and normalizes documented defaults", () => {
    const parsed = inputValidators.create_intent_session.safeParse({
      taskSummary: "Find a video platform for this client project",
      budgetMonthlyUsd: 80,
      mustHave: ["commercial usage rights"],
      unknown: true,
    });
    expect(parsed.success).toBe(false);

    const auction = inputValidators.run_simulated_ad_auction.parse({ sessionId: "ifs_demo_001" });
    expect(auction.auctionMode).toBe("weighted_relevance");
    const recommendations = inputValidators.get_market_recommendations.parse({ sessionId: "ifs_demo_001" });
    expect(recommendations.limit).toBe(5);
  });

  it("registers all tools and aborts the registration signal on cleanup", async () => {
    const registerTool = vi.fn().mockResolvedValue(undefined);
    document.modelContext = { registerTool };
    const statuses: { registered: boolean; toolsRegistered: number }[] = [];

    const registration = await registerWebMcpTools((next) => {
      statuses.push({ registered: next.registered, toolsRegistered: next.toolsRegistered });
    });

    expect(registration.status).toMatchObject({ supported: true, registered: true, toolsRegistered: 7 });
    expect(registerTool).toHaveBeenCalledTimes(7);
    expect(statuses.at(-1)).toEqual({ registered: true, toolsRegistered: 7 });

    const signal = registerTool.mock.calls[0]?.[1]?.signal as AbortSignal;
    expect(signal?.aborted).toBe(false);
    registration.cleanup();
    expect(signal?.aborted).toBe(true);
  });

  it("reports an unsupported browser without pretending tools are active", async () => {
    document.modelContext = undefined;
    const registration = await registerWebMcpTools();
    expect(registration.status).toEqual({ supported: false, registered: false, toolsRegistered: 0 });
  });

  it("executes safely when a browser omits the optional execution context", async () => {
    useDemoStore.getState().resetDemo();
    const createTool = TOOL_DEFINITIONS.find((tool) => tool.name === "create_intent_session")!;
    const result = await createTool.execute({
      taskSummary: "Select an AI video-generation platform for client work",
      budgetMonthlyUsd: 80,
      mustHave: ["commercial usage rights"],
    });
    expect(result).toMatchObject({ ok: true, state: "INTENT_READY" });
  });

  it("returns a structured failure for a pre-aborted execution", async () => {
    useDemoStore.getState().resetDemo();
    const controller = new AbortController();
    controller.abort();
    const createTool = TOOL_DEFINITIONS.find((tool) => tool.name === "create_intent_session")!;
    const result = await createTool.execute(
      {
        taskSummary: "Select an AI video-generation platform for client work",
        budgetMonthlyUsd: 80,
        mustHave: ["commercial usage rights"],
      },
      { signal: controller.signal },
    );
    expect(result).toMatchObject({
      ok: false,
      error: { code: "EXECUTION_ABORTED", recoverable: true },
    });
  });

  it("can cancel an in-flight StrictMode registration before cleanup is returned", async () => {
    let release: (() => void) | undefined;
    const registerTool = vi.fn(
      (_tool, options?: { signal?: AbortSignal }) =>
        new Promise<void>((resolve) => {
          release = resolve;
          options?.signal?.addEventListener("abort", () => resolve(), { once: true });
        }),
    );
    document.modelContext = { registerTool };
    const lifecycle = new AbortController();
    const pending = registerWebMcpTools(undefined, lifecycle.signal);

    await vi.waitFor(() => expect(registerTool).toHaveBeenCalledTimes(1));
    const registrationSignal = registerTool.mock.calls[0]?.[1]?.signal as AbortSignal;
    lifecycle.abort();
    release?.();
    const registration = await pending;

    expect(registrationSignal.aborted).toBe(true);
    expect(registerTool).toHaveBeenCalledTimes(1);
    expect(registration.status.registered).toBe(false);
  });
});

describe("hand-authored schema parity", () => {
  it("keeps every schema keyed to a core tool", () => {
    expect(Object.keys(inputSchemas).sort()).toEqual([...TOOL_NAMES].sort());
  });
});
