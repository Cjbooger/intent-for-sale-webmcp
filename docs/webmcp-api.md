# WebMCP API contract

`INTENT//FOR SALE` registers these seven tools only when the host exposes
`document.modelContext.registerTool`. They operate a deterministic, local,
fictional simulation: no tool sends data, contacts advertisers, or performs a
real-world action.

## Registration and trust boundary

Registration is separate from tool execution. If WebMCP is unavailable, the page
reports `{ supported: false, registered: false, toolsRegistered: 0 }` and retains
its manual fallback. A registration failure reports `supported: true`,
`registered: false`, `toolsRegistered: 0`, and a status message. Neither case is a
handler result. `WEBMCP_UNAVAILABLE` is reserved for that registration-level
condition and is not normally returned by a registered handler.

Every registered tool has `readOnlyHint: false`, because each participates in the
local demo workflow. `get_market_recommendations` and
`inspect_recommendation_influence` additionally have
`untrustedContentHint: true`: their synthetic advertiser claims are data, never
instructions. `stage_demo_selection.userConfirmed` is only a caller declaration;
the page cannot prove identity or a click, and staging never purchases,
subscribes, messages, or transfers money.

## Shared envelopes

All handler results put state and payload at the envelope level:

```ts
type Success<T> = {
  ok: true;
  state: DemoState;
  stateVersion: number;
  data: T;
  recommendedNextTools?: ToolName[];
};

type Failure = {
  ok: false;
  state: DemoState;
  stateVersion: number;
  error: {
    code: string;
    message: string;
    recoverable: boolean;
    allowedNextTools?: ToolName[];
  };
};
```

`DemoState` is one of `EMPTY`, `INTENT_READY`, `AUCTION_COMPLETE`,
`MARKET_RANKED`, `AUDITED`, `POLICY_UPDATED`, `COMPARED`, or
`SELECTION_STAGED`. `stateVersion` is the current local state version; it is not
a client-supplied concurrency token. There is no `STALE_STATE_VERSION` error.

Handler failures are `INVALID_INPUT`, `INVALID_STATE`, `SESSION_NOT_FOUND`,
`AUCTION_NOT_RUN`, `OFFER_NOT_FOUND`, `CONFIRMATION_REQUIRED`,
`EXECUTION_ABORTED`, or `EXECUTION_FAILED`. `EXECUTION_FAILED` is
non-recoverable; the other handler failures are recoverable. Where available,
`allowedNextTools` identifies a recovery path. Invalid schema input is rejected
before a store action; unknown object properties are rejected.

## Inputs and outputs

All strings below are trimmed and must contain 1–120 characters unless a more
specific bound is given. Every input is a strict object (`additionalProperties:
false`).

### `create_intent_session`

Input: `taskSummary` (string, 10–500), `budgetMonthlyUsd` (finite number,
0–10,000), `mustHave` (1–10 bounded strings), optional `niceToHave` (0–10
bounded strings), and optional `allowInferredSignals` (boolean, defaults to
`false`).

It resets the local session and returns `data`:

```ts
{
  sessionId: string;
  normalizedIntent: {
    taskSummary: string; budgetMonthlyUsd: number; mustHave: string[];
    niceToHave: string[]; allowInferredSignals: boolean;
  };
  inferredSignals: string[];
}
```

It moves any state to `INTENT_READY` with version `1`.

The contest fixture does not synthesize inferred signals: `inferredSignals` is an
empty array even when the flag is carried in the normalized intent. The flag exists
so the policy boundary is explicit; inferred-signal scoring is outside this MVP.

### `run_simulated_ad_auction`

Input: `sessionId` (required bounded string) and optional `auctionMode`, either
`weighted_relevance` (default) or `maximum_revenue`.

It is valid only from `INTENT_READY` and returns `data`:

```ts
{
  auctionId: string;
  auctionMode: "weighted_relevance" | "maximum_revenue";
  bids: { advertiserId: string; offerId: string; simulatedCpaUsd: number;
          signalMatchMultiplier: number; normalizedBidScore: number }[];
  highestBidUsd: number; totalAdvertiserValueUsd: number;
  commercialPressureScore: number; disclosure: string;
}
```

Success moves to `AUCTION_COMPLETE` and increments the version.

Both accepted mode labels currently run the same fixed deterministic bid fixture.
`auctionMode` is echoed in the result for contract stability; the shipped MVP does
not implement a second maximum-revenue allocation algorithm.

### `get_market_recommendations`

