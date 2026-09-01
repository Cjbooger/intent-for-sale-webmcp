/**
 * The WebMCP imperative API is still experimental and is not present in the
 * standard DOM lib. Keep this boundary deliberately small so the rest of the
 * application does not depend on an unstable browser declaration.
 */
import type { ModelContextTool } from "../webmcp/types";

declare global {
  interface Document {
    modelContext?: ModelContext;
  }

  interface ModelContext {
    registerTool(
      tool: ModelContextTool,
      options?: { signal?: AbortSignal },
    ): Promise<void> | void;
  }
}

export {};
