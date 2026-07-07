import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

export default function MomentsPage({ user, apiUrl }) {
  const location = useLocation();
  const [moments, setMoments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newText, setNewText] = useState("");
  const [photoPreview, setPhotoPreview] = useState(null);

  const fetchMoments = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/moments`, {
        headers: { "X-Telegram-Init-Data": window.Telegram?.WebApp?.initData || "" },
      });
      const data = await res.json();
      setMoments(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMoments();
  }, []);

  const handleSubmit = async () => {
    if (!newText.trim() && !photoPreview) return;

    try {
      await fetch(`${apiUrl}/api/moments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Telegram-Init-Data": window.Telegram?.WebApp?.initData || "",
        },
        body: JSON.stringify({
          text: newText,
          photoBase64: photoPreview,
        }),
      });
      setNewText("");
      setPhotoPreview(null);
      setShowAdd(false);
      fetchMoments();
    } catch (e) {
      console.error(e);
    }
  };

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const formatDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
  };

  const formatTime = (iso) => {
    const d = new Date(iso);
    return d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  };

  const grouped = moments.reduce((acc, m) => {
    const day = m.createdAt?.split("T")[0];
    if (!acc[day]) acc[day] = [];
    acc[day].push(m);
    return acc;
  }, {});

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
        <div className="card-title">Лента моментов</div>

        <button className="add-moment-btn" onClick={() => setShowAdd(true)}>
          + Добавить момент
        </button>

        {loading ? (
          <div className="empty-state">Загрузка...</div>
        ) : moments.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-emoji">📷</div>
            <p>Пока нет моментов</p>
            <p>Добавьте первый!</p>
          </div>
        ) : (
          Object.entries(grouped).map(([day, items]) => (
            <div key={day}>
              <div className="day-divider">{formatDate(items[0].createdAt)}</div>
              {items.map((m) => (
                <div key={m.id} className="moment-card">
                  <div className="moment-header">
                    <div className="moment-avatar">
                      {m.author === user.id?.toString() ? "👤" : "💕"}
                    </div>
                    <span className="moment-author">
                      {m.author === user.id?.toString() ? "Я" : "Партнёр"}
                    </span>
                    <span className="moment-time">{formatTime(m.createdAt)}</span>
                  </div>
                  {m.text && <div className="moment-text">{m.text}</div>}
                  {m.photoUrl && (
                    <img src={m.photoUrl} alt="" className="moment-photo" />
                  )}
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">Новый момент</div>

            {!photoPreview ? (
              <label className="photo-upload-area">
                📷 Нажмите, чтобы добавить фото
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhoto}
                  style={{ display: "none" }}
                />
              </label>
            ) : (
              <div>
                <img src={photoPreview} className="photo-preview" alt="" />
                <button
                  className="add-moment-btn"
                  onClick={() => setPhotoPreview(null)}
                >
                  Убрать фото
                </button>
              </div>
            )}

            <textarea
              placeholder="Расскажите, что у вас нового..."
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
            />

            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowAdd(false)}>
                Отмена
              </button>
              <button className="btn-confirm" onClick={handleSubmit}>
                Отправить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
