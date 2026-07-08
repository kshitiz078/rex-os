import { useState } from "react";
import { loginApi, setToken } from "../services/api";

interface LoginPageProps {
  onLogin: () => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    setLoading(true);
    setError("");

    const res = await loginApi(password);

    if (res && (res as any).token) {
      setToken((res as any).token);
      onLogin();
    } else {
      setError("Incorrect password. Try again.");
      setShake(true);
      setPassword("");
      setTimeout(() => setShake(false), 600);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Ambient background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-orange-500/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/5 rounded-full blur-2xl" />
      </div>

      {/* Card */}
      <div
        className={`relative w-full max-w-sm mx-4 transition-transform duration-100 ${shake ? "animate-[shake_0.5s_ease-in-out]" : ""}`}
        style={shake ? { animation: "shake 0.5s ease-in-out" } : {}}
      >
        <style>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 50%, 90% { transform: translateX(-8px); }
            30%, 70% { transform: translateX(8px); }
          }
        `}</style>

        {/* Logo / branding */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center shadow-2xl mx-auto mb-4">
            <span className="text-white font-black text-3xl">R</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
            REX OS
          </h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium">Your personal operating system</p>
        </div>

        {/* Form card */}
        <div className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-lg font-bold mb-1">Welcome back, Rex</h2>
          <p className="text-sm text-muted-foreground mb-6">Enter your passcode to continue.</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Passcode</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your passcode"
                className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/40"
                autoFocus
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-xs text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                <span>⚠</span>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-primary to-orange-500 text-white hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Verifying…
                </span>
              ) : "Enter REX OS →"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground/50 mt-6">
          Private — Authorized access only
        </p>
      </div>
    </div>
  );
}
