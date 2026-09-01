import { useEffect, useMemo, useState } from "react";
import { ActivityLedger } from "./components/ActivityLedger";
import { Bidstream } from "./components/Bidstream";
import { InfluenceReceipt } from "./components/InfluenceReceipt";
import { IntentManifest } from "./components/IntentManifest";
import { PolicyConsole } from "./components/PolicyConsole";
import { RecommendationBoard } from "./components/RecommendationBoard";
import { SelectionConfirmation } from "./components/SelectionConfirmation";
import { WebMCPStatus } from "./components/WebMCPStatus";
import type { DemoViewModel, OfferView, PolicyView } from "./components/types";
import { DEFAULT_DEMO_INTENT, DEMO_OFFERS } from "./data/demoScenario";
import { rankCleanRoom, rankMarket, runAuction } from "./domain/engine";
import { useDemoStore } from "./store/demoStore";
import { registerWebMcpTools } from "./webmcp/registerTools";
import type { WebMcpStatus as WebMcpStatusValue } from "./webmcp/types";

type UnknownStore = Record<string, any>;

const DEFAULT_INTENT = DEFAULT_DEMO_INTENT;

const DISPLAY_METADATA: Record<string, { price: number; constraintStatus: string }> = {
  "omnimotion-ultra": { price: 80, constraintStatus: "meets core requirements" },
  "promptcloud-infinite": { price: 72, constraintStatus: "review credit overages" },
  "localframe-oss": { price: 0, constraintStatus: "setup required" },
  "kinoforge-studio": { price: 80, constraintStatus: "best base fit" },
  "renderrush-creator": { price: 65, constraintStatus: "weaker commercial terms" },
};

const initialMarket = rankMarket(runAuction());
const initialCleanRoom = rankCleanRoom();
const DEFAULT_OFFERS: OfferView[] = initialMarket.items.map((marketItem) => {
  const offer = DEMO_OFFERS.find((candidate) => candidate.offerId === marketItem.offerId)!;
  const cleanItem = initialCleanRoom.items.find((candidate) => candidate.offerId === marketItem.offerId)!;
  const display = DISPLAY_METADATA[marketItem.offerId] ?? { price: 0, constraintStatus: "fixture result" };
  return {
    id: marketItem.offerId,
    name: marketItem.displayName,
    price: display.price,
    baseFitScore: marketItem.baseFitScore,
    marketScore: marketItem.marketScore,
    cleanRoomScore: cleanItem.cleanRoomScore,
    marketRank: marketItem.rank,
    cleanRoomRank: cleanItem.rank,
    sponsorStatus: marketItem.sponsorStatus,
    sponsorBidUsd: marketItem.simulatedCpaUsd,
    sponsorBoost: marketItem.commercialContribution,
    constraintStatus: display.constraintStatus,
    claims: [...offer.advertiserClaims],
  };
});

function invoke(store: UnknownStore, names: string[], ...args: any[]) {
  for (const name of names) if (typeof store[name] === "function") return store[name](...args);
  return undefined;
}

function normalizeOffer(raw: any, fallback: OfferView): OfferView {
  return {
    ...fallback,
    ...raw,
    id: raw?.id ?? raw?.offerId ?? fallback.id,
    name: raw?.name ?? raw?.displayName ?? fallback.name,
    baseFitScore: Number(raw?.baseFitScore ?? raw?.baseFit ?? fallback.baseFitScore),
    marketScore: Number(raw?.marketScore ?? raw?.finalScore ?? fallback.marketScore),
    cleanRoomScore: Number(raw?.cleanRoomScore ?? raw?.baseFitScore ?? fallback.cleanRoomScore),
    marketRank: Number(raw?.marketRank ?? (raw?.marketScore !== undefined ? raw?.rank : fallback.marketRank)),
    cleanRoomRank: Number(raw?.cleanRoomRank ?? (raw?.cleanRoomScore !== undefined ? raw?.rank : fallback.cleanRoomRank)),
    sponsorBidUsd: Number(raw?.sponsorBidUsd ?? raw?.simulatedCpaUsd ?? raw?.sponsorBid ?? fallback.sponsorBidUsd),
    sponsorBoost: Number(raw?.sponsorBoost ?? raw?.commercialContribution ?? fallback.sponsorBoost),
    sponsorStatus: raw?.sponsorStatus ?? (raw?.simulatedCpaUsd ? "paid" : fallback.sponsorStatus),
    claims: raw?.claims ?? raw?.advertiserClaims ?? fallback.claims,
  };
}

