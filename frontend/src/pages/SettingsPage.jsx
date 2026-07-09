import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { apiFetch } from "../utils/api.js";

export default function SettingsPage({ user, apiUrl }) {
  const location = useLocation();
  const [meetingDate, setMeetingDate] = useState("");
  const [nameA, setNameA] = useState("");
  const [nameB, setNameB] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    apiFetch(apiUrl, "/api/settings")
      .then((data) => {
        if (data.meetingDate) setMeetingDate(data.meetingDate.split("T")[0]);
        if (data.names) {
          setNameA(data.names.A || "");
          setNameB(data.names.B || "");
        }
      })
      .catch(() => {});
  }, [apiUrl]);

  const handleSave = async () => {
    try {
      await apiFetch(apiUrl, "/api/settings", {
        method: "PUT",
        body: JSON.stringify({
          meetingDate: meetingDate ? new Date(meetingDate).toISOString() : null,
          names: { A: nameA, B: nameB },
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

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

      <div className="card">
        <div className="card-title">Настройки</div>

        <div className="setting-group">
          <div className="setting-label">Дата встречи</div>
          <input
            type="date"
            className="setting-input"
            value={meetingDate}
            onChange={(e) => setMeetingDate(e.target.value)}
          />
        </div>

        <div className="setting-group">
          <div className="setting-label">Имя первого</div>
          <input
            type="text"
            className="setting-input"
            placeholder="Имя..."
            value={nameA}
            onChange={(e) => setNameA(e.target.value)}
          />
        </div>

        <div className="setting-group">
          <div className="setting-label">Имя второго</div>
          <input
            type="text"
            className="setting-input"
            placeholder="Имя..."
            value={nameB}
            onChange={(e) => setNameB(e.target.value)}
          />
        </div>

        <button className="btn-save" onClick={handleSave}>
          {saved ? "✓ Сохранено!" : "Сохранить"}
        </button>
      </div>
    </div>
  );
}
