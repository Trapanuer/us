import { useState, useEffect, Component } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage.jsx";
import MomentsPage from "./pages/MomentsPage.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

function getTelegramUser() {
  try {
    if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
      return window.Telegram.WebApp.initDataUnsafe.user;
    }
  } catch (e) {}

  try {
    const hash = window.location.hash || "";
    const match = hash.match(/tgWebAppData=([^&]*)/);
    if (match) {
      const decoded = decodeURIComponent(match[1]);
      const params = new URLSearchParams(decoded);
      const userStr = params.get("user");
      if (userStr) {
        return JSON.parse(userStr);
      }
    }
  } catch (e) {}
  return null;
}

class ErrorBoundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 20, fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
          Error: {this.state.error.message}
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const tgUser = getTelegramUser();
    setUser(tgUser);
    setReady(true);
    try {
      window.Telegram?.WebApp?.ready();
      window.Telegram?.WebApp?.expand();
    } catch (e) {}
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
    <ErrorBoundary>
      <BrowserRouter>
        <div className="app">
          <Routes>
            <Route path="/" element={<HomePage user={user} apiUrl={API_URL} />} />
            <Route path="/moments" element={<MomentsPage user={user} apiUrl={API_URL} />} />
            <Route path="/settings" element={<SettingsPage user={user} apiUrl={API_URL} />} />
          </Routes>
        </div>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
