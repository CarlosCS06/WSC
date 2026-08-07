export type TeamMentality =
  | "DEFENSIVE"
  | "BALANCED"
  | "ATTACKING";

export interface MatchMentalities {
  home: TeamMentality;
  away: TeamMentality;
}