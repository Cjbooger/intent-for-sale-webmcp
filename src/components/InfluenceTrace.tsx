import { Panel } from "./Panel";
import type { OfferView, PolicyView } from "./types";

type TraceReceipt = {
  commercialContribution?: number;
  normalizedBidScore?: number;
  sponsorWeight?: number;
  sponsorBidUsd?: number;
};

type TraceProps = {
  marketWinner?: OfferView;
  receipt: TraceReceipt | null;
  policy: PolicyView;
  policyChanged: boolean;
  cleanWinner?: OfferView;
};

type TraceStepProps = {
  index: string;
  title: string;
  tone: "commercial" | "policy" | "clean";
  ready: boolean;
  placeholder: string;
  children: React.ReactNode;
};

function TraceStep({ index, title, tone, ready, placeholder, children }: TraceStepProps) {
  return (
    <li className="trace-step">
      <article className={"trace-node trace-node--" + tone + (ready ? " is-ready" : " is-pending")}>
        <div className="trace-node-head">
          <span className="trace-index">{index}</span>
          <span className="trace-state">{ready ? "CONFIRMED" : "PENDING"}</span>
        </div>
        <h3>{title}</h3>
        {ready ? children : <p className="trace-placeholder">{placeholder}</p>}
      </article>
    </li>
  );
}

function score(value: number | undefined) {
  return typeof value === "number" && Number.isFinite(value) ? value.toFixed(1) : "—";
}

export function InfluenceTrace({ marketWinner, receipt, policy, policyChanged, cleanWinner }: TraceProps) {
  const commercialContribution =
    typeof receipt?.commercialContribution === "number" ? receipt.commercialContribution : undefined;
  const sponsorBidUsd = typeof receipt?.sponsorBidUsd === "number" ? receipt.sponsorBidUsd : undefined;
  const normalizedBidScore =
    typeof receipt?.normalizedBidScore === "number" ? receipt.normalizedBidScore : undefined;
  const sponsorWeight = typeof receipt?.sponsorWeight === "number" ? receipt.sponsorWeight : undefined;
  const sponsorshipBlocked =
    policyChanged && policy.sponsorshipMode === "block" && policy.maximumSponsorWeight === 0;

  return (
    <Panel
      title="Influence trace"
      eyebrow="Why the recommendation changed"
      className="trace-panel"
    >
      <p className="trace-intro">
        Follow one answer from the commercial market through the policy intervention to the clean room.
      </p>
      <ol className="trace-list" aria-label="Four-step influence trace">
        <TraceStep
          index="01"
          title="Commercial winner"
          tone="commercial"
          ready={Boolean(marketWinner)}
          placeholder="Awaiting market ranking."
        >
          <strong className="trace-value">{marketWinner?.name}</strong>
          <span className="trace-meta">
            MARKET #{marketWinner?.marketRank} · SCORE {score(marketWinner?.marketScore)}
          </span>
          <span className="trace-tag">PAID</span>
        </TraceStep>
        <TraceStep
          index="02"
          title="Paid contribution"
          tone="commercial"
          ready={Boolean(receipt && commercialContribution !== undefined)}
          placeholder="Inspect the commercial winner to disclose the paid contribution."
        >
          <strong className="trace-value trace-value--score">
            +{score(commercialContribution)}
          </strong>
          <span className="trace-meta">SCORE POINTS · NORMALIZED BID × SPONSOR WEIGHT</span>
          <span className="trace-detail">
            {normalizedBidScore !== undefined && sponsorWeight !== undefined
              ? normalizedBidScore.toFixed(1) + " × " + Math.round(sponsorWeight * 100) + "%"
              : "Contribution disclosed in receipt"}
          </span>
          {sponsorBidUsd !== undefined && (
            <span className="trace-detail">SIMULATED CPA ${sponsorBidUsd.toFixed(2)}</span>
          )}
        </TraceStep>
        <TraceStep
          index="03"
          title="Policy intervention"
          tone="policy"
          ready={policyChanged}
          placeholder="Awaiting user policy update."
        >
          <strong className="trace-value">
            {sponsorshipBlocked ? "SPONSORSHIP BLOCKED" : "POLICY UPDATED"}
          </strong>
          <span className="trace-meta">
            MAXIMUM SPONSOR WEIGHT · {Math.round(policy.maximumSponsorWeight * 100)}%
          </span>
          <span className="trace-detail">
            INFERRED SIGNALS · {policy.allowInferredSignals ? "ON" : "OFF"}
          </span>
        </TraceStep>
        <TraceStep
          index="04"
          title="Clean-room winner"
          tone="clean"
          ready={Boolean(cleanWinner)}
          placeholder="Compare the market with the clean room."
        >
          <strong className="trace-value">{cleanWinner?.name}</strong>
          <span className="trace-meta">
            CLEAN ROOM #{cleanWinner?.cleanRoomRank} · SCORE {score(cleanWinner?.cleanRoomScore)}
          </span>
          <span className="trace-detail">
            MARKET #{cleanWinner?.marketRank} → CLEAN #{cleanWinner?.cleanRoomRank}
          </span>
        </TraceStep>
      </ol>
    </Panel>
  );
}
