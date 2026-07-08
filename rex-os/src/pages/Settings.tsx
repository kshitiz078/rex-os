import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings as SettingsIcon, Moon, Sun, Monitor, Bell, Clock, Target, Database, Download, RotateCcw, Cloud, RefreshCw } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import * as api from "../services/api";

export default function Settings() {
  const { appSettings, updateSettings } = useAppContext();

  const themes = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ] as const;

  const platforms = ["youtube", "spotify", "beatstars", "airbit", "instagram"];

  const togglePlatform = (p: string) => {
    const current = appSettings.defaultUploadPlatforms;
    if (current.includes(p)) updateSettings({ defaultUploadPlatforms: current.filter(x => x !== p) });
    else updateSettings({ defaultUploadPlatforms: [...current, p] });
  };

  const handleExport = () => {
    const data = {
      exportDate: new Date().toISOString(),
      beats: JSON.parse(localStorage.getItem("rex_beats") || "[]"),
      projects: JSON.parse(localStorage.getItem("rex_projects") || "[]"),
      dailyLogs: JSON.parse(localStorage.getItem("rex_daily_logs") || "[]"),
      knowledge: JSON.parse(localStorage.getItem("rex_knowledge") || "[]"),
      assets: JSON.parse(localStorage.getItem("rex_assets") || "[]"),
      goals: {
        annual: JSON.parse(localStorage.getItem("rex_annual_goals") || "[]"),
        quarterly: JSON.parse(localStorage.getItem("rex_quarterly_goals") || "[]"),
        monthly: JSON.parse(localStorage.getItem("rex_monthly_goals") || "[]"),
      },
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `rex-os-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click(); URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset all data? This cannot be undone.")) {
      const keysToKeep = ["rex_app_settings"];
      Object.keys(localStorage).filter(k => k.startsWith("rex_") && !keysToKeep.includes(k))
        .forEach(k => localStorage.removeItem(k));
      window.location.reload();
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-10 max-w-3xl">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent flex items-center gap-3">
          <SettingsIcon className="w-8 h-8 text-primary" /> Settings
        </h1>
        <p className="text-muted-foreground mt-1 text-lg font-medium">Configure your REX OS experience.</p>
      </div>

      {/* Appearance */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2"><Monitor className="w-4 h-4 text-primary" /> Appearance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-3 block">Theme</label>
            <div className="grid grid-cols-3 gap-3">
              {themes.map(t => (
                <button
                  key={t.value}
                  onClick={() => updateSettings({ theme: t.value })}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${appSettings.theme === t.value ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted-foreground hover:bg-secondary/50'}`}
                >
                  <t.icon className="w-6 h-6" />
                  <span className="text-xs font-bold">{t.label}</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Note: Theme switching requires CSS variable support. The current beige/brown aesthetic is preserved across all modes.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Focus Settings */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2"><Clock className="w-4 h-4 text-primary" /> Focus & Timer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Default Focus Duration</p>
              <p className="text-xs text-muted-foreground">Length of each Pomodoro session</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => updateSettings({ defaultFocusMinutes: Math.max(5, appSettings.defaultFocusMinutes - 5) })} className="w-8 h-8 rounded-lg bg-secondary hover:bg-secondary/80 font-bold text-sm transition-colors">−</button>
              <span className="text-lg font-black w-16 text-center">{appSettings.defaultFocusMinutes}m</span>
              <button onClick={() => updateSettings({ defaultFocusMinutes: Math.min(120, appSettings.defaultFocusMinutes + 5) })} className="w-8 h-8 rounded-lg bg-secondary hover:bg-secondary/80 font-bold text-sm transition-colors">+</button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Default Break Duration</p>
              <p className="text-xs text-muted-foreground">Short break between sessions</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => updateSettings({ defaultBreakMinutes: Math.max(1, appSettings.defaultBreakMinutes - 1) })} className="w-8 h-8 rounded-lg bg-secondary hover:bg-secondary/80 font-bold text-sm transition-colors">−</button>
              <span className="text-lg font-black w-16 text-center">{appSettings.defaultBreakMinutes}m</span>
              <button onClick={() => updateSettings({ defaultBreakMinutes: Math.min(30, appSettings.defaultBreakMinutes + 1) })} className="w-8 h-8 rounded-lg bg-secondary hover:bg-secondary/80 font-bold text-sm transition-colors">+</button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2"><Bell className="w-4 h-4 text-primary" /> Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Enable Notifications</p>
              <p className="text-xs text-muted-foreground">Deadlines, beat reminders, and streak alerts</p>
            </div>
            <button
              onClick={() => updateSettings({ notificationsEnabled: !appSettings.notificationsEnabled })}
              className={`relative w-12 h-6 rounded-full transition-colors ${appSettings.notificationsEnabled ? 'bg-primary' : 'bg-secondary'}`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${appSettings.notificationsEnabled ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Publishing */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2"><Target className="w-4 h-4 text-primary" /> Publishing Defaults</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-3 block">Default Upload Platforms</label>
            <div className="flex gap-2 flex-wrap">
              {platforms.map(p => (
                <button
                  key={p}
                  onClick={() => togglePlatform(p)}
                  className={`px-4 py-2 rounded-full text-xs font-bold border-2 transition-all capitalize ${appSettings.defaultUploadPlatforms.includes(p) ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:bg-secondary/50'}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Publishing Streak Goal</p>
              <p className="text-xs text-muted-foreground">Days target before celebration</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => updateSettings({ publishingStreakGoal: Math.max(1, appSettings.publishingStreakGoal - 1) })} className="w-8 h-8 rounded-lg bg-secondary hover:bg-secondary/80 font-bold text-sm transition-colors">−</button>
              <span className="text-lg font-black w-16 text-center">{appSettings.publishingStreakGoal}d</span>
              <button onClick={() => updateSettings({ publishingStreakGoal: appSettings.publishingStreakGoal + 1 })} className="w-8 h-8 rounded-lg bg-secondary hover:bg-secondary/80 font-bold text-sm transition-colors">+</button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Google Integrations */}
      <Card className="border-border/50 bg-gradient-to-br from-primary/5 to-orange-500/5">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Cloud className="w-4 h-4 text-primary" /> Google Integration Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Google Spreadsheet ID</label>
            <input
              type="text"
              value={appSettings.googleSheetId || ""}
              onChange={e => updateSettings({ googleSheetId: e.target.value })}
              className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-primary transition-colors"
              placeholder="Enter Spreadsheet ID"
            />
            <p className="text-xs text-muted-foreground">REX OS data (Beats, Projects, Logs) will sync to this sheet.</p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Google Calendar ID</label>
            <input
              type="text"
              value={appSettings.googleCalendarId || ""}
              onChange={e => updateSettings({ googleCalendarId: e.target.value })}
              className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-primary transition-colors"
              placeholder="primary or custom-email@gmail.com"
            />
            <p className="text-xs text-muted-foreground">Events created in REX OS will sync to this Google Calendar.</p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">User Gmail (for Sharing Docs/Drive)</label>
            <input
              type="text"
              value={appSettings.userGmailAddress || ""}
              onChange={e => updateSettings({ userGmailAddress: e.target.value })}
              className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-primary transition-colors"
              placeholder="your-email@gmail.com"
            />
            <p className="text-xs text-muted-foreground">Used to share newly created Google Docs from your Knowledge Vault.</p>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-semibold">Enable Real-Time Calendar Sync</p>
              <p className="text-xs text-muted-foreground">Automatically write calendar changes to Google</p>
            </div>
            <button
              onClick={() => updateSettings({ googleSyncEnabled: !appSettings.googleSyncEnabled })}
              className={`relative w-12 h-6 rounded-full transition-colors ${appSettings.googleSyncEnabled ? 'bg-primary' : 'bg-secondary'}`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${appSettings.googleSyncEnabled ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
          </div>

          <div className="pt-4 border-t border-border/50 space-y-3">
            {/* Row 1: Sheets */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={async () => {
                  const res = await api.syncSheets();
                  if (res?.success) {
                    alert("✅ " + res.message);
                  } else {
                    const errMsg = (res as any)?.message || (res as any)?.error || "Unknown error";
                    alert(`Sync failed: ${errMsg}`);
                  }
                }}
                className="flex items-center justify-center gap-2 px-3 py-2.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white rounded-xl font-bold text-xs transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Sync Sheets →
              </button>
              <button
                onClick={async () => {
                  if (!window.confirm("This will import data from Google Sheets into REX OS (adds/updates records). Continue?")) return;
                  const res = await api.importFromSheets();
                  if (res?.success) {
                    alert("✅ " + res.message);
                  } else {
                    const errMsg = (res as any)?.message || (res as any)?.error || "Unknown error";
                    alert(`Import failed: ${errMsg}`);
                  }
                }}
                className="flex items-center justify-center gap-2 px-3 py-2.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white rounded-xl font-bold text-xs transition-colors border border-emerald-500/30"
              >
                <Cloud className="w-3.5 h-3.5" /> ← Import Sheets
              </button>
            </div>
            {/* Row 2: Calendar + Tasks */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={async () => {
                  const res = await api.syncCalendar();
                  if (res?.success) {
                    alert("✅ Google Calendar sync completed successfully!");
                  } else {
                    const errMsg = (res as any)?.message || (res as any)?.error || "Unknown error";
                    alert(`Sync failed: ${errMsg}`);
                  }
                }}
                className="flex items-center justify-center gap-2 px-3 py-2.5 bg-blue-500/10 hover:bg-blue-500 text-blue-500 hover:text-white rounded-xl font-bold text-xs transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Sync Calendar
              </button>
              <button
                onClick={async () => {
                  const res = await api.syncTasks();
                  if (res?.success) {
                    alert("✅ Google Tasks sync completed successfully!");
                  } else {
                    const errMsg = (res as any)?.message || (res as any)?.error || "Unknown error";
                    alert(`Sync failed: ${errMsg}`);
                  }
                }}
                className="flex items-center justify-center gap-2 px-3 py-2.5 bg-purple-500/10 hover:bg-purple-500 text-purple-500 hover:text-white rounded-xl font-bold text-xs transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Sync Tasks
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2"><Database className="w-4 h-4 text-primary" /> Data & Backup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl">
            <div>
              <p className="text-sm font-semibold">Export Database</p>
              <p className="text-xs text-muted-foreground">Download all your REX OS data as JSON</p>
            </div>
            <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg font-bold text-sm hover:bg-primary hover:text-primary-foreground transition-colors">
              <Download className="w-4 h-4" /> Export
            </button>
          </div>
          <div className="flex items-center justify-between p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
            <div>
              <p className="text-sm font-semibold text-red-600">Reset All Data</p>
              <p className="text-xs text-muted-foreground">Permanently delete all data. Cannot be undone.</p>
            </div>
            <button onClick={handleReset} className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 rounded-lg font-bold text-sm hover:bg-red-500 hover:text-white transition-colors">
              <RotateCcw className="w-4 h-4" /> Reset
            </button>
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card className="border-border/50 bg-gradient-to-br from-primary/5 to-orange-500/5">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center shadow-lg">
              <span className="text-white font-black text-lg">R</span>
            </div>
            <div>
              <h3 className="font-extrabold text-lg">REX OS</h3>
              <p className="text-sm text-muted-foreground">Version 2.0 · Your Personal Operating System</p>
              <p className="text-xs text-muted-foreground mt-0.5">Built for music producers, content creators, and solo founders.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
