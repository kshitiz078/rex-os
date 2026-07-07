import { google } from "googleapis";

// Get auth client
export function getGoogleAuth(): any {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;

  if (!email || !privateKey) {
    console.warn("⚠️ Google credentials are not set in environment variables.");
    return null;
  }

  // Replace escaped newlines if any
  const formattedKey = privateKey.replace(/\\n/g, "\n");

  return new google.auth.GoogleAuth({
    credentials: {
      client_email: email,
      private_key: formattedKey,
    },
    scopes: [
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/calendar",
      "https://www.googleapis.com/auth/documents",
      "https://www.googleapis.com/auth/drive",
      "https://www.googleapis.com/auth/tasks",
    ],
  });
}

// ============================================================
// GOOGLE SHEETS
// ============================================================
export interface SheetSyncData {
  beats: any[];
  projects: any[];
  actionItems: any[];
  dailyLogs: any[];
  goals: any[];
}

export async function syncSheetsData(spreadsheetId: string, data: SheetSyncData) {
  const auth = getGoogleAuth();
  if (!auth) throw new Error("Google authentication failed");

  const sheets = google.sheets({ version: "v4", auth });

  // 1. Get spreadsheet details to check which sheets exist
  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const existingTitles = meta.data.sheets?.map(s => s.properties?.title) || [];

  const requiredSheets = [
    { title: "Beats", headers: ["ID", "Name", "Genre", "Mood", "BPM", "Key", "Duration", "Status", "Mix Status", "Master Status", "Video Status", "Notes", "Date Created"] },
    { title: "Projects", headers: ["ID", "Name", "Description", "Progress", "Status", "Priority", "Deadline", "Health", "Time Invested", "Recent Activity", "Notes"] },
    { title: "Action Items", headers: ["ID", "Text", "Completed", "Priority", "Estimated Minutes", "Project", "Energy"] },
    { title: "Daily Logs", headers: ["ID", "Date", "Category", "Task", "Output", "Time Spent", "Status", "Notes", "Next Action"] }
  ];

  // Create missing sheets
  const requests: any[] = [];
  for (const s of requiredSheets) {
    if (!existingTitles.includes(s.title)) {
      requests.push({
        addSheet: {
          properties: { title: s.title }
        }
      });
    }
  }

  if (requests.length > 0) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests }
    });
  }

  // 2. Format & populate each sheet
  for (const sheetInfo of requiredSheets) {
    let rows: any[][] = [sheetInfo.headers];

    if (sheetInfo.title === "Beats") {
      rows.push(...data.beats.map(b => [
        b.id, b.name, b.genre, b.mood, b.bpm, b.key, b.duration, b.status,
        b.mixStatus, b.masterStatus, b.videoStatus, b.notes, b.dateCreated
      ]));
    } else if (sheetInfo.title === "Projects") {
      rows.push(...data.projects.map(p => [
        p.id, p.name, p.description, p.progress, p.status, p.priority, p.deadline,
        p.health, p.timeInvested, p.recentActivity, p.notes
      ]));
    } else if (sheetInfo.title === "Action Items") {
      rows.push(...data.actionItems.map(a => [
        a.id, a.text, a.completed ? "Yes" : "No", a.priority, a.estimatedMinutes || "", a.project || "", a.energy || ""
      ]));
    } else if (sheetInfo.title === "Daily Logs") {
      rows.push(...data.dailyLogs.map(d => [
        d.id, d.date, d.category, d.task, d.output, d.timeSpent, d.status, d.notes, d.nextAction
      ]));
    }

    // Clear existing data in the sheet range
    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: `${sheetInfo.title}!A1:Z1000`
    });

    // Write new data
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetInfo.title}!A1`,
      valueInputOption: "RAW",
      requestBody: { values: rows }
    });
  }

  return { success: true };
}

// ── IMPORT: Google Sheets → REX OS ─────────────────────────────────────────
export interface SheetImportResult {
  beats: any[];
  projects: any[];
  actionItems: any[];
  dailyLogs: any[];
}

export async function importFromSheets(spreadsheetId: string): Promise<SheetImportResult> {
  const auth = getGoogleAuth();
  if (!auth) throw new Error("Google authentication failed");

  const sheets = google.sheets({ version: "v4", auth });

  const result: SheetImportResult = { beats: [], projects: [], actionItems: [], dailyLogs: [] };

  // Helper: read a sheet tab and return rows (skipping header row)
  async function readSheet(title: string): Promise<string[][]> {
    try {
      const res = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${title}!A2:Z1000`, // Skip header row
      });
      return (res.data.values as string[][]) || [];
    } catch {
      return []; // Sheet tab might not exist yet
    }
  }

  // ── Beats ────────────────────────────────────────────────────────────────
  // Headers: ID, Name, Genre, Mood, BPM, Key, Duration, Status, Mix Status, Master Status, Video Status, Notes, Date Created
  const beatRows = await readSheet("Beats");
  result.beats = beatRows
    .filter(r => r[1]) // must have a name
    .map(r => ({
      id: r[0] ? Number(r[0]) : undefined,
      name: r[1] || "",
      genre: r[2] || "",
      mood: r[3] || "",
      bpm: r[4] ? Number(r[4]) : null,
      key: r[5] || "",
      duration: r[6] || "",
      status: r[7] || "idea",
      mixStatus: r[8] || "unmixed",
      masterStatus: r[9] || "unmastered",
      videoStatus: r[10] || "no-video",
      notes: r[11] || "",
      dateCreated: r[12] || new Date().toISOString().split("T")[0],
    }));

  // ── Projects ─────────────────────────────────────────────────────────────
  // Headers: ID, Name, Description, Progress, Status, Priority, Deadline, Health, Time Invested, Recent Activity, Notes
  const projectRows = await readSheet("Projects");
  result.projects = projectRows
    .filter(r => r[1])
    .map(r => ({
      id: r[0] ? Number(r[0]) : undefined,
      name: r[1] || "",
      description: r[2] || "",
      progress: r[3] ? Number(r[3]) : 0,
      status: r[4] || "active",
      priority: r[5] || "medium",
      deadline: r[6] || null,
      health: r[7] || "on-track",
      timeInvested: r[8] ? Number(r[8]) : 0,
      recentActivity: r[9] || "",
      notes: r[10] || "",
    }));

  // ── Action Items ──────────────────────────────────────────────────────────
  // Headers: ID, Text, Completed, Priority, Estimated Minutes, Project, Energy
  const actionRows = await readSheet("Action Items");
  result.actionItems = actionRows
    .filter(r => r[1])
    .map(r => ({
      id: r[0] ? Number(r[0]) : undefined,
      text: r[1] || "",
      completed: r[2]?.toLowerCase() === "yes",
      priority: r[3] || "medium",
      estimatedMinutes: r[4] ? Number(r[4]) : null,
      project: r[5] || null,
      energy: r[6] || null,
    }));

  // ── Daily Logs ────────────────────────────────────────────────────────────
  // Headers: ID, Date, Category, Task, Output, Time Spent, Status, Notes, Next Action
  const logRows = await readSheet("Daily Logs");
  result.dailyLogs = logRows
    .filter(r => r[1])
    .map(r => ({
      id: r[0] ? Number(r[0]) : undefined,
      date: r[1] || new Date().toISOString().split("T")[0],
      category: r[2] || "general",
      task: r[3] || "",
      output: r[4] || "",
      timeSpent: r[5] ? Number(r[5]) : 0,
      status: r[6] || "in-progress",
      notes: r[7] || "",
      nextAction: r[8] || "",
    }));

  return result;
}

