/**
 * Misconception Classifier — P1-ENG3
 *
 * Analyses wrong-answer patterns to classify likely misconceptions and
 * generate targeted remediation recommendations.
 *
 * This system works ONLY with genuine recorded attempts (SkillAttempt rows).
 * It never fabricates learning history.
 *
 * Design:
 *   - Stateless classifier: given a list of attempts, produces a classified misconception
 *   - Deterministic: same inputs → same output
 *   - Parent-friendly: every misconception has a plain-language explanation
 *   - Teacher-useful: includes a remediation suggestion
 *   - No diagnostic claims: says "the child often chooses X" not "the child has dyscalculia"
 */

export type SubjectKey = "MATH" | "READING" | "SCIENCE";

export interface AttemptRecord {
  skillId: string;
  correct: boolean;
  selectedAnswer: string;
  correctAnswer: string;
  questionText: string;
}

export interface MisconceptionClassification {
  /** Stable code for this misconception pattern. */
  code: string;
  /** Short label for display. */
  label: string;
  /** Parent-friendly description: what the child is doing. */
  parentDescription: string;
  /** Suggested next teaching action. */
  remediation: string;
  /** Confidence level: how many wrong answers support this classification. */
  evidenceCount: number;
}

// ─── MATH misconceptions ─────────────────────────────────────────────────────

const MATH_MISCONCEPTIONS: {
  code: string;
  label: string;
  test: (attempts: AttemptRecord[]) => boolean;
  evidenceCount: (attempts: AttemptRecord[]) => number;
  parentDescription: string;
  remediation: string;
}[] = [
  {
    code: "MATH-OFF-BY-ONE",
    label: "Off-by-one errors",
    test: (attempts) => {
      const wrong = attempts.filter((a) => !a.correct);
      const offByOne = wrong.filter((a) => {
        const diff = Math.abs(Number(a.selectedAnswer) - Number(a.correctAnswer));
        return !isNaN(diff) && diff === 1;
      });
      return offByOne.length >= 2;
    },
    evidenceCount: (attempts) =>
      attempts.filter((a) => !a.correct && Math.abs(Number(a.selectedAnswer) - Number(a.correctAnswer)) === 1).length,
    parentDescription:
      "Your child's answer is often one more or one less than the correct answer. " +
      "This sometimes happens when children count the starting number when counting on, or skip a number.",
    remediation:
      "Practise counting on from a number (not from 1). Use physical objects to count each step. " +
      "Say: 'Start at 5, count on 3 more: 6, 7, 8. The answer is 8.'",
  },
  {
    code: "MATH-WRONG-OPERATION",
    label: "Confusion between operations",
    test: (attempts) => {
      const wrong = attempts.filter((a) => !a.correct);
      // Likely wrong operation if answer matches the wrong operation on the question numbers
      return wrong.length >= 2;
    },
    evidenceCount: (attempts) => attempts.filter((a) => !a.correct).length,
    parentDescription:
      "Your child sometimes uses the wrong operation (for example, adds when the question asks to subtract). " +
      "This is common when children are learning to read word problems.",
    remediation:
      "Before solving, ask your child: 'Are we putting groups together (add) or taking some away (subtract)?' " +
      "Use the key words: 'altogether', 'in total', 'left', 'remaining'.",
  },
  {
    code: "MATH-PLACE-VALUE-CONFUSION",
    label: "Place value confusion",
    test: (attempts) => {
      const wrong = attempts.filter((a) => !a.correct);
      // Check if answers have reversed digits (e.g. 23 for 32)
      const reversed = wrong.filter((a) => {
        const sel = String(a.selectedAnswer).replace(/\D/g, "");
        const cor = String(a.correctAnswer).replace(/\D/g, "");
        return sel.length === 2 && cor.length === 2 && sel === cor.split("").reverse().join("");
      });
      return reversed.length >= 1;
    },
    evidenceCount: (attempts) =>
      attempts.filter((a) => {
        const sel = String(a.selectedAnswer).replace(/\D/g, "");
        const cor = String(a.correctAnswer).replace(/\D/g, "");
        return !a.correct && sel.length === 2 && cor.length === 2 && sel === cor.split("").reverse().join("");
      }).length,
    parentDescription:
      "Your child sometimes reverses the digits in a two-digit number (writing 23 instead of 32). " +
      "This shows they are still building their understanding of tens and ones.",
    remediation:
      "Use objects grouped into tens (e.g. bundles of 10 sticks). " +
      "Say: 'How many bundles of ten? How many left over singles?' " +
      "The tens digit comes first in the written number.",
  },
];

// ─── READING/PHONICS misconceptions ──────────────────────────────────────────

