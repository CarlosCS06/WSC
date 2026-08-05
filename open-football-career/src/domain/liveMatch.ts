import type { MatchDecision } from "./matchDecision";
import type { MatchEvent } from "./matchEvent";
import type { MatchPlayerState } from "./matchPlayerState";

export interface LiveMatchState {
  homeGoals: number;
  awayGoals: number;

  events: MatchEvent[];
  playerStates: MatchPlayerState[];

  pendingDecision: MatchDecision | null;
}