import { difficultyFor, rewards, rng, shuffle, type SeedExercise } from "./stories";
import type { Visual } from "../src/lib/question-types";

/**
 * Extra math worlds: Counting Garden (early learners), Shape City (geometry), Measure Mountain,
 * Clock Tower (time), Coin Market (money) and Graph Garden (data).
 * Deterministic (seeded) and self-checking: every question has four distinct options including the answer,
 * and every answer is computed, never typed by hand.
 */

type Rand = () => number;
const PER_LEVEL = 16;

interface Q {
  question: string;
  answer: string;
  wrong: string[];
  why: string;
  instructions?: string;
  visual?: Visual;
  icons?: Record<string, string>;
  /** keep the options in numeric order */
  sort?: boolean;
}

const int = (rand: Rand, lo: number, hi: number) => lo + Math.floor(rand() * (hi - lo + 1));
const pickOne = <T,>(list: readonly T[], rand: Rand): T => list[Math.floor(rand() * list.length)];

/** Three distinct wrong answers close to the number, never equal to it. */
function near(answer: number, rand: Rand, min = 0): string[] {
  const out = new Set<number>();
  let guard = 0;
  while (out.size < 3 && guard++ < 60) {
    const d = int(rand, 1, Math.max(3, Math.round(Math.abs(answer) * 0.3))) * (rand() < 0.5 ? -1 : 1);
    const c = answer + d;
    if (c !== answer && c >= min) out.add(c);
  }
  let pad = 1;
  while (out.size < 3) {
    if (answer + pad !== answer) out.add(answer + pad);
    pad++;
  }
  return [...out].map(String);
}

function build(
  prefix: string,
  topicId: string,
  title: string,
  seedBase: number,
  plan: Record<number, ((r: Rand, v: number) => Q)[]>,
  helper: string
): SeedExercise[] {
  const out: SeedExercise[] = [];
  for (let level = 1; level <= 10; level++) {
    const gens = plan[level];
    const seen = new Set<string>();
    for (let i = 1; i <= PER_LEVEL; i++) {
      let q: Q | null = null;
      let rand: Rand = rng(seedBase + level * 1000 + i);
      for (let attempt = 0; attempt < 80; attempt++) {
        rand = rng(seedBase + level * 1000 + i + attempt * 7919);
        const cand = gens[(i - 1) % gens.length](rand, i);
        const key = `${cand.question}|${cand.answer}|${JSON.stringify(cand.visual ?? null)}`;
        if (!seen.has(key)) { q = cand; seen.add(key); break; }
      }
      if (!q) continue;
      const wrong = [...new Set(q.wrong)].filter((w) => w !== q!.answer).slice(0, 3);
      if (wrong.length !== 3) throw new Error(`${prefix}-${level}-${i}: needs 3 distinct wrong answers (${q.question})`);
      const options = q.sort
        ? [q.answer, ...wrong].sort((a, b) => Number(a.replace(/[^\d.-]/g, "")) - Number(b.replace(/[^\d.-]/g, "")))
        : shuffle([q.answer, ...wrong], rand);
      out.push({
        id: `${prefix}-${level}-${i}`,
        topicId,
        title,
        instructions: q.instructions ?? `Help ${helper}! Choose the correct answer.`,
        type: "multiple_choice",
        difficulty: difficultyFor(level),
        level,
        ...rewards(level),
        data: {
          question: q.question, options, answer: q.answer, explanation: q.why,
          ...(q.visual ? { visual: q.visual } : {}),
          ...(q.icons ? { icons: q.icons } : {}),
        },
      });
    }
  }
  return out;
}

// ─── Counting Garden (early learners, Freddie the fox) ───────────────────────

const GARDEN: [string, string, string][] = [
  ["flower", "flowers", "🌸"], ["apple", "apples", "🍎"], ["butterfly", "butterflies", "🦋"],
  ["ladybug", "ladybugs", "🐞"], ["carrot", "carrots", "🥕"], ["bee", "bees", "🐝"],
  ["strawberry", "strawberries", "🍓"], ["mushroom", "mushrooms", "🍄"],
];
const noun = (n: number, g: [string, string, string]) => (n === 1 ? g[0] : g[1]);

function countQ(max: number) {
  return (rand: Rand): Q => {
    const g = pickOne(GARDEN, rand);
    const n = int(rand, 1, max);
    return {
      question: `How many ${g[1]} are in Freddie's garden?`,
      answer: String(n),
      wrong: near(n, rand, 0).map((w) => (Number(w) === 0 ? String(n + 4) : w)),
      why: `Touch each ${g[0]} once. The last number you say is ${n}.`,
      instructions: "Tap each picture to count.",
      visual: { type: "count", items: [{ emoji: g[2], count: n }] },
      sort: true,
    };
  };
}

