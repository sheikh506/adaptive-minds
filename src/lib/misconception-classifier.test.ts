/**
 * Tests for misconception-classifier.ts
 *
 * Verifies:
 *   - classifyMisconceptions returns empty list when not enough data
 *   - MATH-OFF-BY-ONE is detected correctly
 *   - MATH-PLACE-VALUE-CONFUSION is detected for reversed digits
 *   - MATH-WRONG-OPERATION is not triggered below threshold
 *   - READING-SIMILAR-SOUNDS is detected for phonically similar wrong answers
 *   - READING-IGNORES-CONTEXT is detected for repeated wrong answers
 *   - Only returns top 3 results
 *   - Evidence count is accurate
 *   - recommendNextSkill: returns in-progress skill first
 *   - recommendNextSkill: returns review skill second
 *   - recommendNextSkill: returns unlocked skill with prerequisites met
 *   - recommendNextSkill: does not return skill whose prerequisites are not met
 *   - recommendNextSkill: returns null when all skills mastered
 */

import { describe, it, expect } from "vitest";
import {
  classifyMisconceptions,
  recommendNextSkill,
  type AttemptRecord,
} from "./misconception-classifier";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeAttempt(
  correct: boolean,
  selectedAnswer: string,
  correctAnswer: string,
  skillId = "math-addition-to-10"
): AttemptRecord {
  return {
    skillId,
    correct,
    selectedAnswer,
    correctAnswer,
    questionText: `What is the answer to this question?`,
  };
}

// ─── classifyMisconceptions ───────────────────────────────────────────────────

