"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Logo } from "@/components/Icons";

function AuthSideArt({ headline, sub }) {
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Logo size={28} invert />
        <span style={{ fontWeight: 700, fontSize: 18 }}>embege</span>
      </div>

      <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 28 }}>

        <img
          src="/embege-logo.png"
          alt=""
          aria-hidden
          style={{
            position: "absolute", right: -40, top: -60,
            width: 300, height: 300,
            objectFit: "contain",
            opacity: 0.08,
            filter: "invert(1)",
            pointerEvents: "none",
            userSelect: "none",
          }}
        />
        <h2 style={{ fontSize: 36, lineHeight: 1.15, fontWeight: 700, margin: 0, letterSpacing: -0.5, maxWidth: 420, color: "var(--text-inverse)", position: "relative" }}>
          {headline}
        </h2>
        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, maxWidth: 380, color: "rgba(245,238,220,0.7)", position: "relative" }}>
          {sub}
        </p>
      </div>

      <div style={{
        background: "rgba(245,238,220,0.08)",
        border: "1px solid rgba(245,238,220,0.12)",
        borderRadius: "var(--r-xl)", padding: 20,
        display: "flex", alignItems: "center", gap: 16,
      }}>
        <span style={{ width: 44, height: 44, borderRadius: "50%", background: "var(--leaf-400)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--leaf-900)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 21c0-8 6-14 16-15-1 9-7 15-16 15z"/><path d="M5 21c4-4 8-7 14-13"/>
          </svg>
        </span>
        <div>
          <div style={{ fontSize: 13, color: "rgba(245,238,220,0.75)" }}>Families using embege</div>
          <div style={{ fontSize: 17, fontWeight: 700 }}>save $182/month on average</div>
        </div>
      </div>
    </>
  );
}

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