function moreLessQ(max: number) {
  return (rand: Rand): Q => {
    const g = pickOne(GARDEN, rand);
    const a = int(rand, 1, max);
    let b = int(rand, 1, max);
    if (b === a) b = a === max ? a - 1 : a + 1;
    const more = rand() < 0.5;
    const answer = more ? (a > b ? "the first group" : "the second group") : a < b ? "the first group" : "the second group";
    return {
      question: `There are ${a} ${noun(a, g)} in the first group and ${b} ${noun(b, g)} in the second group. Which group has ${more ? "more" : "fewer"}?`,
      answer,
      wrong: ["the first group", "the second group"].filter((o) => o !== answer).concat(["they are the same", "we cannot tell"]),
      why: `${Math.max(a, b)} is bigger than ${Math.min(a, b)}, so the ${(a > b) === more ? "first" : "second"} group has ${more ? "more" : "fewer"}.`,
      instructions: "Count both groups.",
      visual: { type: "count", items: [{ emoji: g[2], count: a }, { emoji: g[2], count: b }] },
    };
  };
}

function nextNumberQ(max: number) {
  return (rand: Rand): Q => {
    const n = int(rand, 1, max - 1);
    return {
      question: `What number comes right after ${n}?`,
      answer: String(n + 1),
      wrong: [String(n - 1 < 0 ? n + 2 : n - 1), String(n + 2), String(n)],
      why: `Count on: ${n}, then ${n + 1}.`,
      instructions: "Think of counting up.",
      visual: { type: "number_line", min: Math.max(0, n - 2), max: n + 3 },
      sort: true,
    };
  };
}

function addPicQ(max: number) {
  return (rand: Rand): Q => {
    const g = pickOne(GARDEN, rand);
    const a = int(rand, 1, max);
    const b = int(rand, 1, max);
    return {
      question: `Freddie sees ${a} ${noun(a, g)} and ${b} more ${noun(b, g)}. How many does he see in all?`,
      answer: String(a + b),
      wrong: near(a + b, rand, 0),
      why: `${a} + ${b} = ${a + b}. Count them all together.`,
      instructions: "Put the two groups together.",
      visual: { type: "count", items: [{ emoji: g[2], count: a }, { emoji: g[2], count: b }] },
      sort: true,
    };
  };
}

function takePicQ(max: number) {
  return (rand: Rand): Q => {
    const g = pickOne(GARDEN, rand);
    const total = int(rand, 3, max);
    const gone = int(rand, 1, total - 1);
    return {
      question: `There are ${total} ${g[1]}. Freddie picks ${gone}. How many are left?`,
      answer: String(total - gone),
      wrong: near(total - gone, rand, 0),
      why: `${total} − ${gone} = ${total - gone}. Take ${gone} away and count the rest.`,
      instructions: "Tap the ones that go away.",
      visual: { type: "takeaway", emoji: g[2], total, remove: gone },
      sort: true,
    };
  };
}

function shapeNameQ(rand: Rand): Q {
  const shapes: [string, string][] = [["circle", "🔴"], ["square", "🟦"], ["triangle", "🔺"], ["heart", "❤️"], ["star", "⭐"]];
  const s = pickOne(shapes, rand);
  const others = shapes.filter((x) => x[0] !== s[0]).map((x) => x[0]);
  return {
    question: `Which shape is this: ${s[1]}?`,
    answer: s[0],
    wrong: shuffle(others, rand).slice(0, 3),
    why: `This is a ${s[0]}.`,
    instructions: "Look at the picture.",
  };
}

const COUNTING_PLAN: Record<number, ((r: Rand) => Q)[]> = {
  1: [countQ(5), nextNumberQ(5)],
  2: [countQ(8), moreLessQ(6), nextNumberQ(9)],
  3: [countQ(10), moreLessQ(10), addPicQ(4)],
  4: [countQ(12), addPicQ(5), takePicQ(8)],
  5: [addPicQ(6), takePicQ(10), moreLessQ(12)],
  6: [addPicQ(8), takePicQ(12), nextNumberQ(20)],
  7: [addPicQ(9), takePicQ(14), countQ(15)],
  8: [addPicQ(10), takePicQ(15), nextNumberQ(50)],
  9: [addPicQ(12), takePicQ(18), moreLessQ(18)],
  10: [addPicQ(14), takePicQ(20), nextNumberQ(99)],
};
// A few shape names for the very first levels
COUNTING_PLAN[1].push(shapeNameQ);
COUNTING_PLAN[2].push(shapeNameQ);

export function generateCounting(): SeedExercise[] {
  return build("mx-ct", "topic-counting", "Counting Garden", 400_000, COUNTING_PLAN, "Freddie");
}

