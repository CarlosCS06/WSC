import type { MatchEvent } from "./matchEvent";
import type { MatchPlayerState } from "./matchPlayerState";

export interface IncrementalMatchState {
  fixtureId: string;

  currentMinute: number;

  homeGoals: number;
  awayGoals: number;

  events: MatchEvent[];
  playerStates: MatchPlayerState[];

  processedIncidentIds: string[];
  finished: boolean;
}