import type {
  Player,
  PlayerPosition,
} from "../../domain/player";

interface PlayerTemplate {
  name: string;
  position: PlayerPosition;
  overallOffset: number;
}

const squadTemplate: PlayerTemplate[] = [
  { name: "Portero", position: "GK", overallOffset: -1 },
  { name: "Lateral Derecho", position: "RB", overallOffset: -2 },
  { name: "Central Uno", position: "CB", overallOffset: 0 },
  { name: "Central Dos", position: "CB", overallOffset: -1 },
  { name: "Lateral Izquierdo", position: "LB", overallOffset: -2 },
  { name: "Mediocentro", position: "DM", overallOffset: 0 },
  { name: "Interior Uno", position: "CM", overallOffset: 1 },
  { name: "Interior Dos", position: "CM", overallOffset: 0 },
  { name: "Extremo Derecho", position: "RW", overallOffset: 1 },
  { name: "Delantero", position: "ST", overallOffset: 2 },
  { name: "Extremo Izquierdo", position: "LW", overallOffset: 1 },
  { name: "Portero Suplente", position: "GK", overallOffset: -7 },
  { name: "Defensa Suplente", position: "CB", overallOffset: -5 },
  { name: "Lateral Suplente", position: "RB", overallOffset: -6 },
  { name: "Medio Suplente", position: "CM", overallOffset: -4 },
  { name: "Mediapunta", position: "AM", overallOffset: -2 },
  { name: "Extremo Suplente", position: "LW", overallOffset: -4 },
  { name: "Delantero Suplente", position: "ST", overallOffset: -3 },
];

interface CreateDemoSquadInput {
  clubId: string;
  clubPrefix: string;
  nationalityId: string;
  baseOverall: number;
}

function clampRating(value: number): number {
  return Math.max(1, Math.min(99, value));
}

function buildAttributes(
  position: PlayerPosition,
  overall: number,
): Player["attributes"] {
  const base = clampRating(overall);

  return {
    pace: clampRating(
      base +
        (["RB", "LB", "RW", "LW"].includes(position) ? 4 : 0),
    ),
    shooting: clampRating(
      base +
        (position === "ST" ? 6 : position === "GK" ? -35 : -2),
    ),
    passing: clampRating(
      base +
        (["CM", "AM", "DM"].includes(position) ? 4 : 0),
    ),
    dribbling: clampRating(
      base +
        (["RW", "LW", "AM"].includes(position) ? 5 : -1),
    ),
    defending: clampRating(
      base +
        (["CB", "RB", "LB", "DM"].includes(position)
          ? 5
          : position === "ST"
            ? -12
            : -4),
    ),
    physical: clampRating(
      base +
        (["CB", "DM", "ST"].includes(position) ? 4 : 0),
    ),
    goalkeeping: clampRating(
      position === "GK" ? base + 5 : 5,
    ),
  };
}

function createDemoSquad({
  clubId,
  clubPrefix,
  nationalityId,
  baseOverall,
}: CreateDemoSquadInput): Player[] {
  return squadTemplate.map((template, index) => {
    const overall = clampRating(
      baseOverall + template.overallOffset,
    );

    return {
      id: `${clubId}_PLAYER_${index + 1}`,
      clubId,
      name: `${template.name} ${clubPrefix}`,
      shortName: `${template.name.split(" ")[0]} ${clubPrefix}`,
      age: 20 + ((index * 3) % 14),
      position: template.position,
      nationalityId,
      overall,
      potential: clampRating(overall + 3),
      attributes: buildAttributes(
        template.position,
        overall,
      ),
      contractUntil: "2029-06-30",
      marketValue: overall * overall * 1_000,
      wage: overall * 500,
    };
  });
}

export const demoPlayers: Player[] = [
  ...createDemoSquad({
    clubId: "DEMO_ATLETICO",
    clubPrefix: "Atlético",
    nationalityId: "DEM",
    baseOverall: 70,
  }),

  ...createDemoSquad({
    clubId: "DEMO_UNION",
    clubPrefix: "Unión",
    nationalityId: "DEM",
    baseOverall: 66,
  }),

  ...createDemoSquad({
    clubId: "DEMO_CITY",
    clubPrefix: "City",
    nationalityId: "DEM",
    baseOverall: 63,
  }),

  ...createDemoSquad({
    clubId: "DEMO_SPORTING",
    clubPrefix: "Sporting",
    nationalityId: "DEM",
    baseOverall: 59,
  }),
];