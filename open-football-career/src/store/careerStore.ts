import { create } from "zustand";

import { calculateStandings } from "../core/competition/calculateStandings";
import { simulateMatchday } from "../core/season/simulateMatchday";
import type { Club } from "../domain/club";
import type { Competition } from "../domain/competition";
import type { Fixture } from "../domain/fixture";
import type { StandingRow } from "../domain/standings";

type MatchdayView = "PENDING" | "RESULTS";

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
  lastPlayedMatchday: number | null;
  matchdayView: MatchdayView;

  clubs: Club[];
  competitions: Competition[];
  fixtures: Fixture[];
  standings: StandingRow[];

  startCareer: (input: StartCareerInput) => void;
  simulateCurrentMatchday: () => void;
  continueToNextMatchday: () => void;
  resetCareer: () => void;
  playManagedMatch: (input: {
    fixtureId: string;
    homeGoals: number;
    awayGoals: number;
  }) => void;
}

export const useCareerStore = create<CareerState>((set) => ({
  careerId: null,
  seasonId: null,
  managedClubId: null,

  currentMatchday: 1,
  lastPlayedMatchday: null,
  matchdayView: "PENDING",

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
      standings,

      currentMatchday: 1,
      lastPlayedMatchday: null,
      matchdayView: "PENDING",
    });
  },

  simulateCurrentMatchday: () =>
    set((state) => {
      if (state.matchdayView === "RESULTS") {
        return state;
      }

      const competition = state.competitions[0];

      if (!competition) {
        return state;
      }

      const currentFixtures = state.fixtures.filter(
        (fixture) => fixture.matchday === state.currentMatchday,
      );

      if (
        currentFixtures.length === 0 ||
        currentFixtures.every((fixture) => fixture.played)
      ) {
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

      return {
        fixtures: updatedFixtures,
        standings,
        lastPlayedMatchday: state.currentMatchday,
        matchdayView: "RESULTS",
      };
    }),

  continueToNextMatchday: () =>
    set((state) => {
      if (state.matchdayView !== "RESULTS") {
        return state;
      }

      const maximumMatchday = Math.max(
        0,
        ...state.fixtures.map((fixture) => fixture.matchday),
      );

      if (state.currentMatchday >= maximumMatchday) {
        return state;
      }

      return {
        currentMatchday: state.currentMatchday + 1,
        matchdayView: "PENDING",
      };
    }),

  resetCareer: () =>
    set({
      careerId: null,
      seasonId: null,
      managedClubId: null,

      currentMatchday: 1,
      lastPlayedMatchday: null,
      matchdayView: "PENDING",

      clubs: [],
      competitions: [],
      fixtures: [],
      standings: [],
    }),

  playManagedMatch: ({ fixtureId, homeGoals, awayGoals }) =>
    set((state) => {
      const fixtureExists = state.fixtures.some(
        (fixture) => fixture.id === fixtureId,
      );

      if (!fixtureExists) {
        throw new Error(`No existe el partido ${fixtureId} en la carrera.`);
      }

      const fixtures = state.fixtures.map((fixture) =>
        fixture.id === fixtureId
          ? {
              ...fixture,
              played: true,
              homeGoals,
              awayGoals,
            }
          : fixture,
      );

      const competition = state.competitions[0];

      if (!competition) {
        return { fixtures };
      }

      const standings = calculateStandings(
        competition.participantClubIds,
        fixtures,
      );

      return {
        fixtures,
        standings,
      };
    }),
}));