import { layoutScene, type Backdrop } from "@/lib/scene";

/** Painted SVG backdrops (400x240). Each returns the drawing for one setting. No downloads needed. */
function Art({ kind }: { kind: Backdrop }) {
  switch (kind) {
    case "night":
      return (
        <>
          <defs>
            <linearGradient id="sky-night" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#1e1b4b" />
              <stop offset="1" stopColor="#6d28d9" />
            </linearGradient>
          </defs>
          <rect width="400" height="240" fill="url(#sky-night)" />
          {[[40, 30], [110, 60], [170, 20], [250, 45], [320, 25], [360, 70], [80, 90], [290, 100]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 2.6 : 1.6} fill="#fef9c3" />
          ))}
          <circle cx="330" cy="50" r="22" fill="#fef3c7" />
          <circle cx="340" cy="44" r="20" fill="#4c1d95" opacity="0.35" />
          <path d="M0 190 Q100 150 200 185 T400 170 V240 H0Z" fill="#14532d" />
          <path d="M0 210 Q120 180 240 208 T400 200 V240 H0Z" fill="#166534" />
        </>
      );
    case "sea":
      return (
        <>
          <defs>
            <linearGradient id="sky-sea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#7dd3fc" />
              <stop offset="1" stopColor="#e0f2fe" />
            </linearGradient>
            <linearGradient id="water-sea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#38bdf8" />
              <stop offset="1" stopColor="#0369a1" />
            </linearGradient>
          </defs>
          <rect width="400" height="240" fill="url(#sky-sea)" />
          <circle cx="60" cy="50" r="26" fill="#fde047" />
          <ellipse cx="260" cy="55" rx="40" ry="14" fill="#fff" opacity="0.9" />
          <ellipse cx="290" cy="45" rx="26" ry="12" fill="#fff" opacity="0.9" />
          <rect y="120" width="400" height="120" fill="url(#water-sea)" />
          <path d="M0 140 Q25 128 50 140 T100 140 T150 140 T200 140 T250 140 T300 140 T350 140 T400 140" fill="none" stroke="#fff" strokeWidth="3" opacity="0.6" />
          <path d="M0 175 Q25 163 50 175 T100 175 T150 175 T200 175 T250 175 T300 175 T350 175 T400 175" fill="none" stroke="#fff" strokeWidth="3" opacity="0.4" />
        </>
      );
    case "space":
      return (
        <>
          <defs>
            <radialGradient id="sky-space" cx="0.5" cy="0.4" r="0.8">
              <stop offset="0" stopColor="#312e81" />
              <stop offset="1" stopColor="#020617" />
            </radialGradient>
          </defs>
          <rect width="400" height="240" fill="url(#sky-space)" />
          {[[30, 40], [90, 20], [150, 70], [220, 30], [280, 80], [350, 35], [60, 110], [320, 120], [190, 110]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={i % 2 ? 1.5 : 2.4} fill="#fff" />
          ))}
          <circle cx="340" cy="60" r="28" fill="#60a5fa" />
          <path d="M320 55 Q340 40 358 62 Q340 70 320 55Z" fill="#4ade80" />
          <path d="M0 200 Q100 170 200 195 T400 185 V240 H0Z" fill="#94a3b8" />
          <ellipse cx="80" cy="212" rx="18" ry="5" fill="#64748b" />
          <ellipse cx="270" cy="220" rx="26" ry="6" fill="#64748b" />
        </>
      );
    case "forest":
      return (
        <>
          <defs>
            <linearGradient id="sky-forest" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#bbf7d0" />
              <stop offset="1" stopColor="#fef9c3" />
            </linearGradient>
          </defs>
          <rect width="400" height="240" fill="url(#sky-forest)" />
          {[20, 90, 170, 250, 330].map((x, i) => (
            <g key={x}>
              <rect x={x + 14} y={110 + (i % 2) * 10} width="12" height="70" fill="#92400e" />
              <circle cx={x + 20} cy={95 + (i % 2) * 10} r="38" fill={i % 2 ? "#16a34a" : "#22c55e"} />
              <circle cx={x + 2} cy={115 + (i % 2) * 10} r="26" fill="#15803d" opacity="0.8" />
            </g>
          ))}
          <path d="M0 180 Q100 160 200 178 T400 170 V240 H0Z" fill="#4d7c0f" />
          <path d="M120 240 Q200 190 280 240Z" fill="#d6b88a" />
        </>
      );
    case "garden":
      return (
        <>
          <defs>
            <linearGradient id="sky-garden" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#bae6fd" />
              <stop offset="1" stopColor="#f0fdf4" />
            </linearGradient>
          </defs>
          <rect width="400" height="240" fill="url(#sky-garden)" />
          <circle cx="340" cy="45" r="24" fill="#fde047" />
          <path d="M0 175 Q100 150 200 172 T400 165 V240 H0Z" fill="#65a30d" />
          <rect y="190" width="400" height="50" fill="#78350f" />
          {[30, 80, 130, 190, 250, 310, 360].map((x, i) => (
            <g key={x}>
              <line x1={x} y1="190" x2={x} y2={165 - (i % 3) * 8} stroke="#15803d" strokeWidth="3" />
              <circle cx={x} cy={160 - (i % 3) * 8} r="7" fill={["#f472b6", "#fb923c", "#facc15", "#c084fc"][i % 4]} />
            </g>
          ))}
        </>
      );
    case "storm":
      return (
        <>
          <defs>
            <linearGradient id="sky-storm" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#334155" />
              <stop offset="1" stopColor="#94a3b8" />
            </linearGradient>
          </defs>
          <rect width="400" height="240" fill="url(#sky-storm)" />
          <ellipse cx="90" cy="45" rx="70" ry="26" fill="#1e293b" />
          <ellipse cx="260" cy="35" rx="85" ry="28" fill="#0f172a" />
          <path d="M215 60 L195 105 L215 105 L200 150 L240 90 L220 90 L235 60Z" fill="#fde047" />
          <path d="M0 195 Q100 175 200 192 T400 182 V240 H0Z" fill="#365314" />
          {[30, 120, 200, 290, 360].map((x, i) => (
            <line key={x} x1={x} y1={90 + i * 6} x2={x - 8} y2={115 + i * 6} stroke="#bfdbfe" strokeWidth="2" opacity="0.8" />
          ))}
        </>
      );
    case "rain":
      return (
        <>
          <rect width="400" height="240" fill="#e0e7ff" />
          <ellipse cx="200" cy="40" rx="120" ry="26" fill="#a5b4fc" />
          <path d="M0 190 Q100 170 200 188 T400 178 V240 H0Z" fill="#4ade80" />
          <path d="M60 130 Q200 20 340 130" fill="none" stroke="#ef4444" strokeWidth="8" />
          <path d="M70 130 Q200 35 330 130" fill="none" stroke="#facc15" strokeWidth="8" />
          <path d="M80 130 Q200 50 320 130" fill="none" stroke="#3b82f6" strokeWidth="8" />
        </>
      );
    case "sunset":
      return (
        <>
          <defs>
            <linearGradient id="sky-sunset" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#f472b6" />
              <stop offset="0.6" stopColor="#fb923c" />
              <stop offset="1" stopColor="#fde68a" />
            </linearGradient>
          </defs>
          <rect width="400" height="240" fill="url(#sky-sunset)" />
          <circle cx="200" cy="130" r="40" fill="#fef08a" />
          <rect y="150" width="400" height="90" fill="#0e7490" />
          <path d="M150 160 H250 M165 175 H235 M180 190 H220" stroke="#fef08a" strokeWidth="4" strokeLinecap="round" opacity="0.8" />
        </>
      );
    case "island":
      return (
        <>
          <defs>
            <linearGradient id="sky-island" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#67e8f9" />
              <stop offset="1" stopColor="#ecfeff" />
            </linearGradient>
          </defs>
          <rect width="400" height="240" fill="url(#sky-island)" />
          <circle cx="330" cy="45" r="24" fill="#fde047" />
          <rect y="130" width="400" height="110" fill="#0ea5e9" />
          <ellipse cx="200" cy="170" rx="130" ry="34" fill="#fcd34d" />
          <ellipse cx="200" cy="162" rx="100" ry="24" fill="#86efac" />
          <rect x="240" y="95" width="8" height="60" fill="#92400e" />
          <path d="M244 98 Q214 78 196 96 M244 98 Q270 76 292 94 M244 98 Q244 70 250 66" fill="none" stroke="#16a34a" strokeWidth="6" strokeLinecap="round" />
        </>
      );
    case "home":
      return (
        <>
          <rect width="400" height="240" fill="#fef3c7" />
          <rect x="40" y="30" width="90" height="80" rx="6" fill="#bae6fd" stroke="#92400e" strokeWidth="6" />
          <line x1="85" y1="30" x2="85" y2="110" stroke="#92400e" strokeWidth="4" />
          <line x1="40" y1="70" x2="130" y2="70" stroke="#92400e" strokeWidth="4" />
          <rect x="260" y="40" width="90" height="60" rx="6" fill="#fda4af" />
          <rect y="180" width="400" height="60" fill="#b45309" />
          <rect y="180" width="400" height="8" fill="#92400e" />
        </>
      );
    case "meadow":
    default:
      return (
        <>
          <defs>
            <linearGradient id="sky-meadow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#7dd3fc" />
              <stop offset="1" stopColor="#e0f2fe" />
            </linearGradient>
          </defs>
          <rect width="400" height="240" fill="url(#sky-meadow)" />
          <circle cx="60" cy="48" r="26" fill="#fde047" />
          <ellipse cx="250" cy="50" rx="46" ry="15" fill="#fff" />
          <ellipse cx="282" cy="42" rx="28" ry="12" fill="#fff" />
          <path d="M0 170 Q100 130 200 165 T400 150 V240 H0Z" fill="#84cc16" />
          <path d="M0 200 Q120 170 240 198 T400 190 V240 H0Z" fill="#65a30d" />
        </>
      );
  }
}

/**
 * One picture-book illustration: a painted backdrop with the page's characters standing on it.
 * The emoji are decoration, so the whole picture is hidden from screen readers (the text is on the page).
 */
export default function SceneArt({ backdrop, scene, className = "" }: { backdrop: Backdrop; scene: string; className?: string }) {
  const items = layoutScene(scene);
  return (
    <div className={`relative aspect-[5/3] w-full overflow-hidden ${className}`} aria-hidden="true">
      <svg viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
        <Art kind={backdrop} />
      </svg>
      {items.map((it, i) => (
        <span
          key={i}
          className={`absolute -translate-x-1/2 -translate-y-1/2 select-none leading-none drop-shadow-lg ${it.sky ? "animate-float" : "animate-pop"}`}
          style={{ left: `${it.x}%`, top: `${it.y}%`, fontSize: `calc(${it.size} * clamp(2.4rem, 8.5vw, 4.6rem))`, animationDelay: `${i * 120}ms` }}
        >
          {it.emoji}
        </span>
      ))}
    </div>
  );
}
