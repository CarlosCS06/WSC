import type { MatchPlayerState } from "../../domain/matchPlayerState";
import type { Player } from "../../domain/player";

export interface CpuSubstitutionSelection {
  outgoingPlayerId: string;
  incomingPlayerId: string;
}

interface SelectCpuTacticalSubstitutionInput {
  clubId: string;
  minute: number;
  goalsFor: number;
  goalsAgainst: number;
  playerStates: MatchPlayerState[];
  players: Player[];
}

export function selectCpuTacticalSubstitution({
  clubId,
  minute,
  goalsFor,
  goalsAgainst,
  playerStates,
  players,
}: SelectCpuTacticalSubstitutionInput):
  | CpuSubstitutionSelection
  | null {
  if (minute < 55 || minute > 86) {
    return null;
  }

  const playersById = new Map(
    players.map((player) => [player.id, player]),
  );

  const playersOnPitch = playerStates
    .filter(
      (state) =>
        state.clubId === clubId &&
        state.isOnPitch &&
        !state.sentOff,
    )
    .sort((a, b) => {
      const aScore =
        a.fatigue + a.yellowCards * 18;

      const bScore =
        b.fatigue + b.yellowCards * 18;

      return bScore - aScore;
    });

  const availableSubstitutes = playerStates
    .filter(
      (state) =>
        state.clubId === clubId &&
        state.isAvailable &&
        !state.injured &&
        !state.sentOff,
    )
    .map((state) => playersById.get(state.playerId))
    .filter((player): player is Player => Boolean(player));

  const outgoingState = playersOnPitch.find(
    (state) =>
      state.fatigue >= 62 ||
      (state.yellowCards > 0 && minute >= 65),
  );

  if (!outgoingState) {
    return null;
  }

  const outgoingPlayer = playersById.get(
    outgoingState.playerId,
  );

  if (!outgoingPlayer) {
    return null;
  }

  const isLosing = goalsFor < goalsAgainst;
  const isWinning = goalsFor > goalsAgainst;

  const scoredSubstitutes = availableSubstitutes
    .map((player) => ({
      player,
      score: calculateSubstituteScore(
        player,
        outgoingPlayer.position,
        isLosing,
        isWinning,
      ),
    }))
    .sort((a, b) => b.score - a.score);

  const selectedSubstitute =
    scoredSubstitutes[0]?.player;

  if (!selectedSubstitute) {
    return null;
  }

  return {
    outgoingPlayerId: outgoingPlayer.id,
    incomingPlayerId: selectedSubstitute.id,
  };
}

function calculateSubstituteScore(
  player: Player,
  outgoingPosition: Player["position"],
  isLosing: boolean,
  isWinning: boolean,
): number {
  let score = player.overall;

  if (player.position === outgoingPosition) {
    score += 20;
  }

  if (
    isLosing &&
    ["ST", "RW", "LW", "AM"].includes(player.position)
  ) {
    score += 15;
  }

  if (
    isWinning &&
    ["CB", "DM", "RB", "LB"].includes(player.position)
  ) {
    score += 12;
  }

  return score;
}