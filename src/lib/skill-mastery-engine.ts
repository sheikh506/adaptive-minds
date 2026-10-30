/**
 * Skill Mastery Engine — P1-ENG1
 *
 * Implements the TEACH → GUIDED PRACTICE → INDEPENDENT PRACTICE → MASTERY CHECK → REVIEW pipeline.
 *
 * Design principles:
 *   - Deterministic: given the same StudentSkillState, always produces the same next stage
 *   - Explainable: every stage transition has a documented reason
 *   - No time-pressure: response time is never used as evidence of ability
 *   - Mastery is confirmed with unseen items only (is_unseen_item flag)
 *   - Historical practice data is never fabricated
 */

import { SkillStage } from "@prisma/client";

// ─── Stage advancement thresholds ────────────────────────────────────────────
//
// These constants are the single source of truth for the mastery pipeline.
// All are expressed as minimum counts of CORRECT answers in INDEPENDENT or MASTERY_CHECK
// stage to advance; we require a run of correct answers, not just a rate, to reduce
// noise from lucky guessing.

/** Minimum correct answers in GUIDED_PRACTICE before advancing to INDEPENDENT. */
export const GUIDED_CORRECT_TO_ADVANCE = 3;
/** Maximum total attempts in GUIDED before forced advancement (prevents getting stuck). */
export const GUIDED_TOTAL_MAX = 10;
/** Minimum accuracy in GUIDED before advancing (80%). */
export const GUIDED_ACCURACY_MIN = 0.7;

/** Minimum correct answers in INDEPENDENT before advancing to MASTERY_CHECK. */
export const INDEPENDENT_CORRECT_TO_ADVANCE = 4;
/** Maximum total attempts in INDEPENDENT before advancing regardless. */
export const INDEPENDENT_TOTAL_MAX = 12;
/** Minimum accuracy in INDEPENDENT to advance to MASTERY_CHECK (75%). */
export const INDEPENDENT_ACCURACY_MIN = 0.75;

/** Number of items in a MASTERY_CHECK (all must be unseen). */
export const MASTERY_CHECK_ITEMS = 5;
/** Minimum correct to pass MASTERY_CHECK (80%). */
export const MASTERY_CHECK_PASS_THRESHOLD = 4;

/** Initial review interval in days after mastery. */
export const INITIAL_REVIEW_INTERVAL_DAYS = 1;
/** Multiplier for review interval after a successful review. */
export const REVIEW_INTERVAL_MULTIPLIER = 2;
/** Maximum review interval in days. */
export const MAX_REVIEW_INTERVAL_DAYS = 30;

// ─── Types ───────────────────────────────────────────────────────────────────

export interface SkillStateSnapshot {
  stage: SkillStage;
  guidedCorrect: number;
  guidedTotal: number;
  independentCorrect: number;
  independentTotal: number;
  masteryCheckCorrect: number;
  masteryCheckTotal: number;
  masteredAt: Date | null;
  nextReviewAt: Date | null;
  reviewInterval: number;
}

export interface StageAdvancement {
  advancedFrom: SkillStage;
  advancedTo: SkillStage;
  reason: string;
}

export interface MasteryCheckResult {
  passed: boolean;
  correct: number;
  total: number;
  reason: string;
}

export interface SkillEngineOutput {
  /** The stage the student should be in after this attempt. */
  newStage: SkillStage;
  /** The next review date (only set when stage becomes MASTERED or REVIEW). */
  nextReviewAt: Date | null;
  /** The new review interval in days. */
  reviewInterval: number;
  /** Present only when a stage transition occurred. */
  advancement?: StageAdvancement;
  /** Present when the mastery check is complete. */
  masteryCheckResult?: MasteryCheckResult;
  /**
   * Human-readable explanation for parents: why is the student at this stage?
   * Avoids shaming language. Does not mention time taken.
   */
  parentExplanation: string;
}

// ─── Engine ──────────────────────────────────────────────────────────────────

