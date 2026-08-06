import type { Club } from "../../domain/club";
import type { Fixture } from "../../domain/fixture";
import type { Lineup } from "../../domain/lineup";
import type { MatchEvent } from "../../domain/matchEvent";
import type { Player } from "../../domain/player";
import { generateMatchIncidents } from "./generateMatchIncidents";

export interface ChronologicalMatchResult {
  fixtureId: string;
  homeGoals: number;
  awayGoals: number;
  events: MatchEvent[];
}

interface TeamContext {
  club: Club;
  opponent: Club;
  lineup: Lineup;
  players: Player[];
  opponentPlayers: Player[];
  side: "HOME" | "AWAY";
}

export function simulateChronologicalMatch(
  fixture: Fixture,
  homeClub: Club,
  awayClub: Club,
  homeLineup: Lineup,
  awayLineup: Lineup,
  players: Player[],
): ChronologicalMatchResult {
  const homePlayers = getStartingPlayers(homeLineup, players);
  const awayPlayers = getStartingPlayers(awayLineup, players);

  const events: MatchEvent[] = [
    createEvent({
      id: `${fixture.id}_KICK_OFF`,
      fixtureId: fixture.id,
      minute: 0,
      second: 0,
      type: "KICK_OFF",
      description: "Comienza el partido.",
    }),
  ];

  let homeGoals = 0;
  let awayGoals = 0;

  for (let minute = 1; minute <= 90; minute += 1) {
    const attackingSide = selectPossessionTeam(
      homeClub,
      awayClub,
    );

    const context: TeamContext =
      attackingSide === "HOME"
        ? {
            club: homeClub,
            opponent: awayClub,
            lineup: homeLineup,
            players: homePlayers,
            opponentPlayers: awayPlayers,
            side: "HOME",
          }
        : {
            club: awayClub,
            opponent: homeClub,
            lineup: awayLineup,
            players: awayPlayers,
            opponentPlayers: homePlayers,
            side: "AWAY",
          };

    events.push({
      id: `${fixture.id}_POSSESSION_${minute}`,
      fixtureId: fixture.id,
      minute,
      second: 0,
      type: "POSSESSION",
      clubId: context.club.id,
      durationSeconds: 60,
      visible: false,
      description: "",
    });

    const chanceProbability = calculateChanceProbability(
      context.club,
      context.opponent,
    );

    if (Math.random() > chanceProbability) {
      continue;
    }

    const action = generateAttackingAction({
      fixture,
      minute,
      context,
    });

    events.push(...action.events);

    if (action.goal) {
      if (context.side === "HOME") {
        homeGoals += 1;
      } else {
        awayGoals += 1;
      }
    }
  }

  const incidentEvents = generateMatchIncidents({
    fixtureId: fixture.id,
    homeLineup,
    awayLineup,
    players,
  });

  events.push(...incidentEvents);

  events.push(
    createEvent({
      id: `${fixture.id}_HALF_TIME`,
      fixtureId: fixture.id,
      minute: 45,
      second: 59,
      type: "HALF_TIME",
      description: "Descanso.",
    }),
    createEvent({
      id: `${fixture.id}_SECOND_HALF`,
      fixtureId: fixture.id,
      minute: 46,
      second: 0,
      type: "SECOND_HALF",
      description: "Comienza la segunda parte.",
    }),
    createEvent({
      id: `${fixture.id}_FULL_TIME`,
      fixtureId: fixture.id,
      minute: 90,
      second: 59,
      type: "FULL_TIME",
      description: "Final del partido.",
    }),
  );

  return {
    fixtureId: fixture.id,
    homeGoals,
    awayGoals,
    events: events.sort(compareMatchEvents),
  };
}

interface GenerateAttackingActionInput {
  fixture: Fixture;
  minute: number;
  context: TeamContext;
}

