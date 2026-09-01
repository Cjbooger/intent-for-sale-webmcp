import { create } from "zustand";
import {
  DEMO_OFFERS,
  DEMO_SESSION_ID,
  DEFAULT_DEMO_INTENT,
  DEFAULT_POLICY,
} from "../data/demoScenario";
import {
  compareRankings,
  createInfluenceReceipt,
  rankCleanRoom,
  rankMarket,
  runAuction,
} from "../domain/engine";
import type {
  ActivityEvent,
  AuctionResult,
  CleanRoomRanking,
  CreateIntentInput,
  DemoIntent,
  DemoState,
  InfluenceReceipt,
  MarketComparison,
  MarketRanking,
  PolicyInput,
  RecommendationPolicy,
  StagedSelection,
  ToolErrorCode,
  ToolResult,
} from "../domain/types";

type SessionSnapshot = {
  sessionId: string | null;
  intent: DemoIntent | null;
  policy: RecommendationPolicy;
  auction: AuctionResult | null;
  marketRanking: MarketRanking | null;
  cleanRoomRanking: CleanRoomRanking | null;
  influenceReceipt: InfluenceReceipt | null;
  comparison: MarketComparison | null;
  stagedSelection: StagedSelection | null;
};

export type DemoStoreState = SessionSnapshot & {
  state: DemoState;
  stateVersion: number;
  activity: ActivityEvent[];
  resetDemo: () => ToolResult<{ reset: true }>;
  createIntentSession: (input?: CreateIntentInput) => ToolResult<{
    sessionId: string;
    normalizedIntent: DemoIntent;
    inferredSignals: string[];
  }>;
  runSimulatedAdAuction: (input?: {
    sessionId?: string;
    auctionMode?: AuctionResult["auctionMode"];
  }) => ToolResult<AuctionResult>;
  getMarketRecommendations: (input?: {
    sessionId?: string;
    limit?: number;
  }) => ToolResult<{ recommendations: MarketRanking["items"]; disclosures: string[] }>;
  inspectRecommendationInfluence: (input: {
    sessionId?: string;
    offerId: string;
  }) => ToolResult<InfluenceReceipt>;
  setRecommendationPolicy: (input: {
    sessionId?: string;
    policy?: Partial<PolicyInput>;
  } & Partial<PolicyInput>) => ToolResult<{ policy: RecommendationPolicy }>;
  compareMarketToCleanRoom: (input?: { sessionId?: string }) => ToolResult<MarketComparison>;
  stageDemoSelection: (input: {
    sessionId?: string;
    offerId: string;
    userConfirmed: boolean;
    confirmationSource?: StagedSelection["confirmationSource"];
  }) => ToolResult<StagedSelection>;
};

const EMPTY_SNAPSHOT: SessionSnapshot = {
  sessionId: null,
  intent: null,
  policy: { ...DEFAULT_POLICY },
  auction: null,
  marketRanking: null,
  cleanRoomRanking: null,
  influenceReceipt: null,
  comparison: null,
  stagedSelection: null,
};

const success = <T>(state: DemoStoreState, data: T): ToolResult<T> => ({
  ok: true,
  state: state.state,
  stateVersion: state.stateVersion,
  data,
});

const failure = <T>(
  state: DemoStoreState,
  code: ToolErrorCode,
  message: string,
  allowedNextTools?: string[],
): ToolResult<T> => ({
  ok: false,
  state: state.state,
  stateVersion: state.stateVersion,
  error: { code, message, recoverable: true, ...(allowedNextTools ? { allowedNextTools } : {}) },
});

const now = () => new Date().toISOString();

function addActivity(
  activity: ActivityEvent[],
  toolName: string,
  inputSummary: string,
  resultSummary: string,
  fromState: DemoState,
  toState: DemoState,
  stateVersion: number,
): ActivityEvent[] {
  return [
    ...activity,
    {
      id: `${stateVersion}-${toolName}`,
      toolName,
      inputSummary,
      resultSummary,
      fromState,
      toState,
      stateVersion,
      timestamp: now(),
    },
  ];
}

function validString(value: unknown, min: number, max: number): value is string {
  return typeof value === "string" && value.trim().length >= min && value.length <= max;
}

