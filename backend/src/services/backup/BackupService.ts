import prisma from "../../db";
import { BackupProvider, BackupSnapshot } from "./BackupProvider";
import { GoogleSheetsBackup } from "./GoogleSheetsBackup";

const DAY_MS = 24 * 60 * 60 * 1000;

export class BackupService {
  constructor(private provider: BackupProvider) {}

  static async forGoogleSheets(): Promise<BackupService> {
    const settings = await prisma.appSettings.findFirst();
    const spreadsheetId = settings?.googleSheetId || process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
    if (!spreadsheetId) throw new Error("Google Spreadsheet ID is not configured.");
    return new BackupService(new GoogleSheetsBackup(spreadsheetId));
  }

  async backupNow() {
    const snapshot = await this.createSnapshot();
    const result = await this.provider.backup(snapshot);

    await this.updateBackupSettings({
      lastBackupAt: result.completedAt,
      backupStatus: "success",
      backupError: "",
    });

    return {
      success: true,
      provider: this.provider.name,
      lastBackupAt: result.completedAt,
      message: "Backup completed successfully.",
    };
  }

  async restoreLatest() {
    const snapshot = await this.provider.restoreLatest();
    await this.replaceDatabase(snapshot);

    await this.updateBackupSettings({
      lastBackupAt: snapshot.createdAt,
      backupStatus: "restored",
      backupError: "",
    });

    return {
      success: true,
      restoredAt: new Date().toISOString(),
      backupCreatedAt: snapshot.createdAt,
      message: "Restore completed successfully.",
    };
  }

  static async getStatus() {
    const settings = await prisma.appSettings.findFirst();
    return {
      success: true,
      lastBackupAt: settings?.lastBackupAt || null,
      backupStatus: settings?.backupStatus || "never",
      backupError: settings?.backupError || "",
    };
  }

  static async backupIfStaleOnLaunch() {
    try {
      const settings = await prisma.appSettings.findFirst();
      const lastBackupMs = settings?.lastBackupAt ? Date.parse(settings.lastBackupAt) : 0;
      if (lastBackupMs && Date.now() - lastBackupMs < DAY_MS) return;

      const service = await BackupService.forGoogleSheets();
      await service.backupNow();
      console.log("☁️ Automatic REX OS backup completed.");
    } catch (err: any) {
      console.warn("⚠️ Automatic REX OS backup skipped:", err.message);
      await BackupService.recordFailure(err.message);
    }
  }

  static async recordFailure(message: string) {
    const existing = await prisma.appSettings.findFirst();
    const data = { backupStatus: "failed", backupError: message };
    if (existing) {
      await prisma.appSettings.update({ where: { id: existing.id }, data });
    }
  }

  private async createSnapshot(): Promise<BackupSnapshot> {
    const [
      beats,
      projects,
      actionItems,
      dailyLogs,
      annualGoals,
      quarterlyGoals,
      monthlyGoals,
      publishingCards,
      weeklyReviews,
      missionControls,
      secondaryTasks,
      activityLogs,
      knowledgeEntries,
      assets,
      notifications,
      calendarEvents,
    ] = await Promise.all([
      prisma.beat.findMany(),
      prisma.project.findMany({ include: { tasks: true, milestones: true } }),
      prisma.actionItem.findMany({ orderBy: { sortOrder: "asc" } }),
      prisma.dailyLog.findMany({ orderBy: { date: "desc" } }),
      prisma.annualGoal.findMany(),
      prisma.quarterlyGoal.findMany(),
      prisma.monthlyGoal.findMany(),
      prisma.publishingCard.findMany(),
      prisma.weeklyReview.findMany(),
      prisma.missionControl.findMany(),
      prisma.secondaryTask.findMany({ orderBy: { sortOrder: "asc" } }),
      prisma.activityLog.findMany(),
      prisma.knowledgeEntry.findMany(),
      prisma.asset.findMany(),
      prisma.notification.findMany(),
      prisma.calendarEvent.findMany(),
    ]);

    return {
      version: 1,
      createdAt: new Date().toISOString(),
      data: {
        beats,
        projects,
        actionItems,
        dailyLogs,
        annualGoals,
        quarterlyGoals,
        monthlyGoals,
        publishingCards,
        weeklyReviews,
        missionControls,
        secondaryTasks,
        activityLogs,
        knowledgeEntries,
        assets,
        notifications,
        calendarEvents,
      },
    };
  }

