import { describe, expect, it } from "vitest";
import {
  COMPANION_STAGES,
  MAX_HINT_STAGE,
  MAX_SECONDS_PER_QUESTION,
  ROUND_SIZE,
  activeSeconds,
  cheer,
  clampHintStage,
  comboFromResults,
  companionStage,
  decideQuestionKind,
  hintCostsXP,
  isEarlyLearner,
  isEarlyTopic,
  nextStreak,
  optionsToEliminate,
  pickAdaptive,
  pickExercise,
  questEndLine,
  recoveryLevel,
  roundStars,
  startOfLocalDay,
  worldFor,
  xpWithHint,
} from "./game";

const day = (iso: string) => new Date(`${iso}T12:00:00`);

describe("worldFor", () => {
  it.each(["Addition", "Subtraction", "Multiplication", "Division", "Fractions", "Phonics", "Vocabulary", "Comprehension"])(
    "has a themed world for %s",
    (t) => {
      const w = worldFor(t);
      expect(w.name).not.toBe("Adventure Land");
      expect(w.guide).toBeTruthy();
    }
  );
  it("falls back for unknown topics", () => expect(worldFor("Algebra").name).toBe("Adventure Land"));
});

describe("companionStage", () => {
  it("starts as an egg and evolves at the thresholds", () => {
    expect(companionStage(0).name).toBe("Mystery Egg");
    expect(companionStage(29).index).toBe(0);
    expect(companionStage(30).index).toBe(1);
    expect(companionStage(120).index).toBe(2);
    expect(companionStage(9999).index).toBe(COMPANION_STAGES.length - 1);
  });
  it("reports progress to the next stage and caps at the last one", () => {
    const s = companionStage(75);
    expect(s.next?.index).toBe(2);
    expect(s.xpToNext).toBe(45);
    expect(s.percent).toBe(50);
    const last = companionStage(5000);
    expect(last.next).toBeNull();
    expect(last.percent).toBe(100);
  });
});

describe("nextStreak (forgiving)", () => {
  it("starts at 1", () => expect(nextStreak(0, null, day("2026-01-10"))).toBe(1));
  it("keeps the streak when practising twice in one day", () =>
    expect(nextStreak(4, day("2026-01-10"), day("2026-01-10"))).toBe(4));
  it("grows on consecutive days", () => expect(nextStreak(4, day("2026-01-10"), day("2026-01-11"))).toBe(5));
  it("forgives one missed day", () => expect(nextStreak(4, day("2026-01-10"), day("2026-01-12"))).toBe(5));
  it("resets after two or more missed days", () => expect(nextStreak(9, day("2026-01-10"), day("2026-01-13"))).toBe(1));
});

describe("comboFromResults", () => {
  it("counts leading correct answers only", () => {
    expect(comboFromResults([true, true, false, true])).toBe(2);
    expect(comboFromResults([false, true])).toBe(0);
    expect(comboFromResults([])).toBe(0);
  });
});

describe("pickExercise", () => {
  const all = [{ id: "a" }, { id: "b" }, { id: "c" }];
  it("avoids recently seen questions", () => {
    for (let i = 0; i < 30; i++) expect(pickExercise(all, ["a", "b"]).id).toBe("c");
  });
  it("repeats only when everything has been seen", () => {
    expect(["a", "b", "c"]).toContain(pickExercise(all, ["a", "b", "c"]).id);
  });
});

describe("optionsToEliminate", () => {
  it("removes two wrong options from four and never the answer", () => {
    for (let i = 0; i < 50; i++) {
      const out = optionsToEliminate(["1", "2", "3", "4"], "3");
      expect(out).toHaveLength(2);
      expect(out).not.toContain("3");
    }
  });
  it("leaves at least two choices", () => {
    expect(optionsToEliminate(["a", "b", "c"], "a")).toHaveLength(1);
    expect(optionsToEliminate(["a", "b"], "a")).toHaveLength(0);
  });
});

describe("rewards and copy", () => {
  it("halves XP when a hint was used", () => {
    expect(xpWithHint(10, false)).toBe(10);
    expect(xpWithHint(10, true)).toBe(5);
    expect(xpWithHint(5, true)).toBe(3);
  });
  it("always gives at least one star for finishing a quest", () => {
    expect(roundStars(0)).toBe(1);
    expect(roundStars(3)).toBe(2);
    expect(roundStars(ROUND_SIZE)).toBe(3);
  });
  it("never uses shaming words for wrong answers", () => {
    for (let s = 0; s < 8; s++) expect(cheer(false, 0, s)).not.toMatch(/\b(wrong|fail|failed|bad|stupid|lose|lost)\b/i);
  });
  it("escalates praise with combos", () => {
    expect(cheer(true, 5, 0)).toMatch(/UNSTOPPABLE|fire|legendary/i);
  });
  it("ends every quest on a positive note", () => {
    for (let c = 0; c <= ROUND_SIZE; c++) expect(questEndLine(c).length).toBeGreaterThan(10);
  });
});

describe("startOfLocalDay", () => {
  it("finds local midnight for a US evening that is already tomorrow in UTC", () => {
    // 2026-01-10 02:00Z is 21:00 on Jan 9 in UTC-5 (browser offset +300)
    const mid = startOfLocalDay(new Date("2026-01-10T02:00:00Z"), 300);
    expect(mid.toISOString()).toBe("2026-01-09T05:00:00.000Z");
  });
  it("works for zones east of UTC and for UTC itself", () => {
    expect(startOfLocalDay(new Date("2026-01-10T20:00:00Z"), -330).toISOString()).toBe("2026-01-10T18:30:00.000Z");
    expect(startOfLocalDay(new Date("2026-01-10T20:00:00Z"), 0).toISOString()).toBe("2026-01-10T00:00:00.000Z");
  });
  it("ignores nonsense offsets", () => {
    expect(startOfLocalDay(new Date("2026-01-10T20:00:00Z"), NaN).toISOString()).toBe("2026-01-10T00:00:00.000Z");
  });
});

