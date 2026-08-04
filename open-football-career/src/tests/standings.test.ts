import { describe, expect, it } from "vitest";

import type { Fixture } from "../domain/fixture";
import { calculateStandings } from "../core/competition/calculateStandings";

describe("calculateStandings", () => {
  it("calcula correctamente una clasificación básica", () => {
    const clubIds = ["CLUB_A", "CLUB_B", "CLUB_C"];

    const fixtures: Fixture[] = [
      {
        id: "MATCH_1",
        competitionId: "DEM_1",
        seasonId: "2026-27",
        matchday: 1,
        homeClubId: "CLUB_A",
        awayClubId: "CLUB_B",
        played: true,
        homeGoals: 2,
        awayGoals: 0,
      },
      {
        id: "MATCH_2",
        competitionId: "DEM_1",
        seasonId: "2026-27",
        matchday: 1,
        homeClubId: "CLUB_C",
        awayClubId: "CLUB_A",
        played: true,
        homeGoals: 1,
        awayGoals: 1,
      },
    ];

    const standings = calculateStandings(
      clubIds,
      fixtures,
    );

    expect(standings).toHaveLength(3);

    expect(standings[0].clubId).toBe("CLUB_A");
    expect(standings[0].points).toBe(4);
    expect(standings[0].played).toBe(2);
    expect(standings[0].wins).toBe(1);
    expect(standings[0].draws).toBe(1);

    const clubB = standings.find(
      (row) => row.clubId === "CLUB_B",
    );

    expect(clubB?.points).toBe(0);
    expect(clubB?.losses).toBe(1);
  });
});