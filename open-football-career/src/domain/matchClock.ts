export type MatchPeriod =
  | "PRE_MATCH"
  | "FIRST_HALF"
  | "HALF_TIME"
  | "SECOND_HALF"
  | "FULL_TIME";

export type MatchSpeed = 1 | 2 | 4 | 8;

export interface MatchClockState {
  elapsedSeconds: number;
  period: MatchPeriod;
  speed: MatchSpeed;

  firstHalfAddedMinutes: number;
  secondHalfAddedMinutes: number;
}