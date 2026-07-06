import "dotenv/config";
import express from "express";
import cors from "cors";

import dashboardRouter from "./routes/dashboard";
import beatsRouter from "./routes/beats";
import projectsRouter from "./routes/projects";
import publishingRouter from "./routes/publishing";
import goalsRouter from "./routes/goals";
import actionItemsRouter from "./routes/actionItems";
import missionControlRouter from "./routes/missionControl";
import weeklyReviewRouter from "./routes/weeklyReview";
import activityLogRouter from "./routes/activityLog";
import dailyLogRouter from "./routes/dailyLog";
import knowledgeRouter from "./routes/knowledge";
import assetsRouter from "./routes/assets";
import notificationsRouter from "./routes/notifications";
import calendarRouter from "./routes/calendar";
import settingsRouter from "./routes/settings";

const app = express();
const PORT = process.env.PORT || 5001;

// ── Middleware ──────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());

// ── Health check ────────────────────────────────────────────
app.get("/api/status", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString(), service: "REX OS API" });
});

// ── Routes ──────────────────────────────────────────────────
app.use("/api/dashboard", dashboardRouter);
app.use("/api/beats", beatsRouter);
app.use("/api/projects", projectsRouter);
app.use("/api/publishing", publishingRouter);
app.use("/api/goals", goalsRouter);
app.use("/api/action-items", actionItemsRouter);
app.use("/api/mission-control", missionControlRouter);
app.use("/api/weekly-review", weeklyReviewRouter);
app.use("/api/activity-log", activityLogRouter);
app.use("/api/daily-log", dailyLogRouter);
app.use("/api/knowledge", knowledgeRouter);
app.use("/api/assets", assetsRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api/calendar", calendarRouter);
app.use("/api/settings", settingsRouter);

// ── 404 catch-all ───────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ── Global error handler ────────────────────────────────────
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("❌ Unhandled error:", err.message);
  res.status(500).json({ error: "Internal server error", message: err.message });
});

// ── Start ───────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 REX OS API running on http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/status`);
  console.log(`   Beats:  http://localhost:${PORT}/api/beats\n`);
});

export default app;
