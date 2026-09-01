import type { DemoState, ToolFailure, ToolName, ToolResult } from "./types";

export const TOOL_ERROR_CODES = [
  "WEBMCP_UNAVAILABLE",
  "INVALID_INPUT",
  "INVALID_STATE",
  "SESSION_NOT_FOUND",
  "AUCTION_NOT_RUN",
  "OFFER_NOT_FOUND",
  "CONFIRMATION_REQUIRED",
  "EXECUTION_ABORTED",
  "EXECUTION_FAILED",
] as const;

export type ToolErrorCode = (typeof TOOL_ERROR_CODES)[number];

const DEFAULT_MESSAGES: Record<ToolErrorCode, string> = {
  WEBMCP_UNAVAILABLE: "WebMCP is not available in this browser.",
  INVALID_INPUT: "The tool input did not match the required schema.",
  INVALID_STATE: "This tool cannot run from the current demo state.",
  SESSION_NOT_FOUND: "The requested intent session was not found.",
  AUCTION_NOT_RUN: "Run the simulated auction before requesting recommendations.",
  OFFER_NOT_FOUND: "The requested offer was not found in the current recommendations.",
  CONFIRMATION_REQUIRED: "Explicit user confirmation is required before staging a selection.",
  EXECUTION_ABORTED: "The tool execution was cancelled before it completed.",
  EXECUTION_FAILED: "The tool could not complete. Retry from the current demo state.",
};

export function success<T>(
  state: DemoState,
  stateVersion: number,
  data: T,
  recommendedNextTools?: readonly ToolName[],
): ToolResult<T> {
  return {
    ok: true,
    state,
    stateVersion,
    data,
    ...(recommendedNextTools ? { recommendedNextTools } : {}),
  };
}

export function failure(
  state: DemoState,
  stateVersion: number,
  code: ToolErrorCode,
  message = DEFAULT_MESSAGES[code],
  allowedNextTools?: readonly ToolName[],
  recoverable = code !== "EXECUTION_FAILED",
): ToolFailure {
  return {
    ok: false,
    state,
    stateVersion,
    error: {
      code,
      message,
      recoverable,
      ...(allowedNextTools ? { allowedNextTools } : {}),
    },
  };
}

export function isAbortError(error: unknown, signal?: AbortSignal): boolean {
  if (signal?.aborted) return true;
  return (
    error instanceof DOMException && error.name === "AbortError"
  ) || (error instanceof Error && error.name === "AbortError");
}

export function abortIfSignalled(signal: AbortSignal): void {
  if (signal.aborted) {
    throw new DOMException("The tool execution was aborted.", "AbortError");
  }
}

export function invalidInputMessage(issues: readonly { path?: PropertyKey[]; message: string }[]): string {
  const first = issues[0];
  if (!first) return DEFAULT_MESSAGES.INVALID_INPUT;
  const path = first.path?.length ? ` (${first.path.map(String).join(".")})` : "";
  return `Invalid tool input${path}: ${first.message}`;
}
