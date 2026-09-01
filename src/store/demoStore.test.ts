import { beforeEach, describe, expect, it } from "vitest";
import { useDemoStore } from "./demoStore";

const store = () => useDemoStore.getState();

function completeToMarket() {
  store().createIntentSession();
  store().runSimulatedAdAuction();
  return store().getMarketRecommendations();
}

describe("demo store state machine", () => {
  beforeEach(() => {
    store().resetDemo();
  });

  it("guards out-of-order calls with a recoverable next tool", () => {
    const result = store().getMarketRecommendations();
    expect(result).toMatchObject({ ok: false, state: "EMPTY" });
    if (!result.ok) {
      expect(result.error.code).toBe("SESSION_NOT_FOUND");
      expect(result.error.allowedNextTools).toEqual(["create_intent_session"]);
    }

    store().createIntentSession();
    const beforeAuction = store().getMarketRecommendations();
    expect(beforeAuction).toMatchObject({ ok: false, state: "INTENT_READY" });
    if (!beforeAuction.ok) expect(beforeAuction.error.allowedNextTools).toEqual(["run_simulated_ad_auction"]);
  });

  it("runs the full flow through explicit confirmation", () => {
    expect(store().createIntentSession()).toMatchObject({ ok: true, state: "INTENT_READY" });
    expect(store().runSimulatedAdAuction()).toMatchObject({ ok: true, state: "AUCTION_COMPLETE" });
    expect(store().getMarketRecommendations()).toMatchObject({ ok: true, state: "MARKET_RANKED" });
    expect(store().inspectRecommendationInfluence({ offerId: "omnimotion-ultra" })).toMatchObject({ ok: true, state: "AUDITED" });
    expect(store().setRecommendationPolicy({
      sponsorshipMode: "block",
      maximumSponsorWeight: 0,
      allowInferredSignals: false,
      hardConstraintMode: "strict",
      requireReasonCodes: true,
    })).toMatchObject({ ok: true, state: "POLICY_UPDATED" });
    expect(store().compareMarketToCleanRoom()).toMatchObject({ ok: true, state: "COMPARED" });
    expect(store().stageDemoSelection({ offerId: "kinoforge-studio", userConfirmed: false })).toMatchObject({ ok: false, state: "COMPARED" });
    expect(store().stageDemoSelection({ offerId: "kinoforge-studio", userConfirmed: true })).toMatchObject({ ok: true, state: "SELECTION_STAGED" });
    expect(store().stagedSelection?.purchaseWillNotOccur).toBe(true);
    expect(store().stagedSelection?.confirmationSource).toBe("webmcp_caller");
  });

  it("preserves the historical market ranking across policy and comparison", () => {
    completeToMarket();
    const historicalScore = store().marketRanking?.items[0]?.marketScore;
    store().setRecommendationPolicy({
      sponsorshipMode: "block",
      maximumSponsorWeight: 0,
      allowInferredSignals: false,
      hardConstraintMode: "strict",
      requireReasonCodes: true,
    });
    store().compareMarketToCleanRoom();
    expect(store().marketRanking?.items[0]?.offerId).toBe("omnimotion-ultra");
    expect(store().marketRanking?.items[0]?.marketScore).toBe(historicalScore);
    expect(store().cleanRoomRanking?.items[0]?.offerId).toBe("kinoforge-studio");
  });

  it("rejects unknown offers, invalid policy, and unconfirmed selection", () => {
    completeToMarket();
    expect(store().inspectRecommendationInfluence({ offerId: "not-real" })).toMatchObject({ ok: false });
    expect(store().setRecommendationPolicy({
      sponsorshipMode: "block",
      maximumSponsorWeight: 1,
      allowInferredSignals: false,
      hardConstraintMode: "strict",
      requireReasonCodes: true,
    })).toMatchObject({ ok: false });
    store().inspectRecommendationInfluence({ offerId: "omnimotion-ultra" });
    store().setRecommendationPolicy({
      sponsorshipMode: "block",
      maximumSponsorWeight: 0,
      allowInferredSignals: false,
      hardConstraintMode: "strict",
      requireReasonCodes: true,
    });
    store().compareMarketToCleanRoom();
    const result = store().stageDemoSelection({ offerId: "kinoforge-studio", userConfirmed: false });
    expect(result).toMatchObject({ ok: false });
    if (!result.ok) expect(result.error.code).toBe("CONFIRMATION_REQUIRED");
  });

  it("reset clears session state and returns to EMPTY", () => {
    completeToMarket();
    expect(store().resetDemo()).toMatchObject({ ok: true, state: "EMPTY" });
    expect(store()).toMatchObject({ state: "EMPTY", sessionId: null, auction: null, marketRanking: null, comparison: null });
  });

  it("rejects malformed direct input instead of throwing", () => {
    const malformed = store().createIntentSession({
      taskSummary: "Select a video platform for client work",
      budgetMonthlyUsd: 80,
      mustHave: ["commercial usage rights"],
      niceToHave: "not-an-array",
    } as never);
    expect(malformed).toMatchObject({ ok: false, state: "EMPTY" });
    if (!malformed.ok) expect(malformed.error.code).toBe("INVALID_INPUT");
  });

  it("does not move backward when a receipt is inspected after comparison", () => {
    completeToMarket();
    store().inspectRecommendationInfluence({ offerId: "omnimotion-ultra" });
    store().setRecommendationPolicy({
      sponsorshipMode: "block",
      maximumSponsorWeight: 0,
      allowInferredSignals: false,
      hardConstraintMode: "strict",
      requireReasonCodes: true,
    });
    store().compareMarketToCleanRoom();
    const version = store().stateVersion;
    const result = store().inspectRecommendationInfluence({ offerId: "omnimotion-ultra" });
    expect(result).toMatchObject({ ok: true, state: "COMPARED", stateVersion: version });
    expect(store().state).toBe("COMPARED");
  });
});
