import { FixturesList } from "../competition/FixturesList";
import { StandingsTable } from "../competition/StandingsTable";
import { useCareerStore } from "../../store/careerStore";

interface CareerPageProps {
  onExit: () => void;
}

export function CareerPage({
  onExit,
}: CareerPageProps) {
  const {
    seasonId,
    managedClubId,
    currentMatchday,
    clubs,
    competitions,
    fixtures,
    standings,
    simulateCurrentMatchday,
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

  const currentFixtures = fixtures.filter(
    (fixture) => fixture.matchday === currentMatchday,
  );

  const currentMatchdayPlayed =
    currentFixtures.length > 0 &&
    currentFixtures.every((fixture) => fixture.played);

  const seasonFinished =
    fixtures.length > 0 &&
    fixtures.every((fixture) => fixture.played);

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
              {Math.min(currentMatchday, maximumMatchday)} de{" "}
              {maximumMatchday}
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
              {standings.find(
                (row) => row.clubId === managedClub.id,
              )?.position ?? "-"}
              .º
            </strong>
          </article>
        </section>

        <section className="content-panel">
          <div className="section-heading">
            <div>
              <p className="menu-subtitle">
                PRÓXIMA JORNADA
              </p>
              <h2>Jornada {currentMatchday}</h2>
            </div>

            {!seasonFinished && !currentMatchdayPlayed && (
              <button
                className="primary-button simulate-button"
                type="button"
                onClick={simulateCurrentMatchday}
              >
                Simular jornada
              </button>
            )}
          </div>

          {seasonFinished ? (
            <div className="season-finished">
              <h2>Temporada terminada</h2>
              <p>
                Campeón:{" "}
                <strong>
                  {clubs.find(
                    (club) =>
                      club.id === standings[0]?.clubId,
                  )?.name ?? "Sin campeón"}
                </strong>
              </p>
            </div>
          ) : (
            <FixturesList
              fixtures={fixtures}
              clubs={clubs}
              matchday={currentMatchday}
            />
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