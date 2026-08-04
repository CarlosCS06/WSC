import type { Fixture } from "../../domain/fixture";

interface GenerateRoundRobinInput {
  competitionId: string;
  seasonId: string;
  clubIds: string[];
  rounds?: number;
}

export function generateRoundRobin({
  competitionId,
  seasonId,
  clubIds,
  rounds = 2,
}: GenerateRoundRobinInput): Fixture[] {
  if (clubIds.length < 2) {
    throw new Error("A league needs at least two clubs.");
  }

  const teams = [...clubIds];

  if (teams.length % 2 !== 0) {
    teams.push("__BYE__");
  }

  const numberOfTeams = teams.length;
  const matchdaysPerRound = numberOfTeams - 1;
  const matchesPerMatchday = numberOfTeams / 2;

  const fixtures: Fixture[] = [];
  let rotation = [...teams];

  for (let cycle = 0; cycle < rounds; cycle += 1) {
    for (
      let roundIndex = 0;
      roundIndex < matchdaysPerRound;
      roundIndex += 1
    ) {
      const matchday = cycle * matchdaysPerRound + roundIndex + 1;

      for (
        let matchIndex = 0;
        matchIndex < matchesPerMatchday;
        matchIndex += 1
      ) {
        const firstTeam = rotation[matchIndex];
        const secondTeam = rotation[numberOfTeams - 1 - matchIndex];

        if (firstTeam === "__BYE__" || secondTeam === "__BYE__") {
          continue;
        }

        const reverseHomeAndAway = cycle % 2 === 1;

        const homeClubId = reverseHomeAndAway
          ? secondTeam
          : firstTeam;

        const awayClubId = reverseHomeAndAway
          ? firstTeam
          : secondTeam;

        fixtures.push({
          id: `${seasonId}_${competitionId}_${matchday}_${matchIndex + 1}`,
          competitionId,
          seasonId,
          matchday,
          homeClubId,
          awayClubId,
          played: false,
        });
      }

      rotation = [
        rotation[0],
        rotation[numberOfTeams - 1],
        ...rotation.slice(1, numberOfTeams - 1),
      ];
    }
  }

  return fixtures;
}