# Deployed verification

This note records the deployed HTTPS checks performed on September 1, 2026. It
separates live native WebMCP proof, simulated/unit-tested proof, and the ordinary
browser fallback.

Target: <https://cjbooger.github.io/intent-for-sale-webmcp/>

Native WebMCP discovery and invocation, the manual fallback flow, and the visual
captures were revalidated against the public `main` build at commit
`b959728d8121803e239dd08a510ead2b4e88d582` on September 1, 2026 PDT.

## Visual capture provenance

Four release screenshots were captured from the clean public URL in a WebMCP-capable
browser host after the host enumerated exactly seven page-defined tools. Two fresh documents
each completed the seven calls in order and recorded empty browser error and warning
logs.

| Asset | State | Exact image size |
| --- | --- | --- |
| [`verified-dashboard-1280x720.png`](design/verified-dashboard-1280x720.png) | `MARKET_RANKED/v3` | 1280×720 PNG |
| [`evidence-influence-receipt-v4-1440x900.png`](design/evidence-influence-receipt-v4-1440x900.png) | `AUDITED/v4` | 1440×900 PNG |
| [`verified-dashboard-1440x900.png`](design/verified-dashboard-1440x900.png) | `COMPARED/v6` | 1440×900 PNG |
| [`evidence-ledger-and-selection-v7-1440x900.png`](design/evidence-ledger-and-selection-v7-1440x900.png) | `SELECTION_STAGED/v7` | 1440×900 PNG |

These captures document the rendered deployed surface for this runtime release; they
do not replace the discovery, invocation, source, or fallback boundaries below.

## Proof matrix

| Area | Result | Evidence and boundary |
| --- | --- | --- |
| Public deployment | Proven | The HTTPS page returned `200` from GitHub Pages. The HTML referenced the deployed hashed JavaScript and CSS assets; each returned `200`. |
| Public artifact content | Proven | The deployed JavaScript contains the seven canonical tool names and the `document.modelContext`/`registerTool` registration path. |
| Registration contract and handlers | Simulated/unit-tested | The repository's automated suite passes 22 tests, including exactly-seven registration, lifecycle cleanup, schemas, state ordering, and shared handlers. These tests do not prove a deployed host can enumerate or call the tools. |
| Native WebMCP discovery and invocation | Proven | Two independent fresh WebMCP-capable browser documents at the clean public URL each visibly reported `WebMCP active` and `7 tools registered`. The host enumerated exactly the seven tools listed below, and both documents invoked all seven in order. |
| Unsupported-browser detection | Proven | A fresh Chrome tab displayed `WebMCP unavailable — manual fallback enabled` and exposed no WebMCP tab capability. |
| Manual fallback | Proven | The complete sequence finished in Chrome: intent → auction → market ranking → influence receipt → clean-room policy → comparison → confirmed fictional staged selection. Final state was `SELECTION_STAGED`; the page stated that no purchase occurred. |
| Console | Proven for these runs | Error and warning logs were empty in both native WebMCP documents. The automated Chromium regression also asserts clean warning/error logs during the fallback flow. This is not a claim about every browser host. |
| Network/assets | Partially proven | The observed deployed asset inventory consisted of one JavaScript file and one stylesheet. This is not a full HAR or universal no-network claim. |

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

The deployed release now has two fresh, independent native WebMCP discovery and
invocation proofs plus a complete ordinary-browser fallback proof. If the deployed
commit or tool contract changes, repeat both native sessions and the fallback before
reusing this evidence.
