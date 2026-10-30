import type { CharacterKind } from "@/lib/game";

/**
 * Original, code-drawn character art for the world guides.
 * Every guide is rendered through this one component, so professionally illustrated
 * artwork can replace it later without touching any page.
 * The art is decorative (the guide's name is always shown as text), so it is aria-hidden.
 */

const INK = "#1f2937";

/** Simple friendly eyes with a highlight. */
function Eyes({ x1, x2, y, r = 4.5 }: { x1: number; x2: number; y: number; r?: number }) {
  return (
    <g>
      {[x1, x2].map((x) => (
        <g key={x}>
          <circle cx={x} cy={y} r={r} fill={INK} />
          <circle cx={x + r * 0.35} cy={y - r * 0.35} r={r * 0.35} fill="#fff" />
        </g>
      ))}
    </g>
  );
}

function Smile({ cx, y, w = 12 }: { cx: number; y: number; w?: number }) {
  return (
    <path
      d={`M${cx - w / 2} ${y} Q${cx} ${y + w * 0.7} ${cx + w / 2} ${y}`}
      fill="none" stroke={INK} strokeWidth="2.5" strokeLinecap="round"
    />
  );
}

function Cheeks({ x1, x2, y, color = "#fb7185" }: { x1: number; x2: number; y: number; color?: string }) {
  return (
    <g opacity="0.45" fill={color}>
      <circle cx={x1} cy={y} r="4.5" />
      <circle cx={x2} cy={y} r="4.5" />
    </g>
  );
}

function Bear() {
  return (
    <g>
      <circle cx="26" cy="27" r="11" fill="#f472b6" />
      <circle cx="74" cy="27" r="11" fill="#f472b6" />
      <circle cx="26" cy="27" r="5.5" fill="#fbcfe8" />
      <circle cx="74" cy="27" r="5.5" fill="#fbcfe8" />
      <ellipse cx="50" cy="78" rx="26" ry="20" fill="#f472b6" />
      <ellipse cx="50" cy="80" rx="15" ry="12" fill="#fbcfe8" />
      <circle cx="50" cy="46" r="29" fill="#f472b6" />
      <ellipse cx="50" cy="55" rx="14" ry="10.5" fill="#fbcfe8" />
      <ellipse cx="50" cy="51" rx="5" ry="3.5" fill={INK} />
      <Eyes x1={39} x2={61} y={42} />
      <Smile cx={50} y={57} w={12} />
      <Cheeks x1={31} x2={69} y={53} />
      <ellipse cx="37" cy="30" rx="6" ry="3" fill="#fff" opacity="0.4" transform="rotate(-25 37 30)" />
    </g>
  );
}

function Penguin() {
  return (
    <g>
      <ellipse cx="38" cy="93" rx="10" ry="4.5" fill="#fb923c" />
      <ellipse cx="62" cy="93" rx="10" ry="4.5" fill="#fb923c" />
      <path d="M22 62 Q8 72 14 84 Q24 78 26 66Z" fill="#1e3a8a" />
      <path d="M78 62 Q92 72 86 84 Q76 78 74 66Z" fill="#1e3a8a" />
      <ellipse cx="50" cy="60" rx="29" ry="34" fill="#1e3a8a" />
      <ellipse cx="50" cy="66" rx="19" ry="26" fill="#fff" />
      <ellipse cx="50" cy="38" rx="25" ry="22" fill="#1e3a8a" />
      <ellipse cx="50" cy="44" rx="18" ry="14" fill="#fff" />
      <Eyes x1={42} x2={58} y={40} r={3.8} />
      <path d="M43 48 L57 48 L50 57Z" fill="#fb923c" />
      <path d="M26 58 Q50 70 74 58 L74 66 Q50 78 26 66Z" fill="#ef4444" />
      <path d="M62 66 L70 82 L60 80 L56 70Z" fill="#dc2626" />
      <Cheeks x1={35} x2={65} y={47} />
    </g>
  );
}

