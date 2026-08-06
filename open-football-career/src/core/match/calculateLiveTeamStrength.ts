import type { Player } from "../../domain/player";
import type { MatchPlayerState } from "../../domain/matchPlayerState";

export interface LiveTeamStrength {
  attack: number;
  midfield: number;
  defence: number;
  goalkeeping: number;
  playersOnPitch: number;
}

interface CalculateLiveTeamStrengthInput {
  clubId: string;
  players: Player[];
  playerStates: MatchPlayerState[];
}

export function calculateLiveTeamStrength({
  clubId,
  players,
  playerStates,
}: CalculateLiveTeamStrengthInput): LiveTeamStrength {
  const playersById = new Map(
    players.map((player) => [player.id, player]),
  );

  const activeStates = playerStates.filter(
    (state) =>
      state.clubId === clubId &&
      state.isOnPitch &&
      !state.sentOff,
  );

  const activePlayers = activeStates
    .map((state) => {
      const player = playersById.get(state.playerId);

      if (!player) {
        return null;
      }

      const fatigueFactor = calculateFatigueFactor(
        state.fatigue,
      );

      const injuryFactor = state.injured ? 0.72 : 1;

      return {
        player,
        effectiveOverall:
          player.overall *
          fatigueFactor *
          injuryFactor,
      };
    })
    .filter(
      (
        item,
      ): item is {
        player: Player;
        effectiveOverall: number;
      } => item !== null,
    );

  return {
    attack: averageStrength(
      activePlayers.filter(({ player }) =>
        ["ST", "LW", "RW", "AM"].includes(
          player.position,
        ),
      ),
    ),

    midfield: averageStrength(
      activePlayers.filter(({ player }) =>
        ["DM", "CM", "AM", "LW", "RW"].includes(
          player.position,
        ),
      ),
    ),

    defence: averageStrength(
      activePlayers.filter(({ player }) =>
        ["CB", "LB", "RB", "DM"].includes(
          player.position,
        ),
      ),
    ),

    goalkeeping: averageStrength(
      activePlayers.filter(
        ({ player }) => player.position === "GK",
      ),
    ),

    playersOnPitch: activePlayers.length,
  };
}

function calculateFatigueFactor(
  fatigue: number,
): number {
  const normalizedFatigue = Math.min(
    100,
    Math.max(0, fatigue),
  );

  return 1 - normalizedFatigue * 0.0035;
}

function averageStrength(
  players: Array<{
    effectiveOverall: number;
  }>,
): number {
  if (players.length === 0) {
    return 35;
  }

  return (
    players.reduce(
      (total, player) =>
        total + player.effectiveOverall,
      0,
    ) / players.length
  );
}