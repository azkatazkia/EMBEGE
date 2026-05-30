import Link from "next/link";
import { Logo } from "@/components/Icons";

function AuthSideArt({ headline, sub }: { headline: string; sub: string }) {
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Logo size={28} />
        <span style={{ fontWeight: 700, fontSize: 18 }}>embege</span>
      </div>

      <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 28 }}>
        <svg style={{ position: "absolute", right: -60, top: -80, opacity: 0.2 }} width="340" height="340" viewBox="0 0 340 340" fill="none">
          <path d="M310 30 C220 60, 140 120, 70 230 C30 290, 80 320, 130 290" stroke="var(--leaf-400)" strokeWidth="2" strokeLinecap="round" fill="none"/>
          <path d="M240 80 C220 70, 260 60, 264 88 C268 116, 230 102, 240 80 Z" fill="var(--leaf-400)" fillOpacity="0.5"/>
          <path d="M180 150 C160 140, 200 130, 204 158 C208 186, 170 172, 180 150 Z" fill="var(--leaf-400)" fillOpacity="0.5"/>
          <path d="M120 220 C100 210, 140 200, 144 228 C148 256, 110 242, 120 220 Z" fill="var(--leaf-400)" fillOpacity="0.5"/>
        </svg>
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
        borderRadius: "var(--r-xl)",
        padding: 20,
        display: "flex", alignItems: "center", gap: 16,
      }}>
        <span style={{
          width: 44, height: 44, borderRadius: "50%", background: "var(--leaf-400)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--leaf-900)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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

export default function WelcomePage() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "grid",
      gridTemplateColumns: "minmax(0, 480px) 1fr",
      background: "var(--surface-canvas)",
    }}>

      <div style={{ padding: "40px 56px", display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Logo size={28} color="var(--leaf-800)" />
          <span style={{ fontWeight: 700, fontSize: 18 }}>embege</span>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", maxWidth: 380, gap: 28 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 40, lineHeight: 1.1, marginBottom: 12, letterSpacing: -0.5, fontWeight: 700 }}>
              Welcome to embege.
            </h1>
            <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: 16, lineHeight: 1.55 }}>
              A kinder kitchen, shared with the people you live with. Cook what's about to expire and never re-buy what you already have.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Link href="/signup" className="btn btn-primary btn-lg btn-block">
              Create your household
            </Link>
            <Link href="/login" className="btn btn-secondary btn-lg btn-block">
              I already have an account
            </Link>
          </div>

          <div style={{ display: "flex", gap: 22, fontSize: 12, color: "var(--text-tertiary)", flexWrap: "wrap" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><path d="M7 8h10M7 12h10M7 16h6"/></svg>
              Scan receipts
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.8 4.7L18.5 9.5 14 11.4 12 16l-2-4.6L5.5 9.5l4.7-1.8L12 3z"/></svg>
              e-ai chef
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3.5"/><path d="M3 20c0-3 2.5-5 6-5s6 2 6 5"/><path d="M16 11a3 3 0 1 0 0-6"/><path d="M17 20c0-2-1-3.5-2.5-4.5"/></svg>
              Shared household
            </span>
          </div>
        </div>

        <p style={{ margin: 0, color: "var(--text-tertiary)", fontSize: 12 }}>
          By continuing you agree to our terms — we don&apos;t sell your data.
        </p>
      </div>

      <div style={{
        position: "relative",
        background: "var(--leaf-800)",
        margin: 20, marginLeft: 0,
        borderRadius: "var(--r-3xl)",
        overflow: "hidden",
        padding: 48,
        display: "flex", flexDirection: "column", justifyContent: "space-between",
        color: "var(--text-inverse)",
      }}>
        <AuthSideArt
          headline="Less waste. More dinner together."
          sub="embege keeps track of what's in your kitchen, who bought it, and what to cook before it goes bad — together with the people you live with."
        />
      </div>

      <style>{`
        @media (max-width: 900px) {
          div[style*="grid-template-columns: minmax(0, 480px)"] {
            grid-template-columns: 1fr;
          }
          div[style*="margin: 20px"] { display: none; }
        }
      `}</style>
    </div>
  );
}
