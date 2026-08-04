interface MainMenuPageProps {
  onNewCareer: () => void;
}

export function MainMenuPage({
  onNewCareer,
}: MainMenuPageProps) {
  return (
    <main className="main-menu">
      <section className="menu-card">
        <p className="menu-subtitle">
          SIMULADOR DE FÚTBOL
        </p>

        <h1>Open Football Career</h1>

        <p className="menu-description">
          Construye tu carrera, dirige clubes y compite en
          ligas de todo el mundo.
        </p>

        <div className="menu-actions">
          <button
            className="primary-button"
            type="button"
            onClick={onNewCareer}
          >
            Nueva carrera
          </button>

          <button
            className="secondary-button"
            type="button"
            disabled
          >
            Cargar partida
          </button>

          <button
            className="secondary-button"
            type="button"
            disabled
          >
            Data packs
          </button>
        </div>

        <p className="version">Versión 0.1.0</p>
      </section>
    </main>
  );
}