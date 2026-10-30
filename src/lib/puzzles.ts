/**
 * Puzzle Playground. Pure generators for the Art & Craft puzzle games, for two levels:
 * "K" (Kindergarten, ages 4-6) and "P" (Primary, ages 6-9). Everything takes an optional random function
 * so the rounds can be tested. No browser APIs, so this is safe on server and client.
 */

import type { Rng } from "./voice-style";

export type Level = "K" | "P";

export function shuffle<T>(items: readonly T[], rng: Rng = Math.random): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** `n` distinct items picked at random. */
function sample<T>(items: readonly T[], n: number, rng: Rng): T[] {
  return shuffle(items, rng).slice(0, n);
}

function int(min: number, max: number, rng: Rng): number {
  return min + Math.floor(rng() * (max - min + 1));
}

// ─── Match-Up ───────────────────────────────────────────────────────────────

export interface MatchPair {
  id: string;
  left: string;
  right: string;
}

const WORD_PAIRS: [string, string][] = [
  ["🐶", "Dog"], ["🐱", "Cat"], ["🍎", "Apple"], ["🚗", "Car"], ["☀️", "Sun"],
  ["🐟", "Fish"], ["🌳", "Tree"], ["⭐", "Star"], ["🏠", "House"], ["🍌", "Banana"],
];

/** K: pictures to words (and dots to numerals). P: sums to answers. */
export function makeMatchPairs(level: Level, rng: Rng = Math.random): MatchPair[] {
  if (level === "K") {
    const words = sample(WORD_PAIRS, 3, rng).map(([left, right]) => ({ id: `w-${right}`, left, right }));
    const n = int(1, 5, rng);
    return [...words, { id: `n-${n}`, left: "🔴".repeat(n), right: String(n) }];
  }
  const sums = new Set<number>();
  const pairs: MatchPair[] = [];
  while (pairs.length < 5) {
    const a = int(1, 9, rng);
    const b = int(1, 9, rng);
    if (sums.has(a + b)) continue;
    sums.add(a + b);
    pairs.push({ id: `s-${a + b}`, left: `${a} + ${b}`, right: String(a + b) });
  }
  return pairs;
}

// ─── Spot the Difference ────────────────────────────────────────────────────

export interface SpotRound {
  cols: number;
  a: string[];
  b: string[];
  diffs: number[];
}

const SPOT_POOL = ["🐶", "🐱", "🐰", "🐸", "🐼", "🦁", "🍎", "🍌", "🍇", "🌻", "🚗", "⭐", "🎈", "🦋"];

export function makeSpotRound(level: Level, rng: Rng = Math.random): SpotRound {
  const cols = level === "K" ? 3 : 4;
  const rows = level === "K" ? 3 : 4;
  const count = level === "K" ? 3 : 5;
  const total = cols * rows;
  const a = Array.from({ length: total }, () => SPOT_POOL[int(0, SPOT_POOL.length - 1, rng)]);
  const diffs = sample(Array.from({ length: total }, (_, i) => i), count, rng).sort((x, y) => x - y);
  const b = [...a];
  for (const i of diffs) {
    const others = SPOT_POOL.filter((e) => e !== a[i]);
    b[i] = others[int(0, others.length - 1, rng)];
  }
  return { cols, a, b, diffs };
}

// ─── Block Builder ──────────────────────────────────────────────────────────

export interface BlockColour {
  name: string;
  hex: string;
}

export const BLOCK_COLOURS: BlockColour[] = [
  { name: "Red", hex: "#ef4444" },
  { name: "Blue", hex: "#3b82f6" },
  { name: "Yellow", hex: "#facc15" },
  { name: "Green", hex: "#22c55e" },
];

export interface BlockRound {
  size: number;
  /** One colour index per cell, row by row */
  target: number[];
  colours: BlockColour[];
}

