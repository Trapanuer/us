import { Router } from "express";
import { db } from "../firebase.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

const PHRASES = {
  gentle: [
    "думаю о тебе",
    "ты сегодня снишься мне",
    "хочу обнять",
    "скучаю по твоему голосу",
  ],
  medium: [
    "скучаю",
    "очень скучаю",
    "жду нашу встречу",
    "обнимаю тебя в мыслях",
  ],
  intense: [
    "очень скучаю, срочно нужны объятия",
    "без тебя тоскливо",
    "хочу быть рядом прямо сейчас",
    "нужна твоя улыбка",
  ],
};

const EMOJIS = {
  gentle: ["💭", "🌸", "✨", "🤍"],
  medium: ["❤️", "🫂", "💕", "💗"],
  intense: ["🔥", "💔", "😭", "🥺"],
};

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function sendTelegramMessage(userId, text) {
  const token = process.env.BOT_TOKEN;
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: userId,
        text: text,
        parse_mode: "HTML",
      }),
    });
  } catch (e) {
    console.error("Failed to send Telegram message:", e);
  }
}

// Send "miss you" message
router.post("/send", authMiddleware, async (req, res) => {
  try {
    const { intensity } = req.body;
    if (!["gentle", "medium", "intense"].includes(intensity)) {
      return res.status(400).json({ error: "Invalid intensity" });
    }

    const fromUser = req.userId;
    const toUser = fromUser === process.env.USER_A_ID
      ? process.env.USER_B_ID
      : process.env.USER_A_ID;

    const phrase = randomFrom(PHRASES[intensity]);
    const emoji = randomFrom(EMOJIS[intensity]);

    // Store in Firestore
    await db.collection("missHistory").add({
      from: fromUser,
      to: toUser,
      intensity,
      phrase,
      emoji,
      createdAt: new Date().toISOString(),
    });

    // Update daily stats
    const today = new Date().toISOString().split("T")[0];
    const statsRef = db.collection("missStats").doc(`${fromUser}_${today}`);
    const statsDoc = await statsRef.get();
    const current = statsDoc.exists ? statsDoc.data() : { total: 0, gentle: 0, medium: 0, intense: 0 };
    current.total += 1;
    current[intensity] += 1;
    await statsRef.set(current);

    // Send push notification
    const message = `${emoji} *Твоя вторая половинка пишет:*\n\n"${phrase}"`;
    await sendTelegramMessage(toUser, message);

    res.json({ ok: true, phrase, emoji });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Get stats
router.get("/stats", authMiddleware, async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    const todayDoc = await db.collection("missStats").doc(`${req.userId}_${today}`).get();

    // Get weekly total
    const weekSnapshot = await db.collection("missStats")
      .where("from", "==", req.userId)
      .get()
      .catch(() => null);

    let weekTotal = 0;
    if (weekSnapshot && !weekSnapshot.empty) {
      weekSnapshot.forEach((doc) => {
        const data = doc.data();
        weekTotal += data.total || 0;
      });
    }

    res.json({
      today: todayDoc.exists ? todayDoc.data() : { total: 0, gentle: 0, medium: 0, intense: 0 },
      weekTotal,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
