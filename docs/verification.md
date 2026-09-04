# Public verification

This document records reproducible checks for the public source package. It separates
source-level proof from deployment- and browser-host behavior.

## Current deployed candidate

PR #22 merged on September 3, 2026 PDT as
[`b229e9157751886b053fdbe29d9b6b8bffeda060`](https://github.com/Cjbooger/intent-for-sale-webmcp/commit/b229e9157751886b053fdbe29d9b6b8bffeda060)
(tree `99a8aa1af993671e43276c307b16926f2b5d22f2`). It adds the copy-ready prompt panel,
public Devpost and video links, and accessible clipboard feedback. The seven WebMCP tool
definitions and deterministic ranking fixture are unchanged.

The merged commit passed [CI](https://github.com/Cjbooger/intent-for-sale-webmcp/actions/runs/33831354411)
and [Pages deployment](https://github.com/Cjbooger/intent-for-sale-webmcp/actions/runs/33831354403).
A clean local gate passed TypeScript checking, 30 Vitest tests, the production build,
11 Playwright tests, and `npm audit --audit-level=high` with zero vulnerabilities.

Two fresh WebMCP-capable browser documents loaded the deployed commit. Each discovered
exactly seven tools and called the first six in order, reaching `COMPARED/6` with
OmniMotion Ultra at `84.6` in the commercial market and KinoForge Studio at `92.0` in
the clean room. Each unconfirmed `stage_demo_selection` call returned
`CONFIRMATION_REQUIRED` and remained at `COMPARED/6`. The prompt panel exposed all four
examples and the correct Devpost and video URLs. Both documents recorded no browser
warnings or errors.

The local production files matched the deployed Pages files byte-for-byte:

| File | SHA-256 |
| --- | --- |
| `dist/index.html` | `40a1d05b8634ec9eddd84b167d607d0c85c7a24b2f8476ce7da520887741bcf8` |
| `dist/assets/index-C01574OC.js` | `c8dd151295d420fbfcfe4972bc02604f33cc1901b5905d853feab2487b42ed32` |
| `dist/assets/index-CCq63vD4.css` | `658f10f8fe66e729d99d15b9922a86fb9d35927ea834ec2c372fbfc80be2ec15` |

The `package-lock.json` SHA-256 is
`cf54db52cf6044ea987f08f5c373468493afa58698d91dd4986c085c5ab5ab91`.
The sorted three-line production manifest hash is
`e41d9082e02a52e0964afe1141b10eea363f0e8d10ed102b0944b315bc8f0734`.

## Historical September 2 revalidation

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
- the complete manual browser flow, including the no-purchase disclosure;
- four copy-ready prompt paths, clipboard feedback, and prompt layouts at the exact
  responsive breakpoints.

### Historical V2 application candidate

The September 2, 2026 V2 candidate was:

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

Historical public evidence commit `11aa16f` adds five WebMCP handler-contract tests plus one
Playwright regression that preserves the canonical `$80` intent through `AUDITED/v4`
and `SELECTION_STAGED/v7`. Its suites pass 27 Vitest tests and 10 Playwright tests. No
production application file differs from the frozen candidate above. Its
[CI](https://github.com/Cjbooger/intent-for-sale-webmcp/actions/runs/33784865512) and
[Pages deployment](https://github.com/Cjbooger/intent-for-sale-webmcp/actions/runs/33784865679)
passed after PR #18 merged.

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

The current README hero was captured at 1440×900 from deployed candidate `b229e915`
after the manual flow reached `COMPARED/6`. A controlled registration stub exposed
the page's real WebMCP status path during capture; the separate browser-host checks above
provide native invocation proof. The image visibly includes the new prompt strip,
Devpost link, video link, commercial ranking, clean-room ranking, and Influence Trace.

| Current asset | App state | Exact image size | SHA-256 |
| --- | --- | --- | --- |
| [`current-interface-1440x900.png`](design/current-interface-1440x900.png) | `COMPARED/v6` | 1440×900 RGB PNG | `fc10bf13db2bb0ebd0b6887d79985447065212532d0ba62285001c04fdb872ba` |

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
controlled WebMCP registration stub. An independent native WebMCP-host replay of
the seven calls showed the `$80.00/month` intent at both `AUDITED/v4` and
`SELECTION_STAGED/v7`. After PR #18 merged, both replacements were fetched from
immutable public-repository commit
[`11aa16f4d56fb5b8c8248aa6b79a1b670fe1c862`](https://github.com/Cjbooger/intent-for-sale-webmcp/commit/11aa16f4d56fb5b8c8248aa6b79a1b670fe1c862)
and matched the local files byte-for-byte. They are repository documentation assets,
not files in the GitHub Pages `dist` artifact.

| Asset | App state | Exact image size | SHA-256 | Visible proof |
| --- | --- | --- | --- | --- |
| [`verified-dashboard-1280x720.png`](design/verified-dashboard-1280x720.png) | `MARKET_RANKED/v3` | 1280×720 RGB PNG | `3e5cc38f14419efc5be74edbcdbf501f61d192fb478324171ecbb66c8809d78c` | WebMCP active, five fictional bids, and OmniMotion at `84.6/#1`. |
| [`evidence-influence-receipt-v4-1440x900.png`](design/evidence-influence-receipt-v4-1440x900.png) | `AUDITED/v4` | 1440×900 RGB PNG | `586287f02da755d632fe8ec6af236ac892359d9d656f80e09b2ca58273b9f3d3` | Canonical `$80.00/month` intent, `54.6 + 30.0 = 84.6`, market `#1`, clean-room `#5`, and simulated `$24` CPA. |
| [`verified-dashboard-1440x900.png`](design/verified-dashboard-1440x900.png) | `COMPARED/v6` | 1440×900 RGB PNG | `7d74964b75414b8979d67542a48d73f52f185538d951ad264ed8223baefdd491` | Sponsor policy blocked and KinoForge reversed from market `#4` to clean-room `#1` at `92.0`. |
| [`evidence-ledger-and-selection-v7-1440x900.png`](design/evidence-ledger-and-selection-v7-1440x900.png) | `SELECTION_STAGED/v7` | 1440×900 RGB PNG | `d64cb57d8bb7bcdfb018f3ec7baa9e6ece939452d0bda80475c975ee96f0c082` | Canonical `$80.00/month` intent, all seven ledger entries, the staged KinoForge result, and `NO PURCHASE`. |

The captures contain only deterministic fictional fixture data and no browser,
account, user, or unrelated-project information. The four V2 files remain historical
evidence for the unchanged decision flow; the current README hero documents the prompt
and resource-link addition. The images do not prove behavior in every WebMCP host.
