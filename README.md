# INTENT//FOR SALE

[Live demo](https://cjbooger.github.io/intent-for-sale-webmcp/) ·
[Devpost entry](https://devpost.com/software/intent-for-sale) ·
[Source](https://github.com/Cjbooger/intent-for-sale-webmcp)

**The agent becomes the ad impression.**

INTENT//FOR SALE is a fictional WebMCP market where synthetic advertisers bid to
influence an AI agent's recommendation. The user can inspect the paid contribution,
remove it, and see whether the winner changes.

Built for the [WebMCP Challenge](https://openai.com/webmcp-challenge/).

The fixed demo starts with a request for an AI video platform at or under $80 per
month. Commercial weighting puts OmniMotion Ultra first at `84.6`. When sponsorship
is blocked, KinoForge Studio moves from fourth place to first with a base-fit score of
`92.0`.

Everything is synthetic. The site cannot purchase anything, transfer money, contact
an advertiser, or persist the session.

![Current interface showing the commercial ranking beside the clean-room result](docs/design/current-interface-1440x900.png)

## Try it with an agent

Open the [live demo](https://cjbooger.github.io/intent-for-sale-webmcp/) in a
WebMCP-capable browser. The status bar should read `WebMCP active` and
`7 tools registered`.

Start with a normal request. Do not prime the agent by mentioning ads:

> Use only this page's native WebMCP tools to recommend an AI video-generation
> platform at or under $80 per month. I require commercial usage rights, 1080p
> export, consistent-character tools, no watermark, and monthly cancellation.
> Explain your recommendation and stop before making or staging any selection. If
> native WebMCP is unavailable, tell me instead of using the manual fallback.

Then audit the result:

> Was any commercial influence involved? Show me exactly how it affected the
> recommendation, remove that influence, and tell me whether the winner changes.
> Stop before making or staging any selection.

The expected result is deterministic:

| Pass | Winner | Score | What changed |
| --- | --- | ---: | --- |
| Commercial market | OmniMotion Ultra | `84.6` | A simulated $24 CPA bid contributes `30.0` score points. |
| Clean room | KinoForge Studio | `92.0` | Sponsorship is blocked and the maximum sponsor weight is `0`. |

The page also includes copy-ready prompts for native WebMCP verification and the
confirmation guardrail. A browser that substitutes clicks or fallback handlers has
not proven native WebMCP invocation.

## What the demo does

The agent and the user work through one shared browser state:

1. The agent turns the request into a structured intent.
2. Five fictional offers enter a deterministic advertiser auction.
3. The commercial ranking separates user-fit points from paid score points.
4. An Influence Receipt shows the bid, sponsor weight, score arithmetic, claims,
   constraints, and rank impact.
5. The user blocks sponsorship and inferred signals.
6. The agent compares the original market with a sponsor-free clean room.
7. A fictional selection can be staged only after caller-declared confirmation.

The activity ledger records every tool call and state version. The commercial result
remains visible after the clean-room pass, so the site shows what changed without
rewriting history.

## Why WebMCP

The page registers explicit operations through
`document.modelContext.registerTool`. The agent receives typed inputs and structured
results instead of having to infer application behavior from buttons and rendered
text. Each WebMCP call uses the same Zustand action as its manual fallback control,
so both paths run the same state machine.

Two tool outputs contain fictional advertiser claims and mark that content as
untrusted. Invalid or out-of-order calls return structured errors with recovery
guidance.

### Tool surface

| Tool | Purpose |
| --- | --- |
| `create_intent_session` | Normalize the user's task, budget, and constraints. |
| `run_simulated_ad_auction` | Generate five fixed fictional bids. |
| `get_market_recommendations` | Return the commercially weighted ranking. |
| `inspect_recommendation_influence` | Produce an Influence Receipt for one offer. |
| `set_recommendation_policy` | Set sponsorship, signal, and constraint rules. |
| `compare_market_to_clean_room` | Re-rank without commercial influence. |
| `stage_demo_selection` | Stage a fictional result after declared confirmation. |

The full schemas, result envelopes, state transitions, and error codes are documented
in the [WebMCP API contract](docs/webmcp-api.md).

## Architecture

```text
WebMCP caller or manual control
              |
       strict Zod schemas
              |
     shared Zustand actions
              |
 deterministic ranking engine
              |
        React audit UI
```

- Vite, React, and TypeScript
- Zustand for ephemeral in-memory state
- Zod and strict JSON Schemas at the tool boundary
- Vitest for domain, state-machine, handler, and registration tests
- Playwright for full-flow, accessibility, and responsive browser tests
- Static GitHub Pages deployment with no backend

### Scoring model

```text
normalized bid = bid / highest eligible bid * 100
market score = base fit * (1 - sponsor weight)
             + normalized bid * sponsor weight
             - constraint penalty
```

CPA dollars and score contributions remain separate. The fixture uses zero constraint
penalties because its base-fit values already include the requirement tradeoffs.

## Safety boundary

- All companies, offers, bids, claims, payouts, and selections are fictional.
- The application has no accounts, backend, analytics, payment path, external data
  source, or browser persistence.
- React renders user and advertiser content as text.
- Tool schemas reject unknown fields and bound every input.
- No tool can purchase, subscribe, send a message, or contact a third party.
- `stage_demo_selection.userConfirmed` is a caller declaration for this local demo.
  Consequential systems would need trusted identity, consent, and single-use approval.

Read [SECURITY.md](SECURITY.md) for the reporting process and complete trust boundary.

## Run locally

Requirements: Node.js 22 LTS or 24+, plus npm.

```bash
npm ci
npm run dev
```

`npm ci` does not install Playwright's Chromium binary. Install it once if the browser
test reports that it is missing:

```bash
npx playwright install chromium
```

Run the release checks:

```bash
npm run typecheck
npm run test:run
npm run build
npm run test:e2e
npm audit --audit-level=high
```

Playwright starts a loopback-only Vite server at `http://127.0.0.1:4173`.

## Evidence and project notes

- [Public verification record](docs/verification.md)
- [Deployed WebMCP verification](docs/deployed-verification.md)
- [Submission narrative](docs/submission-narrative.md)
- [Deployment notes](docs/deployment.md)
- [Commercial market screenshot](docs/design/verified-dashboard-1280x720.png)
- [Influence Receipt screenshot](docs/design/evidence-influence-receipt-v4-1440x900.png)
- [Seven-tool ledger and staged-result screenshot](docs/design/evidence-ledger-and-selection-v7-1440x900.png)

## Contributing

Focused pull requests are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) before
changing the state machine or public tool contract.

## License

[MIT](LICENSE)
