import { describe, expect, it } from "vitest";

import type { Club } from "../domain/club";
import type { Fixture } from "../domain/fixture";
import { simulateMatch } from "../core/match/simulateMatch";

describe("simulateMatch", () => {
  it("genera un resultado válido", () => {
    const fixture: Fixture = {
      id: "MATCH_1",
      competitionId: "DEM_1",
      seasonId: "2026-27",
      matchday: 1,
      homeClubId: "CLUB_A",
      awayClubId: "CLUB_B",
      played: false,
    };

    const homeClub: Club = {
      id: "CLUB_A",
      name: "Club A",
      shortName: "CLA",
      associationId: "DEM",
      reputation: 70,
      attack: 70,
      midfield: 68,
      defence: 66,
      budget: 5_000_000,
    };

    const awayClub: Club = {
      id: "CLUB_B",
      name: "Club B",
      shortName: "CLB",
      associationId: "DEM",
      reputation: 62,
      attack: 62,
      midfield: 61,
      defence: 60,
      budget: 3_000_000,
    };

    const result = simulateMatch(
      fixture,
      homeClub,
      awayClub,
    );

    expect(result.fixtureId).toBe("MATCH_1");
    expect(result.homeGoals).toBeGreaterThanOrEqual(0);
    expect(result.awayGoals).toBeGreaterThanOrEqual(0);
    expect(Number.isInteger(result.homeGoals)).toBe(true);
    expect(Number.isInteger(result.awayGoals)).toBe(true);
  });
});