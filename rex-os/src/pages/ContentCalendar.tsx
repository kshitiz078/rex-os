import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, X, Plus,
  Edit2, Music2, Folder, Clock, AlignLeft, Repeat, Trash2
} from "lucide-react";
import { useAppContext } from "../context/AppContext";
import type { CalendarEvent } from "../context/AppContext";

// ── Types ──────────────────────────────────────────────────────────────────
type ViewMode = "month" | "week" | "day" | "agenda" | "list";

// ── Platform helpers ───────────────────────────────────────────────────────
const ALL_PLATFORMS = [
  { key: "youtube",      label: "YouTube",       color: "#ef4444" },
  { key: "spotify",      label: "Spotify",        color: "#22c55e" },
  { key: "beatstars",    label: "BeatStars",      color: "#3b82f6" },
  { key: "airbit",       label: "Airbit",         color: "#a855f7" },
  { key: "appleMusic",   label: "Apple Music",    color: "#ec4899" },
  { key: "soundcloud",   label: "SoundCloud",     color: "#f97316" },
  { key: "instagram",    label: "Instagram",      color: "#db2777" },
  { key: "tiktok",       label: "TikTok",         color: "#06b6d4" },
  { key: "youtubeShorts",label: "YT Shorts",      color: "#dc2626" },
  { key: "bandcamp",     label: "Bandcamp",       color: "#14b8a6" },
];

const getPlatformColor = (key: string) =>
  ALL_PLATFORMS.find(p => p.key === key)?.color ?? "#6366f1";

const getPlatformLabel = (key: string) =>
  ALL_PLATFORMS.find(p => p.key === key)?.label ?? key;

const parsePlatforms = (str: string) =>
  str ? str.split(",").map(s => s.trim()).filter(Boolean) : [];

// Pick the "primary" colour for the event chip (first platform or default)
const eventColor = (ev: CalendarEvent) => {
  const platforms = parsePlatforms(ev.platform);
  return platforms.length > 0 ? getPlatformColor(platforms[0]) : ev.color;
};

// ── Status badge ───────────────────────────────────────────────────────────
const STATUS_CLASSES: Record<string, string> = {
  scheduled: "bg-violet-500/10 text-violet-500 border-violet-500/20",
  published: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  draft:     "bg-gray-500/10    text-gray-400   border-gray-500/20",
  overdue:   "bg-red-500/10    text-red-500    border-red-500/20",
};

