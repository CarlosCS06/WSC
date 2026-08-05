import type { MatchPlayerState } from "../../domain/matchPlayerState";
import type { Player } from "../../domain/player";

interface UpdatePlayerFatigueInput {
  playerStates: MatchPlayerState[];
  players: Player[];
  elapsedMinutes: number;
}

export function updatePlayerFatigue({
  playerStates,
  players,
  elapsedMinutes,
}: UpdatePlayerFatigueInput): MatchPlayerState[] {
  const playersById = new Map(
    players.map((player) => [player.id, player]),
  );

  return playerStates.map((state) => {
    if (!state.isOnPitch) {
      return state;
    }

    const player = playersById.get(state.playerId);

    if (!player) {
      return state;
    }

    const physicalResistance =
      player.attributes.physical / 100;

    const fatigueIncrease =
      elapsedMinutes * (1.15 - physicalResistance * 0.55);

    return {
      ...state,
      minutesPlayed: state.minutesPlayed + elapsedMinutes,
      fatigue: Math.min(
        100,
        state.fatigue + fatigueIncrease,
      ),
    };
  });
}