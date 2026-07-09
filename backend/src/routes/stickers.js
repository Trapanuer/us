import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

const BOT_TOKEN = process.env.BOT_TOKEN;
const STICKER_SET_NAME = "Baby_chubby_Hippo";

let cachedStickers = null;
let cacheTime = 0;

async function fetchStickers() {
  const now = Date.now();
  if (cachedStickers && now - cacheTime < 3600000) {
    return cachedStickers;
  }

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/getStickerSet?name=${STICKER_SET_NAME}`
    );
    const data = await res.json();
    if (!data.ok) return [];

    const stickers = [];
    for (const s of data.result.stickers) {
      const fileRes = await fetch(
        `https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${s.file_id}`
      );
      const fileData = await fileRes.json();
      if (fileData.ok) {
        stickers.push({
          emoji: s.emoji,
          file_path: fileData.result.file_path,
        });
      }
    }

    cachedStickers = stickers;
    cacheTime = now;
    return stickers;
  } catch (e) {
    console.error("Failed to fetch stickers:", e);
    return cachedStickers || [];
  }
}

// Get all stickers
router.get("/", authMiddleware, async (req, res) => {
  try {
    const stickers = await fetchStickers();
    res.json({ stickers });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Proxy sticker image (hides bot token from frontend)
router.get("/image/:index", async (req, res) => {
  try {
    const stickers = await fetchStickers();
    const idx = parseInt(req.params.index);
    if (idx < 0 || idx >= stickers.length) {
      return res.status(404).json({ error: "Not found" });
    }

    const fileRes = await fetch(
      `https://api.telegram.org/file/bot${BOT_TOKEN}/${stickers[idx].file_path}`
    );

    if (!fileRes.ok) {
      return res.status(502).json({ error: "Failed to fetch sticker" });
    }

    const contentType = fileRes.headers.get("content-type") || "image/webp";
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=86400");

    const buffer = await fileRes.arrayBuffer();
    res.send(Buffer.from(buffer));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
