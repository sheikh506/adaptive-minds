/**
 * Skill Mastery Engine Tests — P1
 *
 * Verifies the deterministic TEACH → GUIDED → INDEPENDENT → MASTERY_CHECK → MASTERED pipeline.
 */

import { describe, expect, it } from "vitest";
import {
  evaluateSkillProgress,
  skillStateSummary,
  GUIDED_CORRECT_TO_ADVANCE,
  GUIDED_TOTAL_MAX,
  INDEPENDENT_CORRECT_TO_ADVANCE,
  MASTERY_CHECK_ITEMS,
  MASTERY_CHECK_PASS_THRESHOLD,
  INITIAL_REVIEW_INTERVAL_DAYS,
  REVIEW_INTERVAL_MULTIPLIER,
  type SkillStateSnapshot,
} from "./skill-mastery-engine";
import { SKILL_CURRICULUM, allPrerequisites } from "./skill-curriculum";

const BASE_STATE: SkillStateSnapshot = {
  stage: "TEACH",
  guidedCorrect: 0,
  guidedTotal: 0,
  independentCorrect: 0,
  independentTotal: 0,
  masteryCheckCorrect: 0,
  masteryCheckTotal: 0,
  masteredAt: null,
  nextReviewAt: null,
  reviewInterval: 1,
};

const NOW = new Date("2024-06-01T10:00:00Z");

