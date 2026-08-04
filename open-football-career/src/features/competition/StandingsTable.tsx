import type { Club } from "../../domain/club";
import type { StandingRow } from "../../domain/standings";

interface StandingsTableProps {
  standings: StandingRow[];
  clubs: Club[];
  managedClubId: string | null;
}

export function StandingsTable({
  standings,
  clubs,
  managedClubId,
}: StandingsTableProps) {
  const clubNames = new Map(
    clubs.map((club) => [club.id, club.name]),
  );

  return (
    <div className="table-scroll">
      <table className="standings-table">
        <thead>
          <tr>
            <th>Pos.</th>
            <th>Club</th>
            <th>PJ</th>
            <th>G</th>
            <th>E</th>
            <th>P</th>
            <th>GF</th>
            <th>GC</th>
            <th>DG</th>
            <th>Pts.</th>
          </tr>
        </thead>

        <tbody>
          {standings.map((row) => (
            <tr
              key={row.clubId}
              className={
                row.clubId === managedClubId
                  ? "managed-team-row"
                  : undefined
              }
            >
              <td>{row.position}</td>
              <td>{clubNames.get(row.clubId) ?? row.clubId}</td>
              <td>{row.played}</td>
              <td>{row.wins}</td>
              <td>{row.draws}</td>
              <td>{row.losses}</td>
              <td>{row.goalsFor}</td>
              <td>{row.goalsAgainst}</td>
              <td>{row.goalDifference}</td>
              <td>
                <strong>{row.points}</strong>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}