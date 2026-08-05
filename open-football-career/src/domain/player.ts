export type PlayerPosition =
  | "GK"
  | "RB"
  | "CB"
  | "LB"
  | "DM"
  | "CM"
  | "AM"
  | "RW"
  | "LW"
  | "ST";

export interface PlayerAttributes {
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physical: number;
  goalkeeping: number;
}

export interface Player {
  id: string;
  clubId: string;
  name: string;
  shortName: string;
  age: number;
  position: PlayerPosition;
  nationalityId: string;

  overall: number;
  potential: number;
  attributes: PlayerAttributes;

  contractUntil: string;
  marketValue: number;
  wage: number;
}