// ─── Shape City (geometry, Zig the fox) ──────────────────────────────────────

const SHAPES: [string, number, number][] = [
  ["triangle", 3, 3], ["square", 4, 4], ["rectangle", 4, 4], ["pentagon", 5, 5], ["hexagon", 6, 6], ["octagon", 8, 8],
];

function sidesQ(rand: Rand): Q {
  const s = pickOne(SHAPES, rand);
  return {
    question: `How many sides does a ${s[0]} have?`,
    answer: String(s[1]),
    wrong: near(s[1], rand, 2),
    why: `A ${s[0]} has ${s[1]} sides.`,
    sort: true,
  };
}
function cornersQ(rand: Rand): Q {
  const s = pickOne(SHAPES, rand);
  return {
    question: `How many corners does a ${s[0]} have?`,
    answer: String(s[2]),
    wrong: near(s[2], rand, 2),
    why: `A ${s[0]} has ${s[2]} corners, the same as its number of sides.`,
    sort: true,
  };
}
function shapeFromSidesQ(rand: Rand): Q {
  const s = pickOne(SHAPES.filter((x) => x[0] !== "rectangle"), rand);
  const wrong = SHAPES.filter((x) => x[0] !== s[0] && x[1] !== s[1]).map((x) => x[0]);
  return {
    question: `Which shape has ${s[1]} sides? (It is not a rectangle.)`,
    answer: s[0],
    wrong: shuffle(wrong, rand).slice(0, 3),
    why: `A ${s[0]} has ${s[1]} sides.`,
  };
}
function perimeterQ(lo: number, hi: number) {
  return (rand: Rand): Q => {
    const l = int(rand, lo, hi);
    const w = int(rand, lo, Math.max(lo, l - 1));
    const p = 2 * (l + w);
    return {
      question: `A rectangle is ${l} cm long and ${w} cm wide. What is the distance all the way around it?`,
      answer: `${p} cm`,
      wrong: near(p, rand, 4).map((x) => `${x} cm`),
      why: `Add all four sides: ${l} + ${w} + ${l} + ${w} = ${p} cm.`,
      instructions: "Perimeter means adding every side.",
      sort: true,
    };
  };
}
function areaQ(lo: number, hi: number) {
  return (rand: Rand): Q => {
    const l = int(rand, lo, hi);
    const w = int(rand, lo, hi);
    const a = l * w;
    return {
      question: `A rectangle has ${l} rows of ${w} squares. What is its area in square units?`,
      answer: String(a),
      wrong: near(a, rand, 1),
      why: `Area = ${l} × ${w} = ${a} square units.`,
      instructions: "Area is how many squares fit inside.",
      visual: { type: "grid", rows: l, cols: w, emoji: "🟦" },
      sort: true,
    };
  };
}
function symmetryQ(rand: Rand): Q {
  const sym: [string, boolean][] = [["butterfly", true], ["heart", true], ["letter A", true], ["letter F", false], ["letter R", false], ["circle", true], ["scalene triangle", false]];
  const s = pickOne(sym, rand);
  const yes = "Yes";
  const no = "No";
  return {
    question: `Can you fold a ${s[0]} in half so both sides match exactly?`,
    answer: s[1] ? yes : no,
    wrong: [s[1] ? no : yes, "Only sometimes", "Not enough information"],
    why: s[1] ? `A ${s[0]} has a line of symmetry: both halves match.` : `A ${s[0]} has no line of symmetry.`,
  };
}
function angleQ(rand: Rand): Q {
  const a: [string, string][] = [["a square corner", "right angle"], ["an angle smaller than a square corner", "acute angle"], ["an angle bigger than a square corner", "obtuse angle"]];
  const s = pickOne(a, rand);
  return {
    question: `What do we call ${s[0]}?`,
    answer: s[1],
    wrong: a.filter((x) => x[1] !== s[1]).map((x) => x[1]).concat(["straight line"]),
    why: `${s[0]} is called a ${s[1]}.`,
  };
}
function solidQ(rand: Rand): Q {
  const s: [string, string, string][] = [["ball", "sphere", "⚽"], ["can", "cylinder", "🥫"], ["dice", "cube", "🎲"], ["party hat", "cone", "🎉"]];
  const t = pickOne(s, rand);
  return {
    question: `A ${t[0]} ${t[2]} has which 3D shape?`,
    answer: t[1],
    wrong: s.filter((x) => x[1] !== t[1]).map((x) => x[1]),
    why: `A ${t[0]} is shaped like a ${t[1]}.`,
  };
}

