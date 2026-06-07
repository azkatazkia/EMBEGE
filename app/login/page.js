"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import AuthSideArt from "@/components/AuthSideArt";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!email.includes("@")) return setError("That doesn't look like an email.");
    if (!password) return setError("Please enter your password.");
    setLoading(true);
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (authError) return setError(authError.message);
    router.push("/dashboard");
  };

  return (
    <div className="welcome-grid" style={{
      minHeight: "100vh", display: "grid",
      gridTemplateColumns: "minmax(0, 480px) 1fr",
      background: "var(--surface-canvas)",
    }}>

      <div style={{ padding: "40px 56px", display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <Link href="/" className="btn btn-ghost btn-sm" style={{ alignSelf: "flex-start", paddingLeft: 0 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M11 5l-7 7 7 7"/></svg>
          Back
        </Link>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", maxWidth: 380 }}>
          <h1 style={{ margin: 0, fontSize: 32, fontWeight: 700, marginBottom: 6, letterSpacing: -0.3 }}>Log in</h1>
          <p style={{ margin: "0 0 28px", color: "var(--text-secondary)" }}>Glad to see you again.</p>

          <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span className="input-label">Email</span>
              <input
                className="input" type="email" placeholder="you@household.com"
                value={email} onChange={(e) => setEmail(e.target.value)} autoFocus
              />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span className="input-label">Password</span>
              <input
                className="input" type="password" placeholder="••••••••"
                value={password} onChange={(e) => setPassword(e.target.value)}
              />
            </label>
            {error && (
              <div style={{ background: "rgba(196,69,54,0.08)", color: "var(--status-urgent)", padding: "10px 14px", borderRadius: 12, fontSize: 13 }}>
                {error}
              </div>
            )}
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
              {loading ? "Logging in…" : "Log in"}
            </button>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13 }}>
              <span style={{ color: "var(--text-tertiary)" }}>Forgot password?</span>
              <Link href="/signup" style={{ color: "var(--text-brand)", fontWeight: 600 }}>Create account</Link>
            </div>
          </form>
        </div>
      </div>

      <div className="green-panel" style={{
        position: "relative", background: "var(--leaf-800)",
        margin: 20, marginLeft: 0, borderRadius: "var(--r-3xl)",
        overflow: "hidden", padding: 48,
        display: "flex", flexDirection: "column", justifyContent: "space-between",
        color: "var(--text-inverse)",
      }}>
        <AuthSideArt headline="Welcome back." sub="Pick up where you left off — your household, your fridge, your week." />
      </div>

      <style>{`
        @media (max-width: 900px) {
          .auth-right-panel { display: none !important; }
          .auth-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