function readViewModel(store: UnknownStore, webmcp: WebMcpStatusValue): DemoViewModel {
  const intent = store.intent ?? store.normalizedIntent ?? store.session?.normalizedIntent ?? DEFAULT_INTENT;
  const rawOffers = store.marketRanking?.items ?? store.marketRecommendations ?? store.recommendations ?? store.market?.recommendations;
  const fallbackFor = (raw: any, index: number) => DEFAULT_OFFERS.find((candidate) => candidate.id === (raw?.id ?? raw?.offerId)) ?? DEFAULT_OFFERS[index] ?? DEFAULT_OFFERS[0]!;
  const offers = (Array.isArray(rawOffers) && rawOffers.length ? rawOffers : DEFAULT_OFFERS).map((offer: any, index: number) => normalizeOffer(offer, fallbackFor(offer, index)));
  const cleanRaw = store.cleanRoomRanking?.items ?? store.cleanRoomRecommendations ?? store.cleanRoom?.recommendations;
  const cleanOffers = Array.isArray(cleanRaw) && cleanRaw.length ? cleanRaw.map((offer: any, index: number) => normalizeOffer(offer, fallbackFor(offer, index))) : offers;
  const policy = store.policy ?? store.recommendationPolicy ?? {};
  const phase = String(store.phase ?? store.state ?? store.demoState ?? (store.session ? "INTENT_READY" : "EMPTY"));
  return {
    phase,
    sessionId: store.sessionId ?? store.session?.sessionId ?? "ifs_demo_local",
    stateVersion: Number(store.stateVersion ?? 0),
    intent: { ...DEFAULT_INTENT, ...intent, mustHave: intent.mustHave ?? DEFAULT_INTENT.mustHave, niceToHave: intent.niceToHave ?? DEFAULT_INTENT.niceToHave },
    policy: { sponsorshipMode: policy.sponsorshipMode ?? "allow_labeled", maximumSponsorWeight: Number(policy.maximumSponsorWeight ?? 0.3), allowInferredSignals: Boolean(policy.allowInferredSignals), hardConstraintMode: policy.hardConstraintMode ?? "warn", requireReasonCodes: policy.requireReasonCodes ?? true },
    offers,
    cleanOffers,
    bids: store.bids ?? store.auction?.bids ?? [],
    receipt: store.receipt ?? store.influenceReceipt ?? null,
    ledger: store.ledger ?? store.activity ?? store.activityLedger ?? [],
    selectedOfferId: store.selectedOfferId ?? store.stagedSelection?.offerId ?? null,
    error: store.error ?? null,
    auctionComplete: Boolean(store.auctionComplete ?? store.auction?.complete ?? ["AUCTION_COMPLETE", "MARKET_RANKED", "AUDITED", "POLICY_UPDATED", "COMPARED", "SELECTION_STAGED"].includes(phase)),
    marketRanked: Boolean(store.marketRanked ?? ["MARKET_RANKED", "AUDITED", "POLICY_UPDATED", "COMPARED", "SELECTION_STAGED"].includes(phase)),
    compared: Boolean(store.compared ?? ["COMPARED", "SELECTION_STAGED"].includes(phase)),
    webmcp,
  };
}

