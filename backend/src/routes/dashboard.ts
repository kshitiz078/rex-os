import { Router } from "express";
import prisma from "../db";

const router = Router();

// GET /api/dashboard
// Returns a consolidated snapshot of all key metrics in a single request
router.get("/", async (_req, res) => {
  const [
    beats,
    projects,
    actionItems,
    monthlyGoals,
    weeklyReview,
    publishingCards,
    activityLog,
    notifications,
    calendarEvents,
    missionControl,
    secondaryTasks,
  ] = await Promise.all([
    prisma.beat.findMany(),
    prisma.project.findMany({ include: { tasks: true, milestones: true } }),
    prisma.actionItem.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.monthlyGoal.findMany(),
    prisma.weeklyReview.findFirst(),
    prisma.publishingCard.findMany(),
    prisma.activityLog.findMany({ orderBy: { timestamp: "desc" }, take: 10 }),
    prisma.notification.findMany({ where: { isRead: false } }),
    prisma.calendarEvent.findMany({ orderBy: { date: "asc" } }),
    prisma.missionControl.findFirst(),
    prisma.secondaryTask.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  res.json({
    beats: beats.length,
    publishedBeats: beats.filter((b) => b.status === "Published").length,
    readyBeats: beats.filter((b) => b.status === "Ready").length,
    projects: projects.length,
    activeProjects: projects.filter((p) => p.status === "Active" || p.status === "In Progress").length,
    actionItemsTotal: actionItems.length,
    actionItemsDone: actionItems.filter((a) => a.completed).length,
    monthlyGoalsAvgProgress:
      monthlyGoals.length > 0
        ? Math.round(monthlyGoals.reduce((s, g) => s + g.progress, 0) / monthlyGoals.length)
        : 0,
    publishingStreak: weeklyReview?.publishingStreak ?? 0,
    focusHours: weeklyReview?.focusHours ?? 0,
    scheduledUploads: publishingCards.filter((c) => c.columnId === "scheduled").length,
    unreadNotifications: notifications.length,
    recentActivity: activityLog,
    todayEvents: calendarEvents,
    oneImportantTask: missionControl?.oneImportantTask ?? "",
    notes: missionControl?.notes ?? "",
    secondaryTasks,
  });
});

export default router;
