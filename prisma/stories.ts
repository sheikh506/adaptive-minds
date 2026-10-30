import { Difficulty } from "@prisma/client";
import type { Visual, InteractionType } from "../src/lib/question-types";

/**
 * Story-based question generator. Every math/fractions question is a tiny scene inside a Quest World,
 * starring that world's guide, and small ones come with something to tap and count.
 * Generation is deterministic (seeded) so re-seeding is idempotent.
 * Numbers, answers and explanations are computed, never typed by hand.
 */

export interface SeedExercise {
  id: string;
  topicId: string;
  title: string;
  instructions: string;
  type: string;
  difficulty: Difficulty;
  level: number;
  xpReward: number;
  starReward: number;
  data: {
    question: string;
    options: string[];
    answer: string;
    explanation?: string;
    passage?: string;
    visual?: Visual;
    icons?: Record<string, string>;
    interactionType?: InteractionType;
  };
}

/** Questions per level per math world. With a 30-question no-repeat window this keeps a long session fresh. */
export const STORIES_PER_LEVEL = 24;

/** Seeded generator (mulberry32). Neighbouring seeds give unrelated sequences, and results are repeatable. */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export const difficultyFor = (level: number): Difficulty =>
  level <= 3 ? Difficulty.EASY : level <= 7 ? Difficulty.MEDIUM : Difficulty.HARD;

