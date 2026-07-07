/**
 * REX OS – Backend API Client
 * Thin fetch wrapper for all backend routes.
 * Falls back gracefully when the server is unreachable.
 */

const BASE = import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? "http://localhost:5001/api" : "/api");

// ─── Connection state (exported so TopNav can show a badge) ───────────────────
let _backendOnline = false;
export const isBackendOnline = () => _backendOnline;

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T | null> {
  try {
    const res = await fetch(`${BASE}${path}`, {
      ...options,
      headers: { "Content-Type": "application/json", ...(options.headers ?? {}) },
    });
    if (!res.ok) {
      console.warn(`[API] ${options.method ?? "GET"} ${path} → ${res.status}`);
      return null;
    }
    _backendOnline = true;
    return res.json() as Promise<T>;
  } catch {
    _backendOnline = false;
    return null;
  }
}

// ─── Health ───────────────────────────────────────────────────────────────────
export const checkStatus = () =>
  request<{ status: string; timestamp: string }>("/status");

// ─── Dashboard ────────────────────────────────────────────────────────────────
export const getDashboard = () => request<Record<string, unknown>>("/dashboard");

// ─── Beats ────────────────────────────────────────────────────────────────────
export const getBeats = () => request<unknown[]>("/beats");
export const createBeat = (data: unknown) =>
  request<unknown>("/beats", { method: "POST", body: JSON.stringify(data) });