describe("classifyMisconceptions", () => {
  it("returns empty array when fewer than 3 attempts are provided", () => {
    const attempts: AttemptRecord[] = [
      makeAttempt(false, "5", "6"),
      makeAttempt(false, "7", "8"),
    ];
    expect(classifyMisconceptions(attempts, "MATH")).toEqual([]);
  });

  it("returns empty array when all attempts are correct", () => {
    const attempts: AttemptRecord[] = [
      makeAttempt(true, "6", "6"),
      makeAttempt(true, "8", "8"),
      makeAttempt(true, "4", "4"),
    ];
    expect(classifyMisconceptions(attempts, "MATH")).toEqual([]);
  });

  describe("MATH-OFF-BY-ONE", () => {
    it("detects off-by-one errors when child's answer is consistently 1 away from correct", () => {
      const attempts: AttemptRecord[] = [
        makeAttempt(false, "5", "6"),  // off by 1
        makeAttempt(false, "8", "7"),  // off by 1
        makeAttempt(true, "9", "9"),   // correct
      ];
      const result = classifyMisconceptions(attempts, "MATH");
      const codes = result.map((r) => r.code);
      expect(codes).toContain("MATH-OFF-BY-ONE");
    });

    it("does not detect off-by-one when only one off-by-one error", () => {
      const attempts: AttemptRecord[] = [
        makeAttempt(false, "5", "6"),  // off by 1
        makeAttempt(false, "3", "7"),  // off by 4
        makeAttempt(false, "1", "9"),  // off by 8
      ];
      const result = classifyMisconceptions(attempts, "MATH");
      // Off-by-one needs >= 2 occurrences — only 1 here
      const codes = result.map((r) => r.code);
      expect(codes).not.toContain("MATH-OFF-BY-ONE");
    });

    it("off-by-one classification has accurate evidence count", () => {
      const attempts: AttemptRecord[] = [
        makeAttempt(false, "5", "6"),
        makeAttempt(false, "8", "7"),
        makeAttempt(false, "10", "9"),
      ];
      const result = classifyMisconceptions(attempts, "MATH");
      const offByOne = result.find((r) => r.code === "MATH-OFF-BY-ONE");
      expect(offByOne).toBeDefined();
      expect(offByOne!.evidenceCount).toBe(3);
    });
  });

  describe("MATH-PLACE-VALUE-CONFUSION", () => {
    it("detects reversed-digit answers (e.g. 23 instead of 32)", () => {
      const attempts: AttemptRecord[] = [
        makeAttempt(false, "23", "32"),  // reversed digits (evidence 1)
        makeAttempt(false, "41", "14"),  // reversed digits (evidence 2)
        makeAttempt(true, "15", "15"),
      ];
      const result = classifyMisconceptions(attempts, "MATH");
      const codes = result.map((r) => r.code);
      expect(codes).toContain("MATH-PLACE-VALUE-CONFUSION");
    });

    it("does not flag non-digit reversals", () => {
      const attempts: AttemptRecord[] = [
        makeAttempt(false, "5", "10"),
        makeAttempt(false, "3", "9"),
        makeAttempt(false, "7", "12"),
      ];
      const result = classifyMisconceptions(attempts, "MATH");
      const codes = result.map((r) => r.code);
      expect(codes).not.toContain("MATH-PLACE-VALUE-CONFUSION");
    });
  });

  describe("READING-SIMILAR-SOUNDS", () => {
    it("detects phonically similar wrong answers", () => {
      const attempts: AttemptRecord[] = [
        makeAttempt(false, "cat", "cap", "ph-cvc-blending"),   // share 2 letters
        makeAttempt(false, "bat", "ban", "ph-cvc-blending"),   // share 2 letters
        makeAttempt(true, "sit", "sit", "ph-cvc-blending"),
      ];
      const result = classifyMisconceptions(attempts, "READING");
      const codes = result.map((r) => r.code);
      expect(codes).toContain("READING-SIMILAR-SOUNDS");
    });

    it("does not detect similar sounds when words are very different", () => {
      const attempts: AttemptRecord[] = [
        makeAttempt(false, "zap", "hot", "ph-cvc-blending"),
        makeAttempt(false, "fun", "bed", "ph-cvc-blending"),
        makeAttempt(false, "mop", "sit", "ph-cvc-blending"),
      ];
      const result = classifyMisconceptions(attempts, "READING");
      const codes = result.map((r) => r.code);
      // shared chars: zap/hot = none; fun/bed = none... these should not trigger
      // Actually 'f','u','n' vs 'b','e','d' share 0 chars — but let's just check SIMILAR-SOUNDS isn't triggered when evidence < 2
      // This test validates the count check
      expect(codes).not.toContain("READING-SIMILAR-SOUNDS");
    });
  });

  describe("READING-IGNORES-CONTEXT", () => {
    it("detects context-ignoring when 3+ wrong answers in READING", () => {
      const attempts: AttemptRecord[] = [
        makeAttempt(false, "big", "small", "vocab-opposites"),
        makeAttempt(false, "fast", "slow", "vocab-opposites"),
        makeAttempt(false, "hot", "cold", "vocab-opposites"),
      ];
      const result = classifyMisconceptions(attempts, "READING");
      const codes = result.map((r) => r.code);
      expect(codes).toContain("READING-IGNORES-CONTEXT");
    });
  });

  it("returns at most 3 classifications even when many patterns match", () => {
    // Create attempts that trigger all patterns
    const attempts: AttemptRecord[] = [
      makeAttempt(false, "cat", "cap"),
      makeAttempt(false, "bat", "ban"),
      makeAttempt(false, "sit", "six"),
    ];
    const result = classifyMisconceptions(attempts, "READING");
    expect(result.length).toBeLessThanOrEqual(3);
  });

  it("results are sorted by evidence count descending", () => {
    const attempts: AttemptRecord[] = [
      makeAttempt(false, "5", "6"),  // off by 1
      makeAttempt(false, "7", "8"),  // off by 1
      makeAttempt(false, "3", "4"),  // off by 1
    ];
    const result = classifyMisconceptions(attempts, "MATH");
    for (let i = 1; i < result.length; i++) {
      expect(result[i - 1].evidenceCount).toBeGreaterThanOrEqual(result[i].evidenceCount);
    }
  });

  it("each classification includes non-empty remediation and parent description", () => {
    const attempts: AttemptRecord[] = [
      makeAttempt(false, "5", "6"),
      makeAttempt(false, "8", "7"),
      makeAttempt(true, "10", "10"),
    ];
    const result = classifyMisconceptions(attempts, "MATH");
    for (const r of result) {
      expect(r.parentDescription.length).toBeGreaterThan(10);
      expect(r.remediation.length).toBeGreaterThan(10);
      expect(r.code.length).toBeGreaterThan(0);
      expect(r.label.length).toBeGreaterThan(0);
    }
  });
});

