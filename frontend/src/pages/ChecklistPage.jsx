import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { apiFetch } from "../utils/api.js";

export default function ChecklistPage({ user, apiUrl }) {
  const location = useLocation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newText, setNewText] = useState("");
  const [adding, setAdding] = useState(false);

  const fetchItems = async () => {
    try {
      const data = await apiFetch(apiUrl, "/api/checklist");
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleAdd = async () => {
    if (!newText.trim() || adding) return;
    setAdding(true);
    try {
      await apiFetch(apiUrl, "/api/checklist", {
        method: "POST",
        body: JSON.stringify({ text: newText }),
      });
      setNewText("");
      fetchItems();
    } catch (e) {
      console.error(e);
    } finally {
      setAdding(false);
    }
  };

  const handleToggle = async (id, currentDone) => {
    try {
      await apiFetch(apiUrl, `/api/checklist/${id}`, {
        method: "PUT",
        body: JSON.stringify({ done: !currentDone }),
      });
      fetchItems();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiFetch(apiUrl, `/api/checklist/${id}`, {
        method: "DELETE",
      });
      fetchItems();
    } catch (e) {
      console.error(e);
    }
  };

  const undone = items.filter((i) => !i.done);
  const done = items.filter((i) => i.done);

  return (
    <div>
      <div className="nav">
        <Link to="/" className={`nav-link ${location.pathname === "/" ? "active" : ""}`}>
          💕 Главная
        </Link>
        <Link to="/moments" className={`nav-link ${location.pathname === "/moments" ? "active" : ""}`}>
          📸 Моменты
        </Link>
        <Link to="/checklist" className={`nav-link ${location.pathname === "/checklist" ? "active" : ""}`}>
          📋 Встреча
        </Link>
        <Link to="/settings" className={`nav-link ${location.pathname === "/settings" ? "active" : ""}`}>
          ⚙️ Настройки
        </Link>
      </div>

      <div className="card">
        <div className="card-title">Когда встретимся</div>

        <div className="checklist-add">
          <input
            type="text"
            className="checklist-input"
            placeholder="Что хотим сделать вместе..."
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <button className="checklist-add-btn" onClick={handleAdd} disabled={adding}>
            {adding ? "..." : "+"}
          </button>
        </div>

        {loading ? (
          <div className="empty-state">Загрузка...</div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-emoji">📋</div>
            <p>Пока пусто</p>
            <p>Добавьте первое желание!</p>
          </div>
        ) : (
          <>
            {undone.length > 0 && (
              <div className="checklist-section">
                <div className="checklist-section-title">Хочу сделать ({undone.length})</div>
                {undone.map((item) => (
                  <div key={item.id} className="checklist-item">
                    <button
                      className="checklist-checkbox"
                      onClick={() => handleToggle(item.id, item.done)}
                    >
                      ○
                    </button>
                    <div className="checklist-item-content">
                      <span className="checklist-item-text">{item.text}</span>
                      <span className="checklist-item-author">
                        {item.author === user.id?.toString() ? "Я" : "Партнёр"}
                      </span>
                    </div>
                    <button
                      className="checklist-delete"
                      onClick={() => handleDelete(item.id)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {done.length > 0 && (
              <div className="checklist-section">
                <div className="checklist-section-title">Сделано! 🎉 ({done.length})</div>
                {done.map((item) => (
                  <div key={item.id} className="checklist-item checklist-item-done">
                    <button
                      className="checklist-checkbox checklist-checkbox-checked"
                      onClick={() => handleToggle(item.id, item.done)}
                    >
                      ●
                    </button>
                    <div className="checklist-item-content">
                      <span className="checklist-item-text">{item.text}</span>
                      <span className="checklist-item-author">
                        {item.author === user.id?.toString() ? "Я" : "Партнёр"}
                      </span>
                    </div>
                    <button
                      className="checklist-delete"
                      onClick={() => handleDelete(item.id)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
