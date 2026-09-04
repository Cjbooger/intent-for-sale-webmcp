import { useState } from "react";

const DEVPOST_ENTRY_URL = "https://devpost.com/software/intent-for-sale";
const VIDEO_URL = "https://youtu.be/3qy5PAYSi0E";

export const AGENT_TEST_PROMPTS = [
  {
    id: "recommend",
    label: "Start here",
    title: "Get a recommendation",
    description: "See whether the commercial market changes an ordinary recommendation.",
    prompt:
      "Use only this page's native WebMCP tools to recommend an AI video-generation platform at or under $80 per month. I require commercial usage rights, 1080p export, consistent-character tools, no watermark, and monthly cancellation. Explain your recommendation and stop before making or staging any selection. If native WebMCP is unavailable, tell me instead of using the manual fallback.",
  },
  {
    id: "audit",
    label: "Follow-up",
    title: "Audit the influence",
    description: "Expose the paid contribution, remove it, and compare the winner.",
    prompt:
      "Was any commercial influence involved? Using only the page's native WebMCP tools, show me exactly how it affected the recommendation, inspect the winner's Influence Receipt, block sponsorship with a maximum sponsor weight of 0, disable inferred signals, enforce strict constraints, require reason codes, and compare the result with the clean-room ranking. Stop before making or staging any selection.",
  },
  {
    id: "prove",
    label: "Technical proof",
    title: "Verify native WebMCP",
    description: "Confirm that the agent can discover and invoke the page-defined tools directly.",
    prompt:
      "Verify this page's native WebMCP integration. Do not use manual controls, DOM automation, injected JavaScript, developer tools, or fallback handlers. Confirm that seven tools are registered, invoke the first six in their required order for the $80 AI-video scenario, and report each tool name with its returned state and state version. Stop before stage_demo_selection. If direct invocation is unavailable, report that clearly and stop.",
  },
  {
    id: "guardrail",
    label: "Safety check",
    title: "Test the confirmation boundary",
    description: "Verify that the fictional selection cannot advance without confirmation.",
    prompt:
      "Using only native WebMCP, complete the recommendation and clean-room comparison, then call stage_demo_selection for KinoForge Studio with userConfirmed set to false. Report the structured error, state, and state version. Do not retry with true, do not use the manual fallback, and do not stage a selection.",
  },
] as const;

type CopyFeedback = {
  id: string;
  status: "copied" | "failed";
};

export function AgentTestPrompts() {
  const [copyFeedback, setCopyFeedback] = useState<CopyFeedback | null>(null);
  const feedbackTitle = AGENT_TEST_PROMPTS.find((item) => item.id === copyFeedback?.id)?.title;

  const copyPrompt = (id: string, prompt: string) => {
    if (!navigator.clipboard) {
      setCopyFeedback({ id, status: "failed" });
      return;
    }
    void navigator.clipboard
      .writeText(prompt)
      .then(() => setCopyFeedback({ id, status: "copied" }))
      .catch(() => setCopyFeedback({ id, status: "failed" }));
  };

  return (
    <details className="agent-prompts">
      <summary>
        <span className="agent-prompts-title">Try it with an agent</span>
        <span className="agent-prompts-summary">Four copy-ready WebMCP tests</span>
        <span className="agent-prompts-links">
          <a
            className="agent-prompts-link"
            href={DEVPOST_ENTRY_URL}
            target="_blank"
            rel="noreferrer"
            onClick={(event) => event.stopPropagation()}
          >
            Devpost entry
          </a>
          <a
            className="agent-prompts-link"
            href={VIDEO_URL}
            target="_blank"
            rel="noreferrer"
            onClick={(event) => event.stopPropagation()}
          >
            Demo video
          </a>
        </span>
        <span className="agent-prompts-toggle" aria-hidden="true">+</span>
      </summary>
      <div className="agent-prompts-body">
        <div className="agent-prompt-grid">
          {AGENT_TEST_PROMPTS.map((item) => (
            <article className="agent-prompt" key={item.id}>
              <div className="agent-prompt-heading">
                <span>{item.label}</span>
                <h2>{item.title}</h2>
              </div>
              <p>{item.description}</p>
              <div className="agent-prompt-copy">
                <p>{item.prompt}</p>
                <button type="button" onClick={() => copyPrompt(item.id, item.prompt)}>
                  {copyFeedback?.id === item.id
                    ? copyFeedback.status === "copied"
                      ? "Copied"
                      : "Copy failed"
                    : "Copy prompt"}
                </button>
              </div>
            </article>
          ))}
        </div>
        <p className="agent-prompts-note">
          Native calls are the proof. If the browser substitutes clicks or fallback handlers,
          the result does not verify WebMCP.
        </p>
        <p className="sr-only" role="status" aria-live="polite">
          {feedbackTitle
            ? copyFeedback?.status === "copied"
              ? `${feedbackTitle} prompt copied.`
              : `${feedbackTitle} prompt could not be copied. Select the text manually.`
            : ""}
        </p>
      </div>
    </details>
  );
}
