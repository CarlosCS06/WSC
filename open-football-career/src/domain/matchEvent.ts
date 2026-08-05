export type MatchEventType =
  | "KICK_OFF"
  | "GOAL"
  | "HALF_TIME"
  | "FULL_TIME";

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