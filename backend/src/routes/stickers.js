import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

const BOT_TOKEN = process.env.BOT_TOKEN;
const STICKER_PACKS = [
  { name: "Baby_chubby_Hippo", label: "Baby Hippo" },
  { name: "baby_hippo_Nyasticks", label: "Nyasticks" },
];

let cachedPackData = null;
let cacheTime = 0;

async function fetchAllStickers() {
  const now = Date.now();
  if (cachedPackData && now - cacheTime < 3600000) {
    return cachedPackData;
  }

  try {
    const packs = [];
    for (const pack of STICKER_PACKS) {
      const res = await fetch(
        `https://api.telegram.org/bot${BOT_TOKEN}/getStickerSet?name=${pack.name}`
      );
      const data = await res.json();
      if (!data.ok) {
        packs.push({ label: pack.label, stickers: [] });
        continue;
      }

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
      packs.push({ label: pack.label, stickers });
    }

    cachedPackData = packs;
    cacheTime = now;
    return packs;
  } catch (e) {
    console.error("Failed to fetch stickers:", e);
    return cachedPackData || [];
  }
}

async function getFlatStickers() {
  const packs = await fetchAllStickers();
  const flat = [];
  packs.forEach((pack, packIdx) => {
    pack.stickers.forEach((s, i) => {
      flat.push({ ...s, packIdx, localIndex: i });
    });
  });
  return flat;
}

// Get all stickers grouped by pack
router.get("/", authMiddleware, async (req, res) => {
  try {
    const packs = await fetchAllStickers();
    let offset = 0;
    const result = packs.map((pack) => {
      const stickers = pack.stickers.map((s, i) => ({
        emoji: s.emoji,
        index: offset + i,
      }));
      offset += pack.stickers.length;
      return { label: pack.label, stickers };
    });
    res.json({ packs: result });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Proxy sticker image (hides bot token from frontend)
router.get("/image/:index", async (req, res) => {
  try {
    const flat = await getFlatStickers();
    const idx = parseInt(req.params.index);
    if (idx < 0 || idx >= flat.length) {
      return res.status(404).json({ error: "Not found" });
    }

    const fileRes = await fetch(
      `https://api.telegram.org/file/bot${BOT_TOKEN}/${flat[idx].file_path}`
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
