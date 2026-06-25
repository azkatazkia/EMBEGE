"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { AppShell } from "@/components/Sidebar";
import { I } from "@/components/Icons";
import ReceiptScanner from "@/components/ReceiptScanner"
import { getFoodEmoji } from "@/lib/foodIcon";
import { getSuggestedExpiry } from "@/lib/consumptionRate";

function daysUntilExpiry(dateStr) {
  if (!dateStr) return 999;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const expiry = new Date(dateStr); expiry.setHours(0, 0, 0, 0);
  return Math.round((expiry - today) / 86400000);
}

function StatusPill({ daysLeft }) {
  if (daysLeft == 0) return <span className="pill pill-urgent-filled">Expires today</span>;
  if (daysLeft < 0) return <span className="pill pill-urgent-soft">Overdue</span>;
  if (daysLeft <= 3) return <span className="pill pill-warning">{daysLeft} {daysLeft === 1 ? "day" : "days"} left</span>;
  return <span className="pill pill-neutral">{daysLeft} days left</span>;
}

function LocationIcon({ location }) {
  const Ic = location === "Fridge" ? I.fridge : location === "Freezer" ? I.freezer : I.pantry;
  return (
    <span style={{
      width: 26, height: 26, borderRadius: 8,
      background: "var(--surface-canvas)",
      display: "inline-flex", alignItems: "center", justifyContent: "center",
    }}>
      <Ic size={14} stroke="var(--text-secondary)" />
    </span>
  );
}

