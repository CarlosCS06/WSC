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

import { formatMatchClock } from "../../core/match/formatMatchClock";
import { calculateAddedTime } from "../../core/match/calculateAddedTime";

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

  type MatchPlaybackStatus =
  | "PRE_MATCH"
  | "PLAYING_FIRST_HALF"
  | "HALF_TIME"
  | "PLAYING_SECOND_HALF"
  | "FULL_TIME";

    const [playbackStatus, setPlaybackStatus] =
    useState<MatchPlaybackStatus>("PRE_MATCH");

  const [clock, setClock] = useState<MatchClockState>({
    elapsedSeconds: 0,
    period: "PRE_MATCH",
    speed: 4,
    firstHalfAddedMinutes: 0,
    secondHalfAddedMinutes: 0,
  });

  const currentMinute = Math.floor(clock.elapsedSeconds / 60);

  const visibleEvents = useMemo(() => {
    if (!simulation) {
      return [];
    }

    return simulation.events.filter((event) =>
      event.minute <= currentMinute,
    );
  }, [simulation, currentMinute]);

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
  }

  useEffect(() => {
    if (!simulation) {
      return;
    }

    const isPlaying =
      playbackStatus === "PLAYING_FIRST_HALF" ||
      playbackStatus === "PLAYING_SECOND_HALF";

    if (!isPlaying) {
      return;
    }

    const nextEvent = simulation.events.find(
      (e) => e.minute > currentMinute,
    );

    if (!nextEvent) {
      setPlaybackStatus("FULL_TIME");
      return;
    }

    if (
      playbackStatus === "PLAYING_FIRST_HALF" &&
      nextEvent.type === "HALF_TIME"
    ) {
      const timeoutId = window.setTimeout(() => {
        setPlaybackStatus("HALF_TIME");
      }, 900);

      return () => window.clearTimeout(timeoutId);
    }

    const timeoutId = window.setTimeout(() => {
      if (nextEvent.type === "FULL_TIME") {
        setPlaybackStatus("FULL_TIME");
      }
    }, getEventDelay(nextEvent.type));

    return () => window.clearTimeout(timeoutId);
  }, [simulation, currentMinute, playbackStatus]);

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
  }, [simulation, clock.period]);

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

        {playbackStatus === "PRE_MATCH" && (
          <section className="lineups-preview">
            <LineupColumn
              title={homeClub.name}
              lineup={homeLineup}
              players={players}
            />

            <LineupColumn
              title={awayClub.name}
              lineup={awayLineup}
              players={players}
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

          {simulation &&
            clock.period !== "FULL_TIME" &&
            clock.period !== "HALF_TIME" && (
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

            {clock.period === "HALF_TIME" && (
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

function getEventDelay(type: MatchEvent["type"]): number {
  switch (type) {
    case "GOAL":
      return 1_800;

    case "HALF_TIME":
    case "FULL_TIME":
      return 1_200;

    default:
      return 650;
  }
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

interface LineupColumnProps {
  title: string;
  lineup: Lineup;
  players: Player[];
}

function LineupColumn({
  title,
  lineup,
  players,
}: LineupColumnProps) {
  const playersById = new Map(
    players.map((player) => [player.id, player]),
  );

  return (
    <article className="lineup-column">
      <h2>{title}</h2>
      <p>Formación {lineup.formation}</p>

      <div className="lineup-list">
        {lineup.starters.map((slot) => {
          const player = playersById.get(slot.playerId);

          return (
            <div
              className="lineup-player"
              key={slot.playerId}
            >
              <span>{slot.position}</span>
              <strong>
                {player?.shortName ?? slot.playerId}
              </strong>
              <small>{player?.overall ?? "-"}</small>
            </div>
          );
        })}
      </div>
    </article>
  );
}