const GEOMETRY_PLAN: Record<number, ((r: Rand) => Q)[]> = {
  1: [shapeNameQ, sidesQ],
  2: [sidesQ, cornersQ, shapeNameQ],
  3: [sidesQ, shapeFromSidesQ, solidQ],
  4: [shapeFromSidesQ, solidQ, symmetryQ],
  5: [symmetryQ, perimeterQ(2, 8), areaQ(2, 5)],
  6: [perimeterQ(3, 12), areaQ(3, 7), angleQ],
  7: [perimeterQ(5, 15), areaQ(4, 9), angleQ],
  8: [perimeterQ(8, 25), areaQ(5, 10), angleQ],
  9: [perimeterQ(10, 30), areaQ(6, 12), symmetryQ],
  10: [perimeterQ(15, 40), areaQ(8, 13), angleQ],
};

export function generateGeometry(): SeedExercise[] {
  return build("mx-ge", "topic-geometry", "Shape City", 410_000, GEOMETRY_PLAN, "Zig");
}

// ─── Measure Mountain (Rory the penguin) ─────────────────────────────────────

function rulerQ(maxLen: number) {
  return (rand: Rand): Q => {
    const items = ["pencil", "crayon", "leaf", "key", "ribbon", "toy car"];
    const item = pickOne(items, rand);
    const len = int(rand, 2, maxLen);
    return {
      question: `A ${item} starts at 0 on a ruler and ends at ${len}. How long is the ${item}?`,
      answer: `${len} cm`,
      wrong: near(len, rand, 1).map((x) => `${x} cm`),
      why: `It starts at 0 and ends at ${len}, so it is ${len} cm long.`,
      instructions: "Read where the object ends.",
      visual: { type: "number_line", min: 0, max: Math.max(10, len + 2), label: "Ruler (cm)" },
      sort: true,
    };
  };
}
function compareLengthQ(rand: Rand): Q {
  const a = int(rand, 5, 40);
  const b = int(rand, 5, 40);
  const bb = b === a ? b + 3 : b;
  const longer = a > bb ? "the pencil" : "the stick";
  return {
    question: `A pencil is ${a} cm long and a stick is ${bb} cm long. Which is longer?`,
    answer: longer,
    wrong: [longer === "the pencil" ? "the stick" : "the pencil", "they are the same", "we cannot tell"],
    why: `${Math.max(a, bb)} cm is more than ${Math.min(a, bb)} cm, so ${longer} is longer.`,
  };
}
function unitQ(rand: Rand): Q {
  const items: [string, string, string[]][] = [
    ["the length of a classroom", "metres", ["centimetres", "kilometres", "grams"]],
    ["the length of an ant", "millimetres", ["metres", "kilometres", "kilograms"]],
    ["the weight of an apple", "grams", ["kilograms", "metres", "litres"]],
    ["the weight of a car", "kilograms", ["grams", "centimetres", "millilitres"]],
    ["the water in a bathtub", "litres", ["millilitres", "grams", "centimetres"]],
    ["the water in a spoon", "millilitres", ["litres", "kilograms", "metres"]],
    ["the distance between two cities", "kilometres", ["metres", "centimetres", "grams"]],
  ];
  const t = pickOne(items, rand);
  return {
    question: `Which unit is best for measuring ${t[0]}?`,
    answer: t[1],
    wrong: t[2],
    why: `${t[1]} are the best size of unit for ${t[0]}.`,
  };
}
function convertQ(rand: Rand): Q {
  const pairs: [number, string, string, number][] = [[100, "centimetres", "metre", 1], [1000, "metres", "kilometre", 1], [1000, "grams", "kilogram", 1], [1000, "millilitres", "litre", 1]];
  const p = pickOne(pairs, rand);
  const k = int(rand, 2, 9);
  return {
    question: `How many ${p[1]} are in ${k} ${p[2]}s?`,
    answer: String(p[0] * k),
    wrong: [String(p[0] * k * 10), String(p[0] * (k + 1)), String(p[0] / 10 * k)],
    why: `1 ${p[2]} = ${p[0]} ${p[1]}. So ${k} ${p[2]}s = ${k} × ${p[0]} = ${p[0] * k} ${p[1]}.`,
    sort: true,
  };
}
function differenceQ(max: number) {
  return (rand: Rand): Q => {
    const a = int(rand, 20, max);
    const b = int(rand, 5, a - 5);
    return {
      question: `A rope is ${a} cm long. Rory cuts off ${b} cm. How long is the rope now?`,
      answer: `${a - b} cm`,
      wrong: near(a - b, rand, 1).map((x) => `${x} cm`),
      why: `${a} − ${b} = ${a - b} cm.`,
      sort: true,
    };
  };
}
function capacityQ(rand: Rand): Q {
  const cups = int(rand, 2, 9);
  const per = int(rand, 2, 5);
  return {
    question: `Rory fills ${cups} jugs. Each jug holds ${per} litres. How many litres is that in all?`,
    answer: `${cups * per} litres`,
    wrong: near(cups * per, rand, 1).map((x) => `${x} litres`),
    why: `${cups} × ${per} = ${cups * per} litres.`,
    sort: true,
  };
}

