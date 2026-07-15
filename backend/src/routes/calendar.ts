import { Router } from "express";
import prisma from "../db";

const router = Router();

// GET /api/calendar
router.get("/", async (_req, res) => {
  const events = await prisma.calendarEvent.findMany({ orderBy: { date: "asc" } });
  res.json(events);
});

// POST /api/calendar
router.post("/", async (req, res) => {
  const { title, description, date, platform, color, isRecurring, status, notes, beatId, projectId } = req.body;
  const event = await prisma.calendarEvent.create({
    data: {
      title,
      description: description || "",
      date,
      platform: platform || "",
      color: color || "#ef4444",
      isRecurring: !!isRecurring,
      status: status || "scheduled",
      notes: notes || "",
      beatId: beatId || null,
      projectId: projectId ? Number(projectId) : null,
    },
  });
  res.status(201).json(event);
});

// PUT /api/calendar/:id
router.put("/:id", async (req, res) => {
  const { title, description, date, platform, color, isRecurring, status, notes, beatId, projectId } = req.body;
  const event = await prisma.calendarEvent.update({
    where: { id: Number(req.params.id) },
    data: {
      title,
      description: description ?? undefined,
      date,
      platform: platform ?? undefined,
      color,
      isRecurring: !!isRecurring,
      status,
      notes: notes ?? undefined,
      beatId: beatId || null,
      projectId: projectId ? Number(projectId) : null,
    },
  });
  res.json(event);
});

// DELETE /api/calendar/:id
router.delete("/:id", async (req, res) => {
  const eventId = Number(req.params.id);
  const existing = await prisma.calendarEvent.findUnique({ where: { id: eventId } });
  if (existing) await prisma.calendarEvent.delete({ where: { id: eventId } });
  res.json({ success: true });
});

export default router;
