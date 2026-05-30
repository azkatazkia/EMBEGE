"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { AppShell } from "@/components/Sidebar";
import { Logo, I } from "@/components/Icons";

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
        background: "rgba(245,238,220,0.08)", border: "1px solid rgba(245,238,220,0.12)",
        borderRadius: "var(--r-xl)", padding: 20,
        display: "flex", alignItems: "center", gap: 16,
      }}>
        <span style={{ width: 44, height: 44, borderRadius: "50%", background: "var(--leaf-400)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--leaf-900)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="8" r="3.5"/><path d="M3 20c0-3 2.5-5 6-5s6 2 6 5"/>
            <path d="M16 11a3 3 0 1 0 0-6"/><path d="M17 20c0-2-1-3.5-2.5-4.5"/>
          </svg>
        </span>
        <div>
          <div style={{ fontSize: 13, color: "rgba(245,238,220,0.75)" }}>Households on embege</div>
          <div style={{ fontSize: 17, fontWeight: 700 }}>share their kitchen seamlessly</div>
        </div>
      </div>
    </>
  );
}

function SetupScreen({ user, onJoined }) {
  const router = useRouter();
  const supabase = createClient();
  const [mode, setMode] = useState("create");
  const [householdName, setHouseholdName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [displayName, setDisplayName] = useState(user.user_metadata?.display_name || "");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleCreate(e) {
    e.preventDefault();
    setError(null);
    if (!displayName.trim()) return setError("What should we call you?");
    if (!householdName.trim()) return setError("Give your household a name.");
    setLoading(true);
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const { data: household, error: createError } = await supabase
      .from("households")
      .insert({ name: householdName.trim(), invite_code: code, created_by: user.id })
      .select().single();
    if (createError) { setLoading(false); return setError(createError.message); }
    const { error: memberError } = await supabase
      .from("household_members")
      .insert({ household_id: household.id, user_id: user.id, display_name: displayName.trim() });
    setLoading(false);
    if (memberError) return setError(memberError.message);
    onJoined();
  }

  async function handleJoin(e) {
    e.preventDefault();
    setError(null);
    if (!displayName.trim()) return setError("What should we call you?");
    if (inviteCode.trim().length < 4) return setError("That invite code looks too short.");
    setLoading(true);
    const { data: household, error: findError } = await supabase
      .from("households").select().eq("invite_code", inviteCode.trim().toUpperCase()).single();
    if (findError || !household) { setLoading(false); return setError("Invalid invite code."); }
    const { error: memberError } = await supabase
      .from("household_members")
      .insert({ household_id: household.id, user_id: user.id, display_name: displayName.trim() });
    setLoading(false);
    if (memberError) return setError(memberError.message);
    onJoined();
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div style={{
      minHeight: "100vh", display: "grid",
      gridTemplateColumns: "minmax(0, 480px) 1fr",
      background: "var(--surface-canvas)",
    }}>
      <div style={{ padding: "40px 56px", display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 13, color: "var(--text-tertiary)" }}>
            Signed in as <strong style={{ color: "var(--text-primary)" }}>{user.email}</strong>
          </span>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Use another account</button>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", maxWidth: 400 }}>
          <h1 style={{ margin: 0, fontSize: 30, fontWeight: 700, marginBottom: 6, letterSpacing: -0.3 }}>Set up your household</h1>
          <p style={{ margin: "0 0 28px", color: "var(--text-secondary)", fontSize: 15 }}>
            Households share inventory, recipes, and the grocery list.
          </p>

          <label style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 22 }}>
            <span className="input-label">Your display name</span>
            <input className="input" placeholder="e.g. Mom, Dad, yourself" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          </label>

          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr",
            background: "var(--surface-sunken)", padding: 4, borderRadius: 14, marginBottom: 22,
          }}>
            {["create", "join"].map((m) => (
              <button key={m} type="button" onClick={() => { setMode(m); setError(null); }} style={{
                padding: "10px 16px", borderRadius: 10,
                background: mode === m ? "var(--surface-canvas)" : "transparent",
                color: mode === m ? "var(--text-primary)" : "var(--text-secondary)",
                fontSize: 14, fontWeight: 600,
                transition: "background var(--m-fast), color var(--m-fast)",
                boxShadow: mode === m ? "var(--e-1)" : "none",
              }}>
                {m === "create" ? "Create new" : "Join existing"}
              </button>
            ))}
          </div>

          {mode === "create" ? (
            <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span className="input-label">Household name</span>
                <input className="input" placeholder="The Tan Family · Wowo's House · Apt 4B" value={householdName} onChange={(e) => setHouseholdName(e.target.value)} autoFocus />
                <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>Use something your housemates will recognise.</span>
              </label>
              {error && <div style={{ background: "rgba(196,69,54,0.08)", color: "var(--status-urgent)", padding: "10px 14px", borderRadius: 12, fontSize: 13 }}>{error}</div>}
              <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>{loading ? "Creating…" : "Create household"}</button>
            </form>
          ) : (
            <form onSubmit={handleJoin} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span className="input-label">Invite code</span>
                <input className="input" style={{ letterSpacing: 6, fontWeight: 700, textTransform: "uppercase", fontSize: 18 }} placeholder="ABC123" value={inviteCode} onChange={(e) => setInviteCode(e.target.value.toUpperCase())} maxLength={8} />
                <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>Ask whoever set up the household for their code.</span>
              </label>
              {error && <div style={{ background: "rgba(196,69,54,0.08)", color: "var(--status-urgent)", padding: "10px 14px", borderRadius: 12, fontSize: 13 }}>{error}</div>}
              <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>{loading ? "Joining…" : "Join household"}</button>
            </form>
          )}
        </div>
      </div>

      <div style={{
        position: "relative", background: "var(--leaf-800)",
        margin: 20, marginLeft: 0, borderRadius: "var(--r-3xl)",
        overflow: "hidden", padding: 48,
        display: "flex", flexDirection: "column", justifyContent: "space-between",
        color: "var(--text-inverse)",
      }}>
        <AuthSideArt headline="Your kitchen, your people." sub="Households are how embege keeps everyone in sync. Share an invite code with the folks you live with." />
      </div>
    </div>
  );
}

