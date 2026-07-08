import { google } from "googleapis";
import { getGoogleAuth } from "../googleService";
import { BackupProvider, BackupSnapshot } from "./BackupProvider";

const SNAPSHOT_TAB = "Snapshot";
const SNAPSHOT_RANGE = `${SNAPSHOT_TAB}!A1:B2`;

const requiredSheets = [
  { title: "Beats", headers: ["ID", "Name", "Genre", "Mood", "BPM", "Key", "Duration", "Video Theme", "Status", "Mix Status", "Master Status", "Video Status", "YouTube", "Spotify", "BeatStars", "Airbit", "Tags", "Notes", "Date Created"] },
  { title: "Projects", headers: ["ID", "Name", "Description", "Progress", "Status", "Priority", "Deadline", "Health", "Time Invested", "Recent Activity", "Notes", "Tasks JSON", "Milestones JSON"] },
  { title: "Action Items", headers: ["ID", "Text", "Completed", "Priority", "Estimated Minutes", "Project", "Energy", "Sort Order"] },
  { title: "Daily Logs", headers: ["ID", "Date", "Category", "Task", "Output", "Time Spent", "Status", "Notes", "Next Action"] },
  { title: "Goals", headers: ["Type", "ID", "Title", "Target Date", "Progress", "Status", "Parent ID", "Current", "Total", "Unit", "Category"] },
  { title: SNAPSHOT_TAB, headers: ["Key", "Value"] },
];

export class GoogleSheetsBackup implements BackupProvider {
  name = "google-sheets";

  constructor(private spreadsheetId: string) {}

  async backup(snapshot: BackupSnapshot): Promise<{ backupId: string; completedAt: string }> {
    const sheets = this.getSheetsClient();
    await this.ensureSheets(sheets);

    const tabRows = this.toTabRows(snapshot);
    for (const sheet of requiredSheets) {
      await sheets.spreadsheets.values.clear({
        spreadsheetId: this.spreadsheetId,
        range: `${sheet.title}!A1:Z10000`,
      });

      await sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: `${sheet.title}!A1`,
        valueInputOption: "RAW",
        requestBody: { values: tabRows[sheet.title] },
      });
    }

    return { backupId: snapshot.createdAt, completedAt: snapshot.createdAt };
  }

  async restoreLatest(): Promise<BackupSnapshot> {
    const sheets = this.getSheetsClient();
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: SNAPSHOT_RANGE,
    });

    const rows = res.data.values || [];
    const snapshotRow = rows.find(row => row[0] === "snapshot");
    if (!snapshotRow?.[1]) {
      throw new Error("No restorable REX OS snapshot was found in this Google Sheet.");
    }

    return JSON.parse(String(snapshotRow[1])) as BackupSnapshot;
  }

  private getSheetsClient() {
    const auth = getGoogleAuth();
    if (!auth) throw new Error("Google authentication failed");
    return google.sheets({ version: "v4", auth });
  }

  private async ensureSheets(sheets: ReturnType<typeof google.sheets>) {
    const meta = await sheets.spreadsheets.get({ spreadsheetId: this.spreadsheetId });
    const existingTitles = meta.data.sheets?.map(s => s.properties?.title) || [];
    const requests = requiredSheets
      .filter(sheet => !existingTitles.includes(sheet.title))
      .map(sheet => ({ addSheet: { properties: { title: sheet.title } } }));

    if (requests.length > 0) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: this.spreadsheetId,
        requestBody: { requests },
      });
    }
  }

  private toTabRows(snapshot: BackupSnapshot): Record<string, unknown[][]> {
    const data = snapshot.data as any;
    return {
      Beats: [
        requiredSheets[0].headers,
        ...(data.beats || []).map((b: any) => [
          b.id, b.name, b.genre, b.mood, b.bpm, b.key, b.duration, b.videoTheme, b.status,
          b.mixStatus, b.masterStatus, b.videoStatus, b.platYoutube, b.platSpotify,
          b.platBeatstars, b.platAirbit, b.tags, b.notes, b.dateCreated,
        ]),
      ],
      Projects: [
        requiredSheets[1].headers,
        ...(data.projects || []).map((p: any) => [
          p.id, p.name, p.description, p.progress, p.status, p.priority, p.deadline,
          p.health, p.timeInvested, p.recentActivity, p.notes,
          JSON.stringify(p.tasks || []), JSON.stringify(p.milestones || []),
        ]),
      ],
      "Action Items": [
        requiredSheets[2].headers,
        ...(data.actionItems || []).map((a: any) => [
          a.id, a.text, a.completed, a.priority, a.estimatedMinutes, a.project, a.energy, a.sortOrder,
        ]),
      ],
      "Daily Logs": [
        requiredSheets[3].headers,
        ...(data.dailyLogs || []).map((d: any) => [
          d.id, d.date, d.category, d.task, d.output, d.timeSpent, d.status, d.notes, d.nextAction,
        ]),
      ],
      Goals: [
        requiredSheets[4].headers,
        ...(data.annualGoals || []).map((g: any) => ["Annual", g.id, g.title, g.targetDate, g.progress, g.status, "", "", "", "", ""]),
        ...(data.quarterlyGoals || []).map((g: any) => ["Quarterly", g.id, g.title, g.targetDate, g.progress, g.status, g.annualGoalId, "", "", "", ""]),
        ...(data.monthlyGoals || []).map((g: any) => ["Monthly", g.id, g.title, "", g.progress, "", g.quarterlyGoalId, g.current, g.total, g.unit, g.category]),
      ],
      [SNAPSHOT_TAB]: [
        requiredSheets[5].headers,
        ["snapshot", JSON.stringify(snapshot)],
      ],
    };
  }
}
