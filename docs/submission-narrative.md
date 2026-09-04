# INTENT//FOR SALE

## Summary

INTENT//FOR SALE is a fictional WebMCP marketplace that makes commercial influence in
agent recommendations visible. A synthetic auction changes the ranking of AI video
platforms; the person can inspect the score arithmetic, block sponsorship, and compare
the result with a sponsor-free clean room.

## Problem

As people delegate research and purchasing decisions to agents, paid influence can enter
structured results before a person sees the underlying options. A recommendation may
sound objective while its commercial inputs remain difficult to inspect. A sponsored
label alone does not show what changed or what the answer would have been without the
paid factor.

## Solution and impact

The fixed scenario asks for an AI video-generation platform at or under an $80 monthly
budget, with five explicit requirements. Five fictional offers enter a deterministic auction.
OmniMotion Ultra reaches commercial rank #1 with a score of `84.6`; its user-fit
contribution is `54.6` and its simulated sponsor contribution is `30.0`, associated with
a fictional `$24` CPA. KinoForge Studio has the strongest sponsor-free fit at `92.0`,
but commercial weighting places it at rank #4. When sponsorship is blocked and inferred
signals remain off, KinoForge becomes the clean-room winner and OmniMotion falls to #5.

The point is not to model a real ad market. It is to make a potentially opaque mechanism
measurable and give the person an actionable audit: see the historical result, inspect
the Influence Receipt, change the policy, and compare both rankings. All brands, bids,
claims, scores, and payouts are synthetic. Nothing is purchased.

## Why WebMCP fits

WebMCP is the interaction surface, not a decorative integration. The page feature-detects
`document.modelContext.registerTool` and registers seven bounded tools for the complete
workflow: create the intent, run the auction, rank the market, inspect influence, set a
recommendation policy, compare the market with the clean room, and stage a fictional
selection. Structured inputs and outputs carry state versions, rankings, disclosures,
policy settings, evidence, and recoverable errors.

The agent operates the workflow while the person watches the same live browser state:
the intent, bidstream, receipt, policy, rank reversal, and activity ledger. This is more
direct than asking an agent to click presentation controls and parse rendered text. In a
browser host without WebMCP, the complete manual fallback calls the same local actions
and preserves the same disclosures.

## Human-agent collaboration and UX

The agent performs repeatable structured operations and returns evidence. The person
defines the goal and constraints, questions the commercial result, chooses the influence
policy, and decides whether to stage the fictional outcome. The interface keeps user-fit
points, sponsor-derived points, simulated money, advertiser claims, and rank changes
visibly separate. The Influence Receipt explains the selected offer; the clean-room view
preserves the historical market result instead of rewriting it.

The staged tool accepts `userConfirmed` as a caller declaration only. It does not prove a
human click, identity, consent, or authorization. That boundary is acceptable here only
because the result is fictional, local, reversible, ephemeral, and incapable of an
external side effect.

## Try it with an agent

The live page includes four copy-ready prompts for an ordinary recommendation, an
influence audit, a native WebMCP check, and the confirmation boundary. The first request
does not mention advertising. The follow-up asks the agent to disclose the paid
contribution, block sponsorship, and compare the ranking again. The page does not treat
manual clicks or fallback handlers as native WebMCP proof.

## Implementation

The project is a static Vite, React, and TypeScript client. Zustand holds ephemeral
browser state; a deterministic local engine computes the auction, commercial ranking,
Influence Receipt, policy result, and clean-room comparison. Zod-backed handlers enforce
strict bounded schemas at the WebMCP boundary, and advertiser-authored claims are marked
as untrusted content. Manual controls and WebMCP handlers use the same state actions.

There is no backend, account system, payment path, analytics integration, application
data fetch, external model call, or browser persistence. The seven operations only change
the local demo state.

## Testing and evidence

The repository includes unit tests for the deterministic engine, state ordering, schemas,
tool registration and cleanup, prompt copy feedback, and invalid or out-of-order calls.
The browser suite covers the complete manual flow, confirmation boundary, responsive
layouts, expanded prompts at the exact breakpoints, reduced motion, and console
cleanliness. Candidate `b229e915` passes 30 Vitest tests and 11 Playwright tests, plus
TypeScript checking and the production build, with zero npm audit findings.

Release screenshots document the rendered states. The first image shows the current
prompt and public-link strip; the remaining four preserve the unchanged core flow:

- [Current interface](design/current-interface-1440x900.png)
- [Commercial ranking](design/verified-dashboard-1280x720.png)
- [Influence Receipt](design/evidence-influence-receipt-v4-1440x900.png)
- [Market versus clean room](design/verified-dashboard-1440x900.png)
- [Ledger and staged result](design/evidence-ledger-and-selection-v7-1440x900.png)

## Demo, repository, and license

- [Live demo](https://cjbooger.github.io/intent-for-sale-webmcp/)
- [Devpost entry](https://devpost.com/software/intent-for-sale)
- [Demo video](https://youtu.be/3qy5PAYSi0E)
- [Public source repository](https://github.com/Cjbooger/intent-for-sale-webmcp)
- [MIT License](../LICENSE)

## Clients and limitations

The native tool path requires a browser host that supports the page's
`document.modelContext` registration API and permits tool discovery for the deployed
origin. Host-specific discovery, origin handling, and caller authorization are outside
this static client. Ordinary browsers can use the manual fallback.

This is a transparent simulation, not a real marketplace or purchasing assistant. Its
scenario, ranking model, offers, and advertiser content are fixed and fictional. The
staged selection does not buy, subscribe, message, transfer money, contact an advertiser,
or mutate an external system. A consequential product would need trusted, single-use
approval bound to the exact user, session, and action, plus real data and security review.
