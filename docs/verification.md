# Public verification

This document records reproducible checks for the public source package. It separates
source-level proof from deployment- and browser-host behavior.

## Automated checks

Run from a clean checkout:

```bash
npm ci
npm run typecheck
npm run test:run
npm run build
npm run test:e2e
npm audit --audit-level=high
```

The automated suite covers:

- deterministic auction, market, receipt, policy, and clean-room calculations;
- state ordering, invalid inputs, session guards, and reset behavior;
- exactly seven WebMCP tool registrations and lifecycle cleanup;
- strict input schemas and untrusted-content annotations;
- the complete manual browser flow, including the no-purchase disclosure.

Current verified baseline (September 1, 2026):

- TypeScript project check: passed.
- Vitest: 4 files, 22 tests passed.
- Vite production build: passed.
- Playwright Chromium: 8 tests passed, including the deterministic full flow, dialog
  focus containment and restoration, reduced motion, clean console output, and zero
  horizontal overflow across six release viewports.
- npm dependency audit: 0 vulnerabilities.

## Source-level assertions

The current implementation is a static client. Targeted review found no application
backend, authentication, payment integration, analytics, external-data request,
browser persistence, executable-markup sink, or navigation side effect. Vite's built
asset loader still performs ordinary same-origin requests for the site's JavaScript
and CSS.

All demo companies, offers, bids, claims, payouts, and selections are fictional.

## WebMCP runtime proof

The source feature-detects `document.modelContext.registerTool`. A compatible host
should discover these seven tools:

1. `create_intent_session`
2. `run_simulated_ad_auction`
3. `get_market_recommendations`
4. `inspect_recommendation_influence`
5. `set_recommendation_policy`
6. `compare_market_to_clean_room`
7. `stage_demo_selection`

Registration and handler tests do not prove how every browser host handles tool
discovery, origin authorization, or confirmation UX. Those behaviors must be verified
against the deployed HTTPS build in each supported host. Unsupported browsers retain
the complete manual flow.

## Visual proof

The repository includes release captures from the deployed app commit
`b959728d8121803e239dd08a510ead2b4e88d582`, generated September 1, 2026 PDT in a
WebMCP-capable browser host. Two fresh documents at the clean public URL each
enumerated the same seven tools and completed the seven calls in order; recorded
browser error and warning logs were empty.

| Asset | App state | Exact image size | Visible proof |
| --- | --- | --- | --- |
| [`verified-dashboard-1280x720.png`](design/verified-dashboard-1280x720.png) | `MARKET_RANKED/v3` | 1280×720 PNG | WebMCP active, five fictional bids, and OmniMotion at `84.6/#1`. |
| [`evidence-influence-receipt-v4-1440x900.png`](design/evidence-influence-receipt-v4-1440x900.png) | `AUDITED/v4` | 1440×900 PNG | `54.6 + 30.0 = 84.6`, market `#1`, clean-room `#5`, and simulated `$24` CPA. |
| [`verified-dashboard-1440x900.png`](design/verified-dashboard-1440x900.png) | `COMPARED/v6` | 1440×900 PNG | Sponsor policy blocked and KinoForge reversed from market `#4` to clean-room `#1` at `92.0`. |
| [`evidence-ledger-and-selection-v7-1440x900.png`](design/evidence-ledger-and-selection-v7-1440x900.png) | `SELECTION_STAGED/v7` | 1440×900 PNG | All seven ledger entries, the staged KinoForge result, and `NO PURCHASE`. |

The captures contain only deterministic fictional fixture data and no browser,
account, user, or unrelated-project information. They document the rendered release
surface; they do not prove behavior in every WebMCP host. Regenerate them after any
visual or behavioral deployment and bind final submission claims to the frozen
release candidate.