/**
 * Evaluates the effect of one answer on a skill's mastery pipeline state.
 *
 * @param state   The current StudentSkillState snapshot (before this answer)
 * @param correct Whether the student answered correctly
 * @param usedHint Whether the student used a hint during this question
 * @param isUnseenItem Whether this question was drawn from the unseen mastery-check pool
 * @param now     Current timestamp (injectable for testing)
 */
export function evaluateSkillProgress(
  state: SkillStateSnapshot,
  correct: boolean,
  usedHint: boolean,
  isUnseenItem: boolean,
  now: Date = new Date()
): SkillEngineOutput {

  // Hints during mastery check: the child gets credit for the attempt but a hinted
  // answer does not count as a correct unseen-item response.
  const countsAsCorrect = correct && !(state.stage === "MASTERY_CHECK" && usedHint);

  switch (state.stage) {

    // ── TEACH → GUIDED_PRACTICE ──────────────────────────────────────────
    // The TEACH stage is set externally when a lesson card is shown.
    // The engine advances out of it on the very first attempt.
    case "TEACH": {
      return {
        newStage: "GUIDED_PRACTICE",
        nextReviewAt: null,
        reviewInterval: state.reviewInterval,
        advancement: {
          advancedFrom: "TEACH",
          advancedTo: "GUIDED_PRACTICE",
          reason: "Instruction viewed — starting guided practice.",
        },
        parentExplanation:
          "Your child has just seen the teaching for this skill and is beginning guided practice. " +
          "Hints are freely available at this stage.",
      };
    }

    // ── GUIDED_PRACTICE → INDEPENDENT ────────────────────────────────────
    case "GUIDED_PRACTICE": {
      const newCorrect = state.guidedCorrect + (countsAsCorrect ? 1 : 0);
      const newTotal = state.guidedTotal + 1;
      const accuracy = newTotal > 0 ? newCorrect / newTotal : 0;

      const shouldAdvance =
        (newCorrect >= GUIDED_CORRECT_TO_ADVANCE && accuracy >= GUIDED_ACCURACY_MIN) ||
        newTotal >= GUIDED_TOTAL_MAX;

      if (shouldAdvance) {
        return {
          newStage: "INDEPENDENT",
          nextReviewAt: null,
          reviewInterval: state.reviewInterval,
          advancement: {
            advancedFrom: "GUIDED_PRACTICE",
            advancedTo: "INDEPENDENT",
            reason: newTotal >= GUIDED_TOTAL_MAX
              ? `Completed ${newTotal} guided attempts — moving to independent practice.`
              : `Got ${newCorrect} correct out of ${newTotal} in guided practice.`,
          },
          parentExplanation:
            "Your child has practised with hints and is now ready to try on their own. " +
            `They answered ${newCorrect} out of ${newTotal} questions correctly in guided practice.`,
        };
      }

      return {
        newStage: "GUIDED_PRACTICE",
        nextReviewAt: null,
        reviewInterval: state.reviewInterval,
        parentExplanation:
          "Your child is building confidence with this skill. " +
          `They have answered ${newCorrect} of ${newTotal} guided questions correctly so far.`,
      };
    }

    // ── INDEPENDENT → MASTERY_CHECK ──────────────────────────────────────
    case "INDEPENDENT": {
      const newCorrect = state.independentCorrect + (countsAsCorrect ? 1 : 0);
      const newTotal = state.independentTotal + 1;
      const accuracy = newTotal > 0 ? newCorrect / newTotal : 0;

      const shouldAdvance =
        (newCorrect >= INDEPENDENT_CORRECT_TO_ADVANCE && accuracy >= INDEPENDENT_ACCURACY_MIN) ||
        newTotal >= INDEPENDENT_TOTAL_MAX;

      if (shouldAdvance) {
        return {
          newStage: "MASTERY_CHECK",
          nextReviewAt: null,
          reviewInterval: state.reviewInterval,
          advancement: {
            advancedFrom: "INDEPENDENT",
            advancedTo: "MASTERY_CHECK",
            reason: newTotal >= INDEPENDENT_TOTAL_MAX
              ? `Completed ${newTotal} independent attempts — starting mastery check.`
              : `Got ${newCorrect} correct (${Math.round(accuracy * 100)}%) in independent practice.`,
          },
          parentExplanation:
            "Your child is ready for a mastery check! " +
            `They answered ${newCorrect} of the last ${newTotal} independent questions correctly. ` +
            "The mastery check uses questions they haven't seen before.",
        };
      }

      return {
        newStage: "INDEPENDENT",
        nextReviewAt: null,
        reviewInterval: state.reviewInterval,
        parentExplanation:
          `Your child is practising independently. So far ${newCorrect} of ${newTotal} ` +
          "answers have been correct. They need a little more practice before the mastery check.",
      };
    }

    // ── MASTERY_CHECK → MASTERED or back to GUIDED_PRACTICE ──────────────
    case "MASTERY_CHECK": {
      // Only unseen items count in a mastery check. Hints also disqualify the item.
      const newCorrect = state.masteryCheckCorrect + (isUnseenItem && countsAsCorrect ? 1 : 0);
      const newTotal = state.masteryCheckTotal + (isUnseenItem ? 1 : 0);

      if (newTotal < MASTERY_CHECK_ITEMS) {
        // Not finished yet
        return {
          newStage: "MASTERY_CHECK",
          nextReviewAt: null,
          reviewInterval: state.reviewInterval,
          parentExplanation:
            `Mastery check in progress: ${newCorrect} of ${newTotal} completed so far.`,
        };
      }

      // Mastery check complete
      const passed = newCorrect >= MASTERY_CHECK_PASS_THRESHOLD;
      const masteryCheckResult: MasteryCheckResult = {
        passed,
        correct: newCorrect,
        total: newTotal,
        reason: passed
          ? `Passed: ${newCorrect}/${newTotal} correct on unseen items.`
          : `Did not pass: ${newCorrect}/${newTotal} correct on unseen items (need ${MASTERY_CHECK_PASS_THRESHOLD}).`,
      };

      if (passed) {
        const nextReviewAt = new Date(now.getTime() + INITIAL_REVIEW_INTERVAL_DAYS * 86_400_000);
        return {
          newStage: "MASTERED",
          nextReviewAt,
          reviewInterval: INITIAL_REVIEW_INTERVAL_DAYS,
          advancement: {
            advancedFrom: "MASTERY_CHECK",
            advancedTo: "MASTERED",
            reason: masteryCheckResult.reason,
          },
          masteryCheckResult,
          parentExplanation:
            `🌟 Your child has demonstrated mastery of this skill! ` +
            `They answered ${newCorrect} out of ${newTotal} unseen questions correctly. ` +
            `A review is scheduled for ${nextReviewAt.toLocaleDateString()} to keep the learning fresh.`,
        };
      } else {
        // Did not pass — return to guided practice
        return {
          newStage: "GUIDED_PRACTICE",
          nextReviewAt: null,
          reviewInterval: state.reviewInterval,
          advancement: {
            advancedFrom: "MASTERY_CHECK",
            advancedTo: "GUIDED_PRACTICE",
            reason: masteryCheckResult.reason,
          },
          masteryCheckResult,
          parentExplanation:
            `Your child worked hard on the mastery check for this skill. ` +
            `They answered ${newCorrect} of ${newTotal} correctly — a bit more practice will help. ` +
            `They have been moved back to guided practice where hints are available.`,
        };
      }
    }

    // ── MASTERED → REVIEW ────────────────────────────────────────────────
    case "MASTERED": {
      // A mastered skill just needs periodic review. Correct responses extend the interval.
      if (!countsAsCorrect) {
        // Regression: answer was wrong — drop back to guided practice
        return {
          newStage: "GUIDED_PRACTICE",
          nextReviewAt: null,
          reviewInterval: INITIAL_REVIEW_INTERVAL_DAYS,
          advancement: {
            advancedFrom: "MASTERED",
            advancedTo: "GUIDED_PRACTICE",
            reason: "Incorrect answer during review — skill needs refreshing.",
          },
          parentExplanation:
            "Your child's memory of this skill has faded a little. " +
            "A short review session with hints will refresh their learning.",
        };
      }
      // Passed review — extend the interval
      const newInterval = Math.min(
        Math.round(state.reviewInterval * REVIEW_INTERVAL_MULTIPLIER),
        MAX_REVIEW_INTERVAL_DAYS
      );
      const nextReviewAt = new Date(now.getTime() + newInterval * 86_400_000);
      return {
        newStage: "REVIEW",
        nextReviewAt,
        reviewInterval: newInterval,
        parentExplanation:
          `Your child reviewed this skill successfully. ` +
          `The next review is in ${newInterval} day(s) on ${nextReviewAt.toLocaleDateString()}.`,
      };
    }

    // ── REVIEW (periodic maintenance) ────────────────────────────────────
    case "REVIEW": {
      if (!countsAsCorrect) {
        return {
          newStage: "GUIDED_PRACTICE",
          nextReviewAt: null,
          reviewInterval: INITIAL_REVIEW_INTERVAL_DAYS,
          advancement: {
            advancedFrom: "REVIEW",
            advancedTo: "GUIDED_PRACTICE",
            reason: "Incorrect during spaced review — scheduled refresher.",
          },
          parentExplanation:
            "It has been a while since your child practised this skill and a small error suggests " +
            "it needs a brief refresh. They have been moved back to guided practice.",
        };
      }
      const newInterval = Math.min(
        Math.round(state.reviewInterval * REVIEW_INTERVAL_MULTIPLIER),
        MAX_REVIEW_INTERVAL_DAYS
      );
      const nextReviewAt = new Date(now.getTime() + newInterval * 86_400_000);
      return {
        newStage: "REVIEW",
        nextReviewAt,
        reviewInterval: newInterval,
        parentExplanation:
          `Review passed! Next review in ${newInterval} day(s) ` +
          `(${nextReviewAt.toLocaleDateString()}).`,
      };
    }
  }
}

