import { Router } from "express";
import prisma from "../db";

const router = Router();

// GET /api/action-items
router.get("/", async (_req, res) => {
  const items = await prisma.actionItem.findMany({ orderBy: { sortOrder: "asc" } });
  res.json(items);
});

// POST /api/action-items
router.post("/", async (req, res) => {
  const { text, priority, estimatedMinutes, project, energy } = req.body;
  const count = await prisma.actionItem.count();
  const item = await prisma.actionItem.create({
    data: { text, priority: priority || "Medium", estimatedMinutes, project, energy, completed: false, sortOrder: count },
  });
  res.status(201).json(item);
});

// PATCH /api/action-items/:id/toggle
router.patch("/:id/toggle", async (req, res) => {
  const item = await prisma.actionItem.findUnique({ where: { id: Number(req.params.id) } });
  if (!item) return res.status(404).json({ error: "Item not found" });
  const updated = await prisma.actionItem.update({
    where: { id: Number(req.params.id) },
    data: { completed: !item.completed },
  });
  res.json(updated);
});

// PUT /api/action-items/reorder  — bulk reorder
router.put("/reorder", async (req, res) => {
  const { items } = req.body as { items: { id: number; sortOrder: number }[] };
  await Promise.all(
    items.map((item) => prisma.actionItem.update({ where: { id: item.id }, data: { sortOrder: item.sortOrder } }))
  );
  res.json({ success: true });
});

// DELETE /api/action-items/:id
router.delete("/:id", async (req, res) => {
  await prisma.actionItem.delete({ where: { id: Number(req.params.id) } });
  res.json({ success: true });
});

export default router;
