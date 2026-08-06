import type { Club } from "../../domain/club";
import type { Fixture } from "../../domain/fixture";
import type { Lineup } from "../../domain/lineup";
import type { MatchEvent } from "../../domain/matchEvent";
import type { Player } from "../../domain/player";

interface GenerateMatchActionsInput {
  fixture: Fixture;
  homeClub: Club;
  awayClub: Club;
  homeLineup: Lineup;
  awayLineup: Lineup;
  players: Player[];
  existingGoalEvents: MatchEvent[];
}

export function generateMatchActions({
  fixture,
  homeClub,
  awayClub,
  homeLineup,
  awayLineup,
  players,
  existingGoalEvents,
}: GenerateMatchActionsInput): MatchEvent[] {
  const events: MatchEvent[] = [];

  events.push(
    ...generateTeamActions({
      fixture,
      club: homeClub,
      opponent: awayClub,
      lineup: homeLineup,
      players,
      existingGoals: existingGoalEvents.filter(
        (event) => event.clubId === homeClub.id,
      ),
      side: "HOME",
    }),
  );

  events.push(
    ...generateTeamActions({
      fixture,
      club: awayClub,
      opponent: homeClub,
      lineup: awayLineup,
      players,
      existingGoals: existingGoalEvents.filter(
        (event) => event.clubId === awayClub.id,
      ),
      side: "AWAY",
    }),
  );

  return events.sort(compareEvents);
}

interface GenerateTeamActionsInput {
  fixture: Fixture;
  club: Club;
  opponent: Club;
  lineup: Lineup;
  players: Player[];
  existingGoals: MatchEvent[];
  side: "HOME" | "AWAY";
}

function generateTeamActions({
  fixture,
  club,
  opponent,
  lineup,
  players,
  existingGoals,
  side,
}: GenerateTeamActionsInput): MatchEvent[] {
  const lineupPlayers = getLineupPlayers(lineup, players);

  const attackStrength =
    club.attack * 0.55 +
    club.midfield * 0.3 +
    club.reputation * 0.15;

  const estimatedShots = clamp(
    Math.round(6 + attackStrength / 9 + randomBetween(-3, 3)),
    5,
    22,
  );

  const events: MatchEvent[] = [];

  for (let index = 0; index < estimatedShots; index += 1) {
    const shooter = weightedRandomPlayer(
      lineupPlayers,
      shootingWeight,
    );

    const minute = randomMinute();

    const roll = Math.random();

    if (roll < 0.42) {
      events.push({
        id: `${fixture.id}_${side}_SHOT_${index}`,
        fixtureId: fixture.id,
        minute,
        type: "SHOT",
        clubId: club.id,
        playerId: shooter.id,
        description: `${shooter.shortName} dispara fuera.`,
      });

      continue;
    }

    const shotId =
      `${fixture.id}_${side}_SHOT_ON_TARGET_${index}`;

    events.push({
      id: shotId,
      fixtureId: fixture.id,
      minute,
      type: "SHOT_ON_TARGET",
      clubId: club.id,
      playerId: shooter.id,
      description: `Disparo a puerta de ${shooter.shortName}.`,
    });

    const closeToExistingGoal = existingGoals.some(
      (goal) => Math.abs(goal.minute - minute) <= 1,
    );

    if (!closeToExistingGoal) {
      const goalkeeper = findGoalkeeper(
        opponent.id,
        players,
      );

      events.push({
        id: `${fixture.id}_${side}_SAVE_${index}`,
        fixtureId: fixture.id,
        minute,
        type: "SAVE",
        clubId: opponent.id,
        playerId: goalkeeper?.id,
        relatedEventId: shotId,
        description: goalkeeper
          ? `Parada de ${goalkeeper.shortName}.`
          : `El portero evita el gol.`,
      });
    }

    if (Math.random() < 0.23) {
      events.push({
        id: `${fixture.id}_${side}_CORNER_${index}`,
        fixtureId: fixture.id,
        minute,
        type: "CORNER",
        clubId: club.id,
        relatedEventId: shotId,
        description: `Córner para ${club.name}.`,
      });
    }
  }

  const foulCount = randomInteger(5, 16);

  for (let index = 0; index < foulCount; index += 1) {
    const player = weightedRandomPlayer(
      lineupPlayers,
      defensiveActionWeight,
    );

    events.push({
      id: `${fixture.id}_${side}_FOUL_${index}`,
      fixtureId: fixture.id,
      minute: randomMinute(),
      type: "FOUL",
      clubId: club.id,
      playerId: player.id,
      description: `Falta cometida por ${player.shortName}.`,
    });
  }

  const offsideCount = randomInteger(0, 4);

  for (let index = 0; index < offsideCount; index += 1) {
    const attacker = weightedRandomPlayer(
      lineupPlayers,
      attackingPositionWeight,
    );

    events.push({
      id: `${fixture.id}_${side}_OFFSIDE_${index}`,
      fixtureId: fixture.id,
      minute: randomMinute(),
      type: "OFFSIDE",
      clubId: club.id,
      playerId: attacker.id,
      description: `Fuera de juego de ${attacker.shortName}.`,
    });
  }

  if (Math.random() < 0.12) {
    events.push(
      ...generatePenaltyEvents({
        fixture,
        club,
        lineupPlayers,
        side,
      }),
    );
  }

  if (Math.random() < 0.06) {
    const attacker = weightedRandomPlayer(
      lineupPlayers,
      attackingPositionWeight,
    );

    events.push({
      id: `${fixture.id}_${side}_DISALLOWED_GOAL`,
      fixtureId: fixture.id,
      minute: randomMinute(),
      type: "GOAL_DISALLOWED",
      clubId: club.id,
      playerId: attacker.id,
      description: `Gol anulado a ${attacker.shortName}.`,
    });
  }

  return events;
}