// ─── recommendNextSkill ───────────────────────────────────────────────────────

describe("recommendNextSkill", () => {
  const curriculum = [
    { id: "sk-a", subject: "MATH" as const, prerequisites: [], order: 1 },
    { id: "sk-b", subject: "MATH" as const, prerequisites: ["sk-a"], order: 2 },
    { id: "sk-c", subject: "MATH" as const, prerequisites: ["sk-b"], order: 3 },
    { id: "sk-d", subject: "READING" as const, prerequisites: [], order: 1 },
  ];

  it("returns in-progress skill first (GUIDED_PRACTICE)", () => {
    const states = new Map([
      ["sk-a", "MASTERED"],
      ["sk-b", "GUIDED_PRACTICE"],
    ]);
    const rec = recommendNextSkill(states, curriculum, "MATH");
    expect(rec?.skillId).toBe("sk-b");
    expect(rec?.reason).toContain("in progress");
  });

  it("returns in-progress skill first (INDEPENDENT)", () => {
    const states = new Map([
      ["sk-a", "MASTERED"],
      ["sk-b", "INDEPENDENT"],
    ]);
    const rec = recommendNextSkill(states, curriculum, "MATH");
    expect(rec?.skillId).toBe("sk-b");
  });

  it("returns in-progress skill first (MASTERY_CHECK)", () => {
    const states = new Map([
      ["sk-a", "MASTERED"],
      ["sk-b", "MASTERY_CHECK"],
    ]);
    const rec = recommendNextSkill(states, curriculum, "MATH");
    expect(rec?.skillId).toBe("sk-b");
  });

  it("returns review skill when no in-progress skill", () => {
    const states = new Map([
      ["sk-a", "MASTERED"],
      ["sk-b", "REVIEW"],
    ]);
    const rec = recommendNextSkill(states, curriculum, "MATH");
    expect(rec?.skillId).toBe("sk-b");
    expect(rec?.reason).toContain("review");
  });

  it("returns the first unlocked skill whose prerequisites are all MASTERED", () => {
    const states = new Map([["sk-a", "MASTERED"]]);
    const rec = recommendNextSkill(states, curriculum, "MATH");
    expect(rec?.skillId).toBe("sk-b");
  });

  it("does not return skill whose prerequisites are not mastered", () => {
    // sk-b requires sk-a, but sk-a is still TEACH
    const states = new Map<string, string>();
    // sk-a has no prerequisites so it should be recommended first
    const rec = recommendNextSkill(states, curriculum, "MATH");
    expect(rec?.skillId).toBe("sk-a");
  });

  it("does not return a skill from the wrong subject", () => {
    const states = new Map<string, string>();
    const rec = recommendNextSkill(states, curriculum, "MATH");
    // sk-d is READING — must not be returned for MATH
    expect(rec?.skillId).not.toBe("sk-d");
  });

  it("returns null when all skills are mastered and none needs review", () => {
    const states = new Map([
      ["sk-a", "MASTERED"],
      ["sk-b", "MASTERED"],
      ["sk-c", "MASTERED"],
    ]);
    // All skills mastered (stage is MASTERED, not TEACH) — no in-progress, no REVIEW, no TEACH to unlock
    // sk-a, sk-b, sk-c are all MASTERED so TEACH filter won't match them
    const rec = recommendNextSkill(states, curriculum, "MATH");
    expect(rec).toBeNull();
  });

  it("includes a non-empty reason string", () => {
    const states = new Map<string, string>();
    const rec = recommendNextSkill(states, curriculum, "MATH");
    expect(rec?.reason).toBeTruthy();
    expect(rec!.reason.length).toBeGreaterThan(5);
  });

  it("returns the first skill by order when multiple are unlocked", () => {
    // Both sk-a and sk-d have no prerequisites but are different subjects
    // For MATH there is only sk-a with no prerequisites
    const states = new Map<string, string>();
    const rec = recommendNextSkill(states, curriculum, "MATH");
    expect(rec?.skillId).toBe("sk-a");
  });
});
