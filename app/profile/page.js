"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { AppShell } from "@/components/Sidebar";
import { I } from "@/components/Icons";

const ALL_RESTRICTIONS = [
  { id: "halal",              label: "Halal" },
  { id: "vegetarian",         label: "Vegetarian" },
  { id: "vegan",              label: "Vegan" },
  { id: "keto",               label: "Keto" },
  { id: "lactose-intolerant", label: "Lactose Intolerant" },
  { id: "gluten-free",        label: "Gluten Free" },
  { id: "nut-allergy",        label: "Nut Allergy" },
];

function RestrictionPill({ label, onRemove }) {
  const [hovered, setHovered] = useState(false);
  return (
    <span
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        height: 34, padding: "0 14px",
        background: "var(--leaf-800)",
        color: "var(--text-inverse)",
        borderRadius: "var(--r-full)",
        fontSize: 14, fontWeight: 600,
        transition: "background var(--m-fast)",
        cursor: onRemove ? "default" : undefined,
      }}
    >
      {label}
      {onRemove && (
        <button
          onClick={onRemove}
          aria-label={`Remove ${label}`}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: 18, height: 18, borderRadius: "50%",
            background: hovered ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.15)",
            color: "white", transition: "background var(--m-fast)",
            flexShrink: 0,
          }}
        >
          <I.x size={10} strokeWidth={2.5} />
        </button>
      )}
    </span>
  );
}