// ============================================================
// GOOGLE CALENDAR
// ============================================================
export async function syncEventToGoogleCalendar(
  calendarId: string,
  event: {
    id: number;
    title: string;
    date: string;
    platform: string;
    status: string;
    googleEventId?: string | null;
  },
  action: "create" | "update" | "delete"
): Promise<string | null> {
  const auth = getGoogleAuth();
  if (!auth) return null;

  const calendar = google.calendar({ version: "v3", auth });
  const cid = calendarId || "primary";

  // Google Calendar Event body
  const eventBody = {
    summary: event.title,
    description: `REX OS Scheduled Event\nPlatform: ${event.platform}\nStatus: ${event.status}`,
    start: { date: event.date },
    end: { date: event.date }
  };

  try {
    if (action === "create" || !event.googleEventId) {
      const res = await calendar.events.insert({
        calendarId: cid,
        requestBody: eventBody
      });
      return res.data.id || null;
    } else if (action === "update" && event.googleEventId) {
      await calendar.events.update({
        calendarId: cid,
        eventId: event.googleEventId,
        requestBody: eventBody
      });
      return event.googleEventId;
    } else if (action === "delete" && event.googleEventId) {
      await calendar.events.delete({
        calendarId: cid,
        eventId: event.googleEventId
      });
      return null;
    }
  } catch (err: any) {
    console.error("❌ Google Calendar Sync Error:", err.message);
    // If event wasn't found on google side, recreate it
    if (action === "update" && err.code === 404) {
      const res = await calendar.events.insert({
        calendarId: cid,
        requestBody: eventBody
      });
      return res.data.id || null;
    }
  }

  return event.googleEventId || null;
}