export const updateBeat = (id: string, data: unknown) =>
  request<unknown>(`/beats/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteBeat = (id: string) =>
  request<{ success: boolean }>(`/beats/${id}`, { method: "DELETE" });

// ─── Projects ─────────────────────────────────────────────────────────────────
export const getProjects = () => request<unknown[]>("/projects");
export const createProject = (data: unknown) =>
  request<unknown>("/projects", { method: "POST", body: JSON.stringify(data) });
export const updateProject = (id: number, data: unknown) =>
  request<unknown>(`/projects/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteProject = (id: number) =>
  request<{ success: boolean }>(`/projects/${id}`, { method: "DELETE" });
export const addProjectTask = (projectId: number, data: unknown) =>
  request<unknown>(`/projects/${projectId}/tasks`, { method: "POST", body: JSON.stringify(data) });
export const toggleProjectTask = (projectId: number, taskId: number) =>
  request<unknown>(`/projects/${projectId}/tasks/${taskId}/toggle`, { method: "PATCH" });
export const toggleMilestone = (projectId: number, milestoneId: number) =>
  request<unknown>(`/projects/${projectId}/milestones/${milestoneId}/toggle`, { method: "PATCH" });

// ─── Publishing ───────────────────────────────────────────────────────────────
export const getPublishing = () => request<unknown[]>("/publishing");
export const createPublishingCard = (data: unknown) =>
  request<unknown>("/publishing", { method: "POST", body: JSON.stringify(data) });
export const movePublishingCard = (id: number, columnId: string) =>
  request<unknown>(`/publishing/${id}/column`, { method: "PATCH", body: JSON.stringify({ columnId }) });
export const updatePublishingCard = (id: number, data: unknown) =>
  request<unknown>(`/publishing/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deletePublishingCard = (id: number) =>
  request<{ success: boolean }>(`/publishing/${id}`, { method: "DELETE" });

// ─── Goals ────────────────────────────────────────────────────────────────────
export const getGoals = () => request<{ annual: unknown[]; quarterly: unknown[]; monthly: unknown[] }>("/goals");
export const updateMonthlyGoalProgress = (id: number, current: number) =>
  request<unknown>(`/goals/monthly/${id}/progress`, { method: "PATCH", body: JSON.stringify({ current }) });
export const createMonthlyGoal = (data: unknown) =>
  request<unknown>("/goals/monthly", { method: "POST", body: JSON.stringify(data) });
export const deleteMonthlyGoal = (id: number) =>
  request<{ success: boolean }>(`/goals/monthly/${id}`, { method: "DELETE" });

// ─── Action Items ─────────────────────────────────────────────────────────────
export const getActionItems = () => request<unknown[]>("/action-items");
export const createActionItem = (data: unknown) =>
  request<unknown>("/action-items", { method: "POST", body: JSON.stringify(data) });
export const toggleActionItem = (id: number) =>
  request<unknown>(`/action-items/${id}/toggle`, { method: "PATCH" });
export const reorderActionItems = (items: { id: number; sortOrder: number }[]) =>
  request<{ success: boolean }>("/action-items/reorder", { method: "PUT", body: JSON.stringify({ items }) });
export const deleteActionItem = (id: number) =>
  request<{ success: boolean }>(`/action-items/${id}`, { method: "DELETE" });

// ─── Mission Control ──────────────────────────────────────────────────────────
export const getMissionControl = () => request<unknown>("/mission-control");
export const updateMissionControl = (data: { oneImportantTask?: string; notes?: string }) =>
  request<unknown>("/mission-control", { method: "PUT", body: JSON.stringify(data) });
export const createSecondaryTask = (data: unknown) =>
  request<unknown>("/mission-control/tasks", { method: "POST", body: JSON.stringify(data) });
export const toggleSecondaryTask = (id: number) =>
  request<unknown>(`/mission-control/tasks/${id}/toggle`, { method: "PATCH" });
export const reorderSecondaryTasks = (items: { id: number; sortOrder: number }[]) =>
  request<{ success: boolean }>("/mission-control/tasks/reorder", { method: "PUT", body: JSON.stringify({ items }) });
export const deleteSecondaryTask = (id: number) =>
  request<{ success: boolean }>(`/mission-control/tasks/${id}`, { method: "DELETE" });

// ─── Weekly Review ────────────────────────────────────────────────────────────
export const getWeeklyReview = () => request<unknown>("/weekly-review");
export const updateWeeklyReview = (data: unknown) =>
  request<unknown>("/weekly-review", { method: "PUT", body: JSON.stringify(data) });

// ─── Activity Log ─────────────────────────────────────────────────────────────
export const getActivityLog = () => request<unknown[]>("/activity-log");
export const createActivityLog = (data: unknown) =>
  request<unknown>("/activity-log", { method: "POST", body: JSON.stringify(data) });

// ─── Daily Log ────────────────────────────────────────────────────────────────
export const getDailyLogs = () => request<unknown[]>("/daily-log");
export const createDailyLog = (data: unknown) =>
  request<unknown>("/daily-log", { method: "POST", body: JSON.stringify(data) });
export const updateDailyLog = (id: number, data: unknown) =>
  request<unknown>(`/daily-log/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteDailyLog = (id: number) =>
  request<{ success: boolean }>(`/daily-log/${id}`, { method: "DELETE" });

// ─── Knowledge Vault ──────────────────────────────────────────────────────────
export const getKnowledge = () => request<unknown[]>("/knowledge");
export const createKnowledgeEntry = (data: unknown) =>
  request<unknown>("/knowledge", { method: "POST", body: JSON.stringify(data) });
export const updateKnowledgeEntry = (id: number, data: unknown) =>
  request<unknown>(`/knowledge/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const toggleKnowledgeFavorite = (id: number) =>
  request<unknown>(`/knowledge/${id}/favorite`, { method: "PATCH" });
export const deleteKnowledgeEntry = (id: number) =>
  request<{ success: boolean }>(`/knowledge/${id}`, { method: "DELETE" });

// ─── Assets ───────────────────────────────────────────────────────────────────
export const getAssets = () => request<unknown[]>("/assets");
export const createAsset = (data: unknown) =>
  request<unknown>("/assets", { method: "POST", body: JSON.stringify(data) });
export const updateAsset = (id: number, data: unknown) =>
  request<unknown>(`/assets/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteAsset = (id: number) =>
  request<{ success: boolean }>(`/assets/${id}`, { method: "DELETE" });

// ─── Notifications ────────────────────────────────────────────────────────────
export const getNotifications = () => request<unknown[]>("/notifications");
export const markNotificationRead = (id: number) =>
  request<unknown>(`/notifications/${id}/read`, { method: "PATCH" });
export const markAllNotificationsRead = () =>
  request<{ success: boolean }>("/notifications/read-all", { method: "PATCH" });
export const createNotification = (data: unknown) =>
  request<unknown>("/notifications", { method: "POST", body: JSON.stringify(data) });

// ─── Calendar ─────────────────────────────────────────────────────────────────
export const getCalendarEvents = () => request<unknown[]>("/calendar");
export const createCalendarEvent = (data: unknown) =>
  request<unknown>("/calendar", { method: "POST", body: JSON.stringify(data) });
export const updateCalendarEvent = (id: number, data: unknown) =>
  request<unknown>(`/calendar/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteCalendarEvent = (id: number) =>
  request<{ success: boolean }>(`/calendar/${id}`, { method: "DELETE" });

// ─── Settings ─────────────────────────────────────────────────────────────────
export const getSettings = () => request<unknown>("/settings");
export const updateSettings = (data: unknown) =>
  request<unknown>("/settings", { method: "PUT", body: JSON.stringify(data) });

// ─── Google Integrations ──────────────────────────────────────────────────────
export const syncSheets = () =>
  request<{ success: boolean; message: string }>("/google/sheets/sync", { method: "POST" });

export const syncCalendar = () =>
  request<{ success: boolean; message: string }>("/google/calendar/sync", { method: "POST" });

export const syncTasks = () =>
  request<{ success: boolean; message: string }>("/google/tasks/sync", { method: "POST" });

export const exportToGoogleDoc = (id: number) =>
  request<{ success: boolean; url: string }>(`/google/docs/export/${id}`, { method: "POST" });
