import { Router } from "express";
import prisma from "../db";
import { exportDocToGoogleDocs } from "../services/googleService";
import { BackupService } from "../services/backup/BackupService";

const router = Router();

// GET /api/google/backup/status
router.get("/backup/status", async (_req, res) => {
  try {
    res.json(await BackupService.getStatus());
  } catch (err: any) {
    res.status(500).json({ error: "Backup status failed", message: err.message });
  }
});

// POST /api/google/backup/now
router.post("/backup/now", async (_req, res) => {
  try {
    const service = await BackupService.forGoogleSheets();
    res.json(await service.backupNow());
  } catch (err: any) {
    console.error("❌ Google Backup error:", err.message);
    await BackupService.recordFailure(err.message);
    res.status(503).json({ error: "Google backup failed", message: err.message });
  }
});

// POST /api/google/backup/restore
router.post("/backup/restore", async (_req, res) => {
  try {
    const service = await BackupService.forGoogleSheets();
    res.json(await service.restoreLatest());
  } catch (err: any) {
    console.error("❌ Google Restore error:", err.message);
    await BackupService.recordFailure(err.message);
    res.status(503).json({ error: "Google restore failed", message: err.message });
  }
});

// Deprecated: REX OS no longer does live or bidirectional Sheets sync.
router.post("/sheets/sync", (_req, res) => {
  res.status(410).json({ error: "Deprecated", message: "Use /api/google/backup/now. REX OS is the source of truth; Google Sheets is backup only." });
});

router.post("/sheets/import", (_req, res) => {
  res.status(410).json({ error: "Deprecated", message: "Use /api/google/backup/restore and only after explicit user confirmation." });
});

// POST /api/google/calendar/sync
router.post("/calendar/sync", (_req, res) => {
  res.status(410).json({ error: "Deprecated", message: "Google Calendar sync is disabled. REX OS uses Google only for backup snapshots." });
});

// POST /api/google/tasks/sync
router.post("/tasks/sync", (_req, res) => {
  res.status(410).json({ error: "Deprecated", message: "Google Tasks sync is disabled. REX OS uses Google only for backup snapshots." });
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