const MEASUREMENT_PLAN: Record<number, ((r: Rand) => Q)[]> = {
  1: [rulerQ(6), compareLengthQ],
  2: [rulerQ(10), compareLengthQ],
  3: [rulerQ(12), unitQ, compareLengthQ],
  4: [unitQ, differenceQ(60), rulerQ(14)],
  5: [unitQ, differenceQ(80), capacityQ],
  6: [convertQ, differenceQ(100), capacityQ],
  7: [convertQ, unitQ, capacityQ],
  8: [convertQ, differenceQ(200), capacityQ],
  9: [convertQ, capacityQ, differenceQ(300)],
  10: [convertQ, capacityQ, differenceQ(500)],
};

export function generateMeasurement(): SeedExercise[] {
  return build("mx-me", "topic-measurement", "Measure Mountain", 420_000, MEASUREMENT_PLAN, "Rory");
}

// ─── Clock Tower (time, Tick the owl) ────────────────────────────────────────

const pad2 = (n: number) => String(n).padStart(2, "0");
const clockText = (h: number, m: number) => `${h}:${pad2(m)}`;

function clockQ(minutes: number[]) {
  return (rand: Rand): Q => {
    const h = int(rand, 1, 12);
    const m = pickOne(minutes, rand);
    const answer = clockText(h, m);
    const wrong = new Set<string>();
    wrong.add(clockText(h, (m + 30) % 60));
    wrong.add(clockText(h === 12 ? 1 : h + 1, m));
    wrong.add(clockText(h, (m + 15) % 60));
    wrong.add(clockText(h === 1 ? 12 : h - 1, m));
    wrong.delete(answer);
    return {
      question: "What time does the clock show?",
      answer,
      wrong: [...wrong],
      why: `The short hand points near ${h} and the long hand points to ${m / 5 || 12}, so the time is ${answer}.`,
      instructions: "Short hand = hour. Long hand = minutes.",
      visual: { type: "clock", hour: h, minute: m },
    };
  };
}
function elapsedQ(maxHours: number) {
  return (rand: Rand): Q => {
    const h = int(rand, 1, 12 - maxHours);
    const add = int(rand, 1, maxHours);
    return {
      question: `Tick starts reading at ${h}:00. She reads for ${add} hour${add === 1 ? "" : "s"}. What time does she stop?`,
      answer: `${h + add}:00`,
      wrong: [`${h + add + 1}:00`, `${h + add - 1 < 1 ? 12 : h + add - 1}:00`, `${h}:30`],
      why: `${h} + ${add} = ${h + add}, so she stops at ${h + add}:00.`,
    };
  };
}
function minutesElapsedQ(rand: Rand): Q {
  const start = pickOne([0, 15, 30, 45], rand);
  const dur = pickOne([15, 20, 25, 30, 40, 45], rand);
  const endTotal = start + dur;
  const endMin = endTotal % 60;
  const endHour = 3 + Math.floor(endTotal / 60);
  const answer = clockText(endHour, endMin);
  return {
    question: `A lesson starts at ${clockText(3, start)} and lasts ${dur} minutes. When does it end?`,
    answer,
    wrong: [clockText(endHour, (endMin + 10) % 60), clockText(endHour + 1, endMin), clockText(endHour, (endMin + 50) % 60)],
    why: `${clockText(3, start)} plus ${dur} minutes is ${answer}.`,
  };
}
function daysQ(rand: Rand): Q {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const i = int(rand, 0, 6);
  const k = int(rand, 1, 4);
  const answer = days[(i + k) % 7];
  return {
    question: `Today is ${days[i]}. What day will it be in ${k} day${k === 1 ? "" : "s"}?`,
    answer,
    wrong: shuffle(days.filter((d) => d !== answer), rand).slice(0, 3),
    why: `Count forward ${k} from ${days[i]}: it is ${answer}.`,
  };
}
function monthsQ(rand: Rand): Q {
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const i = int(rand, 0, 11);
  const answer = months[(i + 1) % 12];
  return {
    question: `Which month comes right after ${months[i]}?`,
    answer,
    wrong: shuffle(months.filter((m) => m !== answer && m !== months[i]), rand).slice(0, 3),
    why: `After ${months[i]} comes ${answer}.`,
  };
}
function quarterQ(rand: Rand): Q {
  const t: [string, string][] = [["quarter past 4", "4:15"], ["half past 7", "7:30"], ["quarter to 9", "8:45"], ["o'clock at 6", "6:00"], ["half past 2", "2:30"], ["quarter past 11", "11:15"]];
  const s = pickOne(t, rand);
  return {
    question: `Which time is ${s[0]}?`,
    answer: s[1],
    wrong: shuffle(t.filter((x) => x[1] !== s[1]).map((x) => x[1]), rand).slice(0, 3),
    why: `${s[0]} is ${s[1]}.`,
  };
}

