export interface Club {
  id: string;
  name: string;
  shortName: string;
  associationId: string;
  reputation: number;
  attack: number;
  midfield: number;
  defence: number;
  budget: number;
  stadiumId?: string;
}