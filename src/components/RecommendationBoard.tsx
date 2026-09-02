import { Panel } from "./Panel";
import type { OfferView } from "./types";

function score(value: number) { return Number.isFinite(value) ? value.toFixed(1) : "—"; }
function OfferRow({ offer, clean, canStage, onAudit, onStage }: { offer: OfferView; clean?: boolean; canStage: boolean; onAudit: () => void; onStage: () => void }) {
  return <article className={`offer-row ${offer.marketRank === 1 && !clean ? "is-market-winner" : ""} ${offer.cleanRoomRank === 1 && clean ? "is-clean-winner" : ""}`}>
    <div className="rank-number">{clean ? offer.cleanRoomRank : offer.marketRank}</div><div className="offer-symbol" aria-hidden="true">{offer.name.slice(0, 1)}</div><div className="offer-main"><strong>{offer.name}</strong><span>${offer.price}/month · {offer.constraintStatus}</span></div><div className="offer-score"><b>{score(clean ? offer.cleanRoomScore : offer.marketScore)}</b><small>{clean ? "BASE FIT" : "FINAL SCORE"}</small></div><div className="offer-status"><span className={clean || offer.sponsorStatus === "organic" ? "organic" : "paid"}>{clean ? "CLEAN" : offer.sponsorStatus === "paid" ? "PAID" : "ORGANIC"}</span>{!clean && offer.sponsorStatus === "paid" && <small>{offer.marketRank === 1 ? "auction winner" : "paid placement"}</small>}</div>{!clean && <div className="offer-actions"><button onClick={onAudit}>Audit</button><button onClick={onStage} disabled={!canStage}>Stage</button></div>}</article>;
}

export function RecommendationBoard({ offers, cleanOffers, phase, compared, onAudit, onStage }: { offers: OfferView[]; cleanOffers: OfferView[]; phase: string; compared: boolean; onAudit: (id: string) => void; onStage: (id: string) => void }) {
  const ranked = phase === "EMPTY" || phase === "INTENT_READY" || phase === "AUCTION_COMPLETE" ? [] : offers;
  const clean = compared ? [...cleanOffers].sort((a, b) => a.cleanRoomRank - b.cleanRoomRank) : [];
  return <Panel title="Recommendations comparison" eyebrow={compared ? "Market vs clean room" : "Commercial market"} action={<span className="header-action">{ranked.length ? `${ranked.length} offers` : "Awaiting auction"}</span>} className="recommendation-panel">
    <div className="comparison-grid"><div className="comparison-column"><div className="comparison-title commercial">Commercial market <small>(with ads)</small></div>{ranked.length ? [...ranked].sort((a, b) => a.marketRank - b.marketRank).map((offer) => <OfferRow key={offer.id} offer={offer} canStage={compared} onAudit={() => onAudit(offer.id)} onStage={() => onStage(offer.id)} />) : <div className="empty-ranking"><span>—</span><p>Run the auction, then retrieve market recommendations.</p></div>}</div><div className="comparison-column"><div className="comparison-title clean">Clean room <small>(no ads)</small></div>{clean.length ? clean.map((offer) => <OfferRow key={offer.id} offer={offer} clean canStage={false} onAudit={() => onAudit(offer.id)} onStage={() => onStage(offer.id)} />) : <div className="empty-ranking"><span>⌁</span><p>Block sponsor influence to reveal the sponsor-free ranking.</p></div>}</div></div>
    {compared && <div className="rank-reversal"><strong>Rank reversal</strong><span>KinoForge rises from #4 to #1</span><b>↗</b></div>}
    <div className="legend"><span><i className="legend-pink" />Commercial influence present</span><span><i className="legend-green" />Clean-room result</span><span><i className="legend-gray" />No influence</span></div>
  </Panel>;
}
