import type { Club } from "../../domain/club";
import type { Fixture } from "../../domain/fixture";

export interface MatchResult {
  fixtureId: string;
  homeGoals: number;
  awayGoals: number;
}

function calculateTeamStrength(club: Club): number {
  return (
    club.attack * 0.4 +
    club.midfield * 0.35 +
    club.defence * 0.25
  );
}

function generateGoals(expectedGoals: number): number {
  let goals = 0;
  let remainingProbability = Math.exp(-expectedGoals);
  let accumulatedProbability = remainingProbability;
  const random = Math.random();

  while (random > accumulatedProbability && goals < 10) {
    goals += 1;
    remainingProbability *= expectedGoals / goals;
    accumulatedProbability += remainingProbability;
  }

  return goals;
}

export function simulateMatch(
  fixture: Fixture,
  homeClub: Club,
  awayClub: Club,
): MatchResult {
  if (fixture.homeClubId !== homeClub.id) {
    throw new Error("The home club does not match the fixture.");
  }

  if (fixture.awayClubId !== awayClub.id) {
    throw new Error("The away club does not match the fixture.");
  }

  const homeStrength = calculateTeamStrength(homeClub);
  const awayStrength = calculateTeamStrength(awayClub);

  const homeDifference = homeStrength - awayStrength;
  const awayDifference = awayStrength - homeStrength;

  const homeExpectedGoals = Math.max(
    0.2,
    1.35 + homeDifference / 25 + 0.2,
  );

  const awayExpectedGoals = Math.max(
    0.2,
    1.1 + awayDifference / 25,
  );

  return {
    fixtureId: fixture.id,
    homeGoals: generateGoals(homeExpectedGoals),
    awayGoals: generateGoals(awayExpectedGoals),
  };
}