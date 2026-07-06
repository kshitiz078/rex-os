import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target, Calendar, Zap, Flag, Plus, X, Trash2 } from "lucide-react";
import { useAppContext } from "../context/AppContext";

export default function MonthlyReview() {
  const { monthlyGoals, addGoal, updateGoalProgress, deleteGoal } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New goal form
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Growth");
  const [current, setCurrent] = useState(0);
  const [total, setTotal] = useState(10);
  const [unit, setUnit] = useState("beats");
  const [type, setType] = useState<"monthly" | "quarterly" | "annual">("monthly");

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addGoal({
      title, category, current, total, unit, type: type as "monthly" | "quarterly" | "annual",
    });
    setTitle(""); setCategory("Growth"); setCurrent(0); setTotal(10); setUnit("beats");
    setIsModalOpen(false);
  };

  const getGoalsByType = (t: string) => monthlyGoals.filter(g => g.type === t);

  const renderGoalSection = (title: string, goals: any[], icon: any) => (
    <div className="space-y-4 mb-8">
      <h2 className="text-xl font-extrabold flex items-center gap-2">
        {icon} {title}
      </h2>
      {goals.length === 0 ? (
        <p className="text-sm text-muted-foreground p-4 bg-secondary/20 rounded-xl border border-border/50 text-center">No goals set for this timeframe.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {goals.map(goal => (
            <Card key={goal.id} className="border-border/50 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-5 relative group">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest bg-secondary px-2 py-0.5 rounded-full text-muted-foreground">
                    {goal.category}
                  </span>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <button onClick={() => deleteGoal(goal.id)} className="p-1 text-muted-foreground hover:text-red-500 rounded"><Trash2 className="w-3 h-3" /></button>
                  </div>
                </div>
                <h3 className="font-bold text-lg mb-1 leading-tight">{goal.title}</h3>
                
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between items-end text-sm">
                    <span className="font-bold text-muted-foreground">Progress</span>
                    <span className="font-black text-primary">{goal.current} / {goal.total} {goal.unit}</span>
                  </div>
                  <Progress value={goal.progress} className="h-2 [&>div]:bg-primary" />
                </div>

                {/* Quick Update */}
                <div className="mt-4 pt-4 border-t border-border/30 flex items-center justify-between">
                  <span className="text-xs font-bold text-muted-foreground">Update Progress</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateGoalProgress(goal.id, Math.max(0, goal.current - 1))}
                      className="w-7 h-7 rounded bg-secondary flex items-center justify-center font-bold hover:bg-secondary/80"
                    >-</button>
                    <button
                      onClick={() => updateGoalProgress(goal.id, Math.min(goal.total, goal.current + 1))}
                      className="w-7 h-7 rounded bg-primary/10 text-primary flex items-center justify-center font-bold hover:bg-primary hover:text-primary-foreground transition-colors"
                    >+</button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent flex items-center gap-3">
            <Target className="w-8 h-8 text-primary" /> Goal Tracker
          </h1>
          <p className="text-muted-foreground mt-1 text-lg font-medium">Monthly, Quarterly, and Annual Targets.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2.5 rounded-full font-bold shadow-lg hover:shadow-primary/25 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> New Goal
        </button>
      </div>

      {renderGoalSection("Monthly Goals", getGoalsByType("monthly"), <Zap className="w-5 h-5 text-orange-500" />)}
      {renderGoalSection("Quarterly Goals", getGoalsByType("quarterly"), <Calendar className="w-5 h-5 text-blue-500" />)}
      {renderGoalSection("Annual Goals", getGoalsByType("annual"), <Flag className="w-5 h-5 text-emerald-500" />)}

      {/* New Goal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full border-border/50 bg-card rounded-2xl shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1 hover:bg-secondary rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
            <CardHeader>
              <CardTitle className="text-xl font-extrabold">Add New Goal</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddGoal} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Goal Title *</label>
                  <input type="text" required value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Publish 10 Beats"
                    className="w-full px-3.5 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Timeframe</label>
                    <select value={type} onChange={e => setType(e.target.value as any)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="annual">Annual</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Category</label>
                    <select value={category} onChange={e => setCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                      <option>Growth</option><option>Financial</option><option>Production</option><option>Health</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Start</label>
                    <input type="number" value={current} onChange={e => setCurrent(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Target</label>
                    <input type="number" required value={total} onChange={e => setTotal(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Unit</label>
                    <input type="text" value={unit} onChange={e => setUnit(e.target.value)} placeholder="beats, $"
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  </div>
                </div>
                <button type="submit" className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-bold py-2.5 rounded-lg shadow-lg transition-all mt-2">
                  Create Goal
                </button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
