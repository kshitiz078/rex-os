import { Router } from "express";
import prisma from "../db";

const router = Router();

const parseArr = (s: string): string[] => { try { return JSON.parse(s); } catch { return []; } };
const mapEntry = (e: { id: number; title: string; category: string; content: string; tags: string; url: string | null; dateAdded: string; isFavorite: boolean }) => ({
  ...e, tags: parseArr(e.tags),
});

// GET /api/knowledge
router.get("/", async (_req, res) => {
  const entries = await prisma.knowledgeEntry.findMany({ orderBy: { dateAdded: "desc" } });
  res.json(entries.map(mapEntry));
});

// POST /api/knowledge
router.post("/", async (req, res) => {
  const { title, category, content, tags, url } = req.body;
  const entry = await prisma.knowledgeEntry.create({
    data: { title, category, content, tags: JSON.stringify(tags || []), url, dateAdded: new Date().toISOString().split("T")[0], isFavorite: false },
  });
  res.status(201).json(mapEntry(entry));
});

// PUT /api/knowledge/:id
router.put("/:id", async (req, res) => {
  const { title, category, content, tags, url, isFavorite } = req.body;
  const entry = await prisma.knowledgeEntry.update({
    where: { id: Number(req.params.id) },
    data: { title, category, content, tags: JSON.stringify(tags || []), url, isFavorite },
  });
  res.json(mapEntry(entry));
});

// PATCH /api/knowledge/:id/favorite
router.patch("/:id/favorite", async (req, res) => {
  const entry = await prisma.knowledgeEntry.findUnique({ where: { id: Number(req.params.id) } });
  if (!entry) return res.status(404).json({ error: "Entry not found" });
  const updated = await prisma.knowledgeEntry.update({
    where: { id: Number(req.params.id) },
    data: { isFavorite: !entry.isFavorite },
  });
  res.json(mapEntry(updated));
});

// DELETE /api/knowledge/:id
router.delete("/:id", async (req, res) => {
  await prisma.knowledgeEntry.delete({ where: { id: Number(req.params.id) } });
  res.json({ success: true });
});

export default router;
