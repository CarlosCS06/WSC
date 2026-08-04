import { useState } from "react";

import { CareerPage } from "../features/career/CareerPage";
import { NewCareerPage } from "../features/career/NewCareerPage";
import { MainMenuPage } from "../features/menu/MainMenuPage";

type AppPage = "MENU" | "NEW_CAREER" | "CAREER";

function App() {
  const [page, setPage] = useState<AppPage>("MENU");

  if (page === "NEW_CAREER") {
    return (
      <NewCareerPage
        onBack={() => setPage("MENU")}
        onCareerStarted={() => setPage("CAREER")}
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