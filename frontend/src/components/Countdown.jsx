import { useState, useEffect } from "react";

export default function Countdown({ apiUrl }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchCountdown = () => {
      fetch(`${apiUrl}/api/countdown`, {
        headers: { "X-Telegram-Init-Data": window.Telegram?.WebApp?.initData || "" },
      })
        .then((r) => r.json())
        .then(setData)
        .catch(() => {});
    };

    fetchCountdown();
    const interval = setInterval(fetchCountdown, 60000); // refresh every minute
    return () => clearInterval(interval);
  }, [apiUrl]);

  if (!data || !data.meetingDate) {
    return (
      <div className="card">
        <div className="card-title">До встречи</div>
        <div className="empty-state">
          <div className="empty-state-emoji">📅</div>
          <p>Дата встречи не задана</p>
          <p style={{ fontSize: 13, marginTop: 8, color: "var(--text-muted)" }}>
            Зайдите в настройки, чтобы указать дату
          </p>
        </div>
      </div>
    );
  }

  const meetingDate = new Date(data.meetingDate);
  const formattedDate = meetingDate.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="card">
      <div className="card-title">До встречи</div>
      <div className="countdown-container">
        <div className="countdown-number">{data.daysLeft}</div>
        <div className="countdown-label">
          {data.daysLeft === 1 ? "день" : data.daysLeft < 5 ? "дня" : "дней"}
        </div>
        <div className="countdown-progress">
          <div
            className="countdown-progress-bar"
            style={{ width: `${data.progress}%` }}
          />
        </div>
        <div className="countdown-date-info">{formattedDate}</div>
      </div>
    </div>
  );
}
