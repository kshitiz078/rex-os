import { Router } from "express";
import prisma from "../db";
import {
  syncSheetsData,
  syncEventToGoogleCalendar,
  exportDocToGoogleDocs,
  syncTasksToGoogleTasks
} from "../services/googleService";

const router = Router();

// POST /api/google/sheets/sync
router.post("/sheets/sync", async (_req, res) => {
  try {
    const settings = await prisma.appSettings.findFirst();
    const sheetId = settings?.googleSheetId || process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

    if (!sheetId) {
      return res.status(400).json({ error: "Google Spreadsheet ID is not configured." });
    }

    const beats = await prisma.beat.findMany();
    const projects = await prisma.project.findMany();
    const actionItems = await prisma.actionItem.findMany({ orderBy: { sortOrder: "asc" } });
    const dailyLogs = await prisma.dailyLog.findMany({ orderBy: { date: "desc" } });

    await syncSheetsData(sheetId, {
      beats,
      projects,
      actionItems,
      dailyLogs,
      goals: [] // Optional
    });

    res.json({ success: true, message: "Google Sheets synchronized successfully!" });
  } catch (err: any) {
    console.error("❌ Google Sheets Sync Endpoint error:", err.message);
    res.status(500).json({ error: "Google Sheets Sync failed", message: err.message });
  }
});

// POST /api/google/calendar/sync
router.post("/calendar/sync", async (_req, res) => {
  try {
    const settings = await prisma.appSettings.findFirst();
    const calendarId = settings?.googleCalendarId;

    if (!calendarId) {
      return res.status(400).json({ error: "Google Calendar ID is not configured." });
    }

    const events = await prisma.calendarEvent.findMany();
    let syncedCount = 0;

    for (const event of events) {
      const googleEventId = await syncEventToGoogleCalendar(calendarId, event, "create");
      if (googleEventId && googleEventId !== event.googleEventId) {
        await prisma.calendarEvent.update({
          where: { id: event.id },
          data: { googleEventId }
        });
        syncedCount++;
      }
    }

    res.json({ success: true, message: `Calendar synchronized successfully! Synced ${events.length} events.` });
  } catch (err: any) {
    console.error("❌ Google Calendar Sync Endpoint error:", err.message);
    res.status(500).json({ error: "Google Calendar Sync failed", message: err.message });
  }
});

// POST /api/google/tasks/sync
router.post("/tasks/sync", async (_req, res) => {
  try {
    const actionItems = await prisma.actionItem.findMany();
    const secondaryTasks = await prisma.secondaryTask.findMany();

    // Map Action Items
    const tasksToSync = [
      ...actionItems.map(item => ({
        id: item.id,
        text: `[Action] ${item.text}`,
        completed: item.completed,
        googleTaskId: item.googleTaskId,
        isSecondary: false
      })),
      ...secondaryTasks.map(item => ({
        id: item.id,
        text: `[Secondary] ${item.text}`,
        completed: item.completed,
        googleTaskId: item.googleTaskId,
        isSecondary: true
      }))
    ];

    const syncResults = await syncTasksToGoogleTasks(tasksToSync);

    for (const result of syncResults) {
      if (result.googleTaskId) {
        const item = tasksToSync.find(t => t.id === result.id && t.googleTaskId === result.googleTaskId);
        if (item) {
          if (item.isSecondary) {
            await prisma.secondaryTask.update({
              where: { id: result.id },
              data: { googleTaskId: result.googleTaskId }
            });
          } else {
            await prisma.actionItem.update({
              where: { id: result.id },
              data: { googleTaskId: result.googleTaskId }
            });
          }
        } else {
          // If googleTaskId was newly assigned
          const itemNew = tasksToSync.find(t => t.id === result.id);
          if (itemNew) {
            if (itemNew.isSecondary) {
              await prisma.secondaryTask.update({
                where: { id: result.id },
                data: { googleTaskId: result.googleTaskId }
              });
            } else {
              await prisma.actionItem.update({
                where: { id: result.id },
                data: { googleTaskId: result.googleTaskId }
              });
            }
          }
        }
      }
    }

    res.json({ success: true, message: "Tasks synchronized successfully!" });
  } catch (err: any) {
    console.error("❌ Google Tasks Sync Endpoint error:", err.message);
    res.status(500).json({ error: "Google Tasks Sync failed", message: err.message });
  }
});

// POST /api/google/docs/export/:id
router.post("/docs/export/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const entry = await prisma.knowledgeEntry.findUnique({ where: { id } });

    if (!entry) {
      return res.status(404).json({ error: "Knowledge Entry not found" });
    }

    const settings = await prisma.appSettings.findFirst();
    const userGmail = settings?.userGmailAddress || "";

    const docTitle = `REX OS Vault - ${entry.title}`;
    const docContent = `
=========================================
REX KNOWLEDGE VAULT ENTRY
=========================================
Title: ${entry.title}
Category: ${entry.category}
Tags: ${entry.tags}
Date Added: ${entry.dateAdded}
Original URL: ${entry.url || "None"}

-----------------------------------------
CONTENT
-----------------------------------------
${entry.content}

=========================================
Created via REX OS Integration
    `;

    const webViewLink = await exportDocToGoogleDocs(userGmail, docTitle, docContent);

    // Update Knowledge Entry URL
    await prisma.knowledgeEntry.update({
      where: { id },
      data: { url: webViewLink }
    });

    res.json({ success: true, url: webViewLink });
  } catch (err: any) {
    console.error("❌ Google Docs Export Endpoint error:", err.message);
    res.status(500).json({ error: "Google Docs Export failed", message: err.message });
  }
});

export default router;