  private async replaceDatabase(snapshot: BackupSnapshot) {
    const data = snapshot.data as any;

    await prisma.$transaction(async tx => {
      await tx.calendarEvent.deleteMany();
      await tx.publishingCard.deleteMany();
      await tx.asset.deleteMany();
      await tx.projectTask.deleteMany();
      await tx.milestone.deleteMany();
      await tx.monthlyGoal.deleteMany();
      await tx.quarterlyGoal.deleteMany();
      await tx.annualGoal.deleteMany();
      await tx.actionItem.deleteMany();
      await tx.secondaryTask.deleteMany();
      await tx.dailyLog.deleteMany();
      await tx.weeklyReview.deleteMany();
      await tx.missionControl.deleteMany();
      await tx.activityLog.deleteMany();
      await tx.knowledgeEntry.deleteMany();
      await tx.notification.deleteMany();
      await tx.project.deleteMany();
      await tx.beat.deleteMany();

      if (data.beats?.length) await tx.beat.createMany({ data: data.beats });

      const projects = (data.projects || []).map(({ tasks: _tasks, milestones: _milestones, ...project }: any) => project);
      if (projects.length) await tx.project.createMany({ data: projects });

      const projectTasks = (data.projects || []).flatMap((project: any) =>
        (project.tasks || []).map((task: any) => ({ ...task, projectId: project.id }))
      );
      if (projectTasks.length) await tx.projectTask.createMany({ data: projectTasks });

      const milestones = (data.projects || []).flatMap((project: any) =>
        (project.milestones || []).map((milestone: any) => ({ ...milestone, projectId: project.id }))
      );
      if (milestones.length) await tx.milestone.createMany({ data: milestones });

      if (data.annualGoals?.length) await tx.annualGoal.createMany({ data: data.annualGoals });
      if (data.quarterlyGoals?.length) await tx.quarterlyGoal.createMany({ data: data.quarterlyGoals });
      if (data.monthlyGoals?.length) await tx.monthlyGoal.createMany({ data: data.monthlyGoals });
      if (data.actionItems?.length) await tx.actionItem.createMany({ data: data.actionItems });
      if (data.secondaryTasks?.length) await tx.secondaryTask.createMany({ data: data.secondaryTasks });
      if (data.dailyLogs?.length) await tx.dailyLog.createMany({ data: data.dailyLogs });
      if (data.weeklyReviews?.length) await tx.weeklyReview.createMany({ data: data.weeklyReviews });
      if (data.missionControls?.length) await tx.missionControl.createMany({ data: data.missionControls });
      if (data.activityLogs?.length) await tx.activityLog.createMany({ data: data.activityLogs });
      if (data.knowledgeEntries?.length) await tx.knowledgeEntry.createMany({ data: data.knowledgeEntries });
      if (data.assets?.length) await tx.asset.createMany({ data: data.assets });
      if (data.notifications?.length) await tx.notification.createMany({ data: data.notifications });
      if (data.publishingCards?.length) await tx.publishingCard.createMany({ data: data.publishingCards });
      if (data.calendarEvents?.length) await tx.calendarEvent.createMany({ data: data.calendarEvents });

      await this.resetPostgresSequences(tx);
    });
  }

  private async resetPostgresSequences(tx: any) {
    const tables = [
      "Project",
      "ProjectTask",
      "Milestone",
      "PublishingCard",
      "AnnualGoal",
      "QuarterlyGoal",
      "MonthlyGoal",
      "ActionItem",
      "WeeklyReview",
      "MissionControl",
      "SecondaryTask",
      "ActivityLog",
      "DailyLog",
      "KnowledgeEntry",
      "Asset",
      "Notification",
      "CalendarEvent",
    ];

    for (const table of tables) {
      await tx.$executeRawUnsafe(`
        SELECT setval(
          pg_get_serial_sequence('"${table}"', 'id'),
          COALESCE((SELECT MAX("id") FROM "${table}"), 1),
          true
        )
      `);
    }
  }

  private async updateBackupSettings(data: { lastBackupAt?: string; backupStatus: string; backupError: string }) {
    const existing = await prisma.appSettings.findFirst();
    if (existing) {
      await prisma.appSettings.update({ where: { id: existing.id }, data });
    } else {
      await prisma.appSettings.create({ data });
    }
  }
}
