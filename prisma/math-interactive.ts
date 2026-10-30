/**
 * Hands-on Mathematics — Interactive Content Generator (P1-MT1 / P1-MT2 / P1-MT3)
 *
 * Generates mathematics exercises using the new Visual types:
 *   - ten_frame: show a ten-frame with counters; child counts or answers about it
 *   - number_bond: visualise the part-whole relationship
 *   - place_value_blocks: hundreds/tens/ones representations
 *
 * These exercises use the TEACH → GUIDED → INDEPENDENT → MASTERY CHECK pipeline
 * by being tagged with the appropriate skill IDs from skill-curriculum.ts.
 *
 * Design principles:
 *   - Concrete before abstract: the visual comes first
 *   - No speed pressure: no timed components
 *   - Multiple representations: the same concept appears with different contexts
 *   - Deterministic and seeded
 */

import type { Visual } from "../src/lib/question-types";
import { rng, shuffle, numericOptions, difficultyFor, rewards, type SeedExercise } from "./stories";

// ─── Ten Frame exercises ──────────────────────────────────────────────────────

function tenFrameCountQ(n: number, rand: () => number): {
  question: string; answer: string; options: string[]; explanation: string; visual: Visual;
} {
  const visual: Visual = { type: "ten_frame", total: 10, filled: n };
  const answer = String(n);
  const options = numericOptions(n, rand);
  return {
    question: "How many counters are in the ten frame?",
    answer,
    options,
    explanation: `There are ${n} filled circles in the ten frame. Count each one carefully.`,
    visual,
  };
}

function tenFrameAddQ(a: number, b: number, rand: () => number): {
  question: string; answer: string; options: string[]; explanation: string; visual: Visual;
} {
  const total = a + b;
  const visual: Visual = { type: "ten_frame", total: 10, filled: total };
  const answer = String(total);
  const options = numericOptions(total, rand);
  return {
    question: `A ten frame has ${a} counters. You add ${b} more. How many counters are there now?`,
    answer,
    options,
    explanation: `${a} + ${b} = ${total}. The ten frame shows ${total} filled circles.`,
    visual,
  };
}

// ─── Number Bond exercises ───────────────────────────────────────────────────

function numberBondFindPartQ(whole: number, part1: number, rand: () => number): {
  question: string; answer: string; options: string[]; explanation: string; visual: Visual;
} {
  const part2 = whole - part1;
  const visual: Visual = { type: "number_bond", whole, part1, part2: null }; // null = unknown
  const answer = String(part2);
  const options = numericOptions(part2, rand);
  return {
    question: `The whole is ${whole} and one part is ${part1}. What is the other part?`,
    answer,
    options,
    explanation: `${whole} - ${part1} = ${part2}. The number bond shows: ${part1} + ${part2} = ${whole}.`,
    visual,
  };
}

function numberBondFindWholeQ(part1: number, part2: number, rand: () => number): {
  question: string; answer: string; options: string[]; explanation: string; visual: Visual;
} {
  const whole = part1 + part2;
  const visual: Visual = { type: "number_bond", whole: null, part1, part2 };
  const answer = String(whole);
  const options = numericOptions(whole, rand);
  return {
    question: `The two parts are ${part1} and ${part2}. What is the whole?`,
    answer,
    options,
    explanation: `${part1} + ${part2} = ${whole}. The number bond whole is ${whole}.`,
    visual,
  };
}

// ─── Place Value Blocks ───────────────────────────────────────────────────────

function placeValueReadQ(tens: number, ones: number, rand: () => number): {
  question: string; answer: string; options: string[]; explanation: string; visual: Visual;
} {
  const value = tens * 10 + ones;
  const visual: Visual = { type: "place_value_blocks", hundreds: 0, tens, ones };
  const answer = String(value);
  const options = numericOptions(value, rand);
  return {
    question: `What number do the blocks show?`,
    answer,
    options,
    explanation: `${tens} ten${tens !== 1 ? "s" : ""} = ${tens * 10}, plus ${ones} one${ones !== 1 ? "s" : ""} = ${ones}. Total: ${value}.`,
    visual,
  };
}

function placeValueComposeQ(value: number, rand: () => number): {
  question: string; answer: string; options: string[]; explanation: string; visual: Visual;
} {
  const tens = Math.floor(value / 10);
  const ones = value % 10;
  const visual: Visual = { type: "place_value_blocks", hundreds: 0, tens, ones };
  // Ask for the number of tens
  const answerTens = String(tens);
  const options = numericOptions(tens, rand);
  return {
    question: `The number ${value} has how many tens?`,
    answer: answerTens,
    options,
    explanation: `${value} = ${tens} ten${tens !== 1 ? "s" : ""} and ${ones} one${ones !== 1 ? "s" : ""}. So there are ${tens} ten${tens !== 1 ? "s" : ""}.`,
    visual,
  };
}

// ─── Build all exercises ──────────────────────────────────────────────────────

