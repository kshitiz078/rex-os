import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Rocket,
  FolderKanban,
  Music,
  UploadCloud,
  Calendar,
  BarChart2,
  PieChart,
  Settings,
  BookOpen,
  HardDrive,
  ClipboardList,
  ChevronDown,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { useAppContext } from "../../context/AppContext";

const mainNav = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Mission Control", href: "/mission-control", icon: Rocket },
  { name: "Projects", href: "/projects", icon: FolderKanban },
  { name: "Beat Library", href: "/beat-library", icon: Music },
  { name: "Publishing", href: "/publishing", icon: UploadCloud },
  { name: "Content Calendar", href: "/calendar", icon: Calendar },
];

const analyticsNav = [
  { name: "Weekly Review", href: "/weekly-review", icon: BarChart2 },
  { name: "Goal Tracker", href: "/monthly-review", icon: PieChart },
];

const logbookNav = [
  { name: "Daily Log", href: "/daily-log", icon: ClipboardList },
  { name: "Knowledge Vault", href: "/knowledge-vault", icon: BookOpen },
  { name: "Assets", href: "/assets", icon: HardDrive },
];

function NavGroup({ title, items, location }: { title: string; items: typeof mainNav; location: { pathname: string } }) {
  const [open, setOpen] = useState(true);
  return (
    <div>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center justify-between w-full px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 hover:text-muted-foreground transition-colors"
      >
        <span>{title}</span>
        {open ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
      </button>
      {open && (
        <div className="space-y-0.5 mt-1">
          {items.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary/10 text-primary font-semibold shadow-sm"
                    : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                )}
              >
                <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-primary" : "")} />
                {item.name}
                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function Sidebar({ onLogout }: { onLogout?: () => void }) {
  const location = useLocation();
  const { notifications, beats, weeklyReview } = useAppContext();
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const pendingBeats = beats.filter(b => b.status === 'Ready').length;

  return (
    <aside className="w-64 border-r border-border bg-card/50 flex flex-col h-full sticky top-0">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center shadow-lg shadow-primary/30">
            <span className="text-white font-black text-xs">R</span>
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tight text-foreground">REX OS</h1>
            <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">v2.0</p>
          </div>
        </div>
        {unreadCount > 0 && (
          <div className="ml-auto w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
            <span className="text-[9px] text-white font-black">{unreadCount}</span>
          </div>
        )}
      </div>

      {/* Streak Banner */}
      <div className="mx-4 mt-3 px-3 py-2 rounded-lg bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border border-orange-500/20 flex items-center gap-2">
        <span className="text-base">🔥</span>
        <div>
          <p className="text-[10px] font-black text-orange-600 dark:text-orange-400">
            {weeklyReview.publishingStreak} DAY STREAK
          </p>
          <p className="text-[9px] text-muted-foreground">Keep publishing!</p>
        </div>
        {pendingBeats > 0 && (
          <div className="ml-auto bg-blue-500/10 text-blue-500 text-[9px] font-black px-1.5 py-0.5 rounded-full border border-blue-500/20">
            {pendingBeats} ready
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
        <NavGroup title="Core" items={mainNav} location={location} />
        <NavGroup title="Analytics" items={analyticsNav} location={location} />
        <NavGroup title="Logbook" items={logbookNav} location={location} />
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-border mt-auto space-y-0.5 shrink-0">
        <Link
          to="/settings"
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all",
            location.pathname === "/settings"
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
          )}
        >
          <Settings className="w-4 h-4" />
          Settings
        </Link>
        <div className="flex items-center gap-2 px-3 py-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center shadow-sm shrink-0">
            <span className="text-xs font-black text-white">R</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold">Rex</p>
            <p className="text-[10px] text-muted-foreground">Music Producer</p>
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              title="Log out"
              className="w-6 h-6 flex items-center justify-center rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