// ── Date helpers ───────────────────────────────────────────────────────────
const toDateStr = (y: number, m: number, d: number) =>
  `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

const todayStr = () => {
  const t = new Date();
  return toDateStr(t.getFullYear(), t.getMonth(), t.getDate());
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS   = ["January","February","March","April","May","June","July","August","September","October","November","December"];

// ── Platform pill ──────────────────────────────────────────────────────────
const PlatformPills = ({ platforms }: { platforms: string[] }) => (
  <div className="flex gap-1 flex-wrap">
    {platforms.map(p => (
      <span
        key={p}
        className="text-[9px] font-bold px-1.5 py-0.5 rounded-full border"
        style={{ background: `${getPlatformColor(p)}18`, borderColor: `${getPlatformColor(p)}40`, color: getPlatformColor(p) }}
      >
        {getPlatformLabel(p)}
      </span>
    ))}
    {platforms.length === 0 && <span className="text-[10px] italic text-muted-foreground">No platform</span>}
  </div>
);

// ── Default form state ─────────────────────────────────────────────────────
const defaultForm = () => ({
  title: "",
  description: "",
  date: todayStr(),
  platforms: [] as string[],
  status: "scheduled" as CalendarEvent["status"],
  notes: "",
  beatId: "",
  projectId: "",
  isRecurring: false,
});

// ══════════════════════════════════════════════════════════════════════════
export default function ContentCalendar() {
  const { calendarEvents, addCalendarEvent, updateCalendarEvent, deleteCalendarEvent, beats, projects } = useAppContext();

  const today = new Date();

  // ── Navigation state ────────────────────────────────────────────────────
  // We store a "anchor" date. Month / Week / Day views all derive from it.
  const [anchor, setAnchor] = useState(new Date(today.getFullYear(), today.getMonth(), today.getDate()));
  const [view, setView]     = useState<ViewMode>("month");

  // ── Modal state ─────────────────────────────────────────────────────────
  // null = closed, "view" = view only, "edit" = create / edit
  const [modalMode,     setModalMode]     = useState<"view" | "edit" | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [form,          setForm]          = useState(defaultForm());

  // ── Drag state ──────────────────────────────────────────────────────────
  const [draggedId, setDraggedId] = useState<number | null>(null);

  // ── Navigation ──────────────────────────────────────────────────────────
  const goPrev = () => {
    if (view === "month") setAnchor(a => new Date(a.getFullYear(), a.getMonth() - 1, 1));
    if (view === "week")  setAnchor(a => new Date(a.getFullYear(), a.getMonth(), a.getDate() - 7));
    if (view === "day")   setAnchor(a => new Date(a.getFullYear(), a.getMonth(), a.getDate() - 1));
    if (view === "agenda" || view === "list") setAnchor(a => new Date(a.getFullYear(), a.getMonth() - 1, 1));
  };
  const goNext = () => {
    if (view === "month") setAnchor(a => new Date(a.getFullYear(), a.getMonth() + 1, 1));
    if (view === "week")  setAnchor(a => new Date(a.getFullYear(), a.getMonth(), a.getDate() + 7));
    if (view === "day")   setAnchor(a => new Date(a.getFullYear(), a.getMonth(), a.getDate() + 1));
    if (view === "agenda" || view === "list") setAnchor(a => new Date(a.getFullYear(), a.getMonth() + 1, 1));
  };

  // ── Today: always snap back to actual today ────────────────────────────
  const goToday = () => setAnchor(new Date(today.getFullYear(), today.getMonth(), today.getDate()));

  // ── Nav label ───────────────────────────────────────────────────────────
  const navLabel = () => {
    if (view === "month" || view === "agenda" || view === "list") {
      return `${MONTHS[anchor.getMonth()]} ${anchor.getFullYear()}`;
    }
    if (view === "week") {
      const sun = new Date(anchor);
      const day = anchor.getDay();
      sun.setDate(anchor.getDate() - day);
      const sat = new Date(sun); sat.setDate(sun.getDate() + 6);
      const fmt = (d: Date) => `${MONTHS[d.getMonth()].slice(0, 3)} ${d.getDate()}`;
      return `${fmt(sun)} – ${fmt(sat)}, ${sat.getFullYear()}`;
    }
    if (view === "day") {
      return anchor.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" });
    }
    return "";
  };

  // ── Event helpers ────────────────────────────────────────────────────────
  const eventsForDate = (dateStr: string) =>
    calendarEvents.filter(e => e.date === dateStr);

  const dropOnDate = (dateStr: string) => {
    if (draggedId === null) return;
    const ev = calendarEvents.find(e => e.id === draggedId);
    if (ev) updateCalendarEvent({ ...ev, date: dateStr });
    setDraggedId(null);
  };

  // ── Open view modal ──────────────────────────────────────────────────────
  const openView = (ev: CalendarEvent) => {
    setSelectedEvent(ev);
    setModalMode("view");
  };

  // ── Open create modal ────────────────────────────────────────────────────
  const openCreate = (dateStr: string) => {
    setSelectedEvent(null);
    setForm({ ...defaultForm(), date: dateStr });
    setModalMode("edit");
  };

  // ── Open edit modal from view ────────────────────────────────────────────
  const openEdit = (ev: CalendarEvent) => {
    setSelectedEvent(ev);
    setForm({
      title:       ev.title,
      description: ev.description ?? "",
      date:        ev.date,
      platforms:   parsePlatforms(ev.platform),
      status:      ev.status,
      notes:       ev.notes ?? "",
      beatId:      ev.beatId ?? "",
      projectId:   ev.projectId ? String(ev.projectId) : "",
      isRecurring: ev.isRecurring,
    });
    setModalMode("edit");
  };

  // ── Save form ────────────────────────────────────────────────────────────
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    const platforms = form.platforms;
    const primaryColor = platforms.length > 0 ? getPlatformColor(platforms[0]) : "#6366f1";
    const payload = {
      title:       form.title,
      description: form.description,
      date:        form.date,
      platform:    platforms.join(","),
      color:       primaryColor,
      isRecurring: form.isRecurring,
      status:      form.status,
      notes:       form.notes,
      beatId:      form.beatId || undefined,
      projectId:   form.projectId ? Number(form.projectId) : undefined,
    };
    if (selectedEvent) {
      updateCalendarEvent({ ...selectedEvent, ...payload });
    } else {
      addCalendarEvent(payload);
    }
    setModalMode(null);
  };

  const handleDelete = (id: number) => {
    deleteCalendarEvent(id);
    setModalMode(null);
  };

  // ── Month grid ───────────────────────────────────────────────────────────
  const buildMonthGrid = () => {
    const y = anchor.getFullYear();
    const m = anchor.getMonth();
    const firstDay = new Date(y, m, 1).getDay();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const cells: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let i = 1; i <= daysInMonth; i++) cells.push(i);
    return { y, m, cells };
  };

  // ── Week grid ────────────────────────────────────────────────────────────
  const buildWeekDates = () => {
    const dow  = anchor.getDay();
    const base = new Date(anchor); base.setDate(anchor.getDate() - dow);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(base); d.setDate(base.getDate() + i);
      return d;
    });
  };

  // ── Agenda / List: next 30 days ──────────────────────────────────────────
  const buildAgendaDates = (days = 30) => {
    const start = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
    return Array.from({ length: days }, (_, i) => {
      const d = new Date(start); d.setDate(start.getDate() + i);
      return d;
    });
  };

  // ── Renderers ────────────────────────────────────────────────────────────
  const renderEventChip = (ev: CalendarEvent, compact = false) => {
    const c = eventColor(ev);
    return (
      <div
        key={ev.id}
        draggable
        onDragStart={e => { e.stopPropagation(); setDraggedId(ev.id); }}
        onClick={e => { e.stopPropagation(); openView(ev); }}
        className={`text-[10px] font-bold rounded ${compact ? "px-1 py-0.5" : "px-1.5 py-1"} truncate cursor-pointer border transition-opacity hover:opacity-80 relative group/chip`}
        style={{ background: `${c}18`, borderColor: `${c}35`, color: c }}
      >
        {ev.isRecurring && <span className="mr-0.5">↻</span>}
        {ev.title}
        <button
          onClick={f => { f.stopPropagation(); handleDelete(ev.id); }}
          className="absolute top-0.5 right-0.5 opacity-0 group-hover/chip:opacity-100 transition-opacity hover:text-red-500"
        >
          <X className="w-2.5 h-2.5" />
        </button>
      </div>
    );
  };

  const renderMonthView = () => {
    const { y, m, cells } = buildMonthGrid();
    return (
      <div className="grid grid-cols-7 border-t border-l border-border/30">
        {WEEKDAYS.map(d => (
          <div key={d} className="text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground py-3 border-b border-r border-border/30 bg-secondary/10">{d}</div>
        ))}
        {cells.map((day, i) => {
          const dateStr  = day ? toDateStr(y, m, day) : "";
          const events   = day ? eventsForDate(dateStr) : [];
          const isToday  = dateStr === todayStr();
          return (
            <div
              key={i}
              onClick={() => day && openCreate(dateStr)}
              onDragOver={e => e.preventDefault()}
              onDrop={() => day && dropOnDate(dateStr)}
              className={`min-h-[120px] p-2 border-b border-r border-border/30 ${day ? "hover:bg-secondary/20 cursor-pointer group" : "bg-secondary/5"} ${!day ? "" : ""} transition-colors`}
            >
              {day && (
                <>
                  <div className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full mb-1.5 ${isToday ? "bg-primary text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"}`}>
                    {day}
                  </div>
                  <div className="space-y-1">{events.map(ev => renderEventChip(ev))}</div>
                </>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderWeekView = () => {
    const dates = buildWeekDates();
    return (
      <div className="grid grid-cols-7 border-t border-l border-border/30">
        {dates.map((d, i) => {
          const dateStr = toDateStr(d.getFullYear(), d.getMonth(), d.getDate());
          const events  = eventsForDate(dateStr);
          const isToday = dateStr === todayStr();
          return (
            <div key={i} className="border-b border-r border-border/30">
              <div className={`py-3 text-center border-b border-border/30 ${isToday ? "bg-primary/10" : "bg-secondary/10"}`}>
                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{WEEKDAYS[d.getDay()]}</div>
                <div className={`text-xl font-black mt-0.5 ${isToday ? "text-primary" : "text-foreground"}`}>{d.getDate()}</div>
              </div>
              <div
                className="min-h-[300px] p-2 space-y-1 cursor-pointer hover:bg-secondary/10 transition-colors"
                onClick={() => openCreate(dateStr)}
                onDragOver={e => e.preventDefault()}
                onDrop={() => dropOnDate(dateStr)}
              >
                {events.map(ev => renderEventChip(ev))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderDayView = () => {
    const dateStr = toDateStr(anchor.getFullYear(), anchor.getMonth(), anchor.getDate());
    const events  = eventsForDate(dateStr);
    const isToday = dateStr === todayStr();
    return (
      <div className="p-6">
        <div className={`inline-flex items-center gap-3 mb-4 px-4 py-2 rounded-xl ${isToday ? "bg-primary/10 border border-primary/20" : "bg-secondary/30"}`}>
          <div className={`text-4xl font-black ${isToday ? "text-primary" : "text-foreground"}`}>{anchor.getDate()}</div>
          <div>
            <div className="font-black text-foreground">{WEEKDAYS[anchor.getDay()]}</div>
            <div className="text-sm text-muted-foreground">{MONTHS[anchor.getMonth()]} {anchor.getFullYear()}</div>
          </div>
        </div>
        {events.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <CalendarIcon className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p className="font-medium">No events today.</p>
            <button onClick={() => openCreate(dateStr)} className="mt-2 text-primary text-sm font-bold hover:underline">+ Add event</button>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map(ev => (
              <div
                key={ev.id}
                onClick={() => openView(ev)}
                className="flex items-start gap-3 p-4 rounded-xl border cursor-pointer hover:border-primary/40 transition-all group"
                style={{ borderColor: `${eventColor(ev)}30`, background: `${eventColor(ev)}08` }}
              >
                <div className="w-1 self-stretch rounded-full" style={{ background: eventColor(ev) }} />
                <div className="flex-1 min-w-0">
                  <div className="font-bold group-hover:text-primary transition-colors">{ev.title}</div>
                  {ev.description && <div className="text-sm text-muted-foreground mt-0.5">{ev.description}</div>}
                  <PlatformPills platforms={parsePlatforms(ev.platform)} />
                </div>
                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border uppercase ${STATUS_CLASSES[ev.status] ?? STATUS_CLASSES.draft}`}>{ev.status}</span>
              </div>
            ))}
            <button onClick={() => openCreate(dateStr)} className="w-full py-2.5 rounded-xl border-2 border-dashed border-border/40 text-muted-foreground text-xs font-bold hover:bg-secondary/50 hover:border-primary/40 transition-all">+ Add Event</button>
          </div>
        )}
      </div>
    );
  };

  const renderAgendaView = () => {
    const dates = buildAgendaDates(60).filter(d => {
      const ds = toDateStr(d.getFullYear(), d.getMonth(), d.getDate());
      return eventsForDate(ds).length > 0;
    });
    if (dates.length === 0) return (
      <div className="text-center py-16 text-muted-foreground">
        <CalendarIcon className="w-10 h-10 mx-auto mb-3 opacity-20" />
        <p className="font-medium">No upcoming events this period.</p>
      </div>
    );
    return (
      <div className="divide-y divide-border/30">
        {dates.map(d => {
          const ds     = toDateStr(d.getFullYear(), d.getMonth(), d.getDate());
          const events = eventsForDate(ds);
          const isTd   = ds === todayStr();
          return (
            <div key={ds} className="flex gap-4 p-4 hover:bg-secondary/10 transition-colors">
              <div className={`w-16 shrink-0 text-center ${isTd ? "text-primary" : "text-muted-foreground"}`}>
                <div className="text-[10px] font-black uppercase tracking-widest">{WEEKDAYS[d.getDay()]}</div>
                <div className={`text-2xl font-black ${isTd ? "text-primary" : ""}`}>{d.getDate()}</div>
                <div className="text-[10px]">{MONTHS[d.getMonth()].slice(0,3)}</div>
              </div>
              <div className="flex-1 space-y-2">
                {events.map(ev => (
                  <div
                    key={ev.id}
                    onClick={() => openView(ev)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer hover:border-primary/30 transition-all"
                    style={{ borderColor: `${eventColor(ev)}30`, background: `${eventColor(ev)}08` }}
                  >
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: eventColor(ev) }} />
                    <span className="text-sm font-semibold flex-1 truncate">{ev.title}</span>
                    <PlatformPills platforms={parsePlatforms(ev.platform)} />
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full border uppercase ${STATUS_CLASSES[ev.status] ?? STATUS_CLASSES.draft}`}>{ev.status}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderListView = () => {
    const sorted = [...calendarEvents].sort((a, b) => a.date.localeCompare(b.date));
    return (
      <div className="divide-y divide-border/30">
        {sorted.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <CalendarIcon className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p className="font-medium">No events yet.</p>
          </div>
        )}
        {sorted.map(ev => {
          const c = eventColor(ev);
          const d = new Date(ev.date);
          const isToday = ev.date === todayStr();
          return (
            <div
              key={ev.id}
              onClick={() => openView(ev)}
              className="flex items-center gap-4 px-5 py-3 hover:bg-secondary/10 cursor-pointer transition-colors group"
            >
              <div className={`w-14 shrink-0 text-center ${isToday ? "text-primary" : "text-muted-foreground"}`}>
                <div className="text-[10px] font-black uppercase">{WEEKDAYS[d.getDay()]}</div>
                <div className="text-lg font-black">{d.getDate()}</div>
                <div className="text-[10px]">{MONTHS[d.getMonth()].slice(0,3)} {d.getFullYear()}</div>
              </div>
              <div className="w-1 h-10 rounded-full shrink-0" style={{ background: c }} />
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm group-hover:text-primary transition-colors truncate">{ev.title}</div>
                {ev.description && <div className="text-xs text-muted-foreground truncate">{ev.description}</div>}
              </div>
              <PlatformPills platforms={parsePlatforms(ev.platform)} />
              <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border uppercase shrink-0 ${STATUS_CLASSES[ev.status] ?? STATUS_CLASSES.draft}`}>{ev.status}</span>
            </div>
          );
        })}
      </div>
    );
  };

  // ── Related helpers ─────────────────────────────────────────────────────
  const relatedBeat = (ev: CalendarEvent) => beats.find(b => b.id === ev.beatId);
  const relatedProject = (ev: CalendarEvent) => projects.find(p => p.id === ev.projectId);

  // ════════════════════════════════════════════════════════════════════════
  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent flex items-center gap-3">
            <CalendarIcon className="w-8 h-8 text-primary" /> Content Calendar
          </h1>
          <p className="text-muted-foreground mt-1 text-lg font-medium">Schedule and track your content drops.</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* View switcher */}
          <div className="flex items-center gap-1 bg-secondary/50 p-1 rounded-xl border border-border">
            {(["month","week","day","agenda","list"] as ViewMode[]).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1 text-xs font-bold rounded-lg capitalize transition-colors ${view === v ? "bg-background shadow-sm text-foreground" : "hover:bg-secondary text-muted-foreground"}`}
              >{v}</button>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-1 bg-secondary/50 p-1 rounded-xl border border-border">
            <button onClick={goPrev} className="p-2 hover:bg-secondary rounded-lg transition-colors"><ChevronLeft className="w-4 h-4" /></button>
            <button
              onClick={goToday}
              className="px-4 py-1.5 font-bold text-xs hover:bg-secondary rounded-lg transition-colors text-primary"
            >
              Today
            </button>
            <button onClick={goNext} className="p-2 hover:bg-secondary rounded-lg transition-colors"><ChevronRight className="w-4 h-4" /></button>
          </div>

          <button
            onClick={() => openCreate(todayStr())}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2 rounded-full text-sm font-bold shadow-lg hover:shadow-primary/25 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Event
          </button>
        </div>
      </div>

      {/* Label */}
      <div className="text-center text-xl font-black text-muted-foreground tracking-tight">{navLabel()}</div>

      {/* Calendar Card */}
      <Card className="border-border/50 bg-card/50 shadow-xl rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          {view === "month"  && renderMonthView()}
          {view === "week"   && renderWeekView()}
          {view === "day"    && renderDayView()}
          {view === "agenda" && renderAgendaView()}
          {view === "list"   && renderListView()}
        </CardContent>
      </Card>

      {/* ── View Event Modal ────────────────────────────────────────────── */}
      {modalMode === "view" && selectedEvent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-lg w-full border-border/50 bg-card rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-5">
              {/* Top bar */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-full" style={{ background: eventColor(selectedEvent) }} />
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border uppercase ${STATUS_CLASSES[selectedEvent.status] ?? STATUS_CLASSES.draft}`}>
                      {selectedEvent.status}
                    </span>
                    {selectedEvent.isRecurring && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-secondary border border-border text-muted-foreground flex items-center gap-1">
                        <Repeat className="w-2.5 h-2.5" /> Recurring
                      </span>
                    )}
                  </div>
                  <h2 className="text-2xl font-extrabold tracking-tight">{selectedEvent.title}</h2>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => openEdit(selectedEvent)} className="p-2 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-primary">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(selectedEvent.id)} className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-muted-foreground hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => setModalMode(null)} className="p-2 hover:bg-secondary rounded-lg transition-colors text-muted-foreground">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-4 text-sm">
                {/* Description */}
                {selectedEvent.description && (
                  <div className="flex gap-2">
                    <AlignLeft className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <p className="text-muted-foreground leading-relaxed">{selectedEvent.description}</p>
                  </div>
                )}

                {/* Deadline */}
                <div className="flex gap-2 items-center">
                  <CalendarIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="font-semibold">{new Date(selectedEvent.date).toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
                </div>

                {/* Platforms */}
                <div className="flex gap-2 items-start">
                  <Clock className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <div className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1">Platforms</div>
                    <PlatformPills platforms={parsePlatforms(selectedEvent.platform)} />
                  </div>
                </div>

                {/* Related Beat */}
                {relatedBeat(selectedEvent) && (
                  <div className="flex gap-2 items-center">
                    <Music2 className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="text-xs text-muted-foreground">Beat: </span>
                    <span className="font-semibold text-primary">{relatedBeat(selectedEvent)!.name}</span>
                  </div>
                )}

                {/* Related Project */}
                {relatedProject(selectedEvent) && (
                  <div className="flex gap-2 items-center">
                    <Folder className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="text-xs text-muted-foreground">Project: </span>
                    <span className="font-semibold text-primary">{relatedProject(selectedEvent)!.name}</span>
                  </div>
                )}

                {/* Notes */}
                {selectedEvent.notes && (
                  <div className="bg-secondary/40 border border-border/50 rounded-xl p-3 text-muted-foreground italic text-xs leading-relaxed">
                    📝 {selectedEvent.notes}
                  </div>
                )}
              </div>

              <button
                onClick={() => openEdit(selectedEvent)}
                className="mt-5 w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2.5 rounded-xl transition-all"
              >
                Edit Event
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* ── Create / Edit Modal ─────────────────────────────────────────── */}
      {modalMode === "edit" && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-lg w-full border-border/50 bg-card rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
            <button onClick={() => setModalMode(null)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1 hover:bg-secondary rounded-lg transition-colors z-10">
              <X className="w-5 h-5" />
            </button>
            <CardHeader className="shrink-0 pb-2">
              <CardTitle className="text-2xl font-extrabold tracking-tight">
                {selectedEvent ? `Edit · ${selectedEvent.title}` : "Add Event"}
              </CardTitle>
            </CardHeader>
            <CardContent className="overflow-y-auto">
              <form onSubmit={handleSave} className="space-y-4">
                {/* Title */}
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Title *</label>
                  <input type="text" required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="e.g. YouTube Video Drop"
                    className="w-full px-3.5 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Description</label>
                  <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2}
                    placeholder="What's this event about?"
                    className="w-full px-3.5 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" />
                </div>

                {/* Date + Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Date *</label>
                    <input type="date" required value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</label>
                    <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as CalendarEvent["status"] }))}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                      <option value="draft">Draft</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="published">Published</option>
                      <option value="overdue">Overdue</option>
                    </select>
                  </div>
                </div>

                {/* Platforms */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">Platforms</label>
                  <div className="grid grid-cols-2 gap-2 bg-secondary/30 rounded-xl p-3 border border-border/50">
                    {ALL_PLATFORMS.map(p => (
                      <label key={p.key} className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.platforms.includes(p.key)}
                          onChange={() => setForm(f => ({
                            ...f,
                            platforms: f.platforms.includes(p.key)
                              ? f.platforms.filter(x => x !== p.key)
                              : [...f.platforms, p.key],
                          }))}
                          className="rounded text-primary border-border"
                        />
                        {p.label}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Related Beat + Project */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Related Beat</label>
                    <select value={form.beatId} onChange={e => setForm(f => ({ ...f, beatId: e.target.value }))}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                      <option value="">None</option>
                      {beats.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Related Project</label>
                    <select value={form.projectId} onChange={e => setForm(f => ({ ...f, projectId: e.target.value }))}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                      <option value="">None</option>
                      {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Notes</label>
                  <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2}
                    placeholder="Reminders, ideas, next steps..."
                    className="w-full px-3.5 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" />
                </div>

                {/* Recurring */}
                <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
                  <input type="checkbox" checked={form.isRecurring} onChange={e => setForm(f => ({ ...f, isRecurring: e.target.checked }))} className="rounded text-primary" />
                  Recurring event
                </label>

                <button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2.5 rounded-xl shadow-lg transition-all">
                  {selectedEvent ? "Save Changes" : "Add Event"}
                </button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
