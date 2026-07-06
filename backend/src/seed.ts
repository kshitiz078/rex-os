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
  // BEATS
  // ──────────────────────────────────────────
  const beats = [
    {
      id: "B-042",
      name: "Midnight Drift",
      genre: "Trap",
      mood: "Dark",
      bpm: 140,
      key: "C Min",
      duration: "2:45",
      videoTheme: "Cyberpunk City",
      status: "Published",
      mixStatus: "Done",
      masterStatus: "Done",
      videoStatus: "Done",
      platYoutube: true,
      platSpotify: true,
      platBeatstars: true,
      platAirbit: false,
      tags: JSON.stringify(["dark", "trap", "808"]),
      notes: "Best seller on BeatStars",
      dateCreated: "2026-06-28",
    },
    {
      id: "B-043",
      name: "Summer Breeze",
      genre: "R&B",
      mood: "Chill",
      bpm: 95,
      key: "F Maj",
      duration: "3:10",
      videoTheme: "Sunset Beach",
      status: "Ready",
      mixStatus: "Done",
      masterStatus: "In Progress",
      videoStatus: "Not Started",
      platYoutube: false,
      platSpotify: false,
      platBeatstars: true,
      platAirbit: false,
      tags: JSON.stringify(["chill", "rnb", "summer"]),
      notes: "Needs thumbnail before publishing",
      dateCreated: "2026-07-01",
    },
    {
      id: "B-044",
      name: "Titanium",
      genre: "Drill",
      mood: "Aggressive",
      bpm: 142,
      key: "D Min",
      duration: "2:15",
      videoTheme: "Industrial",
      status: "In Progress",
      mixStatus: "In Progress",
      masterStatus: "Not Started",
      videoStatus: "Not Started",
      platYoutube: false,
      platSpotify: false,
      platBeatstars: false,
      platAirbit: false,
      tags: JSON.stringify(["drill", "aggressive", "hard"]),
      notes: "WIP - mixing in progress",
      dateCreated: "2026-07-02",
    },
    {
      id: "B-045",
      name: "Cloud Nine",
      genre: "Lo-Fi",
      mood: "Relaxed",
      bpm: 85,
      key: "G Maj",
      duration: "2:55",
      videoTheme: "Anime Rain",
      status: "Published",
      mixStatus: "Done",
      masterStatus: "Done",
      videoStatus: "Done",
      platYoutube: true,
      platSpotify: true,
      platBeatstars: true,
      platAirbit: true,
      tags: JSON.stringify(["lofi", "chill", "anime"]),
      notes: "Featured playlist on Spotify",
      dateCreated: "2026-06-15",
    },
  ];
  for (const beat of beats) await prisma.beat.create({ data: beat });
  console.log("✅ Beats seeded");

  // ──────────────────────────────────────────
  // PROJECTS
  // ──────────────────────────────────────────
  const p1 = await prisma.project.create({
    data: {
      name: "Rex Music",
      description: "Core music production and artist releases.",
      progress: 68,
      status: "Active",
      statusColor: "text-emerald-500 bg-emerald-500/10",
      priority: "High",
      priorityColor: "text-orange-500 bg-orange-500/10",
      deadline: "Q3 2026",
      recentActivity: "Uploaded stem files for mixing",
      notes: "Focus on consistent EP rollout. Priority is finishing mixes.",
      timeInvested: 48,
      health: "On Track",
      milestones: {
        create: [
          { text: "Finish 'Neon City' EP", completed: true },
          { text: "Shoot music video", completed: false },
          { text: "Distribute to Spotify", completed: false },
        ],
      },
      tasks: {
        create: [
          { text: "Record vocals for EP closer", completed: false, priority: "High" },
          { text: "Mix and master EP tracks", completed: true, priority: "High" },
          { text: "Design album artwork", completed: false, priority: "Medium" },
          { text: "Submit to DistroKid", completed: false, priority: "High" },
        ],
      },
    },
  });

  const p2 = await prisma.project.create({
    data: {
      name: "Beat Selling Website",
      description: "E-commerce platform for leasing and selling beats.",
      progress: 45,
      status: "In Progress",
      statusColor: "text-blue-500 bg-blue-500/10",
      priority: "High",
      priorityColor: "text-orange-500 bg-orange-500/10",
      deadline: "Aug 15, 2026",
      recentActivity: "Completed Stripe API integration",
      notes: "Go-live target is August. Need 50 beats minimum to launch.",
      timeInvested: 32,
      health: "On Track",
      milestones: {
        create: [
          { text: "Design UI/UX", completed: true },
          { text: "Integrate Stripe", completed: true },
          { text: "Upload initial catalog (50 beats)", completed: false },
        ],
      },
      tasks: {
        create: [
          { text: "Upload 50 beats to catalog", completed: false, priority: "High" },
          { text: "Write product descriptions", completed: false, priority: "Medium" },
          { text: "Test checkout flow", completed: true, priority: "High" },
        ],
      },
    },
  });

  await prisma.project.create({
    data: {
      name: "Personal Brand",
      description: "Content creation, YouTube channel, and social media growth.",
      progress: 85,
      status: "Ongoing",
      statusColor: "text-primary bg-primary/10",
      priority: "Medium",
      priorityColor: "text-yellow-600 bg-yellow-500/10",
      deadline: "Continuous",
      recentActivity: "Published 'Studio Tour' video",
      notes: "YouTube growth is key. Double down on tutorials.",
      timeInvested: 22,
      health: "On Track",
      milestones: {
        create: [
          { text: "Reach 10k YouTube Subs", completed: false },
          { text: "Launch weekly newsletter", completed: true },
          { text: "Collab with 2 creators", completed: false },
        ],
      },
      tasks: {
        create: [
          { text: "Film studio setup video", completed: true, priority: "Medium" },
          { text: "Write newsletter issue #4", completed: false, priority: "Low" },
        ],
      },
    },
  });
  console.log("✅ Projects seeded");

  // ──────────────────────────────────────────
  // PUBLISHING CARDS
  // ──────────────────────────────────────────
  await prisma.publishingCard.createMany({
    data: [
      { columnId: "mixing", title: "How to mix 808s", platform: "youtube", priority: "High", publishDate: "TBD", estTime: "2h", status: "Editing" },
      { columnId: "idea", title: "Lo-Fi Sample Pack Promo", platform: "youtube", priority: "Medium", publishDate: "TBD", estTime: "1h", status: "Concept" },
      { columnId: "ready", title: "Midnight Drift Beat", platform: "beatstars", priority: "High", publishDate: "Jul 4, 2026", estTime: "15m", status: "Uploaded", beatId: "B-042" },
      { columnId: "scheduled", title: "Summer Breeze EP", platform: "spotify", priority: "Highest", publishDate: "Jul 10, 2026", estTime: "0m", status: "Scheduled", beatId: "B-043" },
      { columnId: "published", title: "Studio Tour 2026", platform: "youtube", priority: "Medium", publishDate: "Jun 25, 2026", estTime: "0m", status: "Live" },
    ],
  });
  console.log("✅ Publishing cards seeded");

  // ──────────────────────────────────────────
  // GOALS
  // ──────────────────────────────────────────
  const ag1 = await prisma.annualGoal.create({ data: { title: "Reach 100k YouTube Subscribers", targetDate: "Dec 31, 2026", progress: 65, status: "On Track" } });
  const ag2 = await prisma.annualGoal.create({ data: { title: "Generate $50k in Beat Sales", targetDate: "Dec 31, 2026", progress: 42, status: "At Risk" } });
  await prisma.annualGoal.create({ data: { title: "Release Debut Album", targetDate: "Oct 15, 2026", progress: 80, status: "Ahead" } });

  const qg1 = await prisma.quarterlyGoal.create({ data: { title: "Launch New Beat Store", targetDate: "Jul 31, 2026", progress: 100, status: "Completed", annualGoalId: ag2.id } });
  const qg2 = await prisma.quarterlyGoal.create({ data: { title: "Grow Mailing List to 5k", targetDate: "Sep 30, 2026", progress: 35, status: "On Track", annualGoalId: ag1.id } });

  await prisma.monthlyGoal.createMany({
    data: [
      { title: "Publish 4 YouTube Videos", progress: 50, current: 2, total: 4, unit: "videos", type: "monthly", category: "Growth", quarterlyGoalId: qg2.id },
      { title: "Upload 10 New Beats", progress: 80, current: 8, total: 10, unit: "beats", type: "monthly", category: "Production", quarterlyGoalId: qg1.id },
      { title: "Collaborate with 2 Artists", progress: 0, current: 0, total: 2, unit: "artists", type: "monthly", category: "Growth", quarterlyGoalId: qg2.id },
    ],
  });
  console.log("✅ Goals seeded");

  // ──────────────────────────────────────────
  // ACTION ITEMS
  // ──────────────────────────────────────────
  await prisma.actionItem.createMany({
    data: [
      { text: "Record B-roll for studio vlog", completed: false, priority: "Medium", estimatedMinutes: 60, project: "Personal Brand", sortOrder: 0 },
      { text: "Mix and master 'Midnight Drift'", completed: true, priority: "High", estimatedMinutes: 120, project: "Rex Music", sortOrder: 1 },
      { text: "Draft email newsletter", completed: false, priority: "Low", estimatedMinutes: 30, project: "Personal Brand", sortOrder: 2 },
      { text: "Upload stems to BeatStars", completed: false, priority: "High", estimatedMinutes: 20, project: "Rex Music", sortOrder: 3 },
    ],
  });
  console.log("✅ Action items seeded");

  // ──────────────────────────────────────────
  // WEEKLY REVIEW (single record)
  // ──────────────────────────────────────────
  await prisma.weeklyReview.create({
    data: {
      score: 8.5,
      scoreTrend: "+1.2 from last week",
      biggestWin: "Successfully launched the new Beat Store website. First sale came through on day 1.",
      biggestMistake: "Spent too much time tweaking EQ on a track that was already good enough.",
      lessonsLearned: "Set a hard timer of 3 hours for mixing. When the timer is up, export and move on.",
      goalsNextWeek: "1. Publish 3 new beats to the store.\n2. Record and upload 1 long-form YouTube video.\n3. Spend 0 hours doomscrolling.",
      weeklyNotes: "Felt a bit burned out on Thursday. Need to sleep 8 hours consistently.",
      doomscrollingHours: 4,
      synthTweakingHours: 2,
      videosPublished: 2,
      beatsFinished: 4,
      tasksCompleted: 14,
      focusHours: 18,
      publishingStreak: 12,
    },
  });
  console.log("✅ Weekly review seeded");

  // ──────────────────────────────────────────
  // MISSION CONTROL
  // ──────────────────────────────────────────
  await prisma.missionControl.create({
    data: {
      oneImportantTask: "Launch REX OS V2 Platform",
      notes: "Remember to test the production endpoints. Keep 808s mono!",
    },
  });

  await prisma.secondaryTask.createMany({
    data: [
      { text: "Mix and master 'Midnight Drift'", completed: true, priority: "High", estimatedMinutes: 120, project: "Rex Music", sortOrder: 0 },
      { text: "Schedule social media promotions", completed: false, priority: "Medium", estimatedMinutes: 30, sortOrder: 1 },
      { text: "Upload stems for collaboration", completed: false, priority: "Low", estimatedMinutes: 20, project: "Rex Music", sortOrder: 2 },
    ],
  });
  console.log("✅ Mission control seeded");

  // ──────────────────────────────────────────
  // ACTIVITY LOG
  // ──────────────────────────────────────────
  await prisma.activityLog.createMany({
    data: [
      { timestamp: "2026-07-04T09:00:00Z", type: "beat_published", title: "Beat Published", description: "Midnight Drift published to BeatStars & YouTube", icon: "zap", color: "text-yellow-500 bg-yellow-500/10" },
      { timestamp: "2026-07-03T14:30:00Z", type: "task_completed", title: "Task Completed", description: "Mixed and mastered Midnight Drift", icon: "check", color: "text-emerald-500 bg-emerald-500/10" },
      { timestamp: "2026-07-03T11:00:00Z", type: "focus_session", title: "Focus Session", description: "2-hour deep work block completed", icon: "clock", color: "text-blue-500 bg-blue-500/10" },
      { timestamp: "2026-07-02T16:00:00Z", type: "project_updated", title: "Project Updated", description: "Beat Selling Website: Stripe integration completed", icon: "folder", color: "text-primary bg-primary/10" },
    ],
  });
  console.log("✅ Activity log seeded");

  // ──────────────────────────────────────────
  // DAILY LOG
  // ──────────────────────────────────────────
  await prisma.dailyLog.create({
    data: {
      date: "2026-07-04",
      category: "Music Production",
      task: "Mixing Titanium beat",
      output: "Mix version 1 completed",
      timeSpent: 120,
      status: "In Progress",
      notes: "808s need more work",
      nextAction: "Revise low end and re-export",
    },
  });
  console.log("✅ Daily logs seeded");

  // ──────────────────────────────────────────
  // KNOWLEDGE VAULT
  // ──────────────────────────────────────────
  await prisma.knowledgeEntry.createMany({
    data: [
      { title: "Keep 808s mono below 80Hz", category: "Reference", content: "Always mono your 808s below 80Hz to avoid phase issues on mono systems and Spotify compression.", tags: JSON.stringify(["mixing", "808", "production"]), dateAdded: "2026-07-01", isFavorite: true },
      { title: "YouTube algorithm prefers 10+ minute videos", category: "Marketing", content: "Videos over 10 minutes allow mid-roll ads and signal watch time to the algorithm, boosting reach.", tags: JSON.stringify(["youtube", "content", "growth"]), url: "https://support.google.com/youtube", dateAdded: "2026-06-28", isFavorite: false },
      { title: "Cold email template for collabs", category: "Business", content: "Hey [Name], love your work on [X]. I'm Rex - I produce trap and R&B beats. I think a collab would be fire. Want to jam?", tags: JSON.stringify(["collab", "email", "outreach"]), dateAdded: "2026-06-20", isFavorite: true },
    ],
  });
  console.log("✅ Knowledge entries seeded");

  // ──────────────────────────────────────────
  // ASSETS
  // ──────────────────────────────────────────
  await prisma.asset.createMany({
    data: [
      { name: "Midnight Drift Cover Art", type: "Cover Art", size: "2.4 MB", format: "PNG", beatId: "B-042", projectId: p1.id, tags: JSON.stringify(["dark", "cyberpunk"]), dateAdded: "2026-06-28", notes: "Final version approved" },
      { name: "Studio Tour B-Roll", type: "Video", size: "1.2 GB", format: "MP4", projectId: p2.id, tags: JSON.stringify(["youtube", "broll"]), dateAdded: "2026-07-01", notes: "4K 60fps footage" },
      { name: "Rex Music Logo Pack", type: "Brand", size: "4.8 MB", format: "ZIP", tags: JSON.stringify(["brand", "logo"]), dateAdded: "2026-06-15", notes: "Light and dark versions included" },
    ],
  });
  console.log("✅ Assets seeded");

  // ──────────────────────────────────────────
  // NOTIFICATIONS
  // ──────────────────────────────────────────
  await prisma.notification.createMany({
    data: [
      { title: "Beat Awaiting Thumbnail", description: "Summer Breeze is ready to publish but missing a thumbnail.", type: "warning", isRead: false, timestamp: "2026-07-04T10:00:00Z" },
      { title: "Weekly Review Due", description: "Your weekly review hasn't been completed yet. Review the past 7 days.", type: "info", isRead: false, timestamp: "2026-07-04T09:00:00Z" },
      { title: "Project Deadline Approaching", description: "Beat Selling Website deadline is in 41 days.", type: "urgent", isRead: false, timestamp: "2026-07-03T08:00:00Z" },
      { title: "Monthly Goal: Almost There!", description: "Upload 10 beats: 8/10 completed. 2 more to hit your goal!", type: "success", isRead: true, timestamp: "2026-07-02T12:00:00Z" },
    ],
  });
  console.log("✅ Notifications seeded");

  // ──────────────────────────────────────────
  // CALENDAR EVENTS
  // ──────────────────────────────────────────
  await prisma.calendarEvent.createMany({
    data: [
      { title: "Midnight Drift (YouTube)", date: "2026-07-04", platform: "youtube", color: "#ef4444", isRecurring: false, status: "published", beatId: "B-042" },
      { title: "Summer Breeze EP (Spotify)", date: "2026-07-10", platform: "spotify", color: "#22c55e", isRecurring: false, status: "scheduled", beatId: "B-043" },
      { title: "Weekly Tutorial Video", date: "2026-07-07", platform: "youtube", color: "#ef4444", isRecurring: true, status: "scheduled" },
      { title: "BeatStars Upload", date: "2026-07-14", platform: "beatstars", color: "#3b82f6", isRecurring: false, status: "draft" },
    ],
  });
  console.log("✅ Calendar events seeded");

  // ──────────────────────────────────────────
  // APP SETTINGS (single record)
  // ──────────────────────────────────────────
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
  console.log("✅ App settings seeded");

  console.log("\n🎉 Database seed complete! REX OS is ready to go.");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
