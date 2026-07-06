import { Router } from "express";
import prisma from "../db";

const router = Router();

// GET /api/notifications
router.get("/", async (_req, res) => {
  const notifs = await prisma.notification.findMany({ orderBy: { timestamp: "desc" } });
  res.json(notifs);
});

// POST /api/notifications
router.post("/", async (req, res) => {
  const { title, description, type, link } = req.body;
  const notif = await prisma.notification.create({
    data: { title, description, type: type || "info", isRead: false, timestamp: new Date().toISOString(), link },
  });
  res.status(201).json(notif);
});

// PATCH /api/notifications/:id/read
router.patch("/:id/read", async (req, res) => {
  const notif = await prisma.notification.update({
    where: { id: Number(req.params.id) },
    data: { isRead: true },
  });
  res.json(notif);
});

// PATCH /api/notifications/read-all
router.patch("/read-all", async (_req, res) => {
  await prisma.notification.updateMany({ data: { isRead: true } });
  res.json({ success: true });
});

export default router;