function MemberCard({ member }) {
  const initial = (member.display_name || "?")[0].toUpperCase();
  const joinedDate = new Date(member.joined_at).toLocaleDateString("en-SG", { month: "short", year: "numeric" });
  return (
    <div style={{
      background: "var(--surface-canvas)", border: "1px solid var(--stroke-subtle)",
      borderRadius: "var(--r-xl)", padding: 20,
      display: "flex", flexDirection: "column", gap: 14,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{
          width: 44, height: 44, borderRadius: "50%",
          background: "var(--surface-ink)", color: "#fff",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18, fontWeight: 700, flexShrink: 0,
        }}>
          {initial}
        </span>
        <div>
          <div style={{ fontWeight: 700, fontSize: 18, letterSpacing: -0.2 }}>{member.display_name || "Member"}</div>
          <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>Joined {joinedDate}</div>
        </div>
      </div>
    </div>
  );
}

function AddMemberCard({ onCopy }) {
  return (
    <button onClick={onCopy} style={{
      background: "var(--surface-canvas)", border: "1px dashed var(--stroke-default)",
      borderRadius: "var(--r-xl)", padding: 20,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      gap: 10, minHeight: 100, color: "var(--text-secondary)", textAlign: "center",
    }}>
      <span style={{
        width: 44, height: 44, borderRadius: "50%", background: "var(--surface-sunken)",
        display: "inline-flex", alignItems: "center", justifyContent: "center",
      }}>
        <I.plus size={20} />
      </span>
      <span style={{ fontWeight: 600 }}>Add new member</span>
      <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>Tap to copy invite code</span>
    </button>
  );
}

function HouseholdManagement({ user, household, members, displayName }) {
  const [copied, setCopied] = useState(false);

  function onCopy() {
    if (!household?.invite_code) return;
    navigator.clipboard?.writeText(household.invite_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  const firstName = (displayName || "").split(" ")[0] || "B";

  return (
    <AppShell userInitial={firstName[0]?.toUpperCase() || "B"} userName={displayName}>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 24 }}>
        <span style={{ fontSize: 13, color: "var(--text-tertiary)" }}>{household?.name}</span>
        <button className="btn btn-dark" onClick={onCopy}>
          <I.copy size={16} stroke="#fff" /> {copied ? "Copied!" : "Invite code"}
        </button>
      </div>

      <nav aria-label="Breadcrumb" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-tertiary)", marginBottom: 14 }}>
        <Link href="/dashboard" style={{ color: "var(--text-tertiary)" }}>Dashboard</Link>
        <I.chevronRight size={12} stroke="var(--text-tertiary)" />
        <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>Household</span>
      </nav>

      <div style={{ marginBottom: 28 }}>
        <h1 className="t-heading-xl" style={{ margin: 0 }}>Household</h1>
        <p style={{ margin: "4px 0 0", color: "var(--text-tertiary)", fontSize: 14 }}>
          {household?.name} · {members.length} {members.length === 1 ? "member" : "members"}
        </p>
      </div>

      <section style={{ marginBottom: 28 }}>
        <h3 className="t-heading-md" style={{ margin: "0 0 12px" }}>Members</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>
          {members.map((m) => <MemberCard key={m.id} member={m} />)}
          <AddMemberCard onCopy={onCopy} />
        </div>
      </section>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.4fr)", gap: 16 }} className="household-grid">
        <div className="card" style={{ background: "var(--surface-canvas)" }}>
          <h3 className="t-heading-md" style={{ margin: "0 0 10px" }}>Invite code</h3>
          <p style={{ margin: "0 0 14px", color: "var(--text-tertiary)", fontSize: 13 }}>
            Share this with your housemates so they can join your kitchen.
          </p>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "16px 18px", background: "var(--surface-sunken)", borderRadius: "var(--r-md)",
          }}>
            <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: 6 }}>{household?.invite_code}</span>
            <button className="btn btn-ghost btn-sm" onClick={onCopy}>
              <I.copy size={16} /> {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>

        <div className="card" style={{ background: "var(--surface-canvas)" }}>
          <h3 className="t-heading-md" style={{ margin: "0 0 12px" }}>Recent members</h3>
          <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column" }}>
            {members.map((m) => (
              <li key={m.id} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "12px 4px", borderBottom: "1px solid var(--stroke-subtle)",
              }}>
                <span style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: "var(--surface-ink)", color: "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, fontWeight: 700, flexShrink: 0,
                }}>
                  {(m.display_name || "?")[0].toUpperCase()}
                </span>
                <span style={{ flex: 1, fontSize: 14, color: "var(--text-primary)" }}>
                  <strong style={{ fontWeight: 600 }}>{m.display_name || "Member"}</strong>
                  <span style={{ color: "var(--text-secondary)" }}> joined the household</span>
                </span>
                <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
                  {new Date(m.joined_at).toLocaleDateString("en-SG", { day: "numeric", month: "short" })}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) { .household-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </AppShell>
  );
}

