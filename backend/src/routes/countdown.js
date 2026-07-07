import { Router } from "express";
import { db } from "../firebase.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

// Get countdown data
router.get("/", authMiddleware, async (req, res) => {
  try {
    const doc = await db.collection("settings").doc("settings/global").get();
    if (!doc.exists || !doc.data().meetingDate) {
      return res.json({ meetingDate: null, daysLeft: null });
    }

    const meetingDate = new Date(doc.data().meetingDate);
    const now = new Date();
    const diffMs = meetingDate.getTime() - now.getTime();
    const daysLeft = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    const hoursLeft = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60)));
    const totalDays = 30; // approximate total period for progress bar
    const progress = Math.max(0, Math.min(100, ((totalDays - daysLeft) / totalDays) * 100));

    res.json({
      meetingDate: doc.data().meetingDate,
      daysLeft,
      hoursLeft,
      progress,
      daysTotal: totalDays,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
