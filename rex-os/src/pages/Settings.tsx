import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings as SettingsIcon, Moon, Sun, Monitor, Bell, Clock, Target, Database, Download, RotateCcw, Cloud, Sunset, TreePine } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import * as api from "../services/api";
import PageHeader from "../components/shared/PageHeader";

export default function Settings() {
  const { appSettings, updateSettings, resetPortal } = useAppContext();
  const [resetInput, setResetInput] = useState("");
  const [showResetPortal, setShowResetPortal] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [backupStatus, setBackupStatus] = useState({
    lastBackupAt: appSettings.lastBackupAt || null,
    backupStatus: appSettings.backupStatus || "never",
    backupError: appSettings.backupError || "",
  });

  useEffect(() => {
    api.getBackupStatus().then(res => {
      if (res?.success) {
        setBackupStatus({
          lastBackupAt: res.lastBackupAt,
          backupStatus: res.backupStatus,
          backupError: res.backupError,
        });
      }
    });
  }, []);

  const themes = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
    { value: "desert", label: "Desert", icon: Sunset },
    { value: "forest", label: "Forest", icon: TreePine },
  ] as const;

  const platforms = ["youtube", "spotify", "beatstars", "airbit", "instagram"];

  const formatBackupTime = (value?: string | null) => {
    if (!value) return "Never";
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  };

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

  const handleReset = async () => {
    if (resetInput !== 'RESET') return;
    setIsResetting(true);
    try {
      if (window.confirm('Download a backup first?')) handleExport();
      await resetPortal();
    } finally {
      setIsResetting(false);
    }
  };

  const handleResetToDefaults = () => {
    if (window.confirm('Reset all settings to defaults? Your data will not be affected.')) {
      updateSettings({
        theme: 'system',
        defaultFocusMinutes: 25,
        defaultBreakMinutes: 5,
        defaultUploadPlatforms: ['youtube', 'beatstars'],
        notificationsEnabled: true,
        publishingStreakGoal: 7,
      });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-10 max-w-3xl">
      <PageHeader
        icon={SettingsIcon}
        title="Settings"
        subtitle="Configure your REX OS experience."
      />

      {/* Appearance */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2"><Monitor className="w-4 h-4 text-primary" /> Appearance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-3 block">Theme</label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
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
              Note: The selected theme updates the entire application color scheme instantly.
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
            <Cloud className="w-4 h-4 text-primary" /> Google Backup Settings
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
            <p className="text-xs text-muted-foreground">REX OS writes complete backup snapshots here. Google is not the live database.</p>
          </div>

          <div className="pt-4 border-t border-border/50 space-y-3">
            <div className="rounded-xl border border-border/60 bg-background/60 p-4 space-y-2">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">Cloud Backup</p>
                  <p className="text-xs text-muted-foreground">Your data lives in REX OS. Google stores snapshots for recovery.</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Last Backup</p>
                  <p className="text-xs font-bold">{formatBackupTime(backupStatus.lastBackupAt)}</p>
                </div>
              </div>
              {backupStatus.backupStatus === "failed" && (
                <p className="text-xs font-semibold text-red-500">
                  Google backup warning: {backupStatus.backupError || "Backup failed. REX OS will keep working normally."}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={async () => {
                  const res = await api.backupNow();
                  if (res?.success) {
                    setBackupStatus(prev => ({
                      ...prev,
                      lastBackupAt: res.lastBackupAt,
                      backupStatus: "success",
                      backupError: "",
                    }));
                    updateSettings({ lastBackupAt: res.lastBackupAt, backupStatus: "success", backupError: "" });
                    alert("✅ " + res.message);
                  } else {
                    const errMsg = (res as any)?.message || (res as any)?.error || "Unknown error";
                    setBackupStatus(prev => ({ ...prev, backupStatus: "failed", backupError: errMsg }));
                    alert(`Backup failed: ${errMsg}\n\nREX OS will keep working normally.`);
                  }
                }}
                className="flex items-center justify-center gap-2 px-3 py-2.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white rounded-xl font-bold text-xs transition-colors"
              >
                <Cloud className="w-3.5 h-3.5" /> Backup Now
              </button>
              <button
                onClick={async () => {
                  if (!window.confirm("This will replace your current local data with the latest Google backup.\n\nContinue?")) return;
                  const res = await api.restoreBackup();
                  if (res?.success) {
                    setBackupStatus(prev => ({
                      ...prev,
                      lastBackupAt: res.backupCreatedAt,
                      backupStatus: "restored",
                      backupError: "",
                    }));
                    alert("✅ " + res.message);
                    window.location.reload();
                  } else {
                    const errMsg = (res as any)?.message || (res as any)?.error || "Unknown error";
                    setBackupStatus(prev => ({ ...prev, backupStatus: "failed", backupError: errMsg }));
                    alert(`Restore failed: ${errMsg}`);
                  }
                }}
                className="flex items-center justify-center gap-2 px-3 py-2.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white rounded-xl font-bold text-xs transition-colors border border-emerald-500/30"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Restore Backup
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

          <div className="flex items-center justify-between p-4 bg-secondary/20 rounded-xl">
            <div>
              <p className="text-sm font-semibold">Reset to Defaults</p>
              <p className="text-xs text-muted-foreground">Restore all settings to their defaults. Your data is unaffected.</p>
            </div>
            <button onClick={handleResetToDefaults} className="flex items-center gap-2 px-4 py-2 bg-secondary text-foreground rounded-lg font-bold text-sm hover:bg-secondary/80 transition-colors">
              <RotateCcw className="w-4 h-4" /> Reset Settings
            </button>
          </div>

          {/* Reset Portal */}
          <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-red-600">Reset Portal</p>
                <p className="text-xs text-muted-foreground">Permanently delete ALL data from REX OS. Cannot be undone.</p>
              </div>
              <button onClick={() => setShowResetPortal(v => !v)} className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 text-red-500 rounded-lg font-bold text-sm hover:bg-red-500/20 transition-colors">
                <RotateCcw className="w-4 h-4" /> {showResetPortal ? 'Cancel' : 'Open'}
              </button>
            </div>
            {showResetPortal && (
              <div className="space-y-3 pt-2 border-t border-red-500/20">
                <p className="text-xs text-red-500 font-semibold">Type <strong>RESET</strong> below to confirm. This will wipe all beats, projects, goals, and logs.</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={resetInput}
                    onChange={e => setResetInput(e.target.value)}
                    placeholder="Type RESET to confirm"
                    className="flex-1 px-3 py-2 bg-background border border-red-500/40 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50"
                  />
                  <button
                    onClick={handleReset}
                    disabled={resetInput !== 'RESET' || isResetting}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-red-600 transition-colors"
                  >
                    {isResetting ? 'Resetting...' : 'Delete All'}
                  </button>
                </div>
              </div>
            )}
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
