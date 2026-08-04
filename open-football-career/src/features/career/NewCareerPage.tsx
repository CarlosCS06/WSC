import { generateRoundRobin } from "../../core/calendar/generateRoundRobin";
import {
  demoClubs,
  demoCompetition,
} from "../../data/demo/demoData";
import { useCareerStore } from "../../store/careerStore";

interface NewCareerPageProps {
  onCareerStarted: () => void;
  onBack: () => void;
}

export function NewCareerPage({
  onCareerStarted,
  onBack,
}: NewCareerPageProps) {
  const startCareer = useCareerStore(
    (state) => state.startCareer,
  );

  function handleSelectClub(clubId: string) {
    const stage = demoCompetition.stages[0];

    if (!stage) {
      throw new Error("La competición no tiene ninguna fase.");
    }

    const fixtures = generateRoundRobin({
      competitionId: demoCompetition.id,
      seasonId: "2026-27",
      clubIds: demoCompetition.participantClubIds,
      rounds: stage.rounds,
    });

    startCareer({
      careerId: crypto.randomUUID(),
      seasonId: "2026-27",
      managedClubId: clubId,
      clubs: demoClubs,
      competitions: [demoCompetition],
      fixtures,
    });

    onCareerStarted();
  }

  return (
    <main className="game-page">
      <section className="game-container">
        <button
          className="back-button"
          type="button"
          onClick={onBack}
        >
          ← Volver
        </button>

        <header className="page-header">
          <p className="menu-subtitle">NUEVA CARRERA</p>
          <h1>Elige tu club</h1>
          <p>
            Liga Demo · Temporada 2026-27
          </p>
        </header>

        <div className="club-grid">
          {demoClubs.map((club) => (
            <button
              className="club-card"
              type="button"
              key={club.id}
              onClick={() => handleSelectClub(club.id)}
            >
              <span className="club-badge">
                {club.shortName}
              </span>

              <strong>{club.name}</strong>

              <span>
                Reputación: {club.reputation}
              </span>

              <span>
                ATA {club.attack} · MED {club.midfield} · DEF{" "}
                {club.defence}
              </span>

              <span>
                Presupuesto:{" "}
                {(club.budget / 1_000_000).toFixed(1)} M€
              </span>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}