function validIntent(input: CreateIntentInput): input is CreateIntentInput & Required<Pick<DemoIntent, "niceToHave" | "allowInferredSignals">> {
  return (
    validString(input.taskSummary, 10, 500) &&
    typeof input.budgetMonthlyUsd === "number" &&
    Number.isFinite(input.budgetMonthlyUsd) &&
    input.budgetMonthlyUsd >= 0 &&
    input.budgetMonthlyUsd <= 10_000 &&
    Array.isArray(input.mustHave) &&
    input.mustHave.length >= 1 &&
    input.mustHave.length <= 10 &&
    input.mustHave.every((value) => validString(value, 1, 120)) &&
    Array.isArray(input.niceToHave) &&
    input.niceToHave.length <= 10 &&
    input.niceToHave.every((value) => validString(value, 1, 120)) &&
    typeof input.allowInferredSignals === "boolean"
  );
}

function withSession<T>(
  state: DemoStoreState,
  requestedSessionId: string | undefined,
): ToolResult<never> | null {
  if (!state.sessionId || (requestedSessionId && requestedSessionId !== state.sessionId)) {
    return failure(state, "SESSION_NOT_FOUND", "No matching intent session exists. Create an intent session first.", [
      "create_intent_session",
    ]);
  }
  return null;
}