// ============================================================
// GOOGLE DOCS (via Drive API + Docs API)
// ============================================================
export async function exportDocToGoogleDocs(
  userGmail: string,
  title: string,
  content: string
): Promise<string> {
  const auth = getGoogleAuth();
  if (!auth) throw new Error("Google authentication failed");

  const drive = google.drive({ version: "v3", auth });
  const docs = google.docs({ version: "v1", auth });

  // 1. Create a blank Google Document
  const docFile = await drive.files.create({
    requestBody: {
      name: title,
      mimeType: "application/vnd.google-apps.document"
    }
  });

  const docId = docFile.data.id;
  if (!docId) throw new Error("Failed to create document file in Google Drive");

  // 2. Populate text content
  await docs.documents.batchUpdate({
    documentId: docId,
    requestBody: {
      requests: [
        {
          insertText: {
            text: content,
            location: { index: 1 }
          }
        }
      ]
    }
  });

  // 3. Share with User Email if provided
  if (userGmail && userGmail.trim() !== "") {
    try {
      await drive.permissions.create({
        fileId: docId,
        requestBody: {
          role: "writer",
          type: "user",
          emailAddress: userGmail.trim()
        },
        sendNotificationEmail: true
      });
    } catch (err: any) {
      console.warn(`⚠️ Could not share document with ${userGmail}:`, err.message);
    }
  }

  // 4. Retrieve web view link
  const fileInfo = await drive.files.get({
    fileId: docId,
    fields: "webViewLink"
  });

  return fileInfo.data.webViewLink || `https://docs.google.com/document/d/${docId}/edit`;
}

// ============================================================
// GOOGLE TASKS
// ============================================================
export async function syncTasksToGoogleTasks(
  tasks: { id: number; text: string; completed: boolean; googleTaskId?: string | null }[]
): Promise<{ id: number; googleTaskId: string | null }[]> {
  const auth = getGoogleAuth();
  if (!auth) return [];

  const tasksApi = google.tasks({ version: "v1", auth });

  // 1. Find or create REX OS Tasks list
  let tasklistId = "";
  try {
    const lists = await tasksApi.tasklists.list({ maxResults: 100 });
    const existingList = lists.data.items?.find(l => l.title === "REX OS Tasks");
    if (existingList) {
      tasklistId = existingList.id!;
    } else {
      const newList = await tasksApi.tasklists.insert({
        requestBody: { title: "REX OS Tasks" }
      });
      tasklistId = newList.data.id!;
    }
  } catch (err: any) {
    console.error("❌ Google Tasks List error:", err.message);
    return [];
  }

  const results: { id: number; googleTaskId: string | null }[] = [];

  // 2. Sync each task
  for (const t of tasks) {
    try {
      const taskBody = {
        title: t.text,
        status: t.completed ? "completed" : "needsAction"
      };

      if (!t.googleTaskId) {
        // Insert
        const res = await tasksApi.tasks.insert({
          tasklist: tasklistId,
          requestBody: taskBody
        });
        results.push({ id: t.id, googleTaskId: res.data.id || null });
      } else {
        // Update
        await tasksApi.tasks.patch({
          tasklist: tasklistId,
          task: t.googleTaskId,
          requestBody: taskBody
        });
        results.push({ id: t.id, googleTaskId: t.googleTaskId });
      }
    } catch (err: any) {
      console.error(`❌ Google Task Sync error for task ${t.id}:`, err.message);
      // If 404, insert again
      if (err.code === 404) {
        try {
          const res = await tasksApi.tasks.insert({
            tasklist: tasklistId,
            requestBody: { title: t.text, status: t.completed ? "completed" : "needsAction" }
          });
          results.push({ id: t.id, googleTaskId: res.data.id || null });
        } catch {
          results.push({ id: t.id, googleTaskId: null });
        }
      } else {
        results.push({ id: t.id, googleTaskId: t.googleTaskId || null });
      }
    }
  }

  return results;
}
