import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import MissionControl from "./pages/MissionControl";
import Projects from "./pages/Projects";
import BeatLibrary from "./pages/BeatLibrary";
import Publishing from "./pages/Publishing";
import ContentCalendar from "./pages/ContentCalendar";
import WeeklyReview from "./pages/WeeklyReview";
import MonthlyReview from "./pages/MonthlyReview";
import Settings from "./pages/Settings";
import DailyLog from "./pages/DailyLog";
import KnowledgeVault from "./pages/KnowledgeVault";
import Assets from "./pages/Assets";
import { AppProvider } from "./context/AppContext";

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="mission-control" element={<MissionControl />} />
            <Route path="projects" element={<Projects />} />
            <Route path="beat-library" element={<BeatLibrary />} />
            <Route path="publishing" element={<Publishing />} />
            <Route path="calendar" element={<ContentCalendar />} />
            <Route path="weekly-review" element={<WeeklyReview />} />
            <Route path="monthly-review" element={<MonthlyReview />} />
            <Route path="daily-log" element={<DailyLog />} />
            <Route path="knowledge-vault" element={<KnowledgeVault />} />
            <Route path="assets" element={<Assets />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
