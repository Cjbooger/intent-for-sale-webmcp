import { describe, expect, it } from "vitest";
import { DEMO_OFFERS, DEFAULT_POLICY } from "../data/demoScenario";
import {
  compareRankings,
  createInfluenceReceipt,
  rankCleanRoom,
  rankMarket,
  runAuction,
} from "./engine";

describe("deterministic market engine", () => {
  it("normalizes bids against the highest bid and keeps zero bids organic", () => {
    const auction = runAuction();
    expect(auction.highestBidUsd).toBe(24);
    expect(auction.bids.map((bid) => [bid.offerId, bid.normalizedBidScore])).toEqual([
      ["kinoforge-studio", 0],
      ["omnimotion-ultra", 100],
      ["promptcloud-infinite", 62.5],
      ["localframe-oss", 0],
      ["renderrush-creator", 45.83],
    ]);
  });

  it("reproduces the corrected OmniMotion 84.6 receipt arithmetic", () => {
    const auction = runAuction();
    const market = rankMarket(auction);
    const clean = rankCleanRoom();
    const receipt = createInfluenceReceipt(
      "omnimotion-ultra",
      market,
      clean,
      {
        taskSummary: "Select an AI video-generation platform for client work",
        budgetMonthlyUsd: 80,
        mustHave: ["commercial usage rights"],
        niceToHave: [],
        allowInferredSignals: false,
      },
    );
    expect(receipt).toMatchObject({
      baseFitScore: 78,
      sponsorBidUsd: 24,
      normalizedBidScore: 100,
      userFitContribution: 54.6,
      commercialContribution: 30,
      marketScore: 84.6,
      marketRank: 1,
      cleanRoomRank: 5,
      simulatedPayoutUsd: 24,
    });
  });

  it("puts OmniMotion first commercially and KinoForge first in the clean room", () => {
    const market = rankMarket(runAuction());
    const clean = rankCleanRoom();
    expect(market.items[0]?.offerId).toBe("omnimotion-ultra");
    expect(clean.items[0]?.offerId).toBe("kinoforge-studio");
    expect(market.items.map((item) => item.offerId)).toEqual([
      "omnimotion-ultra",
      "promptcloud-infinite",
      "renderrush-creator",
      "kinoforge-studio",
      "localframe-oss",
    ]);
  });

  it("keeps clean-room comparison sponsor-free and reports revenue forgone", () => {
    const auction = runAuction();
    const market = rankMarket(auction, DEFAULT_POLICY);
    const clean = rankCleanRoom();
    const comparison = compareRankings(market, clean);
    expect(comparison.summary).toEqual({
      topChoiceChanged: true,
      commerciallyFavoredOffer: "omnimotion-ultra",
      cleanRoomTopOffer: "kinoforge-studio",
      simulatedRevenueForgoneUsd: 24,
    });
    expect(comparison.comparison.find((item) => item.offerId === "kinoforge-studio")).toMatchObject({
      marketRank: 4,
      cleanRoomRank: 1,
      marketScore: 64.4,
      cleanRoomScore: 92,
    });
  });

  it("does not mutate the historical market ranking when policy blocks sponsors", () => {
    const auction = runAuction();
    const market = rankMarket(auction);
    const blocked = rankMarket(auction, { ...DEFAULT_POLICY, sponsorshipMode: "block", maximumSponsorWeight: 0 });
    expect(market.immutable).toBe(true);
    expect(market.items[0]?.offerId).toBe("omnimotion-ultra");
    expect(blocked.items[0]?.offerId).toBe("kinoforge-studio");
    expect(market.items[0]?.marketScore).toBe(84.6);
  });

  it("has base-fit breakdowns that reconcile to the published fixture scores", () => {
    for (const offer of DEMO_OFFERS) {
      expect(Object.values(offer.fitBreakdown).reduce((sum, value) => sum + value, 0)).toBe(offer.baseFitScore);
    }
  });
});