const TIME_PLAN: Record<number, ((r: Rand) => Q)[]> = {
  1: [clockQ([0]), daysQ],
  2: [clockQ([0, 30]), daysQ, monthsQ],
  3: [clockQ([0, 30]), quarterQ, monthsQ],
  4: [clockQ([0, 15, 30, 45]), quarterQ, elapsedQ(3)],
  5: [clockQ([0, 15, 30, 45]), elapsedQ(4), daysQ],
  6: [clockQ([0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]), elapsedQ(5), minutesElapsedQ],
  7: [clockQ([0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]), minutesElapsedQ, daysQ],
  8: [clockQ([5, 10, 20, 25, 35, 40, 50, 55]), minutesElapsedQ, elapsedQ(6)],
  9: [clockQ([5, 10, 20, 25, 35, 40, 50, 55]), minutesElapsedQ],
  10: [clockQ([5, 10, 20, 25, 35, 40, 50, 55]), minutesElapsedQ, elapsedQ(8)],
};

export function generateTime(): SeedExercise[] {
  return build("mx-ti", "topic-time", "Clock Tower", 430_000, TIME_PLAN, "Tick");
}

// ─── Coin Market (money, Penny the parrot) ───────────────────────────────────

const COINS: [string, number, string][] = [["penny", 1, "🟤"], ["nickel", 5, "⚪"], ["dime", 10, "🔘"], ["quarter", 25, "🪙"]];

function coinValueQ(rand: Rand): Q {
  const c = pickOne(COINS, rand);
  const wrong = COINS.filter((x) => x[0] !== c[0]).map((x) => `${x[1]}¢`);
  return {
    question: `How many cents is a ${c[0]} worth?`,
    answer: `${c[1]}¢`,
    wrong: wrong.concat(["50¢"]).slice(0, 3),
    why: `A ${c[0]} is worth ${c[1]}¢.`,
  };
}
function whichCoinQ(rand: Rand): Q {
  const c = pickOne(COINS, rand);
  return {
    question: `Which coin is worth ${c[1]}¢?`,
    answer: `a ${c[0]}`,
    wrong: COINS.filter((x) => x[0] !== c[0]).map((x) => `a ${x[0]}`),
    why: `A ${c[0]} is worth ${c[1]}¢.`,
  };
}
function moreCoinQ(rand: Rand): Q {
  const [a, b] = shuffle(COINS, rand).slice(0, 2);
  const big = a[1] > b[1] ? a : b;
  const small = a[1] > b[1] ? b : a;
  return {
    question: `Which is worth more: a ${a[0]} or a ${b[0]}?`,
    answer: `a ${big[0]}`,
    wrong: [`a ${small[0]}`, "they are worth the same", "you cannot tell"],
    why: `A ${big[0]} is ${big[1]}¢ and a ${small[0]} is ${small[1]}¢.`,
  };
}
function countCoinsQ(maxN: number) {
  return (rand: Rand): Q => {
    const c = pickOne(COINS.slice(0, 3), rand);
    const n = int(rand, 2, maxN);
    return {
      question: `Penny has ${n} ${c[0] === "penny" ? "pennies" : c[0] + "s"}. How many cents is that?`,
      answer: `${n * c[1]}¢`,
      wrong: near(n * c[1], rand, 1).map((x) => `${x}¢`),
      why: `${n} × ${c[1]}¢ = ${n * c[1]}¢.`,
      sort: true,
    };
  };
}
function coinSumQ(maxEach: number) {
  return (rand: Rand): Q => {
    const picks = COINS.filter(() => rand() < 0.7);
    const use = picks.length >= 2 ? picks : COINS.slice(1, 3);
    let total = 0;
    const parts: string[] = [];
    for (const c of use) {
      const n = int(rand, 1, maxEach);
      total += n * c[1];
      parts.push(`${n} ${c[0]}${n === 1 ? "" : "s"}`);
    }
    return {
      question: `Penny has ${parts.join(", ").replace(/, ([^,]*)$/, " and $1")}. How many cents is that?`,
      answer: `${total}¢`,
      wrong: near(total, rand, 1).map((x) => `${x}¢`),
      why: `Add the coins: ${parts.join(" + ")} = ${total}¢.`,
      sort: true,
    };
  };
}
function priceTotalQ(maxPrice: number) {
  return (rand: Rand): Q => {
    const items: [string, string][] = [["apple", "🍎"], ["banana", "🍌"], ["sticker", "⭐"], ["pencil", "✏️"], ["cookie", "🍪"]];
    const a = pickOne(items, rand);
    const b = pickOne(items.filter((x) => x[0] !== a[0]), rand);
    const pa = int(rand, 5, maxPrice);
    const pb = int(rand, 5, maxPrice);
    return {
      question: `A ${a[0]} ${a[1]} costs ${pa}¢ and a ${b[0]} ${b[1]} costs ${pb}¢. How much for both?`,
      answer: `${pa + pb}¢`,
      wrong: near(pa + pb, rand, 1).map((x) => `${x}¢`),
      why: `${pa} + ${pb} = ${pa + pb}¢.`,
      sort: true,
    };
  };
}
function changeQ(maxPrice: number) {
  return (rand: Rand): Q => {
    const price = int(rand, 5, maxPrice);
    const paid = Math.ceil((price + 1) / 25) * 25;
    return {
      question: `A toy costs ${price}¢. Penny pays with ${paid}¢. How much change does she get?`,
      answer: `${paid - price}¢`,
      wrong: near(paid - price, rand, 1).map((x) => `${x}¢`),
      why: `${paid} − ${price} = ${paid - price}¢ change.`,
      sort: true,
    };
  };
}
function dollarsQ(maxDollars: number) {
  return (rand: Rand): Q => {
    const a = int(rand, 100, maxDollars * 100) / 100;
    const b = int(rand, 100, maxDollars * 100) / 100;
    const fmt = (n: number) => `$${n.toFixed(2)}`;
    const sum = Math.round((a + b) * 100) / 100;
    return {
      question: `Maya buys a book for ${fmt(a)} and a pen for ${fmt(b)}. How much does she spend?`,
      answer: fmt(sum),
      wrong: [fmt(sum + 0.1), fmt(sum - 0.1 > 0 ? sum - 0.1 : sum + 0.2), fmt(sum + 1)],
      why: `${fmt(a)} + ${fmt(b)} = ${fmt(sum)}.`,
      sort: true,
    };
  };
}
function savingQ(rand: Rand): Q {
  const week = int(rand, 2, 9);
  const weeks = int(rand, 3, 8);
  return {
    question: `Penny saves $${week} each week. How much does she have after ${weeks} weeks?`,
    answer: `$${week * weeks}`,
    wrong: near(week * weeks, rand, 1).map((x) => `$${x}`),
    why: `${week} × ${weeks} = $${week * weeks}.`,
    sort: true,
  };
}

