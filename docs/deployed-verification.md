# Deployed verification

This note records the deployed HTTPS checks performed on September 2–3, 2026 PDT.
It separates live native WebMCP proof, source and build proof, and the ordinary-browser
fallback.

Target: <https://cjbooger.github.io/intent-for-sale-webmcp/>

Application candidate:
[`b229e9157751886b053fdbe29d9b6b8bffeda060`](https://github.com/Cjbooger/intent-for-sale-webmcp/commit/b229e9157751886b053fdbe29d9b6b8bffeda060)
(tree `99a8aa1af993671e43276c307b16926f2b5d22f2`).

That exact commit passed [CI](https://github.com/Cjbooger/intent-for-sale-webmcp/actions/runs/33831354411)
and [Pages deployment](https://github.com/Cjbooger/intent-for-sale-webmcp/actions/runs/33831354403).
Native discovery, six-step comparison, the unconfirmed-selection guardrail, prompt
panel, public links, manual fallback, and deployed file hashes were then checked against
the public candidate.

## Visual capture provenance

The current README hero was captured at 1440×900 from deployed candidate `b229e915`
after the manual fallback reached `COMPARED/v6`. A controlled registration stub made
the page's WebMCP status visible during capture. The separate browser-host runs below are
the native invocation proof.

| Current asset | State | Exact image size | SHA-256 |
| --- | --- | --- | --- |
| [`current-interface-1440x900.png`](design/current-interface-1440x900.png) | `COMPARED/v6` | 1440×900 RGB PNG | `fc10bf13db2bb0ebd0b6887d79985447065212532d0ba62285001c04fdb872ba` |

The four images below are retained as historical V2 evidence for the unchanged decision
flow and scoring fixture.

The original four release screenshots were captured from the clean public URL in a
WebMCP-capable browser host. The browser-produced JPEG encodings were normalized to
true RGB PNG files without another lossy encode. Their file signatures, dimensions,
and SHA-256 hashes were checked locally. The public bytes at immutable evidence commit
[`cce9dbb7b5e214f302d2ed6fbab2bdf970d8c3f2`](https://github.com/Cjbooger/intent-for-sale-webmcp/commit/cce9dbb7b5e214f302d2ed6fbab2bdf970d8c3f2)
matched that original four-image set byte-for-byte. Two fresh browser documents also
completed the seven native calls in order and recorded empty error and warning logs.

On September 3, an integrity review found that the original receipt and ledger images
showed a `$250.00/month` budget inconsistent with the canonical `$80.00/month`
scenario. Those two files were recaptured at 1440×900 from the then-current application
code using a controlled WebMCP registration stub and the canonical input. A
separate native WebMCP-host run completed all seven calls and displayed the same `$80`
budget at `AUDITED/v4` and `SELECTION_STAGED/v7`. The replacement PNGs are source
evidence for this revision. After PR #18 merged, both files were fetched from immutable
public-repository commit
[`11aa16f4d56fb5b8c8248aa6b79a1b670fe1c862`](https://github.com/Cjbooger/intent-for-sale-webmcp/commit/11aa16f4d56fb5b8c8248aa6b79a1b670fe1c862)
and matched the local release files byte-for-byte. These documentation images are public
repository assets; they are not part of the GitHub Pages `dist` artifact.

| Asset | State | Exact image size | SHA-256 |
| --- | --- | --- | --- |
| [`verified-dashboard-1280x720.png`](design/verified-dashboard-1280x720.png) | `MARKET_RANKED/v3` | 1280×720 RGB PNG | `3e5cc38f14419efc5be74edbcdbf501f61d192fb478324171ecbb66c8809d78c` |
| [`evidence-influence-receipt-v4-1440x900.png`](design/evidence-influence-receipt-v4-1440x900.png) | `AUDITED/v4` | 1440×900 RGB PNG | `586287f02da755d632fe8ec6af236ac892359d9d656f80e09b2ca58273b9f3d3` |
| [`verified-dashboard-1440x900.png`](design/verified-dashboard-1440x900.png) | `COMPARED/v6` | 1440×900 RGB PNG | `7d74964b75414b8979d67542a48d73f52f185538d951ad264ed8223baefdd491` |
| [`evidence-ledger-and-selection-v7-1440x900.png`](design/evidence-ledger-and-selection-v7-1440x900.png) | `SELECTION_STAGED/v7` | 1440×900 RGB PNG | `d64cb57d8bb7bcdfb018f3ec7baa9e6ece939452d0bda80475c975ee96f0c082` |

The original captures document the rendered deployed surface for this runtime release.
The two replacement files document the same canonical source scenario and have an
immutable public-repository byte match. Neither replaces the discovery, invocation,
source, or fallback boundaries below.

## Proof matrix

| Area | Result | Evidence and boundary |
| --- | --- | --- |
| Public deployment | Proven | The HTTPS page returned `200` from GitHub Pages and referenced the `index-C01574OC.js` and `index-CCq63vD4.css` assets from candidate `b229e915`; each asset returned `200`. |
| Exact deployed artifact | Proven | The local production `index.html`, JavaScript, and CSS hashes matched the three public Pages files byte-for-byte. |
| Public repository and license | Proven | Logged-out HTTP requests returned `200` for the public repository and the immutable candidate's MIT license. |
| Registration contract and handlers | Simulated/unit-tested | Candidate `b229e915` passes 30 Vitest tests and 11 Playwright tests. Coverage includes exactly-seven registration, lifecycle cleanup, schemas, state ordering, shared handlers, the confirmation boundary, prompt copy feedback, responsive prompt layouts, and preservation of the canonical `$80` intent. These tests do not prove a deployed host can enumerate or call the tools. |
| Native WebMCP discovery and invocation | Proven | Two independent fresh WebMCP-capable browser documents at the clean public URL each reported `WebMCP active` and `7 tools registered`. Each document invoked the first six tools through `COMPARED/6`; an unconfirmed seventh call returned `CONFIRMATION_REQUIRED` without changing state. Earlier V2 browser proof completed the confirmed seven-call path. |
| Unsupported-browser detection | Proven | A fresh Chrome tab displayed `WebMCP unavailable — manual fallback enabled` and exposed no WebMCP capability. |
| Manual fallback | Proven | The earlier V2 Chrome run completed the full manual sequence through `SELECTION_STAGED`. Candidate `b229e915` keeps the same handlers; its Playwright suite repeats the complete fallback flow and no-purchase check. |
| Prompt panel and links | Proven | The live panel exposed four copy-ready prompts plus the exact Devpost and demo-video URLs at desktop width. Automated browser checks cover the expanded panel at 1440, 1100, 760, and 360 pixels without horizontal overflow. |
| Console | Proven for these runs | Error and warning logs were empty in both current native WebMCP documents. The automated Chromium regression also asserts clean warning/error logs during the fallback flow. This is not a claim about every browser host. |
| Network/assets | Bounded proof | The public HTML and its one hashed JavaScript and one hashed stylesheet matched the clean production build. This is not a full HAR or a universal no-network claim. |

## Reproducible candidate

GitHub Actions checked out candidate `b229e915`, installed from the lockfile, and passed
TypeScript checking, 30 Vitest tests, and the production build. The local release gate
also passed 11 Playwright tests and `npm audit --audit-level=high` with zero
vulnerabilities.

| Production file | SHA-256 |
| --- | --- |
| `dist/index.html` | `40a1d05b8634ec9eddd84b167d607d0c85c7a24b2f8476ce7da520887741bcf8` |
| `dist/assets/index-C01574OC.js` | `c8dd151295d420fbfcfe4972bc02604f33cc1901b5905d853feab2487b42ed32` |
| `dist/assets/index-CCq63vD4.css` | `658f10f8fe66e729d99d15b9922a86fb9d35927ea834ec2c372fbfc80be2ec15` |

The `package-lock.json` SHA-256 is
`cf54db52cf6044ea987f08f5c373468493afa58698d91dd4986c085c5ab5ab91`.
The sorted three-line production manifest hash is
`e41d9082e02a52e0964afe1141b10eea363f0e8d10ed102b0944b315bc8f0734`.

## Native WebMCP proof

The host enumerated exactly these seven registered tools from the deployed origin:

1. `create_intent_session`
2. `run_simulated_ad_auction`
3. `get_market_recommendations`
4. `inspect_recommendation_influence`
5. `set_recommendation_policy`
6. `compare_market_to_clean_room`
7. `stage_demo_selection`

Two fresh documents on candidate `b229e915` called the first six tools in order. The
observed state/version sequence in both was:

```text
INTENT_READY/1
AUCTION_COMPLETE/2
MARKET_RANKED/3
AUDITED/4
POLICY_UPDATED/5
COMPARED/6
```

Each document then called `stage_demo_selection` with `userConfirmed: false`. Both calls
returned `CONFIRMATION_REQUIRED` and stayed at `COMPARED/6`. The live tool surface
exposed all seven schemas from the deployed origin, and both documents recorded empty
warning and error logs.

Both sessions returned the expected observable facts:

- Commercial market: OmniMotion Ultra at rank 1, score `84.6` (`54.6 + 30.0`).
- Influence receipt: market rank `#1`, clean-room rank `#5`, and commercial
  contribution `30.0`.
- Policy: sponsorship `block`, maximum sponsor weight `0`, inferred signals
  `false`, strict constraints, and reason codes required.
- Comparison: the top choice changed to KinoForge Studio at clean-room rank `#1`;
  the result identified OmniMotion as commercially favored and recorded `$24` of
  simulated revenue forgone.
- Guardrail: an unconfirmed selection did not change state or increment the version.

The earlier V2 browser proof completed the confirmed seven-call path through
`SELECTION_STAGED/7`. Candidate `b229e915` does not change any tool definition, handler,
or state action, and the current automated suites cover the confirmed success path.

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

The candidate has two fresh, independent native WebMCP discovery, comparison, and
guardrail proofs; a complete automated fallback proof; and a deployed-byte match to its
local production build. This record is documentation for that application candidate. A
later documentation-only commit does not become a new application candidate if the
deployed HTML, JavaScript, and CSS hashes remain identical. If an application file,
deployed hash, or tool contract changes, cut a new candidate and repeat the checks before
reusing this evidence.