export function generateHandsOnMath(): SeedExercise[] {
  const out: SeedExercise[] = [];

  // ── Ten Frame: counting (levels 1-3) ─────────────────────────────────────
  for (let level = 1; level <= 3; level++) {
    const maxN = level === 1 ? 5 : level === 2 ? 10 : 20;
    for (let i = 1; i <= 8; i++) {
      const rand = rng(800_000 + level * 100 + i);
      const n = 1 + Math.floor(rand() * (maxN - 1));
      const q = tenFrameCountQ(Math.min(n, 10), rand); // ten frame shows max 10
      out.push({
        id: `mt-tf-count-${level}-${i}`,
        topicId: "topic-counting",
        title: "Ten frame counting",
        instructions: "Look at the ten frame and count the counters.",
        type: "multiple_choice",
        difficulty: difficultyFor(level),
        level,
        ...rewards(level),
        data: {
          question: q.question,
          options: q.options,
          answer: q.answer,
          explanation: q.explanation,
          visual: q.visual,
          interactionType: "ten_frame_fill" as const,
        },
      });
    }
  }

  // ── Ten Frame: addition (levels 2-4) ─────────────────────────────────────
  for (let level = 2; level <= 4; level++) {
    for (let i = 1; i <= 8; i++) {
      const rand = rng(810_000 + level * 100 + i);
      const maxA = level === 2 ? 4 : level === 3 ? 6 : 9;
      const a = 1 + Math.floor(rand() * maxA);
      const b = 1 + Math.floor(rand() * Math.min(4, 10 - a));
      const q = tenFrameAddQ(a, b, rand);
      out.push({
        id: `mt-tf-add-${level}-${i}`,
        topicId: "topic-addition",
        title: "Ten frame addition",
        instructions: "Use the ten frame to help you add.",
        type: "multiple_choice",
        difficulty: difficultyFor(level),
        level,
        ...rewards(level),
        data: {
          question: q.question,
          options: q.options,
          answer: q.answer,
          explanation: q.explanation,
          visual: q.visual,
          interactionType: "ten_frame_fill" as const,
        },
      });
    }
  }

  // ── Number Bond: find missing part (levels 2-5) ───────────────────────────
  for (let level = 2; level <= 5; level++) {
    const maxWhole = level <= 3 ? 10 : level === 4 ? 15 : 20;
    for (let i = 1; i <= 8; i++) {
      const rand = rng(820_000 + level * 100 + i);
      const whole = 3 + Math.floor(rand() * (maxWhole - 2));
      const part1 = 1 + Math.floor(rand() * (whole - 1));
      const q = numberBondFindPartQ(whole, part1, rand);
      out.push({
        id: `mt-nb-part-${level}-${i}`,
        topicId: level <= 3 ? "topic-addition" : "topic-subtraction",
        title: "Number bond: find the part",
        instructions: "Look at the number bond. Find the missing part.",
        type: "multiple_choice",
        difficulty: difficultyFor(level),
        level,
        ...rewards(level),
        data: {
          question: q.question,
          options: q.options,
          answer: q.answer,
          explanation: q.explanation,
          visual: q.visual,
          interactionType: "number_bond_fill" as const,
        },
      });
    }
  }

  // ── Number Bond: find whole (levels 1-4) ─────────────────────────────────
  for (let level = 1; level <= 4; level++) {
    const maxPart = level <= 2 ? 5 : level === 3 ? 8 : 12;
    for (let i = 1; i <= 8; i++) {
      const rand = rng(830_000 + level * 100 + i);
      const part1 = 1 + Math.floor(rand() * (maxPart - 1));
      const part2 = 1 + Math.floor(rand() * (maxPart - 1));
      const q = numberBondFindWholeQ(part1, part2, rand);
      out.push({
        id: `mt-nb-whole-${level}-${i}`,
        topicId: "topic-addition",
        title: "Number bond: find the whole",
        instructions: "Look at the number bond. Find the whole.",
        type: "multiple_choice",
        difficulty: difficultyFor(level),
        level,
        ...rewards(level),
        data: {
          question: q.question,
          options: q.options,
          answer: q.answer,
          explanation: q.explanation,
          visual: q.visual,
          interactionType: "number_bond_fill" as const,
        },
      });
    }
  }

  // ── Place Value: read blocks (levels 3-6) ─────────────────────────────────
  for (let level = 3; level <= 6; level++) {
    const maxTens = level <= 4 ? 3 : level === 5 ? 5 : 9;
    for (let i = 1; i <= 8; i++) {
      const rand = rng(840_000 + level * 100 + i);
      const tens = Math.floor(rand() * (maxTens + 1));
      const ones = Math.floor(rand() * 10);
      if (tens === 0 && ones === 0) continue;
      const q = placeValueReadQ(tens, ones, rand);
      out.push({
        id: `mt-pv-read-${level}-${i}`,
        topicId: "topic-counting",
        title: "Place value: read the number",
        instructions: "Count the tens blocks and the ones blocks.",
        type: "multiple_choice",
        difficulty: difficultyFor(level),
        level,
        ...rewards(level),
        data: {
          question: q.question,
          options: q.options,
          answer: q.answer,
          explanation: q.explanation,
          visual: q.visual,
        },
      });
    }
  }

  // ── Place Value: how many tens? (levels 4-7) ──────────────────────────────
  for (let level = 4; level <= 7; level++) {
    const minValue = 10;
    const maxValue = level <= 5 ? 50 : level === 6 ? 80 : 99;
    for (let i = 1; i <= 8; i++) {
      const rand = rng(850_000 + level * 100 + i);
      const value = minValue + Math.floor(rand() * (maxValue - minValue + 1));
      const q = placeValueComposeQ(value, rand);
      out.push({
        id: `mt-pv-compose-${level}-${i}`,
        topicId: "topic-counting",
        title: "Place value: tens and ones",
        instructions: "Use the place value blocks to help you.",
        type: "multiple_choice",
        difficulty: difficultyFor(level),
        level,
        ...rewards(level),
        data: {
          question: q.question,
          options: q.options,
          answer: q.answer,
          explanation: q.explanation,
          visual: q.visual,
        },
      });
    }
  }

  return out;
}
