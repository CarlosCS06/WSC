export type MatchEventType =
  | "KICK_OFF"
  | "FOUL"
  | "POSSESSION"
  | "SHOT"
  | "SHOT_ON_TARGET"
  | "SAVE"
  | "CORNER"
  | "OFFSIDE"
  | "PENALTY_AWARDED"
  | "PENALTY_SCORED"
  | "PENALTY_MISSED"
  | "GOAL"
  | "GOAL_DISALLOWED"
  | "YELLOW_CARD"
  | "SECOND_YELLOW_CARD"
  | "RED_CARD"
  | "INJURY"
  | "SUBSTITUTION"
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

  second?: number;
  durationSeconds?: number;
  visible?: boolean;

  injurySeverity?: InjurySeverity;
  description: string;
  relatedEventId?: string;
}