function Robot() {
  return (
    <g>
      <line x1="50" y1="8" x2="50" y2="20" stroke="#6366f1" strokeWidth="3" />
      <circle cx="50" cy="8" r="5" fill="#fbbf24" />
      <rect x="10" y="38" width="9" height="20" rx="4" fill="#818cf8" />
      <rect x="81" y="38" width="9" height="20" rx="4" fill="#818cf8" />
      <rect x="24" y="68" width="52" height="26" rx="8" fill="#6366f1" />
      <circle cx="50" cy="81" r="6" fill="#fbbf24" />
      <rect x="18" y="20" width="64" height="52" rx="14" fill="#c7d2fe" />
      <rect x="25" y="29" width="50" height="28" rx="9" fill="#312e81" />
      <circle cx="38" cy="43" r="6" fill="#22d3ee" />
      <circle cx="62" cy="43" r="6" fill="#22d3ee" />
      <circle cx="40" cy="41" r="2" fill="#fff" />
      <circle cx="64" cy="41" r="2" fill="#fff" />
      <rect x="35" y="62" width="30" height="5" rx="2.5" fill="#6366f1" />
      <g stroke="#c7d2fe" strokeWidth="1.5">
        <line x1="42" y1="62" x2="42" y2="67" />
        <line x1="50" y1="62" x2="50" y2="67" />
        <line x1="58" y1="62" x2="58" y2="67" />
      </g>
    </g>
  );
}

function Parrot() {
  return (
    <g>
      <path d="M34 80 Q22 98 30 100 Q40 92 44 82Z" fill="#2563eb" />
      <ellipse cx="50" cy="68" rx="24" ry="28" fill="#ef4444" />
      <ellipse cx="50" cy="74" rx="14" ry="19" fill="#fca5a5" />
      <path d="M26 62 Q10 76 20 90 Q34 82 34 66Z" fill="#facc15" />
      <path d="M22 76 Q14 84 20 90 Q28 86 30 78Z" fill="#2563eb" />
      <circle cx="50" cy="38" r="22" fill="#ef4444" />
      <ellipse cx="50" cy="42" rx="15" ry="12" fill="#fff" />
      <Eyes x1={43} x2={57} y={38} r={4} />
      <path d="M44 46 Q50 44 56 46 Q56 58 50 60 Q44 58 44 46Z" fill="#facc15" />
      <path d="M50 52 L50 56" stroke="#a16207" strokeWidth="1.5" />
      {/* pirate hat */}
      <path d="M22 24 Q50 -2 78 24 Q50 18 22 24Z" fill="#111827" />
      <path d="M22 24 Q50 30 78 24 Q50 14 22 24Z" fill="#374151" />
      <circle cx="50" cy="15" r="3.2" fill="#fff" />
      <path d="M46 20 L54 20" stroke="#fff" strokeWidth="1.5" />
      <g stroke="#facc15" strokeWidth="2.5" strokeLinecap="round">
        <line x1="36" y1="92" x2="36" y2="99" />
        <line x1="62" y1="92" x2="62" y2="99" />
      </g>
    </g>
  );
}

function Chef() {
  return (
    <g>
      <rect x="30" y="72" width="40" height="24" rx="8" fill="#fff" />
      <path d="M42 72 L50 82 L58 72Z" fill="#ef4444" />
      <g fill="#fff" stroke="#e5e7eb" strokeWidth="1.5">
        <circle cx="34" cy="20" r="12" />
        <circle cx="50" cy="14" r="14" />
        <circle cx="66" cy="20" r="12" />
        <rect x="32" y="22" width="36" height="18" rx="3" />
      </g>
      <rect x="32" y="32" width="36" height="7" fill="#e5e7eb" />
      <circle cx="50" cy="55" r="22" fill="#fcd9b6" />
      <Eyes x1={42} x2={58} y={52} r={3.6} />
      <path d="M38 62 Q50 58 62 62 Q56 68 50 64 Q44 68 38 62Z" fill="#92400e" />
      <Smile cx={50} y={68} w={10} />
      <Cheeks x1={34} x2={66} y={60} />
    </g>
  );
}

