import type { MatchEvent } from "../../domain/matchEvent";

interface CalculateAddedTimeInput {
  events: MatchEvent[];
  fromMinute: number;
  toMinute: number;
}

export function calculateAddedTime({
  events,
  fromMinute,
  toMinute,
}: CalculateAddedTimeInput): number {
  const periodEvents = events.filter(
    (event) =>
      event.minute >= fromMinute &&
      event.minute <= toMinute,
  );

  let addedMinutes = 1;

  for (const event of periodEvents) {
    switch (event.type) {
      case "INJURY":
        addedMinutes += 1;
        break;

      case "SUBSTITUTION":
        addedMinutes += 0.5;
        break;

      case "RED_CARD":
      case "SECOND_YELLOW_CARD":
        addedMinutes += 0.5;
        break;

      case "PENALTY_AWARDED":
        addedMinutes += 0.5;
        break;

      case "GOAL":
        addedMinutes += 0.5;
        break;

      default:
        break;
    }
  }

  return Math.max(
    1,
    Math.min(8, Math.round(addedMinutes)),
  );
}