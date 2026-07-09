import { useState, useEffect } from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage.jsx";
import MomentsPage from "./pages/MomentsPage.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

function getTG() {
  try {
    return window.Telegram?.WebApp || null;
  } catch (e) {
    return null;
  }
}

export default function App() {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const tg = getTG();
    if (tg) {
      try {
        tg.ready();
        tg.expand();
      } catch (e) {}
      const u = tg.initDataUnsafe?.user;
      if (u) setUser(u);
    }
    setReady(true);
  }, []);

  if (!ready) return <div className="loading"><div className="loading-heart">🤍</div></div>;

  if (!user) {
    return (
      <div className="loading">
        <p>Откройте это приложение через Telegram</p>
        <p style={{fontSize:12, marginTop:8, opacity:0.5}}>Debug: Telegram={!!getTG()}, user={JSON.stringify(getTG()?.initDataUnsafe?.user)}</p>
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
