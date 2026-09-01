export type DemoState =
  | "EMPTY"
  | "INTENT_READY"
  | "AUCTION_COMPLETE"
  | "MARKET_RANKED"
  | "AUDITED"
  | "POLICY_UPDATED"
  | "COMPARED"
  | "SELECTION_STAGED";

export type SponsorshipMode = "allow_labeled" | "deprioritize" | "block";
export type HardConstraintMode = "strict" | "warn";

export type RecommendationPolicy = {
  sponsorshipMode: SponsorshipMode;
  maximumSponsorWeight: number;
  allowInferredSignals: boolean;
  hardConstraintMode: HardConstraintMode;
  requireReasonCodes: boolean;
};

export type DemoIntent = {
  taskSummary: string;
  budgetMonthlyUsd: number;
  mustHave: string[];
  niceToHave: string[];
  allowInferredSignals: boolean;
};

export type FitBreakdown = {
  featureMatch: number;
  characterConsistency: number;
  commercialTerms: number;
  priceFit: number;
  exportQuality: number;
  cancellationTerms: number;
  privacyTransparency: number;
};

export type Offer = {
  offerId: string;
  displayName: string;
  advertiserId: string;
  baseFitScore: number;
  fitBreakdown: FitBreakdown;
  simulatedCpaUsd: number;
  advertiserClaims: string[];
  catalogNotes: string;
};

export type AuctionBid = {
  advertiserId: string;
  offerId: string;
  simulatedCpaUsd: number;
  signalMatchMultiplier: number;
  normalizedBidScore: number;
};

export type AuctionResult = {
  auctionId: string;
  auctionMode: "weighted_relevance" | "maximum_revenue";
  bids: AuctionBid[];
  highestBidUsd: number;
  totalAdvertiserValueUsd: number;
  commercialPressureScore: number;
  disclosure: string;
};

export type RankingItem = {
  rank: number;
  offerId: string;
  displayName: string;
  baseFitScore: number;
  normalizedBidScore: number;
  sponsorWeight: number;
  userFitContribution: number;
  commercialContribution: number;
  /** Display alias retained for recommendation-card consumers. */
  sponsorBoost: number;
  constraintPenalty: number;
  marketScore: number;
  sponsorStatus: "paid" | "organic";
  simulatedCpaUsd: number;
  reasonCodes: string[];
  advertiserClaims: string[];
  disclosures: {
    commerciallyInfluenced: boolean;
    claimsAreSynthetic: boolean;
    purchaseWillNotOccur: boolean;
  };
};

export type MarketRanking = {
  sponsorWeight: number;
  items: RankingItem[];
  generatedFromAuctionId: string;
  immutable: true;
};

export type CleanRoomItem = {
  rank: number;
  offerId: string;
  cleanRoomScore: number;
  strictConstraintPenalty: number;
};

export type CleanRoomRanking = {
  items: CleanRoomItem[];
  sponsorWeight: 0;
  inferredSignalsUsed: false;
};

export type InfluenceReceipt = {
  offerId: string;
  displayName: string;
  baseFitScore: number;
  fitBreakdown: FitBreakdown;
  sponsorBidUsd: number;
  normalizedBidScore: number;
  sponsorWeight: number;
  userFitContribution: number;
  commercialContribution: number;
  constraintPenalty: number;
  marketScore: number;
  marketRank: number;
  cleanRoomScore: number;
  cleanRoomRank: number;
  rankDelta: number;
  explicitConstraints: string[];
  inferredSignals: string[];
  advertiserClaims: string[];
  constraintConflicts: string[];
  simulatedPayoutUsd: number;
  summary: string;
};

export type MarketComparisonItem = {
  offerId: string;
  displayName: string;
  marketRank: number;
  cleanRoomRank: number;
  rankDelta: number;
  marketScore: number;
  cleanRoomScore: number;
  whyItMoved: string[];
};

export type MarketComparison = {
  comparison: MarketComparisonItem[];
  summary: {
    topChoiceChanged: boolean;
    commerciallyFavoredOffer: string;
    cleanRoomTopOffer: string;
    simulatedRevenueForgoneUsd: number;
  };
};

export type StagedSelection = {
  offerId: string;
  displayName: string;
  userConfirmed: true;
  confirmationSource: "manual_ui" | "webmcp_caller";
  purchaseWillNotOccur: true;
};

export type ActivityEvent = {
  id: string;
  toolName: string;
  inputSummary: string;
  resultSummary: string;
  fromState: DemoState;
  toState: DemoState;
  stateVersion: number;
  timestamp: string;
};

export type ToolSuccess<T> = {
  ok: true;
  state: DemoState;
  stateVersion: number;
  data: T;
};

export type ToolErrorCode =
  | "INVALID_INPUT"
  | "INVALID_STATE"
  | "SESSION_NOT_FOUND"
  | "AUCTION_NOT_RUN"
  | "OFFER_NOT_FOUND"
  | "CONFIRMATION_REQUIRED"
  | "EXECUTION_ABORTED";

export type ToolFailure = {
  ok: false;
  state: DemoState;
  stateVersion: number;
  error: {
    code: ToolErrorCode;
    message: string;
    recoverable: boolean;
    allowedNextTools?: string[];
  };
};

export type ToolResult<T> = ToolSuccess<T> | ToolFailure;

export type CreateIntentInput = Partial<DemoIntent> &
  Pick<DemoIntent, "taskSummary" | "budgetMonthlyUsd" | "mustHave">;

export type PolicyInput = Omit<RecommendationPolicy, never>;
