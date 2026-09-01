import { useDemoStore } from "../store/demoStore";
import {
  failure,
  invalidInputMessage,
  isAbortError,
  success,
  type ToolErrorCode,
} from "./errors";
import {
  inputValidators,
  type CompareMarketToCleanRoomInput,
  type CreateIntentSessionInput,
  type GetMarketRecommendationsInput,
  type InspectRecommendationInfluenceInput,
  type RunSimulatedAdAuctionInput,
  type SetRecommendationPolicyInput,
  type StageDemoSelectionInput,
} from "./schemas";
import { DEMO_STATES, type DemoState, type ToolName, type ToolResult } from "./types";

type ToolInput =
  | CreateIntentSessionInput
  | RunSimulatedAdAuctionInput
  | GetMarketRecommendationsInput
  | InspectRecommendationInfluenceInput
  | SetRecommendationPolicyInput
  | CompareMarketToCleanRoomInput
  | StageDemoSelectionInput;

type StoreAction = (input: unknown) => unknown | Promise<unknown>;
type StoreSnapshot = Record<string, unknown>;
const fallbackExecutionSignal = new AbortController().signal;

/**
 * Action names are kept here rather than inside React components. The first
 * entry in each list is the canonical store API; aliases make the boundary
 * tolerant of a small naming change while the vertical slice is assembled.
 */
const ACTION_NAMES: Record<ToolName, readonly string[]> = {
  create_intent_session: ["createIntentSession", "createSession"],
  run_simulated_ad_auction: ["runSimulatedAdAuction", "runAuction"],
  get_market_recommendations: ["getMarketRecommendations", "getRecommendations"],
  inspect_recommendation_influence: [
    "inspectRecommendationInfluence",
    "inspectInfluence",
  ],
  set_recommendation_policy: ["setRecommendationPolicy", "setPolicy"],
  compare_market_to_clean_room: [
    "compareMarketToCleanRoom",
    "compareCleanRoom",
  ],
  stage_demo_selection: ["stageDemoSelection", "stageSelection"],
};

const NEXT_TOOLS: Partial<Record<DemoState, readonly ToolName[]>> = {
  EMPTY: ["create_intent_session"],
  INTENT_READY: ["run_simulated_ad_auction"],
  AUCTION_COMPLETE: ["get_market_recommendations"],
  MARKET_RANKED: ["inspect_recommendation_influence", "set_recommendation_policy"],
  AUDITED: ["set_recommendation_policy"],
  POLICY_UPDATED: ["compare_market_to_clean_room"],
  COMPARED: ["stage_demo_selection"],
};

function snapshot(): StoreSnapshot {
  return useDemoStore.getState() as unknown as StoreSnapshot;
}

function stateFromStore(value: StoreSnapshot = snapshot()): DemoState {
  const candidate = value.demoState ?? value.state ?? value.status;
  return typeof candidate === "string" && (DEMO_STATES as readonly string[]).includes(candidate)
    ? (candidate as DemoState)
    : "EMPTY";
}

function stateVersionFromStore(value: StoreSnapshot = snapshot()): number {
  const candidate = value.stateVersion;
  return typeof candidate === "number" && Number.isFinite(candidate) ? candidate : 0;
}

function actionFor(toolName: ToolName): StoreAction | undefined {
  const current = snapshot();
  for (const name of ACTION_NAMES[toolName]) {
    const candidate = current[name];
    if (typeof candidate === "function") return candidate as StoreAction;
  }
  return undefined;
}

function isToolResult(value: unknown): value is ToolResult<unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    "ok" in value &&
    typeof value.ok === "boolean" &&
    "state" in value &&
    "stateVersion" in value
  );
}

function isKnownCode(value: unknown): value is ToolErrorCode {
  return typeof value === "string" && [
    "WEBMCP_UNAVAILABLE",
    "INVALID_INPUT",
    "INVALID_STATE",
    "SESSION_NOT_FOUND",
    "AUCTION_NOT_RUN",
    "OFFER_NOT_FOUND",
    "CONFIRMATION_REQUIRED",
    "EXECUTION_ABORTED",
    "EXECUTION_FAILED",
  ].includes(value as ToolErrorCode);
}

