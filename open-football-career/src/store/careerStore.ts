import { create } from "zustand";

import type { Club } from "../domain/club";
import type { Competition } from "../domain/competition";
import type { Fixture } from "../domain/fixture";
import type { StandingRow } from "../domain/standings";

interface CareerState {
  careerId: string | null;
  seasonId: string | null;
  managedClubId: string | null;
  currentMatchday: number;

  clubs: Club[];
  competitions: Competition[];
  fixtures: Fixture[];
  standings: StandingRow[];

  startCareer: (input: {
    careerId: string;
    seasonId: string;
    managedClubId: string;
    clubs: Club[];
    competitions: Competition[];
    fixtures: Fixture[];
  }) => void;

  updateFixtures: (fixtures: Fixture[]) => void;
  updateStandings: (standings: StandingRow[]) => void;
  advanceMatchday: () => void;
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
  }) =>
    set({
      careerId,
      seasonId,
      managedClubId,
      clubs,
      competitions,
      fixtures,
      currentMatchday: 1,
      standings: [],
    }),

  updateFixtures: (fixtures) => set({ fixtures }),

  updateStandings: (standings) => set({ standings }),

  advanceMatchday: () =>
    set((state) => ({
      currentMatchday: state.currentMatchday + 1,
    })),
}));