export const DEMO_STATES = [
  "EMPTY",
  "INTENT_READY",
  "AUCTION_COMPLETE",
  "MARKET_RANKED",
  "AUDITED",
  "POLICY_UPDATED",
  "COMPARED",
  "SELECTION_STAGED",
] as const;

export type DemoState = (typeof DEMO_STATES)[number];

export const TOOL_NAMES = [
  "create_intent_session",
  "run_simulated_ad_auction",
  "get_market_recommendations",
  "inspect_recommendation_influence",
  "set_recommendation_policy",
  "compare_market_to_clean_room",
  "stage_demo_selection",
] as const;

export type ToolName = (typeof TOOL_NAMES)[number];

export interface JsonSchema {
  type: "object" | "string" | "number" | "integer" | "boolean" | "array";
  properties?: Record<string, JsonSchema>;
  items?: JsonSchema;
  required?: readonly string[];
  additionalProperties?: boolean;
  minLength?: number;
  maxLength?: number;
  minItems?: number;
  maxItems?: number;
  minimum?: number;
  maximum?: number;
  enum?: readonly string[];
  default?: boolean | string | number;
  description?: string;
}

export interface ToolAnnotations {
  readOnlyHint?: boolean;
  untrustedContentHint?: boolean;
}

export interface ModelToolExecutionContext {
  signal?: AbortSignal;
}

export interface ModelContextTool {
  name: ToolName;
  title: string;
  description: string;
  inputSchema: JsonSchema;
  annotations: ToolAnnotations;
  execute: (
    input: unknown,
    context?: ModelToolExecutionContext,
  ) => Promise<ToolResult<unknown>>;
}

export interface ToolSuccess<T> {
  ok: true;
  state: DemoState;
  stateVersion: number;
  data: T;
  recommendedNextTools?: readonly ToolName[];
}

export interface ToolFailure {
  ok: false;
  state: DemoState;
  stateVersion: number;
  error: {
    code: string;
    message: string;
    recoverable: boolean;
    allowedNextTools?: readonly ToolName[];
  };
}

export type ToolResult<T> = ToolSuccess<T> | ToolFailure;

export interface WebMcpStatus {
  supported: boolean;
  registered: boolean;
  toolsRegistered: number;
  error?: string;
}

export type WebMcpStatusListener = (status: WebMcpStatus) => void;

export interface WebMcpRegistration {
  status: WebMcpStatus;
  cleanup: () => void;
}
