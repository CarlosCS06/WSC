import type { Club } from "../../domain/club";
import type { Fixture } from "../../domain/fixture";
import { simulateMatch } from "../match/simulateMatch";

interface SimulateMatchdayInput {
  matchday: number;
  fixtures: Fixture[];
  clubs: Club[];
}

export function simulateMatchday({
  matchday,
  fixtures,
  clubs,
}: SimulateMatchdayInput): Fixture[] {
  const clubsById = new Map(
    clubs.map((club) => [club.id, club]),
  );

  return fixtures.map((fixture) => {
    if (fixture.matchday !== matchday || fixture.played) {
      return fixture;
    }

    const homeClub = clubsById.get(fixture.homeClubId);
    const awayClub = clubsById.get(fixture.awayClubId);

    if (!homeClub || !awayClub) {
      throw new Error(
        `No se ha encontrado un club para el partido ${fixture.id}.`,
      );
    }

    const result = simulateMatch(
      fixture,
      homeClub,
      awayClub,
    );

    return {
      ...fixture,
      played: true,
      homeGoals: result.homeGoals,
      awayGoals: result.awayGoals,
    };
  });
}