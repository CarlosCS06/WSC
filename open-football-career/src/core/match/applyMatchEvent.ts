import type { MatchEvent } from "../../domain/matchEvent";
import type { MatchPlayerState } from "../../domain/matchPlayerState";

export interface ApplyMatchEventResult {
  playerStates: MatchPlayerState[];
  convertedEvent: MatchEvent;
}

export function applyMatchEvent(
  playerStates: MatchPlayerState[],
  event: MatchEvent,
): ApplyMatchEventResult {
  let convertedEvent = event;

  const updatedStates = playerStates.map((playerState) => {
    if (playerState.playerId !== event.playerId) {
      return playerState;
    }

    if (event.type === "YELLOW_CARD") {
      const yellowCards = playerState.yellowCards + 1;

      if (yellowCards >= 2) {
        convertedEvent = {
          ...event,
          type: "SECOND_YELLOW_CARD",
          description: `${event.description} Segunda amarilla y expulsión.`,
        };

        return {
          ...playerState,
          yellowCards,
          sentOff: true,
          isOnPitch: false,
        };
      }

      return {
        ...playerState,
        yellowCards,
      };
    }

    if (event.type === "RED_CARD") {
      return {
        ...playerState,
        sentOff: true,
        isOnPitch: false,
      };
    }

    if (event.type === "INJURY") {
      return {
        ...playerState,
        injured: true,
      };
    }

    if (event.type === "SUBSTITUTION") {
      return {
        ...playerState,
        isOnPitch: false,
        substitutedOut: true,
      };
    }

    return playerState;
  });

  if (
    convertedEvent.type === "SUBSTITUTION" &&
    convertedEvent.secondaryPlayerId
  ) {
    return {
      convertedEvent,
      playerStates: updatedStates.map((playerState) =>
        playerState.playerId === convertedEvent.secondaryPlayerId
          ? {
              ...playerState,
              isAvailable: false,
              isOnPitch: true,
              substitutedIn: true,
            }
          : playerState,
      ),
    };
  }

  return {
    playerStates: updatedStates,
    convertedEvent,
  };
}