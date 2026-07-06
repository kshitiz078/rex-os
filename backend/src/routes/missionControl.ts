import { Router } from "express";
import prisma from "../db";

const router = Router();

// GET /api/mission-control
router.get("/", async (_req, res) => {
  const [mc, tasks] = await Promise.all([
    prisma.missionControl.findFirst(),
    prisma.secondaryTask.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);
  res.json({ oneImportantTask: mc?.oneImportantTask || "", notes: mc?.notes || "", secondaryTasks: tasks });
});

// PUT /api/mission-control
router.put("/", async (req, res) => {
  const { oneImportantTask, notes } = req.body;
  const mc = await prisma.missionControl.findFirst();
  const updated = mc
    ? await prisma.missionControl.update({ where: { id: mc.id }, data: { oneImportantTask, notes } })
    : await prisma.missionControl.create({ data: { oneImportantTask, notes } });
  res.json(updated);
});

// POST /api/mission-control/tasks
router.post("/tasks", async (req, res) => {
  const { text, priority, estimatedMinutes, project } = req.body;
  const count = await prisma.secondaryTask.count();
  const task = await prisma.secondaryTask.create({
    data: { text, priority: priority || "Medium", estimatedMinutes, project, completed: false, sortOrder: count },
  });
  res.status(201).json(task);
});

// PATCH /api/mission-control/tasks/:id/toggle
router.patch("/tasks/:id/toggle", async (req, res) => {
  const task = await prisma.secondaryTask.findUnique({ where: { id: Number(req.params.id) } });
  if (!task) return res.status(404).json({ error: "Task not found" });
  const updated = await prisma.secondaryTask.update({
    where: { id: Number(req.params.id) },
    data: { completed: !task.completed },
  });
  res.json(updated);
});

// PUT /api/mission-control/tasks/reorder
router.put("/tasks/reorder", async (req, res) => {
  const { items } = req.body as { items: { id: number; sortOrder: number }[] };
  await Promise.all(
    items.map((item) => prisma.secondaryTask.update({ where: { id: item.id }, data: { sortOrder: item.sortOrder } }))
  );
  res.json({ success: true });
});

// DELETE /api/mission-control/tasks/:id
router.delete("/tasks/:id", async (req, res) => {
  await prisma.secondaryTask.delete({ where: { id: Number(req.params.id) } });
  res.json({ success: true });
});

export default router;