/**
 * Generates a plain-language summary of a student's current skill state
 * suitable for the Parent Learning Companion dashboard.
 *
 * @param skillName  Human-readable skill name
 * @param state      Current StudentSkillState snapshot
 */
export function skillStateSummary(
  skillName: string,
  state: SkillStateSnapshot
): { badge: string; headline: string; detail: string } {
  switch (state.stage) {
    case "TEACH":
      return {
        badge: "🆕 New",
        headline: `${skillName} — Ready to start`,
        detail: "This skill hasn't been introduced yet.",
      };
    case "GUIDED_PRACTICE":
      return {
        badge: "🔨 Practising",
        headline: `${skillName} — Building confidence`,
        detail:
          `Your child is practising with hints available. ` +
          `${state.guidedCorrect} of ${state.guidedTotal} correct so far.`,
      };
    case "INDEPENDENT":
      return {
        badge: "🏋️ Independent",
        headline: `${skillName} — Practising on their own`,
        detail:
          `Your child is practising without hints. ` +
          `${state.independentCorrect} of ${state.independentTotal} correct so far.`,
      };
    case "MASTERY_CHECK":
      return {
        badge: "🎯 Assessment",
        headline: `${skillName} — Mastery check underway`,
        detail:
          `This check uses questions your child hasn't seen before to confirm they have truly learned the skill. ` +
          `${state.masteryCheckCorrect} of ${state.masteryCheckTotal} completed.`,
      };
    case "MASTERED":
      return {
        badge: "⭐ Mastered",
        headline: `${skillName} — Mastered!`,
        detail:
          `Mastered on ${state.masteredAt?.toLocaleDateString() ?? "recently"}. ` +
          (state.nextReviewAt
            ? `Next review: ${state.nextReviewAt.toLocaleDateString()}.`
            : ""),
      };
    case "REVIEW":
      return {
        badge: "🔄 Reviewing",
        headline: `${skillName} — Spaced review`,
        detail:
          `Your child is maintaining this skill with periodic practice. ` +
          (state.nextReviewAt
            ? `Next review: ${state.nextReviewAt.toLocaleDateString()}.`
            : ""),
      };
  }
}
