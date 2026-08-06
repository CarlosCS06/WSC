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
      // goal events are derived from a prior shot/shot_on_target event,
      // skip here to avoid double-counting
      break;
        case "SHOT":
        stats.shots += 1;
        break;

        case "SHOT_ON_TARGET":
        stats.shots += 1;
        stats.shotsOnTarget += 1;
        break;

        case "CORNER":
        stats.corners += 1;
        break;

        case "OFFSIDE":
        stats.offsides += 1;
        break;

        case "PENALTY_SCORED":
        stats.shots += 1;
        stats.shotsOnTarget += 1;
        break;

        case "PENALTY_MISSED":
        stats.shots += 1;
        break;
    }
  }

  // statistics are now derived exclusively from real events; no artificial
  // approximations based on minute progress.

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