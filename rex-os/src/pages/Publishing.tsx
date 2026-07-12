import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  UploadCloud, PlaySquare, Music, ShoppingCart, Play, X, Plus, GripVertical, Clock, Calendar
} from "lucide-react";
import { useAppContext } from "../context/AppContext";

const COLUMNS = [
  { id: "idea", name: "Idea", color: "bg-gray-500/10 border-gray-500/20 text-gray-500", dotColor: "bg-gray-400" },
  { id: "beat-finished", name: "Beat Finished", color: "bg-primary/10 border-primary/20 text-primary", dotColor: "bg-primary" },
  { id: "mixing", name: "Mixing", color: "bg-orange-500/10 border-orange-500/20 text-orange-500", dotColor: "bg-orange-400" },
  { id: "mastering", name: "Mastering", color: "bg-yellow-500/10 border-yellow-500/20 text-yellow-600", dotColor: "bg-yellow-400" },
  { id: "video-editing", name: "Video Editing", color: "bg-purple-500/10 border-purple-500/20 text-purple-500", dotColor: "bg-purple-400" },
  { id: "thumbnail", name: "Thumbnail", color: "bg-pink-500/10 border-pink-500/20 text-pink-500", dotColor: "bg-pink-400" },
  { id: "ready", name: "Ready", color: "bg-blue-500/10 border-blue-500/20 text-blue-500", dotColor: "bg-blue-400" },
  { id: "scheduled", name: "Scheduled", color: "bg-violet-500/10 border-violet-500/20 text-violet-500", dotColor: "bg-violet-400" },
  { id: "published", name: "Published", color: "bg-emerald-500/10 border-emerald-500/20 text-emerald-500", dotColor: "bg-emerald-400" },
];

const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  youtube: <PlaySquare className="w-4 h-4 text-red-500" />,
  spotify: <Music className="w-4 h-4 text-green-500" />,
  beatstars: <ShoppingCart className="w-4 h-4 text-blue-500" />,
  airbit: <Play className="w-4 h-4 text-orange-500" />,
  instagram: <Play className="w-4 h-4 text-pink-500" />,
  shorts: <Play className="w-4 h-4 text-red-400" />,
};

const PRIORITY_COLORS: Record<string, string> = {
  Highest: "bg-red-500/10 text-red-600 border-red-500/20",
  High: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  Medium: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  Low: "bg-blue-500/10 text-blue-600 border-blue-500/20",
};