/** A little picture made of coloured blocks that the child copies. */
export function makeBlockRound(level: Level, rng: Rng = Math.random): BlockRound {
  const size = level === "K" ? 3 : 4;
  const colours = BLOCK_COLOURS.slice(0, level === "K" ? 3 : 4);
  let target: number[];
  do {
    target = Array.from({ length: size * size }, () => int(0, colours.length - 1, rng));
  } while (new Set(target).size < 2);
  return { size, target, colours };
}

export function blocksMatch(built: readonly (number | null)[], target: readonly number[]): boolean {
  return built.length === target.length && built.every((c, i) => c === target[i]);
}

// ─── Slide Puzzle ───────────────────────────────────────────────────────────

export interface SlideShape {
  rows: number;
  cols: number;
}

export const slideShape = (level: Level): SlideShape => (level === "K" ? { rows: 2, cols: 3 } : { rows: 3, cols: 3 });

/** 1..n-1 in order, then 0 for the empty space. */
export function solvedSlide({ rows, cols }: SlideShape): number[] {
  return Array.from({ length: rows * cols }, (_, i) => (i + 1 < rows * cols ? i + 1 : 0));
}

export function isSlideSolved(tiles: readonly number[], shape: SlideShape): boolean {
  const s = solvedSlide(shape);
  return tiles.length === s.length && tiles.every((t, i) => t === s[i]);
}

function slideNeighbours(empty: number, { rows, cols }: SlideShape): number[] {
  const r = Math.floor(empty / cols);
  const c = empty % cols;
  const out: number[] = [];
  if (r > 0) out.push(empty - cols);
  if (r < rows - 1) out.push(empty + cols);
  if (c > 0) out.push(empty - 1);
  if (c < cols - 1) out.push(empty + 1);
  return out;
}

/** Slides the tile at `idx` into the empty space if it is right next to it; otherwise returns null. */
export function slideMove(tiles: readonly number[], shape: SlideShape, idx: number): number[] | null {
  const empty = tiles.indexOf(0);
  if (!slideNeighbours(empty, shape).includes(idx)) return null;
  const next = [...tiles];
  [next[empty], next[idx]] = [next[idx], next[empty]];
  return next;
}

/** Scrambles by making real moves from the solved board, so it can always be solved. */
export function makeSlideRound(level: Level, rng: Rng = Math.random): number[] {
  const shape = slideShape(level);
  let tiles = solvedSlide(shape);
  let previous = -1;
  const steps = level === "K" ? 14 : 40;
  for (let i = 0; i < steps || isSlideSolved(tiles, shape); i++) {
    const empty = tiles.indexOf(0);
    const options = slideNeighbours(empty, shape).filter((n) => n !== previous);
    const choice = options[int(0, options.length - 1, rng)];
    previous = empty;
    tiles = slideMove(tiles, shape, choice)!;
  }
  return tiles;
}

// ─── Count & Pick ───────────────────────────────────────────────────────────

export interface CountRound {
  emoji: string;
  count: number;
  options: number[];
}

const COUNT_POOL = ["🍎", "⭐", "🐟", "🎈", "🦋", "🍪", "🚗", "🌸"];

export function makeCountRound(level: Level, rng: Rng = Math.random): CountRound {
  const count = level === "K" ? int(1, 5, rng) : int(6, 12, rng);
  const emoji = COUNT_POOL[int(0, COUNT_POOL.length - 1, rng)];
  const options = new Set<number>([count]);
  while (options.size < 3) {
    const n = count + int(-2, 2, rng);
    if (n >= 1) options.add(n);
  }
  return { emoji, count, options: shuffle([...options], rng) };
}

// ─── Number Bubbles ─────────────────────────────────────────────────────────

export interface NumberBubbleRound {
  /** The numbers to pop, in order */
  sequence: number[];
  /** All the bubbles on screen (the sequence plus a few extras), shuffled */
  bubbles: number[];
  instruction: string;
}

