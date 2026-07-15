import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Clock, CheckCircle2, Target, Zap, Play, Flame, TrendingUp, FolderKanban,
  Calendar, Music2, UploadCloud, Pause, RotateCcw, ArrowRight, BookOpen, ClipboardList
} from "lucide-react";
import { useAppContext } from "../context/AppContext";

export default function Dashboard() {
  const navigate = useNavigate();
  const {
    oneImportantTask,
    secondaryTasks,
    beats,
    weeklyReview,
    actionItems,
    projects,
    activityLog,
    publishingStreak,
    weeklyCompletionRate,
    monthlyCompletionRate,
    calendarEvents,
    publishingCards,
    addActivity,
    appSettings,
  } = useAppContext();

  // Pomodoro Timer
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(appSettings.defaultFocusMinutes * 60);
  const [pomodoroSession, setPomodoroSession] = useState(1);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (timerRunning) {
      intervalRef.current = setInterval(() => {
        setTimerSeconds(s => {
          if (s <= 1) {
            setTimerRunning(false);
            setPomodoroSession(prev => prev + 1);
            addActivity({ type: 'focus_session', title: 'Focus Session Complete', description: `${appSettings.defaultFocusMinutes}-min deep work block finished`, icon: 'clock', color: 'text-blue-500 bg-blue-500/10' });
            return appSettings.defaultFocusMinutes * 60;
          }
          return s - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [timerRunning, appSettings.defaultFocusMinutes, addActivity]);

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  const timerProgress = ((appSettings.defaultFocusMinutes * 60 - timerSeconds) / (appSettings.defaultFocusMinutes * 60)) * 100;

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  };

  const nextAction = secondaryTasks.find(t => !t.completed)?.text || "All caught up! 🎉";
  const completedActionsCount = actionItems.filter(a => a.completed).length;
  const publishedBeatsCount = beats.filter(b => b.status === "Released").length;
  const scheduledUploads = publishingCards.filter(c => c.columnId === "scheduled").length;
  const readyBeats = beats.filter(b => b.status === "Ready").length;

  // Today's calendar
  const today = new Date().toISOString().split("T")[0];
  const todayEvents = calendarEvents.filter(e => e.date === today);



  // Quick actions
  const quickActions = [
    { label: "New Beat", icon: Music2, color: "bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground", action: () => navigate("/beat-library") },
    { label: "New Project", icon: FolderKanban, color: "bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white", action: () => navigate("/projects") },
    { label: "Log Work", icon: ClipboardList, color: "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white", action: () => navigate("/daily-log") },
    { label: "Schedule Upload", icon: UploadCloud, color: "bg-purple-500/10 text-purple-500 hover:bg-purple-500 hover:text-white", action: () => navigate("/publishing") },
    { label: "Add Note", icon: BookOpen, color: "bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500 hover:text-white", action: () => navigate("/knowledge-vault") },
    { label: "Calendar", icon: Calendar, color: "bg-orange-500/10 text-orange-500 hover:bg-orange-500 hover:text-white", action: () => navigate("/calendar") },
  ];

  const activityIconMap: Record<string, string> = {
    beat_published: "🎵", task_completed: "✅", project_updated: "📁",
    goal_achieved: "🏆", upload_scheduled: "📅", focus_session: "⏱️",
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
            {getGreeting()}, Rex.
          </h1>
          <p className="text-muted-foreground mt-1 text-lg font-medium">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })} · Here's your CEO brief.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-gradient-to-r from-orange-100 to-orange-50 dark:from-orange-950/30 dark:to-orange-900/10 px-4 py-2 rounded-full border border-orange-200 dark:border-orange-900 shadow-sm">
            <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
            <span className="font-black text-orange-700 dark:text-orange-400 text-sm">{publishingStreak} Day Streak</span>
          </div>
          {readyBeats > 0 && (
            <div className="flex items-center gap-2 bg-blue-500/10 px-4 py-2 rounded-full border border-blue-500/20">
              <Music2 className="w-4 h-4 text-blue-500" />
              <span className="font-black text-blue-600 dark:text-blue-400 text-sm">{readyBeats} Beats Ready</span>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-3">Quick Actions</h3>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {quickActions.map((qa, i) => (
            <button
              key={i}
              onClick={qa.action}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl border border-border/50 transition-all duration-200 hover:-translate-y-1 hover:shadow-md text-center ${qa.color}`}
            >
              <qa.icon className="w-5 h-5" />
              <span className="text-[10px] font-black uppercase tracking-wide leading-none">{qa.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Mission */}
          <Card className="group relative overflow-hidden border-none shadow-xl bg-gradient-to-br from-primary/10 via-primary/5 to-background hover:shadow-2xl transition-all duration-500 rounded-2xl">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-700 pointer-events-none">
              <Target className="w-48 h-48 text-primary" />
            </div>
            <CardHeader className="relative z-10">
              <CardTitle className="text-primary flex items-center gap-2 text-xs font-black uppercase tracking-widest">
                <Target className="w-4 h-4" /> Today's Main Mission
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <h2 className="text-2xl font-extrabold tracking-tight mb-1">{oneImportantTask}</h2>
              <p className="text-muted-foreground text-sm mb-6 max-w-lg">ONE absolute priority. Block distractions and execute.</p>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => navigate("/mission-control")}
                  className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all shadow-lg hover:shadow-primary/25"
                >
                  <Play className="w-4 h-4 fill-current" /> Open Mission Control
                </button>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ArrowRight className="w-4 h-4 text-primary" />
                  <span className="font-medium">Next: <span className="text-foreground font-semibold">{nextAction}</span></span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Focus Timer + Next Action */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Card className="hover:-translate-y-1 hover:shadow-lg transition-all duration-300 border-primary/20 bg-card/50 backdrop-blur-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs text-muted-foreground font-black uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Deep Work Timer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-end">
                    <span className={`text-4xl font-black tracking-tighter ${timerRunning ? 'text-primary' : 'text-foreground'}`}>
                      {formatTime(timerSeconds)}
                    </span>
                    <span className="text-xs font-bold text-muted-foreground mb-1">Session {pomodoroSession}</span>
                  </div>
                  <Progress value={timerProgress} className="h-2 rounded-full [&>div]:bg-gradient-to-r [&>div]:from-primary [&>div]:to-orange-500 transition-all duration-1000" />
                  <div className="flex gap-2 mt-1">
                    <button
                      onClick={() => setTimerRunning(r => !r)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-primary/10 text-primary font-bold text-xs hover:bg-primary hover:text-primary-foreground transition-all"
                    >
                      {timerRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-current" />}
                      {timerRunning ? "Pause" : "Start"}
                    </button>
                    <button
                      onClick={() => { setTimerRunning(false); setTimerSeconds(appSettings.defaultFocusMinutes * 60); }}
                      className="p-1.5 rounded-lg bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <RotateCcw className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:-translate-y-1 hover:shadow-lg transition-all duration-300 border-primary/20 bg-card/50 backdrop-blur-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs text-muted-foreground font-black uppercase tracking-wider flex items-center gap-2">
                  <Zap className="w-4 h-4" /> Today's Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground font-medium">Tasks</span>
                    <span className="font-bold">{completedActionsCount}/{actionItems.length}</span>
                  </div>
                  <Progress value={weeklyCompletionRate} className="h-2 [&>div]:bg-primary" />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground font-medium">Monthly Goals</span>
                    <span className="font-bold">{monthlyCompletionRate}%</span>
                  </div>
                  <Progress value={monthlyCompletionRate} className="h-2 [&>div]:bg-orange-500" />
                </div>
                <div className="pt-1 flex items-center gap-2 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span className="text-muted-foreground">Next: <span className="text-foreground font-semibold truncate">{nextAction}</span></span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Active Projects */}
          <Card className="border-border/50 bg-card/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-black uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-2"><FolderKanban className="w-4 h-4 text-primary" /> Active Projects</span>
                <button onClick={() => navigate("/projects")} className="text-xs text-primary hover:underline font-bold flex items-center gap-1">View all <ArrowRight className="w-3 h-3" /></button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {projects.slice(0, 3).map(p => (
                <div key={p.id} className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{p.name}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-wide ${p.health === 'On Track' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'}`}>
                        {p.health}
                      </span>
                    </div>
                    <span className="text-sm font-black text-primary">{p.progress}%</span>
                  </div>
                  <Progress value={p.progress} className="h-1.5 [&>div]:bg-gradient-to-r [&>div]:from-primary/80 [&>div]:to-primary" />
                  <p className="text-xs text-muted-foreground">{p.recentActivity} · Due: {p.deadline}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-5">
          {/* Publishing Stats */}
          <Card className="border-border/50 bg-gradient-to-b from-card to-secondary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-black uppercase tracking-wider">Publishing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "Beats Published", value: publishedBeatsCount, icon: "🎵", color: "text-primary" },
                { label: "Beats Ready", value: readyBeats, icon: "✅", color: "text-emerald-500" },
                { label: "Scheduled Uploads", value: scheduledUploads, icon: "📅", color: "text-purple-500" },
                { label: "Videos This Week", value: weeklyReview.videosPublished, icon: "▶️", color: "text-red-500" },
              ].map((s, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{s.icon}</span>
                    <span className="text-xs text-muted-foreground font-medium">{s.label}</span>
                  </div>
                  <span className={`text-lg font-black ${s.color}`}>{s.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Today's Calendar */}
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" /> Today's Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              {todayEvents.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">No events today.</p>
                  <button onClick={() => navigate("/calendar")} className="text-xs text-primary hover:underline mt-1">+ Schedule upload</button>
                </div>
              ) : (
                <div className="space-y-2">
                  {todayEvents.map(event => (
                    <div key={event.id} className="flex items-center gap-2 p-2 rounded-lg bg-secondary/30">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: event.color }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate">{event.title}</p>
                        <p className="text-[10px] text-muted-foreground capitalize">{event.platform}</p>
                      </div>
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase ${event.status === 'published' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-purple-500/10 text-purple-600'}`}>
                        {event.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-black uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-2"><TrendingUp className="w-4 h-4 text-primary" /> Recent Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activityLog.slice(0, 5).map(item => (
                  <div key={item.id} className="flex items-center gap-3 group p-1.5 -mx-1.5 rounded-lg hover:bg-secondary/50 transition-colors">
                    <span className="text-base">{activityIconMap[item.type] || "📌"}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate group-hover:text-primary transition-colors">{item.description}</p>
                      <p className="text-[10px] text-muted-foreground">{new Date(item.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                    </div>
                  </div>
                ))}
                {activityLog.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div>
        <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4">Weekly Stats</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {[
            { label: "Videos Published", value: weeklyReview.videosPublished, trend: "This week", icon: Play, color: "text-red-500" },
            { label: "Beats in Library", value: beats.length, trend: `${publishedBeatsCount} live on platforms`, icon: Music2, color: "text-primary" },
            { label: "Tasks Completed", value: weeklyReview.tasksCompleted, trend: "This week", icon: CheckCircle2, color: "text-emerald-500" },
            { label: "Focus Hours", value: `${weeklyReview.focusHours}h`, trend: "Deep work", icon: Clock, color: "text-blue-500" },
          ].map((stat, i) => (
            <Card key={i} className="hover:-translate-y-1.5 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 border-border/50 group cursor-default">
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <p className="text-xs text-muted-foreground font-bold uppercase tracking-wide">{stat.label}</p>
                  <div className="p-1.5 bg-secondary/50 rounded-lg group-hover:bg-primary/10 transition-colors">
                    <stat.icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                </div>
                <p className="text-3xl font-black tracking-tighter mb-1 group-hover:text-primary transition-colors">{stat.value}</p>
                <div className="flex items-center gap-1 text-xs font-bold text-emerald-500">
                  <TrendingUp className="w-3 h-3" />
                  <span>{stat.trend}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
