// TabMark logo system.
// - Small mark used in sidebar (compact, deterministic)
// - Big "doodle" used on the NTP hero — picks a daily-seeded variant
//   so users get a small surprise each day, like Google's homepage doodles.
// All variants share the brand DNA: a stacked tab + bookmark glyph.

(function () {
  // Small sidebar mark — always the same.
  function TabMarkLogo({ size = 24, accent = "#D97757" }) {
    const s = size;
    return (
      <svg width={s} height={s} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        {/* Back tab */}
        <rect x="4" y="6" width="22" height="18" rx="3" fill="currentColor" opacity="0.18"/>
        {/* Front tab */}
        <rect x="6" y="9" width="22" height="18" rx="3" fill="currentColor" opacity="0.32"/>
        {/* Bookmark ribbon */}
        <path d="M19 9v11l3-2.4 3 2.4V9z" fill={accent}/>
      </svg>
    );
  }

  // Stable daily seed: YYYY-MM-DD → integer. So variant is consistent
  // through the day but rotates at midnight local time.
  function dailySeed() {
    const d = new Date();
    const key = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
    let h = 2166136261 ^ key;
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^ (h >>> 16)) >>> 0;
  }

  // ── Doodle variants ────────────────────────────────────────────────────
  // Each takes (size) and renders an ~Google-homepage-sized mark (~92px tall
  // typical). They're decorative riffs on the brand: tabs/bookmarks treated
  // playfully. Geometry only — no emoji, no AI-stock illustration vibes.

  // V1 — "Stack". Three offset tabs cascading like a deck of cards.
  function DoodleStack({ size, accent }) {
    return (
      <svg width={size * 2.4} height={size} viewBox="0 0 240 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <g transform="translate(20 14)">
          <rect x="0"  y="22" width="120" height="60" rx="6" fill="#000" opacity=".06"/>
          <rect x="14" y="14" width="120" height="60" rx="6" fill="#000" opacity=".10"/>
          <rect x="28" y="6"  width="140" height="68" rx="7" fill="currentColor"/>
          {/* tab strip */}
          <rect x="28" y="6" width="140" height="14" rx="7" fill="#000" opacity=".18"/>
          <circle cx="38" cy="13" r="3" fill="#fff" opacity=".55"/>
          <circle cx="48" cy="13" r="3" fill="#fff" opacity=".55"/>
          <circle cx="58" cy="13" r="3" fill="#fff" opacity=".55"/>
          {/* bookmark ribbon */}
          <path d="M180 0v80l16-12 16 12V0z" fill={accent}/>
        </g>
      </svg>
    );
  }

  // V2 — "Folded". Big bookmark-shaped wordmark with a tab indent.
  function DoodleFolded({ size, accent }) {
    return (
      <svg width={size * 2.6} height={size} viewBox="0 0 260 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <linearGradient id="tm-grad-folded" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor={accent}/>
            <stop offset="1" stopColor={accent} stopOpacity=".75"/>
          </linearGradient>
        </defs>
        <g transform="translate(20 8)">
          <path d="M0 0 H100 V14 Q108 14 108 22 V70 L70 50 L30 70 Z" fill="url(#tm-grad-folded)"/>
          <path d="M120 0 H220 V14 Q228 14 228 22 V70 L190 50 L150 70 Z" fill="currentColor" opacity=".85"/>
          <text x="50" y="48" textAnchor="middle" fontFamily="ui-sans-serif,system-ui" fontWeight="700" fontSize="28" fill="#fff">TM</text>
        </g>
      </svg>
    );
  }

  // V3 — "Tabline". A continuous tab strip spelling out the word with bookmark dots.
  function DoodleTabline({ size, accent }) {
    const letters = ["T", "a", "b", "M", "a", "r", "k"];
    return (
      <svg width={size * 4.2} height={size} viewBox="0 0 420 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        {letters.map((ch, i) => {
          const x = 14 + i * 56;
          const isAccent = i === 3; // M gets accent tab
          return (
            <g key={i}>
              <path d={`M${x} 30 Q${x} 14 ${x+14} 14 H${x+38} Q${x+50} 14 ${x+50} 30 V82 H${x} Z`}
                fill={isAccent ? accent : "currentColor"}
                opacity={isAccent ? 1 : (0.55 + (i % 2) * 0.2)}/>
              <text x={x + 25} y="62" textAnchor="middle" fontFamily="ui-sans-serif,system-ui"
                fontWeight="700" fontSize="26" fill="#fff">{ch}</text>
            </g>
          );
        })}
      </svg>
    );
  }

  // V4 — "Constellation". Tabs as nodes in a graph; bookmark star at the apex.
  function DoodleConstellation({ size, accent }) {
    const nodes = [[40,70],[90,40],[150,68],[200,32],[260,60],[310,38]];
    return (
      <svg width={size * 3.6} height={size} viewBox="0 0 360 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <g stroke="currentColor" strokeOpacity=".35" strokeWidth="1.5" fill="none">
          {nodes.slice(0, -1).map(([x1,y1], i) => {
            const [x2,y2] = nodes[i+1];
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}/>;
          })}
        </g>
        {nodes.map(([x,y], i) => (
          <g key={i}>
            <rect x={x-12} y={y-9} width="24" height="18" rx="3" fill="currentColor" opacity={0.5 + (i % 3) * 0.15}/>
            <rect x={x-10} y={y-7} width="20" height="3" rx="1" fill="#fff" opacity=".5"/>
          </g>
        ))}
        {/* Apex bookmark */}
        <path d="M195 8 L195 38 L210 28 L225 38 L225 8 Z" fill={accent}/>
      </svg>
    );
  }

  // V5 — "Bookrest". A row of bookmarks like books on a shelf.
  function DoodleBookrest({ size, accent }) {
    const colors = [accent, "currentColor", "currentColor", accent, "currentColor", "currentColor", accent];
    const heights = [60, 72, 50, 80, 64, 56, 68];
    const widths = [22, 28, 18, 30, 24, 20, 26];
    let x = 20;
    return (
      <svg width={size * 3.2} height={size} viewBox="0 0 320 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        {heights.map((h, i) => {
          const w = widths[i];
          const cx = x;
          x += w + 4;
          return (
            <g key={i}>
              <path d={`M${cx} ${88-h} H${cx+w} V${88} L${cx + w/2} ${82} L${cx} ${88} Z`}
                fill={colors[i]} opacity={colors[i] === accent ? 1 : (0.4 + (i % 3) * 0.2)}/>
            </g>
          );
        })}
        {/* Shelf */}
        <rect x="0" y="88" width="320" height="3" fill="currentColor" opacity=".5"/>
      </svg>
    );
  }

  // V6 — "Mono". Refined editorial: single big bookmark with a tab as the corner fold.
  function DoodleMono({ size, accent }) {
    return (
      <svg width={size * 1.5} height={size} viewBox="0 0 150 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M30 8 H106 Q120 8 120 22 V92 L75 64 L30 92 Z" fill={accent}/>
        <rect x="36" y="20" width="50" height="10" rx="2" fill="#fff" opacity=".55"/>
        <rect x="36" y="36" width="36" height="6" rx="2" fill="#fff" opacity=".4"/>
        <rect x="36" y="48" width="44" height="6" rx="2" fill="#fff" opacity=".4"/>
      </svg>
    );
  }

  const VARIANTS = [DoodleStack, DoodleFolded, DoodleTabline, DoodleConstellation, DoodleBookrest, DoodleMono];

  function TabMarkDoodle({ size = 90, accent = "#D97757", seed }) {
    const s = (seed != null ? seed : dailySeed());
    const Variant = VARIANTS[s % VARIANTS.length];
    return (
      <div style={{ color: "var(--fg)", display: "inline-flex" }}>
        <Variant size={size} accent={accent}/>
      </div>
    );
  }

  Object.assign(window, { TabMarkLogo, TabMarkDoodle });
})();
