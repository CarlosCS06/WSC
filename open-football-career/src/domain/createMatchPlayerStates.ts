import type { Lineup } from "./lineup";
import type { MatchPlayerState } from "./matchPlayerState";
import type { Player } from "./player";

interface CreateMatchPlayerStatesInput {
  homeLineup: Lineup;
  awayLineup: Lineup;
  players: Player[];
}

export function createMatchPlayerStates({
  homeLineup,
  awayLineup,
  players,
}: CreateMatchPlayerStatesInput): MatchPlayerState[] {
  const playersById = new Map(
    players.map((player) => [player.id, player]),
  );

  return [
    ...createLineupStates(homeLineup, playersById),
    ...createLineupStates(awayLineup, playersById),
  ];
}

function createLineupStates(
  lineup: Lineup,
  playersById: Map<string, Player>,
): MatchPlayerState[] {
  const starterIds = new Set(
    lineup.starters.map((slot) => slot.playerId),
  );

  const squadIds = [
    ...starterIds,
    ...lineup.substitutes,
  ];

  return squadIds.map((playerId) => {
    const player = playersById.get(playerId);

    if (!player) {
      throw new Error(
        `No se ha encontrado el jugador ${playerId}.`,
      );
    }

    const isStarter = starterIds.has(playerId);

    return {
      playerId,
      clubId: player.clubId,
      position: player.position,

      isStarter,
      isOnPitch: isStarter,
      isAvailable: !isStarter,

      yellowCards: 0,
      sentOff: false,
      injured: false,
      substitutedIn: false,
      substitutedOut: false,

      fatigue: 0,
      minutesPlayed: 0,
    };
  });
}