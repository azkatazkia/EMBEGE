import { Logo } from "@/components/Icons";

export default function AuthSideArt({ headline, sub }) {
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
  