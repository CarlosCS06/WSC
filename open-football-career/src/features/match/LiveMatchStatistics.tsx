import type { Club } from "../../domain/club";
import type { TeamMatchStatistics } from "../../domain/matchStatistics";

interface LiveMatchStatisticsProps {
  homeClub: Club;
  awayClub: Club;
  home: TeamMatchStatistics;
  away: TeamMatchStatistics;
}

export function LiveMatchStatistics({
  homeClub,
  awayClub,
  home,
  away,
}: LiveMatchStatisticsProps) {
  return (
    <section className="live-statistics">
      <div className="statistics-header">
        <strong>{homeClub.shortName}</strong>
        <h2>Estadísticas</h2>
        <strong>{awayClub.shortName}</strong>
      </div>

      <StatisticRow
        label="Posesión"
        home={`${home.possession}%`}
        away={`${away.possession}%`}
      />

      <StatisticRow
        label="Tiros"
        home={home.shots}
        away={away.shots}
      />

      <StatisticRow
        label="A puerta"
        home={home.shotsOnTarget}
        away={away.shotsOnTarget}
      />

      <StatisticRow
        label="Faltas"
        home={home.fouls}
        away={away.fouls}
      />

      <StatisticRow
        label="Amarillas"
        home={home.yellowCards}
        away={away.yellowCards}
      />

      <StatisticRow
        label="Rojas"
        home={home.redCards}
        away={away.redCards}
      />

      <StatisticRow
        label="Córners"
        home={home.corners}
        away={away.corners}
      />

      <StatisticRow
        label="Fueras de juego"
        home={home.offsides}
        away={away.offsides}
      />

      <StatisticRow
        label="Cambios"
        home={home.substitutions}
        away={away.substitutions}
      />
    </section>
  );
}

interface StatisticRowProps {
  label: string;
  home: string | number;
  away: string | number;
}

function StatisticRow({
  label,
  home,
  away,
}: StatisticRowProps) {
  return (
    <div className="statistic-row">
      <strong>{home}</strong>
      <span>{label}</span>
      <strong>{away}</strong>
    </div>
  );
}