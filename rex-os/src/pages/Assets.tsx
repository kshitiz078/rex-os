import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HardDrive, Plus, X, Search, Trash2, Image, Film, Package, Mic, FileCode, Layout, Award } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import type { Asset } from "../context/AppContext";

const ASSET_TYPES: Asset["type"][] = ["Cover Art", "Video", "Export", "Master", "Stem", "Template", "Brand"];

const TYPE_ICONS: Record<Asset["type"], React.ComponentType<{ className?: string }>> = {
  "Cover Art": Image,
  "Video": Film,
  "Export": Package,
  "Master": Award,
  "Stem": Mic,
  "Template": FileCode,
  "Brand": Layout,
};

const TYPE_COLORS: Record<Asset["type"], string> = {
  "Cover Art": "bg-pink-500/10 text-pink-600 border-pink-500/20",
  "Video": "bg-red-500/10 text-red-600 border-red-500/20",
  "Export": "bg-blue-500/10 text-blue-600 border-blue-500/20",
  "Master": "bg-purple-500/10 text-purple-600 border-purple-500/20",
  "Stem": "bg-orange-500/10 text-orange-600 border-orange-500/20",
  "Template": "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  "Brand": "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
};

export default function Assets() {
  const { assets, addAsset, deleteAsset } = useAppContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<Asset["type"] | "All">("All");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form
  const [name, setName] = useState("");
  const [type, setType] = useState<Asset["type"]>("Cover Art");
  const [size, setSize] = useState("");
  const [format, setFormat] = useState("");
  const [tags, setTags] = useState("");
  const [notes, setNotes] = useState("");

  const resetForm = () => {
    setName(""); setType("Cover Art"); setSize(""); setFormat(""); setTags(""); setNotes("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    addAsset({ name, type, size, format, tags: tags.split(",").map(t => t.trim()).filter(Boolean), notes });
    resetForm();
    setIsModalOpen(false);
  };

  const filtered = assets.filter(a => {
    const matchSearch = !searchQuery || a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      a.format.toLowerCase().includes(searchQuery.toLowerCase());
    const matchType = filterType === "All" || a.type === filterType;
    return matchSearch && matchType;
  });

  const typeCounts = ASSET_TYPES.reduce((acc, t) => {
    acc[t] = assets.filter(a => a.type === t).length;
    return acc;
  }, {} as Record<Asset["type"], number>);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent flex items-center gap-3">
            <HardDrive className="w-8 h-8 text-primary" /> Assets
          </h1>
          <p className="text-muted-foreground mt-1 text-lg font-medium">
            {assets.length} files · Manage your creative library
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2.5 rounded-full font-bold shadow-lg hover:shadow-primary/25 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Asset
        </button>
      </div>

      {/* Type filters */}
      <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
        {ASSET_TYPES.map(t => {
          const Icon = TYPE_ICONS[t];
          return (
            <button
              key={t}
              onClick={() => setFilterType(filterType === t ? "All" : t)}
              className={`p-3 rounded-xl border text-center transition-all ${filterType === t ? TYPE_COLORS[t] + " ring-2 ring-offset-1 ring-current/30" : "border-border/50 hover:bg-secondary/50"}`}
            >
              <Icon className="w-5 h-5 mx-auto mb-1" />
              <div className="text-[10px] font-black uppercase tracking-wide leading-none">{t}</div>
              <div className="text-base font-black mt-0.5">{typeCounts[t]}</div>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input type="text" placeholder="Search by name, format, or tags..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
      </div>

      {/* Asset Grid */}
      {filtered.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="p-12 text-center">
            <HardDrive className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
            <p className="text-lg font-medium text-muted-foreground">No assets found.</p>
            <button onClick={() => setIsModalOpen(true)} className="mt-2 text-primary hover:underline text-sm font-bold">+ Add your first asset</button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(asset => {
            const Icon = TYPE_ICONS[asset.type];
            return (
              <Card key={asset.id} className="border-border/50 bg-card/50 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${TYPE_COLORS[asset.type]}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <h3 className="font-bold text-sm leading-tight group-hover:text-primary transition-colors">{asset.name}</h3>
                        <button onClick={() => deleteAsset(asset.id)} className="p-1 opacity-0 group-hover:opacity-100 hover:text-red-500 text-muted-foreground transition-all shrink-0 ml-1">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full border uppercase tracking-wide ${TYPE_COLORS[asset.type]}`}>{asset.type}</span>
                        {asset.format && <span className="text-[10px] bg-secondary px-1.5 py-0.5 rounded font-bold uppercase">{asset.format}</span>}
                        {asset.size && <span className="text-[10px] text-muted-foreground font-medium">{asset.size}</span>}
                      </div>
                    </div>
                  </div>

                  {asset.tags.length > 0 && (
                    <div className="flex gap-1 flex-wrap mt-3">
                      {asset.tags.map((t, i) => (
                        <span key={i} className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">#{t}</span>
                      ))}
                    </div>
                  )}

                  {asset.notes && <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{asset.notes}</p>}

                  <p className="text-[10px] text-muted-foreground mt-2">Added {asset.dateAdded}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Asset Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full border-border/50 bg-card rounded-2xl shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button onClick={() => { setIsModalOpen(false); resetForm(); }} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1 hover:bg-secondary rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
            <CardHeader>
              <CardTitle className="text-xl font-extrabold">Add New Asset</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Asset Name *</label>
                  <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Midnight Drift Cover Art"
                    className="w-full px-3.5 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Type</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {ASSET_TYPES.map(t => {
                      const Icon = TYPE_ICONS[t];
                      return (
                        <button key={t} type="button" onClick={() => setType(t)}
                          className={`py-1.5 px-2 rounded-lg text-[11px] font-bold border transition-all flex flex-col items-center gap-1 ${type === t ? TYPE_COLORS[t] : 'border-border text-muted-foreground hover:bg-secondary/50'}`}>
                          <Icon className="w-4 h-4" />
                          {t}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Size</label>
                    <input type="text" value={size} onChange={e => setSize(e.target.value)} placeholder="e.g. 2.4 MB"
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Format</label>
                    <input type="text" value={format} onChange={e => setFormat(e.target.value)} placeholder="PNG, MP4, ZIP..."
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tags</label>
                  <input type="text" value={tags} onChange={e => setTags(e.target.value)} placeholder="dark, cyberpunk, final..."
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Notes</label>
                  <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Any notes about this asset..."
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" />
                </div>
                <button type="submit" className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-bold py-2.5 rounded-lg shadow-lg transition-all">
                  Add Asset
                </button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
