export interface TeamMatchStatistics {
  clubId: string;

  possession: number;
  possessionSeconds: number;

  shots: number;
  shotsOnTarget: number;
  saves: number;

  fouls: number;
  yellowCards: number;
  redCards: number;

  corners: number;
  offsides: number;

  penaltiesAwarded: number;
  penaltiesScored: number;
  penaltiesMissed: number;

  substitutions: number;
}
