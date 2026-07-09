import "dotenv/config";
import express from "express";
import cors from "cors";

import settingsRouter from "./routes/settings.js";
import countdownRouter from "./routes/countdown.js";
import missRouter from "./routes/miss.js";
import momentsRouter from "./routes/moments.js";
import stickersRouter from "./routes/stickers.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: "50mb" }));

app.get("/health", (req, res) => res.json({ ok: true }));

app.use("/api/settings", settingsRouter);
app.use("/api/countdown", countdownRouter);
app.use("/api/miss", missRouter);
app.use("/api/moments", momentsRouter);
app.use("/api/stickers", stickersRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
