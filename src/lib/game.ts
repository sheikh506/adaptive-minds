/**
 * Game layer: worlds, characters, companion growth and quest rules.
 * Everything here is pure (no I/O) so it can be unit tested and shared by server and client.
 * Design rules: rewards are predictable, effort is rewarded, nothing is ever taken away.
 */

export const ROUND_SIZE = 5; // questions per quest
export const ROUND_BONUS_XP = 10; // for finishing a quest, regardless of score
export const ROUND_BONUS_STARS = 2;
export const HINT_XP_FACTOR = 0.5; // using a hint halves the XP for that question

// ─── Worlds ─────────────────────────────────────────────────────────────────

export type CharacterKind = "bear" | "penguin" | "robot" | "parrot" | "chef" | "lion" | "owl" | "dragon" | "fox";

export interface World {
  name: string;
  guideName: string;
  guide: CharacterKind; // drawn by components/art/Character
  tagline: string;
  intro: string; // guide line at the start of a quest
  gradient: string; // literal Tailwind classes so they are never purged
  soft: string;
}

const DEFAULT_WORLD: World = {
  name: "Adventure Land",
  guideName: "Sparky",
  guide: "fox",
  tagline: "A new adventure awaits",
  intro: "Ready for a quest? Let's go!",
  gradient: "from-brand-500 to-brand-700",
  soft: "bg-brand-50",
};