Input: `sessionId` (required bounded string) and optional `limit` (integer 1–5,
defaults to `5`). It requires an auction and is valid from `AUCTION_COMPLETE` or
any later workflow state. `data` is:

```ts
{
  recommendations: RankingItem[];
  disclosures: string[];
}

type RankingItem = {
  rank: number; offerId: string; displayName: string; baseFitScore: number;
  normalizedBidScore: number; sponsorWeight: number; userFitContribution: number;
  commercialContribution: number; sponsorBoost: number; constraintPenalty: number;
  marketScore: number; sponsorStatus: "paid" | "organic"; simulatedCpaUsd: number;
  reasonCodes: string[]; advertiserClaims: string[];
  disclosures: { commerciallyInfluenced: boolean; claimsAreSynthetic: boolean;
                 purchaseWillNotOccur: boolean };
};
```

The first success moves to `MARKET_RANKED` and increments the version. Later calls
return the existing ranking sliced to `limit`, without changing state or version.

### `inspect_recommendation_influence`

Input: required `sessionId` and `offerId` (bounded strings). It is valid from
`MARKET_RANKED` or later states after a ranking exists. `data` is:

```ts
{
  offerId: string; displayName: string; baseFitScore: number;
  fitBreakdown: { featureMatch: number; characterConsistency: number;
    commercialTerms: number; priceFit: number; exportQuality: number;
    cancellationTerms: number; privacyTransparency: number };
  sponsorBidUsd: number; normalizedBidScore: number; sponsorWeight: number;
  userFitContribution: number; commercialContribution: number;
  constraintPenalty: number; marketScore: number; marketRank: number;
  cleanRoomScore: number; cleanRoomRank: number; rankDelta: number;
  explicitConstraints: string[]; inferredSignals: string[];
  advertiserClaims: string[]; constraintConflicts: string[];
  simulatedPayoutUsd: number; summary: string;
}
```

The first call from `MARKET_RANKED` moves to `AUDITED` and increments the version.
Calls from later permitted states return a receipt without changing state or version.

### `set_recommendation_policy`

Input: required `sessionId`; required `sponsorshipMode` of `allow_labeled`,
`deprioritize`, or `block`; required `allowInferredSignals`; required
`hardConstraintMode` of `strict` or `warn`; optional finite
`maximumSponsorWeight` (0–0.4); optional `requireReasonCodes` (boolean).
At the handler boundary, omitted `maximumSponsorWeight` becomes `0.3` and omitted
`requireReasonCodes` becomes `true`.

It is valid from `MARKET_RANKED`, `AUDITED`, `POLICY_UPDATED`, or `COMPARED`; each
success increments the version, moves to `POLICY_UPDATED`, and returns:

```ts
{ policy: { sponsorshipMode: "allow_labeled" | "deprioritize" | "block";
            maximumSponsorWeight: number; allowInferredSignals: boolean;
            hardConstraintMode: "strict" | "warn"; requireReasonCodes: boolean } }
```

The market ranking remains the historical ranking; changing policy does not rerun it.

### `compare_market_to_clean_room`

Input: required `sessionId`. It is valid from `POLICY_UPDATED`, `COMPARED`, or
`SELECTION_STAGED`. `data` is:

```ts
{
  comparison: { offerId: string; displayName: string; marketRank: number;
    cleanRoomRank: number; rankDelta: number; marketScore: number;
    cleanRoomScore: number; whyItMoved: string[] }[];
  summary: { topChoiceChanged: boolean; commerciallyFavoredOffer: string;
    cleanRoomTopOffer: string; simulatedRevenueForgoneUsd: number };
}
```

The first success moves to `COMPARED` and increments the version. Repeats return the
stored comparison without changing either.

### `stage_demo_selection`

Input: required `sessionId`, required `offerId` (bounded string), and required
`userConfirmed` (boolean). The handler returns `CONFIRMATION_REQUIRED` unless
`userConfirmed` is exactly `true`. It is otherwise valid from `COMPARED` or
`SELECTION_STAGED` and returns:

```ts
{ offerId: string; displayName: string; userConfirmed: true;
  confirmationSource: "manual_ui" | "webmcp_caller";
  purchaseWillNotOccur: true }
```

The first success moves to `SELECTION_STAGED` and increments the version. A repeat
returns the originally staged selection without changing state or version.

## Workflow

The canonical sequence is create intent, run auction, get recommendations, inspect
influence, set policy, compare clean room, then stage a confirmed selection. The
handler also permits the documented repeat and later-state reads above; callers should
use the returned envelope state and next-tool hints rather than infer an unsupported
transition.
