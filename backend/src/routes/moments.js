import { Router } from "express";
import { db } from "../firebase.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

const CATEGORIES = [
  { id: "photo", emoji: "📸", name: "Фото дня" },
  { id: "food", emoji: "🍽️", name: "Еда" },
  { id: "funny", emoji: "😂", name: "Весёлое" },
  { id: "plans", emoji: "📝", name: "Планы" },
];

// Get categories list
router.get("/categories", authMiddleware, (req, res) => {
  res.json(CATEGORIES);
});

// Create moment (with optional category and replyTo)
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { text, photoBase64, voiceText, replyTo, category } = req.body;

    if (!text && !photoBase64 && !voiceText) {
      return res.status(400).json({ error: "Empty moment" });
    }

    const moment = {
      author: req.userId,
      text: text || "",
      photoUrl: photoBase64 || null,
      voiceText: voiceText || null,
      replyTo: replyTo || null,
      category: category || null,
      createdAt: new Date().toISOString(),
    };

    const docRef = await db.collection("moments").add(moment);

    res.json({ ok: true, id: docRef.id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Get all moments (ordered by date)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const { category } = req.query;
    let query = db.collection("moments").orderBy("createdAt", "desc");

    if (category) {
      query = query.where("category", "==", category);
    }

    const snapshot = await query.limit(200).get();

    const moments = [];
    snapshot.forEach((doc) => {
      moments.push({ id: doc.id, ...doc.data() });
    });

    res.json(moments);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
