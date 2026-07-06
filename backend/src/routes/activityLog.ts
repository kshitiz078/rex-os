import { Router } from "express";
import prisma from "../db";

const router = Router();

// GET /api/activity-log
router.get("/", async (_req, res) => {
  const logs = await prisma.activityLog.findMany({ orderBy: { timestamp: "desc" }, take: 50 });
  res.json(logs);
});

// POST /api/activity-log
router.post("/", async (req, res) => {
  const { type, title, description, icon, color } = req.body;
  const log = await prisma.activityLog.create({
    data: { type, title, description, icon: icon || "check", color: color || "text-emerald-500 bg-emerald-500/10", timestamp: new Date().toISOString() },
  });
  res.status(201).json(log);
});

export default router;