/** K: pop 1 to 5 in order. P: skip counting by 2s, 5s or 10s, with a few wrong-number bubbles mixed in. */
export function makeNumberBubbleRound(level: Level, rng: Rng = Math.random): NumberBubbleRound {
  if (level === "K") {
    const sequence = [1, 2, 3, 4, 5];
    return { sequence, bubbles: shuffle(sequence, rng), instruction: "Pop the bubbles in order: 1, 2, 3, 4, 5." };
  }
  const step = [2, 5, 10][int(0, 2, rng)];
  const sequence = Array.from({ length: 5 }, (_, i) => step * (i + 1));
  const decoys = new Set<number>();
  while (decoys.size < 3) {
    const n = int(1, step * 6, rng);
    if (!sequence.includes(n)) decoys.add(n);
  }
  return {
    sequence,
    bubbles: shuffle([...sequence, ...decoys], rng),
    instruction: `Count by ${step}s. Pop ${sequence.slice(0, 3).join(", ")} and so on, in order.`,
  };
}

// ─── What Comes Next ────────────────────────────────────────────────────────

export interface PatternRound {
  shown: string[];
  answer: string;
  options: string[];
}

const PATTERN_POOL = ["🔴", "🔵", "🟡", "🟢", "🟣", "🟠", "⭐", "🌙", "❤️", "🍎"];

/** K: AB patterns. P: AAB, ABB and ABC patterns. The last picture is missing. */
export function makePatternRound(level: Level, rng: Rng = Math.random): PatternRound {
  const shapes = level === "K" ? ["AB"] : ["AAB", "ABB", "ABC"];
  const shape = shapes[int(0, shapes.length - 1, rng)];
  const letters = [...new Set(shape.split(""))];
  const symbols = sample(PATTERN_POOL, letters.length + 1, rng);
  const map = new Map(letters.map((l, i) => [l, symbols[i]]));
  const unit = shape.split("").map((l) => map.get(l)!);
  const length = unit.length * 2 + 1;
  const full = Array.from({ length }, (_, i) => unit[i % unit.length]);
  const answer = full[length - 1];
  const wrong = [...new Set([...unit, symbols[letters.length]])].filter((s) => s !== answer);
  return { shown: full.slice(0, -1), answer, options: shuffle([answer, ...sample(wrong, 2, rng)], rng) };
}

// ─── Odd One Out ────────────────────────────────────────────────────────────

export interface OddRound {
  items: string[];
  oddIndex: number;
  hint: string;
}

const CATEGORIES: { name: string; items: string[] }[] = [
  { name: "animals", items: ["🐶", "🐱", "🐰", "🐻", "🐼", "🦁"] },
  { name: "fruits", items: ["🍎", "🍌", "🍇", "🍓", "🍉", "🍊"] },
  { name: "vehicles", items: ["🚗", "🚌", "🚲", "🚂", "✈️", "🚀"] },
  { name: "plants", items: ["🌳", "🌲", "🌴", "🌵", "🌻", "🌷"] },
];

export function makeOddRound(level: Level, rng: Rng = Math.random): OddRound {
  const total = level === "K" ? 4 : 5;
  if (level === "P" && rng() < 0.5) {
    const even = rng() < 0.5;
    const same = sample(Array.from({ length: 10 }, (_, i) => (even ? (i + 1) * 2 : i * 2 + 1)), total - 1, rng);
    const odd = int(1, 20, rng);
    const fixed = even ? (odd % 2 === 0 ? odd + 1 : odd) : odd % 2 === 1 ? odd + 1 : odd;
    const items = shuffle([...same.map(String), String(fixed)], rng);
    return { items, oddIndex: items.indexOf(String(fixed)), hint: `The others are all ${even ? "even" : "odd"} numbers.` };
  }
  const [main, other] = sample(CATEGORIES, 2, rng);
  const same = sample(main.items, total - 1, rng);
  const odd = other.items[int(0, other.items.length - 1, rng)];
  const items = shuffle([...same, odd], rng);
  return { items, oddIndex: items.indexOf(odd), hint: `The others are all ${main.name}.` };
}