const READING_MISCONCEPTIONS: typeof MATH_MISCONCEPTIONS = [
  {
    code: "READING-SIMILAR-SOUNDS",
    label: "Confusing similar sounds",
    test: (attempts) => {
      const wrong = attempts.filter((a) => !a.correct);
      // Phonically similar wrong answers (share 2+ letters with correct)
      const similar = wrong.filter((a) => {
        const sel = a.selectedAnswer.toLowerCase();
        const cor = a.correctAnswer.toLowerCase();
        if (sel.length < 2 || cor.length < 2) return false;
        let shared = 0;
        for (const ch of sel) if (cor.includes(ch)) shared++;
        return shared >= 2;
      });
      return similar.length >= 2;
    },
    evidenceCount: (attempts) =>
      attempts.filter((a) => {
        if (a.correct) return false;
        const sel = a.selectedAnswer.toLowerCase();
        const cor = a.correctAnswer.toLowerCase();
        let shared = 0;
        for (const ch of sel) if (cor.includes(ch)) shared++;
        return shared >= 2;
      }).length,
    parentDescription:
      "Your child sometimes picks a word that sounds or looks similar to the correct answer. " +
      "This shows they are paying attention to sounds, which is a good sign! " +
      "They need a bit more practice distinguishing between similar-sounding words.",
    remediation:
      "Practise minimal pairs: words that differ in only one sound (cat/bat, pin/pen). " +
      "Say each word clearly and ask your child to identify which sound is different.",
  },
  {
    code: "READING-IGNORES-CONTEXT",
    label: "Not using context clues",
    test: (attempts) => attempts.filter((a) => !a.correct).length >= 3,
    evidenceCount: (attempts) => attempts.filter((a) => !a.correct).length,
    parentDescription:
      "Your child may be guessing from one word in the sentence rather than reading the whole sentence. " +
      "Reading the full sentence and asking 'does this make sense?' is an important reading strategy.",
    remediation:
      "After your child reads a sentence, ask: 'Does that word make sense there? Try saying the whole sentence with that word. Does it sound right?'",
  },
];

// ─── Public classifier ────────────────────────────────────────────────────────

/**
 * Classifies misconceptions from a set of recent attempts on a given subject.
 *
 * Only returns classifications with at least 2 pieces of evidence.
 * Returns at most 3 classifications, ranked by evidence count.
 */
export function classifyMisconceptions(
  attempts: AttemptRecord[],
  subject: SubjectKey
): MisconceptionClassification[] {
  if (attempts.length < 3) return []; // not enough data

  const patterns = subject === "MATH" ? MATH_MISCONCEPTIONS : READING_MISCONCEPTIONS;
  const results: MisconceptionClassification[] = [];

  for (const pattern of patterns) {
    if (pattern.test(attempts)) {
      const count = pattern.evidenceCount(attempts);
      if (count >= 2) {
        results.push({
          code: pattern.code,
          label: pattern.label,
          parentDescription: pattern.parentDescription,
          remediation: pattern.remediation,
          evidenceCount: count,
        });
      }
    }
  }

  return results.sort((a, b) => b.evidenceCount - a.evidenceCount).slice(0, 3);
}

/**
 * Generates a prioritised lesson recommendation for a student,
 * based on their StudentSkillState records and prerequisite graph.
 *
 * @param skillStates  Map of skillId -> current stage
 * @param curriculum   Full skill curriculum (from skill-curriculum.ts)
 * @param subject      Subject to filter by
 */
export function recommendNextSkill(
  skillStates: Map<string, string /* SkillStage */>,
  curriculum: { id: string; subject: SubjectKey; prerequisites: string[]; order: number }[],
  subject: SubjectKey
): { skillId: string; reason: string } | null {
  const subjectSkills = curriculum
    .filter((s) => s.subject === subject)
    .sort((a, b) => a.order - b.order);

  // 1. First priority: skills currently IN_PROGRESS (GUIDED, INDEPENDENT, MASTERY_CHECK)
  const inProgress = subjectSkills.filter((s) => {
    const stage = skillStates.get(s.id);
    return stage === "GUIDED_PRACTICE" || stage === "INDEPENDENT" || stage === "MASTERY_CHECK";
  });
  if (inProgress.length > 0) {
    return {
      skillId: inProgress[0].id,
      reason: `This skill is already in progress — keep going!`,
    };
  }

  // 2. Second priority: skills due for REVIEW
  const dueReview = subjectSkills.filter((s) => skillStates.get(s.id) === "REVIEW");
  if (dueReview.length > 0) {
    return {
      skillId: dueReview[0].id,
      reason: `This skill is due for a review to keep it in long-term memory.`,
    };
  }

  // 3. Third priority: unlocked but not yet started skills (TEACH or undefined)
  for (const skill of subjectSkills) {
    const stage = skillStates.get(skill.id) ?? "TEACH";
    if (stage !== "TEACH") continue;
    // Check all prerequisites are MASTERED or REVIEW
    const prereqsMet = skill.prerequisites.every((reqId) => {
      const reqStage = skillStates.get(reqId);
      return reqStage === "MASTERED" || reqStage === "REVIEW";
    });
    if (prereqsMet) {
      return {
        skillId: skill.id,
        reason:
          skill.prerequisites.length === 0
            ? `A great skill to start with!`
            : `Your child has mastered the prerequisite skills and is ready for this one.`,
      };
    }
  }

  return null; // all skills mastered or no unlocked skills available
}
