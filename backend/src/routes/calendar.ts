import { Router } from "express";
import prisma from "../db";
import { syncEventToGoogleCalendar } from "../services/googleService";

const router = Router();

// GET /api/calendar
router.get("/", async (_req, res) => {
  const events = await prisma.calendarEvent.findMany({ orderBy: { date: "asc" } });
  res.json(events);
});

// POST /api/calendar
router.post("/", async (req, res) => {
  const { title, date, platform, color, isRecurring, status, beatId } = req.body;
  const event = await prisma.calendarEvent.create({
    data: { title, date, platform, color: color || "#ef4444", isRecurring: !!isRecurring, status: status || "scheduled", beatId },
  });

  // Sync to Google Calendar in real-time
  const settings = await prisma.appSettings.findFirst();
  if (settings?.googleCalendarId) {
    try {
      const googleEventId = await syncEventToGoogleCalendar(settings.googleCalendarId, event, "create");
      if (googleEventId) {
        const updatedEvent = await prisma.calendarEvent.update({
          where: { id: event.id },
          data: { googleEventId }
        });
        return res.status(201).json(updatedEvent);
      }
    } catch (e: any) {
      console.error("❌ Failed to sync calendar event on create:", e.message);
    }
  }

  res.status(201).json(event);
});

// PUT /api/calendar/:id
router.put("/:id", async (req, res) => {
  const { title, date, platform, color, isRecurring, status, beatId } = req.body;
  const event = await prisma.calendarEvent.update({
    where: { id: Number(req.params.id) },
    data: { title, date, platform, color, isRecurring: !!isRecurring, status, beatId },
  });

  // Sync to Google Calendar in real-time
  const settings = await prisma.appSettings.findFirst();
  if (settings?.googleCalendarId) {
    try {
      const googleEventId = await syncEventToGoogleCalendar(settings.googleCalendarId, event, "update");
      if (googleEventId && googleEventId !== event.googleEventId) {
        const updatedEvent = await prisma.calendarEvent.update({
          where: { id: event.id },
          data: { googleEventId }
        });
        return res.json(updatedEvent);
      }
    } catch (e: any) {
      console.error("❌ Failed to sync calendar event on update:", e.message);
    }
  }

  res.json(event);
});

// DELETE /api/calendar/:id
router.delete("/:id", async (req, res) => {
  const eventId = Number(req.params.id);
  const existing = await prisma.calendarEvent.findUnique({ where: { id: eventId } });

  if (existing) {
    // Sync deletion to Google Calendar
    const settings = await prisma.appSettings.findFirst();
    if (settings?.googleCalendarId && existing.googleEventId) {
      try {
        await syncEventToGoogleCalendar(settings.googleCalendarId, existing as any, "delete");
      } catch (e: any) {
        console.error("❌ Failed to delete calendar event from Google:", e.message);
      }
    }
    await prisma.calendarEvent.delete({ where: { id: eventId } });
  }

  res.json({ success: true });
});

export default router;