async function invoke<T>(
  toolName: ToolName,
  input: T,
  signal: AbortSignal,
): Promise<ToolResult<unknown>> {
  const before = snapshot();
  const currentState = stateFromStore(before);
  const currentVersion = stateVersionFromStore(before);
  if (signal.aborted) {
    return failure(
      currentState,
      currentVersion,
      "EXECUTION_ABORTED",
      undefined,
      NEXT_TOOLS[currentState],
    );
  }

  const action = actionFor(toolName);
  if (!action) {
    return failure(
      currentState,
      currentVersion,
      "EXECUTION_FAILED",
      `The demo store does not expose the ${toolName} action.`,
      NEXT_TOOLS[currentState],
      false,
    );
  }

  try {
    const result = await action(input);
    // A committed store action wins over a later cancellation. Checking again
    // here could return EXECUTION_ABORTED after visible state already changed.
    if (isToolResult(result)) return result;

    const after = snapshot();
    return success(
      stateFromStore(after),
      stateVersionFromStore(after),
      result,
      NEXT_TOOLS[stateFromStore(after)],
    );
  } catch (error) {
    if (isAbortError(error, signal)) {
      const after = snapshot();
      return failure(
        stateFromStore(after),
        stateVersionFromStore(after),
        "EXECUTION_ABORTED",
        undefined,
        NEXT_TOOLS[stateFromStore(after)],
      );
    }

    const candidateCode = typeof error === "object" && error !== null && "code" in error
      ? error.code
      : undefined;
    if (isKnownCode(candidateCode)) {
      const after = snapshot();
      return failure(
        stateFromStore(after),
        stateVersionFromStore(after),
        candidateCode,
        undefined,
        NEXT_TOOLS[stateFromStore(after)],
      );
    }

    return failure(
      currentState,
      currentVersion,
      "EXECUTION_FAILED",
      undefined,
      NEXT_TOOLS[currentState],
      false,
    );
  }
}

async function runValidated<T extends ToolInput>(
  toolName: ToolName,
  input: unknown,
  signal: AbortSignal,
  validator: { safeParse: (input: unknown) => { success: true; data: T } | { success: false; error: { issues: readonly { path?: PropertyKey[]; message: string }[] } } },
): Promise<ToolResult<unknown>> {
  if (signal.aborted) {
    const current = snapshot();
    const currentState = stateFromStore(current);
    return failure(
      currentState,
      stateVersionFromStore(current),
      "EXECUTION_ABORTED",
      undefined,
      NEXT_TOOLS[currentState],
    );
  }
  const parsed = validator.safeParse(input);
  if (!parsed.success) {
    return failure(
      stateFromStore(),
      stateVersionFromStore(),
      "INVALID_INPUT",
      invalidInputMessage(parsed.error.issues),
      NEXT_TOOLS[stateFromStore()],
    );
  }

  if (toolName === "stage_demo_selection" && (parsed.data as StageDemoSelectionInput).userConfirmed !== true) {
    return failure(
      stateFromStore(),
      stateVersionFromStore(),
      "CONFIRMATION_REQUIRED",
      undefined,
      ["stage_demo_selection"],
    );
  }

  if (toolName === "set_recommendation_policy") {
    const policyInput = parsed.data as SetRecommendationPolicyInput;
    return invoke(toolName, {
      ...policyInput,
      maximumSponsorWeight: policyInput.maximumSponsorWeight ?? 0.3,
      requireReasonCodes: policyInput.requireReasonCodes ?? true,
    }, signal);
  }

  return invoke(toolName, parsed.data, signal);
}

export const toolHandlers: Record<
  ToolName,
  (input: unknown, context?: { signal?: AbortSignal }) => Promise<ToolResult<unknown>>
> = {
  create_intent_session: (input, context) =>
    runValidated("create_intent_session", input, context?.signal ?? fallbackExecutionSignal, inputValidators.create_intent_session),
  run_simulated_ad_auction: (input, context) =>
    runValidated("run_simulated_ad_auction", input, context?.signal ?? fallbackExecutionSignal, inputValidators.run_simulated_ad_auction),
  get_market_recommendations: (input, context) =>
    runValidated("get_market_recommendations", input, context?.signal ?? fallbackExecutionSignal, inputValidators.get_market_recommendations),
  inspect_recommendation_influence: (input, context) =>
    runValidated("inspect_recommendation_influence", input, context?.signal ?? fallbackExecutionSignal, inputValidators.inspect_recommendation_influence),
  set_recommendation_policy: (input, context) =>
    runValidated("set_recommendation_policy", input, context?.signal ?? fallbackExecutionSignal, inputValidators.set_recommendation_policy),
  compare_market_to_clean_room: (input, context) =>
    runValidated("compare_market_to_clean_room", input, context?.signal ?? fallbackExecutionSignal, inputValidators.compare_market_to_clean_room),
  stage_demo_selection: (input, context) =>
    runValidated("stage_demo_selection", input, context?.signal ?? fallbackExecutionSignal, inputValidators.stage_demo_selection),
};
