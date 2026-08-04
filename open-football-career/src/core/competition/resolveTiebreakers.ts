import type { StandingRow } from "../../domain/standings";

export function resolveTiebreakers(results: StandingRow[]) {
  return results.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    return b.goalsFor - a.goalsFor;
  });
}
