import { useState } from "react";

import type { MatchPlayerState } from "../../domain/matchPlayerState";
import type { Player } from "../../domain/player";

interface ManualSubstitutionPanelProps {
  clubId: string;
  players: Player[];
  playerStates: MatchPlayerState[];
  substitutionsRemaining: number;
  onConfirm: (
    outgoingPlayerId: string,
    incomingPlayerId: string,
  ) => void;
  onClose: () => void;
}

export function ManualSubstitutionPanel({
  clubId,
  players,
  playerStates,
  substitutionsRemaining,
  onConfirm,
  onClose,
}: ManualSubstitutionPanelProps) {
  const [outgoingPlayerId, setOutgoingPlayerId] =
    useState<string | null>(null);

  const [incomingPlayerId, setIncomingPlayerId] =
    useState<string | null>(null);

  const playersById = new Map(
    players.map((player) => [player.id, player]),
  );

  const playersOnPitch = playerStates.filter(
    (state) =>
      state.clubId === clubId &&
      state.isOnPitch &&
      !state.sentOff,
  );

  const substitutes = playerStates.filter(
    (state) =>
      state.clubId === clubId &&
      state.isAvailable &&
      !state.injured &&
      !state.sentOff,
  );

  function handleConfirm() {
    if (!outgoingPlayerId || !incomingPlayerId) {
      return;
    }

    onConfirm(outgoingPlayerId, incomingPlayerId);
  }

  return (
    <section className="manual-substitution-panel">
      <div className="substitution-panel-header">
        <div>
          <p className="menu-subtitle">HACER CAMBIO</p>
          <h2>
            Cambios disponibles: {substitutionsRemaining}
          </h2>
        </div>

        <button
          type="button"
          className="back-button"
          onClick={onClose}
        >
          Cerrar
        </button>
      </div>

      <h3>Selecciona quién sale</h3>

      <div className="substitution-player-list">
        {playersOnPitch.map((state) => {
          const player = playersById.get(state.playerId);

          if (!player) {
            return null;
          }

          return (
            <button
              type="button"
              key={player.id}
              className={
                outgoingPlayerId === player.id
                  ? "substitution-player selected-player"
                  : "substitution-player"
              }
              onClick={() => setOutgoingPlayerId(player.id)}
            >
              <strong>{player.shortName}</strong>
              <span>{player.position}</span>
              <span>MED {player.overall}</span>
              <span>
                Fatiga {Math.round(state.fatigue)}%
              </span>

              {state.yellowCards > 0 && (
                <span>🟨 {state.yellowCards}</span>
              )}
            </button>
          );
        })}
      </div>

      <h3>Selecciona quién entra</h3>

      <div className="substitution-player-list">
        {substitutes.map((state) => {
          const player = playersById.get(state.playerId);

          if (!player) {
            return null;
          }

          return (
            <button
              type="button"
              key={player.id}
              className={
                incomingPlayerId === player.id
                  ? "substitution-player selected-player"
                  : "substitution-player"
              }
              onClick={() => setIncomingPlayerId(player.id)}
            >
              <strong>{player.shortName}</strong>
              <span>{player.position}</span>
              <span>MED {player.overall}</span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        className="primary-button"
        disabled={
          !outgoingPlayerId ||
          !incomingPlayerId ||
          substitutionsRemaining <= 0
        }
        onClick={handleConfirm}
      >
        Confirmar cambio
      </button>
    </section>
  );
}