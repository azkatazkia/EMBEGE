"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { I, Logo } from "./Icons";
import { createClient } from "@/lib/supabase";

const NAV_ITEMS = [
  { id: "dashboard",  label: "Home",      Icon: I.home,     href: "/dashboard" },
  { id: "inventory",  label: "Inventory", Icon: I.box,      href: "/inventory" },
  { id: "recipes",    label: "Recipes",   Icon: I.utensils, href: "/recipes" },
  { id: "groceries",  label: "Grocery",   Icon: I.cart,     href: "/groceries" },
  { id: "household",  label: "Household", Icon: I.users,    href: "/household" },
  { id: "eai",        label: "e-ai",      Icon: I.sparkle,  href: "/eai" },
];

export function Sidebar({ userInitial = "B", userName = "You" }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div
      className="hide-on-mobile sidebar-host"
      style={{ position: "sticky", top: 20, width: 86, height: "calc(100vh - 40px)", zIndex: 40 }}
    >
      <aside
        className="sidebar"
        style={{
          position: "absolute", top: 0, left: 0,
          background: "var(--surface-ink)",
          borderRadius: "var(--r-3xl)",
          padding: "24px 18px",
          display: "flex", flexDirection: "column", gap: 20,
          width: 86, height: "100%",
          overflow: "hidden",
          transition: "width var(--m-base), box-shadow var(--m-base)",
        }}
      >

        <Link
          href="/dashboard"
          aria-label="Embege home"
          className="sidebar-row"
          style={{ display: "flex", alignItems: "center", gap: 14, color: "#fff", padding: "0 4px", marginBottom: 4 }}
        >
          <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 28, flexShrink: 0 }}>
            <Logo size={26} invert />
          </span>
          <span className="sidebar-label" style={{ fontWeight: 700, fontSize: 17, letterSpacing: 0.5 }}>embege</span>
        </Link>

        <Link
          href="/profile"
          aria-label="Profile"
          className="sidebar-row"
          style={{
            display: "flex", alignItems: "center", gap: 14,
            padding: "4px", borderRadius: 12,
            transition: "background var(--m-fast)",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
        >
          <span style={{
            width: 36, height: 36, borderRadius: "50%",
            background: "var(--leaf-800)", color: "white",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, fontWeight: 700, flexShrink: 0,
            boxShadow: pathname === "/profile" ? "0 0 0 2px var(--leaf-400)" : "none",
            transition: "box-shadow var(--m-fast)",
          }}>
            {userInitial}
          </span>
          <span className="sidebar-label" style={{ display: "flex", flexDirection: "column", textAlign: "left", minWidth: 0 }}>
            <span style={{ color: "#fff", fontWeight: 600, fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {userName}
            </span>
            <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, whiteSpace: "nowrap" }}>View profile</span>
          </span>
        </Link>

        <div style={{ width: "100%", height: 1, background: "rgba(255,255,255,0.08)" }} />

        <nav style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
          {NAV_ITEMS.map(({ id, label, Icon, href }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={id}
                href={href}
                aria-label={label}
                aria-current={active ? "page" : undefined}
                className="sidebar-row"
                style={{
                  position: "relative",
                  display: "flex", alignItems: "center", gap: 14,
                  height: 44, padding: "0 4px", borderRadius: 12,
                  color: active ? "#fff" : "rgba(255,255,255,0.55)",
                  background: active ? "rgba(110,133,81,0.18)" : "transparent",
                  transition: "color var(--m-fast), background var(--m-fast)",
                  textDecoration: "none",
                }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = "rgba(255,255,255,0.9)"; }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = "rgba(255,255,255,0.55)"; }}
              >
                {active && (
                  <span style={{
                    position: "absolute", left: -18, top: 11, bottom: 11,
                    width: 3, borderRadius: 2, background: "var(--leaf-400)",
                  }} />
                )}
                <span style={{ width: 36, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon size={22} strokeWidth={1.8} />
                </span>
                <span className="sidebar-label" style={{ fontSize: 14, fontWeight: 500, whiteSpace: "nowrap" }}>{label}</span>
              </Link>
            );
          })}
        </nav>

        <button
          onClick={handleLogout}
          aria-label="Log out"
          className="sidebar-row"
          style={{
            display: "flex", alignItems: "center", gap: 14,
            height: 44, padding: "0 4px", borderRadius: 12,
            color: "rgba(255,255,255,0.45)",
            background: "transparent", border: "none", cursor: "pointer", width: "100%",
            transition: "color var(--m-fast)",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "rgba(255,100,100,0.85)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.45)"; }}
        >
          <span style={{ width: 36, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <I.logout size={22} strokeWidth={1.8} />
          </span>
          <span className="sidebar-label" style={{ fontSize: 14, fontWeight: 500, whiteSpace: "nowrap" }}>Log out</span>
        </button>

        <div className="sidebar-label" style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", padding: "0 4px", whiteSpace: "nowrap" }}>
          v0.1 · prototype
        </div>
      </aside>
    </div>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  const items = NAV_ITEMS.slice(0, 5);
  return (
    <>
      <nav className="bottom-nav">
        {items.map(({ id, label, Icon, href }) => {
          const active = pathname.startsWith(href);
          return (
            <Link key={id} href={href} className={`bn-item ${active ? "active" : ""}`} style={{ textDecoration: "none" }}>
              <Icon size={22} strokeWidth={active ? 2 : 1.6} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
      <Link href="/eai" className="bn-fab" aria-label="Ask e-ai">
        <I.sparkle size={24} stroke="#fff" strokeWidth={1.8} />
      </Link>
    </>
  );
}

export function AppShell({ children, userInitial, userName }) {
  return (
    <div className="app-shell">
      <Sidebar userInitial={userInitial} userName={userName} />
      <main className="app-main">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
