import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { apiFetch } from "../utils/api.js";

export default function MomentsPage({ user, apiUrl }) {
  const location = useLocation();
  const [moments, setMoments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newText, setNewText] = useState("");
  const [photoPreview, setPhotoPreview] = useState(null);
  const [selectedSticker, setSelectedSticker] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [stickers, setStickers] = useState([]);

  useEffect(() => {
    apiFetch(apiUrl, "/api/stickers")
      .then((data) => setStickers(data.stickers || []))
      .catch(() => {});
  }, [apiUrl]);

  const fetchMoments = async () => {
    try {
      const data = await apiFetch(apiUrl, "/api/moments");
      setMoments(Array.isArray(data) ? data : []);
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
    if (!newText.trim() && !photoPreview && selectedSticker === null) return;
    if (submitting) return;
    setSubmitting(true);

    try {
      const stickerText = selectedSticker !== null ? `[sticker:${selectedSticker}]` : "";
      const text = `${stickerText} ${newText}`.trim();
      await apiFetch(apiUrl, "/api/moments", {
        method: "POST",
        body: JSON.stringify({
          text: text || null,
          photoBase64: photoPreview,
        }),
      });
      setNewText("");
      setPhotoPreview(null);
      setSelectedSticker(null);
      setShowAdd(false);
      fetchMoments();
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
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

  const grouped = (moments || []).reduce((acc, m) => {
    const day = m.createdAt?.split("T")[0];
    if (!acc[day]) acc[day] = [];
    acc[day].push(m);
    return acc;
  }, {});

  const renderStickerText = (text) => {
    if (!text) return null;
    const parts = text.split(/(\[sticker:\d+\])/g);
    return parts.map((part, i) => {
      const match = part.match(/\[sticker:(\d+)\]/);
      if (match) {
        const idx = parseInt(match[1]);
        return (
          <img
            key={i}
            src={`${apiUrl}/api/stickers/image/${idx}`}
            alt="sticker"
            className="moment-sticker"
          />
        );
      }
      return <span key={i}>{part}</span>;
    });
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
                  {m.text && <div className="moment-text">{renderStickerText(m.text)}</div>}
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

            {stickers.length > 0 && (
              <div className="sticker-row">
                <div className="sticker-grid">
                  {stickers.map((s, i) => (
                    <button
                      key={i}
                      className={`sticker-btn ${selectedSticker === i ? "sticker-btn-active" : ""}`}
                      onClick={() => setSelectedSticker(selectedSticker === i ? null : i)}
                    >
                      <img
                        src={`${apiUrl}/api/stickers/image/${i}`}
                        alt={s.emoji}
                        className="sticker-img"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

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
              <button className="btn-confirm" onClick={handleSubmit} disabled={submitting}>
                {submitting ? "..." : "Отправить"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
