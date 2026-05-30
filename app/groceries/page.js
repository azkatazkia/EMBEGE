"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { AppShell } from "@/components/Sidebar";
import { I } from "@/components/Icons";

function GroceryRow({ item, onToggle, onEdit, onDelete }) {
  const [hovered, setHovered] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(item.item_name);

  function handleEditSubmit(e) {
    e.preventDefault();
    if (editValue.trim()) onEdit(item.id, editValue.trim());
    setEditing(false);
  }

  if (editing) {
    return (
      <form onSubmit={handleEditSubmit} style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "8px 4px", borderBottom: "1px solid var(--stroke-subtle)",
      }}>
        <input
          autoFocus
          className="input"
          style={{ flex: 1, height: 36, fontSize: 14 }}
          value={editValue}
          onChange={e => setEditValue(e.target.value)}
          onKeyDown={e => e.key === "Escape" && setEditing(false)}
        />
        <button type="submit" className="btn btn-primary btn-sm">Save</button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}>Cancel</button>
      </form>
    );
  }

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", alignItems: "center", gap: 14,
        padding: "12px 4px", borderBottom: "1px solid var(--stroke-subtle)",
        background: hovered ? "rgba(26,26,26,0.025)" : "transparent",
        borderRadius: 6, transition: "background var(--m-fast)",
      }}
    >

      <button
        onClick={() => onToggle(item.id, item.is_checked)}
        style={{
          width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
          background: item.is_checked ? "var(--leaf-600)" : "transparent",
          border: item.is_checked ? "none" : "1.5px solid var(--stroke-default)",
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          transition: "background var(--m-slow), border var(--m-slow)",
        }}
      >
        {item.is_checked && <I.check size={14} stroke="#fff" strokeWidth={2.5} />}
      </button>

      <span style={{
        flex: 1, fontWeight: 500, fontSize: 15,
        color: item.is_checked ? "var(--status-muted)" : "var(--text-primary)",
        textDecoration: item.is_checked ? "line-through" : "none",
      }}>
        {item.item_name}
      </span>

      {hovered ? (
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <button
            onClick={() => setEditing(true)}
            className="btn btn-ghost btn-sm"
            style={{ width: 32, height: 32, padding: 0, borderRadius: 8, color: "var(--text-secondary)" }}
            title="Edit"
          >
            <I.pencil size={15} />
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className="btn btn-ghost btn-sm"
            style={{ width: 32, height: 32, padding: 0, borderRadius: 8, color: "var(--status-urgent)" }}
            title="Delete"
          >
            <I.trash size={15} />
          </button>
        </div>
      ) : (
        item.is_checked
          ? <span className="pill pill-success">Bought</span>
          : <span className="pill pill-neutral">by {item.added_by_name || "someone"}</span>
      )}
    </div>
  );
}

