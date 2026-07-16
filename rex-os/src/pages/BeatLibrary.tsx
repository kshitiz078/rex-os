import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Search, Music2, Image as ImageIcon, X, Plus, Copy, Trash2,
  ChevronDown, ChevronUp, Edit2, Check, Info, UploadCloud
} from "lucide-react";
import { useAppContext } from "../context/AppContext";
import type { Beat } from "../context/AppContext";
import PageHeader from "../components/shared/PageHeader";
import EmptyState from "../components/shared/EmptyState";

type SortKey = 'name' | 'bpm' | 'dateCreated' | 'status' | 'genre';

const PRODUCTION_STAGES = [
  "Idea", "Composition", "Arrangement", "Recording",
  "Mixing", "Mastering", "Artwork", "Video", "Ready", "Published"
];

const BEAT_STATUSES: Beat['status'][] = [
  "Idea", "In Progress", "Mixing", "Mastering", "Ready", "Released", "Archived"
];

const TIME_SIGNATURES = ["4/4", "3/4", "6/8", "5/4", "7/8", "12/8"];

const PLATFORM_STATUS_OPTIONS = ["Not Published", "Pending", "Scheduled", "Published"];

interface PlatformDef {
  key: keyof Beat['platforms'];
  label: string;
  color: string;
  publishedColor: string;
}

const PLATFORMS: PlatformDef[] = [
  { key: "youtube", label: "YouTube", color: "text-muted-foreground/30", publishedColor: "text-red-500" },
  { key: "spotify", label: "Spotify", color: "text-muted-foreground/30", publishedColor: "text-green-500" },
  { key: "beatstars", label: "BeatStars", color: "text-muted-foreground/30", publishedColor: "text-blue-500" },
  { key: "airbit", label: "Airbit", color: "text-muted-foreground/30", publishedColor: "text-purple-500" },
  { key: "appleMusic", label: "Apple Music", color: "text-muted-foreground/30", publishedColor: "text-pink-500" },
  { key: "soundcloud", label: "SoundCloud", color: "text-muted-foreground/30", publishedColor: "text-orange-500" },
  { key: "instagram", label: "Instagram", color: "text-muted-foreground/30", publishedColor: "text-pink-400" },
  { key: "tiktok", label: "TikTok", color: "text-muted-foreground/30", publishedColor: "text-cyan-500" },
  { key: "youtubeShorts", label: "YT Shorts", color: "text-muted-foreground/30", publishedColor: "text-red-400" },
  { key: "bandcamp", label: "Bandcamp", color: "text-muted-foreground/30", publishedColor: "text-teal-500" },
];

const defaultPlatforms = () => Object.fromEntries(PLATFORMS.map(p => [p.key, "Not Published"])) as Beat['platforms'];

function getPlatformStatusDot(status: string) {
  if (status === "Published") return "bg-emerald-500";
  if (status === "Scheduled") return "bg-blue-400";
  if (status === "Pending") return "bg-yellow-400";
  return "bg-muted-foreground/20";
}

function getPlatformStatusText(status: string) {
  if (status === "Published") return "text-emerald-600 dark:text-emerald-400";
  if (status === "Scheduled") return "text-blue-500";
  if (status === "Pending") return "text-yellow-500";
  return "text-muted-foreground/40";
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'Released': return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
    case 'Ready': return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
    case 'Mastering': return "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20";
    case 'Mixing': return "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20";
    case 'In Progress': return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
    case 'Idea': return "bg-gray-500/10 text-gray-500 dark:text-gray-400 border-gray-500/20";
    case 'Archived': return "bg-red-500/10 text-red-400 border-red-500/20";
    default: return "bg-gray-500/10 text-gray-500 border-gray-500/20";
  }
}

function getStageBadge(stage: string) {
  const idx = PRODUCTION_STAGES.indexOf(stage);
  if (idx >= 9) return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
  if (idx >= 7) return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
  if (idx >= 5) return "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20";
  if (idx >= 3) return "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20";
  if (idx >= 1) return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
  return "bg-gray-500/10 text-gray-500 dark:text-gray-400 border-gray-500/20";
}

const SortIcon = ({ sortKey, k, sortAsc }: { sortKey: SortKey; k: SortKey; sortAsc: boolean }) =>
  sortKey === k
    ? (sortAsc ? <ChevronUp className="w-3 h-3 inline ml-1" /> : <ChevronDown className="w-3 h-3 inline ml-1" />)
    : null;

