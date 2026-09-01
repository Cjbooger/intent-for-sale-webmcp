# Deployed verification

This note records the deployed HTTPS checks performed on September 1, 2026. It
separates evidence from the live page, evidence from an unsupported browser
fallback, and the host-dependent proof that is still required.

Target: <https://cjbooger.github.io/intent-for-sale-webmcp/>

## Proof matrix

| Area | Result | Evidence and boundary |
| --- | --- | --- |
| Public deployment | Proven | The HTTPS page returned `200` from GitHub Pages. The HTML referenced the deployed hashed JavaScript and CSS assets; each returned `200`. |
| Public artifact content | Proven | The deployed JavaScript contains the seven canonical tool names and the `modelContext`/`registerTool` registration path. This proves the published artifact contains the implementation, not that a host can discover it. |
| Registration contract and handlers | Simulated/unit-tested | The repository's automated suite passes 22 tests, including exactly-seven registration, lifecycle cleanup, schemas, state ordering, and shared handlers. These tests do not prove a deployed host can enumerate or call the tools. |
| Native WebMCP discovery | Pending host proof | Two independent fresh in-app-browser tabs displayed the page-side status `WebMCP active — 7 tools registered`, but host-side tool enumeration failed both times because the connected adapter does not support `webmcp_list_tools`. No native tool list or native tool call is claimed. |
| Unsupported-browser detection | Proven | A fresh Chrome tab displayed `WebMCP unavailable — manual fallback enabled` and exposed no WebMCP tab capability. |
| Manual fallback | Proven | The complete sequence finished in Chrome: intent → auction → market ranking → influence receipt → clean-room policy → comparison → confirmed fictional staged selection. Final state was `SELECTION_STAGED`; the page stated that no purchase occurred. |
| Console | Proven for this run | The Chrome tab returned zero captured console entries after load and the full fallback flow. This is not a claim about every browser host. |
| Network/assets | Partially proven | The deployed asset inventory observed one JavaScript file, one stylesheet, and the site favicon. The page has no observed application-data asset; this is not a full HAR or universal no-network claim. |

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

## Remaining required proof

The release still needs two fresh independent runs in a real judge-compatible
WebMCP host, with an observable list of exactly these seven registered tools and
successful calls through the full sequence:

1. `create_intent_session`
2. `run_simulated_ad_auction`
3. `get_market_recommendations`
4. `inspect_recommendation_influence`
5. `set_recommendation_policy`
6. `compare_market_to_clean_room`
7. `stage_demo_selection`

Until that host proof is available, the deployed result should be described as
WebMCP implementation present plus a verified manual fallback, not as completed
deployed WebMCP discovery.
