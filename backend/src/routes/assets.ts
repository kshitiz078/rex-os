import { Router } from "express";
import prisma from "../db";

const router = Router();

const parseArr = (s: string): string[] => { try { return JSON.parse(s); } catch { return []; } };
const mapAsset = (a: { id: number; name: string; type: string; driveLink: string; previewUrl: string; beatId: string | null; projectId: number | null; tags: string; dateAdded: string; notes: string }) => ({
  ...a, tags: parseArr(a.tags),
});

// GET /api/assets
router.get("/", async (_req, res) => {
  const assets = await prisma.asset.findMany({ orderBy: { dateAdded: "desc" } });
  res.json(assets.map(mapAsset));
});

// POST /api/assets
router.post("/", async (req, res) => {
  const { name, type, driveLink, previewUrl, beatId, projectId, tags, notes } = req.body;
  const asset = await prisma.asset.create({
    data: { name, type, driveLink: driveLink || "", previewUrl: previewUrl || "", beatId, projectId: projectId ? Number(projectId) : null, tags: JSON.stringify(tags || []), dateAdded: new Date().toISOString().split("T")[0], notes: notes || "" },
  });
  res.status(201).json(mapAsset(asset));
});

// PUT /api/assets/:id
router.put("/:id", async (req, res) => {
  const { name, type, driveLink, previewUrl, beatId, projectId, tags, notes } = req.body;
  const asset = await prisma.asset.update({
    where: { id: Number(req.params.id) },
    data: { name, type, driveLink, previewUrl, beatId, projectId: projectId ? Number(projectId) : null, tags: JSON.stringify(tags || []), notes },
  });
  res.json(mapAsset(asset));
});

// DELETE /api/assets/:id
router.delete("/:id", async (req, res) => {
  await prisma.asset.delete({ where: { id: Number(req.params.id) } });
  res.json({ success: true });
});

export default router;