export const WORLDS: Record<string, World> = {
  Addition: {
    name: "Candy Kingdom",
    guideName: "Gummy",
    guide: "bear",
    tagline: "Add up the sweets!",
    intro: "Hi, I'm Gummy! Help me count the candy.",
    gradient: "from-pink-400 to-rose-600",
    soft: "bg-pink-50",
  },
  Subtraction: {
    name: "Penguin Peaks",
    guideName: "Pip",
    guide: "penguin",
    tagline: "Slide down the snowy slopes",
    intro: "Brrr! I'm Pip. Let's take some away and slide!",
    gradient: "from-cyan-400 to-sky-600",
    soft: "bg-cyan-50",
  },
  Multiplication: {
    name: "Rocket Galaxy",
    guideName: "Beep",
    guide: "robot",
    tagline: "Blast off with times tables",
    intro: "Beep boop! Countdown to a multiplication mission!",
    gradient: "from-indigo-500 to-purple-700",
    soft: "bg-indigo-50",
  },
  Division: {
    name: "Treasure Cove",
    guideName: "Captain Polly",
    guide: "parrot",
    tagline: "Share the treasure fairly",
    intro: "Ahoy! Captain Polly here. Let's share the loot!",
    gradient: "from-amber-400 to-orange-600",
    soft: "bg-amber-50",
  },
  Fractions: {
    name: "Pizza Planet",
    guideName: "Chef Pie",
    guide: "chef",
    tagline: "Slice it, share it",
    intro: "Welcome to my kitchen! Let's slice some pizza.",
    gradient: "from-red-400 to-orange-600",
    soft: "bg-red-50",
  },
  Phonics: {
    name: "Sound Safari",
    guideName: "Leo",
    guide: "lion",
    tagline: "Roar out the sounds",
    intro: "Roar! I'm Leo. Let's hunt for sounds together.",
    gradient: "from-green-400 to-emerald-600",
    soft: "bg-green-50",
  },
  Vocabulary: {
    name: "Word Woods",
    guideName: "Professor Hoot",
    guide: "owl",
    tagline: "Collect magical words",
    intro: "Hoo hoo! Let's find some wonderful new words.",
    gradient: "from-violet-400 to-purple-700",
    soft: "bg-violet-50",
  },
  Comprehension: {
    name: "Story Castle",
    guideName: "Ember",
    guide: "dragon",
    tagline: "Read the tale, crack the clues",
    intro: "I'm Ember the dragon! Read closely and help me solve it.",
    gradient: "from-blue-500 to-indigo-700",
    soft: "bg-blue-50",
  },
  // Little Learners (pre-K to grade 2)
  Counting: {
    name: "Counting Garden",
    guideName: "Freddie",
    guide: "fox",
    tagline: "Count the flowers and fruit",
    intro: "Hi, I'm Freddie! Let's count things in the garden.",
    gradient: "from-lime-400 to-green-600",
    soft: "bg-lime-50",
  },
  Letters: {
    name: "Alphabet Village",
    guideName: "Abby",
    guide: "bear",
    tagline: "Meet every letter",
    intro: "Hello, I'm Abby! Come and meet the letters.",
    gradient: "from-fuchsia-400 to-pink-600",
    soft: "bg-fuchsia-50",
  },
  // More maths
  Geometry: {
    name: "Shape City",
    guideName: "Zig",
    guide: "fox",
    tagline: "Spot shapes everywhere",
    intro: "Zig here! Let's explore the shapes of the city.",
    gradient: "from-teal-400 to-cyan-600",
    soft: "bg-teal-50",
  },
  Measurement: {
    name: "Measure Mountain",
    guideName: "Rory",
    guide: "penguin",
    tagline: "Long, short, heavy, light",
    intro: "Hi, I'm Rory! Let's measure the mountain.",
    gradient: "from-sky-400 to-blue-600",
    soft: "bg-sky-50",
  },
  Time: {
    name: "Clock Tower",
    guideName: "Tick",
    guide: "owl",
    tagline: "What time is it?",
    intro: "Tick tock! I'm Tick. Let's read the clock together.",
    gradient: "from-amber-400 to-yellow-600",
    soft: "bg-amber-50",
  },
  Money: {
    name: "Coin Market",
    guideName: "Penny",
    guide: "parrot",
    tagline: "Count coins, spend wisely",
    intro: "Squawk! I'm Penny. Let's go shopping with coins.",
    gradient: "from-emerald-400 to-green-700",
    soft: "bg-emerald-50",
  },
  Data: {
    name: "Graph Garden",
    guideName: "Barney",
    guide: "bear",
    tagline: "Read charts and find patterns",
    intro: "Hello, I'm Barney! Let's read some bar charts.",
    gradient: "from-orange-400 to-red-600",
    soft: "bg-orange-50",
  },
  // More reading
  Spelling: {
    name: "Spelling Hive",
    guideName: "Buzz",
    guide: "lion",
    tagline: "Spell it right",
    intro: "Buzz buzz! Let's spell some words.",
    gradient: "from-yellow-400 to-amber-600",
    soft: "bg-yellow-50",
  },
  Grammar: {
    name: "Grammar Garage",
    guideName: "Gus",
    guide: "robot",
    tagline: "Fix up sentences",
    intro: "Beep! I'm Gus. Let's tune up some sentences.",
    gradient: "from-slate-400 to-blue-700",
    soft: "bg-slate-50",
  },
  // Science
  "Life Science": {
    name: "Jungle Lab",
    guideName: "Kiwi",
    guide: "parrot",
    tagline: "Animals, plants and you",
    intro: "Squawk! I'm Kiwi. Let's study living things.",
    gradient: "from-green-500 to-teal-700",
    soft: "bg-green-50",
  },
  "Earth & Space": {
    name: "Starry Skies",
    guideName: "Nova",
    guide: "dragon",
    tagline: "Planets, weather and rocks",
    intro: "I'm Nova! Let's explore our planet and the sky.",
    gradient: "from-indigo-600 to-slate-800",
    soft: "bg-indigo-50",
  },
  "Matter & Energy": {
    name: "Wonder Workshop",
    guideName: "Volt",
    guide: "robot",
    tagline: "Solids, liquids, forces and light",
    intro: "Zap! I'm Volt. Let's test how things work.",
    gradient: "from-cyan-500 to-violet-700",
    soft: "bg-cyan-50",
  },
};

export function worldFor(topicName: string): World {
  return WORLDS[topicName] ?? DEFAULT_WORLD;
}

/** Topics for the youngest learners. They are listed first for K–2, and read aloud by default. */
export const EARLY_TOPIC_IDS = ["topic-counting", "topic-letters"] as const;
export const EARLY_GRADES = ["K", "G1", "G2"] as const;

export function isEarlyTopic(topicId: string): boolean {
  return (EARLY_TOPIC_IDS as readonly string[]).includes(topicId);
}

/** Early learners are children in grades K–2. */
export function isEarlyLearner(grade: string | null | undefined): boolean {
  return !!grade && (EARLY_GRADES as readonly string[]).includes(grade);
}

// ─── Companion ──────────────────────────────────────────────────────────────

export interface CompanionStage {
  index: number;
  name: string;
  emoji: string;
  minXP: number;
}

export const COMPANION_STAGES: CompanionStage[] = [
  { index: 0, name: "Mystery Egg", emoji: "🥚", minXP: 0 },
  { index: 1, name: "Baby Hatchling", emoji: "🐣", minXP: 30 },
  { index: 2, name: "Little Explorer", emoji: "🐥", minXP: 120 },
  { index: 3, name: "Brave Hero", emoji: "🦅", minXP: 350 },
  { index: 4, name: "Legendary Dragon", emoji: "🐉", minXP: 800 },
];

