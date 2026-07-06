-- CreateTable
CREATE TABLE "Beat" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "genre" TEXT NOT NULL,
    "mood" TEXT NOT NULL,
    "bpm" INTEGER NOT NULL,
    "key" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "videoTheme" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'In Progress',
    "mixStatus" TEXT NOT NULL DEFAULT 'Not Started',
    "masterStatus" TEXT NOT NULL DEFAULT 'Not Started',
    "videoStatus" TEXT NOT NULL DEFAULT 'Not Started',
    "platYoutube" BOOLEAN NOT NULL DEFAULT false,
    "platSpotify" BOOLEAN NOT NULL DEFAULT false,
    "platBeatstars" BOOLEAN NOT NULL DEFAULT false,
    "platAirbit" BOOLEAN NOT NULL DEFAULT false,
    "tags" TEXT NOT NULL DEFAULT '[]',
    "notes" TEXT NOT NULL DEFAULT '',
    "dateCreated" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Project" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "statusColor" TEXT NOT NULL DEFAULT 'text-emerald-500 bg-emerald-500/10',
    "priority" TEXT NOT NULL DEFAULT 'Medium',
    "priorityColor" TEXT NOT NULL DEFAULT 'text-yellow-600 bg-yellow-500/10',
    "deadline" TEXT NOT NULL,
    "recentActivity" TEXT NOT NULL DEFAULT 'Project created',
    "notes" TEXT NOT NULL DEFAULT '',
    "timeInvested" REAL NOT NULL DEFAULT 0,
    "health" TEXT NOT NULL DEFAULT 'On Track',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ProjectTask" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "text" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "priority" TEXT NOT NULL DEFAULT 'Medium',
    "dueDate" TEXT,
    "projectId" INTEGER NOT NULL,
    CONSTRAINT "ProjectTask_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Milestone" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "text" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "projectId" INTEGER NOT NULL,
    CONSTRAINT "Milestone_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PublishingCard" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "columnId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "publishDate" TEXT NOT NULL,
    "estTime" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "beatId" TEXT,
    CONSTRAINT "PublishingCard_beatId_fkey" FOREIGN KEY ("beatId") REFERENCES "Beat" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AnnualGoal" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "targetDate" TEXT NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'On Track'
);

-- CreateTable
CREATE TABLE "QuarterlyGoal" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "targetDate" TEXT NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'On Track',
    "annualGoalId" INTEGER,
    CONSTRAINT "QuarterlyGoal_annualGoalId_fkey" FOREIGN KEY ("annualGoalId") REFERENCES "AnnualGoal" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MonthlyGoal" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "current" INTEGER NOT NULL DEFAULT 0,
    "total" INTEGER NOT NULL DEFAULT 1,
    "unit" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'monthly',
    "category" TEXT NOT NULL,
    "quarterlyGoalId" INTEGER,
    CONSTRAINT "MonthlyGoal_quarterlyGoalId_fkey" FOREIGN KEY ("quarterlyGoalId") REFERENCES "QuarterlyGoal" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ActionItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "text" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "priority" TEXT NOT NULL DEFAULT 'Medium',
    "estimatedMinutes" INTEGER,
    "project" TEXT,
    "energy" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "WeeklyReview" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "score" REAL NOT NULL DEFAULT 0,
    "scoreTrend" TEXT NOT NULL DEFAULT '',
    "biggestWin" TEXT NOT NULL DEFAULT '',
    "biggestMistake" TEXT NOT NULL DEFAULT '',
    "lessonsLearned" TEXT NOT NULL DEFAULT '',
    "goalsNextWeek" TEXT NOT NULL DEFAULT '',
    "weeklyNotes" TEXT NOT NULL DEFAULT '',
    "doomscrollingHours" REAL NOT NULL DEFAULT 0,
    "synthTweakingHours" REAL NOT NULL DEFAULT 0,
    "videosPublished" INTEGER NOT NULL DEFAULT 0,
    "beatsFinished" INTEGER NOT NULL DEFAULT 0,
    "tasksCompleted" INTEGER NOT NULL DEFAULT 0,
    "focusHours" REAL NOT NULL DEFAULT 0,
    "publishingStreak" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "MissionControl" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "oneImportantTask" TEXT NOT NULL DEFAULT '',
    "notes" TEXT NOT NULL DEFAULT ''
);

-- CreateTable
CREATE TABLE "SecondaryTask" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "text" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "priority" TEXT NOT NULL DEFAULT 'Medium',
    "estimatedMinutes" INTEGER,
    "project" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "timestamp" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL DEFAULT 'check',
    "color" TEXT NOT NULL DEFAULT 'text-emerald-500 bg-emerald-500/10'
);

-- CreateTable
CREATE TABLE "DailyLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "task" TEXT NOT NULL,
    "output" TEXT NOT NULL,
    "timeSpent" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'In Progress',
    "notes" TEXT NOT NULL DEFAULT '',
    "nextAction" TEXT NOT NULL DEFAULT ''
);

-- CreateTable
CREATE TABLE "KnowledgeEntry" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "tags" TEXT NOT NULL DEFAULT '[]',
    "url" TEXT,
    "dateAdded" TEXT NOT NULL,
    "isFavorite" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "Asset" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "beatId" TEXT,
    "projectId" INTEGER,
    "tags" TEXT NOT NULL DEFAULT '[]',
    "dateAdded" TEXT NOT NULL,
    "notes" TEXT NOT NULL DEFAULT '',
    CONSTRAINT "Asset_beatId_fkey" FOREIGN KEY ("beatId") REFERENCES "Beat" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Asset_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'info',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "timestamp" TEXT NOT NULL,
    "link" TEXT
);

-- CreateTable
CREATE TABLE "CalendarEvent" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#ef4444',
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "beatId" TEXT,
    CONSTRAINT "CalendarEvent_beatId_fkey" FOREIGN KEY ("beatId") REFERENCES "Beat" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AppSettings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "theme" TEXT NOT NULL DEFAULT 'system',
    "defaultFocusMinutes" INTEGER NOT NULL DEFAULT 25,
    "defaultBreakMinutes" INTEGER NOT NULL DEFAULT 5,
    "defaultUploadPlatforms" TEXT NOT NULL DEFAULT '["youtube","beatstars"]',
    "notificationsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "publishingStreakGoal" INTEGER NOT NULL DEFAULT 7
);