describe("skill mastery engine — stage pipeline", () => {

  it("any answer in TEACH advances immediately to GUIDED_PRACTICE", () => {
    const out = evaluateSkillProgress(BASE_STATE, true, false, false, NOW);
    expect(out.newStage).toBe("GUIDED_PRACTICE");
    expect(out.advancement?.advancedFrom).toBe("TEACH");
    expect(out.advancement?.advancedTo).toBe("GUIDED_PRACTICE");
  });

  it("GUIDED_PRACTICE advances after enough correct answers", () => {
    let state: SkillStateSnapshot = { ...BASE_STATE, stage: "GUIDED_PRACTICE" };
    for (let i = 0; i < GUIDED_CORRECT_TO_ADVANCE - 1; i++) {
      const out = evaluateSkillProgress(state, true, false, false, NOW);
      expect(out.newStage).toBe("GUIDED_PRACTICE");
      state = { ...state, guidedCorrect: i + 1, guidedTotal: i + 1 };
    }
    // One more correct answer should advance
    state = { ...state, guidedCorrect: GUIDED_CORRECT_TO_ADVANCE - 1, guidedTotal: GUIDED_CORRECT_TO_ADVANCE - 1 };
    const out = evaluateSkillProgress(state, true, false, false, NOW);
    expect(out.newStage).toBe("INDEPENDENT");
  });

  it("GUIDED_PRACTICE force-advances after GUIDED_TOTAL_MAX attempts", () => {
    const state: SkillStateSnapshot = {
      ...BASE_STATE,
      stage: "GUIDED_PRACTICE",
      guidedCorrect: 2,
      guidedTotal: GUIDED_TOTAL_MAX - 1,
    };
    const out = evaluateSkillProgress(state, false, false, false, NOW);
    expect(out.newStage).toBe("INDEPENDENT");
  });

  it("INDEPENDENT advances after enough correct answers", () => {
    const state: SkillStateSnapshot = {
      ...BASE_STATE,
      stage: "INDEPENDENT",
      independentCorrect: INDEPENDENT_CORRECT_TO_ADVANCE - 1,
      independentTotal: INDEPENDENT_CORRECT_TO_ADVANCE - 1,
    };
    const out = evaluateSkillProgress(state, true, false, false, NOW);
    expect(out.newStage).toBe("MASTERY_CHECK");
    expect(out.advancement?.advancedTo).toBe("MASTERY_CHECK");
  });

  it("MASTERY_CHECK stays in progress until all items are answered", () => {
    const state: SkillStateSnapshot = {
      ...BASE_STATE,
      stage: "MASTERY_CHECK",
      masteryCheckCorrect: 0,
      masteryCheckTotal: 0,
    };
    // First unseen correct answer — not done yet
    const out = evaluateSkillProgress(state, true, false, true, NOW);
    expect(out.newStage).toBe("MASTERY_CHECK");
    expect(out.masteryCheckResult).toBeUndefined();
  });

  it("MASTERY_CHECK passes when enough unseen items answered correctly", () => {
    const state: SkillStateSnapshot = {
      ...BASE_STATE,
      stage: "MASTERY_CHECK",
      masteryCheckCorrect: MASTERY_CHECK_PASS_THRESHOLD - 1,
      masteryCheckTotal: MASTERY_CHECK_ITEMS - 1,
    };
    const out = evaluateSkillProgress(state, true, false, true, NOW);
    expect(out.newStage).toBe("MASTERED");
    expect(out.masteryCheckResult?.passed).toBe(true);
    expect(out.nextReviewAt).not.toBeNull();
  });

  it("MASTERY_CHECK fails when not enough correct — returns to GUIDED_PRACTICE", () => {
    const state: SkillStateSnapshot = {
      ...BASE_STATE,
      stage: "MASTERY_CHECK",
      // Only MASTERY_CHECK_PASS_THRESHOLD - 2 correct so far, one more wrong answer finishes it
      masteryCheckCorrect: MASTERY_CHECK_PASS_THRESHOLD - 2,
      masteryCheckTotal: MASTERY_CHECK_ITEMS - 1,
    };
    const out = evaluateSkillProgress(state, false, false, true, NOW);
    expect(out.newStage).toBe("GUIDED_PRACTICE");
    expect(out.masteryCheckResult?.passed).toBe(false);
    expect(out.advancement?.advancedTo).toBe("GUIDED_PRACTICE");
  });

  it("hints during MASTERY_CHECK do not count as correct unseen items", () => {
    const state: SkillStateSnapshot = {
      ...BASE_STATE,
      stage: "MASTERY_CHECK",
      masteryCheckCorrect: MASTERY_CHECK_PASS_THRESHOLD - 1,
      masteryCheckTotal: MASTERY_CHECK_ITEMS - 1,
    };
    // Correct with a hint — should NOT pass because hint is used
    const out = evaluateSkillProgress(state, true, true, true, NOW);
    // The total increments but correct does not (hint disqualifies it)
    expect(out.masteryCheckResult?.passed).toBe(false);
    expect(out.newStage).toBe("GUIDED_PRACTICE");
  });

  it("MASTERED advances review interval on each correct review", () => {
    const state: SkillStateSnapshot = {
      ...BASE_STATE,
      stage: "MASTERED",
      reviewInterval: INITIAL_REVIEW_INTERVAL_DAYS,
      masteredAt: NOW,
    };
    const out = evaluateSkillProgress(state, true, false, false, NOW);
    expect(out.newStage).toBe("REVIEW");
    expect(out.reviewInterval).toBe(
      Math.round(INITIAL_REVIEW_INTERVAL_DAYS * REVIEW_INTERVAL_MULTIPLIER)
    );
    expect(out.nextReviewAt).not.toBeNull();
  });

  it("wrong answer in MASTERED drops back to GUIDED_PRACTICE", () => {
    const state: SkillStateSnapshot = {
      ...BASE_STATE,
      stage: "MASTERED",
      reviewInterval: 7,
      masteredAt: NOW,
    };
    const out = evaluateSkillProgress(state, false, false, false, NOW);
    expect(out.newStage).toBe("GUIDED_PRACTICE");
    expect(out.advancement?.advancedFrom).toBe("MASTERED");
  });

  it("review interval is capped at MAX_REVIEW_INTERVAL_DAYS", () => {
    const state: SkillStateSnapshot = {
      ...BASE_STATE,
      stage: "REVIEW",
      reviewInterval: 28, // next multiplication would exceed 30
    };
    const out = evaluateSkillProgress(state, true, false, false, NOW);
    expect(out.reviewInterval).toBeLessThanOrEqual(30);
  });

  it("parent explanation never mentions time taken", () => {
    for (const stage of ["TEACH", "GUIDED_PRACTICE", "INDEPENDENT", "MASTERY_CHECK", "MASTERED", "REVIEW"] as const) {
      const state: SkillStateSnapshot = { ...BASE_STATE, stage };
      const out = evaluateSkillProgress(state, true, false, stage === "MASTERY_CHECK", NOW);
      expect(out.parentExplanation.toLowerCase()).not.toMatch(
        /\b(time|second|minute|speed|fast|slow|quick)\b/
      );
    }
  });

  it("parent explanation never uses shaming language", () => {
    for (const stage of ["TEACH", "GUIDED_PRACTICE", "INDEPENDENT", "MASTERY_CHECK", "MASTERED", "REVIEW"] as const) {
      const state: SkillStateSnapshot = { ...BASE_STATE, stage };
      const out = evaluateSkillProgress(state, false, false, stage === "MASTERY_CHECK", NOW);
      expect(out.parentExplanation.toLowerCase()).not.toMatch(
        /\b(fail|failed|wrong|bad|stupid|dumb|terrible)\b/
      );
    }
  });
});

