/**
 * src/lib/parent-companion.ts
 *
 * Server-side helpers for the Parent Learning Companion.
 *
 * Returns genuinely-evidenced data only:
 *   - Skill mastery state sourced from StudentSkillState rows
 *   - Progress sourced from ExerciseSession and Progress rows
 *   - Recommendations sourced from the skill curriculum + mastery engine
 *
 * Never infers mastery from XP, stars, streaks, or question counts alone.
 * Never mentions response time.
 */

import { prisma } from "@/lib/prisma";
import { SKILL_CURRICULUM } from "@/lib/skill-curriculum";
import { skillStateSummary, type SkillStateSnapshot } from "@/lib/skill-mastery-engine";
import { recommendNextSkill } from "@/lib/misconception-classifier";
import type { SkillStage } from "@prisma/client";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface SkillMasteryEntry {
  skillId: string;
  skillName: string;
  subject: "MATH" | "READING" | "SCIENCE";
  badge: string;
  headline: string;
  detail: string;
  stage: SkillStage;
  masteredAt: Date | null;
  nextReviewAt: Date | null;
  /** Attempts recorded in this skill (from SkillAttempt rows only — never fabricated) */
  totalAttempts: number;
  correctAttempts: number;
}

export interface SubjectSkillMap {
  subject: "MATH" | "READING" | "SCIENCE";
  label: string;
  emoji: string;
  skills: SkillMasteryEntry[];
  /** Count of skills with at least one recorded attempt */
  started: number;
  mastered: number;
}

export interface NextStepRecommendation {
  skillId: string;
  skillName: string;
  subject: "MATH" | "READING" | "SCIENCE";
  reason: string;
  /** What a parent can do at home to support this skill. */
  offlineActivity: string;
}

export interface ChildCompanionData {
  childId: string;
  childName: string;
  lastActiveAt: Date | null;
  subjectMaps: SubjectSkillMap[];
  nextSteps: NextStepRecommendation[];
  /** Count of skills demonstrated as MASTERED across all subjects */
  totalMastered: number;
  /** Count of skills currently in progress */
  totalInProgress: number;
  /** Weekly sessions (last 7 days) — sourced from ExerciseSession, not from skill states */
  weeklySessionCount: number;
  /** A brief narrative summary for parents in plain language */
  narrative: string;
}

// ─── Offline activities ───────────────────────────────────────────────────────

const OFFLINE_ACTIVITIES: Record<string, string> = {
  "ph-letter-names":
    "Play 'I spy with my little eye… something beginning with the letter ___'. Take turns choosing a letter.",
  "ph-letter-sounds-consonants":
    "Say a consonant letter together and think of 3 words that start with its sound. Try 'b': ball, bat, bus.",
  "ph-letter-sounds-vowels-short":
    "Sort small objects or pictures into 5 groups by their vowel sound: /a/, /e/, /i/, /o/, /u/.",
  "ph-cvc-blending":
    "Write three-letter words on slips of paper. Take turns blending them aloud: 'c… a… t — cat!'",
  "ph-cvc-segmenting":
    "Say a CVC word and clap the sounds one at a time: 'dog — d (clap) o (clap) g (clap)'. How many claps?",
  "ph-initial-blends":
    "Look around the house for things that start with blends: a flag, a glass, a tree. Say the blend slowly.",
  "ph-digraphs":
    "Make two cards: 'sh' and 'ch'. Name objects around the house and hold up the matching card.",
  "ph-long-vowels-silent-e":
    "Make word pairs with magnetic letters: 'cap → cape', 'hop → hope'. Talk about what the silent e does.",
  "ph-vowel-teams":
    "Read a simple picture book together and tap the page every time you see a vowel team (ai, ee, oa, etc.).",
  "ph-rhyme":
    "Play 'Rhyme Tag': say a word and take turns adding a rhyming word until someone gets stuck.",
  "ph-syllables":
    "Clap the syllables in family members' names. 'Ma-ma' (2), 'Grand-ma-ma' (3).",
  "vocab-opposites":
    "Play 'Opposite Snap': hold up any object and your child must say its opposite quality (big → small, heavy → light).",
  "vocab-synonyms":
    "While reading a story, pause and ask: 'What's another word for that?' Celebrate creative answers.",
  "vocab-context-clues":
    "When your child meets an unfamiliar word in a book, cover it and ask: 'What word makes sense here?'",
  "math-counting-0-10":
    "Count everyday objects together: stairs, crackers, buttons on a shirt.",
  "math-counting-0-20":
    "Play 'Count and Race': one person counts objects, the other counts steps — who finishes first?",
  "math-counting-0-100":
    "Count by 10s while jumping on a trampoline or bouncing a ball.",
  "math-compare-numbers":
    "Deal two playing cards each. Who has more? Use the words 'more', 'fewer', 'equal'.",
  "math-addition-to-10":
    "Use a handful of pennies. Put some in each hand, then open both — count the total together.",
  "math-subtraction-within-10":
    "Put 8 grapes on a plate. Eat some and ask: 'How many are left?' Repeat.",
  "math-addition-to-20":
    "Play 'Race to 20' with a die: take turns rolling and adding — first to 20 wins.",
  "math-subtraction-within-20":
    "Play 'Countdown': start from 20, take turns subtracting a die roll — first to reach 0 wins.",
  "math-place-value-tens":
    "Bundle 10 pasta sticks with a rubber band. Make numbers with bundles and singles: 'This is 3 tens and 4 ones — 34!'",
  "math-addition-two-digit":
    "Write two-digit numbers on sticky notes. Add them on paper together using tens-and-ones columns.",
  "math-subtraction-two-digit":
    "Use a hundreds chart. Point to a number and count back by 10s or 1s to subtract.",
  "math-shapes-2d":
    "Go on a shape hunt indoors: find a circle (clock), a rectangle (door), a triangle (sandwich corner).",
  "math-shapes-3d":
    "Collect household objects and sort them: cubes (dice), spheres (ball), cylinders (can).",
  "math-measurement-length":
    "Measure objects with your child's shoe as a non-standard unit. 'The table is 4 shoes long!'",
  "math-time-oclock":
    "Set an analogue clock to the hour and ask your child to read it. Change the hour hand and try again.",
  "sci-living-nonliving":
    "Go for a walk and point to things. 'Is it living or non-living? How do you know?'",
  "sci-plant-parts":
    "Look at a real plant together. Point to each part and ask your child to name it and say what it does.",
  "sci-animal-groups":
    "Look at animal pictures in a book or online. Sort them into groups — can your child name what makes each group the same?",
  "sci-weather-types":
    "Keep a simple weather diary for a week. Draw a symbol for each day's weather.",
  "sci-states-matter":
    "Explore the kitchen together: 'Is this a solid, liquid or gas?' Ice cube, water, steam from a kettle.",
};

