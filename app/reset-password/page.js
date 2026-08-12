"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!password || password.length < 6) return setError("Password needs at least 6 characters.");
    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (updateError) return setError(updateError.message);
    setDone(true);
    setTimeout(() => router.push("/login"), 2000);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--surface-canvas)" }}>
      <div style={{ maxWidth: 380, width: "100%", padding: 24 }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, marginBottom: 20 }}>Set a new password</h1>

        {done ? (
          <p style={{ color: "var(--leaf-800)" }}>Password updated. Redirecting to login…</p>
        ) : (
          <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span className="input-label">New password</span>
              <input
                className="input" type="password" placeholder="At least 6 characters"
                value={password} onChange={(e) => setPassword(e.target.value)} autoFocus
              />
            </label>
            {error && (
              <div style={{ background: "rgba(196,69,54,0.08)", color: "var(--status-urgent)", padding: "10px 14px", borderRadius: 12, fontSize: 13 }}>
                {error}
              </div>
            )}
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
              {loading ? "Updating…" : "Update password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