function Lion() {
  const mane = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => {
    const a = (i / 10) * Math.PI * 2;
    return <circle key={i} cx={50 + Math.cos(a) * 30} cy={46 + Math.sin(a) * 30} r="12" fill="#ea580c" />;
  });
  return (
    <g>
      <ellipse cx="50" cy="86" rx="22" ry="14" fill="#fbbf24" />
      {mane}
      <circle cx="50" cy="46" r="30" fill="#f97316" />
      <circle cx="30" cy="22" r="7" fill="#fbbf24" />
      <circle cx="70" cy="22" r="7" fill="#fbbf24" />
      <circle cx="50" cy="48" r="23" fill="#fbbf24" />
      <ellipse cx="50" cy="56" rx="12" ry="9" fill="#fef3c7" />
      <path d="M45 51 L55 51 L50 57Z" fill="#7c2d12" />
      <Eyes x1={41} x2={59} y={44} r={3.8} />
      <path d="M50 57 Q44 64 40 60 M50 57 Q56 64 60 60" fill="none" stroke={INK} strokeWidth="2.2" strokeLinecap="round" />
      <Cheeks x1={32} x2={68} y={54} />
    </g>
  );
}

function Owl() {
  return (
    <g>
      <path d="M26 30 L20 10 L38 22Z" fill="#92400e" />
      <path d="M74 30 L80 10 L62 22Z" fill="#92400e" />
      <ellipse cx="50" cy="62" rx="31" ry="34" fill="#a16207" />
      <ellipse cx="50" cy="70" rx="20" ry="24" fill="#fde68a" />
      <g stroke="#ca8a04" strokeWidth="2" fill="none" strokeLinecap="round">
        <path d="M42 66 q4 4 8 0 M50 66 q4 4 8 0 M42 76 q4 4 8 0 M50 76 q4 4 8 0" />
      </g>
      <path d="M20 54 Q6 70 16 86 Q30 80 32 60Z" fill="#92400e" />
      <path d="M80 54 Q94 70 84 86 Q70 80 68 60Z" fill="#92400e" />
      <circle cx="37" cy="44" r="14" fill="#fff" />
      <circle cx="63" cy="44" r="14" fill="#fff" />
      <circle cx="38" cy="45" r="6.5" fill={INK} />
      <circle cx="62" cy="45" r="6.5" fill={INK} />
      <circle cx="40" cy="43" r="2.2" fill="#fff" />
      <circle cx="64" cy="43" r="2.2" fill="#fff" />
      {/* reading glasses */}
      <g fill="none" stroke="#7c3aed" strokeWidth="2.5">
        <circle cx="37" cy="44" r="15" />
        <circle cx="63" cy="44" r="15" />
        <path d="M52 44 L48 44" />
      </g>
      <path d="M44 55 L56 55 L50 66Z" fill="#f97316" />
      {/* graduation cap */}
      <path d="M50 4 L82 17 L50 29 L18 17Z" fill="#4c1d95" />
      <path d="M34 24 L34 31 Q50 38 66 31 L66 24 L50 30Z" fill="#5b21b6" />
      <line x1="82" y1="17" x2="84" y2="30" stroke="#facc15" strokeWidth="2" />
      <circle cx="84" cy="31" r="2.6" fill="#facc15" />
    </g>
  );
}

function Dragon() {
  return (
    <g>
      <path d="M18 56 Q-2 38 8 22 Q22 34 32 50Z" fill="#7c3aed" />
      <path d="M82 56 Q102 38 92 22 Q78 34 68 50Z" fill="#7c3aed" />
      <ellipse cx="50" cy="78" rx="26" ry="19" fill="#22c55e" />
      <ellipse cx="50" cy="82" rx="14" ry="13" fill="#bbf7d0" />
      <path d="M30 20 L34 4 L44 18Z" fill="#facc15" />
      <path d="M70 20 L66 4 L56 18Z" fill="#facc15" />
      <circle cx="50" cy="46" r="28" fill="#22c55e" />
      <circle cx="35" cy="30" r="3" fill="#16a34a" />
      <circle cx="50" cy="26" r="3" fill="#16a34a" />
      <circle cx="65" cy="30" r="3" fill="#16a34a" />
      <ellipse cx="50" cy="57" rx="17" ry="12" fill="#86efac" />
      <circle cx="44" cy="55" r="2" fill="#15803d" />
      <circle cx="56" cy="55" r="2" fill="#15803d" />
      <Eyes x1={38} x2={62} y={42} r={4.4} />
      <Smile cx={50} y={62} w={12} />
      <path d="M78 84 Q90 80 88 70 Q84 76 80 74 Q82 66 76 64 Q76 76 70 82Z" fill="#fb923c" />
      <path d="M80 82 Q86 78 85 73 Q82 76 80 75Z" fill="#fde047" />
    </g>
  );
}

