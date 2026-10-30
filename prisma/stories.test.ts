import { describe, expect, it } from "vitest";
import { buildExercises } from "./content";
import { generateStoryFractions, generateStoryMath, STORIES_PER_LEVEL } from "./stories";
import { generateComprehension, generatePhonics, generateVocabulary } from "./reading";
import type { Visual } from "../src/lib/question-types";

type Q = { question: string; options: string[]; answer: string; visual?: Visual; passage?: string; icons?: Record<string, string> };
const dataOf = (e: { data: unknown }) => e.data as Q;

describe("story question bank", () => {
  const math = generateStoryMath();
  const fractions = generateStoryFractions();
  const all = buildExercises();

  it("has the expected volume", () => {
    expect(math).toHaveLength(4 * 10 * STORIES_PER_LEVEL);
    expect(fractions).toHaveLength(10 * STORIES_PER_LEVEL);
  });

  it("has unique ids across the whole bank", () => {
    const ids = all.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("is deterministic so re-seeding is idempotent", () => {
    expect(JSON.stringify(generateStoryMath())).toBe(JSON.stringify(math));
    expect(JSON.stringify(generatePhonics())).toBe(JSON.stringify(generatePhonics()));
  });

  it("every level of every topic has enough questions to keep a child going", () => {
    const counts = new Map<string, number>();
    for (const e of all) counts.set(`${e.topicId}|${e.level}`, (counts.get(`${e.topicId}|${e.level}`) ?? 0) + 1);
    for (const [key, n] of counts) expect(n, key).toBeGreaterThanOrEqual(10);
  });

  it("every multiple-choice question has 4 distinct options including the answer", () => {
    for (const e of all) {
      const d = dataOf(e);
      // tile_build exercises use fill_blank with no options (the child constructs the answer from tiles)
      if (e.type === "fill_blank" && d.options.length === 0) continue;
      expect(d.options, e.id).toHaveLength(4);
      expect(new Set(d.options).size, e.id).toBe(4);
      expect(d.options, e.id).toContain(d.answer);
    }
  });

  it("math answers match the numbers in the story", () => {
    for (const e of math) {
      const d = dataOf(e);
      const nums = (d.question.match(/\d+/g) ?? []).map(Number);
      const ans = Number(d.answer);
      const [a, b] = nums;
      const kind = e.id.split("-")[1];
      if (kind === "addition") expect(ans, `${e.id}: ${d.question}`).toBe(a + b);
      if (kind === "subtraction") expect(ans, `${e.id}: ${d.question}`).toBe(a - b);
      if (kind === "multiplication") expect(ans, `${e.id}: ${d.question}`).toBe(a * b);
      if (kind === "division") {
        expect(a % b === 0 || b % a === 0, e.id).toBe(true);
        expect(ans, e.id).toBe(Math.max(a, b) / Math.min(a, b));
      }
      expect(ans).toBeGreaterThanOrEqual(0);
    }
  });

  it("interactive visuals agree with the answer", () => {
    let withVisual = 0;
    for (const e of math) {
      const d = dataOf(e);
      const v = d.visual;
      if (!v) continue;
      withVisual++;
      const ans = Number(d.answer);
      const label = `${e.id}: ${d.question}`;
      if (v.type === "count") expect(v.items.reduce((s, i) => s + i.count, 0), label).toBe(ans);
      if (v.type === "takeaway") expect(v.total - v.remove, label).toBe(ans);
      if (v.type === "groups") expect(v.groups * v.each, label).toBe(ans);
      if (v.type === "share") expect(v.total / v.plates, label).toBe(ans);
      if (v.type === "pack") expect(v.total / v.size, label).toBe(ans);
    }
    // a good share of the maths bank should be hands-on
    expect(withVisual).toBeGreaterThan(math.length * 0.3);
  });

  it("stories are not plain sums", () => {
    for (const e of math) {
      const d = dataOf(e);
      expect(d.question.length, e.id).toBeGreaterThan(40);
      expect(d.question, e.id).not.toMatch(/=\s*\?/);
    }
  });

  it("each level has varied stories (no exact duplicates per level)", () => {
    const seen = new Map<string, number>();
    for (const e of [...math, ...fractions]) {
      const key = `${e.topicId}|${e.level}|${dataOf(e).question}`;
      seen.set(key, (seen.get(key) ?? 0) + 1);
    }
    expect([...seen.values()].filter((n) => n > 1)).toEqual([]);
  });

  it("fraction answers are either a fraction or a whole count, with a worked explanation", () => {
    for (const e of fractions) {
      const d = dataOf(e);
      expect(d.answer, e.id).toMatch(/^(\d+\/\d+|\d+)$/);
      if (d.visual?.type === "pizza") expect(d.visual.slices, e.id).toBeGreaterThanOrEqual(2);
    }
  });

  it("level and reward scaling is preserved", () => {
    for (const e of [...math, ...fractions]) {
      expect(e.xpReward).toBe(8 + e.level * 2);
      expect(e.level).toBeGreaterThanOrEqual(1);
      expect(e.level).toBeLessThanOrEqual(10);
    }
  });
});

describe("reading question bank", () => {
  const phonics = generatePhonics();
  const vocab = generateVocabulary();
  const comp = generateComprehension();

  it("has ids in the reading namespace and every level is covered", () => {
    for (const [list, prefix] of [[phonics, "rq-ph-"], [vocab, "rq-vo-"], [comp, "rq-co-"]] as const) {
      for (const e of list) expect(e.id.startsWith(prefix), e.id).toBe(true);
      expect(new Set(list.map((e) => e.level)).size).toBe(10);
    }
  });

  it("comprehension questions carry a passage the child can re-read", () => {
    for (const e of comp) expect(dataOf(e).passage?.length ?? 0, e.id).toBeGreaterThan(30);
  });

  it("picture icons only reference real options", () => {
    for (const e of [...phonics, ...vocab, ...comp]) {
      const d = dataOf(e);
      if (!d.icons) continue;
      for (const key of Object.keys(d.icons)) expect(d.options, e.id).toContain(key);
    }
  });

  it("no question gives away its answer in the question text", () => {
    for (const e of [...phonics, ...vocab]) {
      const d = dataOf(e);
      if (/^[A-Za-z]{4,}$/.test(d.answer)) expect(d.question.toLowerCase(), e.id).not.toContain(`"${d.answer.toLowerCase()}" means`);
    }
  });
});
