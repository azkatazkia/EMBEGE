"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { AppShell } from "@/components/Sidebar";
import { I } from "@/components/Icons";
import { getFoodEmoji } from "@/lib/foodIcon";
import { buildRateMap, isAlertItem } from "@/lib/consumptionRate";

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

function EaiHero({ userName, alertItems }) {
  const [text, setText] = useState("");
  const router = useRouter();

  const earlyAlerts = alertItems.filter(i => i.isEarlyAlert);
  const topNames = alertItems.slice(0, 2).map(i => i.name);

  const headline = alertItems.length > 0
    ? `Hi, ${userName}! Use up your ${topNames.join(" and ")}${alertItems.length > 2 ? " and more" : ""} — they won't last.`
    : `Hi, ${userName}! Your pantry looks fresh.`;

  const body = alertItems.length > 0
    ? `I flagged ${alertItems.length} ${alertItems.length === 1 ? "item" : "items"} before ${alertItems.length === 1 ? "it goes" : "they go"} to waste. Tap any to get recipe ideas.`
    : "Nothing expiring soon. Ask e-ai what to cook this week.";

  const onSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    router.push("/eai");
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
        <span style={{ width: 30, height: 30, borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
          <img src="/eai-logo-green.png" width={30} height={15} alt="e-ai logo" />
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
          {headline}
        </div>
        <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.55, maxWidth: "78ch" }}>
          {body}
        </p>
      </div>

      {alertItems.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
          {alertItems.map(item => {
            const daysLeft = daysUntilExpiry(item.expiry_date);
            const label = daysLeft < 0 ? "expired" : daysLeft === 0 ? "today" : daysLeft === 1 ? "1 day" : `${daysLeft} days`;
            const dotColor = daysLeft <= 0 ? "#A32D2D" : daysLeft <= 3 ? "#C0392B" : "#BA7517";
            return (
              <button key={item.id} onClick={() => router.push("/eai")} style={{
                display: "inline-flex", alignItems: "center", gap: 7,
                background: "var(--surface-sunken)", border: "1px solid var(--stroke-subtle)",
                borderRadius: 9999, padding: "5px 12px 5px 8px",
                fontSize: 13, fontWeight: 500, color: "var(--text-primary)", cursor: "pointer",
              }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: dotColor, flexShrink: 0 }} />
                {getFoodEmoji(item.name)} {item.name} — {label}
                {item.isEarlyAlert && <span style={{ color: "#BA7517" }}>*</span>}
              </button>
            );
          })}
        </div>
      )}

      {earlyAlerts.length > 0 && (
        <p style={{ margin: "-6px 0 0", fontSize: 12, color: "var(--text-tertiary)" }}>
          * alerted early — your household uses {earlyAlerts.map(i => i.name).join(", ")} faster than average
        </p>
      )}

      <form onSubmit={onSubmit} style={{ position: "relative", marginTop: 4 }}>
        <input
          value={text} onChange={(e) => setText(e.target.value)}
          className="input-pill"
          style={{ paddingRight: 56, background: "var(--surface-sunken)" }}
          placeholder="Ask a follow-up — e.g. what can I cook with these tonight?"
        />
        <button type="submit" aria-label="Send to e-ai" style={{
          position: "absolute", right: 4, top: 4, bottom: 4, width: 36, borderRadius: "50%",
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
        <svg style={{ position: "absolute", right: -8, top: -10, opacity: 0.35 }} width="140" height="160" viewBox="0 0 140 160" fill="none">
          <path d="M120 10 C90 30, 110 70, 70 90 C30 110, 50 140, 20 150" stroke="var(--leaf-900)" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M100 25 C95 20, 105 18, 108 25 C111 32, 100 32, 100 25 Z" fill="var(--leaf-900)" fillOpacity="0.55"/>
        </svg>
        <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 4, position: "relative" }}>You have saved $182</div>
        <div style={{ fontSize: 13, color: "rgba(46,59,31,0.7)", maxWidth: 280, position: "relative" }}>
          That's a family dinner at a decent restaurant, paid for by not wasting food.
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div className="card-sunken" style={{ position: "relative", padding: 22, overflow: "hidden" }}>
          <svg style={{ position: "absolute", right: -10, top: 16, opacity: 0.5 }} width="90" height="100" viewBox="0 0 90 100" fill="none">
            <path d="M30 90 C20 70, 40 60, 30 40 C20 20, 40 10, 35 0" stroke="var(--leaf-800)" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M55 90 C45 70, 65 60, 55 40 C45 20, 65 10, 60 0" stroke="var(--leaf-800)" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <div style={{ marginTop: 28, color: "var(--leaf-800)", position: "relative" }}>
            <div style={{ fontWeight: 700, fontSize: 17, lineHeight: 1.2, marginBottom: 6 }}>Small habit,<br/>real impact.</div>
            <div style={{ fontSize: 12, color: "rgba(74,92,53,0.7)", lineHeight: 1.4 }}>You prevented 2.4kg of CO₂.</div>
          </div>
        </div>

        <div style={{ position: "relative", padding: 22, background: "var(--leaf-800)", borderRadius: "var(--r-xl)", color: "var(--text-inverse)", overflow: "hidden" }}>
          <svg style={{ position: "absolute", right: -8, top: 6, opacity: 0.25 }} width="100" height="110" viewBox="0 0 100 110" fill="none">
            <path d="M90 10 C70 20, 50 40, 30 70 C20 85, 25 100, 40 95" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
            <path d="M70 30 C65 25, 80 20, 82 32 C84 44, 70 38, 70 30 Z" fill="#fff" fillOpacity="0.4"/>
          </svg>
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
  const [rateMap, setRateMap] = useState(new Map());

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

      const { data: logs } = await supabase
        .from("consumption_log")
        .select("food_item_name, consumed_at, item_added_at")
        .eq("household_id", member.household_id);
      setRateMap(buildRateMap(logs || []));

      setLoading(false);
    }
    load();
  }, []);

  const alertItems = inventoryItems
    .map(item => {
      const { shouldAlert, isEarlyAlert } = isAlertItem(item, rateMap);
      return { ...item, isEarlyAlert, shouldAlert };
    })
    .filter(item => item.shouldAlert)
    .sort((a, b) => new Date(a.expiry_date) - new Date(b.expiry_date));

  const expiringSoon = alertItems;

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
          <Link href="/eai" className="btn btn-primary">
            <I.sparkle size={16} stroke="#fff" /> Ask e-ai
          </Link>
        </div>
      </div>

      <EaiHero userName={firstName}  alertItems={alertItems} />

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
