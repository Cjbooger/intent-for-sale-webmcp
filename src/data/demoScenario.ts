import type { DemoIntent, Offer, RecommendationPolicy } from "../domain/types";

export const DEMO_SESSION_ID = "ifs_demo_001";
export const DEMO_AUCTION_ID = "ifs_auction_001";
export const DEFAULT_SPONSOR_WEIGHT = 0.3;

export const DEFAULT_DEMO_INTENT: DemoIntent = {
  taskSummary: "Select an AI video-generation platform for client work",
  budgetMonthlyUsd: 80,
  mustHave: [
    "commercial usage rights",
    "1080p export",
    "consistent-character tools",
    "no watermark",
    "monthly cancellation",
  ],
  niceToHave: [],
  allowInferredSignals: false,
};

export const DEFAULT_POLICY: RecommendationPolicy = {
  sponsorshipMode: "allow_labeled",
  maximumSponsorWeight: DEFAULT_SPONSOR_WEIGHT,
  allowInferredSignals: false,
  hardConstraintMode: "warn",
  requireReasonCodes: true,
};

// The breakdown values are weighted contribution points (not raw percentages).
// They intentionally sum to each published base-fit score.
export const DEMO_OFFERS: Offer[] = [
  {
    offerId: "kinoforge-studio",
    displayName: "KinoForge Studio",
    advertiserId: "kinoforge",
    baseFitScore: 92,
    fitBreakdown: {
      featureMatch: 28,
      characterConsistency: 19,
      commercialTerms: 13,
      priceFit: 14,
      exportQuality: 9,
      cancellationTerms: 5,
      privacyTransparency: 4,
    },
    simulatedCpaUsd: 0,
    advertiserClaims: [],
    catalogNotes: "Best user fit, strong privacy, monthly cancellation",
  },
  {
    offerId: "omnimotion-ultra",
    displayName: "OmniMotion Ultra",
    advertiserId: "omnimotion",
    baseFitScore: 78,
    fitBreakdown: {
      featureMatch: 25,
      characterConsistency: 13,
      commercialTerms: 12,
      priceFit: 12,
      exportQuality: 8,
      cancellationTerms: 2,
      privacyTransparency: 6,
    },
    simulatedCpaUsd: 24,
    advertiserClaims: ["studio-grade output", "preferred by professional creators"],
    catalogNotes: "Strong marketing, weaker consistency, annual-plan pressure",
  },
  {
    offerId: "promptcloud-infinite",
    displayName: "PromptCloud Infinite",
    advertiserId: "promptcloud",
    baseFitScore: 84,
    fitBreakdown: {
      featureMatch: 27,
      characterConsistency: 16,
      commercialTerms: 11,
      priceFit: 13,
      exportQuality: 8,
      cancellationTerms: 4,
      privacyTransparency: 5,
    },
    simulatedCpaUsd: 15,
    advertiserClaims: ["unlimited ideation", "fast campaign iteration"],
    catalogNotes: "Good features, ambiguous credit overages",
  },
  {
    offerId: "localframe-oss",
    displayName: "LocalFrame OSS",
    advertiserId: "localframe",
    baseFitScore: 88,
    fitBreakdown: {
      featureMatch: 24,
      characterConsistency: 18,
      commercialTerms: 9,
      priceFit: 12,
      exportQuality: 8,
      cancellationTerms: 4,
      privacyTransparency: 13,
    },
    simulatedCpaUsd: 0,
    advertiserClaims: [],
    catalogNotes: "Private and flexible, but higher setup complexity",
  },
  {
    offerId: "renderrush-creator",
    displayName: "RenderRush Creator",
    advertiserId: "renderrush",
    baseFitScore: 81,
    fitBreakdown: {
      featureMatch: 26,
      characterConsistency: 15,
      commercialTerms: 12,
      priceFit: 13,
      exportQuality: 8,
      cancellationTerms: 4,
      privacyTransparency: 3,
    },
    simulatedCpaUsd: 11,
    advertiserClaims: ["same-day rendering", "built for launch-week crunch"],
    catalogNotes: "Fast rendering, weaker commercial terms",
  },
];

export const getOffer = (offerId: string) => DEMO_OFFERS.find((offer) => offer.offerId === offerId);
