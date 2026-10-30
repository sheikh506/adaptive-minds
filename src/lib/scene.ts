/**
 * Picture-book scene layout. Pure data and helpers (safe on server and client, easy to test).
 * A scene is a painted SVG backdrop plus a few emoji characters standing on it.
 */

export type Backdrop =
  | "meadow"
  | "night"
  | "sea"
  | "space"
  | "forest"
  | "garden"
  | "storm"
  | "sunset"
  | "home"
  | "island"
  | "rain";

export const BACKDROPS: Backdrop[] = ["meadow", "night", "sea", "space", "forest", "garden", "storm", "sunset", "home", "island", "rain"];

export interface SceneItem {
  emoji: string;
  /** Percent across the picture, 0-100 */
  x: number;
  /** Percent down the picture, 0-100 */
  y: number;
  /** Relative size, 1 = normal */
  size: number;
  /** Floats in the sky instead of standing on the ground */
  sky: boolean;
}

/** Emoji that belong up in the sky rather than on the ground. */
const SKY = new Set([
  "⭐", "🌟", "✨", "🌙", "🌕", "☀️", "🌤️", "🌥️", "☁️", "🌧️", "🌩️", "⚡", "🌈", "🎈", "🚀", "🌌", "🐝", "🦋", "🌠", "💫",
  "🔟", "9️⃣", "8️⃣", "7️⃣", "6️⃣", "5️⃣", "4️⃣", "3️⃣", "2️⃣", "1️⃣",
]);

type Segmenter = new (l?: string, o?: { granularity: "grapheme" }) => { segment(s: string): Iterable<{ segment: string }> };

/** Splits a string of emoji into separate characters (keeps keycaps and joined emoji together). */
export function splitEmoji(scene: string): string[] {
  const text = scene.trim();
  if (!text) return [];
  const Seg = (Intl as unknown as { Segmenter?: Segmenter }).Segmenter;
  const parts = Seg ? Array.from(new Seg(undefined, { granularity: "grapheme" }).segment(text), (s) => s.segment) : Array.from(text);
  return parts.filter((p) => p.trim().length > 0);
}

/** Lays emoji out along the scene: the first one is the hero (largest), sky things float, the rest stand on the ground. */
export function layoutScene(scene: string): SceneItem[] {
  const emojis = splitEmoji(scene).slice(0, 5);
  const n = emojis.length;
  return emojis.map((emoji, i) => {
    const sky = SKY.has(emoji);
    const x = n === 1 ? 50 : 16 + (68 * i) / (n - 1);
    const hero = i === 0 && !sky;
    const size = hero ? 1.5 : sky ? 0.95 : 1.15;
    const y = sky ? 24 + (i % 2) * 12 : 72 + (i % 2) * 6;
    return { emoji, x, y, size, sky };
  });
}
