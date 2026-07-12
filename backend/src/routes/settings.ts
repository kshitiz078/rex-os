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
  const {
    theme,
    defaultFocusMinutes,
    defaultBreakMinutes,
    defaultUploadPlatforms,
    notificationsEnabled,
    publishingStreakGoal,
    googleSheetId,
    googleCalendarId,
    userGmailAddress,
    googleSyncEnabled,
    lastBackupAt,
    backupStatus,
    backupError
  } = req.body;
  const existing = await prisma.appSettings.findFirst();
  const data = {
    theme,
    defaultFocusMinutes: Number(defaultFocusMinutes),
    defaultBreakMinutes: Number(defaultBreakMinutes),
    defaultUploadPlatforms: JSON.stringify(defaultUploadPlatforms || []),
    notificationsEnabled: !!notificationsEnabled,
    publishingStreakGoal: Number(publishingStreakGoal),
    googleSheetId: googleSheetId !== undefined ? String(googleSheetId) : undefined,
    googleCalendarId: googleCalendarId !== undefined ? String(googleCalendarId) : undefined,
    userGmailAddress: userGmailAddress !== undefined ? String(userGmailAddress) : undefined,
    googleSyncEnabled: googleSyncEnabled !== undefined ? !!googleSyncEnabled : undefined,
    lastBackupAt: lastBackupAt !== undefined && lastBackupAt !== null ? String(lastBackupAt) : undefined,
    backupStatus: backupStatus !== undefined ? String(backupStatus) : undefined,
    backupError: backupError !== undefined ? String(backupError) : undefined,
  };
  const settings = existing
    ? await prisma.appSettings.update({ where: { id: existing.id }, data })
    : await prisma.appSettings.create({ data });
  res.json({ ...settings, defaultUploadPlatforms: parseArr(settings.defaultUploadPlatforms) });
});

// POST /api/settings/reset
router.post("/reset", async (req, res) => {
  // Clear all user data tables but keep app settings
  await prisma.projectTask.deleteMany({});
  await prisma.milestone.deleteMany({});
  await prisma.project.deleteMany({});
  
  await prisma.publishingCard.deleteMany({});
  await prisma.asset.deleteMany({});
  await prisma.calendarEvent.deleteMany({});
  await prisma.beat.deleteMany({});
  
  await prisma.monthlyGoal.deleteMany({});
  await prisma.quarterlyGoal.deleteMany({});
  await prisma.annualGoal.deleteMany({});
  
  await prisma.actionItem.deleteMany({});
  await prisma.weeklyReview.deleteMany({});
  await prisma.secondaryTask.deleteMany({});
  await prisma.missionControl.deleteMany({});
  await prisma.activityLog.deleteMany({});
  await prisma.dailyLog.deleteMany({});
  await prisma.knowledgeEntry.deleteMany({});
  await prisma.notification.deleteMany({});
  
  res.json({ success: true });
});

export default router;
