import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Zap, Clock, Target, Plus, CheckCircle2, GripVertical, Trash2,
  Play, Circle, Check, Flame, AlertCircle, Pause, RotateCcw, SkipForward,
  Battery, BatteryMedium, BatteryLow
} from "lucide-react";
import { useAppContext } from "../context/AppContext";
// unused import removed

const ENERGY_LEVELS = [
  { value: "High", icon: Battery, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { value: "Medium", icon: BatteryMedium, color: "text-yellow-500", bg: "bg-yellow-500/10" },
  { value: "Low", icon: BatteryLow, color: "text-red-500", bg: "bg-red-500/10" },
];

export default function MissionControl() {
  const {
    oneImportantTask, setOneImportantTask,
    secondaryTasks, addSecondaryTask, toggleSecondaryTask, deleteSecondaryTask, reorderSecondaryTasks,
    notes, setNotes,
    appSettings,
    addActivity,
    weeklyReview,
  } = useAppContext();

  // Mission edit
  const [isEditingMission, setIsEditingMission] = useState(false);
  const [missionInput, setMissionInput] = useState(oneImportantTask);

  // New task form
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskText, setNewTaskText] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<"High" | "Medium" | "Low">("Medium");
  const [newTaskEnergy, setNewTaskEnergy] = useState<"High" | "Medium" | "Low">("Medium");
  const [newTaskMins, setNewTaskMins] = useState<number | undefined>(undefined);
  const [newTaskProject, setNewTaskProject] = useState("");

  // Energy level
  const [energyLevel, setEnergyLevel] = useState<"High" | "Medium" | "Low">("High");

  // Pomodoro
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(appSettings.defaultFocusMinutes * 60);
  const [focusSession, setFocusSession] = useState(1);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const endTimeRef = useRef<number | null>(null);

  useEffect(() => {
    setTimerSeconds(appSettings.defaultFocusMinutes * 60);
  }, [appSettings.defaultFocusMinutes]);

  useEffect(() => {
    if (timerRunning) {
      setTimerSeconds(currentSeconds => {
        if (!endTimeRef.current) {
          endTimeRef.current = Date.now() + currentSeconds * 1000;
        }
        return currentSeconds;
      });

      intervalRef.current = setInterval(() => {
        if (!endTimeRef.current) return;
        const remaining = Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000));
        setTimerSeconds(remaining);
        
        if (remaining <= 0) {
          setTimerRunning(false);
          setFocusSession(p => p + 1);
          addActivity({ type: 'focus_session', title: 'Focus Session Complete', description: `${appSettings.defaultFocusMinutes}-min deep work session completed`, icon: 'clock', color: 'text-blue-500 bg-blue-500/10' });
          endTimeRef.current = null;
          setTimerSeconds(appSettings.defaultFocusMinutes * 60);
        }
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      endTimeRef.current = null;
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [timerRunning, appSettings.defaultFocusMinutes, addActivity]);

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  const timerProgress = ((appSettings.defaultFocusMinutes * 60 - timerSeconds) / (appSettings.defaultFocusMinutes * 60)) * 100;

  const handleSaveMission = () => {
    setOneImportantTask(missionInput);
    setIsEditingMission(false);
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    if (newTaskMins !== undefined && newTaskMins < 0) return;
    addSecondaryTask({
      text: newTaskText,
      priority: newTaskPriority,
      estimatedMinutes: newTaskMins,
      project: newTaskProject || undefined,
      energy: newTaskEnergy,
    });
    setNewTaskText("");
    setNewTaskPriority("Medium");
    setNewTaskEnergy("Medium");
    setNewTaskMins(undefined);
    setNewTaskProject("");
    setShowAddTask(false);
  };

  const completedCount = secondaryTasks.filter(t => t.completed).length;
  const totalCount = secondaryTasks.length;
  const taskProgress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const completedTasks = secondaryTasks.filter(t => t.completed);

  const priorityColors = {
    High: "bg-red-500/10 text-red-600 border-red-500/20",
    Medium: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
    Low: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  };

  // Drag and drop
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const handleDragStart = (index: number) => { dragItem.current = index; };
  const handleDragEnter = (index: number) => { dragOverItem.current = index; };
  const handleDragEnd = () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    const tasks = [...secondaryTasks];
    const [moved] = tasks.splice(dragItem.current, 1);
    tasks.splice(dragOverItem.current, 0, moved);
    reorderSecondaryTasks(tasks);
    dragItem.current = null;
    dragOverItem.current = null;
  };

  if (isFocusMode) {
    return (
      <div className="fixed inset-0 bg-background flex flex-col items-center justify-center z-40 animate-in fade-in duration-500">
        <div className="text-center space-y-8 max-w-lg px-8">
          <div className="space-y-2">
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Focus Mode · Session {focusSession}</p>
            <h2 className="text-2xl font-extrabold">{oneImportantTask}</h2>
          </div>
          <div className={`text-8xl font-black tracking-tighter ${timerRunning ? 'text-primary' : 'text-muted-foreground'} transition-colors`}>
            {formatTime(timerSeconds)}
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div className="bg-primary rounded-full h-2 transition-all duration-1000" style={{ width: `${timerProgress}%` }} />
          </div>
          <div className="flex items-center justify-center gap-4">
            <button onClick={() => setTimerRunning(r => !r)}
              className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-black flex items-center gap-2 hover:bg-primary/90 transition-all hover:scale-105">
              {timerRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
              {timerRunning ? "Pause" : "Start"}
            </button>
            <button onClick={() => { setTimerRunning(false); setTimerSeconds(appSettings.defaultFocusMinutes * 60); }}
              className="p-3 rounded-full bg-secondary hover:bg-secondary/80 transition-colors">
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
          <button onClick={() => setIsFocusMode(false)} className="text-muted-foreground hover:text-foreground text-sm underline transition-colors">
            Exit Focus Mode
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
            Mission Control
          </h1>
          <p className="text-muted-foreground mt-1 text-lg font-medium">Execute on today's highest leverage tasks.</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Energy Level */}
          <div className="flex items-center gap-1 bg-secondary/50 rounded-full border border-border p-1" title="Select your current energy level. Tasks matching this level will be highlighted below.">
            {ENERGY_LEVELS.map(e => (
              <button
                key={e.value}
                onClick={() => setEnergyLevel(e.value as any)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-black transition-all ${energyLevel === e.value ? `${e.bg} ${e.color}` : 'text-muted-foreground hover:text-foreground'}`}
              >
                <e.icon className="w-3 h-3" />
                {e.value}
              </button>
            ))}
          </div>
          <button
            onClick={() => setIsFocusMode(true)}
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-6 py-2.5 rounded-full font-black shadow-lg hover:shadow-emerald-500/25 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            <Zap className="w-4 h-4" /> Focus Mode
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Main Mission */}
          <Card className="group relative overflow-hidden border-none shadow-xl bg-gradient-to-br from-primary/10 via-primary/5 to-background hover:shadow-2xl transition-all duration-500 rounded-2xl">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-700 pointer-events-none">
              <Target className="w-48 h-48 text-primary" />
            </div>
            <CardHeader className="relative z-10 pb-2">
              <CardTitle className="text-primary flex items-center justify-between text-xs font-black uppercase tracking-widest w-full">
                <span className="flex items-center gap-2"><Flame className="w-4 h-4 text-orange-500" /> Today's ONE Most Important Task</span>
                <button onClick={() => setIsEditingMission(v => !v)} className="text-xs text-muted-foreground hover:text-primary underline normal-case tracking-normal font-bold transition-colors">
                  {isEditingMission ? "Cancel" : "Edit"}
                </button>
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              {isEditingMission ? (
                <div className="space-y-3 mb-6">
                  <input
                    type="text" value={missionInput}
                    onChange={e => setMissionInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleSaveMission()}
                    className="w-full px-4 py-3 rounded-xl bg-background border border-border text-xl font-bold focus:outline-none focus:ring-2 focus:ring-primary/55"
                  />
                  <button onClick={handleSaveMission} className="bg-primary text-primary-foreground px-5 py-2 rounded-xl font-bold text-sm shadow hover:bg-primary/95 transition-colors">
                    Save Mission
                  </button>
                </div>
              ) : (
                <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4 group-hover:text-primary transition-colors">
                  {oneImportantTask}
                </h2>
              )}
              <p className="text-muted-foreground mb-6 max-w-xl">Lock in. Block distractions. Execute on the one thing that makes today a success.</p>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => { setTimerRunning(true); setIsFocusMode(true); }}
                  className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all shadow-lg hover:shadow-primary/25"
                >
                  <Play className="w-5 h-5 fill-current" /> Start Deep Work
                </button>
                <div className="flex items-center gap-2 bg-background/50 backdrop-blur-sm px-4 py-3 rounded-xl border border-border text-sm">
                  <AlertCircle className="w-4 h-4 text-orange-500" />
                  <span className="font-semibold text-orange-700 dark:text-orange-400">Energy: {energyLevel}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Secondary Tasks + Timer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Secondary Tasks */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-md hover:shadow-lg transition-all duration-300 flex flex-col">
              <div>
                <CardHeader className="pb-3 border-b border-border/50">
                  <CardTitle className="text-xs text-muted-foreground font-black uppercase tracking-wider flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2"><Zap className="w-4 h-4" /> Secondary Tasks</span>
                    <button
                      onClick={() => setShowAddTask(v => !v)}
                      className="p-1 bg-primary/10 text-primary rounded-md hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </CardTitle>
                </CardHeader>

                {showAddTask && (
                  <form onSubmit={handleAddTask} className="p-3 border-b border-border/30 space-y-2 bg-secondary/20">
                    <input
                      type="text" placeholder="Task description..." value={newTaskText} autoFocus
                      onChange={e => setNewTaskText(e.target.value)}
                      className="w-full bg-background border border-border px-2.5 py-1.5 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <select value={newTaskPriority} onChange={e => setNewTaskPriority(e.target.value as any)}
                        className="bg-background border border-border px-2 py-1 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-primary">
                        <option value="High">High Prio</option>
                        <option value="Medium">Med Prio</option>
                        <option value="Low">Low Prio</option>
                      </select>
                      <select value={newTaskEnergy} onChange={e => setNewTaskEnergy(e.target.value as any)}
                        className="bg-background border border-border px-2 py-1 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-primary">
                        <option value="High">High Energy</option>
                        <option value="Medium">Med Energy</option>
                        <option value="Low">Low Energy</option>
                      </select>
                      <input type="number" min="1" placeholder="Est. mins" value={newTaskMins || ""}
                        onChange={e => setNewTaskMins(e.target.value ? parseInt(e.target.value) : undefined)}
                        className="bg-background border border-border px-2 py-1 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button type="submit" className="flex-1 py-1 bg-primary text-primary-foreground rounded-md text-xs font-bold hover:bg-primary/95 transition-colors">Add Task</button>
                      <button type="button" onClick={() => setShowAddTask(false)} className="px-2 py-1 bg-secondary rounded-md text-xs hover:bg-secondary/80 transition-colors">Cancel</button>
                    </div>
                  </form>
                )}

                <CardContent className="p-0">
                  <div className="flex flex-col">
                    {secondaryTasks.map((task, index) => (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragEnter={() => handleDragEnter(index)}
                        onDragEnd={handleDragEnd}
                        onDragOver={e => e.preventDefault()}
                        className={`flex items-start gap-2 p-3 border-b border-border/20 last:border-0 hover:bg-secondary/30 transition-colors cursor-grab active:cursor-grabbing group/task ${task.completed ? 'opacity-60' : ''} ${!task.completed && task.energy === energyLevel ? 'bg-primary/5 border-l-2 border-l-primary' : ''}`}
                      >
                        <GripVertical className="w-3.5 h-3.5 text-muted-foreground/30 group-hover/task:text-muted-foreground mt-0.5 shrink-0 transition-colors" />
                        <button onClick={() => toggleSecondaryTask(task.id)} className="mt-0.5 shrink-0">
                          {task.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-primary transition-colors" />
                          ) : (
                            <Circle className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <span className={`text-sm font-medium block ${task.completed ? 'line-through text-muted-foreground' : ''}`}>{task.text}</span>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            {task.priority && (
                              <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full border uppercase tracking-wide ${priorityColors[task.priority]}`}>
                                {task.priority}
                              </span>
                            )}
                            {task.energy && (
                              <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full border uppercase tracking-wide ${task.energy === 'High' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : task.energy === 'Medium' ? 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' : 'bg-red-500/10 text-red-600 border-red-500/20'}`}>
                                {task.energy} Energy
                              </span>
                            )}
                            {task.estimatedMinutes && (
                              <span className="text-[9px] text-muted-foreground flex items-center gap-0.5">
                                <Clock className="w-2.5 h-2.5" /> {task.estimatedMinutes}m
                              </span>
                            )}
                          </div>
                        </div>
                        <button onClick={() => deleteSecondaryTask(task.id)} className="p-1 opacity-0 group-hover/task:opacity-100 hover:text-red-500 transition-all text-muted-foreground shrink-0">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    {secondaryTasks.length === 0 && (
                      <div className="p-6 text-center text-muted-foreground">
                        <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500/50" />
                        <p className="text-xs font-medium">No tasks added yet!</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </div>
            </Card>

            {/* Pomodoro Timer */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-md hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-3 border-b border-border/50">
                <CardTitle className="text-xs text-muted-foreground font-black uppercase tracking-wider flex items-center gap-2">
                  <Play className="w-4 h-4" /> Pomodoro Timer
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="text-center mb-5">
                  <div className={`text-6xl font-black tracking-tighter mb-1 transition-colors ${timerRunning ? 'text-primary' : 'text-foreground'}`}>
                    {formatTime(timerSeconds)}
                  </div>
                  <p className="text-xs text-muted-foreground font-medium">Session {focusSession} of {appSettings.defaultFocusMinutes}min</p>
                </div>

                {/* Circular-ish progress */}
                <div className="mb-4">
                  <Progress value={timerProgress} className="h-2.5 [&>div]:bg-gradient-to-r [&>div]:from-primary [&>div]:to-orange-500 transition-all duration-1000" />
                  <div className="flex justify-between text-[10px] text-muted-foreground mt-1 font-medium">
                    <span>0:00</span>
                    <span className="text-primary font-bold">{Math.round(timerProgress)}%</span>
                    <span>{appSettings.defaultFocusMinutes}:00</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setTimerRunning(r => !r)}
                    className="col-span-2 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 shadow-md"
                  >
                    {timerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                    {timerRunning ? "Pause" : "Start"}
                  </button>
                  <button
                    onClick={() => { setTimerRunning(false); setTimerSeconds(appSettings.defaultFocusMinutes * 60); }}
                    className="flex items-center justify-center py-2.5 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>

                <button
                  onClick={() => { setTimerRunning(false); setFocusSession(p => p + 1); setTimerSeconds(appSettings.defaultFocusMinutes * 60); }}
                  className="w-full mt-2 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground border border-border/50 hover:border-border transition-colors"
                >
                  <SkipForward className="w-3 h-3" /> Skip Session
                </button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-5">
          {/* Progress */}
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold">Today's Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-muted-foreground">Tasks</span>
                  <span className="text-primary">{completedCount} / {totalCount}</span>
                </div>
                <Progress value={taskProgress} className="h-2.5 [&>div]:bg-primary" />
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-muted-foreground">Publishing Streak</span>
                  <span className="text-orange-500 flex items-center gap-1">
                    🔥 {weeklyReview.publishingStreak} days {weeklyReview.publishingStreak >= (appSettings.publishingStreakGoal || 7) && "🏆"}
                  </span>
                </div>
                <Progress 
                  value={Math.min((weeklyReview.publishingStreak / (appSettings.publishingStreakGoal || 7)) * 100, 100)} 
                  className={`h-2.5 ${weeklyReview.publishingStreak >= (appSettings.publishingStreakGoal || 7) ? "[&>div]:bg-gradient-to-r [&>div]:from-orange-500 [&>div]:to-yellow-500" : "[&>div]:bg-orange-500"}`} 
                />
              </div>
            </CardContent>
          </Card>

          {/* Completed today */}
          <Card className="border-border/50 bg-secondary/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-muted-foreground font-black uppercase tracking-wider">Completed Today</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {completedTasks.length === 0 ? (
                <p className="text-xs text-muted-foreground">No tasks completed yet.</p>
              ) : completedTasks.map(task => (
                <div key={task.id} className="flex items-center gap-2 text-xs font-medium">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="line-through text-muted-foreground truncate">{task.text}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Notes */}
          <Card className="border-amber-200/80 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950 shadow-sm transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-amber-800 dark:text-amber-400 font-black uppercase tracking-wider">Quick Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                className="w-full h-32 bg-transparent border-none focus:ring-0 resize-none placeholder:text-amber-800/60 dark:placeholder:text-amber-400/50 text-sm font-medium text-amber-950 dark:text-amber-100 focus:outline-none"
                placeholder="Jot thoughts without breaking focus..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