interface GeneratePenaltyEventsInput {
  fixture: Fixture;
  club: Club;
  lineupPlayers: Player[];
  side: "HOME" | "AWAY";
}

function generatePenaltyEvents({
  fixture,
  club,
  lineupPlayers,
  side,
}: GeneratePenaltyEventsInput): MatchEvent[] {
  const minute = randomInteger(8, 88);

  const taker = weightedRandomPlayer(
    lineupPlayers,
    penaltyWeight,
  );

  const awardedId =
    `${fixture.id}_${side}_PENALTY_AWARDED_${minute}`;

  const scored = Math.random() < 0.76;

  return [
    {
      id: awardedId,
      fixtureId: fixture.id,
      minute,
      type: "PENALTY_AWARDED",
      clubId: club.id,
      description: `Penalti para ${club.name}.`,
    },
    {
      id: `${fixture.id}_${side}_PENALTY_RESULT_${minute}`,
      fixtureId: fixture.id,
      minute,
      type: scored
        ? "PENALTY_SCORED"
        : "PENALTY_MISSED",
      clubId: club.id,
      playerId: taker.id,
      relatedEventId: awardedId,
      description: scored
        ? `${taker.shortName} marca de penalti.`
        : `${taker.shortName} falla el penalti.`,
    },
  ];
}

function getLineupPlayers(
  lineup: Lineup,
  players: Player[],
): Player[] {
  const playersById = new Map(
    players.map((player) => [player.id, player]),
  );

  return lineup.starters
    .map((slot) => playersById.get(slot.playerId))
    .filter((player): player is Player => Boolean(player));
}

function findGoalkeeper(
  clubId: string,
  players: Player[],
): Player | undefined {
  return players
    .filter(
      (player) =>
        player.clubId === clubId &&
        player.position === "GK",
    )
    .sort((a, b) => b.overall - a.overall)[0];
}

function weightedRandomPlayer(
  players: Player[],
  getWeight: (player: Player) => number,
): Player {
  const weighted = players.map((player) => ({
    player,
    weight: Math.max(1, getWeight(player)),
  }));

  const total = weighted.reduce(
    (sum, item) => sum + item.weight,
    0,
  );

  let roll = Math.random() * total;

  for (const item of weighted) {
    roll -= item.weight;

    if (roll <= 0) {
      return item.player;
    }
  }

  const fallback = weighted.at(-1)?.player;

  if (!fallback) {
    throw new Error("No hay jugadores disponibles.");
  }

  return fallback;
}

function shootingWeight(player: Player): number {
  return (
    player.attributes.shooting +
    player.attributes.dribbling * 0.3 +
    attackingPositionWeight(player)
  );
}

function defensiveActionWeight(player: Player): number {
  switch (player.position) {
    case "CB":
    case "DM":
      return 35;

    case "RB":
    case "LB":
    case "CM":
      return 24;

    case "GK":
      return 2;

    default:
      return 10;
  }
}

function attackingPositionWeight(player: Player): number {
  switch (player.position) {
    case "ST":
      return 45;
    case "RW":
    case "LW":
      return 30;
    case "AM":
      return 25;
    case "CM":
      return 12;
    default:
      return 4;
  }
}

function penaltyWeight(player: Player): number {
  return (
    player.attributes.shooting * 1.2 +
    player.overall * 0.5
  );
}

function randomMinute(): number {
  return randomInteger(2, 89);
}

function randomInteger(
  minimum: number,
  maximum: number,
): number {
  return Math.floor(
    Math.random() * (maximum - minimum + 1),
  ) + minimum;
}

function randomBetween(
  minimum: number,
  maximum: number,
): number {
  return minimum + Math.random() * (maximum - minimum);
}

function clamp(
  value: number,
  minimum: number,
  maximum: number,
): number {
  return Math.max(minimum, Math.min(maximum, value));
}

function compareEvents(
  first: MatchEvent,
  second: MatchEvent,
): number {
  return first.minute - second.minute;
}