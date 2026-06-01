"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { AppShell } from "@/components/Sidebar";
import { I } from "@/components/Icons";

function getFoodEmoji(name) {
  const map = {
    shrimp: "🦐", milk: "🥛", egg: "🥚", cucumber: "🥒",
    tomato: "🍅", spinach: "🥬", chicken: "🍗", rice: "🍚",
    beef: "🥩", fish: "🐟", carrot: "🥕", apple: "🍎",
    banana: "🍌", bread: "🍞", cheese: "🧀", pasta: "🍝",
    peas: "🟢", onion: "🧅",
  };
  const key = name.toLowerCase();
  return Object.entries(map).find(([k]) => key.includes(k))?.[1] ?? "🍽️";
}

function daysUntilExpiry(dateStr) {
  if (!dateStr) return 999;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const expiry = new Date(dateStr); expiry.setHours(0, 0, 0, 0);
  return Math.round((expiry - today) / 86400000);
}

function StatusPill({ daysLeft }) {
  if (daysLeft <= 0) return <span className="pill pill-urgent-filled">Expires today</span>;
  if (daysLeft <= 3) return <span className="pill pill-warning">{daysLeft} {daysLeft === 1 ? "day" : "days"} left</span>;
  return <span className="pill pill-neutral">{daysLeft} days left</span>;
}

function EaiHero({ userName, expiringSoon }) {
  const [text, setText] = useState("");
  const router = useRouter();

  const names = expiringSoon.slice(0, 2).map(i => i.name).join(" and ") || "expiring items";
  const headline = `Hi, ${userName}! ${names ? `Cook **${names}** tonight.` : "Check your pantry!"}`;
  const body = expiringSoon.length > 0
    ? `${expiringSoon.length} ${expiringSoon.length === 1 ? "item expires" : "items expire"} soon. Ask e-ai for recipe suggestions that use what you already have.`
    : "Your inventory looks fresh. Ask e-ai what to cook this week.";

  function renderRich(str) {
    return str.split(/(\*\*[^*]+\*\*)/g).map((p, i) =>
      p.startsWith("**") && p.endsWith("**")
        ? <strong key={i} style={{ fontWeight: 700 }}>{p.slice(2, -2)}</strong>
        : <span key={i}>{p}</span>
    );
  }

  const onSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    router.push("/tell-eai");
  };

  return (
    <div className="fadein" style={{
      background: "var(--surface-canvas)",
      border: "1px solid var(--stroke-subtle)",
      borderRadius: "var(--r-2xl)",
      padding: "28px 28px 24px",
      display: "flex", flexDirection: "column", gap: 18,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{
          width: 30, height: 30, borderRadius: "50%",
          background: "radial-gradient(circle at 30% 30%, var(--leaf-400) 0%, var(--leaf-600) 55%, var(--leaf-800) 100%)",
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 0 0 2px rgba(255,255,255,0.6)", flexShrink: 0,
        }}>
          <I.sparkle size={16} stroke="#fff" strokeWidth={1.8} />
        </span>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span className="t-heading-sm" style={{ color: "var(--text-primary)" }}>e-ai</span>
          <span className="t-caption" style={{ color: "var(--text-tertiary)" }}>your kitchen assistant</span>
        </div>
        <span style={{ flex: 1 }} />
        <span className="pill pill-neutral" style={{ height: 22, fontSize: 11 }}>just now</span>
      </div>

      <div>
        <div className="t-heading-lg" style={{ marginBottom: 8, color: "var(--text-primary)", lineHeight: 1.25 }}>
          {renderRich(headline)}
        </div>
        <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.55, maxWidth: "78ch" }}>
          {body}
        </p>
      </div>

      <form onSubmit={onSubmit} style={{ position: "relative", marginTop: 4 }}>
        <input
          value={text} onChange={(e) => setText(e.target.value)}
          className="input-pill"
          style={{ paddingRight: 56, background: "var(--surface-sunken)" }}
          placeholder="Ask a follow-up"
        />
        <button type="submit" aria-label="Send to e-ai" style={{
          position: "absolute", right: 4, top: 4, bottom: 4,
          width: 36, borderRadius: "50%",
          background: text.trim() ? "var(--leaf-600)" : "var(--surface-canvas)",
          color: text.trim() ? "#fff" : "var(--text-tertiary)",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "background var(--m-fast), color var(--m-fast)",
        }}>
          <I.send size={16} strokeWidth={2} />
        </button>
      </form>
    </div>
  );
}