interface BeatFormState {
  name: string;
  genre: string;
  mood: string;
  bpm: number;
  beatKey: string;
  duration: string;
  videoTheme: string;
  status: Beat['status'];
  productionStage: string;
  timeSignature: string;
  coverArt: string;
  platforms: Beat['platforms'];
  tags: string;
  notes: string;
}

function defaultFormState(): BeatFormState {
  return {
    name: "", genre: "Trap", mood: "Dark", bpm: 140, beatKey: "C Min",
    duration: "2:30", videoTheme: "", status: "In Progress",
    productionStage: "Idea", timeSignature: "4/4", coverArt: "",
    platforms: defaultPlatforms(), tags: "", notes: "",
  };
}

function beatToFormState(beat: Beat): BeatFormState {
  return {
    name: beat.name, genre: beat.genre, mood: beat.mood, bpm: beat.bpm,
    beatKey: beat.key, duration: beat.duration, videoTheme: beat.videoTheme,
    status: beat.status, productionStage: beat.productionStage,
    timeSignature: beat.timeSignature, coverArt: beat.coverArt,
    platforms: { ...beat.platforms },
    tags: beat.tags.join(", "), notes: beat.notes,
  };
}

export default function BeatLibrary() {
  const { beats, addBeat, updateBeat, deleteBeat } = useAppContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterGenre, setFilterGenre] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortKey, setSortKey] = useState<SortKey>("dateCreated");
  const [sortAsc, setSortAsc] = useState(false);
  const [selectedBeatIds, setSelectedBeatIds] = useState<Set<string>>(new Set());
  const [expandedBeat, setExpandedBeat] = useState<string | null>(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBeat, setEditingBeat] = useState<Beat | null>(null);
  const [form, setForm] = useState<BeatFormState>(defaultFormState());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openCreate = () => {
    setEditingBeat(null);
    setForm(defaultFormState());
    setModalOpen(true);
  };

  const openEdit = (beat: Beat) => {
    setEditingBeat(beat);
    setForm(beatToFormState(beat));
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingBeat(null);
  };

  const setField = <K extends keyof BeatFormState>(key: K, value: BeatFormState[K]) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const setPlatform = (key: keyof Beat['platforms'], value: string) =>
    setForm(prev => ({ ...prev, platforms: { ...prev.platforms, [key]: value } }));

  const handleCoverArtFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setField("coverArt", ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    const beatData = {
      name: form.name, genre: form.genre, mood: form.mood, bpm: form.bpm,
      key: form.beatKey, duration: form.duration, videoTheme: form.videoTheme || "Abstract Art",
      status: form.status, productionStage: form.productionStage,
      timeSignature: form.timeSignature, coverArt: form.coverArt,
      platforms: form.platforms,
      tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
      notes: form.notes,
    };
    if (editingBeat) {
      updateBeat({ ...editingBeat, ...beatData });
    } else {
      addBeat(beatData);
    }
    closeModal();
  };

  const handleDuplicate = (beat: Beat) => {
    addBeat({
      ...beat,
      name: `${beat.name} (Copy)`,
      status: "In Progress",
      productionStage: "Idea",
      platforms: defaultPlatforms(),
    });
  };

  const handleBulkDelete = () => {
    selectedBeatIds.forEach(id => deleteBeat(id));
    setSelectedBeatIds(new Set());
  };

  const handleBulkArchive = () => {
    selectedBeatIds.forEach(id => {
      const beat = beats.find(b => b.id === id);
      if (beat) updateBeat({ ...beat, status: "Archived" });
    });
    setSelectedBeatIds(new Set());
  };

  const genres = ["All", ...Array.from(new Set(beats.map(b => b.genre)))];
  const statuses = ["All", ...BEAT_STATUSES];

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
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const releasedCount = beats.filter(b => b.status === "Released").length;
  const readyCount = beats.filter(b => b.status === "Ready").length;

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-10 relative">
      <PageHeader
        icon={Music2}
        title="Beat Library"
        subtitle={`${beats.length} total · ${releasedCount} released · ${readyCount} ready`}
        actions={
          <button
            onClick={openCreate}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 rounded-full font-bold shadow-lg hover:shadow-primary/25 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" /> New Beat
          </button>
        }
      />

      {/* Bulk Actions */}
      {selectedBeatIds.size > 0 && (
        <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-xl animate-in fade-in duration-200">
          <span className="text-sm font-bold text-primary">{selectedBeatIds.size} selected</span>
          <button onClick={handleBulkArchive} className="px-3 py-1 bg-secondary text-muted-foreground rounded-lg text-xs font-bold hover:bg-secondary/80 transition-colors">Archive All</button>
          <button onClick={handleBulkDelete} className="px-3 py-1 bg-red-500/10 text-red-500 rounded-lg text-xs font-bold hover:bg-red-500 hover:text-white transition-colors">Delete All</button>
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
            <thead className="text-[10px] uppercase bg-secondary/30 text-muted-foreground font-black tracking-widest sticky top-0 z-10 backdrop-blur-sm">
              <tr>
                <th className="px-4 py-3 w-10">
                  <input type="checkbox" className="rounded"
                    checked={selectedBeatIds.size === sorted.length && sorted.length > 0}
                    onChange={e => setSelectedBeatIds(e.target.checked ? new Set(sorted.map(b => b.id)) : new Set())} />
                </th>
                <th className="px-4 py-3 w-16">Cover</th>
                <th className="px-4 py-3 cursor-pointer hover:text-foreground transition-colors" onClick={() => toggleSort("name")}>
                  Name <SortIcon sortKey={sortKey} k="name" sortAsc={sortAsc} />
                </th>
                <th className="px-4 py-3 cursor-pointer hover:text-foreground transition-colors" onClick={() => toggleSort("bpm")}>
                  Specs <SortIcon sortKey={sortKey} k="bpm" sortAsc={sortAsc} />
                </th>
                <th className="px-4 py-3 cursor-pointer hover:text-foreground transition-colors" onClick={() => toggleSort("status")}>
                  Status <SortIcon sortKey={sortKey} k="status" sortAsc={sortAsc} />
                </th>
                <th className="px-4 py-3" title="Current production workflow stage">
                  <span className="flex items-center gap-1">Stage <Info className="w-3 h-3 opacity-50" /></span>
                </th>
                <th className="px-4 py-3" title="Publishing destinations — click row to expand">
                  <span className="flex items-center gap-1">Platforms <Info className="w-3 h-3 opacity-50" /></span>
                </th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {sorted.length === 0 && (
                <tr>
                  <td colSpan={8}>
                    <EmptyState
                      icon={Search}
                      title="No beats found"
                      description="Try adjusting your search or filters."
                    />
                  </td>
                </tr>
              )}
              {sorted.map(beat => (
                <React.Fragment key={beat.id}>
                  <tr className="hover:bg-secondary/20 even:bg-secondary/5 transition-colors group">
                    <td className="px-4 py-3">
                      <input type="checkbox" className="rounded" checked={selectedBeatIds.has(beat.id)}
                        onChange={() => toggleSelect(beat.id)} onClick={e => e.stopPropagation()} />
                    </td>
                    <td className="px-4 py-3">
                      <div
                        className="w-12 h-12 rounded-lg overflow-hidden border border-border/50 bg-gradient-to-br from-primary/20 to-orange-500/20 flex items-center justify-center group-hover:scale-105 transition-transform cursor-pointer"
                        onClick={() => setExpandedBeat(expandedBeat === beat.id ? null : beat.id)}
                      >
                        {beat.coverArt ? (
                          <img src={beat.coverArt} alt={beat.name} className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-primary/50" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold group-hover:text-primary transition-colors cursor-pointer" onClick={() => setExpandedBeat(expandedBeat === beat.id ? null : beat.id)}>
                        {beat.name}
                      </div>
                      <div className="text-muted-foreground text-xs flex gap-2 mt-0.5">
                        <span>{beat.id}</span><span>·</span><span>{beat.dateCreated}</span>
                      </div>
                      <div className="flex gap-1 flex-wrap mt-1">
                        <span className="bg-secondary px-1.5 py-0.5 rounded text-[10px] font-bold">{beat.genre}</span>
                        <span className="bg-secondary px-1.5 py-0.5 rounded text-[10px] font-bold">{beat.mood}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs font-bold">{beat.bpm} BPM</div>
                      <div className="text-xs text-muted-foreground">{beat.key} · {beat.timeSignature}</div>
                      <div className="text-xs text-muted-foreground">{beat.duration}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide border ${getStatusBadge(beat.status)}`}>
                        {beat.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStageBadge(beat.productionStage)}`}>
                        {beat.productionStage}
                      </span>
                      {beat.videoTheme && (
                        <div className="text-[10px] text-muted-foreground mt-1 italic">🎬 {beat.videoTheme}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 flex-wrap max-w-[140px]">
                        {PLATFORMS.map(p => {
                          const s = beat.platforms[p.key];
                          return (
                            <span
                              key={p.key}
                              title={`${p.label}: ${s}`}
                              className={`w-2 h-2 rounded-full inline-block ${getPlatformStatusDot(s)}`}
                            />
                          );
                        })}
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">
                        {PLATFORMS.filter(p => beat.platforms[p.key] === "Published").length} published
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(beat)} className="p-1.5 hover:bg-primary/10 hover:text-primary rounded-md transition-colors text-muted-foreground" title="Edit">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDuplicate(beat)} className="p-1.5 hover:bg-secondary hover:text-foreground rounded-md transition-colors text-muted-foreground" title="Duplicate">
                          <Copy className="w-4 h-4" />
                        </button>
                        <button onClick={() => deleteBeat(beat.id)} className="p-1.5 hover:bg-red-500/10 hover:text-red-500 rounded-md transition-colors text-muted-foreground" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Expanded Row */}
                  {expandedBeat === beat.id && (
                    <tr key={`${beat.id}-expanded`} className="bg-secondary/10 border-b border-border/30">
                      <td colSpan={8} className="px-6 py-5">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {/* Cover Art */}
                          <div>
                            <p className="font-black uppercase tracking-widest text-muted-foreground text-[10px] mb-2">Cover Art</p>
                            <div className="w-28 h-28 rounded-xl overflow-hidden border border-border bg-gradient-to-br from-primary/10 to-orange-500/10 flex items-center justify-center">
                              {beat.coverArt ? (
                                <img src={beat.coverArt} alt={beat.name} className="w-full h-full object-cover" />
                              ) : (
                                <ImageIcon className="w-8 h-8 text-muted-foreground/30" />
                              )}
                            </div>
                          </div>

                          {/* Beat Details */}
                          <div className="space-y-3 text-xs">
                            <p className="font-black uppercase tracking-widest text-muted-foreground text-[10px]">Beat Details</p>
                            {beat.videoTheme && (
                              <div><span className="text-muted-foreground">Video Theme: </span><span className="font-semibold">{beat.videoTheme}</span></div>
                            )}
                            <div><span className="text-muted-foreground">Time Sig: </span><span className="font-semibold">{beat.timeSignature}</span></div>
                            <div><span className="text-muted-foreground">Production Stage: </span>
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${getStageBadge(beat.productionStage)}`}>{beat.productionStage}</span>
                            </div>
                            <div className="flex gap-1 flex-wrap">
                              {beat.tags.map((t, i) => <span key={i} className="bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">#{t}</span>)}
                            </div>
                            {beat.notes && <div className="text-muted-foreground italic">{beat.notes}</div>}
                          </div>

                          {/* Platform Statuses */}
                          <div>
                            <p className="font-black uppercase tracking-widest text-muted-foreground text-[10px] mb-2">Publishing Destinations</p>
                            <div className="grid grid-cols-2 gap-1">
                              {PLATFORMS.map(p => {
                                const s = beat.platforms[p.key];
                                return (
                                  <div key={p.key} className="flex items-center gap-1.5 text-xs">
                                    <span className={`w-1.5 h-1.5 rounded-full ${getPlatformStatusDot(s)}`} />
                                    <span className="text-muted-foreground text-[10px] w-16 shrink-0">{p.label}</span>
                                    <span className={`text-[10px] font-bold ${getPlatformStatusText(s)}`}>{s === "Not Published" ? "—" : s}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-border/30 flex gap-2">
                          <button
                            onClick={() => openEdit(beat)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary text-xs font-bold rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors"
                          >
                            <Edit2 className="w-3 h-3" /> Edit Beat
                          </button>
                          {beat.status !== "Released" && beat.status !== "Archived" && (
                            <button
                              onClick={() => updateBeat({ ...beat, status: "Released", productionStage: "Published" })}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-600 text-xs font-bold rounded-lg hover:bg-emerald-500 hover:text-white transition-colors"
                            >
                              <Check className="w-3 h-3" /> Mark Released
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                  </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {sorted.length === 0 && (
          <div className="p-12 text-center text-muted-foreground">
            <Music2 className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">No beats found.</p>
            <button onClick={openCreate} className="mt-2 text-primary hover:underline text-sm font-bold">+ Add your first beat</button>
          </div>
        )}
      </Card>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full border-border/50 bg-card rounded-2xl shadow-2xl relative animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
            <button onClick={closeModal} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1 hover:bg-secondary rounded-lg transition-colors z-10">
              <X className="w-5 h-5" />
            </button>
            <CardHeader className="shrink-0 pb-2">
              <CardTitle className="text-2xl font-extrabold tracking-tight">
                {editingBeat ? `Edit · ${editingBeat.name}` : "Add New Beat"}
              </CardTitle>
            </CardHeader>
            <CardContent className="overflow-y-auto">
              <form onSubmit={handleSubmit} className="space-y-5">

                {/* Beat Name */}
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Beat Name *</label>
                  <input type="text" required value={form.name} onChange={e => setField("name", e.target.value)} placeholder="e.g. Midnight Drift"
                    className="w-full px-3.5 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>

                {/* Genre + Mood */}
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Genre", key: "genre" as const, placeholder: "Trap" },
                    { label: "Mood", key: "mood" as const, placeholder: "Dark" },
                  ].map(f => (
                    <div key={f.label} className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{f.label}</label>
                      <input type="text" value={form[f.key] as string} onChange={e => setField(f.key, e.target.value)} placeholder={f.placeholder}
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                    </div>
                  ))}
                </div>

                {/* BPM + Key + Duration + Time Sig */}
                <div className="grid grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">BPM</label>
                    <input type="number" value={form.bpm} onChange={e => setField("bpm", parseInt(e.target.value) || 140)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Key</label>
                    <input type="text" value={form.beatKey} onChange={e => setField("beatKey", e.target.value)} placeholder="C Min"
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Duration</label>
                    <input type="text" value={form.duration} onChange={e => setField("duration", e.target.value)} placeholder="2:45"
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Time Sig</label>
                    <select value={form.timeSignature} onChange={e => setField("timeSignature", e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                      {TIME_SIGNATURES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                {/* Video Theme */}
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Video Theme</label>
                  <input type="text" value={form.videoTheme} onChange={e => setField("videoTheme", e.target.value)} placeholder="Cyberpunk City, Anime Rain, Abstract..."
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>

                {/* Status + Production Stage */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Beat Status</label>
                    <select value={form.status} onChange={e => setField("status", e.target.value as Beat['status'])}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                      {BEAT_STATUSES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Production Stage</label>
                    <select value={form.productionStage} onChange={e => setField("productionStage", e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                      {PRODUCTION_STAGES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                {/* Cover Art */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Cover Art</label>
                  <div className="flex gap-3 items-start">
                    <div className="w-20 h-20 rounded-lg overflow-hidden border border-border bg-gradient-to-br from-primary/10 to-orange-500/10 flex items-center justify-center shrink-0">
                      {form.coverArt ? (
                        <img src={form.coverArt} alt="Cover" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-muted-foreground/40" />
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <button type="button" onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-bold bg-secondary hover:bg-secondary/80 rounded-lg transition-colors border border-border w-full">
                        <UploadCloud className="w-4 h-4" /> Upload Image File
                      </button>
                      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverArtFile} />
                      <input type="text" value={form.coverArt.startsWith("data:") ? "" : form.coverArt}
                        onChange={e => setField("coverArt", e.target.value)}
                        placeholder="Or paste URL / Google Drive link..."
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary/50" />
                      {form.coverArt && (
                        <button type="button" onClick={() => setField("coverArt", "")}
                          className="text-xs text-red-400 hover:text-red-600 transition-colors">
                          ✕ Remove cover art
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Publishing Destinations */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                    Publishing Destinations
                  </label>
                  <div className="grid grid-cols-2 gap-2 bg-secondary/30 rounded-xl p-3 border border-border/50">
                    {PLATFORMS.map(p => (
                      <div key={p.key} className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${getPlatformStatusDot(form.platforms[p.key])}`} />
                        <span className="text-xs font-medium text-muted-foreground w-20 shrink-0">{p.label}</span>
                        <select
                          value={form.platforms[p.key]}
                          onChange={e => setPlatform(p.key, e.target.value)}
                          className="flex-1 px-2 py-1 bg-background border border-border rounded text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                          {PLATFORM_STATUS_OPTIONS.map(opt => <option key={opt}>{opt}</option>)}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tags (comma separated)</label>
                  <input type="text" value={form.tags} onChange={e => setField("tags", e.target.value)} placeholder="trap, dark, 808..."
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>

                {/* Notes */}
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Notes</label>
                  <textarea value={form.notes} onChange={e => setField("notes", e.target.value)} rows={2} placeholder="Mixing notes, ideas, next steps..."
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" />
                </div>

                <button type="submit" className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-bold py-2.5 rounded-lg shadow-lg transition-all mt-2">
                  {editingBeat ? "Save Changes" : "Create Beat"}
                </button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
