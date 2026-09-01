import {
  DEMO_AUCTION_ID,
  DEMO_OFFERS,
  DEFAULT_POLICY,
  DEFAULT_SPONSOR_WEIGHT,
} from "../data/demoScenario";
import type {
  AuctionResult,
  CleanRoomRanking,
  DemoIntent,
  InfluenceReceipt,
  MarketComparison,
  MarketRanking,
  Offer,
  RecommendationPolicy,
} from "./types";

export const round2 = (value: number): number => Math.round((value + Number.EPSILON) * 100) / 100;

export function calculateBaseFitScore(offer: Offer): number {
  const breakdownTotal = Object.values(offer.fitBreakdown).reduce((sum, value) => sum + value, 0);
  return breakdownTotal === offer.baseFitScore ? offer.baseFitScore : round2(breakdownTotal);
}

export function effectiveSponsorWeight(policy: RecommendationPolicy): number {
  if (policy.sponsorshipMode === "block") return 0;
  if (policy.sponsorshipMode === "deprioritize") return round2(policy.maximumSponsorWeight / 2);
  return policy.maximumSponsorWeight;
}

export function runAuction(
  offers: readonly Offer[] = DEMO_OFFERS,
  auctionMode: AuctionResult["auctionMode"] = "weighted_relevance",
): AuctionResult {
  const highestBidUsd = Math.max(...offers.map((offer) => offer.simulatedCpaUsd), 0);
  const bids = offers.map((offer) => ({
    advertiserId: offer.advertiserId,
    offerId: offer.offerId,
    simulatedCpaUsd: offer.simulatedCpaUsd,
    signalMatchMultiplier: 1,
    normalizedBidScore:
      highestBidUsd === 0 ? 0 : round2((offer.simulatedCpaUsd / highestBidUsd) * 100),
  }));
  const totalAdvertiserValueUsd = round2(
    offers.reduce((sum, offer) => sum + offer.simulatedCpaUsd, 0),
  );
  const commercialPressureScore = round2(
    bids.reduce((sum, bid) => sum + bid.normalizedBidScore, 0) / Math.max(bids.length, 1),
  );

  return {
    auctionId: DEMO_AUCTION_ID,
    auctionMode,
    bids,
    highestBidUsd,
    totalAdvertiserValueUsd,
    commercialPressureScore,
    disclosure: "Synthetic local auction only. No network request, advertiser, purchase, or payment occurred.",
  };
}

export function rankMarket(
  auction: AuctionResult,
  policy: RecommendationPolicy = DEFAULT_POLICY,
  offers: readonly Offer[] = DEMO_OFFERS,
): MarketRanking {
  const sponsorWeight = effectiveSponsorWeight(policy);
  const bidByOffer = new Map(auction.bids.map((bid) => [bid.offerId, bid]));
  const items = offers
    .map((offer) => {
      const bid = bidByOffer.get(offer.offerId);
      const normalizedBidScore = bid?.normalizedBidScore ?? 0;
      const userFitContribution = round2(offer.baseFitScore * (1 - sponsorWeight));
      const commercialContribution = round2(normalizedBidScore * sponsorWeight);
      const constraintPenalty = 0;
      const marketScore = round2(userFitContribution + commercialContribution - constraintPenalty);
      const paid = offer.simulatedCpaUsd > 0;
      const sponsorStatus: "paid" | "organic" = paid ? "paid" : "organic";
      return {
        rank: 0,
        offerId: offer.offerId,
        displayName: offer.displayName,
        baseFitScore: offer.baseFitScore,
        normalizedBidScore,
        sponsorWeight,
        userFitContribution,
        commercialContribution,
        sponsorBoost: commercialContribution,
        constraintPenalty,
        marketScore,
        sponsorStatus,
        simulatedCpaUsd: offer.simulatedCpaUsd,
        reasonCodes: [
          ...(sponsorWeight > 0 && paid ? ["SPONSOR_WEIGHT_APPLIED"] : []),
          "MEETS_CORE_REQUIREMENTS",
          ...(paid && normalizedBidScore === 100 ? ["HIGH_ADVERTISER_BID"] : []),
        ],
        advertiserClaims: [...offer.advertiserClaims],
        disclosures: {
          commerciallyInfluenced: sponsorWeight > 0,
          claimsAreSynthetic: true,
          purchaseWillNotOccur: true,
        },
      };
    })
    .sort((a, b) => b.marketScore - a.marketScore || a.offerId.localeCompare(b.offerId))
    .map((item, index) => ({ ...item, rank: index + 1 }));

  return { sponsorWeight, items, generatedFromAuctionId: auction.auctionId, immutable: true };
}