export function App() {
  const store = useDemoStore() as UnknownStore;
  const [webMcpStatus, setWebMcpStatus] = useState<WebMcpStatusValue>(() => ({
    supported:
      typeof document !== "undefined" &&
      typeof document.modelContext?.registerTool === "function",
    registered: false,
    toolsRegistered: 0,
  }));
  useEffect(() => {
    const lifecycle = new AbortController();
    let registrationCleanup = (): void => undefined;
    void registerWebMcpTools(setWebMcpStatus, lifecycle.signal).then((registration) => {
      registrationCleanup = registration.cleanup;
      if (lifecycle.signal.aborted) registration.cleanup();
    });
    return () => {
      lifecycle.abort();
      registrationCleanup();
    };
  }, []);
  const model = useMemo(() => readViewModel(store, webMcpStatus), [store, webMcpStatus]);
  const [receiptOfferId, setReceiptOfferId] = useState("omnimotion-ultra");
  const [selectionOfferId, setSelectionOfferId] = useState<string | null>(null);
  const [sessionCopied, setSessionCopied] = useState(false);
  const [actionError, setActionError] = useState<any>(null);
  const runAction = (action: string, args: any[] = []) => {
    const result = invoke(store, [action, action.charAt(0).toLowerCase() + action.slice(1)], ...args);
    if (result?.ok === false) setActionError(result.error ?? result);
    else if (result?.ok === true) setActionError(null);
    return result;
  };
  const selectedReceipt = model.offers.find((offer) => offer.id === receiptOfferId) ?? model.offers[0] ?? DEFAULT_OFFERS[0]!;
  const policyView: PolicyView = model.policy;
  const onCreateIntent = () => runAction("createIntentSession", [DEFAULT_INTENT]);
  const onAuction = () => runAction("runSimulatedAdAuction", [{ sessionId: model.sessionId, auctionMode: "weighted_relevance" }]);
  const onMarket = () => runAction("getMarketRecommendations", [{ sessionId: model.sessionId, limit: 5 }]);
  const onAudit = (offerId: string) => { setReceiptOfferId(offerId); runAction("inspectRecommendationInfluence", [{ sessionId: model.sessionId, offerId }]); };
  const onApplyCleanRoom = () => { runAction("setRecommendationPolicy", [{ sessionId: model.sessionId, sponsorshipMode: "block", maximumSponsorWeight: 0, allowInferredSignals: false, hardConstraintMode: "strict", requireReasonCodes: true }]); runAction("compareMarketToCleanRoom", [{ sessionId: model.sessionId }]); };
  const onConfirm = () => { if (!selectionOfferId) return; runAction("stageDemoSelection", [{ sessionId: model.sessionId, offerId: selectionOfferId, userConfirmed: true, confirmationSource: "manual_ui" }]); setSelectionOfferId(null); };
  const onCopySession = () => {
    if (!navigator.clipboard) return;
    void navigator.clipboard
      .writeText(model.sessionId)
      .then(() => setSessionCopied(true))
      .catch(() => undefined);
  };
  const onReset = () => { setSelectionOfferId(null); setReceiptOfferId("omnimotion-ultra"); setSessionCopied(false); runAction("resetDemo"); };
  const step = model.phase === "EMPTY" ? 0 : model.phase === "INTENT_READY" ? 1 : model.phase === "AUCTION_COMPLETE" ? 2 : model.phase === "MARKET_RANKED" ? 3 : model.phase === "AUDITED" ? 4 : model.phase === "POLICY_UPDATED" ? 5 : 6;
  const pressure = model.policy.sponsorshipMode === "block"
    ? 0
    : model.auctionComplete
      ? Math.round(Number(store.auction?.commercialPressureScore ?? 0))
      : 0;
  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand" aria-label="Intent for Sale"><span className="brand-name"><span>INTENT</span><b>//</b><span>FOR SALE</span></span><small>DECISION COMMERCE SYSTEMS</small></div>
        <div className="session-chip"><span><b>SESSION</b><small>LOCAL INSTANCE</small></span><code>{model.sessionId}</code><button className="icon-button" aria-label="Copy session ID" title="Copy session ID" onClick={onCopySession}>{sessionCopied ? "✓" : "▢"}</button></div>
        <WebMCPStatus status={model.webmcp} />
        <div className={`pressure-block ${pressure > 0 ? "is-pressurized" : "is-clear"}`} aria-label={`Commercial pressure ${pressure} percent`}><span className="pressure-label"><b>COMMERCIAL PRESSURE</b><small>DISCLOSED INFLUENCE</small></span><div className="pressure-track"><i style={{ width: `${pressure}%` }} /></div><strong>{pressure}%</strong><em>{pressure > 0 ? "HIGH" : "CLEAR"}</em></div>
      </header>
      <div className="notice-bar" role="note"><span className="notice-dot" /><div className="notice-copy"><strong>FICTIONAL SIMULATION</strong><span>All brands, bids, claims, payouts, and selections are synthetic. Nothing can be purchased.</span></div><b className="notice-guard">NO PURCHASE</b><button className="text-button" onClick={onReset}>Reset demo</button></div>
      <main className="dashboard" aria-label="Intent for Sale market operations console">
        <aside className="left-column"><IntentManifest intent={model.intent} phase={model.phase} signalsEnabled={Boolean(model.intent.allowInferredSignals || model.policy.allowInferredSignals)} onCreate={onCreateIntent} /><PolicyConsole policy={policyView} phase={model.phase} onApply={onApplyCleanRoom} onPolicyChange={(next) => runAction("setRecommendationPolicy", [{ sessionId: model.sessionId, ...next }])} /><ActivityLedger entries={model.ledger} currentPhase={model.phase} /></aside>
        <section className="center-column"><RecommendationBoard offers={model.offers} cleanOffers={model.cleanOffers} phase={model.phase} compared={model.compared} onAudit={onAudit} onStage={(offerId) => setSelectionOfferId(offerId)} /><InfluenceReceipt offer={selectedReceipt} receipt={model.receipt} phase={model.phase} /></section>
        <aside className="right-column"><Bidstream bids={model.bids} complete={model.auctionComplete} phase={model.phase} /><SelectionConfirmation selectedOffer={model.offers.find((offer) => offer.id === model.selectedOfferId) ?? null} pendingOffer={model.offers.find((offer) => offer.id === selectionOfferId) ?? null} confirmationSource={store.stagedSelection?.confirmationSource ?? null} onConfirm={onConfirm} onCancel={() => setSelectionOfferId(null)} /></aside>
      </main>
      <nav className="flow-bar" aria-label="Manual fallback controls"><div className="flow-label"><span>MANUAL FALLBACK</span><small>Same handlers as WebMCP tools</small></div><button disabled={step > 0} onClick={onCreateIntent}>01 Create intent</button><button disabled={step < 1 || step > 1} onClick={onAuction}>02 Run auction</button><button disabled={step < 2 || step > 2} onClick={onMarket}>03 Rank market</button><button disabled={step < 3 || step > 4} onClick={() => onAudit(model.offers[0]?.id ?? "omnimotion-ultra")}>04 Inspect receipt</button><button disabled={step < 4 || step > 5} onClick={onApplyCleanRoom}>05 Clean room</button><button disabled={!model.compared} onClick={() => setSelectionOfferId("kinoforge-studio")}>06 Stage KinoForge</button></nav>
      {(actionError ?? model.error) && <div className="error-toast" role="alert"><strong>{(actionError ?? model.error).code ?? "INVALID_STATE"}</strong><span>{(actionError ?? model.error).message ?? String(actionError ?? model.error)}</span></div>}
    </div>
  );
}
