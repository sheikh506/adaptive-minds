/**
 * Hint-then-solution helpers. Pure functions (safe on server and client, easy to test).
 *
 * Every question follows the same kind, friendly path: a HINT first (never the answer), then, after the
 * answer, a SOLUTION shown as short steps, one at a time. Quests, story questions and puzzles all use it.
 */

import type { Story, StoryQuestion } from "./storybook";
import type { BlockRound, CountRound, Level, MatchPair, NumberBubbleRound, OddRound, PatternRound, SpotRound, SlideShape } from "./puzzles";
import { solvedSlide } from "./puzzles";

export interface Help {
  /** A gentle nudge. Never gives the answer away. */
  hint: string;
  /** "Show me how": short steps that lead to the answer. */
  steps: string[];
}

// ─── Solution steps from an explanation ─────────────────────────────────────

function tidy(s: string): string {
  const t = s.trim();
  const c = t.charAt(0).toUpperCase() + t.slice(1);
  return /[.!?]$/.test(c) ? c : `${c}.`;
}

/**
 * Turns a written explanation into short steps: one per sentence (a decimal point like 4.6 is not a
 * sentence end), and a semicolon also starts a new step.
 */
export function solutionSteps(explanation: string | undefined): string[] {
  const text = (explanation ?? "").replace(/\s+/g, " ").trim();
  if (!text) return [];
  const sentences = text.match(/.+?(?:[.!?](?=\s|$)|$)/g) ?? [text];
  const steps: string[] = [];
  for (const sentence of sentences) {
    for (const part of sentence.split(/;\s+/)) {
      if (part.trim()) steps.push(tidy(part));
    }
  }
  return steps;
}

// ─── Story questions ────────────────────────────────────────────────────────

const STOP = new Set([
  "the", "and", "was", "were", "his", "her", "she", "they", "their", "with", "for", "that", "this", "what", "why", "how",
  "did", "does", "who", "where", "when", "which", "are", "but", "not", "because", "from", "then", "him", "its", "has", "had",
]);

function words(text: string): string[] {
  return [...new Set((text.toLowerCase().match(/[a-z]+/g) ?? []).filter((w) => w.length > 2 && !STOP.has(w)))];
}

/** The page that most likely holds the answer, found by shared words. Null when nothing matches. */
export function findAnswerPage(story: Story, q: StoryQuestion): number | null {
  for (const tokens of [words(q.answer), words(q.question)]) {
    if (tokens.length === 0) continue;
    const scores = story.pages.map((p) => {
      const pageWords = new Set(words(p.text));
      return tokens.filter((t) => pageWords.has(t)).length;
    });
    const best = Math.max(...scores);
    if (best > 0) return scores.indexOf(best);
  }
  return null;
}

/** Hint 1 for a story question: a reading strategy that fits the kind of question. */
export function storyNudge(q: StoryQuestion): string {
  const text = q.question.toLowerCase();
  if (/lesson|learn|moral/.test(text)) return "The lesson of a story is often told near the end. Think about what the character learned.";
  if (/feel|felt|sad|happy|scared/.test(text)) return "Think about how the character felt. Look for clues in what they said and did.";
  if (/^why|reason|because/.test(text)) return "Look for a reason in the story. Words like 'because' or 'so' can help.";
  if (/^(how|what|where|which|who)/.test(text)) return "Go back to the pages and look for what happened. The answer is in the story.";
  return "Think back to the story. Which page tells you about this?";
}

// ─── Puzzles ────────────────────────────────────────────────────────────────

const rowCol = (i: number, cols: number) => ({ row: Math.floor(i / cols) + 1, col: (i % cols) + 1 });

const DONE: Help = { hint: "You have done it! Look at how well you did.", steps: [] };

