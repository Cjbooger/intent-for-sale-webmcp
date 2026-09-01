import type { WebMcpStatus } from "../webmcp/types";

export type OfferView = {
  id: string;
  name: string;
  price: number;
  baseFitScore: number;
  marketScore: number;
  cleanRoomScore: number;
  marketRank: number;
  cleanRoomRank: number;
  sponsorStatus: "paid" | "organic" | string;
  sponsorBidUsd: number;
  sponsorBoost: number;
  constraintStatus: string;
  claims: string[];
};

export type PolicyView = {
  sponsorshipMode: "allow_labeled" | "deprioritize" | "block" | string;
  maximumSponsorWeight: number;
  allowInferredSignals: boolean;
  hardConstraintMode: "strict" | "warn" | string;
  requireReasonCodes: boolean;
};

export type DemoViewModel = {
  phase: string;
  sessionId: string;
  stateVersion: number;
  intent: { taskSummary: string; budgetMonthlyUsd: number; mustHave: string[]; niceToHave: string[]; allowInferredSignals?: boolean };
  policy: PolicyView;
  offers: OfferView[];
  cleanOffers: OfferView[];
  bids: any[];
  receipt: any;
  ledger: any[];
  selectedOfferId: string | null;
  error: any;
  auctionComplete: boolean;
  marketRanked: boolean;
  compared: boolean;
  webmcp: WebMcpStatus;
};