// ─── Main function ────────────────────────────────────────────────────────────

/**
 * Loads all evidence-based companion data for a child, as seen by their parent.
 * Returns null if the requesting parent does not have a link to this child.
 */
export async function loadChildCompanionData(
  parentId: string,
  childId: string
): Promise<ChildCompanionData | null> {
  // Security check: confirm this parent is linked to this child
  const link = await prisma.parentChild.findUnique({
    where: { parentId_childId: { parentId, childId } },
    select: { childId: true },
  });
  if (!link) return null;

  const child = await prisma.user.findUnique({
    where: { id: childId },
    select: { name: true, lastActiveAt: true },
  });
  if (!child) return null;

  // Load skill states
  const skillStates = await prisma.studentSkillState.findMany({
    where: { userId: childId },
    select: {
      skillId: true,
      stage: true,
      guidedCorrect: true,
      guidedTotal: true,
      independentCorrect: true,
      independentTotal: true,
      masteryCheckCorrect: true,
      masteryCheckTotal: true,
      masteredAt: true,
      nextReviewAt: true,
      reviewInterval: true,
    },
  });

  // Load attempt counts per skill
  const attemptCounts = await prisma.skillAttempt.groupBy({
    by: ["skillId"],
    where: { userId: childId },
    _count: { id: true },
  });
  const correctCounts = await prisma.skillAttempt.groupBy({
    by: ["skillId"],
    where: { userId: childId, correct: true },
    _count: { id: true },
  });

  // Weekly session count (last 7 days)
  const weeklySessionCount = await prisma.exerciseSession.count({
    where: {
      userId: childId,
      completedAt: { gt: new Date(Date.now() - 7 * 86_400_000) },
    },
  });

  // Build lookup maps
  const stateBySkillId = new Map(skillStates.map((s) => [s.skillId, s]));
  const attemptBySkillId = new Map(attemptCounts.map((a) => [a.skillId, a._count.id]));
  const correctBySkillId = new Map(correctCounts.map((a) => [a.skillId, a._count.id]));
  const skillStageMap = new Map(skillStates.map((s) => [s.skillId, s.stage as string]));

  // Build subject maps
  const subjects: Array<{ key: "MATH" | "READING" | "SCIENCE"; label: string; emoji: string }> = [
    { key: "READING", label: "Reading & Phonics", emoji: "📚" },
    { key: "MATH", label: "Mathematics", emoji: "🔢" },
    { key: "SCIENCE", label: "Science", emoji: "🔬" },
  ];

  const subjectMaps: SubjectSkillMap[] = [];
  const nextSteps: NextStepRecommendation[] = [];

  for (const { key, label, emoji } of subjects) {
    const curriculumSkills = SKILL_CURRICULUM.filter((s) => s.subject === key);
    const entries: SkillMasteryEntry[] = curriculumSkills.map((skillDef) => {
      const state = stateBySkillId.get(skillDef.id);
      const snapshot: SkillStateSnapshot = state
        ? {
            stage: state.stage as SkillStage,
            guidedCorrect: state.guidedCorrect,
            guidedTotal: state.guidedTotal,
            independentCorrect: state.independentCorrect,
            independentTotal: state.independentTotal,
            masteryCheckCorrect: state.masteryCheckCorrect,
            masteryCheckTotal: state.masteryCheckTotal,
            masteredAt: state.masteredAt,
            nextReviewAt: state.nextReviewAt,
            reviewInterval: state.reviewInterval,
          }
        : {
            stage: "TEACH" as SkillStage,
            guidedCorrect: 0, guidedTotal: 0,
            independentCorrect: 0, independentTotal: 0,
            masteryCheckCorrect: 0, masteryCheckTotal: 0,
            masteredAt: null, nextReviewAt: null, reviewInterval: 1,
          };

      const summary = skillStateSummary(skillDef.name, snapshot);
      return {
        skillId: skillDef.id,
        skillName: skillDef.name,
        subject: key,
        badge: summary.badge,
        headline: summary.headline,
        detail: summary.detail,
        stage: snapshot.stage,
        masteredAt: snapshot.masteredAt,
        nextReviewAt: snapshot.nextReviewAt,
        totalAttempts: attemptBySkillId.get(skillDef.id) ?? 0,
        correctAttempts: correctBySkillId.get(skillDef.id) ?? 0,
      };
    });

    const started = entries.filter((e) => e.totalAttempts > 0).length;
    const mastered = entries.filter((e) => e.stage === "MASTERED" || e.stage === "REVIEW").length;

    subjectMaps.push({ subject: key, label, emoji, skills: entries, started, mastered });

    // Skill recommendation for this subject
    const rec = recommendNextSkill(
      skillStageMap,
      curriculumSkills.map((s) => ({ id: s.id, subject: key, prerequisites: s.prerequisites, order: s.order })),
      key
    );
    if (rec) {
      const skillDef = SKILL_CURRICULUM.find((s) => s.id === rec.skillId);
      if (skillDef) {
        nextSteps.push({
          skillId: rec.skillId,
          skillName: skillDef.name,
          subject: key,
          reason: rec.reason,
          offlineActivity: OFFLINE_ACTIVITIES[rec.skillId] ?? "Practise this skill together using real objects.",
        });
      }
    }
  }

  const totalMastered = subjectMaps.reduce((s, m) => s + m.mastered, 0);
  const totalInProgress = skillStates.filter(
    (s) => s.stage === "GUIDED_PRACTICE" || s.stage === "INDEPENDENT" || s.stage === "MASTERY_CHECK"
  ).length;

  // Plain-language narrative
  const narrative = buildNarrative(child.name ?? "Your child", totalMastered, totalInProgress, weeklySessionCount, subjectMaps);

  return {
    childId,
    childName: child.name ?? "Your child",
    lastActiveAt: child.lastActiveAt,
    subjectMaps,
    nextSteps,
    totalMastered,
    totalInProgress,
    weeklySessionCount,
    narrative,
  };
}

