import type { Club } from "../../domain/club";
import type { Fixture } from "../../domain/fixture";
import type { MatchEvent } from "../../domain/matchEvent";
import { simulateMatch } from "./simulateMatch";

export interface SimulatedMatchWithEvents {
  fixtureId: string;
  homeGoals: number;
  awayGoals: number;
  events: MatchEvent[];
}

function createGoalMinutes(totalGoals: number): number[] {
  const minutes: number[] = [];

  for (let index = 0; index < totalGoals; index += 1) {
    minutes.push(Math.floor(Math.random() * 89) + 1);
  }

  return minutes.sort((a, b) => a - b);
}

export function simulateMatchWithEvents(
  fixture: Fixture,
  homeClub: Club,
  awayClub: Club,
): SimulatedMatchWithEvents {
  const result = simulateMatch(fixture, homeClub, awayClub);

  const homeGoalMinutes = createGoalMinutes(result.homeGoals);
  const awayGoalMinutes = createGoalMinutes(result.awayGoals);

  const goalEvents: MatchEvent[] = [
    ...homeGoalMinutes.map((minute, index) => ({
      id: `${fixture.id}_HOME_GOAL_${index + 1}`,
      fixtureId: fixture.id,
      minute,
      type: "GOAL" as const,
      clubId: homeClub.id,
      description: `¡Gol de ${homeClub.name}!`,
    })),

    ...awayGoalMinutes.map((minute, index) => ({
      id: `${fixture.id}_AWAY_GOAL_${index + 1}`,
      fixtureId: fixture.id,
      minute,
      type: "GOAL" as const,
      clubId: awayClub.id,
      description: `¡Gol de ${awayClub.name}!`,
    })),
  ].sort((a, b) => a.minute - b.minute);

  const events: MatchEvent[] = [
    {
      id: `${fixture.id}_KICK_OFF`,
      fixtureId: fixture.id,
      minute: 0,
      type: "KICK_OFF",
      description: "Comienza el partido.",
    },
    ...goalEvents,
    {
      id: `${fixture.id}_HALF_TIME`,
      fixtureId: fixture.id,
      minute: 45,
      type: "HALF_TIME",
      description: "Descanso.",
    },
    {
      id: `${fixture.id}_FULL_TIME`,
      fixtureId: fixture.id,
      minute: 90,
      type: "FULL_TIME",
      description: "Final del partido.",
    },
  ].sort((a, b) => {
    if (a.minute !== b.minute) {
      return a.minute - b.minute;
    }

    const eventPriority: Record<MatchEvent["type"], number> = {
      KICK_OFF: 0,
      GOAL: 1,
      HALF_TIME: 2,
      FULL_TIME: 3,
    };

    return eventPriority[a.type] - eventPriority[b.type];
  });

  return {
    fixtureId: fixture.id,
    homeGoals: result.homeGoals,
    awayGoals: result.awayGoals,
    events,
  };
}