export const useDemoStore = create<DemoStoreState>((set, get) => ({
  ...EMPTY_SNAPSHOT,
  state: "EMPTY",
  stateVersion: 0,
  activity: [],

  resetDemo: () => {
    const current = get();
    const nextVersion = current.stateVersion + 1;
    set({ ...EMPTY_SNAPSHOT, state: "EMPTY", stateVersion: nextVersion, activity: [] });
    return success({ ...current, ...EMPTY_SNAPSHOT, state: "EMPTY", stateVersion: nextVersion, activity: [] }, { reset: true });
  },

  createIntentSession: (input) => {
    const current = get();
    if (input !== undefined && (typeof input !== "object" || input === null)) {
      return failure(current, "INVALID_INPUT", "Intent input must be an object.");
    }
    const normalized: DemoIntent = {
      ...DEFAULT_DEMO_INTENT,
      ...(input ?? {}),
      niceToHave: input?.niceToHave ?? [],
      allowInferredSignals: input?.allowInferredSignals ?? false,
    };
    if (!validIntent(normalized)) {
      return failure(current, "INVALID_INPUT", "Intent must include a 10–500 character task, budget 0–10000, and 1–10 must-have requirements.");
    }
    const nextVersion = 1;
    const nextState: DemoStoreState = {
      ...current,
      ...EMPTY_SNAPSHOT,
      sessionId: DEMO_SESSION_ID,
      intent: { ...normalized, mustHave: [...normalized.mustHave], niceToHave: [...normalized.niceToHave] },
      state: "INTENT_READY",
      stateVersion: nextVersion,
      activity: addActivity([], "create_intent_session", normalized.taskSummary, "Intent manifest created.", current.state, "INTENT_READY", nextVersion),
    };
    set(nextState);
    return success(nextState, { sessionId: DEMO_SESSION_ID, normalizedIntent: nextState.intent!, inferredSignals: [] });
  },

  runSimulatedAdAuction: (input = {}) => {
    const current = get();
    const sessionError = withSession(current, input.sessionId);
    if (sessionError) return sessionError as ToolResult<AuctionResult>;
    if (current.state !== "INTENT_READY") {
      return failure(current, "INVALID_STATE", "Create a new intent session before running another auction.", ["create_intent_session"]);
    }
    const auction = runAuction(DEMO_OFFERS, input.auctionMode ?? "weighted_relevance");
    const nextVersion = current.stateVersion + 1;
    const nextState = {
      ...current,
      auction,
      state: "AUCTION_COMPLETE" as const,
      stateVersion: nextVersion,
      activity: addActivity(current.activity, "run_simulated_ad_auction", "Run deterministic synthetic auction.", `Auction complete; highest bid $${auction.highestBidUsd}.`, current.state, "AUCTION_COMPLETE", nextVersion),
    };
    set(nextState);
    return success(nextState, auction);
  },

  getMarketRecommendations: (input = {}) => {
    const current = get();
    const sessionError = withSession(current, input.sessionId);
    if (sessionError) return sessionError as ToolResult<{ recommendations: MarketRanking["items"]; disclosures: string[] }>;
    if (!current.auction || !["AUCTION_COMPLETE", "MARKET_RANKED", "AUDITED", "POLICY_UPDATED", "COMPARED", "SELECTION_STAGED"].includes(current.state)) {
      return failure(current, "AUCTION_NOT_RUN", "Run the simulated auction before requesting market recommendations.", ["run_simulated_ad_auction"]);
    }
    const ranking = current.marketRanking ?? rankMarket(current.auction, DEFAULT_POLICY, DEMO_OFFERS);
    const limit = input.limit ?? 5;
    if (!Number.isInteger(limit) || limit < 1 || limit > 5) {
      return failure(current, "INVALID_INPUT", "Recommendation limit must be an integer from 1 to 5.");
    }
    if (current.marketRanking) {
      return success(current, { recommendations: ranking.items.slice(0, limit), disclosures: ["Commercial weighting is applied.", "Advertiser claims are synthetic."] });
    }
    const nextVersion = current.stateVersion + 1;
    const nextState = {
      ...current,
      marketRanking: ranking,
      state: "MARKET_RANKED" as const,
      stateVersion: nextVersion,
      activity: addActivity(current.activity, "get_market_recommendations", `Limit ${limit}.`, "Commercial ranking returned; sponsor influence disclosed.", current.state, "MARKET_RANKED", nextVersion),
    };
    set(nextState);
    return success(nextState, { recommendations: ranking.items.slice(0, limit), disclosures: ["Commercial weighting is applied.", "Advertiser claims are synthetic."] });
  },

  inspectRecommendationInfluence: (input) => {
    const current = get();
    const sessionError = withSession(current, input?.sessionId);
    if (sessionError) return sessionError as ToolResult<InfluenceReceipt>;
    if (!validString(input?.offerId, 1, 120)) {
      return failure(current, "INVALID_INPUT", "A valid offerId is required.");
    }
    if (!current.marketRanking || !current.intent || !["MARKET_RANKED", "AUDITED", "POLICY_UPDATED", "COMPARED", "SELECTION_STAGED"].includes(current.state)) {
      return failure(current, "INVALID_STATE", "Request market recommendations before inspecting influence.", ["get_market_recommendations"]);
    }
    const cleanRoom = current.cleanRoomRanking ?? rankCleanRoom(DEMO_OFFERS);
    const receipt = createInfluenceReceipt(input.offerId, current.marketRanking, cleanRoom, current.intent, DEMO_OFFERS);
    if (!receipt) return failure(current, "OFFER_NOT_FOUND", `No offer exists with ID '${input.offerId}'.`);
    const shouldAdvance = current.state === "MARKET_RANKED";
    const nextVersion = shouldAdvance ? current.stateVersion + 1 : current.stateVersion;
    const nextState = shouldAdvance ? {
      ...current,
      cleanRoomRanking: cleanRoom,
      influenceReceipt: receipt,
      state: "AUDITED" as const,
      stateVersion: nextVersion,
      activity: addActivity(current.activity, "inspect_recommendation_influence", receipt.displayName, "Influence Receipt generated.", current.state, "AUDITED", nextVersion),
    } : current;
    if (shouldAdvance) set(nextState);
    return success(nextState, receipt);
  },

  setRecommendationPolicy: (input) => {
    const current = get();
    const sessionError = withSession(current, input?.sessionId);
    if (sessionError) return sessionError as ToolResult<{ policy: RecommendationPolicy }>;
    if (!current.marketRanking || !["MARKET_RANKED", "AUDITED", "POLICY_UPDATED", "COMPARED"].includes(current.state)) {
      return failure(current, "INVALID_STATE", "Rank the market before changing recommendation policy.", ["get_market_recommendations"]);
    }
    const policy: Partial<RecommendationPolicy> = {
      ...current.policy,
      ...(input?.policy ?? {}),
      ...(input?.sponsorshipMode !== undefined ? { sponsorshipMode: input.sponsorshipMode } : {}),
      ...(input?.maximumSponsorWeight !== undefined ? { maximumSponsorWeight: input.maximumSponsorWeight } : {}),
      ...(input?.allowInferredSignals !== undefined ? { allowInferredSignals: input.allowInferredSignals } : {}),
      ...(input?.hardConstraintMode !== undefined ? { hardConstraintMode: input.hardConstraintMode } : {}),
      ...(input?.requireReasonCodes !== undefined ? { requireReasonCodes: input.requireReasonCodes } : {}),
    };
    if (
      !policy ||
      !policy.sponsorshipMode ||
      !["allow_labeled", "deprioritize", "block"].includes(policy.sponsorshipMode) ||
      typeof policy.maximumSponsorWeight !== "number" ||
      policy.maximumSponsorWeight < 0 ||
      policy.maximumSponsorWeight > 0.4 ||
      typeof policy.allowInferredSignals !== "boolean" ||
      !policy.hardConstraintMode ||
      !["strict", "warn"].includes(policy.hardConstraintMode) ||
      typeof policy.requireReasonCodes !== "boolean"
    ) {
      return failure(current, "INVALID_INPUT", "Policy fields are invalid; sponsor weight must be 0–0.4.");
    }
    const nextVersion = current.stateVersion + 1;
    const nextPolicy = policy as RecommendationPolicy;
    const nextState: DemoStoreState = {
      ...current,
      policy: { ...nextPolicy },
      state: "POLICY_UPDATED" as const,
      stateVersion: nextVersion,
      activity: addActivity(current.activity, "set_recommendation_policy", policy.sponsorshipMode, "User policy updated.", current.state, "POLICY_UPDATED", nextVersion),
    };
    set(nextState);
    return success(nextState, { policy: nextState.policy });
  },

  compareMarketToCleanRoom: (input = {}) => {
    const current = get();
    const sessionError = withSession(current, input.sessionId);
    if (sessionError) return sessionError as ToolResult<MarketComparison>;
    if (!current.marketRanking || !["POLICY_UPDATED", "COMPARED", "SELECTION_STAGED"].includes(current.state)) {
      return failure(current, "INVALID_STATE", "Update the recommendation policy before comparing to the clean room.", ["set_recommendation_policy"]);
    }
    const cleanRoom = current.cleanRoomRanking ?? rankCleanRoom(DEMO_OFFERS);
    const comparison = compareRankings(current.marketRanking, cleanRoom, DEMO_OFFERS);
    if (current.comparison) return success(current, comparison);
    const nextVersion = current.stateVersion + 1;
    const nextState = {
      ...current,
      cleanRoomRanking: cleanRoom,
      comparison,
      state: "COMPARED" as const,
      stateVersion: nextVersion,
      activity: addActivity(current.activity, "compare_market_to_clean_room", "Remove sponsor influence and inferred signals.", `Top choice changed: ${comparison.summary.topChoiceChanged}.`, current.state, "COMPARED", nextVersion),
    };
    set(nextState);
    return success(nextState, comparison);
  },

  stageDemoSelection: (input) => {
    const current = get();
    const sessionError = withSession(current, input?.sessionId);
    if (sessionError) return sessionError as ToolResult<StagedSelection>;
    if (input?.userConfirmed !== true) return failure(current, "CONFIRMATION_REQUIRED", "An explicit caller declaration of userConfirmed: true is required. No purchase will occur.");
    if (!current.comparison || !["COMPARED", "SELECTION_STAGED"].includes(current.state)) {
      return failure(current, "INVALID_STATE", "Compare the market to the clean room before staging a selection.", ["compare_market_to_clean_room"]);
    }
    if (!validString(input?.offerId, 1, 120)) {
      return failure(current, "INVALID_INPUT", "A valid offerId is required.");
    }
    const offer = DEMO_OFFERS.find((candidate) => candidate.offerId === input.offerId);
    if (!offer) return failure(current, "OFFER_NOT_FOUND", `No offer exists with ID '${input.offerId}'.`);
    const selection: StagedSelection = {
      offerId: offer.offerId,
      displayName: offer.displayName,
      userConfirmed: true,
      confirmationSource: input.confirmationSource ?? "webmcp_caller",
      purchaseWillNotOccur: true,
    };
    if (current.stagedSelection) return success(current, current.stagedSelection);
    const nextVersion = current.stateVersion + 1;
    const nextState = {
      ...current,
      stagedSelection: selection,
      state: "SELECTION_STAGED" as const,
      stateVersion: nextVersion,
      activity: addActivity(current.activity, "stage_demo_selection", offer.displayName, "Selection staged; no purchase occurred.", current.state, "SELECTION_STAGED", nextVersion),
    };
    set(nextState);
    return success(nextState, selection);
  },
}));

export const getDemoState = (): DemoStoreState => useDemoStore.getState();
