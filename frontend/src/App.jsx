import { useState, useEffect } from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage.jsx";
import MomentsPage from "./pages/MomentsPage.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

function parseInitData() {
  try {
    const hash = window.location.hash || "";
    const match = hash.match(/tgWebAppData=([^&]*)/);
    if (match) {
      const decoded = decodeURIComponent(match[1]);
      const data = JSON.parse(decoded);
      return data.user || null;
    }
  } catch (e) {}
  return null;
}

function getTGUser() {
  try {
    if (window.Telegram && window.Telegram.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      const u = tg.initDataUnsafe?.user;
      if (u) return u;
    }
  } catch (e) {}
  return parseInitData();
}

export default function App() {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setUser(getTGUser());
    setReady(true);
  }, []);

  if (!ready) return <div className="loading"><div className="loading-heart">🤍</div></div>;

  if (!user) {
    return (
      <div className="loading">
        <p>Откройте это приложение через Telegram</p>
        <p style={{fontSize:11, marginTop:12, opacity:0.4, wordBreak:'break-all'}}>
          hash: {window.location.hash || '(пусто)'}<br/>
          Telegram: {typeof window.Telegram}
        </p>
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
