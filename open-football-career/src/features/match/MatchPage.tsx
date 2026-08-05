import { useMemo, useState } from "react";

import type { Club } from "../../domain/club";
import type { Fixture } from "../../domain/fixture";
import type { MatchEvent } from "../../domain/matchEvent";
import {
  simulateMatchWithEvents,
  type SimulatedMatchWithEvents,
} from "../../core/match/simulateMatchWithEvents";
import type { Lineup } from "../../domain/lineup";
import type { Player } from "../../domain/player";

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
        homeLineup,
        awayLineup,
        players,
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

/* Example usage:
<MatchPage
  fixture={managedFixture}
  homeClub={homeClub}
  awayClub={awayClub}
  managedClubId={managedClubId}
  players={players}
  homeLineup={homeLineup}
  awayLineup={awayLineup}
  onBack={() => setPage("CAREER")}
  onFinish={(result) => {
    playManagedMatch({
      fixtureId: result.fixtureId,
      homeGoals: result.homeGoals,
      awayGoals: result.awayGoals,
    });

    simulateCurrentMatchday();
    setPage("CAREER");
  }}
/>
*/
