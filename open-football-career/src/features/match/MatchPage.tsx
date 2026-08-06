import { useEffect, useMemo, useState } from "react";

import type { Club } from "../../domain/club";
import type { Fixture } from "../../domain/fixture";
import type { MatchEvent } from "../../domain/matchEvent";
import {
  simulateMatchWithEvents,
  type SimulatedMatchWithEvents,
} from "../../core/match/simulateMatchWithEvents";
import type { Lineup } from "../../domain/lineup";
import type { Player } from "../../domain/player";
import type { MatchClockState, MatchSpeed } from "../../domain/matchClock";
import type { MatchPlayerState } from "../../domain/matchPlayerState";
import { createLivePlayerStates } from "../../core/match/createLivePlayerStates";
import { applyMatchEvent } from "../../core/match/applyMatchEvent";
import { selectCpuSubstitute } from "../../core/match/selectCpuSubstitute";

import { formatMatchClock } from "../../core/match/formatMatchClock";
import { calculateAddedTime } from "../../core/match/calculateAddedTime";
import type { MatchDecision } from "../../domain/matchDecision";
import { InjurySubstitutionPanel } from "./InjurySubstitutionPanel";
import type { TeamMatchState } from "../../domain/teamMatchState";
import { selectCpuTacticalSubstitution } from "../../core/match/selectCpuTacticalSubstitution";
import { ManualSubstitutionPanel } from "./ManualSubstitutionPanel";
import { LiveLineupColumn } from "./LiveLineupColumn";

interface MatchPageProps {
  fixture: Fixture;
  homeClub: Club;
  awayClub: Club;
  homeLineup: Lineup;
  awayLineup: Lineup;
  players: Player[];
  managedClubId: string;
  onFinish: (result: SimulatedMatchWithEvents) => void;
  onBack: () => void;
}

