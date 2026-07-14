import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import * as api from "../services/api";

// ============================================================
// TYPES
// ============================================================

export interface Beat {
  id: string;
  name: string;
  genre: string;
  mood: string;
  bpm: number;
  key: string;
  duration: string;
  videoTheme: string;
  status: 'Published' | 'Ready' | 'In Progress' | 'Archived';
  mixStatus: 'Done' | 'In Progress' | 'Not Started';
  masterStatus: 'Done' | 'In Progress' | 'Not Started';
  videoStatus: 'Done' | 'In Progress' | 'Not Started';
  timeSignature: string;
  coverArt: string;
  platforms: { youtube: string; spotify: string; beatstars: string; airbit: string; appleMusic: string; soundcloud: string; instagram: string; tiktok: string };
  tags: string[];
  notes: string;
  dateCreated: string;
}

export interface ProjectTask {
  id: number;
  text: string;
  completed: boolean;
  priority: 'High' | 'Medium' | 'Low';
  dueDate?: string;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  category: string;
  owner: string;
  tags: string[];
  estimatedEffort: string;
  progress: number;
  status: 'Active' | 'In Progress' | 'Ongoing' | 'Completed' | 'At Risk';
  statusColor: string;
  priority: string;
  priorityColor: string;
  deadline: string;
  startDate: string;
  estimatedCompletion: string;
  linkedGoals: string; // JSON array of goal IDs/Titles
  deliverables: string; // JSON array of deliverable texts
  links: string; // JSON array of { name, url }
  files: string; // JSON array of { name, url/path }
  activities: string; // JSON array of { timestamp, text }
  milestones: { text: string; completed: boolean }[];
  recentActivity: string;
  tasks: ProjectTask[];
  notes: string;
  timeInvested: number; // hours
  health: 'On Track' | 'At Risk' | 'Completed';
}

export interface PublishingCard {
  id: number;
  columnId: string;
  title: string;
  platform: string;
  priority: string;
  publishDate: string;
  estTime: string;
  status: string;
  beatId?: string;
}

export interface AnnualGoal {
  id: number;
  title: string;
  targetDate: string;
  progress: number;
  status: string;
  quarterlyGoalIds: number[];
}

export interface QuarterlyGoal {
  id: number;
  title: string;
  targetDate: string;
  progress: number;
  status: string;
  annualGoalId?: number;
  monthlyGoalIds: number[];
}

export interface MonthlyGoal {
  id: number;
  title: string;
  progress: number;
  current: number;
  total: number;
  unit: string;
  type: 'monthly' | 'quarterly' | 'annual';
  category: string;
  quarterlyGoalId?: number;
}

export interface ActionItem {
  id: number;
  text: string;
  completed: boolean;
  priority?: 'High' | 'Medium' | 'Low';
  estimatedMinutes?: number;
  project?: string;
  energy?: 'High' | 'Medium' | 'Low';
}

export interface SecondaryTask {
  id: number;
  text: string;
  completed: boolean;
  priority?: 'High' | 'Medium' | 'Low';
  estimatedMinutes?: number;
  project?: string;
  energy?: 'High' | 'Medium' | 'Low';
}

export interface WeeklyReviewData {
  score: number;
  scoreTrend: string;
  biggestWin: string;
  biggestMistake: string;
  lessonsLearned: string;
  goalsNextWeek: string;
  weeklyNotes: string;
  doomscrollingHours: number;
  synthTweakingHours: number;
  videosPublished: number;
  beatsFinished: number;
  tasksCompleted: number;
  focusHours: number;
  publishingStreak: number;
}

export interface ActivityLog {
  id: number;
  timestamp: string;
  type: 'beat_published' | 'task_completed' | 'project_updated' | 'goal_achieved' | 'upload_scheduled' | 'focus_session';
  title: string;
  description: string;
  icon: string;
  color: string;
}

export interface DailyLog {
  id: number;
  date: string;
  category: string;
  task: string;
  output: string;
  timeSpent: number; // minutes
  status: 'Completed' | 'In Progress' | 'Blocked';
  notes: string;
  nextAction: string;
}

export interface KnowledgeEntry {
  id: number;
  title: string;
  category: 'Idea' | 'Inspiration' | 'Lyrics' | 'Business' | 'Marketing' | 'Link' | 'Reference';
  content: string;
  tags: string[];
  url?: string;
  dateAdded: string;
  isFavorite: boolean;
}

export interface Asset {
  id: number;
  name: string;
  type: 'Cover Art' | 'Video' | 'Export' | 'Master' | 'Stem' | 'Template' | 'Brand';
  driveLink: string;
  previewUrl: string;
  beatId?: string;
  projectId?: number;
  tags: string[];
  dateAdded: string;
  notes: string;
}

export interface Notification {
  id: number;
  title: string;
  description: string;
  type: 'warning' | 'info' | 'success' | 'urgent';
  isRead: boolean;
  timestamp: string;
  link?: string;
}

export interface CalendarEvent {
  id: number;
  title: string;
  date: string;
  platform: string;
  color: string;
  isRecurring: boolean;
  status: 'scheduled' | 'published' | 'overdue' | 'draft';
  beatId?: string;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  defaultFocusMinutes: number;
  defaultBreakMinutes: number;
  defaultUploadPlatforms: string[];
  notificationsEnabled: boolean;
  publishingStreakGoal: number;
  googleSheetId: string;
  googleCalendarId: string;
  userGmailAddress: string;
  googleSyncEnabled: boolean;
  lastBackupAt?: string | null;
  backupStatus?: string;
  backupError?: string;
}

// ============================================================
// CONTEXT TYPE
// ============================================================

export interface AppContextType {
  // Beats
  beats: Beat[];
  addBeat: (beat: Omit<Beat, "id" | "dateCreated">) => void;
  updateBeat: (beat: Beat) => void;
  publishBeat: (beatId: string) => void;
  deleteBeat: (beatId: string) => void;

  // Projects
  projects: Project[];
  addProject: (project: Omit<Project, "id" | "progress" | "status" | "statusColor" | "priorityColor" | "recentActivity" | "tasks" | "notes" | "timeInvested" | "health" | "activities">) => void;
  updateProjectProgress: (id: number, progress: number) => void;
  updateProject: (project: Project) => void;
  toggleProjectTask: (projectId: number, taskId: number) => void;
  addProjectTask: (projectId: number, task: Omit<ProjectTask, 'id'>) => void;
  editProjectTask: (projectId: number, taskId: number, task: Omit<ProjectTask, 'id'>) => void;
  deleteProjectTask: (projectId: number, taskId: number) => void;

  // Publishing
  publishingCards: PublishingCard[];
  addPublishingCard: (card: Omit<PublishingCard, "id">) => void;
  updatePublishingCardColumn: (id: number, columnId: string) => void;
  editPublishingCard: (id: number, updates: Partial<PublishingCard>) => void;
  deletePublishingCard: (id: number) => void;

  // Goals
  annualGoals: AnnualGoal[];
  quarterlyGoals: QuarterlyGoal[];
  monthlyGoals: MonthlyGoal[];
  updateGoalProgress: (id: number, current: number) => void;
  updateGoal: (id: number, updates: Partial<MonthlyGoal>) => void;
  addGoal: (goal: Omit<MonthlyGoal, 'id' | 'progress'>) => void;
  deleteGoal: (id: number) => void;

