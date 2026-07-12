/**
 * REX OS — Database Seed Script
 * Populates all tables with the same default data used in the frontend AppContext.
 * Run: npm run db:seed
 */
import prisma from "./db";

async function main() {
  console.log("🌱 Starting REX OS database seed...");

  // Wipe everything in correct dependency order
  await prisma.calendarEvent.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.publishingCard.deleteMany();
  await prisma.projectTask.deleteMany();
  await prisma.milestone.deleteMany();
  await prisma.project.deleteMany();
  await prisma.beat.deleteMany();
  await prisma.monthlyGoal.deleteMany();
  await prisma.quarterlyGoal.deleteMany();
  await prisma.annualGoal.deleteMany();
  await prisma.actionItem.deleteMany();
  await prisma.secondaryTask.deleteMany();
  await prisma.weeklyReview.deleteMany();
  await prisma.missionControl.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.dailyLog.deleteMany();
  await prisma.knowledgeEntry.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.appSettings.deleteMany();

  // ──────────────────────────────────────────
  // MINIMAL EMPTY DEFAULTS FOR USER START
  // ──────────────────────────────────────────

  // Weekly Review (empty default)
  await prisma.weeklyReview.create({
    data: {
      score: 0,
      scoreTrend: "No data",
      biggestWin: "",
      biggestMistake: "",
      lessonsLearned: "",
      goalsNextWeek: "",
      weeklyNotes: "",
      doomscrollingHours: 0,
      synthTweakingHours: 0,
      videosPublished: 0,
      beatsFinished: 0,
      tasksCompleted: 0,
      focusHours: 0,
      publishingStreak: 0,
    },
  });
  console.log("✅ Weekly review initialized");

  // Mission Control (empty default)
  await prisma.missionControl.create({
    data: {
      oneImportantTask: "",
      notes: "",
    },
  });
  console.log("✅ Mission control initialized");

  // App Settings (default config)
  await prisma.appSettings.create({
    data: {
      theme: "system",
      defaultFocusMinutes: 25,
      defaultBreakMinutes: 5,
      defaultUploadPlatforms: JSON.stringify(["youtube", "beatstars"]),
      notificationsEnabled: true,
      publishingStreakGoal: 7,
    },
  });
  console.log("✅ App settings initialized");

  console.log("\n🎉 Database cleared and initialized with blank user profile! REX OS is ready for clean logging.");
}

main()
  .catch((e) => {
    console.error("❌ Reset failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