export default function GroceriesPage() {
  const router = useRouter();
  const supabase = createClient();

  const [householdId, setHouseholdId] = useState(null);
  const [userId, setUserId] = useState(null);
  const [displayName, setDisplayName] = useState("B");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newItem, setNewItem] = useState("");
  const [adding, setAdding] = useState(false);
  const [query, setQuery] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setUserId(user.id);

      const { data: member, error: memberErr } = await supabase
        .from("household_members")
        .select("household_id, display_name")
        .eq("user_id", user.id)
        .single();

      if (memberErr || !member) { router.push("/household"); return; }

      setHouseholdId(member.household_id);
      if (member.display_name) setDisplayName(member.display_name);

      await loadItems(member.household_id);
    }
    init();
  }, []);

  async function loadItems(hhId) {
    setLoading(true);
    const hid = hhId ?? householdId;

    const { data: groceries, error: err } = await supabase
      .from("grocery_list")
      .select("*")
      .eq("household_id", hid)
      .order("created_at", { ascending: false });

    if (err) { setError(err.message); setLoading(false); return; }

    const { data: members } = await supabase
      .from("household_members")
      .select("user_id, display_name")
      .eq("household_id", hid);

    const memberMap = Object.fromEntries((members ?? []).map(m => [m.user_id, m.display_name]));

    setItems((groceries ?? []).map(g => ({
      ...g,
      added_by_name: memberMap[g.added_by] ?? "someone",
    })));
    setLoading(false);
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (!newItem.trim() || !householdId) return;
    setAdding(true);
    const { error: err } = await supabase.from("grocery_list").insert({
      household_id: householdId,
      item_name: newItem.trim(),
      added_by: userId,
      is_checked: false,
    });
    setAdding(false);
    if (err) { setError(err.message); return; }
    setNewItem("");
    await loadItems(householdId);
  }

  async function handleToggle(id, currentChecked) {
    await supabase.from("grocery_list").update({ is_checked: !currentChecked }).eq("id", id);
    setItems(prev => prev.map(g => g.id === id ? { ...g, is_checked: !currentChecked } : g));
  }

  async function handleEditItem(id, newName) {
    const { error: err } = await supabase.from("grocery_list").update({ item_name: newName }).eq("id", id);
    if (err) { setError(err.message); return; }
    setItems(prev => prev.map(g => g.id === id ? { ...g, item_name: newName } : g));
  }

  async function handleDeleteItem(id) {
    const { error: err } = await supabase.from("grocery_list").delete().eq("id", id);
    if (err) { setError(err.message); return; }
    setItems(prev => prev.filter(g => g.id !== id));
  }

  const filtered = items.filter(g =>
    !query || g.item_name.toLowerCase().includes(query.toLowerCase())
  );
  const toBuy = filtered.filter(g => !g.is_checked);
  const bought = filtered.filter(g => g.is_checked);

  const firstName = displayName.split(" ")[0];

  return (
    <AppShell userInitial={firstName[0]?.toUpperCase() || "B"} userName={displayName}>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 24 }}>
        <div style={{ position: "relative", flex: 1, maxWidth: 460 }}>
          <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)", pointerEvents: "none" }}>
            <I.search size={18} />
          </span>
          <input
            className="input-pill" style={{ paddingLeft: 44 }}
            placeholder="Search groceries"
            value={query} onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <button className="btn btn-dark" onClick={() => document.getElementById("grocery-add")?.focus()}>
          <I.plus size={16} stroke="#fff" /> Add item
        </button>
      </div>

      <nav aria-label="Breadcrumb" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-tertiary)", marginBottom: 14 }}>
        <Link href="/dashboard" style={{ color: "var(--text-tertiary)" }}>Dashboard</Link>
        <I.chevronRight size={12} stroke="var(--text-tertiary)" />
        <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>Groceries</span>
      </nav>

      <div style={{ marginBottom: 22 }}>
        <h1 className="t-heading-xl" style={{ margin: 0 }}>Groceries</h1>
        <p style={{ margin: "4px 0 0", color: "var(--text-tertiary)", fontSize: 14 }}>
          {toBuy.length} {toBuy.length === 1 ? "item needs" : "items need"} restocking
        </p>
      </div>

      {error && (
        <div style={{ background: "rgba(196,69,54,0.08)", color: "var(--status-urgent)", padding: "12px 16px", borderRadius: 12, fontSize: 13, marginBottom: 16 }}>
          {error}
          <button onClick={() => setError(null)} style={{ marginLeft: 12, color: "inherit", fontWeight: 600 }}>Dismiss</button>
        </div>
      )}

      <form onSubmit={handleAdd} style={{ position: "relative", marginBottom: 28, maxWidth: 560 }}>
        <input
          id="grocery-add"
          className="input-pill"
          style={{ paddingRight: 110 }}
          placeholder="Add an item — e.g. butter, brown sugar…"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
        />
        <button type="submit" className="btn btn-primary btn-sm" disabled={adding} style={{
          position: "absolute", right: 4, top: 4, bottom: 4,
          padding: "0 16px", borderRadius: 9999,
        }}>
          {adding ? "Adding…" : "Add"}
        </button>
      </form>

      {loading ? (
        <p style={{ color: "var(--text-tertiary)" }}>Loading…</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.5fr) minmax(0, 1fr)", gap: 22 }} className="grocery-grid">
          <div className="card" style={{ background: "var(--surface-canvas)" }}>
            <h3 className="t-heading-lg" style={{ margin: "0 0 4px" }}>Buy</h3>
            <p style={{ margin: "0 0 14px", color: "var(--text-tertiary)", fontSize: 13 }}>
              Tap to mark as bought.
            </p>
            {toBuy.length === 0 ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "32px 0", color: "var(--text-tertiary)" }}>
                <I.cart size={32} />
                <p style={{ margin: 0, fontWeight: 600 }}>Nothing to buy</p>
                <p style={{ margin: 0, fontSize: 13 }}>Your household is fully stocked.</p>
              </div>
            ) : (
              toBuy.map(g => <GroceryRow key={g.id} item={g} onToggle={handleToggle} onEdit={handleEditItem} onDelete={handleDeleteItem} />)
            )}
          </div>

          <div className="card" style={{ background: "var(--surface-canvas)" }}>
            <h3 className="t-heading-lg" style={{ margin: "0 0 4px" }}>Recently bought</h3>
            <p style={{ margin: "0 0 14px", color: "var(--text-tertiary)", fontSize: 13 }}>
              Tap to move back to the buy list.
            </p>
            {bought.length === 0 ? (
              <p style={{ color: "var(--text-tertiary)", fontSize: 14, margin: 0 }}>Nothing bought yet.</p>
            ) : (
              bought.map(g => <GroceryRow key={g.id} item={g} onToggle={handleToggle} onEdit={handleEditItem} onDelete={handleDeleteItem} />)
            )}
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 900px) { .grocery-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </AppShell>
  );
}
