import { FixturesList } from "../competition/FixturesList";
import { StandingsTable } from "../competition/StandingsTable";
import { useCareerStore } from "../../store/careerStore";

interface CareerPageProps {
  onExit: () => void;
  onPlayMatch: () => void;
}

export function CareerPage({
  onExit,
  onPlayMatch,
}: CareerPageProps) {
  const {
    seasonId,
    managedClubId,
    currentMatchday,
    lastPlayedMatchday,
    matchdayView,
    clubs,
    competitions,
    fixtures,
    standings,
    simulateCurrentMatchday,
    continueToNextMatchday,
    resetCareer,
  } = useCareerStore();

  const managedClub = clubs.find(
    (club) => club.id === managedClubId,
  );

  const competition = competitions[0];

  const maximumMatchday = Math.max(
    0,
    ...fixtures.map((fixture) => fixture.matchday),
  );

  const managedFixture = fixtures.find(
    (fixture) =>
        fixture.matchday === currentMatchday &&
        (fixture.homeClubId === managedClubId ||
        fixture.awayClubId === managedClubId),
    );

  const seasonFinished =
    fixtures.length > 0 &&
    fixtures.every((fixture) => fixture.played);

  const displayedMatchday =
    matchdayView === "RESULTS" && lastPlayedMatchday !== null
      ? lastPlayedMatchday
      : currentMatchday;

  const managedStanding = standings.find(
    (row) => row.clubId === managedClubId,
  );

  const champion = clubs.find(
    (club) => club.id === standings[0]?.clubId,
  );

  function handleExit() {
    resetCareer();
    onExit();
  }

  if (!managedClub || !competition) {
    return (
      <main className="game-page">
        <section className="game-container">
          <p>No hay ninguna carrera activa.</p>

          <button
            className="primary-button"
            type="button"
            onClick={handleExit}
          >
            Volver al menú
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="game-page">
      <section className="game-container career-container">
        <header className="career-header">
          <div>
            <p className="menu-subtitle">
              {competition.name}
            </p>

            <h1>{managedClub.name}</h1>

            <p>
              Temporada {seasonId} · Jornada{" "}
              {displayedMatchday} de {maximumMatchday}
            </p>
          </div>

          <button
            className="secondary-button exit-button"
            type="button"
            onClick={handleExit}
          >
            Salir
          </button>
        </header>

        <section className="summary-grid">
          <article className="summary-card">
            <span>Reputación</span>
            <strong>{managedClub.reputation}</strong>
          </article>

          <article className="summary-card">
            <span>Presupuesto</span>
            <strong>
              {(managedClub.budget / 1_000_000).toFixed(1)} M€
            </strong>
          </article>

          <article className="summary-card">
            <span>Posición</span>
            <strong>
              {managedStanding?.position ?? "-"}.º
            </strong>
          </article>

          <article className="summary-card">
            <span>Puntos</span>
            <strong>{managedStanding?.points ?? 0}</strong>
          </article>
        </section>

        <section className="content-panel">
          <div className="section-heading">
            <div>
              <p className="menu-subtitle">
                {matchdayView === "RESULTS"
                  ? "RESULTADOS"
                  : "PRÓXIMA JORNADA"}
              </p>

              <h2>Jornada {displayedMatchday}</h2>
            </div>

            {matchdayView === "PENDING" && !seasonFinished && (
            <div className="matchday-actions">
                {managedFixture && !managedFixture.played && (
                <button
                    className="primary-button simulate-button"
                    type="button"
                    onClick={onPlayMatch}
                >
                    Jugar mi partido
                </button>
                )}

                <button
                className="secondary-button simulate-button"
                type="button"
                onClick={simulateCurrentMatchday}
                >
                Simular jornada completa
                </button>
            </div>
            )}
            {matchdayView === "RESULTS" &&
              !seasonFinished && (
                <button
                  className="primary-button simulate-button"
                  type="button"
                  onClick={continueToNextMatchday}
                >
                  Continuar a jornada {currentMatchday + 1}
                </button>
              )}
          </div>

          <FixturesList
            fixtures={fixtures}
            clubs={clubs}
            matchday={displayedMatchday}
            managedClubId={managedClubId}
          />

          {seasonFinished && (
            <div className="season-finished final-season-card">
              <p className="menu-subtitle">
                TEMPORADA TERMINADA
              </p>

              <h2>{champion?.name ?? "Sin campeón"}</h2>

              <p>Campeón de {competition.name}</p>

              {champion?.id === managedClubId ? (
                <strong>¡Has ganado la liga!</strong>
              ) : (
                <p>
                  Tu posición final:{" "}
                  <strong>
                    {managedStanding?.position ?? "-"}.º
                  </strong>
                </p>
              )}
            </div>
          )}
        </section>

        <section className="content-panel">
          <div className="section-heading">
            <div>
              <p className="menu-subtitle">
                CLASIFICACIÓN
              </p>

              <h2>{competition.name}</h2>
            </div>
          </div>

          <StandingsTable
            standings={standings}
            clubs={clubs}
            managedClubId={managedClubId}
          />
        </section>
      </section>
    </main>
  );
}