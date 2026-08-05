import type { PlayerPosition } from "./player";

export interface MatchPlayerState {
  playerId: string;
  clubId: string;
  position: PlayerPosition;

  isStarter: boolean;
  isOnPitch: boolean;
  isAvailable: boolean;

  yellowCards: number;
  sentOff: boolean;
  injured: boolean;
  substitutedIn: boolean;
  substitutedOut: boolean;

  fatigue: number;
}