import { Panel } from "./Panel";

type BidRow = {
  time: string;
  bidder: string;
  offerId: string;
  bid: number;
  norm: number;
  signalMatch: number;
  winner: boolean;
};

const demoBids = [
  { bidder: "OmniMotion", advertiserId: "omnimotion", offerId: "omnimotion-ultra", simulatedCpaUsd: 24, normalizedBidScore: 100, signalMatchMultiplier: 1 },
  { bidder: "PromptCloud", advertiserId: "promptcloud", offerId: "promptcloud-infinite", simulatedCpaUsd: 15, normalizedBidScore: 62.5, signalMatchMultiplier: 1 },
  { bidder: "RenderRush", advertiserId: "renderrush", offerId: "renderrush-creator", simulatedCpaUsd: 11, normalizedBidScore: 45.83, signalMatchMultiplier: 1 },
  { bidder: "KinoForge", advertiserId: "kinoforge", offerId: "kinoforge-studio", simulatedCpaUsd: 0, normalizedBidScore: 0, signalMatchMultiplier: 1 },
  { bidder: "LocalFrame", advertiserId: "localframe", offerId: "localframe-oss", simulatedCpaUsd: 0, normalizedBidScore: 0, signalMatchMultiplier: 1 },
];

const bidderNames: Record<string, string> = {
  omnimotion: "OmniMotion",
  promptcloud: "PromptCloud",
  renderrush: "RenderRush",
  kinoforge: "KinoForge",
  localframe: "LocalFrame",
};

function normalizeRows(bids: any[]): BidRow[] {
  const source = bids.length ? bids : demoBids;
  const normalized = source
    .map((bid: any, index: number) => ({
      time: String(bid.time ?? bid.timestamp ?? `12:04:31.${512 - index * 27}`),
      bidder: String(bid.bidder ?? bid.advertiserName ?? bidderNames[bid.advertiserId] ?? bid.advertiser ?? "Synthetic bidder"),
      offerId: String(bid.offerId ?? "synthetic-offer"),
      bid: Number(bid.bid ?? bid.simulatedCpaUsd ?? bid.bidUsd ?? 0),
      norm: Number(bid.norm ?? bid.normalizedBidScore ?? 0),
      signalMatch: Number(bid.signalMatchMultiplier ?? 1),
    }))
    .sort((left, right) => right.bid - left.bid || left.bidder.localeCompare(right.bidder));
  const highestBid = normalized[0]?.bid ?? 0;
  return normalized.map((row) => ({ ...row, winner: row.bid > 0 && row.bid === highestBid }));
}

export function Bidstream({ bids, complete, phase }: { bids: any[]; complete: boolean; phase: string }) {
  const rows = normalizeRows(bids);
  const totalValue = rows.reduce((sum, row) => sum + row.bid, 0);
  const highBid = Math.max(...rows.map((row) => row.bid), 0);
  const pressure = rows.reduce((sum, row) => sum + row.norm, 0) / Math.max(rows.length, 1);
  const waiting = phase === "EMPTY" || phase === "INTENT_READY";

  return (
    <Panel title="Live bidstream" eyebrow="Synthetic exchange" action={<span className={`live-state ${complete ? "is-live" : ""}`}><i />{complete ? "LIVE" : "STANDBY"}</span>} className="bidstream-panel">
      <table className="bid-table" aria-label="Synthetic advertiser bids">
        <thead>
          <tr><th>Time</th><th>Bidder / offer</th><th>CPA</th><th>Norm.</th><th>Status</th></tr>
        </thead>
        <tbody>
          {waiting ? (
            <tr><td className="bid-empty" colSpan={5}>No bids yet. The auction is local and deterministic.</td></tr>
          ) : rows.map((row) => (
            <tr key={row.offerId}>
              <td><time>{row.time}</time></td>
              <td className="bidder-cell"><strong>{row.bidder}</strong><small>{row.offerId}</small></td>
              <td className="bid-money">${row.bid.toFixed(2)}</td>
              <td className="bid-normalized">{row.norm.toFixed(1)}</td>
              <td className={row.winner ? "bid-winner" : "bid-eligible"}><strong>{row.winner ? "WINNER" : "ELIGIBLE"}</strong><small>{row.signalMatch.toFixed(1)}× match</small></td>
            </tr>
          ))}
        </tbody>
      </table>
      {!waiting && <div className="auction-summary" aria-label="Auction summary"><span>Total advertiser value <b>${totalValue.toFixed(2)}</b></span><span>Highest CPA <b>${highBid.toFixed(2)}</b></span><span>Commercial pressure <b>{pressure.toFixed(1)}</b></span></div>}
      <div className="bid-callout"><div><b>CPA</b><span>Cost per action. Advertisers bid their target cost per user action.</span></div><div><b>Scores are not dollars.</b><span>Bids influence ranking, not the price shown to users.</span></div></div>
    </Panel>
  );
}
