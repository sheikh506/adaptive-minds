import { describe, it, expect } from "vitest";
import {
  makeMatchPairs,
  makeSpotRound,
  makeBlockRound,
  blocksMatch,
  makeSlideRound,
  slideShape,
  solvedSlide,
  isSlideSolved,
  slideMove,
  makeCountRound,
  makeNumberBubbleRound,
  makePatternRound,
  makeOddRound,
  shuffle,
  type Level,
} from "./puzzles";
import { bestVoice, scoreVoice, pick, CHEERS, GENTLE_RETRIES, GREETINGS, THANKS } from "./voice-style";
import { layoutScene, splitEmoji, BACKDROPS } from "./scene";
import { STORIES } from "./storybook";
import { stickerById } from "./stickers";

const LEVELS: Level[] = ["K", "P"];
const RUNS = 60;

describe("puzzles", () => {
  it("shuffle keeps every item", () => {
    expect(shuffle([1, 2, 3, 4, 5]).sort()).toEqual([1, 2, 3, 4, 5]);
  });

  it("match-up pairs have unique ids and unique answers", () => {
    for (const level of LEVELS) {
      for (let i = 0; i < RUNS; i++) {
        const pairs = makeMatchPairs(level);
        expect(new Set(pairs.map((p) => p.id)).size).toBe(pairs.length);
        expect(new Set(pairs.map((p) => p.right)).size).toBe(pairs.length);
        expect(new Set(pairs.map((p) => p.left)).size).toBe(pairs.length);
      }
    }
    for (const p of makeMatchPairs("P")) {
      const [a, b] = p.left.split(" + ").map(Number);
      expect(String(a + b)).toBe(p.right);
    }
  });

  it("spot the difference differs in exactly the listed places", () => {
    for (const level of LEVELS) {
      for (let i = 0; i < RUNS; i++) {
        const r = makeSpotRound(level);
        expect(r.a.length).toBe(r.b.length);
        const changed = r.a.map((e, idx) => (e !== r.b[idx] ? idx : -1)).filter((x) => x >= 0);
        expect(changed).toEqual(r.diffs);
        expect(r.diffs.length).toBe(level === "K" ? 3 : 5);
      }
    }
  });

  it("block rounds use at least two colours and match only when identical", () => {
    for (const level of LEVELS) {
      for (let i = 0; i < RUNS; i++) {
        const r = makeBlockRound(level);
        expect(r.target.length).toBe(r.size * r.size);
        expect(new Set(r.target).size).toBeGreaterThanOrEqual(2);
        expect(r.target.every((c) => c >= 0 && c < r.colours.length)).toBe(true);
        expect(blocksMatch(r.target, r.target)).toBe(true);
        const wrong = [...r.target];
        wrong[0] = wrong[0] === 0 ? 1 : 0;
        expect(blocksMatch(wrong, r.target)).toBe(false);
        expect(blocksMatch(r.target.map(() => null), r.target)).toBe(false);
      }
    }
  });

  it("slide puzzles start scrambled, are never solved, and every tile is present once", () => {
    for (const level of LEVELS) {
      const shape = slideShape(level);
      for (let i = 0; i < RUNS; i++) {
        const tiles = makeSlideRound(level);
        expect([...tiles].sort((a, b) => a - b)).toEqual([...solvedSlide(shape)].sort((a, b) => a - b));
        expect(isSlideSolved(tiles, shape)).toBe(false);
      }
    }
  });

  it("slide moves only work next to the empty space", () => {
    const shape = slideShape("K"); // 2 x 3, empty is last
    const solved = solvedSlide(shape);
    expect(slideMove(solved, shape, 0)).toBeNull();
    const moved = slideMove(solved, shape, 4)!;
    expect(moved[5]).toBe(5);
    expect(moved[4]).toBe(0);
    expect(isSlideSolved(moved, shape)).toBe(false);
    expect(isSlideSolved(slideMove(moved, shape, 5)!, shape)).toBe(true);
  });

  it("count rounds include the right answer among three different options", () => {
    for (const level of LEVELS) {
      for (let i = 0; i < RUNS; i++) {
        const r = makeCountRound(level);
        expect(r.options).toContain(r.count);
        expect(new Set(r.options).size).toBe(3);
        expect(r.options.every((n) => n >= 1)).toBe(true);
      }
    }
  });

  it("number bubbles contain the whole sequence in order of value", () => {
    for (const level of LEVELS) {
      for (let i = 0; i < RUNS; i++) {
        const r = makeNumberBubbleRound(level);
        expect(r.sequence).toEqual([...r.sequence].sort((a, b) => a - b));
        for (const n of r.sequence) expect(r.bubbles).toContain(n);
        expect(new Set(r.bubbles).size).toBe(r.bubbles.length);
      }
    }
    expect(makeNumberBubbleRound("K").sequence).toEqual([1, 2, 3, 4, 5]);
  });

  it("pattern rounds have the answer once among distinct options and continue the pattern", () => {
    for (const level of LEVELS) {
      for (let i = 0; i < RUNS; i++) {
        const r = makePatternRound(level);
        expect(r.options).toContain(r.answer);
        expect(new Set(r.options).size).toBe(r.options.length);
        expect(r.options.length).toBe(3);
        expect(r.shown.length).toBeGreaterThanOrEqual(4);
      }
    }
  });

  it("odd one out has exactly one odd item", () => {
    for (const level of LEVELS) {
      for (let i = 0; i < RUNS; i++) {
        const r = makeOddRound(level);
        expect(r.items.length).toBe(level === "K" ? 4 : 5);
        expect(r.oddIndex).toBeGreaterThanOrEqual(0);
        expect(r.oddIndex).toBeLessThan(r.items.length);
        expect(new Set(r.items).size).toBe(r.items.length);
        expect(r.hint.length).toBeGreaterThan(5);
      }
    }
  });
});

