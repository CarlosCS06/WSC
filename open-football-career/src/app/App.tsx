import { useState } from "react";

import { CareerPage } from "../features/career/CareerPage";
import { NewCareerPage } from "../features/career/NewCareerPage";
import { MainMenuPage } from "../features/menu/MainMenuPage";
import { MatchPage } from "../features/match/MatchPage";
import { useCareerStore } from "../store/careerStore";

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
    playManagedMatch,
    simulateCurrentMatchday,
  } = useCareerStore();

  const managedFixture = fixtures.find(
    (fixture) =>
      fixture.matchday === currentMatchday &&
      (fixture.homeClubId === managedClubId ||
        fixture.awayClubId === managedClubId),
  );

  const homeClub = clubs.find(
    (club) => club.id === managedFixture?.homeClubId,
  );

  const awayClub = clubs.find(
    (club) => club.id === managedFixture?.awayClubId,
  );

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
    managedClubId
  ) {
    return (
      <MatchPage
        fixture={managedFixture}
        homeClub={homeClub}
        awayClub={awayClub}
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