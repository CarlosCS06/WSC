import type { Lineup } from "../../domain/lineup";
import type { MatchPlayerState } from "../../domain/matchPlayerState";
import type { Player } from "../../domain/player";

interface CreateLivePlayerStatesInput {
  homeLineup: Lineup;
  awayLineup: Lineup;
  players: Player[];
}

export function createLivePlayerStates({
  homeLineup,
  awayLineup,
  players,
}: CreateLivePlayerStatesInput): MatchPlayerState[] {
  const playersById = new Map(
    players.map((player) => [player.id, player]),
  );

  return [
    ...createLineupState(homeLineup, playersById),
    ...createLineupState(awayLineup, playersById),
  ];
}

function createLineupState(
  lineup: Lineup,
  playersById: Map<string, Player>,
): MatchPlayerState[] {
  const starterIds = new Set(
    lineup.starters.map((slot) => slot.playerId),
  );

  return [
    ...lineup.starters.map((slot) => slot.playerId),
    ...lineup.substitutes,
  ].map((playerId) => {
    const player = playersById.get(playerId);

    if (!player) {
      throw new Error(`Jugador no encontrado: ${playerId}`);
    }

    const isStarter = starterIds.has(playerId);

    return {
      playerId,
      clubId: lineup.clubId,
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
    };
  });
}