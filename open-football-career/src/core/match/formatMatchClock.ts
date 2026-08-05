import type { MatchClockState } from "../../domain/matchClock";

export function formatMatchClock(
  clock: MatchClockState,
): string {
  const totalSeconds = Math.floor(clock.elapsedSeconds);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (
    clock.period === "FIRST_HALF" &&
    minutes >= 45
  ) {
    const addedMinute = Math.floor(
      (totalSeconds - 45 * 60) / 60,
    );

    return `45+${Math.max(1, addedMinute + 1)}'`;
  }

  if (
    clock.period === "SECOND_HALF" &&
    minutes >= 90
  ) {
    const addedMinute = Math.floor(
      (totalSeconds - 90 * 60) / 60,
    );

    return `90+${Math.max(1, addedMinute + 1)}'`;
  }

  return `${minutes}:${seconds
    .toString()
    .padStart(2, "0")}`;
}