import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Search, Music2, PlaySquare, Music, ShoppingCart, Image as ImageIcon, X,
  Plus, Copy, UploadCloud, Trash2, ChevronDown, ChevronUp
} from "lucide-react";
import { useAppContext } from "../context/AppContext";
import type { Beat } from "../context/AppContext";

type SortKey = 'name' | 'bpm' | 'dateCreated' | 'status' | 'genre';

export default function BeatLibrary() {
  const { beats, addBeat, updateBeat, publishBeat, deleteBeat } = useAppContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterGenre, setFilterGenre] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortKey, setSortKey] = useState<SortKey>("dateCreated");
  const [sortAsc, setSortAsc] = useState(false);
  const [selectedBeatIds, setSelectedBeatIds] = useState<Set<string>>(new Set());
  const [expandedBeat, setExpandedBeat] = useState<string | null>(null);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [genre, setGenre] = useState("Trap");
  const [mood, setMood] = useState("Dark");
  const [bpm, setBpm] = useState(140);
  const [beatKey, setBeatKey] = useState("C Min");
  const [duration, setDuration] = useState("2:30");
  const [videoTheme, setVideoTheme] = useState("");
  const [status, setStatus] = useState<Beat['status']>("In Progress");
  const [youtube, setYoutube] = useState(false);
  const [spotify, setSpotify] = useState(false);
  const [beatstars, setBeatstars] = useState(false);
  const [airbit, setAirbit] = useState(false);
  const [tags, setTags] = useState("");
  const [notes, setNotes] = useState("");

  const handleCreateBeat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    addBeat({
      name, genre, mood, bpm, key: beatKey, duration,
      videoTheme: videoTheme || "Abstract Art", status,
      mixStatus: "Not Started", masterStatus: "Not Started", videoStatus: "Not Started",
      platforms: { youtube, spotify, beatstars, airbit },
      tags: tags.split(",").map(t => t.trim()).filter(Boolean),
      notes,
    });
    setName(""); setGenre("Trap"); setMood("Dark"); setBpm(140); setBeatKey("C Min");
    setDuration("2:30"); setVideoTheme(""); setStatus("In Progress");
    setYoutube(false); setSpotify(false); setBeatstars(false); setAirbit(false);
    setTags(""); setNotes("");
    setIsModalOpen(false);
  };

  const handleDuplicate = (beat: Beat) => {
    addBeat({
      ...beat,
      name: `${beat.name} (Copy)`,
      status: "In Progress",
      platforms: { youtube: false, spotify: false, beatstars: false, airbit: false },
    });
  };

  const handleBulkAction = (action: string) => {
    selectedBeatIds.forEach(id => {
      const beat = beats.find(b => b.id === id);
      if (!beat) return;
      if (action === "publish") publishBeat(id);
      if (action === "archive") updateBeat({ ...beat, status: "Archived" });
      if (action === "delete") deleteBeat(id);
    });
    setSelectedBeatIds(new Set());
  };

  const genres = ["All", ...Array.from(new Set(beats.map(b => b.genre)))];
  const statuses = ["All", "Published", "Ready", "In Progress", "Archived"];

  const filtered = beats.filter(b => {
    const matchesSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.genre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.mood.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesGenre = filterGenre === "All" || b.genre === filterGenre;
    const matchesStatus = filterStatus === "All" || b.status === filterStatus;
    return matchesSearch && matchesGenre && matchesStatus;
  });

  const sorted = [...filtered].sort((a, b) => {
    let valA: any = a[sortKey];
    let valB: any = b[sortKey];
    if (sortKey === "bpm") { valA = a.bpm; valB = b.bpm; }
    const cmp = String(valA).localeCompare(String(valB), undefined, { numeric: true });
    return sortAsc ? cmp : -cmp;
  });

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(v => !v);
    else { setSortKey(key); setSortAsc(true); }
  };

  const toggleSelect = (id: string) => {
    setSelectedBeatIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Published': return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
      case 'Ready': return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
      case 'In Progress': return "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20";
      case 'Archived': return "bg-gray-500/10 text-gray-500 border-gray-500/20";
      default: return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  const getWorkflowBadge = (status: string) => {
    if (status === 'Done') return "text-emerald-500";
    if (status === 'In Progress') return "text-yellow-500";
    return "text-muted-foreground/30";
  };

  const SortIcon = ({ k }: { k: SortKey }) => sortKey === k
    ? (sortAsc ? <ChevronUp className="w-3 h-3 inline ml-1" /> : <ChevronDown className="w-3 h-3 inline ml-1" />)
    : null;

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-10 relative">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent flex items-center gap-3">
            <Music2 className="w-8 h-8 text-primary" /> Beat Library
          </h1>
          <p className="text-muted-foreground mt-1 text-lg font-medium">
            {beats.length} total · {beats.filter(b => b.status === 'Published').length} published · {beats.filter(b => b.status === 'Ready').length} ready
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2.5 rounded-full font-bold shadow-lg hover:shadow-primary/25 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> New Beat
        </button>
      </div>

      {/* Bulk Actions */}
      {selectedBeatIds.size > 0 && (
        <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-xl animate-in fade-in duration-200">
          <span className="text-sm font-bold text-primary">{selectedBeatIds.size} selected</span>
          <button onClick={() => handleBulkAction("publish")} className="px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-lg text-xs font-bold hover:bg-emerald-500 hover:text-white transition-colors">Publish All</button>
          <button onClick={() => handleBulkAction("archive")} className="px-3 py-1 bg-secondary text-muted-foreground rounded-lg text-xs font-bold hover:bg-secondary/80 transition-colors">Archive All</button>
          <button onClick={() => handleBulkAction("delete")} className="px-3 py-1 bg-red-500/10 text-red-500 rounded-lg text-xs font-bold hover:bg-red-500 hover:text-white transition-colors">Delete All</button>
          <button onClick={() => setSelectedBeatIds(new Set())} className="ml-auto text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
        </div>
      )}

      <Card className="border-border/50 shadow-xl bg-card/50 backdrop-blur-md overflow-hidden rounded-2xl">
        {/* Toolbar */}
        <div className="p-4 border-b border-border/50 flex flex-col sm:flex-row gap-3 bg-background/50">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text" placeholder="Search name, genre, mood, tags..."
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div className="flex items-center gap-2">
            <select value={filterGenre} onChange={e => setFilterGenre(e.target.value)}
              className="bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
              {genres.map(g => <option key={g}>{g}</option>)}
            </select>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
              {statuses.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[10px] uppercase bg-secondary/30 text-muted-foreground font-black tracking-widest">
              <tr>
                <th className="px-4 py-3 w-10">
                  <input type="checkbox" className="rounded"
                    checked={selectedBeatIds.size === sorted.length && sorted.length > 0}
                    onChange={e => setSelectedBeatIds(e.target.checked ? new Set(sorted.map(b => b.id)) : new Set())} />
                </th>
                <th className="px-4 py-3">Cover</th>
                <th className="px-4 py-3 cursor-pointer hover:text-foreground transition-colors" onClick={() => toggleSort("name")}>Name <SortIcon k="name" /></th>
                <th className="px-4 py-3 cursor-pointer hover:text-foreground transition-colors" onClick={() => toggleSort("bpm")}>Specs <SortIcon k="bpm" /></th>
                <th className="px-4 py-3">Workflow</th>
                <th className="px-4 py-3 cursor-pointer hover:text-foreground transition-colors" onClick={() => toggleSort("status")}>Status <SortIcon k="status" /></th>
                <th className="px-4 py-3">Platforms</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {sorted.map(beat => (
                <>
                  <tr key={beat.id} className="hover:bg-secondary/20 transition-colors group">
                    <td className="px-4 py-3">
                      <input type="checkbox" className="rounded" checked={selectedBeatIds.has(beat.id)}
                        onChange={() => toggleSelect(beat.id)} onClick={e => e.stopPropagation()} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-orange-500/20 rounded-lg flex items-center justify-center border border-border/50 group-hover:scale-105 transition-transform">
                        <ImageIcon className="w-4 h-4 text-primary/70" />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold group-hover:text-primary transition-colors cursor-pointer" onClick={() => setExpandedBeat(expandedBeat === beat.id ? null : beat.id)}>
                        {beat.name}
                      </div>
                      <div className="text-muted-foreground text-xs flex gap-2 mt-0.5">
                        <span>{beat.id}</span><span>·</span><span>{beat.dateCreated}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5 flex-wrap">
                        <span className="bg-secondary px-1.5 py-0.5 rounded text-[10px] font-bold">{beat.genre}</span>
                        <span className="bg-secondary px-1.5 py-0.5 rounded text-[10px] font-bold">{beat.mood}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">{beat.bpm} BPM · {beat.key} · {beat.duration}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 text-xs">
                        <span className={`font-black ${getWorkflowBadge(beat.mixStatus)}`} title="Mix">M</span>
                        <span className={`font-black ${getWorkflowBadge(beat.masterStatus)}`} title="Master">MA</span>
                        <span className={`font-black ${getWorkflowBadge(beat.videoStatus)}`} title="Video">V</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide border ${getStatusBadge(beat.status)}`}>
                        {beat.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <div title="YouTube"><PlaySquare className={`w-4 h-4 ${beat.platforms.youtube ? 'text-red-500' : 'text-muted-foreground/25'}`} /></div>
                        <div title="Spotify"><Music className={`w-4 h-4 ${beat.platforms.spotify ? 'text-green-500' : 'text-muted-foreground/25'}`} /></div>
                        <div title="BeatStars"><ShoppingCart className={`w-4 h-4 ${beat.platforms.beatstars ? 'text-blue-500' : 'text-muted-foreground/25'}`} /></div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        {beat.status !== 'Published' && (
                          <button onClick={() => publishBeat(beat.id)} className="p-1.5 hover:bg-emerald-500/10 hover:text-emerald-500 rounded-md transition-colors text-muted-foreground" title="Publish">
                            <UploadCloud className="w-4 h-4" />
                          </button>
                        )}
                        <button onClick={() => handleDuplicate(beat)} className="p-1.5 hover:bg-primary/10 hover:text-primary rounded-md transition-colors text-muted-foreground" title="Duplicate">
                          <Copy className="w-4 h-4" />
                        </button>
                        <button onClick={() => deleteBeat(beat.id)} className="p-1.5 hover:bg-red-500/10 hover:text-red-500 rounded-md transition-colors text-muted-foreground" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedBeat === beat.id && (
                    <tr key={`${beat.id}-expanded`} className="bg-secondary/10">
                      <td colSpan={8} className="px-6 py-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                          <div>
                            <p className="font-black uppercase tracking-widest text-muted-foreground mb-1">Video Theme</p>
                            <p className="font-medium">{beat.videoTheme}</p>
                          </div>
                          <div>
                            <p className="font-black uppercase tracking-widest text-muted-foreground mb-1">Tags</p>
                            <div className="flex gap-1 flex-wrap">{beat.tags.map((t, i) => <span key={i} className="bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">#{t}</span>)}</div>
                          </div>
                          <div>
                            <p className="font-black uppercase tracking-widest text-muted-foreground mb-1">Airbit</p>
                            <span className={beat.platforms.airbit ? "text-emerald-500 font-bold" : "text-muted-foreground/40"}>
                              {beat.platforms.airbit ? "✓ Listed" : "Not listed"}
                            </span>
                          </div>
                          <div>
                            <p className="font-black uppercase tracking-widest text-muted-foreground mb-1">Notes</p>
                            <p className="text-muted-foreground">{beat.notes || "—"}</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>

        {sorted.length === 0 && (
          <div className="p-12 text-center text-muted-foreground">
            <Music2 className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">No beats found.</p>
            <button onClick={() => setIsModalOpen(true)} className="mt-2 text-primary hover:underline text-sm font-bold">+ Add your first beat</button>
          </div>
        )}
      </Card>

      {/* New Beat Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-lg w-full border-border/50 bg-card rounded-2xl shadow-2xl relative animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1 hover:bg-secondary rounded-lg transition-colors z-10">
              <X className="w-5 h-5" />
            </button>
            <CardHeader className="shrink-0">
              <CardTitle className="text-2xl font-extrabold tracking-tight">Add New Beat</CardTitle>
            </CardHeader>
            <CardContent className="overflow-y-auto">
              <form onSubmit={handleCreateBeat} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Beat Name *</label>
                  <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Midnight Drift"
                    className="w-full px-3.5 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Genre", value: genre, onChange: setGenre, placeholder: "Trap" },
                    { label: "Mood", value: mood, onChange: setMood, placeholder: "Dark" },
                  ].map(f => (
                    <div key={f.label} className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{f.label}</label>
                      <input type="text" value={f.value} onChange={e => f.onChange(e.target.value)} placeholder={f.placeholder}
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">BPM</label>
                    <input type="number" value={bpm} onChange={e => setBpm(parseInt(e.target.value))}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Key</label>
                    <input type="text" value={beatKey} onChange={e => setBeatKey(e.target.value)} placeholder="C Min"
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Duration</label>
                    <input type="text" value={duration} onChange={e => setDuration(e.target.value)} placeholder="2:45"
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Video Theme</label>
                    <input type="text" value={videoTheme} onChange={e => setVideoTheme(e.target.value)} placeholder="Cyberpunk City..."
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</label>
                    <select value={status} onChange={e => setStatus(e.target.value as Beat['status'])}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                      <option>In Progress</option><option>Ready</option><option>Published</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tags (comma separated)</label>
                  <input type="text" value={tags} onChange={e => setTags(e.target.value)} placeholder="trap, dark, 808..."
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">Platforms</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "YouTube", value: youtube, set: setYoutube },
                      { label: "Spotify", value: spotify, set: setSpotify },
                      { label: "BeatStars", value: beatstars, set: setBeatstars },
                      { label: "Airbit", value: airbit, set: setAirbit },
                    ].map(p => (
                      <label key={p.label} className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                        <input type="checkbox" checked={p.value} onChange={e => p.set(e.target.checked)}
                          className="rounded text-primary border-border focus:ring-primary" />
                        {p.label}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Notes</label>
                  <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Mixing notes, ideas..."
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" />
                </div>
                <button type="submit" className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-bold py-2.5 rounded-lg shadow-lg transition-all mt-2">
                  Create Beat
                </button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
