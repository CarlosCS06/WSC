export type MatchEventType =
  | "KICK_OFF"
  | "FOUL"
  | "YELLOW_CARD"
  | "SECOND_YELLOW_CARD"
  | "RED_CARD"
  | "INJURY"
  | "SUBSTITUTION"
  | "GOAL"
  | "HALF_TIME"
  | "SECOND_HALF"
  | "FULL_TIME";

export type InjurySeverity =
  | "KNOCK"
  | "MINOR"
  | "MODERATE"
  | "SERIOUS";

export interface MatchEvent {
  id: string;
  fixtureId: string;
  minute: number;
  type: MatchEventType;

  clubId?: string;
  playerId?: string;
  secondaryPlayerId?: string;
  assistPlayerId?: string;

  injurySeverity?: InjurySeverity;
  description: string;
}