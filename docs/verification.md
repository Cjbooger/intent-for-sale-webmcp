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

Final V2 application candidate (September 2, 2026 PDT):

- Commit: [`509ea6307b5916bf445b18abbb856c9f2a7ada6d`](https://github.com/Cjbooger/intent-for-sale-webmcp/commit/509ea6307b5916bf445b18abbb856c9f2a7ada6d)
- Git tree: `10887fdcb402871febf47d13154f2e600161387d`
- `package-lock.json` SHA-256: `cf54db52cf6044ea987f08f5c373468493afa58698d91dd4986c085c5ab5ab91`
- [Exact-commit CI](https://github.com/Cjbooger/intent-for-sale-webmcp/actions/runs/33640459929): passed.
- [Exact-commit Pages deployment](https://github.com/Cjbooger/intent-for-sale-webmcp/actions/runs/33640460133): passed.

A fresh public clone resolved to that full commit and tree before dependencies were
installed. From that clean clone:

- TypeScript project check: passed.
- Vitest: 4 files, 22 tests passed.
- Vite production build: passed.
- Playwright Chromium: 9 tests passed, including the deterministic full flow, dialog
  focus containment and restoration, reduced motion, clean console output, and zero
  horizontal overflow across six release viewports plus 200%-zoom-equivalent reflow.
- npm dependency audit: 0 vulnerabilities.

The production build and deployed Pages files were byte-identical:

| File | SHA-256 |
| --- | --- |
| `dist/index.html` | `bc60bf08d1991e575e9cd18c37c6223bd6e3a3984c9f001a3efa019803e30726` |
| `dist/assets/index-fuLXQfjI.js` | `e74c54357fc7097604bcb35c3d79f2175fbdeef863c1f693df96aa44e1329c41` |
| `dist/assets/index-Bxr4Y1pL.css` | `eb5b531caa3df120f71823fcc3cf9c86be4e82432a0ce546d8bf5beb470063e4` |

The sorted three-line manifest produced by `find dist -type f -print | LC_ALL=C sort |
xargs shasum -a 256` has SHA-256
`652853487473b93ee67e8e70def819d43378bf322cd5d7090054f8cf739a6f15`.

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

The repository includes release captures rendered from the final V2 deployed
candidate above. The browser-produced JPEG encodings were normalized to true RGB PNG
files without another lossy encode. Their file signatures, exact dimensions, and
SHA-256 hashes were checked locally before this corrective evidence branch was
committed. Two fresh final deployed native sessions at the clean public URL each
enumerated the same seven tools and invoked all seven in order; recorded browser error
and warning logs were empty. Chrome fallback also completed the full manual flow.

| Asset | App state | Exact image size | SHA-256 | Visible proof |
| --- | --- | --- | --- | --- |
| [`verified-dashboard-1280x720.png`](design/verified-dashboard-1280x720.png) | `MARKET_RANKED/v3` | 1280×720 RGB PNG | `3e5cc38f14419efc5be74edbcdbf501f61d192fb478324171ecbb66c8809d78c` | WebMCP active, five fictional bids, and OmniMotion at `84.6/#1`. |
| [`evidence-influence-receipt-v4-1440x900.png`](design/evidence-influence-receipt-v4-1440x900.png) | `AUDITED/v4` | 1440×900 RGB PNG | `ef1ec52e7d9264718dd0aca83ae26d3099c726f82a599a8de070f0bcc7e4f10d` | `54.6 + 30.0 = 84.6`, market `#1`, clean-room `#5`, and simulated `$24` CPA. |
| [`verified-dashboard-1440x900.png`](design/verified-dashboard-1440x900.png) | `COMPARED/v6` | 1440×900 RGB PNG | `7d74964b75414b8979d67542a48d73f52f185538d951ad264ed8223baefdd491` | Sponsor policy blocked and KinoForge reversed from market `#4` to clean-room `#1` at `92.0`. |
| [`evidence-ledger-and-selection-v7-1440x900.png`](design/evidence-ledger-and-selection-v7-1440x900.png) | `SELECTION_STAGED/v7` | 1440×900 RGB PNG | `e03a54cf2ce3909bcfe9c0be404db30d792e7f9d56e12c3b3f0c549e509ded21` | All seven ledger entries, the staged KinoForge result, and `NO PURCHASE`. |

The captures contain only deterministic fictional fixture data and no browser,
account, user, or unrelated-project information. They document the rendered release
surface; they do not prove behavior in every WebMCP host. Regenerate them after any
visual or behavioral deployment and bind final submission claims to the frozen
release candidate.
