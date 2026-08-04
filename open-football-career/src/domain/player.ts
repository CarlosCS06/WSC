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

export interface Player {
  id: string;
  clubId: string;
  name: string;
  age: number;
  position: PlayerPosition;
  nationalityId: string;

  overall: number;
  potential: number;

  contractUntil: string;
  marketValue: number;
  wage: number;
}