export function matchHelp(pairs: MatchPair[], done: string[], level: Level): Help {
  const left = pairs.filter((p) => !done.includes(p.id));
  const first = left[0];
  if (!first) return DONE;
  const step = (p: MatchPair) => {
    const sum = /^(\d+) \+ (\d+)$/.exec(p.left);
    if (level === "P" && sum) {
      const a = Number(sum[1]);
      const b = Number(sum[2]);
      const big = Math.max(a, b);
      const small = Math.min(a, b);
      const counting = Array.from({ length: small }, (_, i) => big + i + 1).join(", ");
      return `${p.left}: start at ${big}, count on ${small} (${counting}). The answer is ${p.right}.`;
    }
    return `Tap ${p.left}, then tap ${p.right}.`;
  };
  return {
    hint:
      level === "K"
        ? `Look closely at ${first.left}. Which picture, word or number on the right goes with it?`
        : `Work out ${first.left} in your head. Then look for the answer on the right.`,
    steps: left.slice(0, 3).map(step),
  };
}

export function spotHelp(r: SpotRound, found: number[]): Help {
  const remaining = r.diffs.filter((d) => !found.includes(d));
  if (remaining.length === 0) return DONE;
  const first = rowCol(remaining[0], r.cols);
  return {
    hint: `Compare the pictures one square at a time. Try row ${first.row} first.`,
    steps: remaining.slice(0, 3).map((i) => {
      const { row, col } = rowCol(i, r.cols);
      return `Row ${row}, picture ${col}: one side has ${r.a[i]} and the other has ${r.b[i]}.`;
    }),
  };
}

export function blockHelp(r: BlockRound, built: readonly (number | null)[]): Help {
  const wrong = r.target.map((t, i) => (built[i] === t ? -1 : i)).filter((i) => i >= 0);
  if (wrong.length === 0) return DONE;
  const first = rowCol(wrong[0], r.size);
  return {
    hint: `Start at row ${first.row}, square ${first.col}. What colour is that square in the picture?`,
    steps: wrong.slice(0, 3).map((i) => {
      const { row, col } = rowCol(i, r.size);
      return `Row ${row}, square ${col}: paint it ${r.colours[r.target[i]].name}.`;
    }),
  };
}

export function slideHelp(tiles: readonly number[], shape: SlideShape): Help {
  const solved = solvedSlide(shape);
  const wrongAt = solved.findIndex((t, i) => t !== 0 && tiles[i] !== t);
  if (wrongAt < 0) return DONE;
  const k = solved[wrongAt];
  const home = rowCol(wrongAt, shape.cols);
  const now = rowCol(tiles.indexOf(k), shape.cols);
  return {
    hint: `Tile ${k} belongs in row ${home.row}, column ${home.col}. Slide tiles into the empty space to bring it there.`,
    steps: [
      `Find tile ${k}. It is in row ${now.row}, column ${now.col} now.`,
      `Slide the tiles next to the empty space to make room, so tile ${k} moves toward row ${home.row}, column ${home.col}.`,
      "Then do the next number in the same way. Go slowly, one tile at a time.",
    ],
  };
}

export function countHelp(r: CountRound): Help {
  const counting = Array.from({ length: r.count }, (_, i) => i + 1).join(", ");
  return {
    hint: "Touch each picture with your finger and say a number. Do not skip any!",
    steps: [`Count them one by one: ${counting}.`, `The last number you say is ${r.count}.`, `So there are ${r.count}.`],
  };
}

export function bubbleHelp(r: NumberBubbleRound, next: number): Help {
  const target = r.sequence[Math.min(next, r.sequence.length - 1)];
  return {
    hint: `Look for the bubble with the number ${target}.`,
    steps: [`The right order is ${r.sequence.join(", ")}.`, "Pop them one after another in that order.", `Next up is ${target}.`],
  };
}

export function patternHelp(r: PatternRound): Help {
  let period = r.shown.length;
  for (let p = 2; p <= Math.floor(r.shown.length / 2); p++) {
    if (r.shown.every((s, i) => s === r.shown[i % p])) {
      period = p;
      break;
    }
  }
  const unit = r.shown.slice(0, period);
  return {
    hint: "Say the pattern out loud and listen for the part that repeats.",
    steps: [`The part that repeats is ${unit.join(" ")}.`, `The pattern keeps going: ${r.shown.join(" ")} ...`, `So the next one is ${r.answer}.`],
  };
}

export function oddHelp(r: OddRound): Help {
  return {
    hint: "Look at all of them. What do most of them have in common? Which one is different?",
    steps: [r.hint, `Number ${r.oddIndex + 1} (${r.items[r.oddIndex]}) is not like the others.`],
  };
}