function generateAttackingAction({
  fixture,
  minute,
  context,
}: GenerateAttackingActionInput): {
  events: MatchEvent[];
  goal: boolean;
} {
  const events: MatchEvent[] = [];
  const second = randomInteger(5, 53);

  const attacker = weightedRandomPlayer(
    context.players,
    attackingWeight,
  );

  // Fuera de juego
  if (Math.random() < 0.09) {
    events.push({
      id: `${fixture.id}_OFFSIDE_${context.side}_${minute}_${second}`,
      fixtureId: fixture.id,
      minute,
      second,
      type: "OFFSIDE",
      clubId: context.club.id,
      playerId: attacker.id,
      description: `Fuera de juego de ${attacker.shortName}.`,
    });

    return { events, goal: false };
  }

  // Penalti
  if (Math.random() < 0.018) {
    return generatePenaltyAction({
      fixture,
      minute,
      second,
      context,
      taker: attacker,
    });
  }

  const shotId =
    `${fixture.id}_SHOT_${context.side}_${minute}_${second}`;

  const onTargetProbability = calculateOnTargetProbability(
    attacker,
    context.opponent,
  );

  if (Math.random() > onTargetProbability) {
    events.push({
      id: shotId,
      fixtureId: fixture.id,
      minute,
      second,
      type: "SHOT",
      clubId: context.club.id,
      playerId: attacker.id,
      description: `${attacker.shortName} dispara fuera.`,
    });

    return { events, goal: false };
  }

  events.push({
    id: shotId,
    fixtureId: fixture.id,
    minute,
    second,
    type: "SHOT_ON_TARGET",
    clubId: context.club.id,
    playerId: attacker.id,
    description: `Disparo a puerta de ${attacker.shortName}.`,
  });

  const goalkeeper = findGoalkeeper(
    context.opponentPlayers,
  );

  const saveProbability = calculateSaveProbability(
    attacker,
    goalkeeper,
    context.opponent,
  );

  if (Math.random() < saveProbability) {
    const saveId =
      `${fixture.id}_SAVE_${context.side}_${minute}_${second}`;

    events.push({
      id: saveId,
      fixtureId: fixture.id,
      minute,
      second: Math.min(59, second + 1),
      type: "SAVE",
      clubId: context.opponent.id,
      playerId: goalkeeper?.id,
      relatedEventId: shotId,
      description: goalkeeper
        ? `Parada de ${goalkeeper.shortName}.`
        : "El portero evita el gol.",
    });

    if (Math.random() < 0.28) {
      events.push({
        id: `${fixture.id}_CORNER_${context.side}_${minute}_${second}`,
        fixtureId: fixture.id,
        minute,
        second: Math.min(59, second + 2),
        type: "CORNER",
        clubId: context.club.id,
        relatedEventId: saveId,
        description: `Córner para ${context.club.name}.`,
      });
    }

    return { events, goal: false };
  }

  // Algunas jugadas terminan en gol anulado.
  if (Math.random() < 0.035) {
    events.push({
      id: `${fixture.id}_DISALLOWED_${context.side}_${minute}_${second}`,
      fixtureId: fixture.id,
      minute,
      second: Math.min(59, second + 2),
      type: "GOAL_DISALLOWED",
      clubId: context.club.id,
      playerId: attacker.id,
      relatedEventId: shotId,
      description: `Gol anulado a ${attacker.shortName}.`,
    });

    return { events, goal: false };
  }

  const assistantCandidates = context.players.filter(
    (player) => player.id !== attacker.id,
  );

  const assistant = weightedRandomPlayer(
    assistantCandidates,
    assistingWeight,
  );

  events.push({
    id: `${fixture.id}_GOAL_${context.side}_${minute}_${second}`,
    fixtureId: fixture.id,
    minute,
    second: Math.min(59, second + 2),
    type: "GOAL",
    clubId: context.club.id,
    playerId: attacker.id,
    assistPlayerId: assistant.id,
    relatedEventId: shotId,
    description:
      `¡Gol de ${attacker.shortName}! ` +
      `Asistencia de ${assistant.shortName}.`,
  });

  return { events, goal: true };
}

interface GeneratePenaltyActionInput {
  fixture: Fixture;
  minute: number;
  second: number;
  context: TeamContext;
  taker: Player;
}

function generatePenaltyAction({
  fixture,
  minute,
  second,
  context,
  taker,
}: GeneratePenaltyActionInput): {
  events: MatchEvent[];
  goal: boolean;
} {
  const awardedId =
    `${fixture.id}_PENALTY_${context.side}_${minute}_${second}`;

  const scoredProbability = Math.min(
    0.9,
    Math.max(
      0.58,
      0.64 +
        taker.attributes.shooting / 400 +
        taker.overall / 800,
    ),
  );

  const scored = Math.random() < scoredProbability;

  const events: MatchEvent[] = [
    {
      id: awardedId,
      fixtureId: fixture.id,
      minute,
      second,
      type: "PENALTY_AWARDED",
      clubId: context.club.id,
      description: `Penalti para ${context.club.name}.`,
    },
    {
      id: `${awardedId}_RESULT`,
      fixtureId: fixture.id,
      minute,
      second: Math.min(59, second + 4),
      type: scored
        ? "PENALTY_SCORED"
        : "PENALTY_MISSED",
      clubId: context.club.id,
      playerId: taker.id,
      relatedEventId: awardedId,
      description: scored
        ? `${taker.shortName} marca de penalti.`
        : `${taker.shortName} falla el penalti.`,
    },
  ];

  if (scored) {
    events.push({
      id: `${awardedId}_GOAL`,
      fixtureId: fixture.id,
      minute,
      second: Math.min(59, second + 5),
      type: "GOAL",
      clubId: context.club.id,
      playerId: taker.id,
      relatedEventId: awardedId,
      description: `¡Gol de ${taker.shortName} de penalti!`,
    });
  }

  return { events, goal: scored };
}

