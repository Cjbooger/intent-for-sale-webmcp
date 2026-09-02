import { beforeEach, describe, expect, it } from "vitest";
import { useDemoStore } from "../store/demoStore";
import { TOOL_DEFINITIONS } from "./registerTools";
import type { ToolName, ToolResult } from "./types";

const VALID_INTENT = {
  taskSummary: "Select an AI video-generation platform for client work",
  budgetMonthlyUsd: 80,
  mustHave: ["commercial usage rights"],
};

function tool(name: ToolName) {
  const definition = TOOL_DEFINITIONS.find((candidate) => candidate.name === name);
  if (!definition) throw new Error(`Missing ${name} tool definition.`);
  return definition;
}

function execute(name: ToolName, input: unknown): Promise<ToolResult<unknown>> {
  return tool(name).execute(input);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function sessionIdFrom(result: ToolResult<unknown>): string {
  if (!result.ok || !isRecord(result.data) || typeof result.data.sessionId !== "string") {
    throw new Error("Expected a successful intent-session result.");
  }
  return result.data.sessionId;
}

function auctionDataFrom(result: ToolResult<unknown>): Record<string, unknown> {
  if (!result.ok || !isRecord(result.data) || typeof result.data.auctionMode !== "string") {
    throw new Error("Expected a successful auction result.");
  }
  return result.data;
}

async function createAndRank(): Promise<string> {
  const created = await execute("create_intent_session", VALID_INTENT);
  expect(created).toMatchObject({ ok: true, state: "INTENT_READY" });
  const sessionId = sessionIdFrom(created);

  const auction = await execute("run_simulated_ad_auction", {
    sessionId,
  });
  expect(auction).toMatchObject({ ok: true, state: "AUCTION_COMPLETE" });

  const ranking = await execute("get_market_recommendations", {
    sessionId,
  });
  expect(ranking).toMatchObject({ ok: true, state: "MARKET_RANKED" });
  return sessionId;
}

describe("public WebMCP handler edge contracts", () => {
  beforeEach(() => {
    useDemoStore.getState().resetDemo();
  });

  it("echoes maximum_revenue while retaining the weighted_relevance bid fixture", async () => {
    const weightedIntent = await execute("create_intent_session", VALID_INTENT);
    const weightedSessionId = sessionIdFrom(weightedIntent);
    const weighted = await execute("run_simulated_ad_auction", {
      sessionId: weightedSessionId,
      auctionMode: "weighted_relevance",
    });

    const maximumIntent = await execute("create_intent_session", VALID_INTENT);
    const maximumSessionId = sessionIdFrom(maximumIntent);
    const maximum = await execute("run_simulated_ad_auction", {
      sessionId: maximumSessionId,
      auctionMode: "maximum_revenue",
    });

    expect(weighted).toMatchObject({ ok: true, data: { auctionMode: "weighted_relevance" } });
    expect(maximum).toMatchObject({ ok: true, data: { auctionMode: "maximum_revenue" } });
    const { auctionMode: weightedMode, ...weightedFixture } = auctionDataFrom(weighted);
    const { auctionMode: maximumMode, ...maximumFixture } = auctionDataFrom(maximum);
    expect(weightedMode).toBe("weighted_relevance");
    expect(maximumMode).toBe("maximum_revenue");
    expect(maximumFixture).toEqual(weightedFixture);
    expect(auctionDataFrom(maximum)).toEqual({
      ...auctionDataFrom(weighted),
      auctionMode: "maximum_revenue",
    });
  });

  it("preserves allowInferredSignals without synthesizing inferred signals", async () => {
    const result = await execute("create_intent_session", {
      ...VALID_INTENT,
      allowInferredSignals: true,
    });

    expect(result).toMatchObject({
      ok: true,
      data: {
        normalizedIntent: { allowInferredSignals: true },
        inferredSignals: [],
      },
    });
  });

  it("applies documented recommendation-policy defaults at the handler boundary", async () => {
    const sessionId = await createAndRank();
    const result = await execute("set_recommendation_policy", {
      sessionId,
      sponsorshipMode: "allow_labeled",
      allowInferredSignals: false,
      hardConstraintMode: "strict",
    });

    expect(result).toMatchObject({
      ok: true,
      state: "POLICY_UPDATED",
      data: {
        policy: { maximumSponsorWeight: 0.3, requireReasonCodes: true },
      },
    });
  });

  it("requires explicit staging confirmation without advancing state or version", async () => {
    const sessionId = await createAndRank();
    const policy = await execute("set_recommendation_policy", {
      sessionId,
      sponsorshipMode: "allow_labeled",
      allowInferredSignals: false,
      hardConstraintMode: "strict",
    });
    expect(policy).toMatchObject({ ok: true, state: "POLICY_UPDATED" });
    const comparison = await execute("compare_market_to_clean_room", { sessionId });
    expect(comparison).toMatchObject({ ok: true, state: "COMPARED" });

    const before = useDemoStore.getState();
    const result = await execute("stage_demo_selection", {
      sessionId,
      offerId: "kinoforge-studio",
      userConfirmed: false,
    });

    expect(result).toMatchObject({
      ok: false,
      state: before.state,
      stateVersion: before.stateVersion,
      error: { code: "CONFIRMATION_REQUIRED" },
    });
    expect(useDemoStore.getState()).toMatchObject({
      state: before.state,
      stateVersion: before.stateVersion,
    });
  });

  it("preserves stored data and state for documented later-state repeats", async () => {
    const sessionId = await createAndRank();
    const initialRanking = await execute("get_market_recommendations", { sessionId });
    expect(initialRanking).toMatchObject({ ok: true, state: "MARKET_RANKED" });
    const repeatedRanking = await execute("get_market_recommendations", { sessionId });
    expect(repeatedRanking).toEqual(initialRanking);

    const initialReceipt = await execute("inspect_recommendation_influence", {
      sessionId,
      offerId: "omnimotion-ultra",
    });
    expect(initialReceipt).toMatchObject({ ok: true, state: "AUDITED" });
    const policy = await execute("set_recommendation_policy", {
      sessionId,
      sponsorshipMode: "allow_labeled",
      allowInferredSignals: false,
      hardConstraintMode: "strict",
    });
    expect(policy).toMatchObject({ ok: true, state: "POLICY_UPDATED" });
    const initialComparison = await execute("compare_market_to_clean_room", { sessionId });
    expect(initialComparison).toMatchObject({ ok: true, state: "COMPARED" });

    const laterReceipt = await execute("inspect_recommendation_influence", {
      sessionId,
      offerId: "omnimotion-ultra",
    });
    expect(laterReceipt).toEqual({
      ...initialReceipt,
      state: "COMPARED",
      stateVersion: initialComparison.stateVersion,
    });

    const repeatedComparison = await execute("compare_market_to_clean_room", { sessionId });
    expect(repeatedComparison).toEqual(initialComparison);

    const initialStage = await execute("stage_demo_selection", {
      sessionId,
      offerId: "kinoforge-studio",
      userConfirmed: true,
    });
    expect(initialStage).toMatchObject({ ok: true, state: "SELECTION_STAGED" });
    const repeatedStage = await execute("stage_demo_selection", {
      sessionId,
      offerId: "omnimotion-ultra",
      userConfirmed: true,
    });
    expect(repeatedStage).toEqual(initialStage);
  });
});
