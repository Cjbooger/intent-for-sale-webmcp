import { Panel } from "./Panel";
import type { OfferView } from "./types";

export function InfluenceReceipt({ offer, receipt, phase }: { offer?: OfferView; receipt: any; phase: string }) {
  if (!offer) return null;
  const base = Number(receipt?.baseFitScore ?? offer.baseFitScore);
  const weight = Number(receipt?.sponsorWeight ?? receipt?.maximumSponsorWeight ?? 0.3);
  const normalized = Number(receipt?.normalizedBidScore ?? (offer.sponsorBidUsd ? 100 : 0));
  const weightedBase = Number(receipt?.userFitContribution ?? (base * (1 - weight)).toFixed(1));
  const commercial = Number(receipt?.commercialContribution ?? (normalized * weight).toFixed(1));
  const finalScore = Number(receipt?.marketScore ?? offer.marketScore);
  const marketRank = Number(receipt?.marketRank ?? offer.marketRank);
  const cleanRoomRank = Number(receipt?.cleanRoomRank ?? offer.cleanRoomRank);
  const rankDelta = Number(receipt?.rankDelta ?? cleanRoomRank - marketRank);
  const auctionWinner = offer.sponsorStatus === "paid" && marketRank === 1;
  const constraints: string[] = receipt?.explicitConstraints ?? [];
  const conflicts: string[] = receipt?.constraintConflicts ?? [];
  const audited = ["AUDITED", "POLICY_UPDATED", "COMPARED", "SELECTION_STAGED"].includes(phase) || Boolean(receipt);
  return <Panel title="Influence receipt" eyebrow={audited ? `${offer.name} · synthetic audit` : "Audit available after ranking"} action={<span className="sponsor-label">{offer.sponsorStatus === "paid" ? "SPONSORED" : "ORGANIC"}</span>} className="receipt-panel">
    {!audited ? <div className="receipt-empty"><span>⌁</span><p>Ask the agent why the top option won. This receipt will separate user fit from commercial influence.</p></div> : <>
      <div className="receipt-summary"><div className="receipt-symbol">{offer.name.slice(0, 1)}</div><div><strong>{offer.name}</strong><span>${offer.price}/month · fictional offer</span></div><dl><div><dt>Auction winner</dt><dd>{auctionWinner ? "YES" : "NO"}</dd></div><div><dt>Market rank</dt><dd>#{marketRank}</dd></div><div><dt>Clean room</dt><dd>#{cleanRoomRank}</dd></div><div><dt>Bid (CPA)</dt><dd>${offer.sponsorBidUsd.toFixed(2)}</dd></div><div><dt>Disclosure</dt><dd>FULL</dd></div></dl></div>
      <div className="waterfall" aria-label="Influence score waterfall"><div className="waterfall-head"><span>Component</span><span>Description</span><span>Value</span><span>Contribution</span></div><div><b>01</b><span>Base fit score <small>How well the offer fits explicit intent</small></span><strong>{base.toFixed(1)}</strong><em>—</em></div><div><b>02</b><span>Weighted base contribution <small>Base fit × (1 − sponsor weight)</small></span><strong>{weightedBase.toFixed(1)}</strong><em>{weightedBase.toFixed(1)}</em></div><div><b>03</b><span>Normalized bid <small>Bid strength vs. all eligible bidders</small></span><strong>{normalized.toFixed(1)}</strong><em>—</em></div><div><b>04</b><span>Commercial contribution <small>Normalized bid × sponsor weight ({Math.round(weight * 100)}%)</small></span><strong>—</strong><em className="pink-value">{commercial.toFixed(1)}</em></div><div className="waterfall-total"><b>FINAL SCORE</b><span>Sum of contributions, clamped to 0–100</span><strong>—</strong><em>{finalScore.toFixed(1)}</em></div></div>
      <div className="receipt-details"><div><b>Claims used</b>{offer.claims.length ? <ul>{offer.claims.map((claim) => <li key={claim}>{claim}</li>)}</ul> : <p>No advertiser claims returned.</p>}</div><div><b>Rank impact</b><p>Market #{marketRank} → clean room #{cleanRoomRank} · delta {rankDelta > 0 ? `+${rankDelta}` : rankDelta}</p><b>Simulated money trail</b><p>${offer.sponsorBidUsd.toFixed(2)} CPA · no real payment</p></div><div><b>Explicit constraints audited</b>{constraints.length ? <ul>{constraints.map((constraint) => <li key={constraint}>{constraint}</li>)}</ul> : <p>No explicit constraints returned.</p>}</div><div><b>Constraint conflicts</b><p>{conflicts.length ? conflicts.join("; ") : "None in the fixed demo fixture."}</p><b>Historical policy</b><p>{weight ? `${Math.round(weight * 100)}% maximum sponsor weight` : "Sponsor influence blocked"}</p></div></div>
      <p className="receipt-footnote">CPA is separate from score contributions. This is an educational simulation; no network request or purchase occurred.</p>
    </>}
  </Panel>;
}