  // Action Items
  actionItems: ActionItem[];
  addActionItem: (item: Omit<ActionItem, 'id' | 'completed'>) => void;
  toggleActionItem: (id: number) => void;
  deleteActionItem: (id: number) => void;
  reorderActionItems: (items: ActionItem[]) => void;

  // Weekly Review
  weeklyReview: WeeklyReviewData;
  updateWeeklyReview: (data: Partial<WeeklyReviewData>) => void;

  // Mission Control
  oneImportantTask: string;
  setOneImportantTask: (task: string) => void;
  secondaryTasks: SecondaryTask[];
  addSecondaryTask: (task: Omit<SecondaryTask, 'id' | 'completed'>) => void;
  toggleSecondaryTask: (id: number) => void;
  deleteSecondaryTask: (id: number) => void;
  reorderSecondaryTasks: (tasks: SecondaryTask[]) => void;
  notes: string;
  setNotes: (notes: string) => void;

  // Activity Log
  activityLog: ActivityLog[];
  addActivity: (activity: Omit<ActivityLog, 'id' | 'timestamp'>) => void;

  // Daily Log
  dailyLogs: DailyLog[];
  addDailyLog: (log: Omit<DailyLog, 'id'>) => void;
  updateDailyLog: (log: DailyLog) => void;
  deleteDailyLog: (id: number) => void;

  // Knowledge Vault
  knowledgeEntries: KnowledgeEntry[];
  addKnowledgeEntry: (entry: Omit<KnowledgeEntry, 'id' | 'dateAdded'>) => void;
  updateKnowledgeEntry: (entry: KnowledgeEntry) => void;
  deleteKnowledgeEntry: (id: number) => void;
  toggleKnowledgeFavorite: (id: number) => void;

  // Assets
  assets: Asset[];
  addAsset: (asset: Omit<Asset, 'id' | 'dateAdded'>) => void;
  updateAsset: (asset: Asset) => void;
  deleteAsset: (id: number) => void;

