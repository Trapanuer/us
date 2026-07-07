import { db } from "../firebase.js";

const USER_A_ID = process.env.USER_A_ID;
const USER_B_ID = process.env.USER_B_ID;

export function authMiddleware(req, res, next) {
  const initData = req.headers["x-telegram-init-data"];

  if (!initData) {
    return res.status(401).json({ error: "Missing Telegram init data" });
  }

  // Parse the init data to get user ID
  const urlParams = new URLSearchParams(initData);
  const userStr = urlParams.get("user");

  if (!userStr) {
    return res.status(401).json({ error: "Invalid init data" });
  }

  try {
    const user = JSON.parse(userStr);
    const telegramId = user.id?.toString();

    if (!telegramId) {
      return res.status(401).json({ error: "No user ID" });
    }

    if (telegramId !== USER_A_ID && telegramId !== USER_B_ID) {
      return res.status(403).json({ error: "Unauthorized user" });
    }

    req.userId = telegramId;
    req.userRole = telegramId === USER_A_ID ? "A" : "B";
    next();
  } catch (e) {
    return res.status(401).json({ error: "Invalid user data" });
  }
}
