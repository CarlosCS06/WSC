import type { Club } from "../../domain/club";
import type { Fixture } from "../../domain/fixture";

interface FixturesListProps {
  fixtures: Fixture[];
  clubs: Club[];
  matchday: number;
}

export function FixturesList({
  fixtures,
  clubs,
  matchday,
}: FixturesListProps) {
  const clubNames = new Map(
    clubs.map((club) => [club.id, club.name]),
  );

  const matchdayFixtures = fixtures.filter(
    (fixture) => fixture.matchday === matchday,
  );

  return (
    <div className="fixtures-list">
      {matchdayFixtures.map((fixture) => (
        <article className="fixture-row" key={fixture.id}>
          <span>
            {clubNames.get(fixture.homeClubId)}
          </span>

          <strong>
            {fixture.played
              ? `${fixture.homeGoals} - ${fixture.awayGoals}`
              : "vs"}
          </strong>

          <span>
            {clubNames.get(fixture.awayClubId)}
          </span>
        </article>
      ))}
    </div>
  );
}