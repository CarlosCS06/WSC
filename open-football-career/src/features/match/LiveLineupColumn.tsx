import type { Lineup } from "../../domain/lineup";
import type { MatchEvent } from "../../domain/matchEvent";
import type { Player } from "../../domain/player";
import type { MatchPlayerState } from "../../domain/matchPlayerState";

interface LiveLineupColumnProps {
  title: string;
  lineup: Lineup;
  players: Player[];
  playerStates: MatchPlayerState[];
  events: MatchEvent[];
}

export function LiveLineupColumn({
  title,
  lineup,
  players,
  playerStates,
  events,
}: LiveLineupColumnProps) {
  const playersById = new Map(
    players.map((player) => [player.id, player]),
  );

  const clubStates = playerStates.filter(
    (state) => state.clubId === lineup.clubId,
  );

  const substitutions = events.filter(
    (event) =>
      event.type === "SUBSTITUTION" &&
      event.clubId === lineup.clubId &&
      event.playerId &&
      event.secondaryPlayerId,
  );

  const availableBench = clubStates.filter(
    (state) => state.isAvailable,
  );

  return (
    <article className="lineup-column">
      <h2>{title}</h2>
      <p>Formación {lineup.formation}</p>

      <div className="lineup-list">
        {lineup.starters.map((slot) => {
          const starter = playersById.get(slot.playerId);

          const playerChanges = substitutions.filter(
            (event) => event.playerId === slot.playerId,
          );

          const firstChange = playerChanges[0];

          const replacement = firstChange?.secondaryPlayerId
            ? playersById.get(firstChange.secondaryPlayerId)
            : null;

          return (
            <div className="live-lineup-row" key={slot.playerId}>
              <span className="lineup-position">{slot.position}</span>

              <div className="lineup-history">
                <div
                  className={
                    replacement
                      ? "lineup-person substituted-player"
                      : "lineup-person"
                  }
                >
                  <strong>
                    {starter?.shortName ?? slot.playerId}
                  </strong>

                  <small>{starter?.overall ?? "-"}</small>
                </div>

                {replacement && firstChange && (
                  <>
                    <span className="substitution-arrow">→</span>

                    <div className="lineup-person replacement-player">
                      <strong>{replacement.shortName}</strong>
                      <small>{replacement.overall}</small>
                      <em>{firstChange.minute}'</em>
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="live-bench">
        <h3>Banquillo</h3>

        {availableBench.length === 0 ? (
          <p>Sin suplentes disponibles</p>
        ) : (
          availableBench.map((state) => {
            const player = playersById.get(state.playerId);

            if (!player) {
              return null;
            }

            return (
              <div className="bench-player" key={player.id}>
                <span>{player.position}</span>
                <strong>{player.shortName}</strong>
                <small>{player.overall}</small>
              </div>
            );
          })
        )}
      </div>
    </article>
  );
}
