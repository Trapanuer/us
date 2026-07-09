import { Router } from "express";
import { db } from "../firebase.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

// Create moment (with optional replyTo)
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { text, photoBase64, voiceText, replyTo } = req.body;

    if (!text && !photoBase64 && !voiceText) {
      return res.status(400).json({ error: "Empty moment" });
    }

    const moment = {
      author: req.userId,
      text: text || "",
      photoUrl: photoBase64 || null,
      voiceText: voiceText || null,
      replyTo: replyTo || null,
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
    const snapshot = await db.collection("moments")
      .orderBy("createdAt", "desc")
      .limit(200)
      .get();

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