describe("activeSeconds", () => {
  const at = (s: number, timeTaken = 5) => ({ completedAt: new Date(1_700_000_000_000 + s * 1000), timeTaken });
  it("is zero with no answers", () => expect(activeSeconds([])).toBe(0));
  it("uses the gap between quick consecutive answers", () => {
    expect(activeSeconds([at(0, 10), at(20), at(45)])).toBe(10 + 20 + 25);
  });
  it("caps a long pause so walking away does not burn the budget", () => {
    expect(activeSeconds([at(0, 8), at(3600, 12)])).toBe(8 + 12);
    expect(activeSeconds([at(0, 500)])).toBe(MAX_SECONDS_PER_QUESTION);
  });
  it("does not depend on input order", () => {
    expect(activeSeconds([at(45), at(0, 10), at(20)])).toBe(55);
  });
});

describe("pickAdaptive", () => {
  const all = [
    { id: "l1", level: 1 }, { id: "l2a", level: 2 }, { id: "l2b", level: 2 }, { id: "l3", level: 3 }, { id: "l6", level: 6 },
  ];
  it("only returns questions near the level when they are available", () => {
    for (let i = 0; i < 200; i++) expect([1, 2, 3]).toContain(pickAdaptive(all, [], 2).level);
  });
  it("mostly serves the current level", () => {
    let same = 0;
    for (let i = 0; i < 400; i++) if (pickAdaptive(all, [], 2).level === 2) same++;
    expect(same).toBeGreaterThan(220);
  });
  it("skips recently seen questions", () => {
    for (let i = 0; i < 100; i++) expect(pickAdaptive(all, ["l2a", "l1", "l3"], 2).id).toBe("l2b");
  });
  it("falls back gracefully when everything nearby was seen", () => {
    const out = pickAdaptive(all, ["l1", "l2a", "l2b", "l3"], 2);
    expect(out.id).toBe("l6");
    expect(["l1", "l2a", "l2b", "l3", "l6"]).toContain(pickAdaptive(all, all.map((a) => a.id), 2).id);
  });
});

describe('hint ladder', () => {
  it('only the worked example and 50:50 cost XP', () => {
    expect(hintCostsXP(0)).toBe(false);
    expect(hintCostsXP(1)).toBe(false);
    expect(hintCostsXP(2)).toBe(true);
    expect(hintCostsXP(MAX_HINT_STAGE)).toBe(true);
  });
  it('clamps anything the browser sends into 0..3', () => {
    expect(clampHintStage(-4)).toBe(0);
    expect(clampHintStage(99)).toBe(MAX_HINT_STAGE);
    expect(clampHintStage('2')).toBe(2);
    expect(clampHintStage(NaN)).toBe(0);
    expect(clampHintStage(undefined)).toBe(0);
  });
});

describe('decideQuestionKind', () => {
  const base = { lastWasMiss: false, lastWasHere: false, level: 3, position: 1, hasDueReview: false, lastWasReview: false };
  it('asks an easier recovery question right after a miss in this skill', () => {
    expect(decideQuestionKind({ ...base, lastWasMiss: true, lastWasHere: true })).toBe('recovery');
  });
  it('never recovers below level 1 or after a miss in another skill', () => {
    expect(decideQuestionKind({ ...base, lastWasMiss: true, lastWasHere: true, level: 1 })).toBe('normal');
    expect(decideQuestionKind({ ...base, lastWasMiss: true, lastWasHere: false })).toBe('normal');
  });
  it('slots one memory refresher into the middle of a quest', () => {
    const mid = Math.ceil(ROUND_SIZE / 2);
    expect(decideQuestionKind({ ...base, hasDueReview: true, position: mid })).toBe('review');
    expect(decideQuestionKind({ ...base, hasDueReview: true, position: mid + 1 })).toBe('normal');
    expect(decideQuestionKind({ ...base, hasDueReview: false, position: mid })).toBe('normal');
  });
  it('never asks two refreshers in a row', () => {
    expect(decideQuestionKind({ ...base, hasDueReview: true, lastWasReview: true, position: Math.ceil(ROUND_SIZE / 2) })).toBe('normal');
  });
  it('a recovery beats a refresher', () => {
    expect(decideQuestionKind({ ...base, lastWasMiss: true, lastWasHere: true, hasDueReview: true, position: Math.ceil(ROUND_SIZE / 2) })).toBe('recovery');
  });
  it('recoveryLevel is one easier and never below 1', () => {
    expect(recoveryLevel(5)).toBe(4);
    expect(recoveryLevel(1)).toBe(1);
  });
});

describe('early learners', () => {
  it('are children in K to grade 2', () => {
    for (const g of ['K', 'G1', 'G2']) expect(isEarlyLearner(g)).toBe(true);
    for (const g of ['G3', 'G5', null, undefined, '']) expect(isEarlyLearner(g)).toBe(false);
  });
  it('have counting and letters worlds', () => {
    expect(isEarlyTopic('topic-counting')).toBe(true);
    expect(isEarlyTopic('topic-letters')).toBe(true);
    expect(isEarlyTopic('topic-addition')).toBe(false);
  });
});
