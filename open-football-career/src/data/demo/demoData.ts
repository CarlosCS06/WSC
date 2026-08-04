import type { Club } from "../../domain/club";
import type { Competition } from "../../domain/competition";

export const demoClubs: Club[] = [
  {
    id: "DEMO_ATLETICO",
    name: "Atlético Demo",
    shortName: "ATD",
    associationId: "DEM",
    reputation: 72,
    attack: 72,
    midfield: 70,
    defence: 69,
    budget: 8_000_000,
  },
  {
    id: "DEMO_UNION",
    name: "Unión Demo",
    shortName: "UND",
    associationId: "DEM",
    reputation: 68,
    attack: 68,
    midfield: 67,
    defence: 66,
    budget: 6_000_000,
  },
  {
    id: "DEMO_CITY",
    name: "Demo City",
    shortName: "DCT",
    associationId: "DEM",
    reputation: 64,
    attack: 65,
    midfield: 63,
    defence: 62,
    budget: 4_500_000,
  },
  {
    id: "DEMO_SPORTING",
    name: "Sporting Demo",
    shortName: "SPD",
    associationId: "DEM",
    reputation: 60,
    attack: 61,
    midfield: 59,
    defence: 58,
    budget: 3_000_000,
  },
];

export const demoCompetition: Competition = {
  id: "DEM_1",
  name: "Liga Demo",
  shortName: "Liga DEM",
  associationId: "DEM",
  type: "LEAGUE",
  level: 1,
  participantClubIds: demoClubs.map((club) => club.id),

  stages: [
    {
      id: "REGULAR_SEASON",
      type: "ROUND_ROBIN",
      rounds: 2,
      pointsForWin: 3,
      pointsForDraw: 1,
      pointsForLoss: 0,
      tiebreakers: [
        "POINTS",
        "GOAL_DIFFERENCE",
        "GOALS_FOR",
        "WINS",
      ],
    },
  ],

  promotionRules: [],
  relegationRules: [],
};