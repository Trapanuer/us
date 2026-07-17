import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { apiFetch } from "../utils/api.js";

const CATEGORIES = [
  { id: null, emoji: "🌐", name: "Все" },
  { id: "photo", emoji: "📸", name: "Фото дня" },
  { id: "food", emoji: "🍽️", name: "Еда" },
  { id: "funny", emoji: "😂", name: "Весёлое" },
  { id: "plans", emoji: "📝", name: "Планы" },
];

export default function MomentsPage({ user, apiUrl }) {
  const location = useLocation();
  const [moments, setMoments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newText, setNewText] = useState("");
  const [photoPreview, setPhotoPreview] = useState(null);
  const [selectedSticker, setSelectedSticker] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [stickerPacks, setStickerPacks] = useState([]);
  const [activePack, setActivePack] = useState(0);
  const [replyTo, setReplyTo] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [filterCategory, setFilterCategory] = useState(null);

  useEffect(() => {
    apiFetch(apiUrl, "/api/stickers")
      .then((data) => setStickerPacks(data.packs || []))
      .catch(() => {});
  }, [apiUrl]);

  const fetchMoments = async () => {
    try {
      const url = filterCategory
        ? `/api/moments?category=${filterCategory}`
        : "/api/moments";
      const data = await apiFetch(apiUrl, url);
      setMoments(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMoments();
  }, [filterCategory]);

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
          replyTo: replyTo,
          category: selectedCategory,
        }),
      });
      setNewText("");
      setPhotoPreview(null);
      setSelectedSticker(null);
      setSelectedCategory(null);
      setReplyTo(null);
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

  const handleReply = (momentId) => {
    setReplyTo(momentId);
    setShowAdd(true);
  };

  const replyToMoment = replyTo ? moments.find((m) => m.id === replyTo) : null;

  const getCategoryById = (id) => CATEGORIES.find((c) => c.id === id);

  const topLevel = moments.filter((m) => !m.replyTo);
  const repliesMap = {};
  moments.forEach((m) => {
    if (m.replyTo) {
      if (!repliesMap[m.replyTo]) repliesMap[m.replyTo] = [];
      repliesMap[m.replyTo].push(m);
    }
  });

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

      <div className="category-tabs">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id || "all"}
            className={`category-tab ${filterCategory === cat.id ? "category-tab-active" : ""}`}
            onClick={() => setFilterCategory(cat.id)}
          >
            {cat.emoji} {cat.name}
          </button>
        ))}
      </div>

      <div className="card">
        <div className="card-title">Лента моментов</div>

        <button className="add-moment-btn" onClick={() => { setReplyTo(null); setShowAdd(true); }}>
          + Добавить момент
        </button>

        {loading ? (
          <div className="empty-state">Загрузка...</div>
        ) : topLevel.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-emoji">📷</div>
            <p>Пока нет моментов</p>
            <p>Добавьте первый!</p>
          </div>
        ) : (
          Object.entries(
            topLevel.reduce((acc, m) => {
              const day = m.createdAt?.split("T")[0];
              if (!acc[day]) acc[day] = [];
              acc[day].push(m);
              return acc;
            }, {})
          ).map(([day, items]) => (
            <div key={day}>
              <div className="day-divider">{formatDate(items[0].createdAt)}</div>
              {items.map((m) => {
                const cat = getCategoryById(m.category);
                return (
                <div key={m.id}>
                  <div className="moment-card">
                    <div className="moment-header">
                      <div className="moment-avatar">
                        {m.author === user.id?.toString() ? "👤" : "💕"}
                      </div>
                      <span className="moment-author">
                        {m.author === user.id?.toString() ? "Я" : "Партнёр"}
                      </span>
                      {cat && (
                        <span className="moment-category-badge">
                          {cat.emoji} {cat.name}
                        </span>
                      )}
                      <span className="moment-time">{formatTime(m.createdAt)}</span>
                    </div>
                    {m.text && <div className="moment-text">{renderStickerText(m.text)}</div>}
                    {m.photoUrl && (
                      <img src={m.photoUrl} alt="" className="moment-photo" />
                    )}
                    <div className="moment-actions">
                      <button className="moment-reply-btn" onClick={() => handleReply(m.id)}>
                        💬 Ответить
                      </button>
                    </div>
                  </div>

                  {repliesMap[m.id] && repliesMap[m.id].map((reply) => (
                    <div key={reply.id} className="moment-card moment-reply">
                      <div className="moment-header">
                        <div className="moment-avatar moment-avatar-small">
                          {reply.author === user.id?.toString() ? "👤" : "💕"}
                        </div>
                        <span className="moment-author">
                          {reply.author === user.id?.toString() ? "Я" : "Партнёр"}
                        </span>
                        <span className="moment-time">{formatTime(reply.createdAt)}</span>
                      </div>
                      {reply.text && <div className="moment-text">{renderStickerText(reply.text)}</div>}
                      {reply.photoUrl && (
                        <img src={reply.photoUrl} alt="" className="moment-photo" />
                      )}
                    </div>
                  ))}
                </div>
                );
              })}
            </div>
          ))
        )}
      </div>

      {showAdd && (
        <div className="modal-overlay" onClick={() => { setShowAdd(false); setReplyTo(null); }}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">
              {replyToMoment ? "Ответ на момент" : "Новый момент"}
            </div>

            {replyToMoment && (
              <div className="reply-preview">
                <div className="reply-preview-author">
                  {replyToMoment.author === user.id?.toString() ? "Я" : "Партнёр"}:
                </div>
                <div className="reply-preview-text">
                  {replyToMoment.text?.substring(0, 80)}
                  {(replyToMoment.text?.length || 0) > 80 ? "..." : ""}
                </div>
              </div>
            )}

            {!replyToMoment && (
              <div className="category-picker">
                <span className="card-title" style={{marginBottom: 0}}>Категория</span>
                <div className="category-picker-grid">
                  {CATEGORIES.filter((c) => c.id !== null).map((cat) => (
                    <button
                      key={cat.id}
                      className={`category-picker-btn ${selectedCategory === cat.id ? "category-picker-btn-active" : ""}`}
                      onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                    >
                      {cat.emoji} {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {stickerPacks.length > 0 && (
              <div className="sticker-row">
                {stickerPacks.length > 1 && (
                  <div className="sticker-pack-tabs">
                    {stickerPacks.map((pack, i) => (
                      <button
                        key={i}
                        className={`sticker-pack-tab ${activePack === i ? "sticker-pack-tab-active" : ""}`}
                        onClick={() => setActivePack(i)}
                      >
                        {pack.label}
                      </button>
                    ))}
                  </div>
                )}
                <div className="sticker-grid">
                  {(stickerPacks[activePack]?.stickers || []).map((s) => (
                    <button
                      key={s.index}
                      className={`sticker-btn ${selectedSticker === s.index ? "sticker-btn-active" : ""}`}
                      onClick={() => setSelectedSticker(selectedSticker === s.index ? null : s.index)}
                    >
                      <img
                        src={`${apiUrl}/api/stickers/image/${s.index}`}
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
              <button className="btn-cancel" onClick={() => { setShowAdd(false); setReplyTo(null); }}>
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
