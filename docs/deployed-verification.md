# Deployed verification

This note records the final deployed HTTPS checks performed on September 1, 2026 PDT.
It separates live native WebMCP proof, source and build proof, and the ordinary-browser
fallback.

Target: <https://cjbooger.github.io/intent-for-sale-webmcp/>

Application candidate:
[`ba134c14ccb7792fa9c3a4bc2b449f7e5ce5d2dd`](https://github.com/Cjbooger/intent-for-sale-webmcp/commit/ba134c14ccb7792fa9c3a4bc2b449f7e5ce5d2dd)
(tree `2cb7321645f33d2d12036337437420f704f097f1`).

That exact commit passed [CI](https://github.com/Cjbooger/intent-for-sale-webmcp/actions/runs/33587053601)
and [Pages deployment](https://github.com/Cjbooger/intent-for-sale-webmcp/actions/runs/33587053626).
Native discovery and invocation, the manual fallback, public links, and deployed file
hashes were then revalidated against the public candidate.

## Visual capture provenance

Four release screenshots were originally captured from the clean public URL in a
WebMCP-capable browser host. Their committed bytes were fetched again through immutable
candidate URLs and matched the repository files exactly. Two new fresh browser documents
then completed the seven native calls in order and recorded empty error and warning logs.

| Asset | State | Exact image size | SHA-256 |
| --- | --- | --- | --- |
| [`verified-dashboard-1280x720.png`](design/verified-dashboard-1280x720.png) | `MARKET_RANKED/v3` | 1280×720 PNG | `7af3920df277bde5d25fa3f60d5d48129f7e483b29765b6a10523eeecce65a54` |
| [`evidence-influence-receipt-v4-1440x900.png`](design/evidence-influence-receipt-v4-1440x900.png) | `AUDITED/v4` | 1440×900 PNG | `557590176a2795052eb357d81c5225ce72333b58b4592e19fb65edf167d2cb27e` |
| [`verified-dashboard-1440x900.png`](design/verified-dashboard-1440x900.png) | `COMPARED/v6` | 1440×900 PNG | `fab504fea0219dd1c0be0fd0595627450ae1b565fd12c840f870ef710d10117f` |
| [`evidence-ledger-and-selection-v7-1440x900.png`](design/evidence-ledger-and-selection-v7-1440x900.png) | `SELECTION_STAGED/v7` | 1440×900 PNG | `f6c3d89486f40fef0926f29fa6e76f01a61aeca9046bc9a4a891727f03cc6fd8` |

These captures document the rendered deployed surface for this runtime release; they
do not replace the discovery, invocation, source, or fallback boundaries below.

## Proof matrix

| Area | Result | Evidence and boundary |
| --- | --- | --- |
| Public deployment | Proven | The HTTPS page returned `200` from GitHub Pages. The HTML referenced the deployed hashed JavaScript and CSS assets; each returned `200`. |
| Exact deployed artifact | Proven | The clean-clone production `index.html`, JavaScript, and CSS hashes matched the three public Pages files byte-for-byte. |
| Public repository and license | Proven | Logged-out HTTP requests returned `200` for the public repository and the immutable candidate's MIT license. |
| Registration contract and handlers | Simulated/unit-tested | The repository's automated suite passes 22 tests, including exactly-seven registration, lifecycle cleanup, schemas, state ordering, and shared handlers. These tests do not prove a deployed host can enumerate or call the tools. |
| Native WebMCP discovery and invocation | Proven | Two independent fresh WebMCP-capable browser documents at the clean public URL each visibly reported `WebMCP active` and `7 tools registered`. The host enumerated exactly the seven tools listed below, and both documents invoked all seven in order. |
| Unsupported-browser detection | Proven | A fresh Google Chrome `152.0.7977.65` tab displayed `WebMCP unavailable — manual fallback enabled` and exposed no WebMCP capability. |
| Manual fallback | Proven | The complete sequence finished in Chrome: intent → auction → market ranking → influence receipt → clean-room policy → comparison → confirmed fictional staged selection. Final state was `SELECTION_STAGED`; the page stated that no purchase occurred. |
| Console | Proven for these runs | Error and warning logs were empty in both native WebMCP documents and the fresh manual-fallback tab. The automated Chromium regression also asserts clean warning/error logs during the fallback flow. This is not a claim about every browser host. |
| Network/assets | Bounded proof | The public HTML and its one hashed JavaScript and one hashed stylesheet matched the clean production build. This is not a full HAR or a universal no-network claim. |

## Reproducible candidate

A fresh clone of the public repository resolved to the full candidate SHA and tree above.
It then passed `npm ci`, the TypeScript check, 22 Vitest tests, the production build,
eight Playwright tests, and `npm audit --audit-level=high` with zero vulnerabilities.

| Production file | SHA-256 |
| --- | --- |
| `dist/index.html` | `3664866d24c304b8d7c87e4c0ad724d4345a4f861dd0ce28c25f96ca3d27486d` |
| `dist/assets/index-DROJcn7D.js` | `48132c1f691f931299fb376325ee38bd1ac1abc9bd571ee0349e22ee08b9420b` |
| `dist/assets/index-DS8jCVYD.css` | `e6047501d1da397e9cec0b261e2a0b12259db29c986777bdb5b7495c22ec0510` |

The `package-lock.json` SHA-256 is
`cf54db52cf6044ea987f08f5c373468493afa58698d91dd4986c085c5ab5ab91`.
The sorted three-line production manifest hash is
`7f47782f4cb0a70f4bb5b3bd2ea035d5ef4d736e2503e6b055d4bb0262cb8577`.

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

- Commercial market: OmniMotion Ultra at rank 1, score `84.6`.
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
