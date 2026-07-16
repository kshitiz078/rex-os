import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  UploadCloud, PlaySquare, Music, ShoppingCart, Play, X, Plus, GripVertical, Clock, Calendar, Edit2
} from "lucide-react";
import { useAppContext } from "../context/AppContext";
import type { PublishingCard } from "../context/AppContext";
import PageHeader from "../components/shared/PageHeader";

const COLUMNS = [
  { id: "idea", name: "Ideas", color: "bg-gray-500/10 border-gray-500/20 text-gray-500", dotColor: "bg-gray-400" },
  { id: "drafting", name: "Drafting", color: "bg-orange-500/10 border-orange-500/20 text-orange-500", dotColor: "bg-orange-400" },
  { id: "ready", name: "Ready", color: "bg-blue-500/10 border-blue-500/20 text-blue-500", dotColor: "bg-blue-400" },
  { id: "scheduled", name: "Scheduled", color: "bg-violet-500/10 border-violet-500/20 text-violet-500", dotColor: "bg-violet-400" },
  { id: "published", name: "Published", color: "bg-emerald-500/10 border-emerald-500/20 text-emerald-500", dotColor: "bg-emerald-400" },
  { id: "archived", name: "Archived", color: "bg-red-500/10 border-red-500/20 text-red-500", dotColor: "bg-red-400" },
];

const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  youtube: <PlaySquare className="w-3.5 h-3.5 text-red-500" />,
  spotify: <Music className="w-3.5 h-3.5 text-green-500" />,
  beatstars: <ShoppingCart className="w-3.5 h-3.5 text-blue-500" />,
  youtubeShorts: <Play className="w-3.5 h-3.5 text-red-400" />,
  instagram: <Play className="w-3.5 h-3.5 text-pink-500" />,
  tiktok: <Play className="w-3.5 h-3.5 text-cyan-500" />,
  soundcloud: <Music className="w-3.5 h-3.5 text-orange-500" />,
  bandcamp: <Music className="w-3.5 h-3.5 text-teal-500" />,
};

const PRIORITY_COLORS: Record<string, string> = {
  Highest: "bg-red-500/10 text-red-600 border-red-500/20",
  High: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  Medium: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  Low: "bg-blue-500/10 text-blue-600 border-blue-500/20",
};

const parsePublishDate = (dateStr: string): Date => {
  if (!dateStr || dateStr === "TBD") return new Date("9999-12-31");
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? new Date("9999-12-31") : d;
};

const formatDateForInput = (dateStr: string): string => {
  if (!dateStr || dateStr === "TBD") return "";
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? "" : d.toISOString().split("T")[0];
};

const displayDate = (dateStr: string): string => {
  if (!dateStr || dateStr === "TBD") return "TBD";
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
};

