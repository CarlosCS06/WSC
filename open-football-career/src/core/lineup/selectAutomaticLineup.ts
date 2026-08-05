import type { Lineup } from "../../domain/lineup";
import type {
  Player,
  PlayerPosition,
} from "../../domain/player";

const formation433: PlayerPosition[] = [
  "GK",
  "RB",
  "CB",
  "CB",
  "LB",
  "DM",
  "CM",
  "CM",
  "RW",
  "ST",
  "LW",
];

export function selectAutomaticLineup(
  clubId: string,
  players: Player[],
): Lineup {
  const availablePlayers = players
    .filter((player) => player.clubId === clubId)
    .sort((a, b) => b.overall - a.overall);

  if (availablePlayers.length < 11) {
    throw new Error(
      `El club ${clubId} no tiene jugadores suficientes.`,
    );
  }

  const selectedPlayerIds = new Set<string>();

  const starters = formation433.map((position) => {
    const naturalPlayer = availablePlayers.find(
      (player) =>
        player.position === position &&
        !selectedPlayerIds.has(player.id),
    );

    const selectedPlayer =
      naturalPlayer ??
      availablePlayers.find(
        (player) => !selectedPlayerIds.has(player.id),
      );

    if (!selectedPlayer) {
      throw new Error(
        `No se pudo completar la alineación de ${clubId}.`,
      );
    }

    selectedPlayerIds.add(selectedPlayer.id);

    return {
      playerId: selectedPlayer.id,
      position,
    };
  });

  const substitutes = availablePlayers
    .filter((player) => !selectedPlayerIds.has(player.id))
    .slice(0, 7)
    .map((player) => player.id);

  return {
    clubId,
    formation: "4-3-3",
    starters,
    substitutes,
  };
}