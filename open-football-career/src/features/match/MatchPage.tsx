import { useMemo, useState } from "react";

import type { Club } from "../../domain/club";
import type { Fixture } from "../../domain/fixture";
import type { MatchEvent } from "../../domain/matchEvent";
import {
  simulateMatchWithEvents,
  type SimulatedMatchWithEvents,
} from "../../core/match/simulateMatchWithEvents";

interface MatchPageProps {
  fixture: Fixture;
  homeClub: Club;
  awayClub: Club;
  managedClubId: string;
  onFinish: (result: SimulatedMatchWithEvents) => void;
  onBack: () => void;
}

export function MatchPage({
  fixture,
  homeClub,
  awayClub,
  managedClubId,
  onFinish,
  onBack,
}: MatchPageProps) {
  const [simulation, setSimulation] =
    useState<SimulatedMatchWithEvents | null>(null);

  const [visibleEventCount, setVisibleEventCount] = useState(0);

  const visibleEvents = useMemo(
    () => simulation?.events.slice(0, visibleEventCount) ?? [],
    [simulation, visibleEventCount],
  );

  const currentMinute =
    visibleEvents[visibleEvents.length - 1]?.minute ?? 0;

  const currentScore = calculateVisibleScore(
    visibleEvents,
    homeClub.id,
    awayClub.id,
  );

  const matchFinished =
    simulation !== null &&
    visibleEventCount >= simulation.events.length;

  function handleStart() {
    const result = simulateMatchWithEvents(
      fixture,
      homeClub,
      awayClub,
    );

    setSimulation(result);
    setVisibleEventCount(1);
  }

  function handleNextEvent() {
    if (!simulation) {
      return;
    }

    setVisibleEventCount((current) =>
      Math.min(current + 1, simulation.events.length),
    );
  }

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
            <span className="match-minute">
              {simulation ? `${currentMinute}'` : "—"}
            </span>

            <strong className="main-score">
              {currentScore.home} - {currentScore.away}
            </strong>
          </div>

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

            {!matchFinished && (
              <button
                className="primary-button"
                type="button"
                onClick={handleNextEvent}
              >
                Continuar partido
              </button>
            )}

            {matchFinished && (
              <button
                className="primary-button"
                type="button"
                onClick={() => onFinish(simulation)}
              >
                Volver a la jornada
              </button>
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