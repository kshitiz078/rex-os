import { Router } from "express";
import prisma from "../db";

const router = Router();

const parseArr = (s: string): string[] => {
  try { return JSON.parse(s); } catch { return []; }
};

// GET /api/goals
router.get("/", async (_req, res) => {
  const [annual, quarterly, monthly] = await Promise.all([
    prisma.annualGoal.findMany({ include: { quarterlyGoals: { include: { monthlyGoals: true } } } }),
    prisma.quarterlyGoal.findMany({ include: { monthlyGoals: true } }),
    prisma.monthlyGoal.findMany(),
  ]);
  res.json({ annual, quarterly, monthly });
});

// PATCH /api/goals/monthly/:id/progress
router.patch("/monthly/:id/progress", async (req, res) => {
  const { current } = req.body;
  const goal = await prisma.monthlyGoal.findUnique({ where: { id: Number(req.params.id) } });
  if (!goal) return res.status(404).json({ error: "Goal not found" });
  const progress = Math.round((Number(current) / goal.total) * 100);
  const updated = await prisma.monthlyGoal.update({
    where: { id: Number(req.params.id) },
    data: { current: Number(current), progress },
  });
  res.json(updated);
});

// POST /api/goals/monthly
router.post("/monthly", async (req, res) => {
  const { title, current, total, unit, type, category, quarterlyGoalId } = req.body;
  const progress = Math.round((Number(current) / Number(total)) * 100);
  const goal = await prisma.monthlyGoal.create({
    data: { title, current: Number(current), total: Number(total), unit, type, category, progress, quarterlyGoalId: quarterlyGoalId || null },
  });
  res.status(201).json(goal);
});

// DELETE /api/goals/monthly/:id
router.delete("/monthly/:id", async (req, res) => {
  await prisma.monthlyGoal.delete({ where: { id: Number(req.params.id) } });
  res.json({ success: true });
});

export default router;
