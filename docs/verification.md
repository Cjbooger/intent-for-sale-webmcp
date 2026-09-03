# Public verification

This document records reproducible checks for the public source package. It separates
source-level proof from deployment- and browser-host behavior.

## Pre-submission revalidation

On September 2, 2026 at approximately 1:07 PM PDT, two new independent documents in
ChatGPT/Codex's WebMCP-capable in-app browser each discovered the same seven tools from
the public URL and completed the canonical sequence through `SELECTION_STAGED/7`.
Both runs reproduced OmniMotion at `84.6` (`54.6 + 30.0`), the clean-room change to
KinoForge at `92.0`, and `purchaseWillNotOccur: true`. A separate unconfirmed staging
call correctly returned `CONFIRMATION_REQUIRED` without advancing state.

The browser reported no warning or error logs. The completed state had no horizontal
overflow at `1440x900` or `390x844`, retained the `WebMCP active` and `NO PURCHASE`
disclosures, and rendered the four-step Influence Trace, receipt, rank reversal, and
seven-entry ledger. Fresh public downloads of the HTML, CSS, and JavaScript matched
the production hashes below byte-for-byte. All three returned HTTP `200`; observed
download times were `0.054 s`, `0.049 s`, and `0.081 s` respectively in that probe.

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

A fresh public checkout pinned to that full commit and tree was created before
dependencies were installed. From that clean checkout:

- TypeScript project check: passed.
- Vitest: 4 files, 22 tests passed.
- Vite production build: passed.
- Playwright Chromium: 9 tests passed, including the deterministic full flow, dialog
  focus containment and restoration, reduced motion, clean console output, and zero
  horizontal overflow across six release viewports plus 200%-zoom-equivalent reflow.
- npm dependency audit: 0 vulnerabilities.

The current public documentation head adds one test-only file containing five WebMCP
handler-contract tests, so its suite passes 27 Vitest tests. No production application
file differs from the frozen candidate above.

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

The original release captures were rendered from the final V2 deployed candidate
above. The browser-produced JPEG encodings were normalized to true RGB PNG files
without another lossy encode. Their file signatures, exact dimensions, and SHA-256
hashes were checked locally. The public bytes at immutable evidence commit
[`cce9dbb7b5e214f302d2ed6fbab2bdf970d8c3f2`](https://github.com/Cjbooger/intent-for-sale-webmcp/commit/cce9dbb7b5e214f302d2ed6fbab2bdf970d8c3f2)
matched that original four-image set byte-for-byte. Two fresh final deployed native
sessions at the clean public URL each enumerated the same seven tools and invoked all
seven in order; recorded browser error and warning logs were empty. Chrome fallback
also completed the full manual flow.

On September 3, an integrity review caught a `$250.00/month` value in the original
receipt and ledger images that did not match the canonical `$80.00/month` scenario.
Those two images were recaptured at 1440×900 from current application code with a
controlled WebMCP registration harness. An independent native WebMCP-host replay of
the seven calls showed the `$80.00/month` intent at both `AUDITED/v4` and
`SELECTION_STAGED/v7`. The new image hashes below identify source files in this
revision; deployed-byte proof for them must be repeated after deployment.

| Asset | App state | Exact image size | SHA-256 | Visible proof |
| --- | --- | --- | --- | --- |
| [`verified-dashboard-1280x720.png`](design/verified-dashboard-1280x720.png) | `MARKET_RANKED/v3` | 1280×720 RGB PNG | `3e5cc38f14419efc5be74edbcdbf501f61d192fb478324171ecbb66c8809d78c` | WebMCP active, five fictional bids, and OmniMotion at `84.6/#1`. |
| [`evidence-influence-receipt-v4-1440x900.png`](design/evidence-influence-receipt-v4-1440x900.png) | `AUDITED/v4` | 1440×900 RGB PNG | `586287f02da755d632fe8ec6af236ac892359d9d656f80e09b2ca58273b9f3d3` | Canonical `$80.00/month` intent, `54.6 + 30.0 = 84.6`, market `#1`, clean-room `#5`, and simulated `$24` CPA. |
| [`verified-dashboard-1440x900.png`](design/verified-dashboard-1440x900.png) | `COMPARED/v6` | 1440×900 RGB PNG | `7d74964b75414b8979d67542a48d73f52f185538d951ad264ed8223baefdd491` | Sponsor policy blocked and KinoForge reversed from market `#4` to clean-room `#1` at `92.0`. |
| [`evidence-ledger-and-selection-v7-1440x900.png`](design/evidence-ledger-and-selection-v7-1440x900.png) | `SELECTION_STAGED/v7` | 1440×900 RGB PNG | `d64cb57d8bb7bcdfb018f3ec7baa9e6ece939452d0bda80475c975ee96f0c082` | Canonical `$80.00/month` intent, all seven ledger entries, the staged KinoForge result, and `NO PURCHASE`. |

The captures contain only deterministic fictional fixture data and no browser,
account, user, or unrelated-project information. The original set documents the
rendered deployed release surface; the two replacements require a new deployed-byte
check. They do not prove behavior in every WebMCP host. Regenerate them after any
visual or behavioral deployment and bind final submission claims to the frozen release
candidate.
