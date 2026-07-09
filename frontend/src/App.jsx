import { useState, useEffect } from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage.jsx";
import MomentsPage from "./pages/MomentsPage.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export default function App() {
  const [user, setUser] = useState(null);
  const [debug, setDebug] = useState("starting");

  useEffect(() => {
    try {
      const tg = window.Telegram?.WebApp;
      if (!tg) {
        setDebug("no Telegram WebApp found");
        return;
      }
      setDebug("Telegram found, ready=" + tg.initDataUnsafe?.user?.id);
      tg.ready();
      tg.expand();
      setUser(tg.initDataUnsafe?.user || null);
      setDebug("user=" + JSON.stringify(tg.initDataUnsafe?.user));
    } catch (e) {
      setDebug("error: " + e.message);
    }
  }, []);

  if (debug.includes("error") || debug.includes("no Telegram")) {
    return (
      <div style={{ padding: 20, fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
        Debug: {debug}
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ padding: 20, fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
        Debug: {debug}
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
