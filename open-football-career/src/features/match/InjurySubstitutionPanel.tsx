import type { MatchDecision } from "../../domain/matchDecision";
import type { Player } from "../../domain/player";

interface InjurySubstitutionPanelProps {
  decision: MatchDecision;
  players: Player[];
  onConfirm: (substitutePlayerId: string) => void;
}

export function InjurySubstitutionPanel({
  decision,
  players,
  onConfirm,
}: InjurySubstitutionPanelProps) {
  const injuredPlayer = players.find(
    (player) =>
      player.id === decision.injuredPlayerId,
  );

  const substitutes = decision.availableSubstituteIds
    .map((playerId) =>
      players.find((player) => player.id === playerId),
    )
    .filter((player): player is Player => Boolean(player));

  return (
    <section className="injury-decision-panel">
      <p className="menu-subtitle">
        LESIÓN · {decision.minute}'
      </p>

      <h2>
        {injuredPlayer?.shortName ?? "El jugador"} no puede
        continuar
      </h2>

      <p>Selecciona un sustituto:</p>

      <div className="substitute-options">
        {substitutes.map((player) => (
          <button
            type="button"
            className="substitute-option"
            key={player.id}
            onClick={() => onConfirm(player.id)}
          >
            <span>{player.position}</span>

            <strong>{player.shortName}</strong>

            <small>Media {player.overall}</small>
          </button>
        ))}
      </div>
    </section>
  );
}