function AddRestrictionDropdown({ selected, onAdd }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const available = ALL_RESTRICTIONS.filter(r => !selected.includes(r.id));

  useEffect(() => {
    if (!open) return;
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  if (available.length === 0) return null;

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          height: 34, padding: "0 14px",
          background: "transparent",
          color: "var(--text-primary)",
          border: "1.5px solid var(--stroke-default)",
          borderRadius: "var(--r-full)",
          fontSize: 14, fontWeight: 600,
          cursor: "pointer",
          transition: "border-color var(--m-fast), background var(--m-fast)",
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--stroke-strong)"; e.currentTarget.style.background = "rgba(26,26,26,0.04)"; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--stroke-default)"; e.currentTarget.style.background = "transparent"; }}
      >
        Add
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 8px)", left: 0, zIndex: 50,
          background: "var(--surface-canvas)",
          border: "1px solid var(--stroke-default)",
          borderRadius: "var(--r-lg)",
          boxShadow: "var(--e-3)",
          minWidth: 180,
          overflow: "hidden",
          animation: "fadeIn var(--m-fast) both",
        }}>
          {available.map(r => (
            <button
              key={r.id}
              onClick={() => { onAdd(r.id); setOpen(false); }}
              style={{
                display: "block", width: "100%", textAlign: "left",
                padding: "10px 16px",
                fontSize: 14, fontWeight: 500, color: "var(--text-primary)",
                background: "transparent",
                transition: "background var(--m-fast)",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "var(--surface-sunken)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              {r.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState(null);
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [householdName, setHouseholdName] = useState("");

  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [nameSaving, setNameSaving] = useState(false);

  const [restrictions, setRestrictions] = useState([]);
  const [restrictionSaving, setRestrictionSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setUserId(user.id);
      setEmail(user.email || "");

      const { data: member } = await supabase
        .from("household_members")
        .select("display_name, household_id")
        .eq("user_id", user.id)
        .single();

      if (member?.display_name) setDisplayName(member.display_name);

      if (member?.household_id) {
        const { data: hh } = await supabase
          .from("households")
          .select("name")
          .eq("id", member.household_id)
          .single();
        if (hh?.name) setHouseholdName(hh.name);
      }

      const { data: profile } = await supabase
        .from("dietary_profiles")
        .select("restrictions")
        .eq("user_id", user.id)
        .single();

      if (profile?.restrictions) setRestrictions(profile.restrictions);
      setLoading(false);
    }
    load();
  }, []);

  async function saveRestrictions(next) {
    if (!userId) return;
    setRestrictionSaving(true);
    await supabase
      .from("dietary_profiles")
      .upsert(
        { user_id: userId, restrictions: next, updated_at: new Date().toISOString() },
        { onConflict: "user_id" }
      );
    setRestrictionSaving(false);
  }

  async function addRestriction(id) {
    const next = [...restrictions, id];
    setRestrictions(next);
    await saveRestrictions(next);
  }

  async function removeRestriction(id) {
    const next = restrictions.filter(r => r !== id);
    setRestrictions(next);
    await saveRestrictions(next);
  }

  function startEditName() {
    setNameInput(displayName);
    setEditingName(true);
  }

  async function saveName() {
    if (!userId || !nameInput.trim()) return;
    setNameSaving(true);
    await supabase
      .from("household_members")
      .update({ display_name: nameInput.trim() })
      .eq("user_id", userId);
    setDisplayName(nameInput.trim());
    setNameSaving(false);
    setEditingName(false);
  }

  function cancelEditName() {
    setEditingName(false);
    setNameInput("");
  }

  const firstName = displayName.split(" ")[0] || "?";
  const userInitial = firstName[0]?.toUpperCase() || "?";

  const getLabel = (id) => ALL_RESTRICTIONS.find(r => r.id === id)?.label ?? id;

  return (
    <AppShell userInitial={userInitial} userName={displayName}>
      <nav
        aria-label="Breadcrumb"
        style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-tertiary)", marginBottom: 24 }}
      >
        <Link href="/dashboard" style={{ color: "var(--text-tertiary)" }}>Dashboard</Link>
        <I.chevronRight size={12} stroke="var(--text-tertiary)" />
        <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>Profile</span>
      </nav>

      <h1 className="t-heading-xl" style={{ margin: "0 0 24px" }}>Profile</h1>

      {loading ? (
        <p style={{ color: "var(--text-tertiary)" }}>Loading…</p>
      ) : (
        <div style={{ maxWidth: 560, display: "flex", flexDirection: "column", gap: 16 }}>

          <div style={{
            background: "var(--surface-canvas)",
            border: "1px solid var(--stroke-subtle)",
            borderRadius: "var(--r-2xl)",
            padding: "24px",
          }}>
            <p style={{ margin: "0 0 18px", fontSize: 13, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Your profile
            </p>

            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              {/* Avatar */}
              <span
                className="avatar avatar-lg avatar-dark"
                aria-hidden
              >
                {userInitial}
              </span>

              <div style={{ flex: 1, minWidth: 0 }}>
                {editingName ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input
                      autoFocus
                      className="input"
                      value={nameInput}
                      onChange={e => setNameInput(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") saveName(); if (e.key === "Escape") cancelEditName(); }}
                      style={{ height: 36, fontSize: 20, fontWeight: 700, padding: "0 12px", flex: 1, minWidth: 0 }}
                    />
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={saveName}
                      disabled={nameSaving || !nameInput.trim()}
                    >
                      {nameSaving ? "…" : "Save"}
                    </button>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={cancelEditName}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div
                    className="t-heading-md"
                    style={{ margin: "0 0 4px", color: "var(--text-primary)" }}
                  >
                    {displayName || "—"}
                  </div>
                )}
                {!editingName && (
                  <div style={{ fontSize: 13, color: "var(--text-tertiary)", display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                    <span>{email}</span>
                    {householdName && (
                      <>
                        <span style={{ opacity: 0.5 }}>|</span>
                        <span>{householdName}</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {!editingName && (
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={startEditName}
                  style={{
                    borderRadius: "var(--r-full)",
                    border: "1.5px solid var(--stroke-default)",
                    background: "transparent",
                    flexShrink: 0,
                  }}
                >
                  Edit
                </button>
              )}
            </div>

            <div style={{ marginTop: 24 }}>
              <p style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>
                My dietary restrictions
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                {restrictions.map(id => (
                  <RestrictionPill
                    key={id}
                    label={getLabel(id)}
                    onRemove={() => removeRestriction(id)}
                  />
                ))}
                <AddRestrictionDropdown
                  selected={restrictions}
                  onAdd={addRestriction}
                />
                {restrictionSaving && (
                  <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>Saving…</span>
                )}
              </div>
            </div>
          </div>

        </div>
      )}
    </AppShell>
  );
}
