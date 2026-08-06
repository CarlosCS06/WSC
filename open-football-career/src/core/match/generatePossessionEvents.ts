import type { Club } from "../../domain/club";
import type { Fixture } from "../../domain/fixture";
import type { MatchEvent } from "../../domain/matchEvent";

interface GeneratePossessionEventsInput {
  fixture: Fixture;
  homeClub: Club;
  awayClub: Club;
}

export function generatePossessionEvents({
  fixture,
  homeClub,
  awayClub,
}: GeneratePossessionEventsInput): MatchEvent[] {
  const events: MatchEvent[] = [];

  const homeStrength =
    homeClub.midfield * 0.65 +
    homeClub.reputation * 0.2 +
    homeClub.attack * 0.15 +
    3;

  const awayStrength =
    awayClub.midfield * 0.65 +
    awayClub.reputation * 0.2 +
    awayClub.attack * 0.15;

  const homeProbability =
    homeStrength / (homeStrength + awayStrength);

  let elapsedSeconds = 0;
  let index = 0;

  while (elapsedSeconds < 90 * 60) {
    const durationSeconds = randomInteger(8, 38);

    const remainingSeconds =
      90 * 60 - elapsedSeconds;

    const realDuration = Math.min(
      durationSeconds,
      remainingSeconds,
    );

    const clubId =
      Math.random() < homeProbability
        ? homeClub.id
        : awayClub.id;

    events.push({
      id: `${fixture.id}_POSSESSION_${index}`,
      fixtureId: fixture.id,
      minute: Math.floor(elapsedSeconds / 60),
      type: "POSSESSION",
      clubId,
      durationSeconds: realDuration,
      visible: false,
      description: "",
    });

    elapsedSeconds += realDuration;
    index += 1;
  }

  return events;
}

function randomInteger(
  minimum: number,
  maximum: number,
): number {
  return Math.floor(
    Math.random() * (maximum - minimum + 1),
  ) + minimum;
}