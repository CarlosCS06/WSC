import type { MatchPlayerState } from "../../domain/matchPlayerState";
import type { Player } from "../../domain/player";

interface SelectCpuSubstituteInput {
  injuredPlayerId: string;
  clubId: string;
  playerStates: MatchPlayerState[];
  players: Player[];
}

export function selectCpuSubstitute({
  injuredPlayerId,
  clubId,
  playerStates,
  players,
}: SelectCpuSubstituteInput): Player | null {
  const injuredPlayer = players.find(
    (player) => player.id === injuredPlayerId,
  );

  if (!injuredPlayer) {
    return null;
  }

  const availablePlayers = playerStates
    .filter(
      (state) =>
        state.clubId === clubId &&
        state.isAvailable &&
        !state.injured &&
        !state.sentOff,
    )
    .map((state) =>
      players.find((player) => player.id === state.playerId),
    )
    .filter((player): player is Player => Boolean(player));

  const samePosition = availablePlayers
    .filter(
      (player) => player.position === injuredPlayer.position,
    )
    .sort((a, b) => b.overall - a.overall);

  if (samePosition[0]) {
    return samePosition[0];
  }

  return (
    availablePlayers.sort(
      (a, b) => b.overall - a.overall,
    )[0] ?? null
  );
}