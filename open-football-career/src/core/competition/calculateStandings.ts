import type { Fixture } from "../../domain/fixture";
import type { StandingRow } from "../../domain/standings";

export function calculateStandings(
  clubIds: string[],
  fixtures: Fixture[],
): StandingRow[] {
  const rows = new Map<string, StandingRow>();

  for (const clubId of clubIds) {
    rows.set(clubId, {
      clubId,
      position: 0,
      played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
    });
  }

  for (const fixture of fixtures) {
    if (
      !fixture.played ||
      fixture.homeGoals === undefined ||
      fixture.awayGoals === undefined
    ) {
      continue;
    }

    const home = rows.get(fixture.homeClubId);
    const away = rows.get(fixture.awayClubId);

    if (!home || !away) {
      throw new Error(`Unknown club in fixture ${fixture.id}.`);
    }

    home.played += 1;
    away.played += 1;

    home.goalsFor += fixture.homeGoals;
    home.goalsAgainst += fixture.awayGoals;

    away.goalsFor += fixture.awayGoals;
    away.goalsAgainst += fixture.homeGoals;

    if (fixture.homeGoals > fixture.awayGoals) {
      home.wins += 1;
      home.points += 3;
      away.losses += 1;
    } else if (fixture.homeGoals < fixture.awayGoals) {
      away.wins += 1;
      away.points += 3;
      home.losses += 1;
    } else {
      home.draws += 1;
      away.draws += 1;
      home.points += 1;
      away.points += 1;
    }
  }

  const standings = [...rows.values()];

  for (const row of standings) {
    row.goalDifference = row.goalsFor - row.goalsAgainst;
  }

  standings.sort((a, b) => {
    return (
      b.points - a.points ||
      b.goalDifference - a.goalDifference ||
      b.goalsFor - a.goalsFor ||
      a.clubId.localeCompare(b.clubId)
    );
  });

  return standings.map((row, index) => ({
    ...row,
    position: index + 1,
  }));
}