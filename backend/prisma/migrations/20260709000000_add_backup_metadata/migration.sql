ALTER TABLE "AppSettings" ADD COLUMN "lastBackupAt" TEXT;
ALTER TABLE "AppSettings" ADD COLUMN "backupStatus" TEXT NOT NULL DEFAULT 'never';
ALTER TABLE "AppSettings" ADD COLUMN "backupError" TEXT NOT NULL DEFAULT '';
