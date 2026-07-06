import { Router } from "express";
import prisma from "../db";

const router = Router();

// GET /api/publishing
router.get("/", async (_req, res) => {
  const cards = await prisma.publishingCard.findMany({ orderBy: { id: "asc" } });
  res.json(cards);
});

// POST /api/publishing
router.post("/", async (req, res) => {
  const { columnId, title, platform, priority, publishDate, estTime, status, beatId } = req.body;
  const card = await prisma.publishingCard.create({
    data: { columnId, title, platform, priority, publishDate: publishDate || "TBD", estTime: estTime || "0m", status, beatId },
  });
  res.status(201).json(card);
});

// PATCH /api/publishing/:id/column  — move card to a column
router.patch("/:id/column", async (req, res) => {
  const { columnId } = req.body;
  const card = await prisma.publishingCard.update({
    where: { id: Number(req.params.id) },
    data: { columnId },
  });
  res.json(card);
});

// PUT /api/publishing/:id
router.put("/:id", async (req, res) => {
  const { columnId, title, platform, priority, publishDate, estTime, status, beatId } = req.body;
  const card = await prisma.publishingCard.update({
    where: { id: Number(req.params.id) },
    data: { columnId, title, platform, priority, publishDate, estTime, status, beatId },
  });
  res.json(card);
});

// DELETE /api/publishing/:id
router.delete("/:id", async (req, res) => {
  await prisma.publishingCard.delete({ where: { id: Number(req.params.id) } });
  res.json({ success: true });
});

export default router;
