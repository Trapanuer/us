import { db } from "../firebase.js";

const USER_A_ID = process.env.USER_A_ID;
const USER_B_ID = process.env.USER_B_ID;

export function authMiddleware(req, res, next) {
  // Method 1: Try Telegram initData (mobile)
  const initData = req.headers["x-telegram-init-data"];
  if (initData) {
    try {
      const urlParams = new URLSearchParams(initData);
      const userStr = urlParams.get("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        const telegramId = user.id?.toString();
        if (telegramId && (telegramId === USER_A_ID || telegramId === USER_B_ID)) {
          req.userId = telegramId;
          req.userRole = telegramId === USER_A_ID ? "A" : "B";
          return next();
        }
      }
    } catch (e) {}
  }

  // Method 2: Direct user ID from header (Desktop fallback)
  const userId = req.headers["x-user-id"];
  if (userId && (userId === USER_A_ID || userId === USER_B_ID)) {
    req.userId = userId;
    req.userRole = userId === USER_A_ID ? "A" : "B";
    return next();
  }

  return res.status(401).json({ error: "Unauthorized" });
}
