import { Router } from "express";
import { db } from "../firebase.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();
const SETTINGS_DOC = "settings/global";

// Get settings (meeting date, etc.)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const doc = await db.collection("settings").doc(SETTINGS_DOC).get();
    if (!doc.exists) {
      return res.json({ meetingDate: null, names: { A: "", B: "" } });
    }
    res.json(doc.data());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Update settings (only date and names can be changed)
router.put("/", authMiddleware, async (req, res) => {
  try {
    const { meetingDate, names } = req.body;
    const data = {};

    if (meetingDate !== undefined) data.meetingDate = meetingDate;
    if (names !== undefined) data.names = names;
    data.updatedBy = req.userId;
    data.updatedAt = new Date().toISOString();

    await db.collection("settings").doc(SETTINGS_DOC).set(data, { merge: true });

    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
