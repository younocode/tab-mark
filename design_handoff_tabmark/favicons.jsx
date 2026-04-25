// favicons.jsx — colored letter-tile favicons (no external assets)

const FAVICON_COLORS = {
  github: ["#24292e", "#fff"],
  stackoverflow: ["#f48024", "#fff"],
  mdn: ["#000", "#fff"],
  arxiv: ["#b31b1b", "#fff"],
  scholar: ["#4285f4", "#fff"],
  figma: ["#0acf83", "#fff"],
  dribbble: ["#ea4c89", "#fff"],
  gdocs: ["#4285f4", "#fff"],
  gsheets: ["#0f9d58", "#fff"],
  notion: ["#191919", "#fff"],
  linear: ["#5e6ad2", "#fff"],
  hn: ["#ff6600", "#fff"],
  twitter: ["#000", "#fff"],
  gmail: ["#ea4335", "#fff"],
  webdev: ["#1a73e8", "#fff"],
  excalidraw: ["#6965db", "#fff"],
  youtube: ["#ff0000", "#fff"],
  react: ["#149eca", "#fff"],
  ts: ["#3178c6", "#fff"],
  tailwind: ["#06b6d4", "#fff"],
  chrome: ["#4285f4", "#fff"],
  raycast: ["#ff6363", "#fff"],
  vercel: ["#000", "#fff"],
  openai: ["#0e8264", "#fff"],
  claude: ["#cc785c", "#fff"],
  cursor: ["#000", "#fff"],
  posthog: ["#1d4aff", "#fff"],
  overreacted: ["#222", "#fff"],
  grug: ["#7a5e3a", "#fff"],
  generic: ["oklch(0.78 0.04 60)", "oklch(0.35 0.02 60)"],
};

function Favicon({ name, domain, size = 16, radius = 4 }) {
  const [bg, fg] = FAVICON_COLORS[name] || FAVICON_COLORS.generic;
  const letter = (domain || name || "?").replace(/^www\./, "")[0]?.toUpperCase() || "?";
  return (
    <div style={{
      width: size, height: size, borderRadius: radius,
      background: bg, color: fg,
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      fontSize: Math.round(size * 0.58), fontWeight: 700,
      flexShrink: 0,
      fontFamily: "ui-sans-serif, system-ui, sans-serif",
      letterSpacing: "-0.02em",
    }}>{letter}</div>
  );
}

// TabMark logo: two stacked offset rounded rectangles — a tab and a bookmark
function TabMarkLogo({ size = 22, accent = "#d49a3a" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="4" width="14" height="11" rx="2.5" fill="currentColor" opacity="0.18"/>
      <rect x="3" y="4" width="14" height="11" rx="2.5" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M9 9h5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M14 8 L21 8 L21 21 L17.5 18.5 L14 21 Z" fill={accent} stroke={accent} strokeWidth="1.4" strokeLinejoin="round"/>
    </svg>
  );
}

Object.assign(window, { Favicon, TabMarkLogo });
