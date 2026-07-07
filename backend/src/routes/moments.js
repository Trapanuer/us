import { Router } from "express";
import { db } from "../firebase.js";
import { authMiddleware } from "../middleware/auth.js";
import multer from "multer";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// Upload photo (base64) and create moment
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { text, photoBase64, voiceText } = req.body;

    if (!text && !photoBase64 && !voiceText) {
      return res.status(400).json({ error: "Empty moment" });
    }

    const moment = {
      author: req.userId,
      text: text || "",
      photoUrl: photoBase64 || null,
      voiceText: voiceText || null,
      createdAt: new Date().toISOString(),
    };

    const docRef = await db.collection("moments").add(moment);

    res.json({ ok: true, id: docRef.id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Get moments (all, ordered by date)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const snapshot = await db.collection("moments")
      .orderBy("createdAt", "desc")
      .limit(100)
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