describe("friendly voice", () => {
  it("has plenty of polite phrases", () => {
    for (const list of [GREETINGS, CHEERS, GENTLE_RETRIES, THANKS]) {
      expect(list.length).toBeGreaterThanOrEqual(3);
    }
    expect(pick(CHEERS, () => 0)).toBe(CHEERS[0]);
    expect(pick(CHEERS, () => 0.999)).toBe(CHEERS[CHEERS.length - 1]);
  });

  it("never scolds when a child gets it wrong", () => {
    for (const line of GENTLE_RETRIES) expect(line).not.toMatch(/wrong|bad|stupid|no!|incorrect/i);
  });

  it("prefers soft, natural English voices and skips non-English", () => {
    expect(scoreVoice("Microsoft Aria Online (Natural)", "en-US")).toBeGreaterThan(scoreVoice("Microsoft David", "en-US"));
    expect(scoreVoice("Google français", "fr-FR")).toBe(-1);
    const voices = [
      { name: "Microsoft David", lang: "en-US" },
      { name: "Google UK English Female", lang: "en-GB" },
      { name: "Thomas", lang: "fr-FR" },
    ];
    expect(bestVoice(voices)?.name).toBe("Google UK English Female");
    expect(bestVoice([{ name: "Thomas", lang: "fr-FR" }])).toBeUndefined();
  });
});

describe("picture-book scenes", () => {
  it("splits emoji including keycaps and joined emoji", () => {
    expect(splitEmoji("🐰🌲")).toHaveLength(2);
    expect(splitEmoji("🔟9️⃣8️⃣")).toHaveLength(3);
    expect(splitEmoji("🌕🧑‍🚀🪨")).toHaveLength(3);
    expect(splitEmoji("  ")).toEqual([]);
  });

  it("lays out at most five characters inside the picture", () => {
    for (const s of STORIES) {
      for (const p of s.pages) {
        const items = layoutScene(p.scene);
        expect(items.length).toBeGreaterThan(0);
        expect(items.length).toBeLessThanOrEqual(5);
        for (const it of items) {
          expect(it.x).toBeGreaterThanOrEqual(0);
          expect(it.x).toBeLessThanOrEqual(100);
          expect(it.y).toBeGreaterThanOrEqual(0);
          expect(it.y).toBeLessThanOrEqual(100);
        }
      }
    }
  });

  it("gives every story and page a known backdrop", () => {
    for (const s of STORIES) {
      expect(BACKDROPS).toContain(s.backdrop);
      for (const p of s.pages) if (p.backdrop) expect(BACKDROPS).toContain(p.backdrop);
    }
  });

  it("has a sticker for every story including the new books", () => {
    for (const s of STORIES) expect(stickerById(`story:${s.id}`), s.id).toBeDefined();
    expect(STORIES.length).toBeGreaterThanOrEqual(9);
  });
});