export function rankCleanRoom(
  offers: readonly Offer[] = DEMO_OFFERS,
): CleanRoomRanking {
  const items = offers
    .map((offer) => ({
      rank: 0,
      offerId: offer.offerId,
      cleanRoomScore: round2(offer.baseFitScore),
      strictConstraintPenalty: 0,
    }))
    .sort((a, b) => b.cleanRoomScore - a.cleanRoomScore || a.offerId.localeCompare(b.offerId))
    .map((item, index) => ({ ...item, rank: index + 1 }));
  return { items, sponsorWeight: 0, inferredSignalsUsed: false };
}

export function compareRankings(
  market: MarketRanking,
  cleanRoom: CleanRoomRanking,
  offers: readonly Offer[] = DEMO_OFFERS,
): MarketComparison {
  const cleanByOffer = new Map(cleanRoom.items.map((item) => [item.offerId, item]));
  const offerById = new Map(offers.map((offer) => [offer.offerId, offer]));
  const comparison = market.items.map((marketItem) => {
    const cleanItem = cleanByOffer.get(marketItem.offerId);
    const offer = offerById.get(marketItem.offerId);
    const cleanRoomRank = cleanItem?.rank ?? marketItem.rank;
    const rankDelta = cleanRoomRank - marketItem.rank;
    const whyItMoved =
      rankDelta === 0
        ? ["NO_RANK_CHANGE"]
        : marketItem.simulatedCpaUsd > 0
          ? ["SPONSOR_WEIGHT_REMOVED", "NO_ADVERTISER_CLAIMS"]
          : ["NO_SPONSOR_BOOST", "EXPLICIT_FIT_RESTORED"];
    return {
      offerId: marketItem.offerId,
      displayName: offer?.displayName ?? marketItem.displayName,
      marketRank: marketItem.rank,
      cleanRoomRank,
      rankDelta,
      marketScore: marketItem.marketScore,
      cleanRoomScore: cleanItem?.cleanRoomScore ?? marketItem.baseFitScore,
      whyItMoved,
    };
  });
  const marketTop = market.items[0];
  const cleanTop = cleanRoom.items[0];
  return {
    comparison,
    summary: {
      topChoiceChanged: marketTop?.offerId !== cleanTop?.offerId,
      commerciallyFavoredOffer: marketTop?.offerId ?? "",
      cleanRoomTopOffer: cleanTop?.offerId ?? "",
      simulatedRevenueForgoneUsd: round2(
        (offers.find((offer) => offer.offerId === marketTop?.offerId)?.simulatedCpaUsd ?? 0) -
          (offers.find((offer) => offer.offerId === cleanTop?.offerId)?.simulatedCpaUsd ?? 0),
      ),
    },
  };
}

export function createInfluenceReceipt(
  offerId: string,
  market: MarketRanking,
  cleanRoom: CleanRoomRanking,
  intent: DemoIntent,
  offers: readonly Offer[] = DEMO_OFFERS,
): InfluenceReceipt | undefined {
  const offer = offers.find((candidate) => candidate.offerId === offerId);
  const marketItem = market.items.find((item) => item.offerId === offerId);
  const cleanItem = cleanRoom.items.find((item) => item.offerId === offerId);
  if (!offer || !marketItem || !cleanItem) return undefined;
  const rankDelta = cleanItem.rank - marketItem.rank;
  return {
    offerId,
    displayName: offer.displayName,
    baseFitScore: offer.baseFitScore,
    fitBreakdown: { ...offer.fitBreakdown },
    sponsorBidUsd: offer.simulatedCpaUsd,
    normalizedBidScore: marketItem.normalizedBidScore,
    sponsorWeight: marketItem.sponsorWeight,
    userFitContribution: marketItem.userFitContribution,
    commercialContribution: marketItem.commercialContribution,
    constraintPenalty: marketItem.constraintPenalty,
    marketScore: marketItem.marketScore,
    marketRank: marketItem.rank,
    cleanRoomScore: cleanItem.cleanRoomScore,
    cleanRoomRank: cleanItem.rank,
    rankDelta,
    explicitConstraints: [...intent.mustHave],
    inferredSignals: [],
    advertiserClaims: [...offer.advertiserClaims],
    constraintConflicts: [],
    simulatedPayoutUsd: offer.simulatedCpaUsd,
    summary:
      rankDelta > 0
        ? `${offer.displayName} moves down ${rankDelta} rank${rankDelta === 1 ? "" : "s"} when sponsor influence is removed.`
        : `${offer.displayName} is not lifted by sponsor influence in this comparison.`,
  };
}

export const DEFAULT_ENGINE_CONSTANTS = {
  sponsorWeight: DEFAULT_SPONSOR_WEIGHT,
  strictConstraintPenalty: 0,
} as const;