export function shuffle<T>(arr: T[], rand: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function numericOptions(answer: number, rand: () => number): string[] {
  const set = new Set<number>([answer]);
  const spread = Math.max(3, Math.round(Math.abs(answer) * 0.15));
  let guard = 0;
  while (set.size < 4 && guard++ < 50) {
    const delta = Math.ceil(rand() * spread) * (rand() < 0.5 ? -1 : 1);
    const candidate = answer + delta;
    if (candidate >= 0) set.add(candidate);
  }
  let pad = 1;
  while (set.size < 4) set.add(answer + pad++);
  return shuffle([...set].map(String), rand);
}

/** "1 gumdrop" / "3 gumdrops" */
type Noun = [singular: string, plural: string];
const cnt = (n: number, noun: Noun) => `${n} ${n === 1 ? noun[0] : noun[1]}`;

interface Scene {
  q: string;
  ans: number;
  why: string;
  visual?: Visual;
}

interface Tpl {
  emoji: string;
  q: (a: number, b: number) => string;
  why: (a: number, b: number) => string;
}

const MAX_ITEMS = 24; // never draw more than this many tappable things

// ─── Candy Kingdom (Gummy) — addition ────────────────────────────────────────
const ADD: Tpl[] = [
  { emoji: "🍬", q: (a, b) => `Gummy the bear has ${cnt(a, ["gumdrop", "gumdrops"])}. A sugar cloud rains ${b} more. How many gumdrops does Gummy have now?`, why: (a, b) => `${a} gumdrops plus ${b} more makes ${a + b}.` },
  { emoji: "🍭", q: (a, b) => `The red jar in Candy Kingdom holds ${cnt(a, ["lollipop", "lollipops"])} and the blue jar holds ${b}. How many lollipops are there in all?`, why: (a, b) => `Put the jars together: ${a} + ${b} = ${a + b}.` },
  { emoji: "🧁", q: (a, b) => `Gummy bakes ${cnt(a, ["cupcake", "cupcakes"])} in the morning and ${b} more in the afternoon. How many cupcakes did Gummy bake today?`, why: (a, b) => `${a} + ${b} = ${a + b} cupcakes.` },
  { emoji: "⛵", q: (a, b) => `${cnt(a, ["marshmallow boat floats", "marshmallow boats float"])} down the chocolate river. Then ${b} more boats join them. How many boats are on the river?`, why: (a, b) => `${a} boats and ${b} more boats make ${a + b}.` },
  { emoji: "🫘", q: (a, b) => `Gummy picks ${cnt(a, ["jelly bean", "jelly beans"])} from the Sweet Tree and ${b} from the Sour Bush. How many jelly beans did Gummy pick?`, why: (a, b) => `Add the two baskets: ${a} + ${b} = ${a + b}.` },
  { emoji: "🍩", q: (a, b) => `Gummy's friend Honey has ${cnt(a, ["donut", "donuts"])}. Gummy gives ${b} more. How many donuts does Honey have now?`, why: (a, b) => `${a} + ${b} = ${a + b} donuts.` },
  { emoji: "🍪", q: (a, b) => `A cookie tray has ${cnt(a, ["cookie", "cookies"])} on the left and ${b} on the right. How many cookies are on the tray?`, why: (a, b) => `${a} + ${b} = ${a + b} cookies.` },
  { emoji: "🍓", q: (a, b) => `Gummy finds ${cnt(a, ["strawberry", "strawberries"])} in the Berry Patch, then ${b} more by the fountain. How many strawberries is that?`, why: (a, b) => `${a} + ${b} = ${a + b} strawberries.` },
];

// ─── Penguin Peaks (Pip) — subtraction ───────────────────────────────────────
const SUB: Tpl[] = [
  { emoji: "⚪", q: (a, b) => `Pip the penguin has ${cnt(a, ["snowball", "snowballs"])}. He throws ${b} at a snowman. How many snowballs does Pip have left?`, why: (a, b) => `Take ${b} away from ${a}: ${a} − ${b} = ${a - b}.` },
  { emoji: "🐧", q: (a, b) => `${cnt(a, ["penguin waits", "penguins wait"])} at the top of the ice slide. ${b} of them zoom down. How many penguins are still waiting?`, why: (a, b) => `${a} − ${b} = ${a - b} penguins are left at the top.` },
  { emoji: "🐟", q: (a, b) => `Pip catches ${cnt(a, ["fish", "fish"])} for the big feast. His friends eat ${b} of them. How many fish are left?`, why: (a, b) => `Start with ${a} and take away ${b} to get ${a - b}.` },
  { emoji: "💎", q: (a, b) => `There are ${cnt(a, ["ice crystal", "ice crystals"])} on Penguin Peaks. The warm sun melts ${b}. How many crystals are left?`, why: (a, b) => `${a} − ${b} = ${a - b} crystals.` },
  { emoji: "❄️", q: (a, b) => `Pip's scarf has ${cnt(a, ["snowflake", "snowflakes"])} knitted on it. ${b} come loose and drift away. How many snowflakes stay on the scarf?`, why: (a, b) => `Subtract the ones that drifted away: ${a} − ${b} = ${a - b}.` },
  { emoji: "🚩", q: (a, b) => `A penguin parade has ${cnt(a, ["flag", "flags"])}. ${b} flags blow into the sea. How many flags are left in the parade?`, why: (a, b) => `${a} flags minus ${b} flags leaves ${a - b}.` },
  { emoji: "🧦", q: (a, b) => `Pip knits ${cnt(a, ["warm sock", "warm socks"])} for the penguins. He gives ${b} away. How many socks does Pip still have?`, why: (a, b) => `${a} − ${b} = ${a - b} socks.` },
  { emoji: "🥕", q: (a, b) => `The snowman collects ${cnt(a, ["carrot", "carrots"])} for noses. Birds nibble ${b} of them. How many carrots are left?`, why: (a, b) => `${a} − ${b} = ${a - b} carrots.` },
];

// ─── Rocket Galaxy (Beep) — multiplication (a groups of b) ───────────────────
const MUL: Tpl[] = [
  { emoji: "⭐", q: (a, b) => `Beep the robot loads ${cnt(a, ["crate", "crates"])} onto the rocket. Each crate holds ${cnt(b, ["star", "stars"])}. How many stars are on board?`, why: (a, b) => `${a} crates with ${b} stars each: ${a} × ${b} = ${a * b}.` },
  { emoji: "🌙", q: (a, b) => `The galaxy has ${cnt(a, ["planet", "planets"])}. Each planet has ${cnt(b, ["moon", "moons"])}. How many moons are there in total?`, why: (a, b) => `${a} groups of ${b} make ${a * b} moons.` },
  { emoji: "🔥", q: (a, b) => `Beep builds ${cnt(a, ["rocket", "rockets"])}. Every rocket needs ${cnt(b, ["engine", "engines"])}. How many engines does Beep need?`, why: (a, b) => `${a} × ${b} = ${a * b} engines.` },
  { emoji: "🪨", q: (a, b) => `${cnt(a, ["alien sits", "aliens sit"])} on the space bus. Each alien carries ${cnt(b, ["moon rock", "moon rocks"])}. How many moon rocks is that?`, why: (a, b) => `${a} aliens times ${b} rocks each is ${a * b}.` },
  { emoji: "✨", q: (a, b) => `Beep fires ${cnt(a, ["comet", "comets"])} across the sky. Each comet leaves a trail of ${cnt(b, ["sparkle", "sparkles"])}. How many sparkles light up the sky?`, why: (a, b) => `${a} × ${b} = ${a * b} sparkles.` },
  { emoji: "🪟", q: (a, b) => `A space station has ${cnt(a, ["floor", "floors"])}. Each floor has ${cnt(b, ["window", "windows"])}. How many windows does the station have?`, why: (a, b) => `${a} floors × ${b} windows = ${a * b} windows.` },
  { emoji: "🔋", q: (a, b) => `Beep needs ${cnt(b, ["battery", "batteries"])} to power one robot friend. He is building ${cnt(a, ["friend", "friends"])}. How many batteries does Beep need?`, why: (a, b) => `${a} friends × ${b} batteries = ${a * b} batteries.` },
  { emoji: "🍎", q: (a, b) => `On the space farm there are ${cnt(a, ["tree", "trees"])}. Each tree grows ${cnt(b, ["apple", "apples"])}. How many apples is that?`, why: (a, b) => `${a} × ${b} = ${a * b} apples.` },
];

// ─── Treasure Cove (Captain Polly) — division ────────────────────────────────
interface DivTpl {
  emoji: string;
  mode: "share" | "pack";
  q: (t: number, b: number) => string;
  why: (t: number, b: number, ans: number) => string;
}
const DIV: DivTpl[] = [
  { emoji: "🪙", mode: "share", q: (t, b) => `Captain Polly shares ${cnt(t, ["gold coin", "gold coins"])} equally among ${b} pirates. How many coins does each pirate get?`, why: (t, b, ans) => `${t} ÷ ${b} = ${ans}, because ${b} × ${ans} = ${t}.` },
  { emoji: "💎", mode: "pack", q: (t, b) => `The crew finds ${cnt(t, ["shiny gem", "shiny gems"])}. Polly packs ${b} gems in each chest. How many chests does she fill?`, why: (t, b, ans) => `${t} ÷ ${b} = ${ans} chests, because ${b} × ${ans} = ${t}.` },
  { emoji: "🍘", mode: "share", q: (t, b) => `${cnt(t, ["parrot cracker is", "parrot crackers are"])} split equally between ${b} hungry parrots on the ship. How many crackers does each parrot get?`, why: (t, b, ans) => `${t} ÷ ${b} = ${ans}.` },
  { emoji: "🦪", mode: "pack", q: (t, b) => `Captain Polly has ${cnt(t, ["pearl", "pearls"])} to make necklaces. Each necklace uses ${b} pearls. How many necklaces can she make?`, why: (t, b, ans) => `${t} ÷ ${b} = ${ans} necklaces.` },
  { emoji: "🏴‍☠️", mode: "pack", q: (t, b) => `${cnt(t, ["pirate climbs", "pirates climb"])} aboard little rowboats, ${b} pirates in each boat. How many rowboats are there?`, why: (t, b, ans) => `${t} ÷ ${b} = ${ans} boats, because ${b} × ${ans} = ${t}.` },
  { emoji: "🥈", mode: "share", q: (t, b) => `Polly digs up ${cnt(t, ["silver bar", "silver bars"])} and shares them equally with ${b} friends. How many bars does each friend receive?`, why: (t, b, ans) => `${t} ÷ ${b} = ${ans}.` },
  { emoji: "🍌", mode: "share", q: (t, b) => `The monkeys on Treasure Cove find ${cnt(t, ["banana", "bananas"])}. They share them equally between ${b} monkeys. How many bananas does each monkey get?`, why: (t, b, ans) => `${t} ÷ ${b} = ${ans}.` },
  { emoji: "🗺️", mode: "pack", q: (t, b) => `Polly has ${cnt(t, ["treasure map piece", "treasure map pieces"])}. A full map needs ${b} pieces. How many full maps can she make?`, why: (t, b, ans) => `${t} ÷ ${b} = ${ans} maps.` },
];

type ArithKind = "addition" | "subtraction" | "multiplication" | "division";

function arithmeticScene(kind: ArithKind, level: number, i: number, rand: () => number): Scene {
  const max = Math.round(5 * Math.pow(1.6, level));
  const n = (hi: number) => 1 + Math.floor(rand() * hi);
  const idx = (len: number) => (i - 1 + level) % len;
  switch (kind) {
    case "addition": {
      const a = n(max), b = n(max);
      const t = ADD[idx(ADD.length)];
      return {
        q: t.q(a, b), ans: a + b, why: t.why(a, b),
        visual: a + b <= MAX_ITEMS ? { type: "count", items: [{ emoji: t.emoji, count: a }, { emoji: t.emoji, count: b }] } : undefined,
      };
    }
    case "subtraction": {
      const a = n(max) + max, b = n(max);
      const t = SUB[idx(SUB.length)];
      return {
        q: t.q(a, b), ans: a - b, why: t.why(a, b),
        visual: a <= MAX_ITEMS ? { type: "takeaway", emoji: t.emoji, total: a, remove: b } : undefined,
      };
    }
    case "multiplication": {
      const a = 1 + n(Math.min(3 + level * 2, 20) - 1), b = 1 + n(Math.min(2 + level, 12) - 1); // at least 2 groups of 2+
      const t = MUL[idx(MUL.length)];
      return {
        q: t.q(a, b), ans: a * b, why: t.why(a, b),
        visual: a * b <= MAX_ITEMS ? { type: "groups", emoji: t.emoji, groups: a, each: b } : undefined,
      };
    }
    case "division": {
      const b = 2 + Math.floor(rand() * (Math.min(2 + level, 12) - 1));
      const ans = 1 + n(Math.min(3 + level * 2, 20));
      const total = b * ans;
      const t = DIV[idx(DIV.length)];
      let visual: Visual | undefined;
      if (total <= MAX_ITEMS) {
        if (t.mode === "share" && b <= 6) visual = { type: "share", emoji: t.emoji, total, plates: b };
        if (t.mode === "pack") visual = { type: "pack", emoji: t.emoji, total, size: b };
      }
      return { q: t.q(total, b), ans, why: t.why(total, b, ans), visual };
    }
  }
}

// ─── Pizza Planet (Chef Pie) — fractions ─────────────────────────────────────
function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

interface FractionScene {
  q: string;
  answer: string;
  wrong: string[];
  why: string;
  visual?: Visual;
}

function fractionScene(level: number, i: number, rand: () => number): FractionScene {
  const den = 2 + Math.floor(rand() * Math.min(2 + level, 12));
  const n1 = 1 + Math.floor(rand() * (den - 1));
  const toppings = ["pepperoni", "mushrooms", "olives", "sweetcorn", "peppers", "pineapple"];
  const topping = toppings[(i + level) % toppings.length];
  const pizza: Visual = { type: "pizza", slices: den };
  const pick = <T,>(list: T[]) => list[(i + level) % list.length];

  if (level <= 4) {
    const wrong = [`${den}/${n1}`, `${n1}/${den + 1}`, `${n1 + 1}/${den}`, `${n1}/${den + 2}`];
    const answer = `${n1}/${den}`;
    return pick<FractionScene>([
      { q: `Chef Pie cuts a pizza into ${den} equal slices. A hungry dragon gobbles up ${cnt(n1, ["slice", "slices"])}. What fraction of the pizza did the dragon eat?`, answer, wrong, why: `${n1} out of ${den} equal slices is ${n1}/${den}.`, visual: pizza },
      { q: `A pizza has ${den} equal slices. ${cnt(n1, ["slice", "slices"])} ${n1 === 1 ? "has" : "have"} ${topping}. What fraction of the pizza has ${topping}?`, answer, wrong, why: `${n1} of the ${den} slices have ${topping}, so ${n1}/${den}.`, visual: pizza },
      { q: `Chef Pie shares a pizza cut into ${den} equal slices. His friends take ${cnt(n1, ["slice", "slices"])}. What fraction of the pizza did his friends take?`, answer, wrong, why: `${n1} slices out of ${den} is ${n1}/${den}.`, visual: pizza },
      { q: `Chef Pie's robot helper sprinkles cheese on ${cnt(n1, ["slice", "slices"])} of a pizza that has ${den} equal slices. What fraction has cheese?`, answer, wrong, why: `${n1} of ${den} slices is ${n1}/${den}.`, visual: pizza },
    ]);
  }

  if (level <= 7) {
    if ((i + level) % 2 === 0) {
      // fraction of a set
      const d = 2 + Math.floor(rand() * Math.min(level, 4)); // 2..5
      const num = 1 + Math.floor(rand() * (d - 1));
      const k = 2 + Math.floor(rand() * 5);
      const total = d * k;
      const ans = num * k;
      return {
        q: `Chef Pie has ${total} olives. He puts ${num}/${d} of them on a pizza. How many olives are on the pizza?`,
        answer: String(ans),
        wrong: [String(ans + 1), String(Math.max(1, ans - 1)), String(ans * 2), String(k)],
        why: `Split ${total} into ${d} equal groups of ${k}. ${num} group${num === 1 ? "" : "s"} is ${ans}.`,
      };
    }
    const n2 = 1 + Math.floor(rand() * Math.max(1, den - n1));
    const sum = n1 + n2;
    return {
      q: pick([
        `Chef Pie eats ${n1}/${den} of a pizza for lunch and ${n2}/${den} of the same pizza for tea. How much of the pizza did he eat in all?`,
        `Chef Pie puts ${topping} on ${n1}/${den} of a pizza and cheese on another ${n2}/${den}. What fraction of the pizza is covered?`,
        `A pizza is cut into ${den} equal slices. Chef Pie serves ${n1}/${den} to a robot and ${n2}/${den} to a penguin. What fraction has he served?`,
      ]),
      answer: `${sum}/${den}`,
      wrong: [`${sum}/${den * 2}`, `${n1 * n2}/${den}`, `${sum + 1}/${den}`, `${sum}/${den + 1}`],
      why: `The slices are the same size, so add the tops: ${n1} + ${n2} = ${sum}. Keep ${den} on the bottom: ${sum}/${den}.`,
      visual: pizza,
    };
  }

  const k = 2 + Math.floor(rand() * 4);
  const a = 1 + Math.floor(rand() * 4);
  const b = a + 1 + Math.floor(rand() * 4);
  const g = gcd(a, b);
  const sa = a / g, sb = b / g;
  return {
    q: pick([
      `Chef Pie cuts a giant pizza into ${b * k} equal slices. ${a * k} slices have ${topping}. What fraction has ${topping}, in its simplest form?`,
      `A pizza has ${b * k} equal slices and Chef Pie serves ${a * k} of them. Write the fraction he served in its simplest form.`,
      `${a * k}/${b * k} of Chef Pie's pizza is gone. What is that fraction in its simplest form?`,
    ]),
    answer: `${sa}/${sb}`,
    wrong: [`${a * k}/${b * k}`, `${sa + 1}/${sb}`, `${sa}/${sb + 1}`, `${a * k}/${b}`, `${sa}/${sb + 2}`],
    why: `Divide the top and bottom by ${gcd(a * k, b * k)}: ${a * k}/${b * k} = ${sa}/${sb}.`,
  };
}

function fractionOptions(s: FractionScene, rand: () => number): string[] {
  const wrong = Array.from(new Set(s.wrong)).filter((w) => w !== s.answer).slice(0, 3);
  const isFraction = s.answer.includes("/");
  let pad = 3;
  while (wrong.length < 3) {
    const extra = isFraction ? `${pad}/${pad + 4}` : String(Number(s.answer) + pad);
    if (extra !== s.answer && !wrong.includes(extra)) wrong.push(extra);
    pad++;
  }
  return shuffle([s.answer, ...wrong], rand);
}

// ─── Public generators ───────────────────────────────────────────────────────

const WORLD_FOR_KIND = {
  addition: { topicId: "topic-addition", seed: 1, title: "Candy Kingdom story", helper: "Gummy" },
  subtraction: { topicId: "topic-subtraction", seed: 2, title: "Penguin Peaks story", helper: "Pip" },
  multiplication: { topicId: "topic-multiplication", seed: 3, title: "Rocket Galaxy story", helper: "Beep" },
  division: { topicId: "topic-division", seed: 4, title: "Treasure Cove story", helper: "Captain Polly" },
} as const;

export const rewards = (level: number) => ({ xpReward: 8 + level * 2, starReward: level >= 6 ? 2 : 1 });

export function generateStoryMath(): SeedExercise[] {
  const out: SeedExercise[] = [];
  for (const kind of Object.keys(WORLD_FOR_KIND) as ArithKind[]) {
    const w = WORLD_FOR_KIND[kind];
    for (let level = 1; level <= 10; level++) {
      const seen = new Set<string>();
      for (let i = 1; i <= STORIES_PER_LEVEL; i++) {
        let scene: Scene | null = null;
        let rand = rng(w.seed * 10_000 + level * 100 + i);
        // Re-roll the numbers if this exact story already exists at this level
        for (let attempt = 0; attempt < 40; attempt++) {
          rand = rng(w.seed * 10_000 + level * 100 + i + attempt * 7919);
          const candidate = arithmeticScene(kind, level, i, rand);
          if (!seen.has(candidate.q)) { scene = candidate; break; }
        }
        if (!scene) scene = arithmeticScene(kind, level, i, rand);
        seen.add(scene.q);
        out.push({
          id: `sq-${kind}-${level}-${i}`,
          topicId: w.topicId,
          title: w.title,
          instructions: `Help ${w.helper}! Choose the correct answer.`,
          type: "multiple_choice",
          difficulty: difficultyFor(level),
          level,
          ...rewards(level),
          data: {
            question: scene.q,
            options: numericOptions(scene.ans, rand),
            answer: String(scene.ans),
            explanation: scene.why,
            ...(scene.visual ? { visual: scene.visual } : {}),
          },
        });
      }
    }
  }
  return out;
}

export function generateStoryFractions(): SeedExercise[] {
  const out: SeedExercise[] = [];
  for (let level = 1; level <= 10; level++) {
    const seen = new Set<string>();
    for (let i = 1; i <= STORIES_PER_LEVEL; i++) {
      let scene: FractionScene | null = null;
      let rand = rng(50_000 + level * 100 + i);
      for (let attempt = 0; attempt < 40; attempt++) {
        rand = rng(50_000 + level * 100 + i + attempt * 7919);
        const candidate = fractionScene(level, i, rand);
        if (!seen.has(candidate.q)) { scene = candidate; break; }
      }
      if (!scene) scene = fractionScene(level, i, rand);
      seen.add(scene.q);
      out.push({
        id: `sq-fractions-${level}-${i}`,
        topicId: "topic-fractions",
        title: "Pizza Planet story",
        instructions: "Help Chef Pie! Choose the correct answer.",
        type: "multiple_choice",
        difficulty: difficultyFor(level),
        level,
        ...rewards(level),
        data: {
          question: scene.q,
          options: fractionOptions(scene, rand),
          answer: scene.answer,
          explanation: scene.why,
          ...(scene.visual ? { visual: scene.visual } : {}),
        },
      });
    }
  }
  return out;
}
