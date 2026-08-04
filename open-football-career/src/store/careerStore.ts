import { create } from "zustand";

import { calculateStandings } from "../core/competition/calculateStandings";
import { simulateMatchday } from "../core/season/simulateMatchday";
import type { Club } from "../domain/club";
import type { Competition } from "../domain/competition";
import type { Fixture } from "../domain/fixture";
import type { StandingRow } from "../domain/standings";

interface StartCareerInput {
  careerId: string;
  seasonId: string;
  managedClubId: string;
  clubs: Club[];
  competitions: Competition[];
  fixtures: Fixture[];
}

interface CareerState {
  careerId: string | null;
  seasonId: string | null;
  managedClubId: string | null;
  currentMatchday: number;

  clubs: Club[];
  competitions: Competition[];
  fixtures: Fixture[];
  standings: StandingRow[];

  startCareer: (input: StartCareerInput) => void;
  simulateCurrentMatchday: () => void;
  resetCareer: () => void;
}

export const useCareerStore = create<CareerState>((set) => ({
  careerId: null,
  seasonId: null,
  managedClubId: null,
  currentMatchday: 1,

  clubs: [],
  competitions: [],
  fixtures: [],
  standings: [],

  startCareer: ({
    careerId,
    seasonId,
    managedClubId,
    clubs,
    competitions,
    fixtures,
  }) => {
    const primaryCompetition = competitions[0];

    if (!primaryCompetition) {
      throw new Error("La carrera necesita una competición.");
    }

    const standings = calculateStandings(
      primaryCompetition.participantClubIds,
      fixtures,
    );

    set({
      careerId,
      seasonId,
      managedClubId,
      clubs,
      competitions,
      fixtures,
      currentMatchday: 1,
      standings,
    });
  },

  simulateCurrentMatchday: () =>
    set((state) => {
      const competition = state.competitions[0];

      if (!competition) {
        return state;
      }

      const updatedFixtures = simulateMatchday({
        matchday: state.currentMatchday,
        fixtures: state.fixtures,
        clubs: state.clubs,
      });

      const standings = calculateStandings(
        competition.participantClubIds,
        updatedFixtures,
      );

      const maximumMatchday = Math.max(
        0,
        ...updatedFixtures.map((fixture) => fixture.matchday),
      );

      const nextMatchday =
        state.currentMatchday < maximumMatchday
          ? state.currentMatchday + 1
          : state.currentMatchday;

      return {
        fixtures: updatedFixtures,
        standings,
        currentMatchday: nextMatchday,
      };
    }),

  resetCareer: () =>
    set({
      careerId: null,
      seasonId: null,
      managedClubId: null,
      currentMatchday: 1,
      clubs: [],
      competitions: [],
      fixtures: [],
      standings: [],
    }),
}));