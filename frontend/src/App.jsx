import { useState, useEffect } from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage.jsx";
import MomentsPage from "./pages/MomentsPage.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export default function App() {
  const [user, setUser] = useState({ id: "test", first_name: "Тест" });

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
