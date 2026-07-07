-- AlterTable
ALTER TABLE "ActionItem" ADD COLUMN "googleTaskId" TEXT;

-- AlterTable
ALTER TABLE "CalendarEvent" ADD COLUMN "googleEventId" TEXT;

-- AlterTable
ALTER TABLE "SecondaryTask" ADD COLUMN "googleTaskId" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AppSettings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "theme" TEXT NOT NULL DEFAULT 'system',
    "defaultFocusMinutes" INTEGER NOT NULL DEFAULT 25,
    "defaultBreakMinutes" INTEGER NOT NULL DEFAULT 5,
    "defaultUploadPlatforms" TEXT NOT NULL DEFAULT '["youtube","beatstars"]',
    "notificationsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "publishingStreakGoal" INTEGER NOT NULL DEFAULT 7,
    "googleSheetId" TEXT NOT NULL DEFAULT '1cdwRV433KKaJ-PCY4lCCsQzazZrqCJfdsbgBlMJtqaY',
    "googleCalendarId" TEXT NOT NULL DEFAULT '',
    "userGmailAddress" TEXT NOT NULL DEFAULT '',
    "googleSyncEnabled" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_AppSettings" ("defaultBreakMinutes", "defaultFocusMinutes", "defaultUploadPlatforms", "id", "notificationsEnabled", "publishingStreakGoal", "theme") SELECT "defaultBreakMinutes", "defaultFocusMinutes", "defaultUploadPlatforms", "id", "notificationsEnabled", "publishingStreakGoal", "theme" FROM "AppSettings";
DROP TABLE "AppSettings";
ALTER TABLE "new_AppSettings" RENAME TO "AppSettings";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
