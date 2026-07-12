import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Bell, X, CheckCheck, Music, FolderKanban, Target, UploadCloud, Calendar, BookOpen, ClipboardList, Server } from "lucide-react";
import { useAppContext } from "../../context/AppContext";
import { isBackendOnline } from "../../services/api";

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  type: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

export default function TopNav() {
  const navigate = useNavigate();
  const {
    beats, projects, publishingCards, monthlyGoals, calendarEvents,
    notifications, markNotificationRead, markAllNotificationsRead, addNotification,
    knowledgeEntries, dailyLogs
  } = useAppContext();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [backendOnline, setBackendOnline] = useState(false);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Poll backend status locally every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => setBackendOnline(isBackendOnline()), 2000);
    setBackendOnline(isBackendOnline()); // initial check
    return () => clearInterval(interval);
  }, []);

  // Cmd+K shortcut
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(o => !o);
        setNotifOpen(false);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        setNotifOpen(false);
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  useEffect(() => {
    if (searchOpen) setTimeout(() => inputRef.current?.focus(), 50);
  }, [searchOpen]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Build search results
  const searchResults = useMemo<SearchResult[]>(() => [
    ...beats.map(b => ({ id: b.id, title: b.name, subtitle: `${b.genre} · ${b.bpm} BPM · ${b.status}`, type: "Beat", href: "/beat-library", icon: Music })),
    ...projects.map(p => ({ id: String(p.id), title: p.name, subtitle: `${p.status} · ${p.progress}% complete`, type: "Project", href: "/projects", icon: FolderKanban })),
    ...monthlyGoals.map(g => ({ id: String(g.id), title: g.title, subtitle: `${g.current}/${g.total} · ${g.progress}%`, type: "Goal", href: "/monthly-review", icon: Target })),
    ...publishingCards.map(c => ({ id: String(c.id), title: c.title, subtitle: `${c.platform} · ${c.status}`, type: "Publishing", href: "/publishing", icon: UploadCloud })),
    ...calendarEvents.map(e => ({ id: String(e.id), title: e.title, subtitle: `${e.date} · ${e.platform}`, type: "Calendar", href: "/calendar", icon: Calendar })),
    ...knowledgeEntries.map(e => ({ id: String(e.id), title: e.title, subtitle: `${e.category} · ${e.tags.join(', ')}`, type: "Knowledge", href: "/knowledge-vault", icon: BookOpen })),
    ...dailyLogs.map(l => ({ id: String(l.id), title: l.task, subtitle: `${l.date} · ${l.category}`, type: "Log", href: "/daily-log", icon: ClipboardList })),
  ], [beats, projects, monthlyGoals, publishingCards, calendarEvents, knowledgeEntries, dailyLogs]);

  const filtered = searchQuery.trim()
    ? searchResults.filter(r =>
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.type.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 8)
    : searchResults.slice(0, 6);

  const handleResultClick = (result: SearchResult) => {
    navigate(result.href);
    setSearchOpen(false);
    setSearchQuery("");
  };

  const notifIcons = { warning: "⚠️", info: "ℹ️", success: "✅", urgent: "🚨" };

  const handleRemindLater = (e: React.MouseEvent, notif: any) => {
    e.stopPropagation();
    markNotificationRead(notif.id);
    // Simulate remind later by scheduling a new notification in 1 hour
    setTimeout(() => {
      addNotification({
        title: `Reminder: ${notif.title}`,
        description: notif.description,
        type: notif.type,
      });
    }, 60 * 60 * 1000);
    // Give immediate feedback
    addNotification({
      title: 'Reminder Set',
      description: `We'll remind you about "${notif.title}" in 1 hour.`,
      type: 'info'
    });
  };

  return (
    <>
      <header className="h-16 border-b border-border bg-background/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider transition-colors duration-500 ${backendOnline ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'}`}>
             <Server className="w-3 h-3" />
             {backendOnline ? 'Cloud Sync' : 'Local Mode'}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Search trigger */}
          <button
            onClick={() => { setSearchOpen(true); setNotifOpen(false); }}
            className="relative group flex items-center gap-2 text-sm text-muted-foreground bg-secondary/50 border border-border rounded-lg px-3 py-1.5 hover:bg-secondary transition-colors min-w-[200px]"
          >
            <Search className="w-4 h-4 group-hover:text-primary transition-colors" />
            <span>Search everything...</span>
            <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              <span className="text-xs">⌘</span>K
            </kbd>
          </button>

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => { setNotifOpen(o => !o); setSearchOpen(false); }}
              className="relative w-9 h-9 rounded-full bg-secondary/50 flex items-center justify-center hover:bg-secondary transition-colors border border-border/50"
            >
              <Bell className="w-4 h-4 text-muted-foreground" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-[9px] text-white font-black flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 top-12 w-80 bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
                  <h3 className="font-bold text-sm">Notifications</h3>
                  <button onClick={markAllNotificationsRead} className="flex items-center gap-1 text-xs text-primary hover:underline">
                    <CheckCheck className="w-3 h-3" /> Mark all read
                  </button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-center text-sm text-muted-foreground py-8">All caught up!</p>
                  ) : notifications.map(notif => (
                    <div
                      key={notif.id}
                      onClick={() => markNotificationRead(notif.id)}
                      className={`px-4 py-3 border-b border-border/30 last:border-0 cursor-pointer hover:bg-secondary/30 transition-colors ${notif.isRead ? 'opacity-50' : ''}`}
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-base mt-0.5">{notifIcons[notif.type]}</span>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-bold ${notif.isRead ? '' : 'text-foreground'}`}>{notif.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{notif.description}</p>
                          {!notif.isRead && (
                            <div className="mt-2 flex gap-2">
                              <button onClick={(e) => handleRemindLater(e, notif)} className="text-[10px] font-bold text-muted-foreground hover:text-primary transition-colors border border-border/50 rounded px-2 py-0.5 bg-background">Remind in 1h</button>
                            </div>
                          )}
                        </div>
                        {!notif.isRead && <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Avatar */}
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center shadow-lg shadow-primary/30 border-2 border-primary/30">
            <span className="text-xs font-black text-white">R</span>
          </div>
        </div>
      </header>

      {/* Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-24 px-4">
          <div ref={searchRef} className="w-full max-w-xl bg-card border border-border/70 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50">
              <Search className="w-5 h-5 text-muted-foreground shrink-0" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search beats, projects, goals, tasks..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-sm font-medium focus:outline-none placeholder:text-muted-foreground"
              />
              <button onClick={() => setSearchOpen(false)} className="p-1 hover:bg-secondary rounded-md transition-colors">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {filtered.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-8">No results found.</p>
              ) : (
                <>
                  {!searchQuery && <p className="px-4 pt-3 pb-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Recent</p>}
                  {filtered.map(result => {
                    const Icon = result.icon;
                    return (
                      <button
                        key={result.id + result.type}
                        onClick={() => handleResultClick(result)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-secondary/50 transition-colors text-left group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                          <Icon className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">{result.title}</p>
                          <p className="text-xs text-muted-foreground truncate">{result.subtitle}</p>
                        </div>
                        <span className="text-[10px] font-bold text-muted-foreground bg-secondary px-2 py-0.5 rounded-full shrink-0">{result.type}</span>
                      </button>
                    );
                  })}
                </>
              )}
            </div>
            <div className="px-4 py-2 border-t border-border/50 flex items-center gap-4 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1"><kbd className="border border-border rounded px-1 py-0.5 font-mono">↵</kbd> to navigate</span>
              <span className="flex items-center gap-1"><kbd className="border border-border rounded px-1 py-0.5 font-mono">Esc</kbd> to close</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
