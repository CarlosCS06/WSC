import type { MatchEvent } from "../../domain/matchEvent";
import type { TeamMatchStatistics } from "../../domain/matchStatistics";

interface CalculateLiveStatisticsInput {
  events: MatchEvent[];
  homeClubId: string;
  awayClubId: string;
  currentMinute: number;
}

export function calculateLiveStatistics({
  events,
  homeClubId,
  awayClubId,
  currentMinute,
}: CalculateLiveStatisticsInput): {
  home: TeamMatchStatistics;
  away: TeamMatchStatistics;
} {
  const visibleEvents = events.filter(
    (event) => event.minute <= currentMinute,
  );

  const home = createEmptyStatistics(homeClubId);
  const away = createEmptyStatistics(awayClubId);

  for (const event of visibleEvents) {
    const stats =
      event.clubId === homeClubId
        ? home
        : event.clubId === awayClubId
          ? away
          : null;

    if (!stats) {
      continue;
    }

    switch (event.type) {
      case "GOAL":
        stats.shots += 1;
        stats.shotsOnTarget += 1;
        break;

      case "FOUL":
        stats.fouls += 1;
        break;

      case "YELLOW_CARD":
        stats.yellowCards += 1;
        stats.fouls += 1;
        break;

      case "SECOND_YELLOW_CARD":
        stats.yellowCards += 1;
        stats.redCards += 1;
        stats.fouls += 1;
        break;

      case "RED_CARD":
        stats.redCards += 1;
        stats.fouls += 1;
        break;

      case "SUBSTITUTION":
        stats.substitutions += 1;
        break;
    }
  }

  const minuteProgress = Math.max(1, currentMinute);

  home.shots += Math.floor(minuteProgress / 15);
  away.shots += Math.floor(minuteProgress / 17);

  home.shotsOnTarget = Math.min(
    home.shots,
    home.shotsOnTarget + Math.floor(minuteProgress / 32),
  );

  away.shotsOnTarget = Math.min(
    away.shots,
    away.shotsOnTarget + Math.floor(minuteProgress / 35),
  );

  home.corners = Math.floor(minuteProgress / 24);
  away.corners = Math.floor(minuteProgress / 27);

  home.offsides = Math.floor(minuteProgress / 38);
  away.offsides = Math.floor(minuteProgress / 42);

  const homePossession = Math.max(
    35,
    Math.min(65, 52 + home.shots - away.shots),
  );

  home.possession = homePossession;
  away.possession = 100 - homePossession;

  return { home, away };
}

function createEmptyStatistics(
  clubId: string,
): TeamMatchStatistics {
  return {
    clubId,
    possession: 50,
    shots: 0,
    shotsOnTarget: 0,
    fouls: 0,
    yellowCards: 0,
    redCards: 0,
    corners: 0,
    offsides: 0,
    substitutions: 0,
  };
}