function ProductCard({ item, onClick }) {
  const daysLeft = daysUntilExpiry(item.expiry_date);
  return (
    <button
      onClick={onClick}
      style={{
        position: "relative", textAlign: "left",
        background: "var(--surface-canvas)", border: "1px solid var(--stroke-subtle)",
        borderRadius: "var(--r-xl)", padding: 18,
        display: "flex", flexDirection: "column", gap: 10, minHeight: 150,
        transition: "transform var(--m-base), box-shadow var(--m-base)",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "var(--e-2)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <span className="t-heading-sm" style={{ color: "var(--text-primary)" }}>{item.name}</span>
        <span style={{ fontSize: 32, lineHeight: 1 }} aria-hidden>{getFoodEmoji(item.name)}</span>
      </div>
      <span style={{ flex: 1 }} />
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        <span className="pill pill-neutral">{item.quantity}</span>
        <StatusPill daysLeft={daysLeft} />
      </div>
    </button>
  );
}

function ItemModal({ item, onClose, onDelete, onEdit, onUseUp }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [usingUp, setUsingUp] = useState(false);
  const [remaining, setRemaining] = useState("");
  const [form, setForm] = useState({
    name: item.name, 
    quantity: item.quantity,
    expiry_date: item.expiry_date?.slice(0, 10) ?? "",
    storage_location: item.storage_location,
  });

  const daysLeft = daysUntilExpiry(item.expiry_date);
  const urgent = daysLeft <= 0;

  const formatExpiry = () => {
    if (daysLeft < 0) return "Overdue";
    if (daysLeft === 0) return "Today";
    return `${daysLeft} ${daysLeft === 1 ? "day" : "days"} left`;
  };

  const formatDateAdded = (ts) => {
    const diff = Math.round((Date.now() - new Date(ts)) / 86400000);
    if (diff === 0) return "Today";
    if (diff === 1) return "Yesterday";
    return `${diff} days ago`;
  };

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    await onEdit(item.id, form);
    setSaving(false);
    setEditing(false);
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "var(--surface-overlay)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
      <div style={{ width: "min(760px, calc(100vw - 40px))", borderRadius: "var(--r-2xl)", background: "var(--surface-canvas)", padding: "48px", position: "relative", boxShadow: "var(--e-4)" }}>
        <button onClick={onClose} className="btn btn-ghost btn-sm" style={{ position: "absolute", top: 20, right: 20 }}>
          <I.x size={20} />
        </button>

        {editing ? (
          <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <h2 className="t-heading-lg" style={{ margin: "0 0 4px" }}>Edit item</h2>
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span className="input-label">Food name</span>
              <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span className="input-label">Quantity</span>
              <input className="input" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} required />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span className="input-label">Expiry date</span>
              <input className="input" type="date" value={form.expiry_date} onChange={e => setForm(f => ({ ...f, expiry_date: e.target.value }))} required />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span className="input-label">Storage location</span>
              <select className="input" style={{ height: 44, appearance: "none"}} value={form.storage_location} onChange={e => setForm(f => ({ ...f, storage_location: e.target.value }))}>
                <option>Fridge</option>
                <option>Freezer</option>
                <option>Pantry</option>
              </select>
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 8 }}>
              <button type="button" className="btn btn-secondary btn-lg" onClick={() => setEditing(false)} disabled={saving}>Cancel</button>
              <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>{saving ? "Saving…" : "Save changes"}</button>
            </div>
          </form>
        ) : (
          <>
            <div style={{ fontSize: 64, marginBottom: 20 }} aria-hidden>{getFoodEmoji(item.name)}</div>
            <h2 className="t-heading-xl" style={{ margin: 0 }}>{item.name}</h2>

            <div style={{ marginTop: 8, display: "inline-flex", alignItems: "center", gap: 8, background: "var(--surface-sunken)", borderRadius: "var(--r-full)", padding: "8px 16px", fontSize: 14, color: "var(--text-secondary)" }}>
              <I.sparkle size={14} stroke="var(--leaf-600)" /> Cook tonight for a meal and you won&apos;t waste anything!
            </div>

            <div style={{ marginTop: 28, display: "grid", gap: 12, maxWidth: 400 }}>
              {[
                { label: "Expiry date", value: formatExpiry(), highlight: urgent },
                { label: "Quantity", value: item.quantity },
                { label: "Storage", value: item.storage_location },
                { label: "Added by", value: item.added_by_name || "Someone" },
                { label: "Date added", value: formatDateAdded(item.created_at) },
              ].map(({ label, value, highlight }) => (
                <div key={label} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", alignItems: "center" }}>
                  <span style={{ fontSize: 14, color: "var(--text-secondary)" }}>{label}</span>
                  <span className={`pill ${highlight ? "pill-urgent-filled" : "pill-neutral"}`} style={{ width: "fit-content" }}>
                    {value}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 32, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <button className="btn btn-secondary btn-lg">
                <I.utensils size={16} /> Find Recipe
              </button>
              <button className="btn btn-secondary btn-lg" onClick={() => setEditing(true)}>
                <I.pencil size={16} /> Edit
              </button>

              <div
  style={{ position: "relative" }}
  onMouseEnter={() => setHovering(true)}
  onMouseLeave={() => setHovering(false)}
>
  {hovering && (
    <div style={{
      position: "absolute", bottom: 0, left: 0, right: 0,
      paddingBottom: "calc(100% + 8px)", 
      zIndex: 10,
    }}>
      <div style={{
        position: "absolute", bottom: "calc(100% + 8px)", left: 0, right: 0,
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6,
        background: "var(--surface-canvas)", border: "1px solid var(--stroke-subtle)",
        borderRadius: 12, padding: 8, boxShadow: "var(--e-3)",
      }}>
        <button
          className="btn btn-secondary btn-sm"
          style={{ flexDirection: "column", gap: 4, height: 56 }}
          onClick={() => setUsingUp(true)}
          title="Some left"
        >
          <I.clock size={18} />
          <span style={{ fontSize: 11 }}>Some left</span>
        </button>

        <button
          className="btn btn-primary btn-sm"
          style={{ flexDirection: "column", gap: 4, height: 56 }}
          onClick={() => onUseUp(item, null)}
          title="All used up"
        >
          <I.check size={18} stroke="#fff" />
          <span style={{ fontSize: 11 }}>All gone</span>
        </button>
      </div>
    </div>
  )}

  <button className="btn btn-primary btn-lg" style={{ width: "100%" }}>
    <I.check size={16} stroke="#fff" /> Used up
  </button>
</div>
              </div>

            {usingUp && (
              <div style={{ marginTop: 16, padding: 16, background: "var(--surface-sunken)", borderRadius: 12, display: "flex", flexDirection: "column", gap: 10 }}>
                <span className="t-heading-sm">How much is left?</span>
                <input
                  className="input"
                  placeholder={`e.g. ${item.quantity}`}
                  value={remaining}
                  onChange={e => setRemaining(e.target.value)}
                  autoFocus
                />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <button className="btn btn-secondary" onClick={() => { setUsingUp(false); setRemaining(""); }}>Cancel</button>
                  <button
                    className="btn btn-primary"
                    disabled={!remaining.trim()}
                    onClick={() => onUseUp(item, remaining.trim())}
                  >
                    Confirm
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function AddItemModal({ onClose, onAdd, saving }) {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("Fridge");
  const [suggestedExpiry, setSuggestedExpiry] = useState("");
  const [isSuggested, setIsSuggested] = useState(false);

  useEffect(() => {
    if (!name.trim()) return;
    const suggested = getSuggestedExpiry(name, location);
    if (suggested) {
      setSuggestedExpiry(suggested);
      setIsSuggested(true);
    }
  }, [name, location]);

  return (
    <div style={{ position: "fixed", inset: 0, background: "var(--surface-overlay)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
      <div style={{ width: "min(560px, calc(100vw - 40px))", borderRadius: "var(--r-2xl)", background: "var(--surface-canvas)", padding: "40px", boxShadow: "var(--e-4)" }}>
        <h2 className="t-heading-lg" style={{ margin: 0 }}>Add food item</h2>
        <p style={{ margin: "8px 0 24px", color: "var(--text-secondary)", fontSize: 14 }}>
          Manually add an item to your household inventory.
        </p>

        <form onSubmit={onAdd} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span className="input-label">Food name</span>
            <input name="name" required className="input" placeholder="e.g. Milk, Chicken thighs" value={name} onChange={e => setName(e.target.value)} />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span className="input-label">Quantity</span>
            <input name="quantity" required className="input" placeholder="e.g. 1 pack, 500g" />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span className="input-label">Expiry date</span>
            <input name="expiry_date" type="date" required className="input" value={suggestedExpiry} onChange={e => { setSuggestedExpiry(e.target.value); setIsSuggested(false); }} />
            {isSuggested && (
              <span style={{ fontSize: 12, color: "var(--leaf-600)", marginTop: -2 }}>
                ✦ Suggested based on food type — you can change it
              </span>
            )}
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span className="input-label">Storage location</span>
            <select name="storage_location" className="input" style={{ height: 44 }} value={location} onChange={e => setLocation(e.target.value)}>
              <option>Fridge</option>
              <option>Freezer</option>
              <option>Pantry</option>
            </select>
          </label>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 8 }}>
            <button type="button" onClick={onClose} className="btn btn-secondary btn-lg" disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
              {saving ? "Adding…" : "Add item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ActionChip({ icon: Ic, label, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 12, padding: "14px 18px",
      background: "var(--surface-canvas)", border: "1px solid var(--stroke-subtle)",
      borderRadius: 18, fontSize: 15, fontWeight: 500,
      transition: "background var(--m-fast)",
    }}
    onMouseEnter={(e) => { e.currentTarget.style.background = "var(--surface-sunken)"; }}
    onMouseLeave={(e) => { e.currentTarget.style.background = "var(--surface-canvas)"; }}
    >
      <span style={{
        width: 30, height: 30, borderRadius: "50%",
        background: "var(--leaf-50)", color: "var(--leaf-800)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Ic size={16} stroke="var(--leaf-800)" />
      </span>
      {label}
    </button>
  );
}

export default function InventoryPage() {
  const router = useRouter();
  const supabase = createClient();

  const [householdId, setHouseholdId] = useState(null);
  const [userId, setUserId] = useState(null);
  const [items, setItems] = useState([]);
  const [memberMap, setMemberMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [activeLocation, setActiveLocation] = useState("All");
  const [selectedItem, setSelectedItem] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [displayName, setDisplayName] = useState("?");
  const [scannerOpen, setScannerOpen] = useState(false);

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

      await loadItems(member.household_id, user.id);
    }
    init();
  }, []);

  async function loadItems(hhId, uid, silent = false) {
    const hid = hhId ?? householdId;
    if (!hid) return;
    if (!silent) setLoading(true);

    const { data: foodItems, error: itemsErr } = await supabase
      .from("food_items")
      .select("*")
      .eq("household_id", hid)
      .order("expiry_date", { ascending: true });

    if (itemsErr) { setError(itemsErr.message); setLoading(false); return; }

    const { data: members } = await supabase
      .from("household_members")
      .select("user_id, display_name")
      .eq("household_id", hid);

    const map = Object.fromEntries((members ?? []).map(m => [m.user_id, m.display_name]));
    setMemberMap(map);

    const enriched = (foodItems ?? []).map(item => ({
      ...item,
      added_by_name: map[item.added_by] ?? "Someone",
    }));

    setItems(enriched);
    setLoading(false);
  }

  useEffect(() => {
    if (!householdId || !userId) return;
    const hid = householdId;
    const uid = userId;

    const channel = supabase
      .channel(`food_items:${hid}`)
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "food_items",
        filter: `household_id=eq.${hid}`,
      }, () => {
        loadItems(hid, uid, true);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [householdId, userId]);

  async function handleAdd(e) {
    e.preventDefault();
    if (!householdId || !userId) return;
    setSaving(true);
    setError(null);

    const fd = new FormData(e.target);
    const { error: insertErr } = await supabase.from("food_items").insert({
      household_id: householdId,
      name: fd.get("name"),
      quantity: fd.get("quantity"),
      expiry_date: fd.get("expiry_date"),
      storage_location: fd.get("storage_location"),
      added_by: userId,
    });

    setSaving(false);
    if (insertErr) { setError(insertErr.message); return; }

    setShowAddForm(false);
    e.target.reset();
  }

  async function handleEdit(id, form) {
    const { error: editErr } = await supabase.from("food_items").update({
      name: form.name,
      quantity: form.quantity,
      expiry_date: form.expiry_date,
      storage_location: form.storage_location,
    }).eq("id", id);
    if (editErr) { setError(editErr.message); return; }
    setSelectedItem(prev => prev ? { ...prev, ...form } : null);
  }

  async function handleDelete(id) {
    const { error: delErr } = await supabase.from("food_items").delete().eq("id", id);
    if (delErr) { setError(delErr.message); return; }
    setSelectedItem(null);
  }

  async function handleUseUp(item, remaining) {
    const fullyUsed = remaining === null; 
  
    await supabase.from("consumption_log").insert({
      household_id: householdId,
      food_item_id: item.id,
      food_item_name: item.name,
      original_quantity: item.quantity,
      remaining_quantity: remaining,
      consumed_by: userId,
      item_added_at: item.created_at,
    });
  
    if (fullyUsed) {
      await supabase.from("food_items").delete().eq("id", item.id);
    } else {
      await supabase.from("food_items").update({ quantity: remaining }).eq("id", item.id);
    }
  
    setSelectedItem(null);
  }

  const locations = ["All", "Fridge", "Freezer", "Pantry"];

  const filtered = items.filter((it) => {
    if (activeLocation !== "All" && it.storage_location !== activeLocation) return false;
    if (query && !it.name.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  const grouped = ["Fridge", "Freezer", "Pantry"]
    .map((loc) => ({ loc, items: filtered.filter((it) => it.storage_location === loc) }))
    .filter((g) => g.items.length > 0);

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
            placeholder="Search the pantry"
            value={query} onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button className="btn btn-ghost btn-sm" style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--surface-canvas)" }} aria-label="Filter">
            <I.filter size={18} />
          </button>
          <button className="btn btn-dark" onClick={() => setShowAddForm(true)}>
            <I.plus size={16} stroke="#fff" /> Add item
          </button>
        </div>
      </div>

      <nav aria-label="Breadcrumb" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-tertiary)", marginBottom: 14 }}>
        <Link href="/dashboard" style={{ color: "var(--text-tertiary)" }}>Dashboard</Link>
        <I.chevronRight size={12} stroke="var(--text-tertiary)" />
        <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>Inventory</span>
      </nav>

      <div style={{ marginBottom: 18 }}>
        <h2 className="t-heading-lg" style={{ margin: "0 0 10px" }}>Add to Inventory</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          <ActionChip icon={I.sparkle} label="Tell e-ai" onClick={() => router.push("/eai")} />
          <ActionChip icon={I.pencil} label="Manual entry" onClick={() => setShowAddForm(true)} />
          <ActionChip icon={I.receipt} label="Scan receipt" onClick={() => setScannerOpen(true)} />
          <ActionChip icon={I.camera} label="Photo of fridge" onClick={() => alert("Photo scan — coming soon.")} />
        </div>
      </div>

      {error && (
        <div style={{ background: "rgba(196,69,54,0.08)", color: "var(--status-urgent)", padding: "12px 16px", borderRadius: 12, fontSize: 13, marginBottom: 16 }}>
          {error}
          <button onClick={() => setError(null)} style={{ marginLeft: 12, color: "inherit", fontWeight: 600 }}>Dismiss</button>
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {locations.map((l) => (
          <button
            key={l}
            onClick={() => setActiveLocation(l)}
            className="pill"
            style={{
              height: 36, paddingLeft: 14, paddingRight: 14, borderRadius: 9999,
              background: activeLocation === l ? "var(--surface-ink)" : "var(--surface-sunken)",
              color: activeLocation === l ? "var(--text-inverse)" : "var(--text-primary)",
              fontSize: 13, fontWeight: 600,
              transition: "background var(--m-fast)",
            }}
          >
            {l}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: "var(--text-tertiary)", marginTop: 40 }}>Loading inventory…</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          {grouped.map(({ loc, items: locItems }) => (
            <section key={loc}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 10 }}>
                <h3 className="t-heading-md" style={{ margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                  <LocationIcon location={loc} />
                  {loc}
                  <span style={{ color: "var(--text-tertiary)", fontWeight: 500, fontSize: 13 }}>· {locItems.length}</span>
                </h3>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: 14 }}>
                {locItems.map((it) => (
                  <ProductCard key={it.id} item={it} onClick={() => setSelectedItem(it)} />
                ))}
              </div>
            </section>
          ))}

          {grouped.length === 0 && (
            <div style={{ maxWidth: 360, margin: "40px auto", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
              <span style={{ width: 80, height: 80, borderRadius: "50%", background: "var(--surface-canvas)", color: "var(--text-tertiary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <I.box size={32} />
              </span>
              <h3 className="t-heading-md" style={{ margin: 0 }}>Nothing here yet</h3>
              <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: 14 }}>
                {query ? "Try clearing your search." : "Add what's already in your kitchen."}
              </p>
              {!query && <button className="btn btn-primary" onClick={() => setShowAddForm(true)}>Add an item</button>}
            </div>
          )}
        </div>
      )}

      {selectedItem && (
        <ItemModal item={selectedItem} onClose={() => setSelectedItem(null)} onDelete={handleDelete} onEdit={handleEdit}  onUseUp={handleUseUp} />
      )}
      {showAddForm && (
        <AddItemModal onClose={() => setShowAddForm(false)} onAdd={handleAdd} saving={saving} />
      )}

      {scannerOpen && (
              <ReceiptScanner
                isOpen={scannerOpen}
                onClose={() => setScannerOpen(false)}
                onItemsConfirmed={async (items) => {
                  setScannerOpen(false);
                  await supabase.from("food_items").insert(
                      items.map(item => ({
                          household_id: householdId,
                          name: item.name,
                          quantity: item.quantity,
                          expiry_date: item.expiry_date || null,
                          storage_location: item.storage_location,
                          added_by: userId,
                      }))
                  );
              }}
              />
      )}
    </AppShell>
  );
}