const MONEY_PLAN: Record<number, ((r: Rand) => Q)[]> = {
  1: [coinValueQ, whichCoinQ, moreCoinQ, countCoinsQ(5)],
  2: [moreCoinQ, countCoinsQ(9), coinSumQ(1)],
  3: [coinSumQ(2), priceTotalQ(15)],
  4: [coinSumQ(3), priceTotalQ(25), changeQ(24)],
  5: [coinSumQ(4), priceTotalQ(40), changeQ(45)],
  6: [priceTotalQ(60), changeQ(70), dollarsQ(5)],
  7: [dollarsQ(9), changeQ(90), savingQ],
  8: [dollarsQ(15), savingQ, changeQ(95)],
  9: [dollarsQ(25), savingQ],
  10: [dollarsQ(50), savingQ],
};

export function generateMoney(): SeedExercise[] {
  return build("mx-mo", "topic-money", "Coin Market", 440_000, MONEY_PLAN, "Penny");
}

// ─── Graph Garden (data, Barney the bear) ────────────────────────────────────

const CATS: [string, string][] = [["apples", "🍎"], ["pears", "🍐"], ["bananas", "🍌"], ["grapes", "🍇"], ["cherries", "🍒"], ["oranges", "🍊"]];

/** A tiny text bar chart the child reads from the question itself. */
function chart(items: { label: string; n: number }[]): string {
  return items.map((i) => `${i.label}: ${"█".repeat(i.n)} (${i.n})`).join("   ");
}

function pickChart(rand: Rand, cats: number, max: number) {
  const chosen = shuffle(CATS, rand).slice(0, cats);
  const used = new Set<number>();
  return chosen.map((c) => {
    let n = int(rand, 1, max);
    let guard = 0;
    while (used.has(n) && guard++ < 20) n = int(rand, 1, max);
    used.add(n);
    return { label: c[0], n };
  });
}

