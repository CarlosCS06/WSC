export interface Fixture {
  id: string;
  competitionId: string;
  seasonId: string;
  matchday: number;

  homeClubId: string;
  awayClubId: string;

  scheduledDate?: string;
  played: boolean;

  homeGoals?: number;
  awayGoals?: number;
}