function buildNarrative(
  name: string,
  mastered: number,
  inProgress: number,
  weekSessions: number,
  subjectMaps: SubjectSkillMap[]
): string {
  const parts: string[] = [];

  if (weekSessions === 0) {
    parts.push(`${name} hasn't had a session yet this week.`);
  } else if (weekSessions === 1) {
    parts.push(`${name} had 1 session this week.`);
  } else {
    parts.push(`${name} completed ${weekSessions} sessions this week.`);
  }

  if (mastered === 0 && inProgress === 0) {
    parts.push("No skills have been formally started yet — the next session will begin the learning journey.");
  } else {
    if (mastered > 0) {
      parts.push(`${mastered} skill${mastered > 1 ? "s have" : " has"} been demonstrated with unseen questions.`);
    }
    if (inProgress > 0) {
      parts.push(`${inProgress} skill${inProgress > 1 ? "s are" : " is"} currently in progress.`);
    }
  }

  // Highlight a strength
  const masteredSubjects = subjectMaps.filter((m) => m.mastered > 0).sort((a, b) => b.mastered - a.mastered);
  if (masteredSubjects.length > 0) {
    const top = masteredSubjects[0];
    parts.push(`${name} is doing well in ${top.label} with ${top.mastered} mastered skill${top.mastered > 1 ? "s" : ""}.`);
  }

  return parts.join(" ");
}
