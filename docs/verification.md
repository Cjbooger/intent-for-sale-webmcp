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

Frozen application candidate (September 1, 2026 PDT):

- Commit: [`ba134c14ccb7792fa9c3a4bc2b449f7e5ce5d2dd`](https://github.com/Cjbooger/intent-for-sale-webmcp/commit/ba134c14ccb7792fa9c3a4bc2b449f7e5ce5d2dd)
- Git tree: `2cb7321645f33d2d12036337437420f704f097f1`
- `package-lock.json` SHA-256: `cf54db52cf6044ea987f08f5c373468493afa58698d91dd4986c085c5ab5ab91`
- [Exact-commit CI](https://github.com/Cjbooger/intent-for-sale-webmcp/actions/runs/33587053601): passed.
- [Exact-commit Pages deployment](https://github.com/Cjbooger/intent-for-sale-webmcp/actions/runs/33587053626): passed.

A fresh public clone resolved to that full commit and tree before dependencies were
installed. From that clean clone:

- TypeScript project check: passed.
- Vitest: 4 files, 22 tests passed.
- Vite production build: passed.
- Playwright Chromium: 8 tests passed, including the deterministic full flow, dialog
  focus containment and restoration, reduced motion, clean console output, and zero
  horizontal overflow across six release viewports.
- npm dependency audit: 0 vulnerabilities.

The production build and deployed Pages files were byte-identical:

| File | SHA-256 |
| --- | --- |
| `dist/index.html` | `3664866d24c304b8d7c87e4c0ad724d4345a4f861dd0ce28c25f96ca3d27486d` |
| `dist/assets/index-DROJcn7D.js` | `48132c1f691f931299fb376325ee38bd1ac1abc9bd571ee0349e22ee08b9420b` |
| `dist/assets/index-DS8jCVYD.css` | `e6047501d1da397e9cec0b261e2a0b12259db29c986777bdb5b7495c22ec0510` |

The sorted three-line manifest produced by `find dist -type f -print | LC_ALL=C sort |
xargs shasum -a 256` has SHA-256
`7f47782f4cb0a70f4bb5b3bd2ea035d5ef4d736e2503e6b055d4bb0262cb8577`.

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

The repository includes release captures originally rendered from deployed app commit
`b959728d8121803e239dd08a510ead2b4e88d582` on September 1, 2026 PDT. The frozen
candidate above produces the same JavaScript, CSS, and HTML hashes, and the committed
images were downloaded again from its immutable source URLs before their dimensions
and hashes were checked. Two additional fresh documents at the clean public URL each
enumerated the same seven tools and completed the seven calls in order; recorded
browser error and warning logs were empty.

| Asset | App state | Exact image size | SHA-256 | Visible proof |
| --- | --- | --- | --- | --- |
| [`verified-dashboard-1280x720.png`](design/verified-dashboard-1280x720.png) | `MARKET_RANKED/v3` | 1280×720 PNG | `7af3920df277bde5d25fa3f60d5d48129f7e483b29765b6a10523eeecce65a54` | WebMCP active, five fictional bids, and OmniMotion at `84.6/#1`. |
| [`evidence-influence-receipt-v4-1440x900.png`](design/evidence-influence-receipt-v4-1440x900.png) | `AUDITED/v4` | 1440×900 PNG | `557590176a2795052eb357d81c5225ce72333b58b4592e19fb65edf167d2cb27e` | `54.6 + 30.0 = 84.6`, market `#1`, clean-room `#5`, and simulated `$24` CPA. |
| [`verified-dashboard-1440x900.png`](design/verified-dashboard-1440x900.png) | `COMPARED/v6` | 1440×900 PNG | `fab504fea0219dd1c0be0fd0595627450ae1b565fd12c840f870ef710d10117f` | Sponsor policy blocked and KinoForge reversed from market `#4` to clean-room `#1` at `92.0`. |
| [`evidence-ledger-and-selection-v7-1440x900.png`](design/evidence-ledger-and-selection-v7-1440x900.png) | `SELECTION_STAGED/v7` | 1440×900 PNG | `f6c3d89486f40fef0926f29fa6e76f01a61aeca9046bc9a4a891727f03cc6fd8` | All seven ledger entries, the staged KinoForge result, and `NO PURCHASE`. |

The captures contain only deterministic fictional fixture data and no browser,
account, user, or unrelated-project information. They document the rendered release
surface; they do not prove behavior in every WebMCP host. Regenerate them after any
visual or behavioral deployment and bind final submission claims to the frozen
release candidate.
