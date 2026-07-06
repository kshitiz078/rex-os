import { Router } from "express";
import prisma from "../db";

const router = Router();

const parseArr = (s: string): string[] => { try { return JSON.parse(s); } catch { return []; } };

// GET /api/settings
router.get("/", async (_req, res) => {
  const settings = await prisma.appSettings.findFirst();
  if (!settings) return res.status(404).json({ error: "Settings not found" });
  res.json({ ...settings, defaultUploadPlatforms: parseArr(settings.defaultUploadPlatforms) });
});

// PUT /api/settings
router.put("/", async (req, res) => {
  const { theme, defaultFocusMinutes, defaultBreakMinutes, defaultUploadPlatforms, notificationsEnabled, publishingStreakGoal } = req.body;
  const existing = await prisma.appSettings.findFirst();
  const data = {
    theme,
    defaultFocusMinutes: Number(defaultFocusMinutes),
    defaultBreakMinutes: Number(defaultBreakMinutes),
    defaultUploadPlatforms: JSON.stringify(defaultUploadPlatforms || []),
    notificationsEnabled: !!notificationsEnabled,
    publishingStreakGoal: Number(publishingStreakGoal),
  };
  const settings = existing
    ? await prisma.appSettings.update({ where: { id: existing.id }, data })
    : await prisma.appSettings.create({ data });
  res.json({ ...settings, defaultUploadPlatforms: parseArr(settings.defaultUploadPlatforms) });
});

export default router;
