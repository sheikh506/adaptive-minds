import { describe, it, expect } from "vitest";
import {
  solutionSteps,
  findAnswerPage,
  storyNudge,
  matchHelp,
  spotHelp,
  blockHelp,
  slideHelp,
  countHelp,
  bubbleHelp,
  patternHelp,
  oddHelp,
} from "./hints";
import {
  makeMatchPairs,
  makeSpotRound,
  makeBlockRound,
  makeSlideRound,
  slideShape,
  makeCountRound,
  makeNumberBubbleRound,
  makePatternRound,
  makeOddRound,
  solvedSlide,
  type Level,
} from "./puzzles";
import { STORIES } from "./storybook";
import { SFX, SFX_NAMES, sfxNotes, sfxLength } from "./sfx";

const LEVELS: Level[] = ["K", "P"];
const RUNS = 40;

describe("solutionSteps", () => {
  it("returns nothing for empty text", () => {
    expect(solutionSteps(undefined)).toEqual([]);
    expect(solutionSteps("   ")).toEqual([]);
  });

  it("makes one step per sentence", () => {
    expect(solutionSteps("Count the apples. There are three. So the answer is 3.")).toEqual([
      "Count the apples.",
      "There are three.",
      "So the answer is 3.",
    ]);
  });

  it("does not split at a decimal point", () => {
    expect(solutionSteps("4.6 + 3.8 = 8.4")).toEqual(["4.6 + 3.8 = 8.4."]);
    expect(solutionSteps("Add 4.6 and 3.8. You get 8.4.")).toEqual(["Add 4.6 and 3.8.", "You get 8.4."]);
  });

  it("starts a new step after a semicolon", () => {
    expect(solutionSteps("Add the ones; then add the tens")).toEqual(["Add the ones.", "Then add the tens."]);
  });
});

describe("story hints", () => {
  const all = STORIES.flatMap((story) => story.questions.map((q) => ({ story, q })));

  it("every story question has a nudge and steps", () => {
    for (const { q } of all) {
      expect(storyNudge(q).length).toBeGreaterThan(10);
      expect(solutionSteps(q.why).length).toBeGreaterThan(0);
    }
  });

  it("the nudge never gives the answer away", () => {
    for (const { q } of all) {
      expect(storyNudge(q).toLowerCase()).not.toContain(q.answer.toLowerCase());
    }
  });

  it("finds a real page for every story question", () => {
    for (const { story, q } of all) {
      const page = findAnswerPage(story, q);
      expect(page, `${story.id}: ${q.question}`).not.toBeNull();
      expect(page!).toBeGreaterThanOrEqual(0);
      expect(page!).toBeLessThan(story.pages.length);
    }
  });
});

describe("puzzle help", () => {
  it("match help has a hint and steps while pairs are left", () => {
    for (const level of LEVELS) {
      for (let i = 0; i < RUNS; i++) {
        const pairs = makeMatchPairs(level);
        const help = matchHelp(pairs, [], level);
        expect(help.hint.length).toBeGreaterThan(5);
        expect(help.steps.length).toBeGreaterThan(0);
        // the hint talks about the first pair's question, and never states its answer
        const first = pairs[0];
        expect(help.hint).toContain(first.left);
        expect(help.hint.replace(first.left, "")).not.toContain(first.right);
      }
    }
  });

  it("match help is finished when all pairs are done", () => {
    const pairs = makeMatchPairs("K");
    expect(matchHelp(pairs, pairs.map((p) => p.id), "K").steps).toEqual([]);
  });

  it("spot help points at a row, then names the differences", () => {
    for (const level of LEVELS) {
      for (let i = 0; i < RUNS; i++) {
        const r = makeSpotRound(level);
        const help = spotHelp(r, []);
        expect(help.hint).toMatch(/row \d/);
        expect(help.steps.length).toBe(Math.min(3, r.diffs.length));
        expect(spotHelp(r, r.diffs).steps).toEqual([]);
      }
    }
  });

  it("block help skips squares that are already right", () => {
    const r = makeBlockRound("K");
    expect(blockHelp(r, r.target).steps).toEqual([]);
    const empty = r.target.map(() => null);
    const help = blockHelp(r, empty);
    expect(help.steps.length).toBe(3);
    expect(help.hint).not.toMatch(/Red|Blue|Yellow|Green/);
  });

  it("slide help is finished when solved, and helps otherwise", () => {
    for (const level of LEVELS) {
      const shape = slideShape(level);
      expect(slideHelp(solvedSlide(shape), shape).steps).toEqual([]);
      const tiles = makeSlideRound(level);
      const help = slideHelp(tiles, shape);
      expect(help.hint).toMatch(/Tile \d/);
      expect(help.steps.length).toBeGreaterThan(0);
    }
  });

  it("count help does not reveal the number in the hint", () => {
    for (const level of LEVELS) {
      for (let i = 0; i < RUNS; i++) {
        const r = makeCountRound(level);
        const help = countHelp(r);
        expect(help.hint).not.toMatch(/\d/);
        expect(help.steps.join(" ")).toContain(String(r.count));
      }
    }
  });

  it("bubble help names the next bubble to pop", () => {
    for (const level of LEVELS) {
      const r = makeNumberBubbleRound(level);
      expect(bubbleHelp(r, 0).hint).toContain(String(r.sequence[0]));
      expect(bubbleHelp(r, 99).hint).toContain(String(r.sequence[r.sequence.length - 1]));
    }
  });

  it("pattern help does not reveal the answer in the hint", () => {
    for (const level of LEVELS) {
      for (let i = 0; i < RUNS; i++) {
        const r = makePatternRound(level);
        const help = patternHelp(r);
        expect(help.hint).not.toContain(r.answer);
        expect(help.steps[help.steps.length - 1]).toContain(r.answer);
      }
    }
  });

  it("odd-one-out help does not name the odd one in the hint", () => {
    for (const level of LEVELS) {
      for (let i = 0; i < RUNS; i++) {
        const r = makeOddRound(level);
        const help = oddHelp(r);
        expect(help.hint).not.toContain(r.items[r.oddIndex]);
        expect(help.steps.length).toBe(2);
      }
    }
  });
});

describe("sound effects", () => {
  it("every sound is soft, short and in a friendly range", () => {
    for (const name of SFX_NAMES) {
      expect(SFX[name].length).toBeGreaterThan(0);
      expect(sfxLength(name), name).toBeLessThan(1.5);
      for (const note of SFX[name]) {
        expect(["sine", "triangle"]).toContain(note.wave);
        expect(note.midi).toBeGreaterThanOrEqual(36);
        expect(note.midi).toBeLessThanOrEqual(100);
        expect(note.gain).toBeGreaterThan(0);
        expect(note.gain).toBeLessThanOrEqual(0.55);
        expect(note.dur).toBeGreaterThan(0);
        expect(note.at).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it("a mistake sounds kind: it falls gently and is quieter than a win", () => {
    const gentle = SFX.gentle;
    expect(gentle[1].midi).toBeLessThan(gentle[0].midi);
    expect(Math.max(...gentle.map((x) => x.gain))).toBeLessThan(Math.max(...SFX.correct.map((x) => x.gain)));
    expect(gentle.every((x) => x.wave === "sine")).toBe(true);
  });

  it("sfxNotes shifts the pitch and clamps it", () => {
    expect(sfxNotes("tap", 2)[0].midi).toBe(SFX.tap[0].midi + 2);
    expect(sfxNotes("pop", 100).every((x) => x.midi <= 100)).toBe(true);
    expect(sfxNotes("stamp", -100).every((x) => x.midi >= 36)).toBe(true);
  });
});
