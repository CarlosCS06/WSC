import type { MatchPlayerState } from "./matchPlayerState";

export interface LiveMatchTeam {
  clubId: string;
  playerStates: MatchPlayerState[];
}