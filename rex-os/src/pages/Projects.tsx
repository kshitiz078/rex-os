import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  FolderKanban, Activity, Calendar, Target, Zap, Clock, CheckCircle2,
  X, Plus, AlertTriangle, TrendingUp, ChevronRight, Pencil, Trash2, Tag, User, Link2, FileText, CheckSquare, ListTodo
} from "lucide-react";
import { useAppContext } from "../context/AppContext";
import type { Project, ProjectTask } from "../context/AppContext";

function ProjectDetail({ project, onClose }: { project: Project; onClose: () => void }) {
  const { toggleProjectTask, addProjectTask, editProjectTask, deleteProjectTask, updateProject } = useAppContext();
  const [newTaskText, setNewTaskText] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<"High" | "Medium" | "Low">("Medium");
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState(project.notes);
  const [editingTask, setEditingTask] = useState<ProjectTask | null>(null);
  const [editTaskText, setEditTaskText] = useState("");
  const [editTaskPriority, setEditTaskPriority] = useState<"High"|"Medium"|"Low">("Medium");

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    addProjectTask(project.id, { text: newTaskText, completed: false, priority: newTaskPriority });
    setNewTaskText("");
  };

  const handleEditTaskSave = () => {
    if (!editingTask) return;
    editProjectTask(project.id, editingTask.id, { text: editTaskText, completed: editingTask.completed, priority: editTaskPriority });
    setEditingTask(null);
  };

  const handleDeleteTask = (taskId: number) => {
    if (window.confirm('Delete this task?')) deleteProjectTask(project.id, taskId);
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
    <div className="space-y-6 animate-in fade-in duration-500">
      <button onClick={onClose} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm font-bold mb-4">
        <ChevronRight className="w-4 h-4 rotate-180" /> Back to Projects
      </button>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 p-6 bg-card border border-border/50 rounded-2xl shadow-sm">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-3xl font-extrabold tracking-tight">{project.name}</h2>
            <span className={`text-xs font-black px-2.5 py-1 rounded-full border uppercase tracking-wide ${healthColor}`}>
              {project.health}
            </span>
            <span className={`text-xs font-black px-2.5 py-1 rounded-full uppercase tracking-wide ${project.priorityColor}`}>
              <Zap className="w-3 h-3 inline mr-0.5" />{project.priority}
            </span>
            <span className={`text-xs font-black px-2.5 py-1 rounded-full uppercase tracking-wide ${project.statusColor}`}>
              {project.status}
            </span>
          </div>
          <p className="text-muted-foreground mt-2 text-lg">{project.description}</p>
          <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground flex-wrap font-medium">
            <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Start: {project.startDate || 'N/A'}</span>
            <span className="flex items-center gap-1.5"><Target className="w-4 h-4" /> Deadline: {project.deadline}</span>
            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> Est. Finish: {project.estimatedCompletion || 'N/A'}</span>
            {project.category && <span className="flex items-center gap-1.5"><Tag className="w-4 h-4" /> {project.category}</span>}
            {project.owner && <span className="flex items-center gap-1.5"><User className="w-4 h-4" /> {project.owner}</span>}
          </div>
        </div>
        <div className="flex flex-col gap-2 shrink-0 w-full md:w-64">
          <div className="space-y-1">
            <div className="flex justify-between text-sm font-bold">
              <span>Overall Progress</span>
              <span className="text-primary">{project.progress}%</span>
            </div>
            <Progress value={project.progress} className="h-3 [&>div]:bg-gradient-to-r [&>div]:from-primary/80 [&>div]:to-primary" />
          </div>
          <div className="flex items-center gap-2 p-3 mt-2 bg-secondary/30 rounded-lg text-sm font-medium">
            <Activity className="w-4 h-4 text-primary shrink-0" />
            <span className="truncate">{project.recentActivity}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Tasks & Milestones */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border/50 bg-card/50 backdrop-blur-md">
            <CardHeader className="pb-3 border-b border-border/50 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <ListTodo className="w-4 h-4" /> Tasks
              </CardTitle>
              <span className="text-xs font-bold text-muted-foreground bg-secondary px-2 py-1 rounded-full">
                {project.tasks.filter(t => t.completed).length}/{project.tasks.length} done
              </span>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="space-y-1.5">
                {project.tasks.map(task => (
                  <div key={task.id} className="group flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/40 transition-colors border border-transparent hover:border-border/50">
                    {editingTask?.id === task.id ? (
                      <div className="flex-1 flex gap-2">
                        <input value={editTaskText} onChange={e => setEditTaskText(e.target.value)}
                          className="flex-1 bg-background border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                          onKeyDown={e => { if (e.key === 'Enter') handleEditTaskSave(); if (e.key === 'Escape') setEditingTask(null); }}
                          autoFocus
                        />
                        <select value={editTaskPriority} onChange={e => setEditTaskPriority(e.target.value as any)}
                          className="bg-background border border-border rounded-lg px-2 text-xs focus:outline-none">
                          <option>High</option><option>Medium</option><option>Low</option>
                        </select>
                        <button onClick={handleEditTaskSave} className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-bold">Save</button>
                        <button onClick={() => setEditingTask(null)} className="px-3 py-1.5 bg-secondary rounded-lg text-xs font-bold">Cancel</button>
                      </div>
                    ) : (
                      <>
                        <div onClick={() => toggleProjectTask(project.id, task.id)} className="flex items-center gap-3 flex-1 cursor-pointer">
                          {task.completed
                            ? <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                            : <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30 group-hover:border-primary shrink-0 transition-colors" />
                          }
                          <span className={`text-base font-medium flex-1 ${task.completed ? 'line-through text-muted-foreground' : ''}`}>{task.text}</span>
                          {task.priority && (
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border uppercase tracking-wide ${priorityColors[task.priority]}`}>
                              {task.priority}
                            </span>
                          )}
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => { setEditingTask(task); setEditTaskText(task.text); setEditTaskPriority(task.priority || "Medium"); }}
                            className="p-1.5 bg-secondary hover:bg-primary/10 hover:text-primary rounded-md transition-colors"><Pencil className="w-4 h-4" /></button>
                          <button onClick={() => handleDeleteTask(task.id)}
                            className="p-1.5 bg-secondary hover:bg-red-500/10 hover:text-red-500 rounded-md transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
              <form onSubmit={handleAddTask} className="flex gap-2 pt-2 border-t border-border/30">
                <select value={newTaskPriority} onChange={e => setNewTaskPriority(e.target.value as any)}
                  className="bg-background border border-border rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option value="High">High Prio</option>
                  <option value="Medium">Med Prio</option>
                  <option value="Low">Low Prio</option>
                </select>
                <input type="text" placeholder="Add a new task..." value={newTaskText} onChange={e => setNewTaskText(e.target.value)}
                  className="flex-1 bg-background border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:bg-primary/95 transition-colors shadow-sm">
                  Add Task
                </button>
              </form>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-md">
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <CheckSquare className="w-4 h-4" /> Milestones
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              {project.milestones.map((m, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/20 border border-border/30">
                  <CheckCircle2 className={`w-5 h-5 shrink-0 ${m.completed ? 'text-emerald-500' : 'text-muted-foreground/30'}`} />
                  <span className={`text-sm font-bold ${m.completed ? 'line-through text-muted-foreground' : ''}`}>{m.text}</span>
                </div>
              ))}
              {project.milestones.length === 0 && <p className="text-sm text-muted-foreground">No milestones set.</p>}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Meta, Notes, Links */}
        <div className="space-y-6">
          <Card className="border-border/50 bg-card/50 backdrop-blur-md">
            <CardHeader className="pb-2 border-b border-border/50 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">Notes</CardTitle>
              <button onClick={() => setEditingNotes(v => !v)} className="text-xs text-primary hover:underline font-bold bg-primary/10 px-2 py-1 rounded-md">
                {editingNotes ? "Save" : "Edit"}
              </button>
            </CardHeader>
            <CardContent className="pt-4">
              {editingNotes ? (
                <div className="space-y-3">
                  <textarea value={notesValue} onChange={e => setNotesValue(e.target.value)}
                    className="w-full h-32 bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" />
                  <div className="flex gap-2">
                    <button onClick={handleSaveNotes} className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold shadow hover:bg-primary/95 transition-colors">Save Notes</button>
                    <button onClick={() => setEditingNotes(false)} className="flex-1 py-2 bg-secondary rounded-lg text-sm font-bold hover:bg-secondary/80 transition-colors">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground bg-secondary/20 border border-border/30 rounded-xl p-4 min-h-[100px] whitespace-pre-wrap">
                  {project.notes || "No notes yet. Click edit to add some."}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-md">
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <FileText className="w-4 h-4" /> Resources
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div>
                <h5 className="text-xs font-bold text-muted-foreground uppercase mb-2">Deliverables</h5>
                <p className="text-sm">{project.deliverables && project.deliverables !== "[]" ? project.deliverables : "None defined"}</p>
              </div>
              <div>
                <h5 className="text-xs font-bold text-muted-foreground uppercase mb-2">Linked Goals</h5>
                <p className="text-sm">{project.linkedGoals && project.linkedGoals !== "[]" ? project.linkedGoals : "None linked"}</p>
              </div>
              <div>
                <h5 className="text-xs font-bold text-muted-foreground uppercase mb-2">Files & Links</h5>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-primary hover:underline cursor-pointer">
                    <Link2 className="w-4 h-4" /> View Project Assets
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
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
  const [category, setCategory] = useState("General");
  const [owner, setOwner] = useState("CEO");
  const [priority, setPriority] = useState("High");
  const [status, setStatus] = useState("Active");
  const [startDate, setStartDate] = useState("");
  const [deadline, setDeadline] = useState("");
  const [estimatedCompletion, setEstimatedCompletion] = useState("");
  const [estimatedEffort, setEstimatedEffort] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [linkedGoals, setLinkedGoals] = useState("");
  const [deliverables, setDeliverables] = useState("");
  const [links, setLinks] = useState("");
  const [files, setFiles] = useState("");
  const [milestonesInput, setMilestonesInput] = useState("");

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const milestones = milestonesInput.split(",").map(m => m.trim()).filter(Boolean).map(text => ({ text, completed: false }));
    const tags = tagsInput.split(",").map(t => t.trim()).filter(Boolean);
    
    // Create the project
    addProject({
      name, description, priority, category, owner, tags: tags as any, estimatedEffort: estimatedEffort || "TBD",
      deadline: deadline || "TBD",
      startDate: startDate || "",
      estimatedCompletion: estimatedCompletion || "",
      linkedGoals: linkedGoals || "[]",
      deliverables: deliverables || "[]",
      links: links || "[]",
      files: files || "[]",
      milestones: milestones.length > 0 ? milestones : [{ text: "Kickoff project", completed: false }],
    });
    
    // Reset form
    setName(""); setDescription(""); setPriority("High"); setDeadline(""); setMilestonesInput("");
    setCategory("General"); setOwner("CEO"); setTagsInput(""); setEstimatedEffort("");
    setStatus("Active"); setStartDate(""); setEstimatedCompletion(""); setLinkedGoals("");
    setDeliverables(""); setLinks(""); setFiles("");
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

  if (selectedProject) {
    return <ProjectDetail project={projects.find(p => p.id === selectedProject.id) || selectedProject} onClose={() => setSelectedProject(null)} />;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 relative">
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
                  <p className="text-muted-foreground text-sm line-clamp-2">{project.description}</p>
                </div>
                <button onClick={e => { e.stopPropagation(); setSelectedProject(project); }} className="p-1.5 hover:bg-secondary rounded-lg transition-colors text-muted-foreground shrink-0 ml-2">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </CardHeader>

            <CardContent className="relative z-10 pt-4 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide ${project.statusColor || 'bg-secondary'}`}>{project.status}</span>
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
          <Card className="max-w-3xl w-full border-border/50 bg-card rounded-2xl shadow-2xl relative animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 z-10 text-muted-foreground hover:text-foreground p-1.5 hover:bg-secondary rounded-lg transition-colors">
              <X className="w-6 h-6" />
            </button>
            <CardHeader className="border-b border-border/50 bg-secondary/10 shrink-0">
              <CardTitle className="text-2xl font-extrabold tracking-tight">Create New Project</CardTitle>
              <CardDescription>Setup your project workspace with timeline and resources.</CardDescription>
            </CardHeader>
            <CardContent className="overflow-y-auto p-6 space-y-8">
              <form id="createProjectForm" onSubmit={handleCreateProject} className="space-y-8">
                
                {/* Section 1: Basic Info */}
                <div className="space-y-4">
                  <h3 className="text-sm font-black uppercase tracking-widest text-primary border-b border-primary/20 pb-2">Basic Info</h3>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Project Name *</label>
                    <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Neon City Album Release"
                      className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Description</label>
                    <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="What is the goal of this project?"
                      className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-sm h-20 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none font-medium" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Category</label>
                      <input type="text" value={category} onChange={e => setCategory(e.target.value)} placeholder="e.g. Music, Marketing"
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Owner</label>
                      <input type="text" value={owner} onChange={e => setOwner(e.target.value)} placeholder="e.g. CEO, Producer"
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                    </div>
                  </div>
                </div>

                {/* Section 2: Timeline & Planning */}
                <div className="space-y-4">
                  <h3 className="text-sm font-black uppercase tracking-widest text-primary border-b border-primary/20 pb-2">Timeline & Status</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Priority</label>
                      <select value={priority} onChange={e => setPriority(e.target.value)}
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                        <option>High</option><option>Medium</option><option>Low</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</label>
                      <select value={status} onChange={e => setStatus(e.target.value)}
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                        <option>Active</option><option>In Progress</option><option>Ongoing</option><option>At Risk</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Est. Effort</label>
                      <input type="text" value={estimatedEffort} onChange={e => setEstimatedEffort(e.target.value)} placeholder="e.g. 40h, 2 weeks"
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Start Date</label>
                      <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Target Deadline</label>
                      <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)}
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Est. Completion</label>
                      <input type="date" value={estimatedCompletion} onChange={e => setEstimatedCompletion(e.target.value)}
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                    </div>
                  </div>
                </div>

                {/* Section 3: Resources & Deliverables */}
                <div className="space-y-4">
                  <h3 className="text-sm font-black uppercase tracking-widest text-primary border-b border-primary/20 pb-2">Resources</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Linked Goals</label>
                      <input type="text" value={linkedGoals} onChange={e => setLinkedGoals(e.target.value)} placeholder="Goal ID or Name..."
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tags</label>
                      <input type="text" value={tagsInput} onChange={e => setTagsInput(e.target.value)} placeholder="music, ep, marketing..."
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Deliverables</label>
                    <input type="text" value={deliverables} onChange={e => setDeliverables(e.target.value)} placeholder="Final WAV, Video MP4..."
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  </div>
                </div>

                {/* Section 4: Initial Milestones */}
                <div className="space-y-4">
                  <h3 className="text-sm font-black uppercase tracking-widest text-primary border-b border-primary/20 pb-2">Initial Milestones</h3>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Milestones (comma separated)</label>
                    <input type="text" value={milestonesInput} onChange={e => setMilestonesInput(e.target.value)} placeholder="Draft, Revisions, Final Export"
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  </div>
                </div>
              </form>
            </CardContent>
            <div className="p-4 border-t border-border/50 bg-secondary/10 shrink-0 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-xl font-bold text-muted-foreground hover:bg-secondary transition-colors">Cancel</button>
              <button type="submit" form="createProjectForm" className="px-8 py-2.5 bg-primary hover:bg-primary/95 text-primary-foreground font-bold rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95">
                Create Project
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
