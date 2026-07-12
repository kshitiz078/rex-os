import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart2, TrendingUp, Music, Play, CheckCircle2, Clock, Zap, Target, Download, Save } from "lucide-react";
import { useAppContext } from "../context/AppContext";

export default function WeeklyReview() {
  const { weeklyReview, updateWeeklyReview, activityLog } = useAppContext();
  const [reflection, setReflection] = useState(weeklyReview.weeklyNotes || "");
  const [nextWeekFocus, setNextWeekFocus] = useState(weeklyReview.goalsNextWeek || "");
  const [isSaving, setIsSaving] = useState(false);

  // Auto-save logic
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSave();
    }, 2000);
    return () => clearTimeout(timer);
  }, [reflection, nextWeekFocus]);

  const handleSave = () => {
    setIsSaving(true);
    updateWeeklyReview({ weeklyNotes: reflection, goalsNextWeek: nextWeekFocus });
    setTimeout(() => setIsSaving(false), 500);
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(weeklyReview, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `WeeklyReview_${new Date().toISOString().split('T')[0]}.json`;
    a.click(); URL.revokeObjectURL(url);
  };

  const stats = [
    { label: "Videos Published", value: weeklyReview.videosPublished, icon: Play, color: "text-red-500", bg: "bg-red-500/10" },
    { label: "Beats Created", value: weeklyReview.beatsFinished, icon: Music, color: "text-primary", bg: "bg-primary/10" },
    { label: "Tasks Completed", value: weeklyReview.tasksCompleted, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Focus Hours", value: weeklyReview.focusHours, icon: Clock, color: "text-blue-500", bg: "bg-blue-500/10" },
  ];

  const recentFocus = activityLog.filter(a => a.type === "focus_session").slice(0, 5);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent flex items-center gap-3">
            <BarChart2 className="w-8 h-8 text-primary" /> Weekly Review
          </h1>
          <p className="text-muted-foreground mt-1 text-lg font-medium">Analyze your output. Adjust your trajectory.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-secondary/80 text-foreground rounded-lg font-bold text-sm hover:bg-secondary transition-colors border border-border">
            <Download className="w-4 h-4" /> Export
          </button>
          <div className="bg-orange-500/10 border border-orange-500/20 px-6 py-2.5 rounded-full flex items-center gap-3">
            <Zap className="w-5 h-5 text-orange-500" />
            <span className="font-black text-orange-600">Streak: {weeklyReview.publishingStreak} Days</span>
          </div>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <Card key={i} className="border-border/50 hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${s.bg}`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <p className="text-4xl font-black tracking-tighter mb-1">{s.value}</p>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Output Analysis */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" /> Output Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-bold text-muted-foreground">Publishing Target (3/week)</span>
                    <span className="text-lg font-black text-primary">{Math.min(100, Math.round((weeklyReview.videosPublished / 3) * 100))}%</span>
                  </div>
                  <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${Math.min(100, (weeklyReview.videosPublished / 3) * 100)}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-bold text-muted-foreground">Beat Creation Target (5/week)</span>
                    <span className="text-lg font-black text-emerald-500">{Math.min(100, Math.round((weeklyReview.beatsFinished / 5) * 100))}%</span>
                  </div>
                  <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: `${Math.min(100, (weeklyReview.beatsFinished / 5) * 100)}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-bold text-muted-foreground">Deep Work Target (20h/week)</span>
                    <span className="text-lg font-black text-blue-500">{Math.min(100, Math.round((weeklyReview.focusHours / 20) * 100))}%</span>
                  </div>
                  <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: `${Math.min(100, (weeklyReview.focusHours / 20) * 100)}%` }} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reflection */}
          <Card className="border-border/50 bg-gradient-to-br from-card to-secondary/20">
            <CardHeader>
              <CardTitle className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" /> CEO Reflection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                className="w-full h-48 bg-background border border-border rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none font-medium text-foreground placeholder:text-muted-foreground/50"
                placeholder="What worked? What didn't? How can we execute better next week?"
                value={reflection}
                onChange={e => setReflection(e.target.value)}
              />
              <div className="flex justify-between mt-3 items-center">
                <span className="text-xs text-muted-foreground italic">
                  {isSaving ? "Saving..." : "Auto-saved"}
                </span>
                <button onClick={handleSave} className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2 rounded-lg font-bold text-sm shadow hover:bg-primary/90 transition-colors">
                  <Save className="w-4 h-4" /> Save Reflection
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Recent Focus Sessions */}
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-black uppercase tracking-wider">Recent Deep Work</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentFocus.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No focus sessions recorded.</p>
                ) : recentFocus.map(log => (
                  <div key={log.id} className="flex items-center gap-3 p-2 rounded-lg bg-secondary/30">
                    <Clock className="w-4 h-4 text-blue-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate">{log.title}</p>
                      <p className="text-[10px] text-muted-foreground">{new Date(log.timestamp).toLocaleDateString()} · {log.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Action Items */}
          <Card className="border-orange-500/20 bg-orange-500/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-black uppercase tracking-wider text-orange-600">Next Week's Focus</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                className="w-full h-32 bg-background border border-border rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none font-medium text-foreground placeholder:text-muted-foreground/50"
                placeholder="1. Increase deep work blocks to 4 per day.&#10;2. Batch create 5 beats on Monday."
                value={nextWeekFocus}
                onChange={e => setNextWeekFocus(e.target.value)}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
