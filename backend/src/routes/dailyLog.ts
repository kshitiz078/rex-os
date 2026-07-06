import { Router } from "express";
import prisma from "../db";

const router = Router();

// GET /api/daily-log
router.get("/", async (_req, res) => {
  const logs = await prisma.dailyLog.findMany({ orderBy: { date: "desc" } });
  res.json(logs);
});

// POST /api/daily-log
router.post("/", async (req, res) => {
  const { date, category, task, output, timeSpent, status, notes, nextAction } = req.body;
  const log = await prisma.dailyLog.create({
    data: { date, category, task, output, timeSpent: Number(timeSpent) || 0, status: status || "In Progress", notes: notes || "", nextAction: nextAction || "" },
  });
  res.status(201).json(log);
});

// PUT /api/daily-log/:id
router.put("/:id", async (req, res) => {
  const { date, category, task, output, timeSpent, status, notes, nextAction } = req.body;
  const log = await prisma.dailyLog.update({
    where: { id: Number(req.params.id) },
    data: { date, category, task, output, timeSpent: Number(timeSpent), status, notes, nextAction },
  });
  res.json(log);
});

// DELETE /api/daily-log/:id
router.delete("/:id", async (req, res) => {
  await prisma.dailyLog.delete({ where: { id: Number(req.params.id) } });
  res.json({ success: true });
});

export default router;
