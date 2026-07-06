import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  FolderKanban, Activity, Calendar, Target, Zap, Clock, CheckCircle2,
  X, Plus, AlertTriangle, TrendingUp, ChevronRight
} from "lucide-react";
import { useAppContext } from "../context/AppContext";
import type { Project } from "../context/AppContext";

function ProjectDrawer({ project, onClose }: { project: Project; onClose: () => void }) {
  const { toggleProjectTask, addProjectTask, updateProject } = useAppContext();
  const [newTaskText, setNewTaskText] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<"High" | "Medium" | "Low">("Medium");
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState(project.notes);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    addProjectTask(project.id, { text: newTaskText, completed: false, priority: newTaskPriority });
    setNewTaskText("");
  };

  const handleSaveNotes = () => {
    updateProject({ ...project, notes: notesValue });
    setEditingNotes(false);
  };

  const priorityColors = {
    High: "bg-red-500/10 text-red-600 border-red-500/20",
    Medium: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
    Low: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  };

  const healthColor = project.health === 'On Track' ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
    : project.health === 'Completed' ? 'text-blue-500 bg-blue-500/10 border-blue-500/20'
    : 'text-red-500 bg-red-500/10 border-red-500/20';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-0 md:p-4" onClick={onClose}>
      <div
        className="w-full md:max-w-2xl bg-card border border-border/70 rounded-t-2xl md:rounded-2xl shadow-2xl max-h-[90vh] flex flex-col animate-in fade-in slide-in-from-bottom-4 md:zoom-in-95 duration-300"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-border/50">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-2xl font-extrabold tracking-tight">{project.name}</h2>
              <span className={`text-xs font-black px-2.5 py-1 rounded-full border uppercase tracking-wide ${healthColor}`}>
                {project.health}
              </span>
              <span className={`text-xs font-black px-2.5 py-1 rounded-full uppercase tracking-wide ${project.priorityColor}`}>
                <Zap className="w-3 h-3 inline mr-0.5" />{project.priority}
              </span>
            </div>
            <p className="text-muted-foreground mt-1">{project.description}</p>
            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {project.deadline}</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {project.timeInvested}h invested</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-lg transition-colors ml-4 shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-bold">
              <span>Overall Progress</span>
              <span className="text-primary">{project.progress}%</span>
            </div>
            <Progress value={project.progress} className="h-3 [&>div]:bg-gradient-to-r [&>div]:from-primary/80 [&>div]:to-primary" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{project.tasks.filter(t => t.completed).length} tasks done</span>
              <span>{project.tasks.filter(t => !t.completed).length} remaining</span>
            </div>
          </div>

          {/* Milestones */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-3">Milestones</h4>
            <div className="space-y-2">
              {project.milestones.map((m, i) => (
                <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-secondary/30">
                  <CheckCircle2 className={`w-4 h-4 shrink-0 ${m.completed ? 'text-emerald-500' : 'text-muted-foreground/30'}`} />
                  <span className={`text-sm font-medium ${m.completed ? 'line-through text-muted-foreground' : ''}`}>{m.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tasks */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-3">Tasks</h4>
            <div className="space-y-1.5 mb-3">
              {project.tasks.map(task => (
                <div
                  key={task.id}
                  onClick={() => toggleProjectTask(project.id, task.id)}
                  className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-secondary/30 transition-colors cursor-pointer group"
                >
                  {task.completed
                    ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    : <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30 group-hover:border-primary shrink-0 transition-colors" />
                  }
                  <span className={`text-sm font-medium flex-1 ${task.completed ? 'line-through text-muted-foreground' : ''}`}>{task.text}</span>
                  {task.priority && (
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full border uppercase ${priorityColors[task.priority]}`}>
                      {task.priority}
                    </span>
                  )}
                </div>
              ))}
            </div>
            <form onSubmit={handleAddTask} className="flex gap-2">
              <select value={newTaskPriority} onChange={e => setNewTaskPriority(e.target.value as any)}
                className="bg-background border border-border rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary">
                <option value="High">High</option>
                <option value="Medium">Med</option>
                <option value="Low">Low</option>
              </select>
              <input type="text" placeholder="Add task..." value={newTaskText} onChange={e => setNewTaskText(e.target.value)}
                className="flex-1 bg-background border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button type="submit" className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-bold hover:bg-primary/95 transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Notes */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Notes</h4>
              <button onClick={() => setEditingNotes(v => !v)} className="text-xs text-primary hover:underline font-bold">{editingNotes ? "Save" : "Edit"}</button>
            </div>
            {editingNotes ? (
              <div className="space-y-2">
                <textarea value={notesValue} onChange={e => setNotesValue(e.target.value)}
                  className="w-full h-24 bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none" />
                <div className="flex gap-2">
                  <button onClick={handleSaveNotes} className="px-3 py-1 bg-primary text-primary-foreground rounded-md text-xs font-bold">Save</button>
                  <button onClick={() => setEditingNotes(false)} className="px-3 py-1 bg-secondary rounded-md text-xs">Cancel</button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground bg-secondary/30 rounded-lg p-3 min-h-[60px]">{project.notes || "No notes yet."}</p>
            )}
          </div>

          {/* Recent Activity */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">Recent Activity</h4>
            <div className="flex items-center gap-2 p-3 bg-secondary/30 rounded-lg">
              <Activity className="w-4 h-4 text-primary shrink-0" />
              <p className="text-sm font-medium">{project.recentActivity}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Projects() {
  const { projects, addProject } = useAppContext();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortBy, setSortBy] = useState("priority");

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("High");
  const [deadline, setDeadline] = useState("");
  const [milestonesInput, setMilestonesInput] = useState("");

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const milestones = milestonesInput.split(",").map(m => m.trim()).filter(Boolean).map(text => ({ text, completed: false }));
    addProject({
      name, description, priority,
      deadline: deadline || "TBD",
      milestones: milestones.length > 0 ? milestones : [{ text: "Kickoff project", completed: false }],
    });
    setName(""); setDescription(""); setPriority("High"); setDeadline(""); setMilestonesInput("");
    setIsModalOpen(false);
  };

  const statuses = ["All", "Active", "In Progress", "Ongoing", "Completed", "At Risk"];

  const filtered = projects.filter(p => filterStatus === "All" || p.status === filterStatus);
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "priority") return (a.priority || "Medium") === "High" ? -1 : 1;
    if (sortBy === "progress") return (b.progress || 0) - (a.progress || 0);
    if (sortBy === "deadline") {
      const d1 = a.deadline || "TBD";
      const d2 = b.deadline || "TBD";
      return d1.localeCompare(d2);
    }
    return 0;
  });

  const healthIcon = (h: string) => h === 'On Track' ? <TrendingUp className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />;
  const healthColor = (h: string) => h === 'On Track' ? 'text-emerald-500 bg-emerald-500/10' : 'text-red-500 bg-red-500/10';

  return (
    <div className="space-y-8 animate-in fade-in duration-700 relative">
      {selectedProject && <ProjectDrawer project={selectedProject} onClose={() => setSelectedProject(null)} />}

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent flex items-center gap-3">
            <FolderKanban className="w-8 h-8 text-primary" /> Projects
          </h1>
          <p className="text-muted-foreground mt-1 text-lg font-medium">
            {projects.filter(p => p.status !== 'Completed').length} active · {projects.length} total
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2.5 rounded-full font-bold shadow-lg hover:shadow-primary/25 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> New Project
        </button>
      </div>

      {/* Filters & Sort */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="flex gap-2 flex-wrap">
          {statuses.map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${filterStatus === s ? 'bg-primary text-primary-foreground shadow-md' : 'bg-secondary text-muted-foreground hover:bg-secondary/80'}`}>
              {s}
            </button>
          ))}
        </div>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}
          className="bg-background border border-border rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary">
          <option value="priority">Sort: Priority</option>
          <option value="progress">Sort: Progress</option>
          <option value="deadline">Sort: Deadline</option>
        </select>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {sorted.map(project => (
          <Card
            key={project.id}
            className="group relative overflow-hidden border-border/50 shadow-lg bg-card/50 backdrop-blur-md hover:shadow-2xl transition-all duration-500 rounded-2xl hover:-translate-y-1 cursor-pointer"
            onClick={() => setSelectedProject(project)}
          >
            <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.08] group-hover:scale-110 transition-all duration-700 pointer-events-none">
              <FolderKanban className="w-40 h-40 text-primary" />
            </div>

            <CardHeader className="relative z-10 pb-3 border-b border-border/50">
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <CardTitle className="text-xl font-extrabold tracking-tight group-hover:text-primary transition-colors">
                      {project.name}
                    </CardTitle>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 ${healthColor(project.health)}`}>
                      {healthIcon(project.health)} {project.health}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-sm">{project.description}</p>
                </div>
                <button onClick={e => { e.stopPropagation(); setSelectedProject(project); }} className="p-1.5 hover:bg-secondary rounded-lg transition-colors text-muted-foreground shrink-0 ml-2">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </CardHeader>

            <CardContent className="relative z-10 pt-4 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide ${project.statusColor}`}>{project.status}</span>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide flex items-center gap-1 ${project.priorityColor}`}>
                  <Zap className="w-2.5 h-2.5" /> {project.priority}
                </span>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide bg-secondary/50 flex items-center gap-1">
                  <Calendar className="w-2.5 h-2.5" /> {project.deadline}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold text-muted-foreground flex items-center gap-1"><Target className="w-3.5 h-3.5" /> Progress</span>
                  <span className="font-black text-primary">{project.progress}%</span>
                </div>
                <Progress value={project.progress} className="h-2 rounded-full [&>div]:bg-gradient-to-r [&>div]:from-primary/80 [&>div]:to-primary" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{project.tasks.filter(t => t.completed).length}/{project.tasks.length} tasks</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {project.timeInvested}h invested</span>
                </div>
              </div>

              {/* Milestones preview */}
              <div className="space-y-1">
                {project.milestones.slice(0, 2).map((m, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${m.completed ? 'text-emerald-500' : 'text-muted-foreground/30'}`} />
                    <span className={m.completed ? 'line-through text-muted-foreground' : 'text-foreground'}>{m.text}</span>
                  </div>
                ))}
                {project.milestones.length > 2 && (
                  <p className="text-xs text-muted-foreground pl-5">+{project.milestones.length - 2} more milestones</p>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1 border-t border-border/30">
                <Activity className="w-3 h-3 text-primary" />
                <span className="truncate">{project.recentActivity}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* New Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full border-border/50 bg-card rounded-2xl shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1 hover:bg-secondary rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
            <CardHeader>
              <CardTitle className="text-2xl font-extrabold tracking-tight">Create New Project</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateProject} className="space-y-4">
                {[
                  { label: "Project Name", type: "text", value: name, onChange: setName, placeholder: "e.g. Neon City Album Art", required: true },
                ].map(f => (
                  <div key={f.label} className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{f.label}</label>
                    <input type={f.type} required={f.required} value={f.value} onChange={e => f.onChange(e.target.value)} placeholder={f.placeholder}
                      className="w-full px-3.5 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  </div>
                ))}
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Description</label>
                  <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="What does this project accomplish?"
                    className="w-full px-3.5 py-2 bg-background border border-border rounded-lg text-sm h-20 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Priority</label>
                    <select value={priority} onChange={e => setPriority(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                      <option>High</option><option>Medium</option><option>Low</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Deadline</label>
                    <input type="text" value={deadline} onChange={e => setDeadline(e.target.value)} placeholder="e.g. Q4 2026"
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Milestones (comma separated)</label>
                  <input type="text" value={milestonesInput} onChange={e => setMilestonesInput(e.target.value)} placeholder="Draft sketch, Final render, Delivery"
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <button type="submit" className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-bold py-2.5 rounded-lg shadow-lg transition-all mt-2">
                  Create Project
                </button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
