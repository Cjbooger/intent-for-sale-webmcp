# Deployed verification

This note records the final deployed HTTPS checks performed on September 2, 2026 PDT.
It separates live native WebMCP proof, source and build proof, and the ordinary-browser
fallback.

Target: <https://cjbooger.github.io/intent-for-sale-webmcp/>

Application candidate:
[`509ea6307b5916bf445b18abbb856c9f2a7ada6d`](https://github.com/Cjbooger/intent-for-sale-webmcp/commit/509ea6307b5916bf445b18abbb856c9f2a7ada6d)
(tree `10887fdcb402871febf47d13154f2e600161387d`).

That exact commit passed [CI](https://github.com/Cjbooger/intent-for-sale-webmcp/actions/runs/33640459929)
and [Pages deployment](https://github.com/Cjbooger/intent-for-sale-webmcp/actions/runs/33640460133).
Native discovery and invocation, the manual fallback, public links, and deployed file
hashes were then revalidated against the public candidate.

## Visual capture provenance

Four release screenshots were freshly captured from the clean public URL in a
WebMCP-capable browser host. The browser-produced JPEG encodings were normalized to
true RGB PNG files without another lossy encode. Their file signatures, dimensions,
and SHA-256 hashes were checked locally. The public bytes at immutable evidence commit
[`cce9dbb7b5e214f302d2ed6fbab2bdf970d8c3f2`](https://github.com/Cjbooger/intent-for-sale-webmcp/commit/cce9dbb7b5e214f302d2ed6fbab2bdf970d8c3f2)
were then fetched, identified as RGB PNGs, and matched all four repository files
byte-for-byte. Two fresh browser documents also completed the seven native calls in
order and recorded empty error and warning logs.

| Asset | State | Exact image size | SHA-256 |
| --- | --- | --- | --- |
| [`verified-dashboard-1280x720.png`](design/verified-dashboard-1280x720.png) | `MARKET_RANKED/v3` | 1280×720 RGB PNG | `3e5cc38f14419efc5be74edbcdbf501f61d192fb478324171ecbb66c8809d78c` |
| [`evidence-influence-receipt-v4-1440x900.png`](design/evidence-influence-receipt-v4-1440x900.png) | `AUDITED/v4` | 1440×900 RGB PNG | `ef1ec52e7d9264718dd0aca83ae26d3099c726f82a599a8de070f0bcc7e4f10d` |
| [`verified-dashboard-1440x900.png`](design/verified-dashboard-1440x900.png) | `COMPARED/v6` | 1440×900 RGB PNG | `7d74964b75414b8979d67542a48d73f52f185538d951ad264ed8223baefdd491` |
| [`evidence-ledger-and-selection-v7-1440x900.png`](design/evidence-ledger-and-selection-v7-1440x900.png) | `SELECTION_STAGED/v7` | 1440×900 RGB PNG | `e03a54cf2ce3909bcfe9c0be404db30d792e7f9d56e12c3b3f0c549e509ded21` |

These captures document the rendered deployed surface for this runtime release; they
do not replace the discovery, invocation, source, or fallback boundaries below.

## Proof matrix

| Area | Result | Evidence and boundary |
| --- | --- | --- |
| Public deployment | Proven | The HTTPS page returned `200` from GitHub Pages. The HTML referenced the deployed hashed JavaScript and CSS assets; each returned `200`. |
| Exact deployed artifact | Proven | The clean-clone production `index.html`, JavaScript, and CSS hashes matched the three public Pages files byte-for-byte. |
| Public repository and license | Proven | Logged-out HTTP requests returned `200` for the public repository and the immutable candidate's MIT license. |
| Registration contract and handlers | Simulated/unit-tested | The frozen application candidate passes 22 tests. The current documentation head adds five handler-contract tests and passes 27 total, with no production app changes. Coverage includes exactly-seven registration, lifecycle cleanup, schemas, state ordering, and shared handlers. These tests do not prove a deployed host can enumerate or call the tools. |
| Native WebMCP discovery and invocation | Proven | Two independent fresh WebMCP-capable browser documents at the clean public URL each visibly reported `WebMCP active` and `7 tools registered`. Each document enumerated exactly the seven tools listed below and invoked all states from `INTENT_READY/1` through `SELECTION_STAGED/7` in order. |
| Unsupported-browser detection | Proven | A fresh Chrome tab displayed `WebMCP unavailable — manual fallback enabled` and exposed no WebMCP capability. |
| Manual fallback | Proven | The complete sequence finished in Chrome: intent → auction → market ranking → influence receipt → clean-room policy → comparison → confirmed fictional staged selection. Final state was `SELECTION_STAGED`; the page stated that no purchase occurred. |
| Console | Proven for these runs | Error and warning logs were empty in both native WebMCP documents and the fresh manual-fallback tab. The automated Chromium regression also asserts clean warning/error logs during the fallback flow. This is not a claim about every browser host. |
| Network/assets | Bounded proof | The public HTML and its one hashed JavaScript and one hashed stylesheet matched the clean production build. This is not a full HAR or a universal no-network claim. |

## Reproducible candidate

A fresh public checkout pinned to the full candidate SHA and tree above passed `npm ci`,
the TypeScript check, 22 Vitest tests, the production build, nine Playwright tests, and
`npm audit --audit-level=high` with zero vulnerabilities. The current public
documentation head separately passes 27 Vitest tests; its five additional tests do not
change the production application.

| Production file | SHA-256 |
| --- | --- |
| `dist/index.html` | `bc60bf08d1991e575e9cd18c37c6223bd6e3a3984c9f001a3efa019803e30726` |
| `dist/assets/index-fuLXQfjI.js` | `e74c54357fc7097604bcb35c3d79f2175fbdeef863c1f693df96aa44e1329c41` |
| `dist/assets/index-Bxr4Y1pL.css` | `eb5b531caa3df120f71823fcc3cf9c86be4e82432a0ce546d8bf5beb470063e4` |

The `package-lock.json` SHA-256 is
`cf54db52cf6044ea987f08f5c373468493afa58698d91dd4986c085c5ab5ab91`.
The sorted three-line production manifest hash is
`652853487473b93ee67e8e70def819d43378bf322cd5d7090054f8cf739a6f15`.

## Native WebMCP proof

The host enumerated exactly these seven registered tools from the deployed origin:

1. `create_intent_session`
2. `run_simulated_ad_auction`
3. `get_market_recommendations`
4. `inspect_recommendation_influence`
5. `set_recommendation_policy`
6. `compare_market_to_clean_room`
7. `stage_demo_selection`

Fresh document 1 called each tool individually in that order. The observed state/version
sequence was:

```text
INTENT_READY/1
AUCTION_COMPLETE/2
MARKET_RANKED/3
AUDITED/4
POLICY_UPDATED/5
COMPARED/6
SELECTION_STAGED/7
```

Fresh document 2 repeated the same seven calls in a second fresh document and produced the
same states and versions. Its live tool description also exposed all seven input
schemas from the deployed origin.

Both sessions returned the expected observable facts:

- Commercial market: OmniMotion Ultra at rank 1, score `84.6` (`54.6 + 30.0`).
- Influence receipt: market rank `#1`, clean-room rank `#5`, and commercial
  contribution `30.0`.
- Policy: sponsorship `block`, maximum sponsor weight `0`, inferred signals
  `false`, strict constraints, and reason codes required.
- Comparison: the top choice changed to KinoForge Studio at clean-room rank `#1`;
  the result identified OmniMotion as commercially favored and recorded `$24` of
  simulated revenue forgone.
- Staged demo: KinoForge Studio with `confirmationSource: webmcp_caller` and
  `purchaseWillNotOccur: true`; the page showed the no-purchase result.

The WebMCP surface uses the page's `document.modelContext` API. The staged tool's
`userConfirmed: true` value is a caller declaration, not proof of a human click or
an authorization primitive. The staged result is local, reversible demo state and
cannot purchase, subscribe, transfer money, or contact anyone.

## Manual fallback result

The fixed synthetic scenario produced the expected observable values:

- Commercial market: OmniMotion Ultra at rank 1, score `84.6`.
- Influence receipt: base contribution `54.6`, commercial contribution `30.0`,
  normalized bid `100.0`, and simulated CPA `$24.00`.
- Clean room: KinoForge Studio at rank 1, base-fit score `92.0`; the page showed
  the rank reversal from commercial rank 4 to clean-room rank 1.
- Staged demo: KinoForge Studio confirmed through the manual confirmation dialog;
  the page explicitly stated `NO PURCHASE` and `No purchase occurred.`

All offers, claims, bids, scores, and payouts in this scenario are fictional.

## Release interpretation

The candidate has two fresh, independent native WebMCP discovery and invocation proofs,
a complete ordinary-browser fallback proof, and a deployed-byte match to its clean
production build. This record is documentation for that application candidate; a later
documentation-only commit does not become a new application candidate if the deployed
HTML, JavaScript, and CSS hashes remain identical. If an application file, deployed
hash, or tool contract changes, cut a new candidate and repeat both native sessions and
the fallback before reusing this evidence.
