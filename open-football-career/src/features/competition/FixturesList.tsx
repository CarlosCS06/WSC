import type { Club } from "../../domain/club";
import type { Fixture } from "../../domain/fixture";

interface FixturesListProps {
  fixtures: Fixture[];
  clubs: Club[];
  matchday: number;
  managedClubId?: string | null;
}

export function FixturesList({
  fixtures,
  clubs,
  matchday,
  managedClubId,
}: FixturesListProps) {
  const clubsById = new Map(
    clubs.map((club) => [club.id, club]),
  );

  const matchdayFixtures = fixtures.filter(
    (fixture) => fixture.matchday === matchday,
  );

  if (matchdayFixtures.length === 0) {
    return <p>No hay partidos para esta jornada.</p>;
  }

  return (
    <div className="fixtures-list">
      {matchdayFixtures.map((fixture) => {
        const homeClub = clubsById.get(fixture.homeClubId);
        const awayClub = clubsById.get(fixture.awayClubId);

        const isManagedMatch =
          fixture.homeClubId === managedClubId ||
          fixture.awayClubId === managedClubId;

        return (
          <article
            className={`fixture-row ${
              isManagedMatch ? "managed-fixture-row" : ""
            }`}
            key={fixture.id}
          >
            <span
              className={
                fixture.homeClubId === managedClubId
                  ? "managed-club-name"
                  : undefined
              }
            >
              {homeClub?.name ?? fixture.homeClubId}
            </span>

            <strong className="fixture-score">
              {fixture.played
                ? `${fixture.homeGoals ?? 0} - ${
                    fixture.awayGoals ?? 0
                  }`
                : "vs"}
            </strong>

            <span
              className={
                fixture.awayClubId === managedClubId
                  ? "managed-club-name"
                  : undefined
              }
            >
              {awayClub?.name ?? fixture.awayClubId}
            </span>
          </article>
        );
      })}
    </div>
  );
}