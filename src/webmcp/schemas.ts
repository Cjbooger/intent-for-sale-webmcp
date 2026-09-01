import { z } from "zod";
import { TOOL_NAMES, type JsonSchema } from "./types";

const sessionId = z.string().trim().min(1).max(120);
const offerId = z.string().trim().min(1).max(120);
const boundedListItem = z.string().trim().min(1).max(120);

export const createIntentSessionInput = z
  .object({
    taskSummary: z.string().trim().min(10).max(500),
    budgetMonthlyUsd: z.number().finite().min(0).max(10_000),
    mustHave: z.array(boundedListItem).min(1).max(10),
    niceToHave: z.array(boundedListItem).max(10).optional(),
    allowInferredSignals: z.boolean().optional().default(false),
  })
  .strict();

export const runSimulatedAdAuctionInput = z
  .object({
    sessionId,
    auctionMode: z
      .enum(["weighted_relevance", "maximum_revenue"])
      .optional()
      .default("weighted_relevance"),
  })
  .strict();

export const getMarketRecommendationsInput = z
  .object({
    sessionId,
    limit: z.number().int().min(1).max(5).optional().default(5),
  })
  .strict();

export const inspectRecommendationInfluenceInput = z
  .object({ sessionId, offerId })
  .strict();

export const setRecommendationPolicyInput = z
  .object({
    sessionId,
    sponsorshipMode: z.enum(["allow_labeled", "deprioritize", "block"]),
    maximumSponsorWeight: z.number().finite().min(0).max(0.4).optional(),
    allowInferredSignals: z.boolean(),
    hardConstraintMode: z.enum(["strict", "warn"]),
    requireReasonCodes: z.boolean().optional(),
  })
  .strict();

export const compareMarketToCleanRoomInput = z.object({ sessionId }).strict();

export const stageDemoSelectionInput = z
  .object({ sessionId, offerId, userConfirmed: z.boolean() })
  .strict();

export const inputSchemas = {
  create_intent_session: {
    type: "object",
    properties: {
      taskSummary: { type: "string", minLength: 10, maxLength: 500 },
      budgetMonthlyUsd: { type: "number", minimum: 0, maximum: 10_000 },
      mustHave: {
        type: "array",
        items: { type: "string", minLength: 1, maxLength: 120 },
        minItems: 1,
        maxItems: 10,
      },
      niceToHave: {
        type: "array",
        items: { type: "string", minLength: 1, maxLength: 120 },
        maxItems: 10,
      },
      allowInferredSignals: { type: "boolean", default: false },
    },
    required: ["taskSummary", "budgetMonthlyUsd", "mustHave"],
    additionalProperties: false,
  },
  run_simulated_ad_auction: {
    type: "object",
    properties: {
      sessionId: { type: "string", minLength: 1, maxLength: 120 },
      auctionMode: {
        type: "string",
        enum: ["weighted_relevance", "maximum_revenue"],
        default: "weighted_relevance",
      },
    },
    required: ["sessionId"],
    additionalProperties: false,
  },
  get_market_recommendations: {
    type: "object",
    properties: {
      sessionId: { type: "string", minLength: 1, maxLength: 120 },
      limit: { type: "integer", minimum: 1, maximum: 5, default: 5 },
    },
    required: ["sessionId"],
    additionalProperties: false,
  },
  inspect_recommendation_influence: {
    type: "object",
    properties: {
      sessionId: { type: "string", minLength: 1, maxLength: 120 },
      offerId: { type: "string", minLength: 1, maxLength: 120 },
    },
    required: ["sessionId", "offerId"],
    additionalProperties: false,
  },
  set_recommendation_policy: {
    type: "object",
    properties: {
      sessionId: { type: "string", minLength: 1, maxLength: 120 },
      sponsorshipMode: {
        type: "string",
        enum: ["allow_labeled", "deprioritize", "block"],
      },
      maximumSponsorWeight: { type: "number", minimum: 0, maximum: 0.4 },
      allowInferredSignals: { type: "boolean" },
      hardConstraintMode: { type: "string", enum: ["strict", "warn"] },
      requireReasonCodes: { type: "boolean" },
    },
    required: [
      "sessionId",
      "sponsorshipMode",
      "allowInferredSignals",
      "hardConstraintMode",
    ],
    additionalProperties: false,
  },
  compare_market_to_clean_room: {
    type: "object",
    properties: {
      sessionId: { type: "string", minLength: 1, maxLength: 120 },
    },
    required: ["sessionId"],
    additionalProperties: false,
  },
  stage_demo_selection: {
    type: "object",
    properties: {
      sessionId: { type: "string", minLength: 1, maxLength: 120 },
      offerId: { type: "string", minLength: 1, maxLength: 120 },
      userConfirmed: { type: "boolean" },
    },
    required: ["sessionId", "offerId", "userConfirmed"],
    additionalProperties: false,
  },
} satisfies Record<(typeof TOOL_NAMES)[number], JsonSchema>;

export type CreateIntentSessionInput = z.infer<typeof createIntentSessionInput>;
export type RunSimulatedAdAuctionInput = z.infer<typeof runSimulatedAdAuctionInput>;
export type GetMarketRecommendationsInput = z.infer<
  typeof getMarketRecommendationsInput
>;
export type InspectRecommendationInfluenceInput = z.infer<
  typeof inspectRecommendationInfluenceInput
>;
export type SetRecommendationPolicyInput = z.infer<
  typeof setRecommendationPolicyInput
>;
export type CompareMarketToCleanRoomInput = z.infer<
  typeof compareMarketToCleanRoomInput
>;
export type StageDemoSelectionInput = z.infer<typeof stageDemoSelectionInput>;

export const inputValidators = {
  create_intent_session: createIntentSessionInput,
  run_simulated_ad_auction: runSimulatedAdAuctionInput,
  get_market_recommendations: getMarketRecommendationsInput,
  inspect_recommendation_influence: inspectRecommendationInfluenceInput,
  set_recommendation_policy: setRecommendationPolicyInput,
  compare_market_to_clean_room: compareMarketToCleanRoomInput,
  stage_demo_selection: stageDemoSelectionInput,
} as const;
