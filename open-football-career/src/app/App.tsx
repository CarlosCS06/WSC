import { useState } from "react";

import { CareerPage } from "../features/career/CareerPage";
import { NewCareerPage } from "../features/career/NewCareerPage";
import { MainMenuPage } from "../features/menu/MainMenuPage";
import { MatchPage } from "../features/match/MatchPage";
import { useCareerStore } from "../store/careerStore";
import { selectAutomaticLineup } from "../core/lineup/selectAutomaticLineup";

type AppPage =
  | "MENU"
  | "NEW_CAREER"
  | "CAREER"
  | "MATCH";

function App() {
  const [page, setPage] = useState<AppPage>("MENU");

  const {
    currentMatchday,
    managedClubId,
    clubs,
    fixtures,
    players,
    playManagedMatch,
    simulateCurrentMatchday,
  } = useCareerStore();

  const managedFixture = fixtures.find(
    (fixture) =>
      fixture.matchday === currentMatchday &&
      (fixture.homeClubId === managedClubId ||
        fixture.awayClubId === managedClubId),
  );

  const homeLineup = homeClub
    ? selectAutomaticLineup(homeClub.id, players)
    : null;

  const awayLineup = awayClub
    ? selectAutomaticLineup(awayClub.id, players)
    : null;

  if (page === "NEW_CAREER") {
    return (
      <NewCareerPage
        onBack={() => setPage("MENU")}
        onCareerStarted={() => setPage("CAREER")}
      />
    );
  }

  if (
    page === "MATCH" &&
    managedFixture &&
    homeClub &&
    awayClub &&
    homeLineup &&
    awayLineup &&
    managedClubId
  ) {
    return (
      <MatchPage
        fixture={managedFixture}
        homeClub={homeClub}
        awayClub={awayClub}
        homeLineup={homeLineup}
        awayLineup={awayLineup}
        managedClubId={managedClubId}
        onBack={() => setPage("CAREER")}
        onFinish={(result) => {
          playManagedMatch({
            fixtureId: result.fixtureId,
            homeGoals: result.homeGoals,
            awayGoals: result.awayGoals,
          });

          simulateCurrentMatchday();
          setPage("CAREER");
        }}
      />
    );
  }

  if (page === "CAREER") {
    return (
      <CareerPage
        onExit={() => setPage("MENU")}
        onPlayMatch={() => setPage("MATCH")}
      />
    );
  }

  return (
    <MainMenuPage
      onNewCareer={() => setPage("NEW_CAREER")}
    />
  );
}

export default App;