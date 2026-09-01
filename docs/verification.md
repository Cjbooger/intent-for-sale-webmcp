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
- Playwright Chromium flow: 1 test passed, including two deterministic runs and the
  horizontal-overflow assertion.
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

The repository includes verified local captures at 1280x720 and 1440x900 in
`docs/design/`. They contain only fictional demo data. Release screenshots should be
regenerated after any visual pass and tied to the exact tested commit.
