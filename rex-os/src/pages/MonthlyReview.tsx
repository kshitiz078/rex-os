import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target, Calendar, Zap, Flag, Plus, X, Trash2, CheckCircle } from "lucide-react";
import { useAppContext } from "../context/AppContext";

export default function MonthlyReview() {
  const { monthlyGoals, addGoal, updateGoalProgress, updateGoal, deleteGoal } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<number | null>(null);

  // New goal form
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Growth");
  const [current, setCurrent] = useState(0);
  const [total, setTotal] = useState(10);
  const [unit, setUnit] = useState("beats");
  const [type, setType] = useState<"monthly" | "quarterly" | "annual">("monthly");

  // Confirmation & Animation state
  const [confirmGoalId, setConfirmGoalId] = useState<number | null>(null);
  const [confirmProgressValue, setConfirmProgressValue] = useState(0);
  const [showSuccessAnim, setShowSuccessAnim] = useState(false);
  const [completedGoalTitle, setCompletedGoalTitle] = useState("");

  // Dynamic Categories (Standard + any custom ones used in goals)
  const allCategories = Array.from(new Set([
    "Growth", "Financial", "Production", 
    ...monthlyGoals.map(g => g.category).filter(Boolean)
  ])).sort();

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    // Check if we are completing it from the edit modal
    const wouldComplete = current >= total;
    if (wouldComplete && editingGoalId) {
       const g = monthlyGoals.find(x => x.id === editingGoalId);
       if (g && g.progress < 100) {
          // It's a new completion!
          setConfirmGoalId(editingGoalId);
          setConfirmProgressValue(current);
          setCompletedGoalTitle(title);
          
          // Apply other edits first
          updateGoal(editingGoalId, { title, category, total, unit, type: type as any });
          setIsModalOpen(false);
          return;
       }
    }

    if (editingGoalId) {
      updateGoal(editingGoalId, { title, category, current, total, unit, type: type as any });
    } else {
      addGoal({ title, category, current, total, unit, type: type as "monthly" | "quarterly" | "annual" });
    }
    setTitle(""); setCategory("Growth"); setCurrent(0); setTotal(10); setUnit("beats");
    setEditingGoalId(null);
    setIsModalOpen(false);
  };

  const handleEditClick = (goal: any) => {
    setEditingGoalId(goal.id);
    setTitle(goal.title);
    setCategory(goal.category);
    setCurrent(goal.current);
    setTotal(goal.total);
    setUnit(goal.unit);
    setType(goal.type);
    setIsModalOpen(true);
  };

  const openNewModal = () => {
    setEditingGoalId(null);
    setTitle(""); setCategory("Growth"); setCurrent(0); setTotal(10); setUnit("beats");
    setIsModalOpen(true);
  };

  const handleIncrement = (goal: any) => {
    const nextVal = Math.min(goal.total, goal.current + 1);
    if (nextVal >= goal.total && goal.progress < 100) {
       setConfirmGoalId(goal.id);
       setConfirmProgressValue(nextVal);
       setCompletedGoalTitle(goal.title);
    } else {
       updateGoalProgress(goal.id, nextVal);
    }
  };

  const handleConfirmCompletion = () => {
    if (confirmGoalId) {
      updateGoalProgress(confirmGoalId, confirmProgressValue);
      setConfirmGoalId(null);
      setShowSuccessAnim(true);
      setTimeout(() => setShowSuccessAnim(false), 3000);
    }
  };

  // Active Goals
  const activeMonthly = monthlyGoals.filter(g => g.type === "monthly" && g.progress < 100);
  const activeQuarterly = monthlyGoals.filter(g => g.type === "quarterly" && g.progress < 100);
  const activeAnnual = monthlyGoals.filter(g => g.type === "annual" && g.progress < 100);
  
  // Completed Goals
  const completedGoals = monthlyGoals.filter(g => g.progress >= 100);

  const renderGoalSection = (sectionTitle: string, goals: any[], icon: React.ReactNode) => (
    <div className="space-y-4 mb-8">
      <h2 className="text-xl font-extrabold flex items-center gap-2">
        {icon} {sectionTitle}
      </h2>
      {goals.length === 0 ? (
        <p className="text-sm text-muted-foreground p-4 bg-secondary/20 rounded-xl border border-border/50 text-center">
          No goals set for this timeframe.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {goals.map(goal => (
            <Card key={goal.id} className="border-border/50 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-5 relative group">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest bg-secondary px-2 py-0.5 rounded-full text-muted-foreground">
                      {goal.category}
                    </span>
                    {goal.progress >= 100 && (
                      <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-600 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Completed
                      </span>
                    )}
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <button onClick={() => handleEditClick(goal)} className="text-[10px] font-bold text-muted-foreground hover:text-primary mr-1">Edit</button>
                    <button onClick={() => deleteGoal(goal.id)} className="p-1 text-muted-foreground hover:text-red-500 rounded"><Trash2 className="w-3 h-3" /></button>
                  </div>
                </div>
                <h3 className="font-bold text-lg mb-1 leading-tight">{goal.title}</h3>
                
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between items-end text-sm">
                    <span className="font-bold text-muted-foreground">Progress</span>
                    <span className="font-black text-primary">{goal.current} / {goal.total} {goal.unit}</span>
                  </div>
                  <Progress value={goal.progress} className={`h-2 [&>div]:${goal.progress >= 100 ? 'bg-emerald-500' : 'bg-primary'}`} />
                </div>

                {/* Quick Update (only if active) */}
                {goal.progress < 100 && (
                  <div className="mt-4 pt-4 border-t border-border/30 flex items-center justify-between">
                    <span className="text-xs font-bold text-muted-foreground">Update Progress</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateGoalProgress(goal.id, Math.max(0, goal.current - 1))}
                        className="w-7 h-7 rounded bg-secondary flex items-center justify-center font-bold hover:bg-secondary/80 transition-colors"
                      >-</button>
                      <button
                        onClick={() => handleIncrement(goal)}
                        className="w-7 h-7 rounded bg-primary/10 text-primary flex items-center justify-center font-bold hover:bg-primary hover:text-primary-foreground transition-colors"
                      >+</button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-10 relative">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent flex items-center gap-3">
            <Target className="w-8 h-8 text-primary" /> Goal Tracker
          </h1>
          <p className="text-muted-foreground mt-1 text-lg font-medium">Monthly, Quarterly, and Annual Targets.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={openNewModal}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2.5 rounded-full font-bold shadow-lg hover:shadow-primary/25 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> New Goal
          </button>
        </div>
      </div>

      {renderGoalSection("Monthly Goals", activeMonthly, <Zap className="w-5 h-5 text-orange-500" />)}
      {renderGoalSection("Quarterly Goals", activeQuarterly, <Calendar className="w-5 h-5 text-blue-500" />)}
      {renderGoalSection("Annual Goals", activeAnnual, <Flag className="w-5 h-5 text-emerald-500" />)}

      {/* Dedicated Completed Section */}
      {completedGoals.length > 0 && (
         <div className="mt-12 pt-8 border-t border-border/50">
            {renderGoalSection("Completed Goals", completedGoals, <CheckCircle className="w-5 h-5 text-emerald-500" />)}
         </div>
      )}

      {/* New/Edit Goal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full border-border/50 bg-card rounded-2xl shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1 hover:bg-secondary rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
            <CardHeader>
              <CardTitle className="text-xl font-extrabold">{editingGoalId ? 'Edit Goal' : 'Add New Goal'}</CardTitle>
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
                  <div className="space-y-1 relative">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Category</label>
                    <input type="text" list="categories" value={category} onChange={e => setCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                    <datalist id="categories">
                      {allCategories.map(c => <option key={c} value={c} />)}
                    </datalist>
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
                  {editingGoalId ? 'Save Changes' : 'Create Goal'}
                </button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmGoalId && (
         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-card border border-border/50 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95">
               <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8" />
               </div>
               <h3 className="text-2xl font-black mb-2 tracking-tight">Goal Achieved?</h3>
               <p className="text-muted-foreground mb-6 font-medium">Are you ready to mark "<strong className="text-foreground">{completedGoalTitle}</strong>" as completely finished?</p>
               <div className="flex gap-3">
                  <button onClick={() => setConfirmGoalId(null)} className="flex-1 py-2.5 rounded-xl font-bold bg-secondary hover:bg-secondary/80 transition-colors">Not yet</button>
                  <button onClick={handleConfirmCompletion} className="flex-1 py-2.5 rounded-xl font-bold bg-emerald-500 text-white shadow-lg hover:bg-emerald-600 transition-colors">Yes, I did it!</button>
               </div>
            </div>
         </div>
      )}

      {/* Success Animation Overlay */}
      {showSuccessAnim && (
         <div className="fixed inset-0 z-[70] flex items-center justify-center pointer-events-none animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-emerald-950/20 backdrop-blur-[2px]" />
            <div className="relative text-center animate-out zoom-out-95 fade-out duration-1000 delay-2000 fill-mode-forwards">
               <div className="text-8xl mb-4 animate-bounce">🏆</div>
               <h2 className="text-5xl font-black tracking-tighter text-emerald-400 drop-shadow-2xl">GOAL COMPLETED!</h2>
               <p className="text-2xl font-bold text-white mt-2 drop-shadow-md">"{completedGoalTitle}"</p>
               
               {/* Decorative floating particles */}
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full">
                  <div className="absolute -top-32 -left-32 text-4xl animate-pulse delay-75">✨</div>
                  <div className="absolute top-10 left-48 text-5xl animate-pulse delay-150">🎉</div>
                  <div className="absolute -bottom-20 -right-20 text-4xl animate-pulse delay-300">🔥</div>
                  <div className="absolute -top-10 right-32 text-6xl animate-pulse">🎯</div>
               </div>
            </div>
         </div>
      )}
    </div>
  );
}
