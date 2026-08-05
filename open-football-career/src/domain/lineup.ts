import type { PlayerPosition } from "./player";

export interface LineupSlot {
  playerId: string;
  position: PlayerPosition;
}

export interface Lineup {
  clubId: string;
  formation: "4-3-3";
  starters: LineupSlot[];
  substitutes: string[];
}