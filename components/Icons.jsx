"use client";

function Icon({ size = 20, stroke = "currentColor", strokeWidth = 1.5, fill = "none", children, style, className }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export const I = {
  home:        (p) => <Icon {...p}><path d="M3 10.5L12 3l9 7.5"/><path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5"/></Icon>,
  box:         (p) => <Icon {...p}><path d="M3 7l9-4 9 4-9 4-9-4z"/><path d="M3 7v10l9 4 9-4V7"/><path d="M12 11v10"/></Icon>,
  utensils:    (p) => <Icon {...p}><path d="M3 2v7a3 3 0 0 0 3 3h0a3 3 0 0 0 3-3V2"/><path d="M6 12v10"/><path d="M17 2c-2 0-4 1.5-4 5v4h3v11"/></Icon>,
  cart:        (p) => <Icon {...p}><path d="M3 4h2l2.5 12.5a2 2 0 0 0 2 1.5h8a2 2 0 0 0 2-1.5L21 8H6"/><circle cx="10" cy="20" r="1"/><circle cx="18" cy="20" r="1"/></Icon>,
  users:       (p) => <Icon {...p}><circle cx="9" cy="8" r="3.5"/><path d="M3 20c0-3 2.5-5 6-5s6 2 6 5"/><path d="M16 11a3 3 0 1 0 0-6"/><path d="M17 20c0-2-1-3.5-2.5-4.5"/></Icon>,
  sparkle:     (p) => <Icon {...p}><path d="M12 3l1.8 4.7L18.5 9.5 14 11.4 12 16l-2-4.6L5.5 9.5l4.7-1.8L12 3z"/><path d="M19 14l.7 1.8L21.5 16.5l-1.8.7L19 19l-.7-1.8L16.5 16.5l1.8-.7L19 14z"/></Icon>,
  search:      (p) => <Icon {...p}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></Icon>,
  plus:        (p) => <Icon {...p}><path d="M12 5v14M5 12h14"/></Icon>,
  filter:      (p) => <Icon {...p}><path d="M4 5h16M7 12h10M10 19h4"/></Icon>,
  bell:        (p) => <Icon {...p}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10 21a2 2 0 0 0 4 0"/></Icon>,
  arrowOut:    (p) => <Icon {...p}><path d="M7 17 17 7"/><path d="M8 7h9v9"/></Icon>,
  arrowRight:  (p) => <Icon {...p}><path d="M5 12h14M13 5l7 7-7 7"/></Icon>,
  arrowLeft:   (p) => <Icon {...p}><path d="M19 12H5M11 5l-7 7 7 7"/></Icon>,
  chevronRight:(p) => <Icon {...p}><path d="m9 6 6 6-6 6"/></Icon>,
  chevronDown: (p) => <Icon {...p}><path d="m6 9 6 6 6-6"/></Icon>,
  send:        (p) => <Icon {...p}><path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4 20-7z"/></Icon>,
  scan:        (p) => <Icon {...p}><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><path d="M7 8h10M7 12h10M7 16h6"/></Icon>,
  pencil:      (p) => <Icon {...p}><path d="M14 4l6 6L8 22H2v-6L14 4z"/><path d="M12 6l6 6"/></Icon>,
  trash:       (p) => <Icon {...p}><path d="M4 7h16"/><path d="M10 11v6M14 11v6"/><path d="M5 7l1 13a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-13"/><path d="M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3"/></Icon>,
  fridge:      (p) => <Icon {...p}><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M5 10h14"/><path d="M8 5v3M8 13v4"/></Icon>,
  freezer:     (p) => <Icon {...p}><circle cx="12" cy="12" r="2"/><path d="M12 2v20M2 12h20M5 5l14 14M19 5 5 19"/></Icon>,
  pantry:      (p) => <Icon {...p}><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M12 3v18"/></Icon>,
  camera:      (p) => <Icon {...p}><path d="M3 8h3l2-3h8l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13" r="4"/></Icon>,
  check:       (p) => <Icon {...p}><path d="M5 12.5 10 17l9-10"/></Icon>,
  clock:       (p) => <Icon {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></Icon>,
  leaf:        (p) => <Icon {...p}><path d="M5 21c0-8 6-14 16-15-1 9-7 15-16 15z"/><path d="M5 21c4-4 8-7 14-13"/></Icon>,
  x:           (p) => <Icon {...p}><path d="M6 6l12 12M18 6 6 18"/></Icon>,
  copy:        (p) => <Icon {...p}><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></Icon>,
  logout:      (p) => <Icon {...p}><path d="M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4"/><path d="M10 17l-5-5 5-5M15 12H4"/></Icon>,
  receipt:     (p) => <Icon {...p}><path d="M5 3h14v18l-3-2-3 2-3-2-3 2-2-2V3z"/><path d="M9 7h6M9 11h6M9 15h4"/></Icon>,
  bowl:        (p) => <Icon {...p}><path d="M3 11h18a9 9 0 0 1-18 0z"/><path d="M5 21h14"/><circle cx="9" cy="6" r="1.5"/><circle cx="14" cy="4" r="1.2"/></Icon>,
};

export function Logo({ size = 28, invert = false }) {
  return (
    <img
      src="/embege-logo.png"
      width={size}
      height={size}
      alt="Embege"
      aria-label="Embege"
      style={{
        objectFit: "contain",
        filter: invert ? "invert(1)" : "none",
      }}
    />
  );
}
