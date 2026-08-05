import type {
  InjurySeverity,
  MatchEvent,
} from "../../domain/matchEvent";
import type { Lineup } from "../../domain/lineup";
import type { Player } from "../../domain/player";

interface GenerateMatchIncidentsInput {
  fixtureId: string;
  homeLineup: Lineup;
  awayLineup: Lineup;
  players: Player[];
}

export function generateMatchIncidents({
  fixtureId,
  homeLineup,
  awayLineup,
  players,
}: GenerateMatchIncidentsInput): MatchEvent[] {
  const playersById = new Map(
    players.map((player) => [player.id, player]),
  );

  const homePlayerIds = homeLineup.starters.map(
    (slot) => slot.playerId,
  );

  const awayPlayerIds = awayLineup.starters.map(
    (slot) => slot.playerId,
  );

  const events: MatchEvent[] = [];

  addYellowCards(
    events,
    fixtureId,
    homePlayerIds,
    playersById,
  );

  addYellowCards(
    events,
    fixtureId,
    awayPlayerIds,
    playersById,
  );

  addPossibleInjury(
    events,
    fixtureId,
    homePlayerIds,
    playersById,
  );

  addPossibleInjury(
    events,
    fixtureId,
    awayPlayerIds,
    playersById,
  );

  return events.sort((a, b) => a.minute - b.minute);
}

function addYellowCards(
  events: MatchEvent[],
  fixtureId: string,
  playerIds: string[],
  playersById: Map<string, Player>,
): void {
  const cardCount = randomInteger(0, 3);

  for (let index = 0; index < cardCount; index += 1) {
    const playerId = randomItem(playerIds);
    const player = playersById.get(playerId);

    if (!player) {
      continue;
    }

    events.push({
      id: `${fixtureId}_YELLOW_${playerId}_${index}`,
      fixtureId,
      minute: randomInteger(8, 88),
      type: "YELLOW_CARD",
      clubId: player.clubId,
      playerId,
      description: `Tarjeta amarilla para ${player.shortName}.`,
    });
  }
}

function addPossibleInjury(
  events: MatchEvent[],
  fixtureId: string,
  playerIds: string[],
  playersById: Map<string, Player>,
): void {
  if (Math.random() > 0.22) {
    return;
  }

  const playerId = randomItem(playerIds);
  const player = playersById.get(playerId);

  if (!player) {
    return;
  }

  const severity = selectInjurySeverity();

  events.push({
    id: `${fixtureId}_INJURY_${playerId}`,
    fixtureId,
    minute: randomInteger(12, 84),
    type: "INJURY",
    clubId: player.clubId,
    playerId,
    injurySeverity: severity,
    description: buildInjuryDescription(
      player.shortName,
      severity,
    ),
  });
}

function selectInjurySeverity(): InjurySeverity {
  const roll = Math.random();

  if (roll < 0.45) {
    return "KNOCK";
  }

  if (roll < 0.72) {
    return "MINOR";
  }

  if (roll < 0.92) {
    return "MODERATE";
  }

  return "SERIOUS";
}

function buildInjuryDescription(
  playerName: string,
  severity: InjurySeverity,
): string {
  switch (severity) {
    case "KNOCK":
      return `${playerName} recibe un golpe, pero puede continuar.`;

    case "MINOR":
      return `${playerName} tiene molestias físicas.`;

    case "MODERATE":
      return `${playerName} no puede continuar.`;

    case "SERIOUS":
      return `Lesión importante de ${playerName}. No puede continuar.`;
  }
}

function randomInteger(minimum: number, maximum: number): number {
  return Math.floor(
    Math.random() * (maximum - minimum + 1),
  ) + minimum;
}

function randomItem<T>(items: T[]): T {
  const item = items[
    Math.floor(Math.random() * items.length)
  ];

  if (!item) {
    throw new Error("No hay elementos disponibles.");
  }

  return item;
}