describe("skill mastery engine — state summary", () => {
  it("produces a non-empty badge and headline for every stage", () => {
    for (const stage of ["TEACH", "GUIDED_PRACTICE", "INDEPENDENT", "MASTERY_CHECK", "MASTERED", "REVIEW"] as const) {
      const state: SkillStateSnapshot = { ...BASE_STATE, stage };
      const s = skillStateSummary("Test Skill", state);
      expect(s.badge.length).toBeGreaterThan(0);
      expect(s.headline).toContain("Test Skill");
    }
  });
});

describe("skill curriculum — structure", () => {
  it("has no duplicate skill IDs", () => {
    const ids = SKILL_CURRICULUM.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("all prerequisites reference valid skill IDs", () => {
    const ids = new Set(SKILL_CURRICULUM.map((s) => s.id));
    for (const skill of SKILL_CURRICULUM) {
      for (const req of skill.prerequisites) {
        expect(ids.has(req), `${skill.id} requires unknown skill "${req}"`).toBe(true);
      }
    }
  });

  it("has no cycles in the prerequisite graph", () => {
    const visiting = new Set<string>();
    const done = new Set<string>();
    const ids = new Set(SKILL_CURRICULUM.map((s) => s.id));
    const visit = (id: string) => {
      expect(visiting.has(id), `Cycle detected at "${id}"`).toBe(false);
      if (done.has(id)) return;
      visiting.add(id);
      const skill = SKILL_CURRICULUM.find((s) => s.id === id);
      for (const req of skill?.prerequisites ?? []) visit(req);
      visiting.delete(id);
      done.add(id);
    };
    for (const skill of SKILL_CURRICULUM) visit(skill.id);
  });

  it("stage ranges are valid (stageMin <= stageMax, both 0-4)", () => {
    for (const skill of SKILL_CURRICULUM) {
      expect(skill.stageMin, `${skill.id}: stageMin`).toBeGreaterThanOrEqual(0);
      expect(skill.stageMax, `${skill.id}: stageMax`).toBeLessThanOrEqual(4);
      expect(skill.stageMin, `${skill.id}: stageMin <= stageMax`).toBeLessThanOrEqual(skill.stageMax);
    }
  });

  it("allPrerequisites returns transitive closure without cycles", () => {
    // math-addition-two-digit requires math-place-value-tens which requires math-counting-0-100
    // so allPrerequisites should include math-counting-0-100
    const prereqs = allPrerequisites("math-addition-two-digit", SKILL_CURRICULUM);
    expect(prereqs.has("math-counting-0-100")).toBe(true);
    expect(prereqs.has("math-addition-two-digit")).toBe(false); // should not include itself
  });

  it("early phonics skills target stage 0-1 (age 4-6)", () => {
    const letterNames = SKILL_CURRICULUM.find((s) => s.id === "ph-letter-names");
    expect(letterNames?.stageMin).toBe(0);
    expect(letterNames?.stageMax).toBeLessThanOrEqual(1);
  });
});