export function MatchPage({
  fixture,
  homeClub,
  awayClub,
  homeLineup,
  awayLineup,
  players,
  managedClubId,
  onFinish,
  onBack,
}: MatchPageProps) {
  const [simulation, setSimulation] =
    useState<SimulatedMatchWithEvents | null>(null);

  const [pendingDecision, setPendingDecision] =
    useState<MatchDecision | null>(null);

  const [processedEventIds, setProcessedEventIds] =
    useState<Set<string>>(new Set());
  const [playerStates, setPlayerStates] =
    useState<MatchPlayerState[]>([]);
  const [teamStates, setTeamStates] = useState<TeamMatchState[]>([]);
    
  const [cpuSubstitutionMinutes, setCpuSubstitutionMinutes] = useState<Set<number>>(new Set());

  const [clock, setClock] = useState<MatchClockState>({
    elapsedSeconds: 0,
    period: "PRE_MATCH",
    speed: 4,
    firstHalfAddedMinutes: 0,
    secondHalfAddedMinutes: 0,
  });

    const [manualSubstitutionOpen, setManualSubstitutionOpen] =useState(false);

  const currentMinute = Math.floor(clock.elapsedSeconds / 60);

  const visibleEvents = useMemo(() => {
    if (!simulation) {
      return [];
    }

    return simulation.events.filter((event) =>
      event.minute <= currentMinute,
    );
  }, [simulation, currentMinute]);


  useEffect(() => {
    if (!simulation || playerStates.length === 0) {
      return;
    }

    const newEvents = visibleEvents.filter(
      (event) => !processedEventIds.has(event.id),
    );

    if (newEvents.length === 0) {
      return;
    }

    let nextPlayerStates = playerStates;
    let nextEvents = [...simulation.events];
    let nextDecision = pendingDecision;
    const nextCpuSubstitutionMinutes = new Set(cpuSubstitutionMinutes);

    const newlyProcessedIds: string[] = [];

    for (const event of newEvents) {
      const result = applyMatchEvent(
        nextPlayerStates,
        event,
      );

      nextPlayerStates = result.playerStates;
      newlyProcessedIds.push(event.id);

      if (result.convertedEvent.type !== event.type) {
        nextEvents = nextEvents.map((existingEvent) =>
          existingEvent.id === event.id
            ? result.convertedEvent
            : existingEvent,
        );
      }

      const requiresSubstitution =
        event.type === "INJURY" &&
        (event.injurySeverity === "MODERATE" ||
          event.injurySeverity === "SERIOUS") &&
        event.playerId &&
        event.clubId;

      if (!requiresSubstitution) {
        continue;
      }

      if (event.clubId === managedClubId) {
        const availableSubstituteIds = nextPlayerStates
          .filter(
            (state) =>
              state.clubId === managedClubId &&
              state.isAvailable &&
              !state.injured &&
              !state.sentOff,
          )
          .map((state) => state.playerId);

        nextDecision = {
          type: "USER_INJURY_SUBSTITUTION",
          clubId: managedClubId,
          injuredPlayerId: event.playerId!,
          availableSubstituteIds,
          minute: event.minute,
        };

        break;
      }

      const minute = event.minute;

      if (nextCpuSubstitutionMinutes.has(minute)) {
        continue;
      }

      const substitute = selectCpuSubstitute({
        injuredPlayerId: event.playerId!,
        clubId: event.clubId!,
        playerStates: nextPlayerStates,
        players,
      });

      if (!substitute) {
        continue;
      }

      const injuredPlayer = players.find(
        (player) => player.id === event.playerId,
      );

      const substitutionEvent: MatchEvent = {
        id: `${fixture.id}_CPU_SUB_${event.id}`,
        fixtureId: fixture.id,
        minute: event.minute,
        type: "SUBSTITUTION",
        clubId: event.clubId!,
        playerId: event.playerId!,
        secondaryPlayerId: substitute.id,
        description:
          `Sale ${injuredPlayer?.shortName ?? "el jugador"} y entra ` +
          `${substitute.shortName}.`,
      };

      const substitutionResult = applyMatchEvent(
        nextPlayerStates,
        substitutionEvent,
      );

      nextPlayerStates =
        substitutionResult.playerStates;

      nextEvents.push(substitutionEvent);
      nextCpuSubstitutionMinutes.add(minute);
    }

    setPlayerStates(nextPlayerStates);
    setPendingDecision(nextDecision);
    setCpuSubstitutionMinutes(nextCpuSubstitutionMinutes);

    setProcessedEventIds((current) => {
      const updated = new Set(current);

      for (const id of newlyProcessedIds) {
        updated.add(id);
      }

      return updated;
    });

    if (nextEvents.length !== simulation.events.length) {
      setSimulation({
        ...simulation,
        events: nextEvents.sort(
          (a, b) => a.minute - b.minute,
        ),
      });
    }
  }, [
    visibleEvents,
    simulation,
    playerStates,
    processedEventIds,
    pendingDecision,
    managedClubId,
    players,
    fixture.id,
    cpuSubstitutionMinutes,
  ]);

  const currentScore = calculateVisibleScore(
    visibleEvents,
    homeClub.id,
    awayClub.id,
  );

  function handleStart() {
    const result = simulateMatchWithEvents(
      fixture,
      homeClub,
      awayClub,
      homeLineup,
      awayLineup,
      players,
    );

    setPlayerStates(
      createLivePlayerStates({
        homeLineup,
        awayLineup,
        players,
      }),
    );

    setProcessedEventIds(new Set());
    setCpuSubstitutionMinutes(new Set());

    const firstHalfAddedMinutes = calculateAddedTime({
      events: result.events,
      fromMinute: 0,
      toMinute: 45,
    });

    const secondHalfAddedMinutes = calculateAddedTime({
      events: result.events,
      fromMinute: 46,
      toMinute: 90,
    });

    setSimulation(result);

    setClock((current) => ({
      ...current,
      elapsedSeconds: 0,
      period: "FIRST_HALF",
      firstHalfAddedMinutes,
      secondHalfAddedMinutes,
    }));

    setTeamStates([
    {
        clubId: homeClub.id,
        substitutionsUsed: 0,
        maximumSubstitutions: 5,
        substitutionWindowsUsed: 0,
        maximumSubstitutionWindows: 3,
    },
    {
        clubId: awayClub.id,
        substitutionsUsed: 0,
        maximumSubstitutions: 5,
        substitutionWindowsUsed: 0,
        maximumSubstitutionWindows: 3,
    },
    ]);
  }

  function handleInjurySubstitution(
    substitutePlayerId: string,
  ) {
    if (!pendingDecision || !simulation) {
      return;
    }

    const injuredPlayer = players.find(
      (player) =>
        player.id === pendingDecision.injuredPlayerId,
    );

    const substitutePlayer = players.find(
      (player) => player.id === substitutePlayerId,
    );

    if (!injuredPlayer || !substitutePlayer) {
      return;
    }

    const substitutionEvent: MatchEvent = {
      id: `${fixture.id}_USER_SUB_${pendingDecision.minute}`,
      fixtureId: fixture.id,
      minute: pendingDecision.minute,
      type: "SUBSTITUTION" as const,
      clubId: managedClubId,
      playerId: injuredPlayer.id,
      secondaryPlayerId: substitutePlayer.id,
      description:
        `Sale ${injuredPlayer.shortName} y entra ` +
        `${substitutePlayer.shortName}.`,
    };

    setSimulation({
      ...simulation,
      events: [...simulation.events, substitutionEvent]
        .sort((a, b) => a.minute - b.minute),
    });

    setPendingDecision(null);

    setTeamStates((current) =>
      current.map((state) =>
        state.clubId === managedClubId
          ? {
              ...state,
              substitutionsUsed:
                state.substitutionsUsed + 1,
              substitutionWindowsUsed:
                state.substitutionWindowsUsed + 1,
            }
          : state,
      ),
    );

    const result = applyMatchEvent(
    playerStates,
    substitutionEvent,
    );

    setPlayerStates(result.playerStates);
  }

  function handleManualSubstitution(
    outgoingPlayerId: string,
    incomingPlayerId: string,
  ) {
    if (!simulation || substitutionsRemaining <= 0) {
      return;
    }

    const outgoingPlayer = players.find(
      (player) => player.id === outgoingPlayerId,
    );

    const incomingPlayer = players.find(
      (player) => player.id === incomingPlayerId,
    );

    if (!outgoingPlayer || !incomingPlayer) {
      return;
    }

    const minute = Math.floor(clock.elapsedSeconds / 60);

    const event: MatchEvent = {
      id: `${fixture.id}_USER_SUB_${minute}_${outgoingPlayerId}`,
      fixtureId: fixture.id,
      minute,
      type: "SUBSTITUTION",
      clubId: managedClubId,
      playerId: outgoingPlayerId,
      secondaryPlayerId: incomingPlayerId,
      description:
        `Cambio: sale ${outgoingPlayer.shortName} y entra ` +
        `${incomingPlayer.shortName}.`,
    };

    const result = applyMatchEvent(playerStates, event);

    setPlayerStates(result.playerStates);

    setSimulation({
      ...simulation,
      events: [...simulation.events, event].sort(
        (a, b) => a.minute - b.minute,
      ),
    });

    setTeamStates((current) =>
      current.map((state) =>
        state.clubId === managedClubId
          ? {
              ...state,
              substitutionsUsed:
                state.substitutionsUsed + 1,
              substitutionWindowsUsed:
                state.substitutionWindowsUsed + 1,
            }
          : state,
      ),
    );

    setManualSubstitutionOpen(false);
  }

  useEffect(() => {
  if (
    !simulation ||
    pendingDecision ||
    playerStates.length === 0
  ) {
    return;
  }

  const minute = Math.floor(
    clock.elapsedSeconds / 60,
  );

  if (minute < 55 || minute > 86) {
    return;
  }

  if (minute % 7 !== 0) {
    return;
  }

  if (cpuSubstitutionMinutes.has(minute)) {
    return;
  }
  const cpuClub =
    managedClubId === homeClub.id
      ? awayClub
      : homeClub;

  const cpuTeamState = teamStates.find(
    (state) => state.clubId === cpuClub.id,
  );

  if (
    !cpuTeamState ||
    cpuTeamState.substitutionsUsed >=
      cpuTeamState.maximumSubstitutions ||
    cpuTeamState.substitutionWindowsUsed >=
      cpuTeamState.maximumSubstitutionWindows
  ) {
    return;
  }

  const goalsFor =
    cpuClub.id === homeClub.id
      ? currentScore.home
      : currentScore.away;

  const goalsAgainst =
    cpuClub.id === homeClub.id
      ? currentScore.away
      : currentScore.home;

  const selection = selectCpuTacticalSubstitution({
    clubId: cpuClub.id,
    minute,
    goalsFor,
    goalsAgainst,
    playerStates,
    players,
  });

  if (!selection) {
    return;
  }

  const outgoingPlayer = players.find(
    (player) =>
      player.id === selection.outgoingPlayerId,
  );

  const incomingPlayer = players.find(
    (player) =>
      player.id === selection.incomingPlayerId,
  );

  if (!outgoingPlayer || !incomingPlayer) {
    return;
  }

  const event: MatchEvent = {
    id: `${fixture.id}_TACTICAL_SUB_${cpuClub.id}_${minute}`,
    fixtureId: fixture.id,
    minute,
    type: "SUBSTITUTION",
    clubId: cpuClub.id,
    playerId: outgoingPlayer.id,
    secondaryPlayerId: incomingPlayer.id,
    description:
      `Cambio en ${cpuClub.name}: sale ` +
      `${outgoingPlayer.shortName} y entra ` +
      `${incomingPlayer.shortName}.`,
  };

  const result = applyMatchEvent(
    playerStates,
    event,
  );

  setPlayerStates(result.playerStates);

  setSimulation((current) => {
    if (!current) {
      return current;
    }

    return {
      ...current,
      events: [...current.events, event].sort(
        (a, b) => a.minute - b.minute,
      ),
    };
  });

  setTeamStates((current) =>
    current.map((state) =>
      state.clubId === cpuClub.id
        ? {
            ...state,
            substitutionsUsed:
              state.substitutionsUsed + 1,
            substitutionWindowsUsed:
              state.substitutionWindowsUsed + 1,
          }
        : state,
    ),
  );
}, [
  clock.elapsedSeconds,
  simulation,
  pendingDecision,
  playerStates,
  teamStates,
  managedClubId,
  homeClub,
  awayClub,
  currentScore.home,
  currentScore.away,
  players,
  fixture.id,
]);

  useEffect(() => {
    if (!simulation) {
      return;
    }

    const isRunning =
      clock.period === "FIRST_HALF" ||
      clock.period === "SECOND_HALF";

    if (!isRunning) {
      return;
    }

    if (pendingDecision || manualSubstitutionOpen) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setClock((current) => {
        const secondsAdvanced = current.speed * 4;
        const nextSeconds =
          current.elapsedSeconds + secondsAdvanced;

        const firstHalfLimit =
          (45 + current.firstHalfAddedMinutes) * 60;

        const secondHalfLimit =
          (90 + current.secondHalfAddedMinutes) * 60;

        if (
          current.period === "FIRST_HALF" &&
          nextSeconds >= firstHalfLimit
        ) {
          return {
            ...current,
            elapsedSeconds: firstHalfLimit,
            period: "HALF_TIME",
          };
        }

        if (
          current.period === "SECOND_HALF" &&
          nextSeconds >= secondHalfLimit
        ) {
          return {
            ...current,
            elapsedSeconds: secondHalfLimit,
            period: "FULL_TIME",
          };
        }

        return {
          ...current,
          elapsedSeconds: nextSeconds,
        };
      });
    }, 100);

    return () => window.clearInterval(intervalId);
  }, [simulation, clock.period, pendingDecision, manualSubstitutionOpen,]);

  const managedTeamState = teamStates.find(
    (state) => state.clubId === managedClubId,
  );

  const substitutionsRemaining = managedTeamState
    ? managedTeamState.maximumSubstitutions -
      managedTeamState.substitutionsUsed
    : 0;

  return (
    <main className="game-page">
      <section className="game-container match-container">
        <header className="match-header">
          <button
            className="back-button"
            type="button"
            onClick={onBack}
            disabled={simulation !== null}
          >
            ← Volver
          </button>

          <div>
            <p className="menu-subtitle">PARTIDO DE LIGA</p>
            <h1>Jornada {fixture.matchday}</h1>
          </div>
        </header>

        {clock.period === "PRE_MATCH" && (
        <section className="lineups-preview">
          <LiveLineupColumn
            title={homeClub.name}
            lineup={homeLineup}
            players={players}
            playerStates={playerStates}
            events={visibleEvents}
          />

          <LiveLineupColumn
            title={awayClub.name}
            lineup={awayLineup}
            players={players}
            playerStates={playerStates}
            events={visibleEvents}
          />
        </section>
        )}

        <section className="match-scoreboard">
          <article
            className={
              homeClub.id === managedClubId
                ? "match-team managed-match-team"
                : "match-team"
            }
          >
            <div className="match-club-badge">
              {homeClub.shortName}
            </div>

            <strong>{homeClub.name}</strong>
          </article>

          <div className="score-centre">
            <span className="match-minute match-clock">
            {simulation ? formatMatchClock(clock) : "0:00"}
            </span>

            <strong className="main-score">
              {currentScore.home} - {currentScore.away}
            </strong>
          </div>

          {simulation && clock.period !== "FULL_TIME" && (
            <>
              {clock.period !== "HALF_TIME" && (
                <div className="speed-controls">
                  {([1, 2, 4, 8] as MatchSpeed[]).map((speed) => (
                    <button
                      key={speed}
                      type="button"
                      className={
                        clock.speed === speed
                          ? "speed-button active-speed"
                          : "speed-button"
                      }
                      onClick={() =>
                        setClock((current) => ({
                          ...current,
                          speed,
                        }))
                      }
                    >
                      x{speed}
                    </button>
                  ))}
                </div>
              )}

              <button
                type="button"
                className="secondary-button manual-change-button"
                disabled={substitutionsRemaining <= 0}
                onClick={() => setManualSubstitutionOpen(true)}
              >
                Hacer cambios ({substitutionsRemaining})
              </button>
            </>
          )}

          <article
            className={
              awayClub.id === managedClubId
                ? "match-team managed-match-team"
                : "match-team"
            }
          >
            <div className="match-club-badge">
              {awayClub.shortName}
            </div>

            <strong>{awayClub.name}</strong>
          </article>
        </section>

        {!simulation && (
          <button
            className="primary-button"
            type="button"
            onClick={handleStart}
          >
            Iniciar partido
          </button>
        )}

            {simulation && (
          <>
            <section className="match-events">
              <h2>Eventos</h2>

              {visibleEvents.map((event) => (
                <article
                  className={
                    event.type === "GOAL"
                      ? "match-event goal-event"
                      : "match-event"
                  }
                  key={event.id}
                >
                  <strong>{event.minute}'</strong>
                  <span>{event.description}</span>
                </article>
              ))}
            </section>

            {manualSubstitutionOpen && (
              <ManualSubstitutionPanel
                clubId={managedClubId}
                players={players}
                playerStates={playerStates}
                substitutionsRemaining={substitutionsRemaining}
                onConfirm={handleManualSubstitution}
                onClose={() => setManualSubstitutionOpen(false)}
              />
            )}

            {pendingDecision && (
              <InjurySubstitutionPanel
                decision={pendingDecision}
                players={players}
                onConfirm={handleInjurySubstitution}
              />
            )}

            {clock.period === "HALF_TIME" && !pendingDecision && (
              <section className="half-time-panel">
                <p className="menu-subtitle">DESCANSO</p>

                <h2>
                  {homeClub.name} {currentScore.home} -{" "}
                  {currentScore.away} {awayClub.name}
                </h2>

                <button
                  className="primary-button"
                  type="button"
                  onClick={() =>
                    setClock((current) => ({
                      ...current,
                      elapsedSeconds: 45 * 60,
                      period: "SECOND_HALF",
                    }))
                  }
                >
                  Continuar con la segunda parte
                </button>
              </section>
            )}

            {clock.period === "FULL_TIME" && simulation && (
              <section className="full-time-panel">
                <p className="menu-subtitle">
                  FINAL DEL PARTIDO
                </p>

                <h2>
                  {homeClub.name} {simulation.homeGoals} -{" "}
                  {simulation.awayGoals} {awayClub.name}
                </h2>

                <button
                  className="primary-button"
                  type="button"
                  onClick={() => onFinish(simulation)}
                >
                  Ver resultados de la jornada
                </button>
              </section>
            )}
          </>
        )}
      </section>
    </main>
  );
}

function calculateVisibleScore(
  events: MatchEvent[],
  homeClubId: string,
  awayClubId: string,
): {
  home: number;
  away: number;
} {
  let home = 0;
  let away = 0;

  for (const event of events) {
    if (event.type !== "GOAL") {
      continue;
    }

    if (event.clubId === homeClubId) {
      home += 1;
    }

    if (event.clubId === awayClubId) {
      away += 1;
    }
  }

  return { home, away };
}