function mostQ(cats: number, max: number) {
  return (rand: Rand): Q => {
    const items = pickChart(rand, cats, max);
    const top = [...items].sort((a, b) => b.n - a.n)[0];
    return {
      question: `Barney counted fruit. ${chart(items)}. Which fruit has the most?`,
      answer: top.label,
      wrong: items.filter((i) => i !== top).map((i) => i.label).concat(["they are all equal", "it is a tie", "you cannot tell"]),
      why: `${top.label} has ${top.n}, which is the biggest number.`,
      instructions: "Look for the longest bar.",
    };
  };
}
function leastQ(cats: number, max: number) {
  return (rand: Rand): Q => {
    const items = pickChart(rand, cats, max);
    const low = [...items].sort((a, b) => a.n - b.n)[0];
    return {
      question: `Barney counted fruit. ${chart(items)}. Which fruit has the fewest?`,
      answer: low.label,
      wrong: items.filter((i) => i !== low).map((i) => i.label).concat(["they are all equal", "it is a tie", "you cannot tell"]),
      why: `${low.label} has ${low.n}, which is the smallest number.`,
      instructions: "Look for the shortest bar.",
    };
  };
}
function readQ(cats: number, max: number) {
  return (rand: Rand): Q => {
    const items = pickChart(rand, cats, max);
    const t = pickOne(items, rand);
    return {
      question: `${chart(items)}. How many ${t.label} are there?`,
      answer: String(t.n),
      wrong: near(t.n, rand, 0),
      why: `The ${t.label} bar is ${t.n} long.`,
      sort: true,
    };
  };
}
function differenceChartQ(cats: number, max: number) {
  return (rand: Rand): Q => {
    const items = pickChart(rand, cats, max);
    const [a, b] = shuffle(items, rand);
    const d = Math.abs(a.n - b.n);
    const bigger = a.n > b.n ? a : b;
    const smaller = a.n > b.n ? b : a;
    return {
      question: `${chart(items)}. How many more ${bigger.label} than ${smaller.label}?`,
      answer: String(d),
      wrong: near(d, rand, 0).map((x) => (Number(x) === 0 ? String(d + 4) : x)),
      why: `${bigger.n} − ${smaller.n} = ${d}.`,
      sort: true,
    };
  };
}
function totalChartQ(cats: number, max: number) {
  return (rand: Rand): Q => {
    const items = pickChart(rand, cats, max);
    const total = items.reduce((s, i) => s + i.n, 0);
    return {
      question: `${chart(items)}. How many pieces of fruit are there in all?`,
      answer: String(total),
      wrong: near(total, rand, 1),
      why: `Add them up: ${items.map((i) => i.n).join(" + ")} = ${total}.`,
      sort: true,
    };
  };
}
function averageQ(rand: Rand): Q {
  const mean = int(rand, 3, 12);
  const a = mean - int(rand, 1, 2);
  const b = mean + int(rand, 1, 2);
  const c = mean * 3 - a - b;
  const nums = shuffle([a, b, c], rand);
  return {
    question: `Barney scored ${nums.join(", ")} in three games. What is the mean (average) score?`,
    answer: String(mean),
    wrong: near(mean, rand, 1),
    why: `Add them: ${nums.join(" + ")} = ${mean * 3}. Divide by 3: ${mean}.`,
    sort: true,
  };
}
function modeQ(rand: Rand): Q {
  const m = int(rand, 2, 9);
  const others = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9, 10].filter((x) => x !== m), rand).slice(0, 3);
  const list = shuffle([m, m, m, others[0], others[1], others[2]], rand);
  return {
    question: `Which number appears most often: ${list.join(", ")}?`,
    answer: String(m),
    wrong: others.map(String),
    why: `${m} appears 3 times. That is the mode.`,
    sort: true,
  };
}

const DATA_PLAN: Record<number, ((r: Rand) => Q)[]> = {
  1: [mostQ(2, 6), leastQ(2, 6)],
  2: [mostQ(3, 7), leastQ(3, 7), readQ(3, 8)],
  3: [readQ(3, 9), mostQ(4, 9), leastQ(4, 9)],
  4: [readQ(4, 10), differenceChartQ(3, 10), mostQ(4, 12)],
  5: [differenceChartQ(4, 12), totalChartQ(3, 9), readQ(4, 12)],
  6: [totalChartQ(4, 10), differenceChartQ(4, 14), modeQ],
  7: [totalChartQ(4, 12), differenceChartQ(5, 15), modeQ],
  8: [totalChartQ(5, 12), modeQ, averageQ],
  9: [averageQ, totalChartQ(5, 15), modeQ],
  10: [averageQ, totalChartQ(6, 15), modeQ],
};

export function generateData(): SeedExercise[] {
  return build("mx-da", "topic-data", "Graph Garden", 450_000, DATA_PLAN, "Barney");
}
