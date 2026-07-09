import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import Countdown from "../components/Countdown.jsx";
import MissButton from "../components/MissButton.jsx";
import { apiFetch } from "../utils/api.js";

export default function HomePage({ user, apiUrl }) {
  const location = useLocation();
  const [partnerName, setPartnerName] = useState("Партнёр");

  useEffect(() => {
    apiFetch(apiUrl, "/api/settings")
      .then((data) => {
        if (data.names) {
          const myRole = user.id?.toString() === import.meta.env.VITE_USER_A_ID ? "A" : "B";
          const partnerRole = myRole === "A" ? "B" : "A";
          setPartnerName(data.names[partnerRole] || "Партнёр");
        }
      })
      .catch(() => {});
  }, [apiUrl, user]);

  return (
    <div>
      <div className="nav">
        <Link to="/" className={`nav-link ${location.pathname === "/" ? "active" : ""}`}>
          💕 Главная
        </Link>
        <Link to="/moments" className={`nav-link ${location.pathname === "/moments" ? "active" : ""}`}>
          📸 Моменты
        </Link>
        <Link to="/settings" className={`nav-link ${location.pathname === "/settings" ? "active" : ""}`}>
          ⚙️ Настройки
        </Link>
      </div>

      <Countdown apiUrl={apiUrl} />

      <MissButton apiUrl={apiUrl} partnerName={partnerName} />
    </div>
  );
}
