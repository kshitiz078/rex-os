import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList, Plus, X, CheckCircle2, Clock, ArrowRight, Trash2, Edit3 } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import type { DailyLog } from "../context/AppContext";
import PageHeader from "../components/shared/PageHeader";

const CATEGORIES = ["Music Production", "Content Publishing", "Business", "Marketing", "Admin", "Learning", "Other"];
const STATUSES = ["Completed", "In Progress", "Blocked"] as const;

export default function DailyLog() {
  const { dailyLogs, addDailyLog, updateDailyLog, deleteDailyLog } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<DailyLog | null>(null);

  // Form state
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [task, setTask] = useState("");
  const [output, setOutput] = useState("");
  const [timeSpent, setTimeSpent] = useState<number>(60);
  const [status, setStatus] = useState<DailyLog["status"]>("Completed");
  const [notes, setNotes] = useState("");
  const [nextAction, setNextAction] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterCat, setFilterCat] = useState("All");

  const resetForm = () => {
    setDate(new Date().toISOString().split("T")[0]);
    setCategory(CATEGORIES[0]); setTask(""); setOutput("");
    setTimeSpent(60); setStatus("Completed"); setNotes(""); setNextAction("");
    setEditingLog(null);
  };

  const openEditModal = (log: DailyLog) => {
    setEditingLog(log);
    setDate(log.date); setCategory(log.category); setTask(log.task);
    setOutput(log.output); setTimeSpent(log.timeSpent); setStatus(log.status);
    setNotes(log.notes); setNextAction(log.nextAction);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!task.trim()) return;
    const logData = { date, category, task, output, timeSpent, status, notes, nextAction };
    if (editingLog) updateDailyLog({ ...logData, id: editingLog.id });
    else addDailyLog(logData);
    resetForm();
    setIsModalOpen(false);
  };

  const statusColors = {
    Completed: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    "In Progress": "bg-orange-500/10 text-orange-600 border-orange-500/20",
    Blocked: "bg-red-500/10 text-red-600 border-red-500/20",
  };

  const today = new Date().toISOString().split("T")[0];
  const todayLogs = dailyLogs.filter(l => l.date === today);
  const todayMinutes = todayLogs.reduce((acc, l) => acc + l.timeSpent, 0);
  const todayCompleted = todayLogs.filter(l => l.status === "Completed").length;

  const filtered = dailyLogs.filter(l => {
    const matchDate = !filterDate || l.date === filterDate;
    const matchCat = filterCat === "All" || l.category === filterCat;
    return matchDate && matchCat;
  });

  const grouped = filtered.reduce((acc, log) => {
    const d = log.date;
    if (!acc[d]) acc[d] = [];
    acc[d].push(log);
    return acc;
  }, {} as Record<string, DailyLog[]>);

  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-10">
      <PageHeader
        icon={ClipboardList}
        title="Daily Log"
        subtitle="Track your work output and build momentum."
        actions={
          <button
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 rounded-full font-bold shadow-lg hover:shadow-primary/25 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" /> Log Work
          </button>
        }
      />

      {/* Today's Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Today's Logs", value: todayLogs.length, color: "text-primary", bg: "bg-primary/10" },
          { label: "Hours Worked", value: `${Math.round(todayMinutes / 60 * 10) / 10}h`, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Tasks Done", value: todayCompleted, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Total Logged", value: dailyLogs.length, color: "text-orange-500", bg: "bg-orange-500/10" },
        ].map((s, i) => (
          <Card key={i} className="border-border/50 hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-5">
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
                <ClipboardList className={`w-5 h-5 ${s.color}`} />
              </div>
              <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground font-medium mt-1">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)}
          className="bg-background border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
          className="bg-background border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
          <option value="All">All Categories</option>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        {(filterDate || filterCat !== "All") && (
          <button onClick={() => { setFilterDate(""); setFilterCat("All"); }} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
            <X className="w-3 h-3" /> Clear
          </button>
        )}
      </div>

      {/* Log List */}
      <div className="space-y-6">
        {sortedDates.length === 0 ? (
          <Card className="border-border/50">
            <CardContent className="p-12 text-center">
              <ClipboardList className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
              <p className="text-lg font-medium text-muted-foreground">No logs yet.</p>
              <button onClick={() => setIsModalOpen(true)} className="mt-2 text-primary hover:underline text-sm font-bold">+ Log your first work session</button>
            </CardContent>
          </Card>
        ) : sortedDates.map(dateKey => {
          const dayLogs = grouped[dateKey];
          const dayMinutes = dayLogs.reduce((acc, l) => acc + l.timeSpent, 0);
          const isToday = dateKey === today;
          return (
            <div key={dateKey}>
              <div className="flex items-center gap-3 mb-3">
                <h3 className="text-sm font-black uppercase tracking-wider text-muted-foreground">
                  {isToday ? "Today" : new Date(dateKey + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
                </h3>
                <div className="h-px flex-1 bg-border/50" />
                <span className="text-xs text-muted-foreground font-bold">{Math.round(dayMinutes / 60 * 10) / 10}h · {dayLogs.length} tasks</span>
              </div>
              <Card className="border-border/50 overflow-hidden">
                <div className="divide-y divide-border/30">
                  {dayLogs.map(log => (
                    <div key={log.id} className="p-4 hover:bg-secondary/20 transition-colors group flex items-start gap-4">
                      <div className="mt-0.5 shrink-0">
                        {log.status === "Completed" ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        ) : log.status === "Blocked" ? (
                          <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center">
                            <X className="w-3 h-3 text-red-500" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-orange-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-bold text-sm">{log.task}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] bg-secondary px-1.5 py-0.5 rounded font-bold">{log.category}</span>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-black uppercase ${statusColors[log.status]}`}>{log.status}</span>
                              <span className="text-[10px] text-muted-foreground flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" />{Math.round(log.timeSpent / 60 * 10) / 10}h</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                            <button onClick={() => openEditModal(log)} className="p-1 hover:text-primary rounded-md transition-colors text-muted-foreground"><Edit3 className="w-3.5 h-3.5" /></button>
                            <button onClick={() => deleteDailyLog(log.id)} className="p-1 hover:text-red-500 rounded-md transition-colors text-muted-foreground"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </div>
                        {log.output && <p className="text-xs text-muted-foreground mt-1">Output: {log.output}</p>}
                        {log.nextAction && (
                          <div className="flex items-center gap-1 mt-1.5 text-xs text-primary font-medium">
                            <ArrowRight className="w-3 h-3" /> Next: {log.nextAction}
                          </div>
                        )}
                        {log.notes && <p className="text-xs text-muted-foreground/70 mt-1 italic">{log.notes}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          );
        })}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-lg w-full border-border/50 bg-card rounded-2xl shadow-2xl relative animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <button onClick={() => { setIsModalOpen(false); resetForm(); }} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1 hover:bg-secondary rounded-lg transition-colors z-10">
              <X className="w-5 h-5" />
            </button>
            <CardHeader className="shrink-0">
              <CardTitle className="text-xl font-extrabold">{editingLog ? "Edit Log" : "Log Work Session"}</CardTitle>
            </CardHeader>
            <CardContent className="overflow-y-auto">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Date</label>
                    <input type="date" value={date} onChange={e => setDate(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Category</label>
                    <select value={category} onChange={e => setCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Task *</label>
                  <input type="text" required value={task} onChange={e => setTask(e.target.value)} placeholder="What did you work on?"
                    className="w-full px-3.5 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Output / Result</label>
                  <input type="text" value={output} onChange={e => setOutput(e.target.value)} placeholder="What did you produce or accomplish?"
                    className="w-full px-3.5 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Time Spent (minutes)</label>
                    <input type="number" value={timeSpent} min={1} onChange={e => setTimeSpent(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</label>
                    <select value={status} onChange={e => setStatus(e.target.value as DailyLog["status"])}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                      {STATUSES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Next Action</label>
                  <input type="text" value={nextAction} onChange={e => setNextAction(e.target.value)} placeholder="What's the next step?"
                    className="w-full px-3.5 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Notes</label>
                  <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Anything else worth noting..."
                    className="w-full px-3.5 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" />
                </div>
                <button type="submit" className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-bold py-2.5 rounded-lg shadow-lg transition-all">
                  {editingLog ? "Update Log" : "Save Log"}
                </button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