export default function Publishing() {
  const { publishingCards, addPublishingCard, updatePublishingCardColumn, deletePublishingCard, beats } = useAppContext();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetColumn, setTargetColumn] = useState("idea");
  const [title, setTitle] = useState("");
  const [platform, setPlatform] = useState("youtube");
  const [priority, setPriority] = useState("Medium");
  const [publishDate, setPublishDate] = useState("");
  const [estTime, setEstTime] = useState("");
  const [status, setStatus] = useState("");
  const [beatId, setBeatId] = useState("");

  const [editingCard, setEditingCard] = useState<any>(null);

  // Drag state
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);

  const handleAddCardClick = (colId: string) => {
    setTargetColumn(colId);
    setEditingCard(null);
    setTitle(""); setPlatform("youtube"); setPriority("Medium");
    setPublishDate(""); setEstTime(""); setStatus(""); setBeatId("");
    setIsModalOpen(true);
  };

  const handleEditClick = (card: any) => {
    setEditingCard(card);
    setTargetColumn(card.columnId);
    setTitle(card.title);
    setPlatform(card.platform);
    setPriority(card.priority);
    setPublishDate(card.publishDate);
    setEstTime(card.estTime);
    setStatus(card.status);
    setBeatId(card.beatId?.toString() || "");
    setIsModalOpen(true);
  };

  const { editPublishingCard } = useAppContext();

  const handleCreateCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingCard) {
      editPublishingCard(editingCard.id, {
        columnId: targetColumn, title, platform, priority,
        publishDate: publishDate || "TBD",
        estTime: estTime || "15m",
        status: status || "Idea",
        beatId: beatId || undefined,
      });
    } else {
      addPublishingCard({
        columnId: targetColumn, title, platform, priority,
        publishDate: publishDate || "TBD",
        estTime: estTime || "15m",
        status: status || "Idea",
        beatId: beatId || undefined,
      });
    }
    
    setIsModalOpen(false);
  };

  const handleDrop = (colId: string) => {
    if (draggedId !== null) {
      updatePublishingCardColumn(draggedId, colId);
    }
    setDraggedId(null);
    setDragOverCol(null);
  };

  const publishedCount = publishingCards.filter(c => c.columnId === "published").length;
  const inProgressCount = publishingCards.filter(c => !["published", "idea"].includes(c.columnId)).length;

  return (
    <div className="flex flex-col h-full space-y-6 animate-in fade-in duration-700 relative">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent flex items-center gap-3">
            <UploadCloud className="w-8 h-8 text-primary" /> Publishing
          </h1>
          <p className="text-muted-foreground mt-1 text-lg font-medium">
            {publishedCount} published · {inProgressCount} in pipeline · {publishingCards.length} total
          </p>
        </div>
        <button
          onClick={() => handleAddCardClick("idea")}
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2.5 rounded-full font-bold shadow-lg hover:shadow-primary/25 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> New Content
        </button>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max h-full">
          {COLUMNS.map(column => {
            const columnCards = publishingCards.filter(card => card.columnId === column.id);
            const isOver = dragOverCol === column.id;
            return (
              <div
                key={column.id}
                className={`w-[280px] flex flex-col bg-secondary/20 rounded-2xl border-2 transition-all duration-200 ${isOver ? 'border-primary/50 bg-primary/5 scale-[1.01]' : 'border-border/50'}`}
                onDragOver={e => { e.preventDefault(); setDragOverCol(column.id); }}
                onDragLeave={() => setDragOverCol(null)}
                onDrop={() => handleDrop(column.id)}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between p-3 px-4 border-b border-border/30">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${column.dotColor}`} />
                    <h3 className={`text-xs font-black uppercase tracking-wider ${column.color.split(' ').find(c => c.startsWith('text-'))}`}>
                      {column.name}
                    </h3>
                  </div>
                  <span className="text-[10px] font-black text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-full">
                    {columnCards.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="flex flex-col gap-3 p-3 overflow-y-auto max-h-[calc(100vh-280px)] flex-1">
                  {columnCards.map(card => {
                    const isOverdue = card.columnId !== 'published' && card.publishDate !== 'TBD' && new Date(card.publishDate) < new Date();
                    return (
                    <div
                      key={card.id}
                      draggable
                      onDragStart={() => setDraggedId(card.id)}
                      onDragEnd={() => { setDraggedId(null); setDragOverCol(null); }}
                      onDoubleClick={() => handleEditClick(card)}
                      className={`group border ${isOverdue ? 'border-red-500/50 shadow-red-500/10' : 'border-border/50'} bg-card/80 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200 cursor-grab active:cursor-grabbing active:opacity-70 active:scale-95 ${draggedId === card.id ? 'opacity-40' : ''}`}
                    >
                      <div className="p-3">
                        <div className="flex items-start gap-2 mb-2.5">
                          <GripVertical className="w-3 h-3 text-muted-foreground/30 mt-0.5 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-xs leading-tight mb-1 group-hover:text-primary transition-colors">{card.title}</h4>
                            <div className="flex items-center gap-1.5">
                              {PLATFORM_ICONS[card.platform] || <Play className="w-3.5 h-3.5 text-muted-foreground" />}
                              <span className="text-[10px] font-bold capitalize text-muted-foreground">{card.platform}</span>
                            </div>
                          </div>
                          <button onClick={() => deletePublishingCard(card.id)} className="p-1 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all text-muted-foreground shrink-0">
                            <X className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="flex items-center gap-1.5 flex-wrap mb-2">
                          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full border uppercase ${PRIORITY_COLORS[card.priority] || PRIORITY_COLORS.Medium}`}>
                            {card.priority}
                          </span>
                          <span className="text-[9px] font-bold bg-secondary/70 px-1.5 py-0.5 rounded-full text-muted-foreground">
                            {card.status}
                          </span>
                        </div>

                        <div className={`flex justify-between text-[10px] font-medium pt-2 border-t ${isOverdue ? 'border-red-500/20 text-red-500' : 'border-border/20 text-muted-foreground'}`}>
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{card.publishDate} {isOverdue && <span className="font-bold">(Overdue)</span>}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{card.estTime}</span>
                        </div>

                        {/* Move dropdown */}
                        <select
                          value={card.columnId}
                          onChange={e => updatePublishingCardColumn(card.id, e.target.value)}
                          onClick={e => e.stopPropagation()}
                          className="mt-2 w-full text-[10px] bg-secondary border-none rounded-md px-1.5 py-1 font-bold cursor-pointer outline-none hover:text-primary transition-colors focus:ring-0"
                        >
                          {COLUMNS.map(col => <option key={col.id} value={col.id}>{col.name}</option>)}
                        </select>
                      </div>
                    </div>
                    );
                  })}

                  <button
                    onClick={() => handleAddCardClick(column.id)}
                    className="w-full py-2.5 rounded-xl border-2 border-dashed border-border/40 text-muted-foreground text-xs font-bold hover:bg-secondary/50 hover:text-foreground hover:border-primary/40 transition-all"
                  >
                    + Add Card
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* New Content Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full border-border/50 bg-card rounded-2xl shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1 hover:bg-secondary rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
            <CardHeader>
              <CardTitle className="text-2xl font-extrabold tracking-tight">{editingCard ? 'Edit Content Item' : 'Add Content Item'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateCard} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Title *</label>
                  <input type="text" required value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Master EQ in 10 minutes"
                    className="w-full px-3.5 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Platform</label>
                    <select value={platform} onChange={e => setPlatform(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                      <option value="youtube">YouTube</option>
                      <option value="spotify">Spotify</option>
                      <option value="beatstars">BeatStars</option>
                      <option value="airbit">Airbit</option>
                      <option value="instagram">Instagram</option>
                      <option value="shorts">Shorts</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Start In Column</label>
                    <select value={targetColumn} onChange={e => setTargetColumn(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                      {COLUMNS.map(col => <option key={col.id} value={col.id}>{col.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Priority</label>
                    <select value={priority} onChange={e => setPriority(e.target.value)}
                      className="w-full px-2 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                      <option>Highest</option><option>High</option><option>Medium</option><option>Low</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Est Time</label>
                    <input type="text" value={estTime} onChange={e => setEstTime(e.target.value)} placeholder="2h, 45m"
                      className="w-full px-2 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Publish Date</label>
                    <input type="text" value={publishDate} onChange={e => setPublishDate(e.target.value)} placeholder="Jul 15"
                      className="w-full px-2 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Link to Beat (optional)</label>
                  <select value={beatId} onChange={e => setBeatId(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                    <option value="">None</option>
                    {beats.map(b => <option key={b.id} value={b.id}>{b.name} ({b.id})</option>)}
                  </select>
                </div>
                <button type="submit" className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-bold py-2.5 rounded-lg shadow-lg transition-all mt-2">
                  {editingCard ? 'Save Changes' : 'Create Card'}
                </button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
