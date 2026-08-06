import type { MatchEvent } from "../../domain/matchEvent";
import type { TeamMatchStatistics } from "../../domain/matchStatistics";

interface CalculateLiveStatisticsInput {
  events: MatchEvent[];
  homeClubId: string;
  awayClubId: string;
  currentMinute: number;
  elapsedSeconds?: number;
}

export function calculateLiveStatistics({
  events,
  homeClubId,
  awayClubId,
  currentMinute,
  elapsedSeconds,
}: CalculateLiveStatisticsInput): {
  home: TeamMatchStatistics;
  away: TeamMatchStatistics;
} {
  const home = createEmptyStatistics(homeClubId);
  const away = createEmptyStatistics(awayClubId);

  const totalElapsedSeconds =
    elapsedSeconds ?? currentMinute * 60;

  const isZeroIndexedPossession = events.some(
    (event) => event.type === "POSSESSION" && event.minute === 0,
  );

  const getEventTimeSeconds = (event: MatchEvent): number => {
    if (event.type === "POSSESSION") {
      if (isZeroIndexedPossession) {
        return event.minute * 60 + (event.second ?? 0);
      }
      return Math.max(0, (event.minute - 1) * 60 + (event.second ?? 0));
    }
    return event.minute * 60 + (event.second ?? 0);
  };

  const applicableEvents = events.filter(
    (event) => getEventTimeSeconds(event) <= totalElapsedSeconds,
  );

  let nextPossessionStart = 0;

  for (const event of applicableEvents) {
    const statistics =
      event.clubId === homeClubId
        ? home
        : event.clubId === awayClubId
          ? away
          : null;

    if (!statistics) {
      continue;
    }

    switch (event.type) {
      case "POSSESSION": {
        const durationSeconds = event.durationSeconds ?? 0;
        const rawStartSeconds = getEventTimeSeconds(event);
        const eventStartSeconds = Math.max(
          rawStartSeconds,
          nextPossessionStart,
        );
        const eventEndSeconds = eventStartSeconds + durationSeconds;

        nextPossessionStart = eventEndSeconds;

        const countedSeconds = Math.max(
          0,
          Math.min(totalElapsedSeconds - eventStartSeconds, durationSeconds),
        );

        statistics.possessionSeconds += countedSeconds;

        break;
      }

      case "SHOT":
        statistics.shots += 1;
        break;

      case "SHOT_ON_TARGET":
        statistics.shots += 1;
        statistics.shotsOnTarget += 1;
        break;

      case "SAVE":
        statistics.saves += 1;
        break;

      case "FOUL":
        statistics.fouls += 1;
        break;

      case "YELLOW_CARD":
        statistics.yellowCards += 1;
        break;

      case "SECOND_YELLOW_CARD":
        statistics.yellowCards += 1;
        statistics.redCards += 1;
        break;

      case "RED_CARD":
        statistics.redCards += 1;
        break;

      case "CORNER":
        statistics.corners += 1;
        break;

      case "OFFSIDE":
        statistics.offsides += 1;
        break;

      case "PENALTY_AWARDED":
        statistics.penaltiesAwarded += 1;
        break;

      case "PENALTY_SCORED":
        statistics.penaltiesScored += 1;
        statistics.shots += 1;
        statistics.shotsOnTarget += 1;
        break;

      case "PENALTY_MISSED":
        statistics.penaltiesMissed += 1;
        statistics.shots += 1;
        break;

      case "GOAL":
        break;

      case "SUBSTITUTION":
        statistics.substitutions += 1;
        break;

      default:
        break;
    }
  }

  calculatePossessionPercentages(home, away);

  return { home, away };
}

function calculatePossessionPercentages(
  home: TeamMatchStatistics,
  away: TeamMatchStatistics,
): void {
  const totalPossessionSeconds =
    home.possessionSeconds +
    away.possessionSeconds;

  if (totalPossessionSeconds <= 0) {
    home.possession = 50;
    away.possession = 50;
    return;
  }

  const homePossession = Math.round(
    (home.possessionSeconds /
      totalPossessionSeconds) *
      100,
  );

  home.possession = homePossession;
  away.possession = 100 - homePossession;
}

function createEmptyStatistics(
  clubId: string,
): TeamMatchStatistics {
  return {
    clubId,

    possession: 50,
    possessionSeconds: 0,

    shots: 0,
    shotsOnTarget: 0,
    saves: 0,

    fouls: 0,
    yellowCards: 0,
    redCards: 0,

    corners: 0,
    offsides: 0,

    penaltiesAwarded: 0,
    penaltiesScored: 0,
    penaltiesMissed: 0,

    substitutions: 0,
  };
}