function InventoryStrip({ items, expiringSoon }) {
  if (!items) return null;
  const display = expiringSoon.slice(0, 3);

  return (
    <section style={{ marginTop: 28 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 12 }}>
        <div>
          <h2 className="t-heading-lg" style={{ margin: 0 }}>Inventory</h2>
          <p style={{ margin: "4px 0 0", color: "var(--text-tertiary)", fontSize: 14 }}>
            {expiringSoon.length} {expiringSoon.length === 1 ? "item" : "items"} expiring soon
          </p>
        </div>
        <Link href="/inventory" className="btn btn-ghost btn-sm" style={{ color: "var(--text-brand)", fontWeight: 600 }}>
          See all <I.arrowRight size={14} />
        </Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: 14 }}>
        {display.map((item) => {
          const daysLeft = daysUntilExpiry(item.expiry_date);
          return (
            <Link key={item.id} href="/inventory" style={{
              textAlign: "left", background: "var(--surface-canvas)",
              border: "1px solid var(--stroke-subtle)", borderRadius: "var(--r-xl)",
              padding: 18, display: "flex", flexDirection: "column", gap: 10,
              minHeight: 150, textDecoration: "none",
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
            </Link>
          );
        })}

        <Link href="/inventory" style={{
          background: "var(--surface-sunken)", border: "1px dashed var(--stroke-default)",
          borderRadius: "var(--r-xl)", padding: 18, minHeight: 150,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          gap: 8, color: "var(--text-secondary)", fontWeight: 600, fontSize: 13,
          textDecoration: "none", transition: "background var(--m-fast)",
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = "#D2C9B1"}
        onMouseLeave={(e) => e.currentTarget.style.background = "var(--surface-sunken)"}
        >
          <span style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--surface-canvas)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <I.arrowRight size={18} />
          </span>
          See full pantry
        </Link>
      </div>
    </section>
  );
}

function CookTonightCard() {
  const recipes = [
    { id: "r1", name: "Shrimp Fried Rice", minutes: 30, serves: 4, match: "all" },
    { id: "r2", name: "Cucumber Salad", minutes: 10, serves: 2, match: "all" },
  ];
  const recipe = recipes[0];
  return (
    <div className="card" style={{ background: "var(--surface-canvas)", display: "flex", flexDirection: "column", gap: 16 }}>
      <h3 className="t-heading-lg" style={{ margin: 0 }}>Cook Tonight</h3>
      <div className="recipe-img" style={{
        position: "relative", textAlign: "left", padding: 18, minHeight: 260,
        display: "flex", flexDirection: "column", justifyContent: "flex-end", color: "#fff", overflow: "hidden",
      }}>
        <span style={{ position: "absolute", top: 16, left: 16, fontSize: 11, color: "rgba(255,255,255,0.55)", letterSpacing: 0.5, textTransform: "uppercase", fontWeight: 600 }}>
          Recipe photo
        </span>
        <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
          <span style={{ background: "rgba(255,255,255,0.18)", backdropFilter: "blur(6px)", color: "#fff", borderRadius: 9999, padding: "4px 10px", fontSize: 11, fontWeight: 600 }}>
            All ingredients
          </span>
          <span style={{ background: "rgba(255,255,255,0.18)", backdropFilter: "blur(6px)", color: "#fff", borderRadius: 9999, padding: "4px 10px", fontSize: 11, fontWeight: 600 }}>
            {recipe.minutes} mins
          </span>
        </div>
        <h3 style={{ margin: 0, fontSize: 22, fontWeight: 700, lineHeight: 1.15 }}>{recipe.name}</h3>
      </div>
      <Link href="/recipes" className="btn btn-ghost btn-sm" style={{ alignSelf: "flex-end", color: "var(--text-brand)", fontWeight: 600, paddingRight: 0 }}>
        See all recipes <I.arrowRight size={14} />
      </Link>
    </div>
  );
}

