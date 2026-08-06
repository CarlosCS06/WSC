import type { Club } from "../../domain/club";
import type { Fixture } from "../../domain/fixture";
import type { IncrementalMatchState } from "../../domain/incrementalMatchState";
import type { Lineup } from "../../domain/lineup";
import type { MatchEvent } from "../../domain/matchEvent";
import type { Player } from "../../domain/player";

import { createLivePlayerStates } from "./createLivePlayerStates";
import { generateMatchIncidents } from "./generateMatchIncidents";
import { simulateMatchMinute } from "./simulateChronologicalMatch";

export interface IncrementalMatchContext {
  fixture: Fixture;
  homeClub: Club;
  awayClub: Club;
  homeLineup: Lineup;
  awayLineup: Lineup;
  players: Player[];
  incidentEvents: MatchEvent[];
}

export function createIncrementalMatch(
  fixture: Fixture,
  homeClub: Club,
  awayClub: Club,
  homeLineup: Lineup,
  awayLineup: Lineup,
  players: Player[],
): {
  state: IncrementalMatchState;
  context: IncrementalMatchContext;
} {
  const playerStates = createLivePlayerStates({
    homeLineup,
    awayLineup,
    players,
  });

  const kickOffEvent: MatchEvent = {
    id: `${fixture.id}_KICK_OFF`,
    fixtureId: fixture.id,
    minute: 0,
    second: 0,
    type: "KICK_OFF",
    description: "Comienza el partido.",
  };

  const incidentEvents = generateMatchIncidents({
    fixtureId: fixture.id,
    homeLineup,
    awayLineup,
    players,
  });

  return {
    state: {
      fixtureId: fixture.id,
      currentMinute: 0,
      homeGoals: 0,
      awayGoals: 0,
      events: [kickOffEvent],
      playerStates,
      processedIncidentIds: [],
      finished: false,
    },

    context: {
      fixture,
      homeClub,
      awayClub,
      homeLineup,
      awayLineup,
      players,
      incidentEvents,
    },
  };
}

export function advanceIncrementalMatch(
  state: IncrementalMatchState,
  context: IncrementalMatchContext,
): IncrementalMatchState {
  if (state.finished) {
    return state;
  }

  const nextMinute = state.currentMinute + 1;

  if (nextMinute > 90) {
    return finishMatch(state, context.fixture.id);
  }

  const unprocessedIncidents =
    context.incidentEvents.filter(
      (event) =>
        !state.processedIncidentIds.includes(event.id),
    );

  const result = simulateMatchMinute({
    fixture: context.fixture,
    homeClub: context.homeClub,
    awayClub: context.awayClub,
    homeLineup: context.homeLineup,
    awayLineup: context.awayLineup,
    players: context.players,
    minute: nextMinute,
    playerStates: state.playerStates,
    incidentEvents: unprocessedIncidents,
  });

  const processedIncidentIds = [
    ...state.processedIncidentIds,
    ...unprocessedIncidents
      .filter((event) => event.minute === nextMinute)
      .map((event) => event.id),
  ];

  const periodEvents: MatchEvent[] = [];

  if (nextMinute === 45) {
    periodEvents.push({
      id: `${context.fixture.id}_HALF_TIME`,
      fixtureId: context.fixture.id,
      minute: 45,
      second: 59,
      type: "HALF_TIME",
      description: "Descanso.",
    });
  }

  if (nextMinute === 46) {
    periodEvents.push({
      id: `${context.fixture.id}_SECOND_HALF`,
      fixtureId: context.fixture.id,
      minute: 46,
      second: 0,
      type: "SECOND_HALF",
      description: "Comienza la segunda parte.",
    });
  }

  const nextState: IncrementalMatchState = {
    ...state,

    currentMinute: nextMinute,

    homeGoals:
      state.homeGoals + result.homeGoals,

    awayGoals:
      state.awayGoals + result.awayGoals,

    playerStates: result.playerStates,

    events: [
      ...state.events,
      ...result.events,
      ...periodEvents,
    ].sort(compareEvents),

    processedIncidentIds,
  };

  if (nextMinute === 90) {
    return finishMatch(
      nextState,
      context.fixture.id,
    );
  }

  return nextState;
}

function finishMatch(
  state: IncrementalMatchState,
  fixtureId: string,
): IncrementalMatchState {
  const alreadyFinished = state.events.some(
    (event) => event.type === "FULL_TIME",
  );

  if (alreadyFinished) {
    return {
      ...state,
      finished: true,
    };
  }

  const fullTimeEvent: MatchEvent = {
    id: `${fixtureId}_FULL_TIME`,
    fixtureId,
    minute: 90,
    second: 59,
    type: "FULL_TIME",
    description: "Final del partido.",
  };

  return {
    ...state,
    finished: true,
    events: [
      ...state.events,
      fullTimeEvent,
    ].sort(compareEvents),
  };
}

function compareEvents(
  first: MatchEvent,
  second: MatchEvent,
): number {
  const firstSeconds =
    first.minute * 60 + (first.second ?? 0);

  const secondSeconds =
    second.minute * 60 + (second.second ?? 0);

  return firstSeconds - secondSeconds;
}