export default function Publishing() {
  const { publishingCards, addPublishingCard, updatePublishingCardColumn, editPublishingCard, deletePublishingCard, beats } = useAppContext();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetColumn, setTargetColumn] = useState("idea");
  const [title, setTitle] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["youtube"]);
  const [priority, setPriority] = useState("Medium");
  const [publishDate, setPublishDate] = useState(""); 
  const [estTime, setEstTime] = useState("");
  const [status, setStatus] = useState("");
  const [beatId, setBeatId] = useState("");

  const [editingCard, setEditingCard] = useState<PublishingCard | null>(null);

  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);

  const [sortBy, setSortBy] = useState<"nearest" | "overdue" | "newest" | "oldest">("nearest");

  const handleAddCardClick = (colId: string) => {
    setTargetColumn(colId);
    setEditingCard(null);
    setTitle(""); 
    setSelectedPlatforms(["youtube"]); 
    setPriority("Medium");
    setPublishDate(""); 
    setEstTime(""); 
    setStatus("Concept"); 
    setBeatId("");
    setIsModalOpen(true);
  };

  const handleEditClick = (card: PublishingCard) => {
    setEditingCard(card);
    setTargetColumn(card.columnId);
    setTitle(card.title);
    setSelectedPlatforms(card.platform ? card.platform.split(",").map(p => p.trim()).filter(Boolean) : []);
    setPriority(card.priority);
    setPublishDate(formatDateForInput(card.publishDate));
    setEstTime(card.estTime);
    setStatus(card.status);
    setBeatId(card.beatId?.toString() || "");
    setIsModalOpen(true);
  };

  const handleCreateCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const finalPlatform = selectedPlatforms.join(",");
    const finalDate = publishDate ? publishDate : "TBD";

    if (editingCard) {
      editPublishingCard(editingCard.id, {
        columnId: targetColumn, title, platform: finalPlatform, priority,
        publishDate: finalDate,
        estTime: estTime || "15m",
        status: status || "Concept",
        beatId: beatId || undefined,
      });
    } else {
      addPublishingCard({
        columnId: targetColumn, title, platform: finalPlatform, priority,
        publishDate: finalDate,
        estTime: estTime || "15m",
        status: status || "Concept",
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
  const inProgressCount = publishingCards.filter(c => !["published", "archived", "idea"].includes(c.columnId)).length;

  const getSortedCards = (cards: PublishingCard[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); 

    const overdueCards = cards.filter(c => {
      if (c.columnId === "published" || c.columnId === "archived") return false;
      if (c.publishDate === "TBD") return false;
      const d = parsePublishDate(c.publishDate);
      return d < today;
    });
    
    if (sortBy === "nearest") {
      return [...cards].sort((a, b) => parsePublishDate(a.publishDate).getTime() - parsePublishDate(b.publishDate).getTime());
    }
    if (sortBy === "oldest") {
      return [...cards].sort((a, b) => a.id - b.id);
    }
    if (sortBy === "newest") {
      return [...cards].sort((a, b) => b.id - a.id);
    }
    if (sortBy === "overdue") {
      return [...cards].sort((a, b) => {
        const isOverdueA = overdueCards.some(x => x.id === a.id);
        const isOverdueB = overdueCards.some(x => x.id === b.id);
        if (isOverdueA && !isOverdueB) return -1;
        if (!isOverdueA && isOverdueB) return 1;
        return parsePublishDate(a.publishDate).getTime() - parsePublishDate(b.publishDate).getTime();
      });
    }
    return cards;
  };

  const renderPlatformIcons = (platformStr: string) => {
    if (!platformStr) return <span className="text-[10px] text-muted-foreground italic">No platform</span>;
    const platforms = platformStr.split(",").map(p => p.trim()).filter(Boolean);
    return (
      <div className="flex items-center gap-1.5 flex-wrap mt-1">
        {platforms.map(p => (
          <div key={p} className="flex items-center gap-0.5" title={p}>
            {PLATFORM_ICONS[p] || <Play className="w-3.5 h-3.5 text-muted-foreground" />}
            <span className="text-[9px] font-bold capitalize text-muted-foreground">{p === "youtubeShorts" ? "Shorts" : p}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full space-y-6 animate-in fade-in duration-700 relative">
      <PageHeader
        icon={UploadCloud}
        title="Publishing"
        subtitle={`${publishedCount} published · ${inProgressCount} in pipeline · ${publishingCards.length} total`}
        actions={
          <>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-muted-foreground">Sort By:</span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="bg-background border border-border rounded-lg px-3 py-1.5 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="nearest">Nearest Deadline</option>
                <option value="overdue">Overdue First</option>
                <option value="newest">Newest Created</option>
                <option value="oldest">Oldest Created</option>
              </select>
            </div>
            <button
              onClick={() => handleAddCardClick("idea")}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 rounded-full font-bold shadow-lg hover:shadow-primary/25 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4" /> New Content
            </button>
          </>
        }
      />

      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max h-full">
          {COLUMNS.map(column => {
            const columnCards = getSortedCards(publishingCards.filter(card => card.columnId === column.id));
            const isOver = dragOverCol === column.id;
            return (
              <div
                key={column.id}
                className={`w-[280px] flex flex-col bg-secondary/20 rounded-2xl border-2 transition-all duration-200 ${isOver ? 'border-primary/50 bg-primary/5 scale-[1.01]' : 'border-border/50'}`}
                onDragOver={e => { e.preventDefault(); setDragOverCol(column.id); }}
                onDragLeave={() => setDragOverCol(null)}
                onDrop={() => handleDrop(column.id)}
              >
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

                <div className="p-3 space-y-3 flex-1 overflow-y-auto">
                  {columnCards.length === 0 ? (
                    <div className="py-6 text-center text-muted-foreground/50 border-2 border-dashed border-border/50 rounded-xl">
                      <span className="text-xs font-bold">Drop here</span>
                    </div>
                  ) : 
                    columnCards.map(card => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const isOverdue = card.columnId !== 'published' && card.columnId !== 'archived' && card.publishDate !== 'TBD' && parsePublishDate(card.publishDate) < today;
                    return (
                    <div
                      key={card.id}
                      draggable
                      onDragStart={() => setDraggedId(card.id)}
                      onDragEnd={() => { setDraggedId(null); setDragOverCol(null); }}
                      onDoubleClick={() => handleEditClick(card)}
                      className={`group border ${isOverdue ? 'border-red-500/50 shadow-red-500/10 bg-red-500/5' : 'border-border/50 bg-card/80'} backdrop-blur-sm rounded-xl shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200 cursor-grab active:cursor-grabbing active:opacity-70 active:scale-95 ${draggedId === card.id ? 'opacity-40' : ''}`}
                    >
                      <div className="p-3">
                        <div className="flex items-start gap-2 mb-2.5">
                          <GripVertical className="w-3 h-3 text-muted-foreground/30 mt-0.5 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-xs leading-tight mb-1 group-hover:text-primary transition-colors">{card.title}</h4>
                            {renderPlatformIcons(card.platform)}
                          </div>
                          <div className="flex flex-col gap-1 items-end shrink-0">
                             <button onClick={() => deletePublishingCard(card.id)} className="p-1 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all text-muted-foreground">
                                <X className="w-3 h-3" />
                             </button>
                             <button onClick={() => handleEditClick(card)} className="p-1 opacity-0 group-hover:opacity-100 hover:text-primary transition-all text-muted-foreground">
                                <Edit2 className="w-3 h-3" />
                             </button>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 flex-wrap mb-2">
                          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full border uppercase ${PRIORITY_COLORS[card.priority] || PRIORITY_COLORS.Medium}`}>
                            {card.priority}
                          </span>
                          <span className="text-[9px] font-bold bg-secondary/70 px-1.5 py-0.5 rounded-full text-muted-foreground">
                            {card.status}
                          </span>
                        </div>

                        <div className={`flex justify-between text-[10px] font-medium pt-2 border-t ${isOverdue ? 'border-red-500/30 text-red-600 dark:text-red-400' : 'border-border/20 text-muted-foreground'}`}>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {displayDate(card.publishDate)} 
                            {isOverdue && <span className="font-bold ml-1">(Overdue)</span>}
                          </span>
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

      {/* New / Edit Content Modal */}
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
                
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">Platforms</label>
                  <div className="grid grid-cols-2 gap-2 bg-secondary/30 rounded-xl p-3 border border-border/50">
                    {Object.keys(PLATFORM_ICONS).map(p => {
                      const isChecked = selectedPlatforms.includes(p);
                      return (
                        <label key={p} className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              setSelectedPlatforms(prev =>
                                prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
                              );
                            }}
                            className="rounded text-primary border-border focus:ring-primary"
                          />
                          {p === "youtubeShorts" ? "YouTube Shorts" : p.charAt(0).toUpperCase() + p.slice(1)}
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Start In Column</label>
                    <select value={targetColumn} onChange={e => setTargetColumn(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                      {COLUMNS.map(col => <option key={col.id} value={col.id}>{col.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</label>
                    <input type="text" value={status} onChange={e => setStatus(e.target.value)} placeholder="Concept, Editing..."
                      className="w-full px-2 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
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
                    <input type="date" value={publishDate} onChange={e => setPublishDate(e.target.value)}
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
