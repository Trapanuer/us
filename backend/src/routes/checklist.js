import { Router } from "express";
import { db } from "../firebase.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

// Get all checklist items
router.get("/", authMiddleware, async (req, res) => {
  try {
    const snapshot = await db.collection("checklist")
      .orderBy("createdAt", "asc")
      .get();

    const items = [];
    snapshot.forEach((doc) => {
      items.push({ id: doc.id, ...doc.data() });
    });

    res.json(items);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Add item
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: "Empty text" });
    }

    const item = {
      text: text.trim(),
      author: req.userId,
      done: false,
      createdAt: new Date().toISOString(),
    };

    const docRef = await db.collection("checklist").add(item);
    res.json({ ok: true, id: docRef.id, ...item });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Toggle done
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { done } = req.body;
    await db.collection("checklist").doc(req.params.id).update({ done });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Delete item
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    await db.collection("checklist").doc(req.params.id).delete();
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
