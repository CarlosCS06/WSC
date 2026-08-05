export interface InjurySubstitutionDecision {
  type: "USER_INJURY_SUBSTITUTION";
  clubId: string;
  injuredPlayerId: string;
  availableSubstituteIds: string[];
  minute: number;
}

export type MatchDecision = InjurySubstitutionDecision;