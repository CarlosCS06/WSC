import { describe, expect, it } from "vitest";

import { generateRoundRobin } from "../core/calendar/generateRoundRobin";

describe("generateRoundRobin", () => {
  it("genera 12 partidos para cuatro equipos a dos vueltas", () => {
    const teams = [
      "DEMO_ATLETICO",
      "DEMO_UNION",
      "DEMO_CITY",
      "DEMO_SPORTING",
    ];

    const fixtures = generateRoundRobin({
      competitionId: "DEM_1",
      seasonId: "2026-27",
      clubIds: teams,
      rounds: 2,
    });

    expect(fixtures).toHaveLength(12);
    expect(fixtures.every((fixture) => fixture.played === false)).toBe(true);
  });

  it("genera seis jornadas para cuatro equipos", () => {
    const fixtures = generateRoundRobin({
      competitionId: "DEM_1",
      seasonId: "2026-27",
      clubIds: ["A", "B", "C", "D"],
      rounds: 2,
    });

    const matchdays = new Set(
      fixtures.map((fixture) => fixture.matchday),
    );

    expect(matchdays.size).toBe(6);
  });
});