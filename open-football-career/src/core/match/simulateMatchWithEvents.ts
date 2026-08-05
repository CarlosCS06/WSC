import type { Club } from "../../domain/club";
import type { Fixture } from "../../domain/fixture";
import type { Lineup } from "../../domain/lineup";
import type { MatchEvent } from "../../domain/matchEvent";
import type { Player } from "../../domain/player";
import { simulateMatch } from "./simulateMatch";
import { generateMatchIncidents } from "./generateMatchIncidents";

export interface SimulatedMatchWithEvents {
  fixtureId: string;
  homeGoals: number;
  awayGoals: number;
  events: MatchEvent[];
}

function createGoalMinutes(totalGoals: number): number[] {
  const minutes: number[] = [];

  for (let index = 0; index < totalGoals; index += 1) {
    minutes.push(Math.floor(Math.random() * 89) + 1);
  }

  return minutes.sort((a, b) => a - b);
}

function weightedRandomPlayer(
  players: Player[],
  weightSelector: (player: Player) => number,
): Player {
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

  const fallback = weightedPlayers.at(-1)?.player;

  if (!fallback) {
    throw new Error("No hay jugadores para seleccionar.");
  }

  return fallback;
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
    .filter((player): player is Player => player !== undefined);
}

function createGoalEvents(
  fixture: Fixture,
  club: Club,
  goalMinutes: number[],
  lineup: Lineup,
  players: Player[],
  side: "HOME" | "AWAY",
): MatchEvent[] {
  const lineupPlayers = getLineupPlayers(lineup, players);

  return goalMinutes.map((minute, index) => {
    const scorer = weightedRandomPlayer(
      lineupPlayers,
      (player) =>
        player.attributes.shooting +
        player.attributes.dribbling / 2 +
        (player.position === "ST" ? 35 : 0) +
        (["RW", "LW"].includes(player.position) ? 20 : 0),
    );

    const possibleAssistants = lineupPlayers.filter(
      (player) => player.id !== scorer.id,
    );

    const assistant = weightedRandomPlayer(
      possibleAssistants,
      (player) =>
        player.attributes.passing +
        player.attributes.dribbling / 2,
    );

    return {
      id: `${fixture.id}_${side}_GOAL_${index + 1}`,
      fixtureId: fixture.id,
      minute,
      type: "GOAL",
      clubId: club.id,
      playerId: scorer.id,
      assistPlayerId: assistant.id,
      description: `¡Gol de ${scorer.shortName}! Asistencia de ${assistant.shortName}.`,
    };
  });
}

export function simulateMatchWithEvents(
  fixture: Fixture,
  homeClub: Club,
  awayClub: Club,
  homeLineup: Lineup,
  awayLineup: Lineup,
  players: Player[],
): SimulatedMatchWithEvents {
  const result = simulateMatch(
    fixture,
    homeClub,
    awayClub,
  );

  const homeGoalEvents = createGoalEvents(
    fixture,
    homeClub,
    createGoalMinutes(result.homeGoals),
    homeLineup,
    players,
    "HOME",
  );

  const awayGoalEvents = createGoalEvents(
    fixture,
    awayClub,
    createGoalMinutes(result.awayGoals),
    awayLineup,
    players,
    "AWAY",
  );

  const incidentEvents = generateMatchIncidents({
    fixtureId: fixture.id,
    homeLineup,
    awayLineup,
    players,
  });

  const events: MatchEvent[] = [
    {
      id: `${fixture.id}_KICK_OFF`,
      fixtureId: fixture.id,
      minute: 0,
      type: "KICK_OFF" as const,
      description: "Comienza el partido.",
    },
    ...homeGoalEvents,
    ...awayGoalEvents,
    ...incidentEvents,
    {
      id: `${fixture.id}_HALF_TIME`,
      fixtureId: fixture.id,
      minute: 45,
      type: "HALF_TIME" as const,
      description: "Descanso.",
    },
    {
      id: `${fixture.id}_SECOND_HALF`,
      fixtureId: fixture.id,
      minute: 46,
      type: "SECOND_HALF" as const,
      description: "Comienza la segunda parte.",
    },
    {
      id: `${fixture.id}_FULL_TIME`,
      fixtureId: fixture.id,
      minute: 90,
      type: "FULL_TIME" as const,
      description: "Final del partido.",
    },
  ].sort((a, b) => {
    if (a.minute !== b.minute) {
      return a.minute - b.minute;
    }

    const priority: Record<MatchEvent["type"], number> = {
      KICK_OFF: 0,
      FOUL: 1,
      YELLOW_CARD: 2,
      SECOND_YELLOW_CARD: 3,
      RED_CARD: 4,
      INJURY: 5,
      SUBSTITUTION: 6,
      GOAL: 7,
      HALF_TIME: 8,
      SECOND_HALF: 9,
      FULL_TIME: 10,
    };

    return (
      priority[a.type as MatchEvent["type"]] -
      priority[b.type as MatchEvent["type"]]
    );
  });

  return {
    fixtureId: fixture.id,
    homeGoals: result.homeGoals,
    awayGoals: result.awayGoals,
    events,
  };
}