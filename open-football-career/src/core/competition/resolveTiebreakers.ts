import type { StandingRow } from "../../domain/standings.ts";

export function resolveTiebreakers(results: StandingRow[]): StandingRow[] {
  return [...results].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    return b.goalsFor - a.goalsFor;
  });
}
