import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Plus, X, Star, Search, ExternalLink, Trash2, Edit3, FileText } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import type { KnowledgeEntry } from "../context/AppContext";
import * as api from "../services/api";

const CATEGORIES: KnowledgeEntry["category"][] = ["Idea", "Inspiration", "Lyrics", "Business", "Marketing", "Link", "Reference"];

const CATEGORY_COLORS: Record<KnowledgeEntry["category"], string> = {
  Idea: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  Inspiration: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  Lyrics: "bg-primary/10 text-primary border-primary/20",
  Business: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  Marketing: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  Link: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  Reference: "bg-gray-500/10 text-gray-600 border-gray-500/20",
};

const CATEGORY_EMOJIS: Record<KnowledgeEntry["category"], string> = {
  Idea: "💡", Inspiration: "✨", Lyrics: "🎵", Business: "💼",
  Marketing: "📣", Link: "🔗", Reference: "📚",
};

export default function KnowledgeVault() {
  const { knowledgeEntries, addKnowledgeEntry, updateKnowledgeEntry, deleteKnowledgeEntry, toggleKnowledgeFavorite } = useAppContext();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterCat, setFilterCat] = useState<KnowledgeEntry["category"] | "All">("All");
  const [showFavOnly, setShowFavOnly] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<KnowledgeEntry | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Form
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<KnowledgeEntry["category"]>("Idea");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [url, setUrl] = useState("");

  const resetForm = () => {
    setTitle(""); setCategory("Idea"); setContent(""); setTags(""); setUrl("");
    setEditingEntry(null);
  };

  const openEditModal = (entry: KnowledgeEntry) => {
    setEditingEntry(entry);
    setTitle(entry.title); setCategory(entry.category); setContent(entry.content);
    setTags(entry.tags.join(", ")); setUrl(entry.url || "");
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const data = {
      title, category, content,
      tags: tags.split(",").map(t => t.trim()).filter(Boolean),
      url: url || undefined,
      isFavorite: editingEntry?.isFavorite || false,
    };
    if (editingEntry) updateKnowledgeEntry({ ...data, id: editingEntry.id, dateAdded: editingEntry.dateAdded });
    else addKnowledgeEntry(data);
    resetForm();
    setIsModalOpen(false);
  };

  const filtered = knowledgeEntries.filter(e => {
    const matchSearch = !searchQuery || e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchCat = filterCat === "All" || e.category === filterCat;
    const matchFav = !showFavOnly || e.isFavorite;
    return matchSearch && matchCat && matchFav;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-primary" /> Knowledge Vault
          </h1>
          <p className="text-muted-foreground mt-1 text-lg font-medium">
            {knowledgeEntries.length} entries · {knowledgeEntries.filter(e => e.isFavorite).length} favorited
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2.5 rounded-full font-bold shadow-lg hover:shadow-primary/25 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> New Entry
        </button>
      </div>

      {/* Stats by category */}
      <div className="grid grid-cols-3 md:grid-cols-7 gap-2">
        {CATEGORIES.map(cat => {
          const count = knowledgeEntries.filter(e => e.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setFilterCat(filterCat === cat ? "All" : cat)}
              className={`p-3 rounded-xl border text-center transition-all ${filterCat === cat ? CATEGORY_COLORS[cat] + " ring-2 ring-offset-1 ring-current/30" : "border-border/50 hover:bg-secondary/50"}`}
            >
              <div className="text-xl mb-1">{CATEGORY_EMOJIS[cat]}</div>
              <div className="text-[10px] font-black uppercase tracking-wide leading-none">{cat}</div>
              <div className="text-lg font-black mt-0.5">{count}</div>
            </button>
          );
        })}
      </div>

      {/* Search & Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Search titles, content, tags..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
        </div>
        <button
          onClick={() => setShowFavOnly(v => !v)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-bold transition-all ${showFavOnly ? 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' : 'border-border text-muted-foreground hover:border-yellow-500/30'}`}
        >
          <Star className={`w-4 h-4 ${showFavOnly ? 'fill-yellow-500 text-yellow-500' : ''}`} />
          Favorites
        </button>
      </div>

      {/* Entries Grid */}
      {filtered.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="p-12 text-center">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
            <p className="text-lg font-medium text-muted-foreground">No entries found.</p>
            <button onClick={() => setIsModalOpen(true)} className="mt-2 text-primary hover:underline text-sm font-bold">+ Add your first entry</button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(entry => (
            <Card
              key={entry.id}
              className="border-border/50 bg-card/50 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer group"
              onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-lg shrink-0">{CATEGORY_EMOJIS[entry.category]}</span>
                    <h3 className="font-bold text-sm leading-tight group-hover:text-primary transition-colors">{entry.title}</h3>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={e => { e.stopPropagation(); toggleKnowledgeFavorite(entry.id); }}
                      className="p-1 rounded-md transition-colors hover:text-yellow-500"
                    >
                      <Star className={`w-3.5 h-3.5 ${entry.isFavorite ? 'fill-yellow-500 text-yellow-500' : 'text-muted-foreground'}`} />
                    </button>
                  </div>
                </div>

                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border uppercase tracking-wide ${CATEGORY_COLORS[entry.category]}`}>
                  {entry.category}
                </span>

                <p className={`text-xs text-muted-foreground mt-2 leading-relaxed ${expandedId === entry.id ? '' : 'line-clamp-2'}`}>
                  {entry.content}
                </p>

                {expandedId === entry.id && (
                  <div className="mt-3 pt-3 border-t border-border/30 space-y-2 animate-in fade-in duration-200">
                    {entry.tags.length > 0 && (
                      <div className="flex gap-1 flex-wrap">
                        {entry.tags.map((t, i) => (
                          <span key={i} className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">#{t}</span>
                        ))}
                      </div>
                    )}
                    {entry.url && (
                      <a href={entry.url} target="_blank" rel="noopener noreferrer"
                        onClick={e => e.stopPropagation()}
                        className="flex items-center gap-1 text-xs text-primary hover:underline font-medium">
                        <ExternalLink className="w-3 h-3" /> {entry.url}
                      </a>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground">{entry.dateAdded}</span>
                      <div className="ml-auto flex items-center gap-1.5">
                        <button
                          onClick={async e => {
                            e.stopPropagation();
                            if (window.confirm("Export this entry to Google Docs?")) {
                              const res = await api.exportToGoogleDoc(entry.id);
                              if (res?.url) {
                                alert("Exported to Google Docs successfully!");
                                window.location.reload();
                              } else {
                                alert("Export failed. Make sure User Gmail is configured in Settings.");
                              }
                            }
                          }}
                          className="p-1 hover:text-emerald-500 text-muted-foreground rounded-md transition-colors"
                          title="Export to Google Doc"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={e => { e.stopPropagation(); openEditModal(entry); }} className="p-1 hover:text-primary text-muted-foreground rounded-md transition-colors">
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={e => { e.stopPropagation(); deleteKnowledgeEntry(entry.id); }} className="p-1 hover:text-red-500 text-muted-foreground rounded-md transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-lg w-full border-border/50 bg-card rounded-2xl shadow-2xl relative animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <button onClick={() => { setIsModalOpen(false); resetForm(); }} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1 hover:bg-secondary rounded-lg transition-colors z-10">
              <X className="w-5 h-5" />
            </button>
            <CardHeader className="shrink-0">
              <CardTitle className="text-xl font-extrabold">{editingEntry ? "Edit Entry" : "New Knowledge Entry"}</CardTitle>
            </CardHeader>
            <CardContent className="overflow-y-auto">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Title *</label>
                  <input type="text" required value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Keep 808s mono below 80Hz"
                    className="w-full px-3.5 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Category</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {CATEGORIES.map(cat => (
                      <button key={cat} type="button" onClick={() => setCategory(cat)}
                        className={`py-1.5 px-2 rounded-lg text-[11px] font-bold border transition-all ${category === cat ? CATEGORY_COLORS[cat] : 'border-border text-muted-foreground hover:bg-secondary/50'}`}>
                        {CATEGORY_EMOJIS[cat]} {cat}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Content *</label>
                  <textarea required value={content} onChange={e => setContent(e.target.value)} rows={4} placeholder="Write your idea, notes, or reference..."
                    className="w-full px-3.5 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tags (comma separated)</label>
                  <input type="text" value={tags} onChange={e => setTags(e.target.value)} placeholder="mixing, 808, production..."
                    className="w-full px-3.5 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">URL (optional)</label>
                  <input type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..."
                    className="w-full px-3.5 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <button type="submit" className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-bold py-2.5 rounded-lg shadow-lg transition-all">
                  {editingEntry ? "Update Entry" : "Save Entry"}
                </button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
