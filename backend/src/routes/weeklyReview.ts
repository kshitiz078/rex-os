import { Router } from "express";
import prisma from "../db";

const router = Router();

// GET /api/weekly-review
router.get("/", async (_req, res) => {
  const review = await prisma.weeklyReview.findFirst();
  if (!review) return res.status(404).json({ error: "No weekly review found" });
  res.json(review);
});

// PUT /api/weekly-review  — partial update (upsert)
router.put("/", async (req, res) => {
  const existing = await prisma.weeklyReview.findFirst();
  const { id, ...data } = req.body;

  const updated = existing
    ? await prisma.weeklyReview.update({ where: { id: existing.id }, data })
    : await prisma.weeklyReview.create({ data });
  res.json(updated);
});

export default router;