function selectPossessionTeam(
  homeClub: Club,
  awayClub: Club,
): "HOME" | "AWAY" {
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

  return Math.random() < homeProbability
    ? "HOME"
    : "AWAY";
}

function calculateChanceProbability(
  attackingClub: Club,
  defendingClub: Club,
): number {
  const difference =
    attackingClub.attack +
    attackingClub.midfield * 0.35 -
    defendingClub.defence -
    defendingClub.midfield * 0.2;

  return clamp(
    0.13 + difference / 600,
    0.07,
    0.24,
  );
}

function calculateOnTargetProbability(
  attacker: Player,
  opponent: Club,
): number {
  return clamp(
    0.34 +
      attacker.attributes.shooting / 300 +
      attacker.attributes.dribbling / 700 -
      opponent.defence / 800,
    0.27,
    0.7,
  );
}

function calculateSaveProbability(
  attacker: Player,
  goalkeeper: Player | undefined,
  defendingClub: Club,
): number {
  const goalkeeperStrength =
    goalkeeper?.attributes.goalkeeping ??
    defendingClub.defence;

  return clamp(
    0.55 +
      goalkeeperStrength / 300 -
      attacker.attributes.shooting / 350,
    0.3,
    0.82,
  );
}

function getStartingPlayers(
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
  players: Player[],
): Player | undefined {
  return players.find(
    (player) => player.position === "GK",
  );
}

function attackingWeight(player: Player): number {
  const positionBonus: Record<Player["position"], number> = {
    GK: 1,
    RB: 6,
    CB: 4,
    LB: 6,
    DM: 10,
    CM: 18,
    AM: 32,
    RW: 42,
    LW: 42,
    ST: 55,
  };

  return (
    player.attributes.shooting +
    player.attributes.dribbling * 0.4 +
    positionBonus[player.position]
  );
}

function assistingWeight(player: Player): number {
  return (
    player.attributes.passing +
    player.attributes.dribbling * 0.45
  );
}

function weightedRandomPlayer(
  players: Player[],
  weightSelector: (player: Player) => number,
): Player {
  if (players.length === 0) {
    throw new Error("No hay jugadores disponibles.");
  }

  const weightedPlayers = players.map((player) => ({
    player,
    weight: Math.max(1, weightSelector(player)),
  }));

  const totalWeight = weightedPlayers.reduce(
    (total, item) => total + item.weight,
    0,
  );

  let randomValue = Math.random() * totalWeight;

  for (const item of weightedPlayers) {
    randomValue -= item.weight;

    if (randomValue <= 0) {
      return item.player;
    }
  }

  return weightedPlayers[weightedPlayers.length - 1].player;
}

function compareMatchEvents(
  first: MatchEvent,
  second: MatchEvent,
): number {
  const firstTime =
    first.minute * 60 + (first.second ?? 0);

  const secondTime =
    second.minute * 60 + (second.second ?? 0);

  if (firstTime !== secondTime) {
    return firstTime - secondTime;
  }

  return eventPriority(first.type) - eventPriority(second.type);
}

function eventPriority(
  type: MatchEvent["type"],
): number {
  const priorities: Record<MatchEvent["type"], number> = {
    POSSESSION: 0,
    KICK_OFF: 1,
    FOUL: 2,
    OFFSIDE: 3,
    SHOT: 4,
    SHOT_ON_TARGET: 5,
    SAVE: 6,
    CORNER: 7,
    PENALTY_AWARDED: 8,
    PENALTY_MISSED: 9,
    PENALTY_SCORED: 10,
    GOAL: 11,
    GOAL_DISALLOWED: 12,
    YELLOW_CARD: 13,
    SECOND_YELLOW_CARD: 14,
    RED_CARD: 15,
    INJURY: 16,
    SUBSTITUTION: 17,
    HALF_TIME: 18,
    SECOND_HALF: 19,
    FULL_TIME: 20,
  };

  return priorities[type];
}

function createEvent(event: MatchEvent): MatchEvent {
  return event;
}

function randomInteger(
  minimum: number,
  maximum: number,
): number {
  return Math.floor(
    Math.random() * (maximum - minimum + 1),
  ) + minimum;
}

function clamp(
  value: number,
  minimum: number,
  maximum: number,
): number {
  return Math.max(minimum, Math.min(maximum, value));
}