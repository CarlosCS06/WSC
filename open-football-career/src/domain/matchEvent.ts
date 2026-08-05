export type MatchEventType =
  | "KICK_OFF"
  | "GOAL"
  | "HALF_TIME"
  | "FULL_TIME"
  | "INJURY"
  | "SUBSTITUTION"
  | "RED_CARD"
  | "SECOND_YELLOW_CARD"
  | "PENALTY_AWARDED";
  

export interface MatchEvent {
  id: string;
  fixtureId: string;
  minute: number;
  type: MatchEventType;

  clubId?: string;
  playerId?: string;
  assistPlayerId?: string;

  description: string;
}