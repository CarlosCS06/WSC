import type { TeamMentality } from "../../domain/teamMentality";

interface MentalityControlsProps {
  mentality: TeamMentality;
  disabled?: boolean;
  onChange: (mentality: TeamMentality) => void;
}

const options: Array<{
  value: TeamMentality;
  label: string;
}> = [
  {
    value: "DEFENSIVE",
    label: "Defensiva",
  },
  {
    value: "BALANCED",
    label: "Equilibrada",
  },
  {
    value: "ATTACKING",
    label: "Ofensiva",
  },
];

export function MentalityControls({
  mentality,
  disabled = false,
  onChange,
}: MentalityControlsProps) {
  return (
    <section className="mentality-controls">
      <div>
        <p className="menu-subtitle">MENTALIDAD</p>
        <strong>{getMentalityDescription(mentality)}</strong>
      </div>

      <div className="mentality-buttons">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            disabled={disabled}
            className={
              mentality === option.value
                ? "mentality-button mentality-button-active"
                : "mentality-button"
            }
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </section>
  );
}

function getMentalityDescription(
  mentality: TeamMentality,
): string {
  switch (mentality) {
    case "DEFENSIVE":
      return "Menos riesgos y menor desgaste.";

    case "ATTACKING":
      return "Más ocasiones, pero más espacios atrás.";

    case "BALANCED":
    default:
      return "Equilibrio entre ataque y defensa.";
  }
}