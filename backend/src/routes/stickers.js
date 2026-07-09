import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

const STICKER_EMOJIS = [
  "❤️", "💕", "💋", "🤗", "🥺", "✨", "🌸", "🔥",
  "🌙", "☀️", "🦋", "🌈", "💫", "🧸", "🎀", "💐",
  "🍓", "🍰", "☕", "🎵", "🫶", "🫂", "😘", "🥰",
];

router.get("/", authMiddleware, async (req, res) => {
  try {
    res.json({ stickers: STICKER_EMOJIS });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
