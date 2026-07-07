import { useState, useEffect } from "react";

export default function MissButton({ apiUrl, partnerName }) {
  const [sent, setSent] = useState(null);
  const [stats, setStats] = useState(null);

  const fetchStats = () => {
    fetch(`${apiUrl}/api/miss/stats`, {
      headers: { "X-Telegram-Init-Data": window.Telegram?.WebApp?.initData || "" },
    })
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleSend = async (intensity) => {
    try {
      const res = await fetch(`${apiUrl}/api/miss/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Telegram-Init-Data": window.Telegram?.WebApp?.initData || "",
        },
        body: JSON.stringify({ intensity }),
      });
      const data = await res.json();
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
