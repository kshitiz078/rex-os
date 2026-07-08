import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
import LoginPage from "./pages/LoginPage";
import { AppProvider } from "./context/AppContext";
import { getToken, verifyToken, clearToken } from "./services/api";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null); // null = loading

  // On mount: check if there's a valid stored token
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setIsAuthenticated(false);
      return;
    }
    verifyToken(token).then(res => {
      if (res && (res as any).valid) {
        setIsAuthenticated(true);
      } else {
        clearToken();
        setIsAuthenticated(false);
      }
    });
  }, []);

  const handleLogin = () => setIsAuthenticated(true);

  const handleLogout = () => {
    clearToken();
    setIsAuthenticated(false);
  };

  // While verifying the token, show nothing (avoids flash of login screen)
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <BrowserRouter>
      {!isAuthenticated ? (
        <Routes>
          <Route path="*" element={<LoginPage onLogin={handleLogin} />} />
        </Routes>
      ) : (
        <AppProvider>
          <Routes>
            <Route path="/login" element={<Navigate to="/" replace />} />
            <Route path="/" element={<Layout onLogout={handleLogout} />}>
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
        </AppProvider>
      )}
    </BrowserRouter>
  );
}

export default App;
