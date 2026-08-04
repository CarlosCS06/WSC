export type CompetitionType =
  | "LEAGUE"
  | "CUP"
  | "SUPERCUP"
  | "CONTINENTAL_CUP";

export type Tiebreaker =
  | "POINTS"
  | "HEAD_TO_HEAD_POINTS"
  | "HEAD_TO_HEAD_GOAL_DIFFERENCE"
  | "GOAL_DIFFERENCE"
  | "GOALS_FOR"
  | "WINS"
  | "PLAYOFF";

export interface PromotionRule {
  positions: number[];
  destinationCompetitionId: string;
  method: "DIRECT" | "PLAYOFF";
}

export interface RelegationRule {
  positions: number[];
  destinationCompetitionId: string;
  method: "DIRECT" | "PLAYOFF";
}

export interface LeagueStage {
  id: string;
  type: "ROUND_ROBIN";
  rounds: number;
  pointsForWin: number;
  pointsForDraw: number;
  pointsForLoss: number;
  tiebreakers: Tiebreaker[];
}

export interface Competition {
  id: string;
  name: string;
  shortName: string;
  associationId: string;
  type: CompetitionType;
  level?: number;
  participantClubIds: string[];

  stages: LeagueStage[];

  promotionRules: PromotionRule[];
  relegationRules: RelegationRule[];
}