  // Notifications
  notifications: Notification[];
  markNotificationRead: (id: number) => void;
  markAllNotificationsRead: () => void;
  addNotification: (notif: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => void;

  // Calendar Events
  calendarEvents: CalendarEvent[];
  addCalendarEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  updateCalendarEvent: (event: CalendarEvent) => void;
  deleteCalendarEvent: (id: number) => void;

  // Settings
  appSettings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => void;
  resetPortal: () => void;

  // Derived Stats
  publishingStreak: number;
  totalFocusHours: number;
  weeklyCompletionRate: number;
  monthlyCompletionRate: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// ============================================================
// INITIAL DATA
// ============================================================

const initialBeats: Beat[] = [
  {
    id: "B-042", name: "Midnight Drift", genre: "Trap", mood: "Dark", bpm: 140, key: "C Min",
    duration: "2:45", videoTheme: "Cyberpunk City", status: "Published",
    mixStatus: "Done", masterStatus: "Done", videoStatus: "Done", timeSignature: "4/4", coverArt: "",
    platforms: { youtube: "Published", spotify: "Published", beatstars: "Published", airbit: "Draft", appleMusic: "Draft", soundcloud: "Draft", instagram: "Draft", tiktok: "Draft" },
    tags: ["dark", "trap", "808"], notes: "Best seller on BeatStars", dateCreated: "2026-06-28",
  },
  {
    id: "B-043", name: "Summer Breeze", genre: "R&B", mood: "Chill", bpm: 95, key: "F Maj",
    duration: "3:10", videoTheme: "Sunset Beach", status: "Ready",
    mixStatus: "Done", masterStatus: "In Progress", videoStatus: "Not Started", timeSignature: "4/4", coverArt: "",
    platforms: { youtube: "Draft", spotify: "Draft", beatstars: "Published", airbit: "Draft", appleMusic: "Draft", soundcloud: "Draft", instagram: "Draft", tiktok: "Draft" },
    tags: ["chill", "rnb", "summer"], notes: "Needs thumbnail before publishing", dateCreated: "2026-07-01",
  },
  {
    id: "B-044", name: "Titanium", genre: "Drill", mood: "Aggressive", bpm: 142, key: "D Min",
    duration: "2:15", videoTheme: "Industrial", status: "In Progress",
    mixStatus: "In Progress", masterStatus: "Not Started", videoStatus: "Not Started", timeSignature: "4/4", coverArt: "",
    platforms: { youtube: "Draft", spotify: "Draft", beatstars: "Draft", airbit: "Draft", appleMusic: "Draft", soundcloud: "Draft", instagram: "Draft", tiktok: "Draft" },
    tags: ["drill", "aggressive", "hard"], notes: "WIP - mixing in progress", dateCreated: "2026-07-02",
  },
  {
    id: "B-045", name: "Cloud Nine", genre: "Lo-Fi", mood: "Relaxed", bpm: 85, key: "G Maj",
    duration: "2:55", videoTheme: "Anime Rain", status: "Published",
    mixStatus: "Done", masterStatus: "Done", videoStatus: "Done", timeSignature: "4/4", coverArt: "",
    platforms: { youtube: "Published", spotify: "Published", beatstars: "Published", airbit: "Published", appleMusic: "Draft", soundcloud: "Draft", instagram: "Draft", tiktok: "Draft" },
    tags: ["lofi", "chill", "anime"], notes: "Featured playlist on Spotify", dateCreated: "2026-06-15",
  },
];

const initialProjects: Project[] = [
  {
    id: 1, name: "Rex Music", description: "Core music production and artist releases.", progress: 68,
    category: "General", owner: "CEO", tags: ["music", "ep"], estimatedEffort: "2 months",
    status: "Active", statusColor: "text-emerald-500 bg-emerald-500/10",
    priority: "High", priorityColor: "text-orange-500 bg-orange-500/10", deadline: "Q3 2026",
    startDate: "2026-06-01", estimatedCompletion: "2026-09-30", linkedGoals: "[]", deliverables: "[]", links: "[]", files: "[]", activities: "[]",
    milestones: [
      { text: "Finish 'Neon City' EP", completed: true },
      { text: "Shoot music video", completed: false },
      { text: "Distribute to Spotify", completed: false }
    ],
    recentActivity: "Uploaded stem files for mixing",
    tasks: [
      { id: 1, text: "Record vocals for EP closer", completed: false, priority: "High" },
      { id: 2, text: "Mix and master EP tracks", completed: true, priority: "High" },
      { id: 3, text: "Design album artwork", completed: false, priority: "Medium" },
      { id: 4, text: "Submit to DistroKid", completed: false, priority: "High" },
    ],
    notes: "Focus on consistent EP rollout. Priority is finishing mixes.", timeInvested: 48, health: "On Track",
  },
  {
    id: 2, name: "Beat Selling Website", description: "E-commerce platform for leasing and selling beats.",
    category: "Business", owner: "Tech Lead", tags: ["web", "ecommerce"], estimatedEffort: "1 month",
    progress: 45, status: "In Progress", statusColor: "text-blue-500 bg-blue-500/10",
    priority: "High", priorityColor: "text-orange-500 bg-orange-500/10", deadline: "Aug 15, 2026",
    startDate: "2026-07-01", estimatedCompletion: "2026-08-15", linkedGoals: "[]", deliverables: "[]", links: "[]", files: "[]", activities: "[]",
    milestones: [
      { text: "Design UI/UX", completed: true },
      { text: "Integrate Stripe", completed: true },
      { text: "Upload initial catalog (50 beats)", completed: false }
    ],
    recentActivity: "Completed Stripe API integration",
    tasks: [
      { id: 1, text: "Upload 50 beats to catalog", completed: false, priority: "High" },
      { id: 2, text: "Write product descriptions", completed: false, priority: "Medium" },
      { id: 3, text: "Test checkout flow", completed: true, priority: "High" },
    ],
    notes: "Go-live target is August. Need 50 beats minimum to launch.", timeInvested: 32, health: "On Track",
  },
  {
    id: 3, name: "Personal Brand", description: "Content creation, YouTube channel, and social media growth.",
    category: "Marketing", owner: "Creator", tags: ["youtube", "brand"], estimatedEffort: "Ongoing",
    progress: 85, status: "Ongoing", statusColor: "text-primary bg-primary/10",
    priority: "Medium", priorityColor: "text-yellow-600 bg-yellow-500/10", deadline: "Continuous",
    startDate: "2026-01-01", estimatedCompletion: "Continuous", linkedGoals: "[]", deliverables: "[]", links: "[]", files: "[]", activities: "[]",
    milestones: [
      { text: "Reach 10k YouTube Subs", completed: false },
      { text: "Launch weekly newsletter", completed: true },
      { text: "Collab with 2 creators", completed: false }
    ],
    recentActivity: "Published 'Studio Tour' video",
    tasks: [
      { id: 1, text: "Film studio setup video", completed: true, priority: "Medium" },
      { id: 2, text: "Write newsletter issue #4", completed: false, priority: "Low" },
    ],
    notes: "YouTube growth is key. Double down on tutorials.", timeInvested: 22, health: "On Track",
  },
];

const initialPublishingCards: PublishingCard[] = [
  { id: 1, columnId: "mixing", title: "How to mix 808s", platform: "youtube", priority: "High", publishDate: "TBD", estTime: "2h", status: "Editing" },
  { id: 2, columnId: "idea", title: "Lo-Fi Sample Pack Promo", platform: "youtube", priority: "Medium", publishDate: "TBD", estTime: "1h", status: "Concept" },
  { id: 3, columnId: "ready", title: "Midnight Drift Beat", platform: "beatstars", priority: "High", publishDate: "Jul 4, 2026", estTime: "15m", status: "Uploaded" },
  { id: 4, columnId: "scheduled", title: "Summer Breeze EP", platform: "spotify", priority: "Highest", publishDate: "Jul 10, 2026", estTime: "0m", status: "Scheduled" },
  { id: 5, columnId: "published", title: "Studio Tour 2026", platform: "youtube", priority: "Medium", publishDate: "Jun 25, 2026", estTime: "0m", status: "Live" },
];

const initialAnnualGoals: AnnualGoal[] = [
  { id: 1, title: "Reach 100k YouTube Subscribers", targetDate: "Dec 31, 2026", progress: 65, status: "On Track", quarterlyGoalIds: [2] },
  { id: 2, title: "Generate $50k in Beat Sales", targetDate: "Dec 31, 2026", progress: 42, status: "At Risk", quarterlyGoalIds: [1] },
  { id: 3, title: "Release Debut Album", targetDate: "Oct 15, 2026", progress: 80, status: "Ahead", quarterlyGoalIds: [] },
];

const initialQuarterlyGoals: QuarterlyGoal[] = [
  { id: 1, title: "Launch New Beat Store", targetDate: "Jul 31, 2026", progress: 100, status: "Completed", annualGoalId: 2, monthlyGoalIds: [2] },
  { id: 2, title: "Grow Mailing List to 5k", targetDate: "Sep 30, 2026", progress: 35, status: "On Track", annualGoalId: 1, monthlyGoalIds: [1, 3] },
];

const initialMonthlyGoals: MonthlyGoal[] = [
  { id: 1, title: "Publish 4 YouTube Videos", progress: 50, current: 2, total: 4, unit: "videos", type: "monthly", category: "Growth", quarterlyGoalId: 2 },
  { id: 2, title: "Upload 10 New Beats", progress: 80, current: 8, total: 10, unit: "beats", type: "monthly", category: "Production", quarterlyGoalId: 1 },
  { id: 3, title: "Collaborate with 2 Artists", progress: 0, current: 0, total: 2, unit: "artists", type: "monthly", category: "Growth", quarterlyGoalId: 2 },
];

const initialActionItems: ActionItem[] = [
  { id: 1, text: "Record B-roll for studio vlog", completed: false, priority: "Medium", estimatedMinutes: 60, project: "Personal Brand" },
  { id: 2, text: "Mix and master 'Midnight Drift'", completed: true, priority: "High", estimatedMinutes: 120, project: "Rex Music" },
  { id: 3, text: "Draft email newsletter", completed: false, priority: "Low", estimatedMinutes: 30, project: "Personal Brand" },
  { id: 4, text: "Upload stems to BeatStars", completed: false, priority: "High", estimatedMinutes: 20, project: "Rex Music" },
];

const initialWeeklyReview: WeeklyReviewData = {
  score: 8.5, scoreTrend: "+1.2 from last week",
  biggestWin: "Successfully launched the new Beat Store website. First sale came through on day 1.",
  biggestMistake: "Spent too much time tweaking EQ on a track that was already good enough.",
  lessonsLearned: "Set a hard timer of 3 hours for mixing. When the timer is up, export and move on.",
  goalsNextWeek: "1. Publish 3 new beats to the store.\n2. Record and upload 1 long-form YouTube video.\n3. Spend 0 hours doomscrolling.",
  weeklyNotes: "Felt a bit burned out on Thursday. Need to sleep 8 hours consistently.",
  doomscrollingHours: 4, synthTweakingHours: 2, videosPublished: 2, beatsFinished: 4,
  tasksCompleted: 14, focusHours: 18, publishingStreak: 12,
};

const initialActivityLog: ActivityLog[] = [
  { id: 1, timestamp: "2026-07-04T09:00:00Z", type: "beat_published", title: "Beat Published", description: "Midnight Drift published to BeatStars & YouTube", icon: "zap", color: "text-yellow-500 bg-yellow-500/10" },
  { id: 2, timestamp: "2026-07-03T14:30:00Z", type: "task_completed", title: "Task Completed", description: "Mixed and mastered Midnight Drift", icon: "check", color: "text-emerald-500 bg-emerald-500/10" },
  { id: 3, timestamp: "2026-07-03T11:00:00Z", type: "focus_session", title: "Focus Session", description: "2-hour deep work block completed", icon: "clock", color: "text-blue-500 bg-blue-500/10" },
  { id: 4, timestamp: "2026-07-02T16:00:00Z", type: "project_updated", title: "Project Updated", description: "Beat Selling Website: Stripe integration completed", icon: "folder", color: "text-primary bg-primary/10" },
];

const initialDailyLogs: DailyLog[] = [
  { id: 1, date: "2026-07-04", category: "Music Production", task: "Mixing Titanium beat", output: "Mix version 1 completed", timeSpent: 120, status: "In Progress", notes: "808s need more work", nextAction: "Revise low end and re-export" },
];

const initialKnowledgeEntries: KnowledgeEntry[] = [
  { id: 1, title: "Keep 808s mono below 80Hz", category: "Reference", content: "Always mono your 808s below 80Hz to avoid phase issues on mono systems and Spotify compression.", tags: ["mixing", "808", "production"], dateAdded: "2026-07-01", isFavorite: true },
  { id: 2, title: "YouTube algorithm prefers 10+ minute videos", category: "Marketing", content: "Videos over 10 minutes allow mid-roll ads and signal watch time to the algorithm, boosting reach.", tags: ["youtube", "content", "growth"], url: "https://support.google.com/youtube", dateAdded: "2026-06-28", isFavorite: false },
  { id: 3, title: "Cold email template for collabs", category: "Business", content: "Hey [Name], love your work on [X]. I'm Rex - I produce trap and R&B beats. I think a collab would be fire. Want to jam?", tags: ["collab", "email", "outreach"], dateAdded: "2026-06-20", isFavorite: true },
];

const initialAssets: Asset[] = [
  { id: 1, name: "Midnight Drift Cover Art", type: "Cover Art", driveLink: "https://drive.google.com/file/d/example1/view", previewUrl: "", beatId: "B-042", projectId: 1, tags: ["dark", "cyberpunk"], dateAdded: "2026-06-28", notes: "Final version approved" },
  { id: 2, name: "Studio Tour B-Roll", type: "Video", driveLink: "https://drive.google.com/file/d/example2/view", previewUrl: "", projectId: 3, tags: ["youtube", "broll"], dateAdded: "2026-07-01", notes: "4K 60fps footage" },
  { id: 3, name: "Rex Music Logo Pack", type: "Brand", driveLink: "https://drive.google.com/file/d/example3/view", previewUrl: "", tags: ["brand", "logo"], dateAdded: "2026-06-15", notes: "Light and dark versions included" },
];

const initialNotifications: Notification[] = [
  { id: 1, title: "Beat Awaiting Thumbnail", description: "Summer Breeze is ready to publish but missing a thumbnail.", type: "warning", isRead: false, timestamp: "2026-07-04T10:00:00Z" },
  { id: 2, title: "Weekly Review Due", description: "Your weekly review hasn't been completed yet. Review the past 7 days.", type: "info", isRead: false, timestamp: "2026-07-04T09:00:00Z" },
  { id: 3, title: "Project Deadline Approaching", description: "Beat Selling Website deadline is in 41 days.", type: "urgent", isRead: false, timestamp: "2026-07-03T08:00:00Z" },
  { id: 4, title: "Monthly Goal: Almost There!", description: "Upload 10 beats: 8/10 completed. 2 more to hit your goal!", type: "success", isRead: true, timestamp: "2026-07-02T12:00:00Z" },
];

const initialCalendarEvents: CalendarEvent[] = [
  { id: 1, title: "Midnight Drift (YouTube)", date: "2026-07-04", platform: "youtube", color: "#ef4444", isRecurring: false, status: "published", beatId: "B-042" },
  { id: 2, title: "Summer Breeze EP (Spotify)", date: "2026-07-10", platform: "spotify", color: "#22c55e", isRecurring: false, status: "scheduled", beatId: "B-043" },
  { id: 3, title: "Weekly Tutorial Video", date: "2026-07-07", platform: "youtube", color: "#ef4444", isRecurring: true, status: "scheduled" },
  { id: 4, title: "BeatStars Upload", date: "2026-07-14", platform: "beatstars", color: "#3b82f6", isRecurring: false, status: "draft" },
];

const initialSettings: AppSettings = {
  theme: 'system',
  defaultFocusMinutes: 25,
  defaultBreakMinutes: 5,
  defaultUploadPlatforms: ['youtube', 'beatstars'],
  notificationsEnabled: true,
  publishingStreakGoal: 7,
  googleSheetId: '1cdwRV433KKaJ-PCY4lCCsQzazZrqCJfdsbgBlMJtqaY',
  googleCalendarId: '',
  userGmailAddress: '',
  googleSyncEnabled: false,
  lastBackupAt: null,
  backupStatus: 'never',
  backupError: '',
};

// ============================================================
// PROVIDER
// ============================================================

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const load = <T,>(key: string, fallback: T): T => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : fallback;
    } catch (e) {
      console.error(`Error parsing localStorage key ${key}:`, e);
      return fallback;
    }
  };

  const [beats, setBeats] = useState<Beat[]>(() => {
    const loaded = load<Beat[]>("rex_beats", initialBeats);
    return (loaded || []).map(b => ({
      ...b,
      platforms: b.platforms || { youtube: "Draft", spotify: "Draft", beatstars: "Draft", airbit: "Draft", appleMusic: "Draft", soundcloud: "Draft", instagram: "Draft", tiktok: "Draft" },
      timeSignature: b.timeSignature || "4/4",
      coverArt: b.coverArt || "",
      tags: b.tags || [],
      notes: b.notes || "",
      mixStatus: b.mixStatus || "Not Started",
      masterStatus: b.masterStatus || "Not Started",
      videoStatus: b.videoStatus || "Not Started"
    }));
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    const loaded = load<Project[]>("rex_projects", initialProjects);
    return (loaded || []).map(p => ({
      ...p,
      category: p.category || "General",
      owner: p.owner || "CEO",
      tags: Array.isArray(p.tags) ? p.tags : [],
      estimatedEffort: p.estimatedEffort || "TBD",
      tasks: (p.tasks || []).map(t => ({
        ...t,
        completed: !!t.completed,
        priority: t.priority || "Medium"
      })),
      milestones: (p.milestones || []).map(m => ({
        ...m,
        completed: !!m.completed
      })),
      notes: p.notes || "",
      timeInvested: typeof p.timeInvested === "number" ? p.timeInvested : 0,
      health: p.health || "On Track",
      deadline: p.deadline || "TBD",
      startDate: p.startDate || "",
      estimatedCompletion: p.estimatedCompletion || "",
      linkedGoals: p.linkedGoals || "[]",
      deliverables: p.deliverables || "[]",
      links: p.links || "[]",
      files: p.files || "[]",
      activities: p.activities || "[]",
      priority: p.priority || "Medium",
      priorityColor: p.priorityColor || (p.priority === "High" ? "text-orange-500 bg-orange-500/10" : "text-yellow-600 bg-yellow-500/10"),
      statusColor: p.statusColor || "text-emerald-500 bg-emerald-500/10",
      status: p.status || "Active",
      recentActivity: p.recentActivity || "Project updated",
      progress: typeof p.progress === "number" ? p.progress : 0,
    }));
  });

  const [publishingCards, setPublishingCards] = useState<PublishingCard[]>(() => {
    const loaded = load<PublishingCard[]>("rex_publishing_cards", initialPublishingCards);
    return (loaded || []).map(c => ({
      ...c,
      columnId: c.columnId || "idea",
      title: c.title || "Untitled Card",
      platform: c.platform || "youtube",
      priority: c.priority || "Medium",
      publishDate: c.publishDate || "TBD",
      estTime: c.estTime || "0m",
      status: c.status || "Concept"
    }));
  });

  const [annualGoals, setAnnualGoals] = useState<AnnualGoal[]>(() => load("rex_annual_goals", initialAnnualGoals));
  const [quarterlyGoals, setQuarterlyGoals] = useState<QuarterlyGoal[]>(() => load("rex_quarterly_goals", initialQuarterlyGoals));
  
  const [monthlyGoals, setMonthlyGoals] = useState<MonthlyGoal[]>(() => {
    const loaded = load<MonthlyGoal[]>("rex_monthly_goals", initialMonthlyGoals);
    return (loaded || []).map(g => ({
      ...g,
      unit: g.unit || "beats",
      type: g.type || "monthly",
      category: g.category || "Production",
      progress: typeof g.progress === "number" ? g.progress : Math.round(((g.current || 0) / (g.total || 1)) * 100)
    }));
  });

  const [actionItems, setActionItems] = useState<ActionItem[]>(() => load("rex_action_items", initialActionItems));

  const [weeklyReview, setWeeklyReview] = useState<WeeklyReviewData>(() => {
    const loaded = load<WeeklyReviewData>("rex_weekly_review", initialWeeklyReview);
    return {
      ...initialWeeklyReview,
      ...loaded
    };
  });
  const [oneImportantTask, _setOneImportantTask] = useState<string>(() => localStorage.getItem("rex_one_important_task") || "Launch REX OS V2 Platform");
  const [secondaryTasks, setSecondaryTasks] = useState<SecondaryTask[]>(() => load("rex_secondary_tasks", [
    { id: 1, text: "Mix and master 'Midnight Drift'", completed: true, priority: "High", estimatedMinutes: 120, project: "Rex Music" },
    { id: 2, text: "Schedule social media promotions", completed: false, priority: "Medium", estimatedMinutes: 30 },
    { id: 3, text: "Upload stems for collaboration", completed: false, priority: "Low", estimatedMinutes: 20, project: "Rex Music" }
  ]));
  const [notes, _setNotes] = useState<string>(() => localStorage.getItem("rex_notes") || "Remember to test the production endpoints. Keep 808s mono!");
  const [activityLog, setActivityLog] = useState<ActivityLog[]>(() => load("rex_activity_log", initialActivityLog));
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>(() => load("rex_daily_logs", initialDailyLogs));
  const [knowledgeEntries, setKnowledgeEntries] = useState<KnowledgeEntry[]>(() => load("rex_knowledge", initialKnowledgeEntries));
  const [assets, setAssets] = useState<Asset[]>(() => load("rex_assets", initialAssets));
  const [notifications, setNotifications] = useState<Notification[]>(() => load("rex_notifications", initialNotifications));
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(() => {
    const loaded = load<CalendarEvent[]>("rex_calendar_events", initialCalendarEvents);
    return (loaded || []).map(e => ({
      ...e,
      title: e.title || "Untitled Event",
      date: e.date || new Date().toISOString().split("T")[0],
      platform: e.platform || "youtube",
      color: e.color || "#ef4444",
      isRecurring: !!e.isRecurring,
      status: e.status || "scheduled"
    }));
  });
  const [appSettings, setAppSettings] = useState<AppSettings>(() => {
    const loaded = load<AppSettings>("rex_app_settings", initialSettings);
    return {
      ...initialSettings,
      ...loaded
    };
  });

  // Persist all state
  useEffect(() => { localStorage.setItem("rex_beats", JSON.stringify(beats)); }, [beats]);
  useEffect(() => { localStorage.setItem("rex_projects", JSON.stringify(projects)); }, [projects]);
  useEffect(() => { localStorage.setItem("rex_publishing_cards", JSON.stringify(publishingCards)); }, [publishingCards]);
  useEffect(() => { localStorage.setItem("rex_annual_goals", JSON.stringify(annualGoals)); }, [annualGoals]);
  useEffect(() => { localStorage.setItem("rex_quarterly_goals", JSON.stringify(quarterlyGoals)); }, [quarterlyGoals]);
  useEffect(() => { localStorage.setItem("rex_monthly_goals", JSON.stringify(monthlyGoals)); }, [monthlyGoals]);
  useEffect(() => { localStorage.setItem("rex_action_items", JSON.stringify(actionItems)); }, [actionItems]);
  useEffect(() => { localStorage.setItem("rex_weekly_review", JSON.stringify(weeklyReview)); }, [weeklyReview]);
  useEffect(() => { localStorage.setItem("rex_one_important_task", oneImportantTask); }, [oneImportantTask]);
  useEffect(() => { localStorage.setItem("rex_secondary_tasks", JSON.stringify(secondaryTasks)); }, [secondaryTasks]);
  useEffect(() => { localStorage.setItem("rex_notes", notes); }, [notes]);
  useEffect(() => { localStorage.setItem("rex_activity_log", JSON.stringify(activityLog)); }, [activityLog]);
  useEffect(() => { localStorage.setItem("rex_daily_logs", JSON.stringify(dailyLogs)); }, [dailyLogs]);
  useEffect(() => { localStorage.setItem("rex_knowledge", JSON.stringify(knowledgeEntries)); }, [knowledgeEntries]);
  useEffect(() => { localStorage.setItem("rex_assets", JSON.stringify(assets)); }, [assets]);
  useEffect(() => { localStorage.setItem("rex_notifications", JSON.stringify(notifications)); }, [notifications]);
  useEffect(() => { localStorage.setItem("rex_calendar_events", JSON.stringify(calendarEvents)); }, [calendarEvents]);
  useEffect(() => { localStorage.setItem("rex_app_settings", JSON.stringify(appSettings)); }, [appSettings]);

  // Dark mode sync — apply Tailwind `.dark` class to <html> based on appSettings.theme
  useEffect(() => {
    const root = document.documentElement;
    if (appSettings.theme === 'dark') {
      root.classList.add('dark');
    } else if (appSettings.theme === 'light') {
      root.classList.remove('dark');
    } else {
      // system
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) root.classList.add('dark');
      else root.classList.remove('dark');
    }
  }, [appSettings.theme]);

  // ──────────────────────────────────────────────────────────────
  // BACKEND HYDRATION — fetches from API on mount, overwrites local
  // defaults. Falls back silently if backend is unreachable.
  // ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const hydrate = async () => {
      const [
        beatsData, projectsData, publishingData, goalsData, actionItemsData,
        weeklyReviewData, missionData, activityData, dailyLogsData, knowledgeData,
        assetsData, notificationsData, calendarData, settingsData,
      ] = await Promise.all([
        api.getBeats(), api.getProjects(), api.getPublishing(), api.getGoals(),
        api.getActionItems(), api.getWeeklyReview(), api.getMissionControl(),
        api.getActivityLog(), api.getDailyLogs(), api.getKnowledge(),
        api.getAssets(), api.getNotifications(), api.getCalendarEvents(), api.getSettings(),
      ]);
      if (beatsData) setBeats(beatsData as Beat[]);
      if (projectsData) setProjects(projectsData as Project[]);
      if (publishingData) setPublishingCards(publishingData as PublishingCard[]);
      if (goalsData) {
        const g = goalsData as { annual: AnnualGoal[]; quarterly: QuarterlyGoal[]; monthly: MonthlyGoal[] };
        setMonthlyGoals(g.monthly);
      }
      if (actionItemsData) setActionItems(actionItemsData as ActionItem[]);
      if (weeklyReviewData) setWeeklyReview(prev => ({ ...prev, ...(weeklyReviewData as WeeklyReviewData) }));
      if (missionData) {
        const m = missionData as { oneImportantTask: string; notes: string; secondaryTasks: SecondaryTask[] };
        _setOneImportantTask(m.oneImportantTask);
        _setNotes(m.notes);
        setSecondaryTasks(m.secondaryTasks);
      }
      if (activityData) setActivityLog(activityData as ActivityLog[]);
      if (dailyLogsData) setDailyLogs(dailyLogsData as DailyLog[]);
      if (knowledgeData) setKnowledgeEntries(knowledgeData as KnowledgeEntry[]);
      if (assetsData) setAssets(assetsData as Asset[]);
      if (notificationsData) setNotifications(notificationsData as Notification[]);
      if (calendarData) setCalendarEvents(calendarData as CalendarEvent[]);
      if (settingsData) setAppSettings(prev => ({ ...prev, ...(settingsData as AppSettings) }));
    };
    hydrate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Public wrappers for oneImportantTask / notes — sync to backend
  const setOneImportantTask = useCallback((task: string) => {
    _setOneImportantTask(task);
    api.updateMissionControl({ oneImportantTask: task });
  }, []);

  const setNotes = useCallback((n: string) => {
    _setNotes(n);
    api.updateMissionControl({ notes: n });
  }, []);

  // ============================================================
  // ACTIVITY LOG
  // ============================================================
  const addActivity = useCallback((activity: Omit<ActivityLog, 'id' | 'timestamp'>) => {
    setActivityLog(prev => [{
      ...activity,
      id: Date.now(),
      timestamp: new Date().toISOString(),
    }, ...prev].slice(0, 50));
    api.createActivityLog(activity);
  }, []);

  const addNotification = useCallback((notif: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => {
    setNotifications(prev => [{
      ...notif,
      id: Date.now(),
      timestamp: new Date().toISOString(),
      isRead: false,
    }, ...prev].slice(0, 20));
    api.createNotification(notif);
  }, []);

  // ============================================================
  // BEAT OPERATIONS
  // ============================================================
  const addBeat = useCallback((beat: Omit<Beat, "id" | "dateCreated">) => {
    const nextId = `B-0${beats.length + 46}`;
    const newBeat: Beat = { ...beat, id: nextId, dateCreated: new Date().toISOString().split("T")[0] };
    setBeats(prev => [newBeat, ...prev]);
    api.createBeat(newBeat);
    addActivity({ type: 'beat_published', title: 'New Beat Added', description: `${beat.name} added to Beat Library`, icon: 'music', color: 'text-primary bg-primary/10' });
    setMonthlyGoals(prev => prev.map(g => g.title.toLowerCase().includes('beat') ? { ...g, current: Math.min(g.current + 1, g.total), progress: Math.min(Math.round(((g.current + 1) / g.total) * 100), 100) } : g));
  }, [beats.length, addActivity]);

  const updateBeat = useCallback((updated: Beat) => {
    setBeats(prev => prev.map(b => b.id === updated.id ? updated : b));
    api.updateBeat(updated.id, updated);
  }, []);

  const publishBeat = useCallback((beatId: string) => {
    const beat = beats.find(b => b.id === beatId);
    if (!beat) return;
    const updated: Beat = { ...beat, status: 'Published', mixStatus: 'Done', masterStatus: 'Done' };
    setBeats(prev => prev.map(b => b.id === beatId ? updated : b));
    api.updateBeat(beatId, updated);
    addActivity({ type: 'beat_published', title: 'Beat Published!', description: `${beat.name} is now live on all platforms`, icon: 'zap', color: 'text-yellow-500 bg-yellow-500/10' });
    setWeeklyReview(prev => ({ ...prev, beatsFinished: prev.beatsFinished + 1, publishingStreak: prev.publishingStreak + 1 }));
    setMonthlyGoals(prev => prev.map(g => g.title.toLowerCase().includes('beat') ? { ...g, current: Math.min(g.current + 1, g.total), progress: Math.min(Math.round(((g.current + 1) / g.total) * 100), 100) } : g));
    addNotification({ title: 'Beat Published!', description: `${beat.name} is now live!`, type: 'success' });
  }, [beats, addActivity, addNotification]);

  const deleteBeat = useCallback((beatId: string) => {
    setBeats(prev => prev.filter(b => b.id !== beatId));
    api.deleteBeat(beatId);
  }, []);

  // ============================================================
  // PROJECT OPERATIONS
  // ============================================================
  const addProject = useCallback((project: Omit<Project, "id" | "progress" | "status" | "statusColor" | "priorityColor" | "recentActivity" | "tasks" | "notes" | "timeInvested" | "health" | "activities">) => {
    const newProject: Project = {
      ...project,
      id: Date.now(),
      progress: 0,
      status: "Active",
      statusColor: "text-emerald-500 bg-emerald-500/10",
      priorityColor: project.priority === "High" ? "text-orange-500 bg-orange-500/10" : "text-yellow-600 bg-yellow-500/10",
      recentActivity: "Project initialized",
      tasks: [{ id: 1, text: "Define project scope", completed: false, priority: "High" }],
      notes: "",
      timeInvested: 0,
      health: "On Track",
      activities: JSON.stringify([{ timestamp: new Date().toISOString(), text: "Project created" }]),
    };
    setProjects(prev => [...prev, newProject]);
    api.createProject(newProject).then(res => {
      if (res) {
        setProjects(prev => prev.map(p => p.id === newProject.id ? { ...p, id: (res as any).id } : p));
      }
    });
    addActivity({ type: 'project_updated', title: 'New Project Created', description: `${project.name} is now active`, icon: 'folder', color: 'text-primary bg-primary/10' });
  }, [addActivity]);

  const updateProject = useCallback((updated: Project) => {
    setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
    api.updateProject(updated.id, updated);
    addActivity({ type: 'project_updated', title: 'Project Updated', description: `${updated.name} was updated`, icon: 'folder', color: 'text-primary bg-primary/10' });
  }, [addActivity]);

  const updateProjectProgress = useCallback((id: number, progress: number) => {
    setProjects(prev => prev.map(p => {
      if (p.id === id) {
        const health: Project['health'] = progress >= 75 ? 'On Track' : progress >= 40 ? 'At Risk' : 'At Risk';
        const updated = { ...p, progress, recentActivity: `Progress updated to ${progress}%`, health };
        api.updateProject(id, updated);
        return updated;
      }
      return p;
    }));
  }, []);

  const toggleProjectTask = useCallback((projectId: number, taskId: number) => {
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      const tasks = p.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t);
      const completedCount = tasks.filter(t => t.completed).length;
      const progress = Math.round((completedCount / tasks.length) * 100);
      const task = tasks.find(t => t.id === taskId);
      if (task && !p.tasks.find(t => t.id === taskId)?.completed) {
        addActivity({ type: 'task_completed', title: 'Task Completed', description: `${task.text} (${p.name})`, icon: 'check', color: 'text-emerald-500 bg-emerald-500/10' });
        setWeeklyReview(wr => ({ ...wr, tasksCompleted: wr.tasksCompleted + 1 }));
      }
      api.toggleProjectTask(projectId, taskId);
      return { ...p, tasks, progress, recentActivity: `Task ${task?.completed ? 'uncompleted' : 'completed'}: ${task?.text}` };
    }));
  }, [addActivity]);

  const editProjectTask = useCallback((projectId: number, taskId: number, task: Omit<ProjectTask, 'id'>) => {
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      const tasks = p.tasks.map(t => t.id === taskId ? { ...t, ...task } : t);
      api.editProjectTask(projectId, taskId, task);
      return { ...p, tasks, recentActivity: `Updated task: ${task.text}` };
    }));
  }, []);

  const deleteProjectTask = useCallback((projectId: number, taskId: number) => {
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      const task = p.tasks.find(t => t.id === taskId);
      const tasks = p.tasks.filter(t => t.id !== taskId);
      const completedCount = tasks.filter(t => t.completed).length;
      const progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;
      api.deleteProjectTask(projectId, taskId);
      return { ...p, tasks, progress, recentActivity: `Deleted task: ${task?.text}` };
    }));
  }, []);

  const addProjectTask = useCallback((projectId: number, task: Omit<ProjectTask, 'id'>) => {
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      const newTask = { ...task, id: Date.now() };
      api.addProjectTask(projectId, task).then(res => {
        if (res) {
            setProjects(current => current.map(cp => cp.id === projectId ? { ...cp, tasks: cp.tasks.map(t => t.id === newTask.id ? { ...t, id: (res as any).id } : t) } : cp));
        }
      });
      return { ...p, tasks: [...p.tasks, newTask] };
    }));
  }, []);

  // ============================================================
  // PUBLISHING OPERATIONS
  // ============================================================
  const addPublishingCard = useCallback((card: Omit<PublishingCard, "id">) => {
    const newCard = { ...card, id: Date.now() };
    setPublishingCards(prev => [...prev, newCard]);
    api.createPublishingCard(card).then(res => {
        if (res) {
            setPublishingCards(prev => prev.map(c => c.id === newCard.id ? { ...c, id: (res as any).id } : c));
        }
    });
  }, []);

  const updatePublishingCardColumn = useCallback((id: number, columnId: string) => {
    setPublishingCards(prev => prev.map(c => {
      if (c.id !== id) return c;
      if (columnId === 'published') {
        addActivity({ type: 'beat_published', title: 'Content Published', description: `${c.title} is now live`, icon: 'zap', color: 'text-yellow-500 bg-yellow-500/10' });
        setWeeklyReview(wr => ({ ...wr, videosPublished: wr.videosPublished + 1, publishingStreak: wr.publishingStreak + 1 }));
        if (c.beatId) publishBeat(c.beatId);
      }
      api.movePublishingCard(id, columnId);
      return { ...c, columnId };
    }));
  }, [addActivity, publishBeat]);

  const editPublishingCard = useCallback((id: number, updates: Partial<PublishingCard>) => {
    setPublishingCards(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    api.updatePublishingCard(id, updates);
  }, []);

  const deletePublishingCard = useCallback((id: number) => {
    setPublishingCards(prev => prev.filter(c => c.id !== id));
    api.deletePublishingCard(id);
  }, []);

  // ============================================================
  // GOALS
  // ============================================================
  const updateGoalProgress = useCallback((id: number, current: number) => {
    setMonthlyGoals(prev => prev.map(g => {
      if (g.id !== id) return g;
      const progress = Math.round((current / g.total) * 100);
      if (progress >= 100) addActivity({ type: 'goal_achieved', title: 'Goal Achieved!', description: g.title, icon: 'target', color: 'text-emerald-500 bg-emerald-500/10' });
      api.updateMonthlyGoalProgress(id, current);
      return { ...g, current, progress };
    }));
  }, [addActivity]);

  const updateGoal = useCallback((id: number, updates: Partial<MonthlyGoal>) => {
    const updateList = (list: any[]) => list.map(g => {
      if (g.id !== id) return g;
      const newCurrent = updates.current !== undefined ? updates.current : g.current;
      const newTotal = updates.total !== undefined ? updates.total : g.total;
      return { ...g, ...updates, progress: Math.min(100, Math.round((newCurrent / newTotal) * 100)) };
    });
    setMonthlyGoals(updateList);
    setQuarterlyGoals(updateList);
    setAnnualGoals(updateList);
    api.updateMonthlyGoal(id, updates);
  }, []);

  const addGoal = useCallback((goal: Omit<MonthlyGoal, 'id' | 'progress'>) => {
    const newGoal = { ...goal, id: Date.now(), progress: Math.round((goal.current / goal.total) * 100) };
    setMonthlyGoals(prev => [...prev, newGoal]);
    api.createMonthlyGoal(goal).then(res => {
        if (res) {
            setMonthlyGoals(prev => prev.map(g => g.id === newGoal.id ? { ...g, id: (res as any).id } : g));
        }
    });
  }, []);

  const deleteGoal = useCallback((id: number) => {
    setMonthlyGoals(prev => prev.filter(g => g.id !== id));
    api.deleteMonthlyGoal(id);
  }, []);

  // ============================================================
  // ACTION ITEMS
  // ============================================================
  const addActionItem = useCallback((item: Omit<ActionItem, 'id' | 'completed'>) => {
    const newItem = { ...item, id: Date.now(), completed: false };
    setActionItems(prev => [...prev, newItem]);
    api.createActionItem(item).then(res => {
        if (res) {
            setActionItems(prev => prev.map(i => i.id === newItem.id ? { ...i, id: (res as any).id } : i));
        }
    });
  }, []);

  const toggleActionItem = useCallback((id: number) => {
    setActionItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      const nowCompleted = !item.completed;
      if (nowCompleted) {
        addActivity({ type: 'task_completed', title: 'Task Completed', description: item.text, icon: 'check', color: 'text-emerald-500 bg-emerald-500/10' });
        setWeeklyReview(wr => ({ ...wr, tasksCompleted: wr.tasksCompleted + 1 }));
      }
      api.toggleActionItem(id);
      return { ...item, completed: nowCompleted };
    }));
  }, [addActivity]);

  const deleteActionItem = useCallback((id: number) => {
    setActionItems(prev => prev.filter(item => item.id !== id));
    api.deleteActionItem(id);
  }, []);

  const reorderActionItems = useCallback((items: ActionItem[]) => {
    setActionItems(items);
    api.reorderActionItems(items.map((item, index) => ({ id: item.id, sortOrder: index })));
  }, []);

  // ============================================================
  // WEEKLY REVIEW
  // ============================================================
  const updateWeeklyReview = useCallback((data: Partial<WeeklyReviewData>) => {
    setWeeklyReview(prev => {
        const next = { ...prev, ...data };
        api.updateWeeklyReview(next);
        return next;
    });
  }, []);

  // ============================================================
  // MISSION CONTROL
  // ============================================================
  const addSecondaryTask = useCallback((task: Omit<SecondaryTask, 'id' | 'completed'>) => {
    const newTask = { ...task, id: Date.now(), completed: false };
    setSecondaryTasks(prev => [...prev, newTask]);
    api.createSecondaryTask(task).then(res => {
        if (res) {
            setSecondaryTasks(prev => prev.map(t => t.id === newTask.id ? { ...t, id: (res as any).id } : t));
        }
    });
  }, []);

  const toggleSecondaryTask = useCallback((id: number) => {
    setSecondaryTasks(prev => prev.map(t => {
      if (t.id !== id) return t;
      const nowCompleted = !t.completed;
      if (nowCompleted) {
        addActivity({ type: 'task_completed', title: 'Mission Task Done', description: t.text, icon: 'check', color: 'text-emerald-500 bg-emerald-500/10' });
        setWeeklyReview(wr => ({ ...wr, tasksCompleted: wr.tasksCompleted + 1 }));
      }
      api.toggleSecondaryTask(id);
      return { ...t, completed: nowCompleted };
    }));
  }, [addActivity]);

  const deleteSecondaryTask = useCallback((id: number) => {
    setSecondaryTasks(prev => prev.filter(t => t.id !== id));
    api.deleteSecondaryTask(id);
  }, []);

  const reorderSecondaryTasks = useCallback((tasks: SecondaryTask[]) => {
    setSecondaryTasks(tasks);
    api.reorderSecondaryTasks(tasks.map((task, index) => ({ id: task.id, sortOrder: index })));
  }, []);

  // ============================================================
  // DAILY LOG
  // ============================================================
  const addDailyLog = useCallback((log: Omit<DailyLog, 'id'>) => {
    const newLog = { ...log, id: Date.now() };
    setDailyLogs(prev => [newLog, ...prev]);
    api.createDailyLog(log).then(res => {
        if (res) {
            setDailyLogs(prev => prev.map(l => l.id === newLog.id ? { ...l, id: (res as any).id } : l));
        }
    });
    addActivity({ type: 'task_completed', title: 'Work Logged', description: `${log.task} – ${log.output}`, icon: 'edit', color: 'text-blue-500 bg-blue-500/10' });
    if (log.status === 'Completed') setWeeklyReview(wr => ({ ...wr, tasksCompleted: wr.tasksCompleted + 1, focusHours: wr.focusHours + Math.round(log.timeSpent / 60) }));
  }, [addActivity]);

  const updateDailyLog = useCallback((log: DailyLog) => {
    setDailyLogs(prev => prev.map(l => l.id === log.id ? log : l));
    api.updateDailyLog(log.id, log);
  }, []);

  const deleteDailyLog = useCallback((id: number) => {
    setDailyLogs(prev => prev.filter(l => l.id !== id));
    api.deleteDailyLog(id);
  }, []);

  // ============================================================
  // KNOWLEDGE VAULT
  // ============================================================
  const addKnowledgeEntry = useCallback((entry: Omit<KnowledgeEntry, 'id' | 'dateAdded'>) => {
    const newEntry = { ...entry, id: Date.now(), dateAdded: new Date().toISOString().split('T')[0] };
    setKnowledgeEntries(prev => [newEntry, ...prev]);
    api.createKnowledgeEntry(entry).then(res => {
        if (res) {
            setKnowledgeEntries(prev => prev.map(e => e.id === newEntry.id ? { ...e, id: (res as any).id } : e));
        }
    });
  }, []);

  const updateKnowledgeEntry = useCallback((entry: KnowledgeEntry) => {
    setKnowledgeEntries(prev => prev.map(e => e.id === entry.id ? entry : e));
    api.updateKnowledgeEntry(entry.id, entry);
  }, []);

  const deleteKnowledgeEntry = useCallback((id: number) => {
    setKnowledgeEntries(prev => prev.filter(e => e.id !== id));
    api.deleteKnowledgeEntry(id);
  }, []);

  const toggleKnowledgeFavorite = useCallback((id: number) => {
    setKnowledgeEntries(prev => prev.map(e => e.id === id ? { ...e, isFavorite: !e.isFavorite } : e));
    api.toggleKnowledgeFavorite(id);
  }, []);

  // ============================================================
  // ASSETS
  // ============================================================
  const addAsset = useCallback((asset: Omit<Asset, 'id' | 'dateAdded'>) => {
    const newAsset = { ...asset, id: Date.now(), dateAdded: new Date().toISOString().split('T')[0] };
    setAssets(prev => [newAsset, ...prev]);
    api.createAsset(asset).then(res => {
        if (res) {
            setAssets(prev => prev.map(a => a.id === newAsset.id ? { ...a, id: (res as any).id } : a));
        }
    });
  }, []);

  const updateAsset = useCallback((asset: Asset) => {
    setAssets(prev => prev.map(a => a.id === asset.id ? asset : a));
    api.updateAsset(asset.id, asset);
  }, []);

  const deleteAsset = useCallback((id: number) => {
    setAssets(prev => prev.filter(a => a.id !== id));
    api.deleteAsset(id);
  }, []);

  // ============================================================
  // NOTIFICATIONS
  // ============================================================
  const markNotificationRead = useCallback((id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    api.markNotificationRead(id);
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    api.markAllNotificationsRead();
  }, []);

  // ============================================================
  // CALENDAR
  // ============================================================
  const addCalendarEvent = useCallback((event: Omit<CalendarEvent, 'id'>) => {
    const newEvent = { ...event, id: Date.now() };
    setCalendarEvents(prev => [...prev, newEvent]);
    api.createCalendarEvent(event).then(res => {
        if (res) {
            setCalendarEvents(prev => prev.map(e => e.id === newEvent.id ? { ...e, id: (res as any).id } : e));
        }
    });
    addActivity({ type: 'upload_scheduled', title: 'Upload Scheduled', description: `${event.title} scheduled for ${event.date}`, icon: 'calendar', color: 'text-purple-500 bg-purple-500/10' });
  }, [addActivity]);

  const updateCalendarEvent = useCallback((event: CalendarEvent) => {
    setCalendarEvents(prev => prev.map(e => e.id === event.id ? event : e));
    api.updateCalendarEvent(event.id, event);
  }, []);

  const deleteCalendarEvent = useCallback((id: number) => {
    setCalendarEvents(prev => prev.filter(e => e.id !== id));
    api.deleteCalendarEvent(id);
  }, []);

  // ============================================================
  // SETTINGS
  // ============================================================
  const updateSettings = useCallback((settings: Partial<AppSettings>) => {
    setAppSettings(prev => {
        const next = { ...prev, ...settings };
        api.updateSettings(next);
        return next;
    });
  }, []);

  const resetPortal = useCallback(async () => {
    await api.resetPortal();
    // Clear all localStorage data
    const keysToRemove = ['rex_beats','rex_projects','rex_publishing_cards','rex_monthly_goals',
      'rex_action_items','rex_weekly_review','rex_one_important_task','rex_secondary_tasks',
      'rex_notes','rex_activity_log','rex_daily_logs','rex_knowledge','rex_assets',
      'rex_notifications','rex_calendar_events'];
    keysToRemove.forEach(k => localStorage.removeItem(k));
    // Reload page to re-hydrate from empty database
    window.location.reload();
  }, []);

  // ============================================================
  // DERIVED STATS
  // ============================================================
  const publishingStreak = weeklyReview.publishingStreak;
  const totalFocusHours = weeklyReview.focusHours;
  const weeklyCompletionRate = actionItems.length > 0
    ? Math.round((actionItems.filter(a => a.completed).length / actionItems.length) * 100)
    : 0;
  const monthlyCompletionRate = monthlyGoals.length > 0
    ? Math.round(monthlyGoals.reduce((acc, g) => acc + g.progress, 0) / monthlyGoals.length)
    : 0;

  return (
    <AppContext.Provider value={{
      beats, addBeat, updateBeat, publishBeat, deleteBeat,
      projects, addProject, updateProjectProgress, updateProject, toggleProjectTask, addProjectTask, editProjectTask, deleteProjectTask,
      publishingCards, addPublishingCard, updatePublishingCardColumn, editPublishingCard, deletePublishingCard,
      annualGoals, quarterlyGoals, monthlyGoals, updateGoalProgress, updateGoal, addGoal, deleteGoal,
      actionItems, addActionItem, toggleActionItem, deleteActionItem, reorderActionItems,
      weeklyReview, updateWeeklyReview,
      oneImportantTask, setOneImportantTask,
      secondaryTasks, addSecondaryTask, toggleSecondaryTask, deleteSecondaryTask, reorderSecondaryTasks,
      notes, setNotes,
      activityLog, addActivity,
      dailyLogs, addDailyLog, updateDailyLog, deleteDailyLog,
      knowledgeEntries, addKnowledgeEntry, updateKnowledgeEntry, deleteKnowledgeEntry, toggleKnowledgeFavorite,
      assets, addAsset, updateAsset, deleteAsset,
      notifications, markNotificationRead, markAllNotificationsRead, addNotification,
      calendarEvents, addCalendarEvent, updateCalendarEvent, deleteCalendarEvent,
      appSettings, updateSettings, resetPortal,
      publishingStreak, totalFocusHours, weeklyCompletionRate, monthlyCompletionRate,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within AppProvider");
  return context;
};