export function companionStage(totalXP: number) {
  let stage = COMPANION_STAGES[0];
  for (const s of COMPANION_STAGES) if (totalXP >= s.minXP) stage = s;
  const next = COMPANION_STAGES[stage.index + 1] ?? null;
  const span = next ? next.minXP - stage.minXP : 1;
  const into = next ? totalXP - stage.minXP : 1;
  return {
    ...stage,
    next,
    xpToNext: next ? next.minXP - totalXP : 0,
    percent: next ? Math.max(0, Math.min(100, Math.round((into / span) * 100))) : 100,
  };
}

// ─── Streaks (forgiving) ────────────────────────────────────────────────────

function dayStart(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/**
 * Practising on consecutive days grows the streak. One missed day is forgiven ("rest day"),
 * so a single sick day or busy weekend never wipes out a child's progress.
 */
export function nextStreak(previous: number, lastActive: Date | null, now: Date): number {
  if (!lastActive) return 1;
  const gap = Math.round((dayStart(now).getTime() - dayStart(lastActive).getTime()) / 86_400_000);
  if (gap <= 0) return Math.max(previous, 1);
  if (gap <= 2) return Math.max(previous, 0) + 1;
  return 1;
}

// ─── Question selection ─────────────────────────────────────────────────────

/** Combo = how many of the most recent answers in a row were correct (newest first input). */
export function comboFromResults(newestFirst: boolean[]): number {
  let n = 0;
  for (const ok of newestFirst) {
    if (!ok) break;
    n++;
  }
  return n;
}

/** Prefer questions the child has not seen recently; only repeat when nothing else is left. */
export function pickExercise<T extends { id: string }>(
  candidates: T[],
  recentIds: string[],
  rand: () => number = Math.random
): T {
  const seen = new Set(recentIds);
  const fresh = candidates.filter((c) => !seen.has(c.id));
  const pool = fresh.length > 0 ? fresh : candidates;
  return pool[Math.floor(rand() * pool.length)];
}

/** 50:50 hint: remove wrong options but always leave the right one and at least two choices. */
export function optionsToEliminate(options: string[], answer: string, rand: () => number = Math.random): string[] {
  const wrong = options.filter((o) => o !== answer);
  const removable = Math.min(2, Math.max(0, options.length - 2), wrong.length);
  const shuffled = [...wrong].sort(() => rand() - 0.5);
  return shuffled.slice(0, removable);
}

export function xpWithHint(xp: number, hintUsed: boolean): number {
  return hintUsed ? Math.ceil(xp * HINT_XP_FACTOR) : xp;
}

// ─── Hint ladder ────────────────────────────────────────────────────────────

/** 1 = a nudge, 2 = a worked example of a similar problem, 3 = remove two wrong options (50:50). */
export const MAX_HINT_STAGE = 3;
/** A nudge is free. From the worked example onward the question pays half XP, so hints are not spammed. */
export const FIRST_COSTLY_HINT_STAGE = 2;

export function hintCostsXP(stage: number): boolean {
  return stage >= FIRST_COSTLY_HINT_STAGE;
}

export function clampHintStage(stage: unknown): number {
  const n = Math.round(Number(stage));
  return Number.isFinite(n) ? Math.max(0, Math.min(MAX_HINT_STAGE, n)) : 0;
}

// ─── Which kind of question comes next ──────────────────────────────────────

export type QuestionKind = "recovery" | "review" | "normal";

/**
 * Recovery first: right after a miss the child gets a friendlier question, so nobody sits in a run of
 * misses. Then a memory refresher from another skill once per quest (at the middle question), but never
 * twice in a row. Otherwise the next question in the child's level.
 */
export function decideQuestionKind(input: {
  lastWasMiss: boolean; // the most recent answer (any skill) was wrong and recent
  lastWasHere: boolean; // ...and it was in this skill
  level: number;
  position: number; // 1-based position of the next question in this skill's quest
  hasDueReview: boolean;
  lastWasReview: boolean; // the most recent answer was in a different skill (a refresher)
}): QuestionKind {
  if (input.lastWasMiss && input.lastWasHere && input.level > 1) return "recovery";
  if (input.hasDueReview && !input.lastWasReview && input.position === Math.ceil(ROUND_SIZE / 2)) return "review";
  return "normal";
}

/** Level for a recovery question: one step easier, never below 1. */
export function recoveryLevel(level: number): number {
  return Math.max(1, level - 1);
}

// ─── Words of encouragement ─────────────────────────────────────────────────

const CORRECT = ["Yes! Nailed it!", "Brilliant!", "You got it!", "Super smart!", "Woohoo, correct!", "Awesome work!"];
const ROLLING = ["You're on a roll!", "Wow, keep it going!", "Look at you go!"];
const UNSTOPPABLE = ["UNSTOPPABLE!", "You're on fire!", "Absolutely legendary!"];
const WRONG = [
  "So close! Let's learn from this one.",
  "Good try! Every mistake grows your brain.",
  "Oops, that's okay! Let's look at it together.",
  "Not yet, but you're getting there!",
];

export function cheer(correct: boolean, combo: number, seed: number): string {
  const pool = !correct ? WRONG : combo >= 5 ? UNSTOPPABLE : combo >= 3 ? ROLLING : CORRECT;
  return pool[Math.abs(Math.floor(seed)) % pool.length];
}

export function roundStars(correctCount: number): number {
  // 1 to 3 stars for the whole quest. Finishing always earns at least one.
  if (correctCount >= 5) return 3;
  if (correctCount >= 3) return 2;
  return 1;
}

export function questEndLine(correctCount: number): string {
  if (correctCount >= 5) return "A perfect quest! You're a superstar!";
  if (correctCount >= 3) return "Great quest! You're getting stronger.";
  return "You finished the quest! Practice makes progress.";
}

// ─── Practice time (set by a parent, per skill, per day) ─────────────────────

export const DEFAULT_PRACTICE_MINUTES = 10;
export const PRACTICE_MINUTE_CHOICES = [0, 5, 10, 15, 20, 30, 45, 60] as const;
/** A single question never counts for more than this, so a child walking away does not burn the budget. */
export const MAX_SECONDS_PER_QUESTION = 90;

/** Local midnight (as a real instant) for a browser offset from Date.getTimezoneOffset(). */
export function startOfLocalDay(now: Date, tzOffsetMinutes: number): Date {
  const DAY = 86_400_000;
  const off = Number.isFinite(tzOffsetMinutes) ? Math.max(-840, Math.min(840, Math.round(tzOffsetMinutes))) : 0;
  const offMs = off * 60_000;
  return new Date(Math.floor((now.getTime() - offMs) / DAY) * DAY + offMs);
}

/**
 * Seconds actually spent practising, measured on the server from answer timestamps:
 * the gap between consecutive answers when it is short, otherwise the (capped) time the child reported.
 */
export function activeSeconds(
  sessions: { completedAt: Date; timeTaken: number }[],
  cap: number = MAX_SECONDS_PER_QUESTION
): number {
  const sorted = [...sessions].sort((a, b) => a.completedAt.getTime() - b.completedAt.getTime());
  let total = 0;
  let prev: number | null = null;
  for (const s of sorted) {
    const t = s.completedAt.getTime();
    const gap = prev === null ? Infinity : (t - prev) / 1000;
    total += gap <= cap ? Math.max(0, gap) : Math.max(0, Math.min(s.timeTaken, cap));
    prev = t;
  }
  return Math.round(total);
}

/**
 * Pick the next question for the current difficulty level. Mostly the child's level, sometimes one
 * step easier or harder, and never something seen very recently unless there is nothing else.
 */
export function pickAdaptive<T extends { id: string; level: number }>(
  candidates: T[],
  recentIds: string[],
  level: number,
  rand: () => number = Math.random
): T {
  const seen = new Set(recentIds);
  const fresh = candidates.filter((c) => !seen.has(c.id));
  const tiers = [
    { w: 0.7, list: fresh.filter((c) => c.level === level) },
    { w: 0.15, list: fresh.filter((c) => c.level === level + 1) },
    { w: 0.15, list: fresh.filter((c) => c.level === level - 1) },
  ].filter((t) => t.list.length > 0);
  if (tiers.length > 0) {
    const total = tiers.reduce((s, t) => s + t.w, 0);
    let roll = rand() * total;
    for (const t of tiers) {
      if (roll < t.w) return t.list[Math.floor(rand() * t.list.length)];
      roll -= t.w;
    }
    const last = tiers[tiers.length - 1].list;
    return last[Math.floor(rand() * last.length)];
  }
  const pool = fresh.length > 0 ? fresh : candidates;
  return pool[Math.floor(rand() * pool.length)];
}
