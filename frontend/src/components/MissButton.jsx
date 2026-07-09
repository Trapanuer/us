import { useState, useEffect } from "react";
import { apiFetch } from "../utils/api.js";

export default function MissButton({ apiUrl, partnerName }) {
  const [sent, setSent] = useState(null);
  const [stats, setStats] = useState(null);

  const fetchStats = () => {
    apiFetch(apiUrl, "/api/miss/stats")
      .then(setStats)
      .catch(() => {});
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleSend = async (intensity) => {
    try {
      const data = await apiFetch(apiUrl, "/api/miss/send", {
        method: "POST",
        body: JSON.stringify({ intensity }),
      });
      setSent(data);
      fetchStats();
      setTimeout(() => setSent(null), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="card">
      <div className="card-title">Скажи {partnerName}...</div>
      <div className="miss-container">
        {sent ? (
          <div className="miss-sent">
            <div style={{ fontSize: 48 }}>{sent.emoji}</div>
            <div className="sent-check">Отправлено! "{sent.phrase}"</div>
          </div>
        ) : (
          <div className="miss-buttons">
            <button
              className="miss-btn miss-btn-gentle"
              onClick={() => handleSend("gentle")}
            >
              💭 Думаю о тебе
            </button>
            <button
              className="miss-btn miss-btn-medium"
              onClick={() => handleSend("medium")}
            >
              ❤️ Скучаю
            </button>
            <button
              className="miss-btn miss-btn-intense"
              onClick={() => handleSend("intense")}
            >
              🫂 Очень скучаю, нужны объятия
            </button>
          </div>
        )}

        {stats && (
          <div className="miss-stats">
            <div className="miss-stat">
              <div className="miss-stat-value">{stats.today?.total || 0}</div>
              <div className="miss-stat-label">Сегодня</div>
            </div>
            <div className="miss-stat">
              <div className="miss-stat-value">{stats.weekTotal || 0}</div>
              <div className="miss-stat-label">За неделю</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