function Fox() {
  return (
    <g>
      <path d="M72 82 Q98 78 92 52 Q84 64 70 70Z" fill="#f97316" />
      <path d="M90 56 Q94 66 88 72 Q86 64 90 56Z" fill="#fff" />
      <ellipse cx="50" cy="80" rx="22" ry="18" fill="#f97316" />
      <ellipse cx="50" cy="84" rx="12" ry="11" fill="#fff7ed" />
      <path d="M18 40 L22 8 L44 26Z" fill="#f97316" />
      <path d="M82 40 L78 8 L56 26Z" fill="#f97316" />
      <path d="M25 32 L26 16 L37 26Z" fill="#fde4cf" />
      <path d="M75 32 L74 16 L63 26Z" fill="#fde4cf" />
      <path d="M14 48 Q50 20 86 48 Q80 78 50 80 Q20 78 14 48Z" fill="#f97316" />
      <path d="M30 60 Q50 54 70 60 Q64 78 50 80 Q36 78 30 60Z" fill="#fff7ed" />
      <ellipse cx="50" cy="58" rx="5" ry="3.5" fill={INK} />
      <Eyes x1={37} x2={63} y={46} r={4} />
      <Smile cx={50} y={66} w={10} />
    </g>
  );
}

const ART: Record<CharacterKind, () => JSX.Element> = {
  bear: Bear,
  penguin: Penguin,
  robot: Robot,
  parrot: Parrot,
  chef: Chef,
  lion: Lion,
  owl: Owl,
  dragon: Dragon,
  fox: Fox,
};

export type Mood = "happy" | "cheer" | "oops" | "think";

/** Small overlays that change how the guide looks without redrawing the whole character. */
function MoodOverlay({ mood }: { mood: Mood }) {
  if (mood === "cheer") {
    return (
      <g fill="#facc15" stroke="#f59e0b" strokeWidth="1">
        <path d="M8 14 l2.4 5 5.4.8-3.9 3.8.9 5.4L8 26.4 3.200 29l.9-5.4L.2 19.800l5.400-.8z" transform="translate(0 -6)" />
        <path d="M86 8 l1.800 3.800 4.200.6-3 2.900.7 4.200L86 17.500l-3.700 2 .7-4.200-3-2.900 4.200-.6z" />
        <circle cx="92" cy="40" r="2.500" />
        <circle cx="6" cy="48" r="2.500" />
      </g>
    );
  }
  if (mood === "oops") {
    return (
      <g>
        <path d="M82 22 Q86 30 82 34 Q78 30 82 22Z" fill="#60a5fa" />
        <path d="M82 22 Q84 26 82 28" fill="none" stroke="#fff" strokeWidth="1.2" opacity="0.7" />
      </g>
    );
  }
  if (mood === "think") {
    return (
      <g fill="#fff" stroke="#9ca3af" strokeWidth="1">
        <circle cx="84" cy="30" r="2" />
        <circle cx="89" cy="22" r="3" />
        <circle cx="94" cy="12" r="4.500" />
      </g>
    );
  }
  return null;
}

export default function Character({
  kind,
  size = 64,
  className,
  mood = "happy",
}: {
  kind: CharacterKind;
  size?: number;
  className?: string;
  mood?: Mood;
}) {
  const Art = ART[kind] ?? Fox;
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
      focusable="false"
      overflow="visible"
    >
      <Art />
      <MoodOverlay mood={mood} />
    </svg>
  );
}