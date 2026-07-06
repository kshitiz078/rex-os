import { Router } from "express";
import prisma from "../db";

const router = Router();

const mapProject = (p: {
  id: number; name: string; description: string; progress: number; status: string;
  statusColor: string; priority: string; priorityColor: string; deadline: string;
  recentActivity: string; notes: string; timeInvested: number; health: string;
  createdAt: Date; updatedAt: Date;
  tasks: { id: number; text: string; completed: boolean; priority: string; dueDate: string | null }[];
  milestones: { id: number; text: string; completed: boolean }[];
}) => ({
  id: p.id,
  name: p.name,
  description: p.description,
  progress: p.progress,
  status: p.status,
  statusColor: p.statusColor,
  priority: p.priority,
  priorityColor: p.priorityColor,
  deadline: p.deadline,
  recentActivity: p.recentActivity,
  notes: p.notes,
  timeInvested: p.timeInvested,
  health: p.health,
  tasks: p.tasks,
  milestones: p.milestones,
});

// GET /api/projects
router.get("/", async (_req, res) => {
  const projects = await prisma.project.findMany({
    include: { tasks: true, milestones: true },
    orderBy: { id: "asc" },
  });
  res.json(projects.map(mapProject));
});

// POST /api/projects
router.post("/", async (req, res) => {
  const { name, description, priority, deadline, milestones } = req.body;
  const project = await prisma.project.create({
    data: {
      name, description, priority,
      priorityColor: priority === "High" ? "text-orange-500 bg-orange-500/10" : "text-yellow-600 bg-yellow-500/10",
      deadline: deadline || "TBD",
      milestones: {
        create: (milestones || []).map((m: string) => ({ text: m, completed: false })),
      },
      tasks: {
        create: [{ text: "Define project scope", completed: false, priority: "High" }],
      },
    },
    include: { tasks: true, milestones: true },
  });
  res.status(201).json(mapProject(project));
});

// PUT /api/projects/:id
router.put("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { name, description, progress, status, statusColor, priority, priorityColor, deadline,
    recentActivity, notes, timeInvested, health } = req.body;

  const project = await prisma.project.update({
    where: { id },
    data: { name, description, progress, status, statusColor, priority, priorityColor,
      deadline, recentActivity, notes, timeInvested, health },
    include: { tasks: true, milestones: true },
  });
  res.json(mapProject(project));
});

// DELETE /api/projects/:id
router.delete("/:id", async (req, res) => {
  await prisma.project.delete({ where: { id: Number(req.params.id) } });
  res.json({ success: true });
});

// POST /api/projects/:id/tasks  — add a task
router.post("/:id/tasks", async (req, res) => {
  const projectId = Number(req.params.id);
  const { text, priority, dueDate } = req.body;
  const task = await prisma.projectTask.create({
    data: { text, priority: priority || "Medium", dueDate, projectId },
  });
  res.status(201).json(task);
});

// PATCH /api/projects/:id/tasks/:taskId/toggle  — toggle task completion
router.patch("/:id/tasks/:taskId/toggle", async (req, res) => {
  const taskId = Number(req.params.taskId);
  const projectId = Number(req.params.id);

  const task = await prisma.projectTask.findUnique({ where: { id: taskId } });
  if (!task) return res.status(404).json({ error: "Task not found" });

  const updated = await prisma.projectTask.update({
    where: { id: taskId },
    data: { completed: !task.completed },
  });

  // Recalculate project progress
  const allTasks = await prisma.projectTask.findMany({ where: { projectId } });
  const completedCount = allTasks.filter((t) => t.completed).length;
  const progress = allTasks.length > 0 ? Math.round((completedCount / allTasks.length) * 100) : 0;
  await prisma.project.update({ where: { id: projectId }, data: { progress } });

  res.json(updated);
});

// PATCH /api/projects/:id/milestones/:milestoneId/toggle
router.patch("/:id/milestones/:milestoneId/toggle", async (req, res) => {
  const milestoneId = Number(req.params.milestoneId);
  const milestone = await prisma.milestone.findUnique({ where: { id: milestoneId } });
  if (!milestone) return res.status(404).json({ error: "Milestone not found" });
  const updated = await prisma.milestone.update({
    where: { id: milestoneId },
    data: { completed: !milestone.completed },
  });
  res.json(updated);
});

export default router;
