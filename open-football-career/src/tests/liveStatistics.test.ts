import { describe, expect, it } from "vitest";
import { calculateLiveStatistics } from "../core/match/calculateLiveStatistics";
import type { MatchEvent } from "../domain/matchEvent";

describe("calculateLiveStatistics", () => {
  it("calculates possession and shot statistics correctly for match events", () => {
    const events: MatchEvent[] = [
      {
        id: "1",
        fixtureId: "f1",
        minute: 1,
        second: 0,
        type: "POSSESSION",
        clubId: "home",
        durationSeconds: 60,
        description: "",
      },
      {
        id: "2",
        fixtureId: "f1",
        minute: 2,
        second: 0,
        type: "POSSESSION",
        clubId: "away",
        durationSeconds: 60,
        description: "",
      },
      {
        id: "3",
        fixtureId: "f1",
        minute: 5,
        second: 20,
        type: "SHOT_ON_TARGET",
        clubId: "home",
        description: "Disparo",
      },
      {
        id: "4",
        fixtureId: "f1",
        minute: 5,
        second: 21,
        type: "SAVE",
        clubId: "away",
        description: "Parada",
      },
      {
        id: "5",
        fixtureId: "f1",
        minute: 10,
        second: 10,
        type: "YELLOW_CARD",
        clubId: "home",
        description: "Tarjeta",
      },
    ];

    const statsAt615s = calculateLiveStatistics({
      events,
      homeClubId: "home",
      awayClubId: "away",
      currentMinute: 10,
      elapsedSeconds: 615,
    });

    expect(statsAt615s.home.shots).toBe(1);
    expect(statsAt615s.home.shotsOnTarget).toBe(1);
    expect(statsAt615s.away.saves).toBe(1);
    expect(statsAt615s.home.yellowCards).toBe(1);

    expect(statsAt615s.home.possessionSeconds).toBe(60);
    expect(statsAt615s.away.possessionSeconds).toBe(60);
    expect(statsAt615s.home.possession).toBe(50);
    expect(statsAt615s.away.possession).toBe(50);
  });

  it("handles 90th minute possession without dropping the last minute", () => {
    const events: MatchEvent[] = Array.from({ length: 90 }, (_, index) => ({
      id: `pos_${index + 1}`,
      fixtureId: "f1",
      minute: index + 1,
      second: 0,
      type: "POSSESSION",
      clubId: index % 2 === 0 ? "home" : "away",
      durationSeconds: 60,
      description: "",
    }));

    const stats = calculateLiveStatistics({
      events,
      homeClubId: "home",
      awayClubId: "away",
      currentMinute: 90,
      elapsedSeconds: 5400,
    });

    expect(stats.home.possessionSeconds).toBe(45 * 60);
    expect(stats.away.possessionSeconds).toBe(45 * 60);
    expect(stats.home.possession).toBe(50);
    expect(stats.away.possession).toBe(50);
  });
});
