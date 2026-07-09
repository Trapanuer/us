import { useState, useEffect } from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage.jsx";
import MomentsPage from "./pages/MomentsPage.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

function getTelegramUser() {
  try {
    if (window.Telegram && window.Telegram.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      return tg.initDataUnsafe?.user || null;
    }
  } catch (e) {
    console.error("Telegram SDK error:", e);
  }
  return null;
}

export default function App() {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const tgUser = getTelegramUser();
    setUser(tgUser);
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <div className="loading">
        <div className="loading-heart">🤍</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="loading">
        <p>Откройте это приложение через Telegram</p>
      </div>
    );
  }

  return (
    <HashRouter>
      <div className="app">
        <Routes>
          <Route path="/" element={<HomePage user={user} apiUrl={API_URL} />} />
          <Route path="/moments" element={<MomentsPage user={user} apiUrl={API_URL} />} />
          <Route path="/settings" element={<SettingsPage user={user} apiUrl={API_URL} />} />
        </Routes>
      </div>
    </HashRouter>
  );
}