function SmartGroceryCard({ groceryItems }) {
  const display = (groceryItems || []).slice(0, 5);
  return (
    <div className="card" style={{ background: "var(--surface-canvas)", display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <h3 className="t-heading-lg" style={{ margin: 0 }}>Smart Grocery</h3>
        <p style={{ margin: "4px 0 0", color: "var(--text-tertiary)", fontSize: 13 }}>
          {display.length > 0 ? `${display.length} items on your list` : "Your list is empty"}
        </p>
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {display.length === 0 && (
          <p style={{ color: "var(--text-tertiary)", fontSize: 14, margin: 0 }}>Nothing to buy yet.</p>
        )}
        {display.map((g) => (
          <div key={g.id} style={{
            width: "100%", display: "flex", alignItems: "center", gap: 14,
            padding: "12px 4px", borderBottom: "1px solid var(--stroke-subtle)",
          }}>
            <span style={{
              width: 22, height: 22, borderRadius: "50%",
              background: g.is_checked ? "var(--leaf-600)" : "transparent",
              border: g.is_checked ? "none" : "1.5px solid var(--stroke-default)",
              display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              {g.is_checked && <I.check size={14} stroke="#fff" strokeWidth={2.5} />}
            </span>
            <span style={{
              flex: 1, color: g.is_checked ? "var(--status-muted)" : "var(--text-primary)",
              textDecoration: g.is_checked ? "line-through" : "none", fontWeight: 500, fontSize: 15,
            }}>
              {g.item_name}
            </span>
          </div>
        ))}
      </div>
      <Link href="/groceries" className="btn btn-ghost btn-sm" style={{ alignSelf: "flex-end", color: "var(--text-brand)", fontWeight: 600, paddingRight: 0 }}>
        See full list <I.arrowRight size={14} />
      </Link>
    </div>
  );
}

function ProgressColumn() {
  return (
    <div className="card" style={{ background: "var(--surface-canvas)", display: "flex", flexDirection: "column", gap: 14 }}>
      <h3 className="t-heading-lg" style={{ margin: 0 }}>Your progress</h3>

      <div style={{
        position: "relative", textAlign: "left", width: "100%",
        background: "var(--leaf-400)", borderRadius: "var(--r-xl)",
        padding: "22px 24px", color: "var(--leaf-900)", overflow: "hidden",
      }}>
        <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 4, position: "relative" }}>You have saved $182</div>
        <div style={{ fontSize: 13, color: "rgba(46,59,31,0.7)", maxWidth: 280, position: "relative" }}>
          That's a family dinner at a decent restaurant, paid for by not wasting food.
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div className="card-sunken" style={{ position: "relative", padding: 22, overflow: "hidden" }}>
          <div style={{ marginTop: 28, color: "var(--leaf-800)", position: "relative" }}>
            <div style={{ fontWeight: 700, fontSize: 17, lineHeight: 1.2, marginBottom: 6 }}>Small habit,<br/>real impact.</div>
            <div style={{ fontSize: 12, color: "rgba(74,92,53,0.7)", lineHeight: 1.4 }}>You prevented 2.4kg of CO₂.</div>
          </div>
        </div>

        <div style={{ position: "relative", padding: 22, background: "var(--leaf-800)", borderRadius: "var(--r-xl)", color: "var(--text-inverse)", overflow: "hidden" }}>
          <div style={{ marginTop: 28, position: "relative" }}>
            <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 6 }}>You're in the top tier!</div>
            <div style={{ fontSize: 12, color: "rgba(245,238,220,0.55)", lineHeight: 1.4 }}>You waste 35% less than average.</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState(null);
  const [household, setHousehold] = useState(null);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [groceryItems, setGroceryItems] = useState([]);
  const [displayName, setDisplayName] = useState("there");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setUser(user);

      const { data: member } = await supabase
        .from("household_members").select("household_id, display_name")
        .eq("user_id", user.id).single();

      if (!member) { router.push("/household"); return; }

      setDisplayName(member.display_name || user.email?.split("@")[0] || "there");

      const { data: hh } = await supabase
        .from("households").select("*").eq("id", member.household_id).single();
      setHousehold(hh);

      const { data: items } = await supabase
        .from("food_items").select("*")
        .eq("household_id", member.household_id)
        .order("expiry_date", { ascending: true });
      setInventoryItems(items || []);

      const { data: grocery } = await supabase
        .from("grocery_list").select("*")
        .eq("household_id", member.household_id)
        .order("created_at", { ascending: false });
      setGroceryItems(grocery || []);

      setLoading(false);
    }
    load();
  }, []);

  const expiringSoon = inventoryItems.filter(i => daysUntilExpiry(i.expiry_date) <= 2);

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "var(--surface-canvas)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "var(--text-tertiary)" }}>Loading…</p>
    </div>
  );

  const firstName = displayName.split(" ")[0];

  return (
    <AppShell userInitial={firstName[0]?.toUpperCase() || "?"} userName={displayName}>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 13, color: "var(--text-tertiary)" }}>{household?.name || "Your household"}</span>
          <span style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--text-tertiary)" }} />
          <span style={{ fontSize: 13, color: "var(--text-tertiary)" }}>Today</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button className="btn btn-ghost btn-sm" style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--surface-canvas)" }} aria-label="Notifications">
            <I.bell size={18} />
          </button>
        </div>
      </div>

      <EaiHero userName={firstName} expiringSoon={expiringSoon} />

      <InventoryStrip items={inventoryItems} expiringSoon={expiringSoon} />

      <section style={{
        marginTop: 28,
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.05fr) minmax(0, 1.05fr)",
        gap: 16,
      }} className="dashboard-row">
        <CookTonightCard />
        <SmartGroceryCard groceryItems={groceryItems} />
        <ProgressColumn />
      </section>

      <style>{`
        @media (max-width: 1100px) { .dashboard-row { grid-template-columns: 1fr 1fr !important; } }
        @media (max-width: 760px)  { .dashboard-row { grid-template-columns: 1fr !important; } }
      `}</style>
    </AppShell>
  );
}