export default function HouseholdPage() {
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState(null);
  const [hasMembership, setHasMembership] = useState(null);
  const [household, setHousehold] = useState(null);
  const [members, setMembers] = useState([]);
  const [displayName, setDisplayName] = useState("");

  async function load() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }
    setUser(user);

    const { data: member } = await supabase
      .from("household_members")
      .select("household_id, display_name")
      .eq("user_id", user.id)
      .single();

    if (!member) { setHasMembership(false); return; }

    setDisplayName(member.display_name || "");
    setHasMembership(true);

    const { data: hh } = await supabase
      .from("households").select("*").eq("id", member.household_id).single();
    setHousehold(hh);

    const { data: allMembers } = await supabase
      .from("household_members")
      .select("id, user_id, display_name, joined_at")
      .eq("household_id", member.household_id)
      .order("joined_at", { ascending: true });
    setMembers(allMembers || []);
  }

  useEffect(() => { load(); }, []);

  if (!user || hasMembership === null) return (
    <div style={{ minHeight: "100vh", background: "var(--surface-canvas)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "var(--text-tertiary)" }}>Loading…</p>
    </div>
  );

  if (!hasMembership) return <SetupScreen user={user} onJoined={load} />;

  return <HouseholdManagement user={user} household={household} members={members} displayName={displayName} />;
}
