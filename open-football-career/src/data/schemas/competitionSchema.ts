import { z } from "zod";

const tiebreakerSchema = z.enum([
  "POINTS",
  "HEAD_TO_HEAD_POINTS",
  "HEAD_TO_HEAD_GOAL_DIFFERENCE",
  "GOAL_DIFFERENCE",
  "GOALS_FOR",
  "WINS",
  "PLAYOFF",
]);

const stageSchema = z.object({
  id: z.string().min(1),
  type: z.literal("ROUND_ROBIN"),
  rounds: z.number().int().positive(),
  pointsForWin: z.number().int(),
  pointsForDraw: z.number().int(),
  pointsForLoss: z.number().int(),
  tiebreakers: z.array(tiebreakerSchema).min(1),
});

const movementRuleSchema = z.object({
  positions: z.array(z.number().int().positive()).min(1),
  destinationCompetitionId: z.string().min(1),
  method: z.enum(["DIRECT", "PLAYOFF"]),
});

export const competitionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  shortName: z.string().min(1),
  associationId: z.string().min(1),
  type: z.enum(["LEAGUE", "CUP", "SUPERCUP", "CONTINENTAL_CUP"]),
  level: z.number().int().positive().optional(),

  participantClubIds: z.array(z.string()).min(2),
  stages: z.array(stageSchema).min(1),

  promotionRules: z.array(movementRuleSchema),
  relegationRules: z.array(movementRuleSchema),
});

export const competitionsSchema = z.array(competitionSchema);