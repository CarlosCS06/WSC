import { useState } from "react";

export function MainMenuPage() {
  const [message, setMessage] = useState("");

  return (
    <main className="main-menu">
      <section className="menu-card">
        <p className="menu-subtitle">SIMULADOR DE FÚTBOL</p>

        <h1>Open Football Career</h1>

        <p className="menu-description">
          Construye tu carrera, dirige clubes y compite en ligas de todo el
          mundo.
        </p>

        <div className="menu-actions">
          <button
            className="primary-button"
            onClick={() => setMessage("Nueva carrera seleccionada")}
          >
            Nueva carrera
          </button>

          <button
            className="secondary-button"
            onClick={() => setMessage("Todavía no hay partidas guardadas")}
          >
            Cargar partida
          </button>

          <button
            className="secondary-button"
            onClick={() => setMessage("Editor de data packs próximamente")}
          >
            Data packs
          </button>
        </div>

        {message && <p className="menu-message">{message}</p>}

        <p className="version">Versión 0.1.0</p>
      </section>
    </main>
  );
}