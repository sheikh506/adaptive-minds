"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { adaptContinuous, checkBadgeConditions } from "@/lib/adaptive-engine";
import { goalSecondsByTopic, loadPlayState, usedSecondsByTopic } from "@/lib/practice";
import type { PlayState } from "@/lib/question-types";
import { lessonFor, type WorkedExample } from "@/lib/lessons";
import {
  DEFAULT_PRACTICE_MINUTES,
  MAX_HINT_STAGE,
  ROUND_BONUS_STARS,
  ROUND_BONUS_XP,
  ROUND_SIZE,
  cheer,
  clampHintStage,
  comboFromResults,
  companionStage,
  hintCostsXP,
  nextStreak,
  optionsToEliminate,
  roundStars,
  xpWithHint,
} from "@/lib/game";

interface SubmitParams {
  exerciseId: string;
  selectedAnswer: string;
  timeTaken: number;
  /** Highest hint stage the child opened (0 = none). The server decides what that costs. */
  hintStage?: number;
  /** Older clients: treated as the 50:50 stage. */
  hintUsed?: boolean;
}

/** One step of the hint ladder. Never contains the answer to the question being asked. */
export interface HintStep {
  stage: number;
  kind: "nudge" | "example" | "eliminate";
  text?: string;
  example?: WorkedExample;
  eliminate?: string[];
  /** true when taking this hint halves the XP for the question */
  costsXP: boolean;
}

export interface SubmitResult {
  correct: boolean;
  correctAnswer: string;
  explanation?: string;
  xpEarned: number;
  starsEarned: number;
  levelChange: "up" | "down" | "same";
  message: string;
  newBadges: string[];
  cheer: string;
  combo: number;
  /** Every ROUND_SIZE answers is a small bonus moment. It never stops the flow. */
  questStep: number;
  questDone: boolean;
  quest?: { correct: number; bonusXP: number; bonusStars: number; stars: number };
  evolvedTo?: { name: string; emoji: string };
  streakDays: number;
  /** Server-measured practice time for this skill today, and the parent's daily goal. */
  usedSec: number;
  goalSec: number;
  timeUp: boolean;
}

async function requireUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");
  return session.user.id;
}

/** The next question for a world, or a "done" summary once today's practice time is used up. */
export async function fetchNextQuestion(topicId: string): Promise<PlayState> {
  const userId = await requireUserId();
  return loadPlayState(userId, topicId);
}

/**
 * Hint ladder. Stage 1: a nudge toward the strategy. Stage 2: a worked example of a DIFFERENT problem.
 * Stage 3: remove two wrong options (50:50). The answer itself is never returned, only wrong options to hide.
 */
export async function getHint(exerciseId: string, stage: number = MAX_HINT_STAGE): Promise<HintStep> {
  await requireUserId();
  const exercise = await prisma.exercise.findUnique({ where: { id: exerciseId } });
  if (!exercise) throw new Error("Exercise not found");
  const data = exercise.data as { answer: string; options: string[] };
  const s = Math.max(1, clampHintStage(stage));
  const lesson = lessonFor(exercise.topicId);

  // A topic with no lesson skips straight to 50:50 for the first two stages.
  if (s === 1 && lesson) return { stage: 1, kind: "nudge", text: lesson.nudge, costsXP: hintCostsXP(1) };
  if (s === 2 && lesson) return { stage: 2, kind: "example", example: lesson.example, costsXP: hintCostsXP(2) };
  return {
    stage: MAX_HINT_STAGE,
    kind: "eliminate",
    eliminate: optionsToEliminate(data.options, data.answer),
    costsXP: hintCostsXP(MAX_HINT_STAGE),
  };
}

/** Records that the child read this skill's "Learn first" lesson. */
export async function markLessonSeen(topicId: string): Promise<void> {
  const userId = await requireUserId();
  if (!lessonFor(topicId)) return;
  await prisma.progress.upsert({
    where: { userId_topicId: { userId, topicId } },
    update: { lessonsSeen: 1 },
    create: { userId, topicId, level: 1, lessonsSeen: 1 },
  });
}

/** The child chose to skip (or finished) the first placement quest. */
export async function markPlacementDone(): Promise<void> {
  const userId = await requireUserId();
  await prisma.user.update({ where: { id: userId }, data: { placementDone: true } });
}

export async function submitExerciseAnswer(params: SubmitParams): Promise<SubmitResult> {
  const userId = await requireUserId();

  const exercise = await prisma.exercise.findUnique({ where: { id: params.exerciseId } });
  if (!exercise) throw new Error("Exercise not found");

  const data = exercise.data as { answer: string; explanation?: string };
  const topicId = exercise.topicId;
  const correct = params.selectedAnswer === data.answer;
  const timeTaken = Math.max(0, Math.min(Math.round(Number(params.timeTaken) || 0), 3600));

  // Anti-farming: a wrong answer reveals the right one, so re-submitting the same exercise right away
  // must not pay out again. Rewards only count for an exercise not answered in the last 10 minutes.
  const alreadyAnswered = await prisma.exerciseSession.findFirst({
    where: { userId, exerciseId: exercise.id, completedAt: { gt: new Date(Date.now() - 10 * 60 * 1000) } },
    select: { id: true },
  });
  // Opening the worked example or 50:50 halves the XP; a nudge is free (the client reports the stage;
  // claiming a higher stage can only lower the reward).
  const stage = params.hintStage !== undefined ? clampHintStage(params.hintStage) : params.hintUsed ? MAX_HINT_STAGE : 0;
  const baseXP = correct && !alreadyAnswered ? xpWithHint(exercise.xpReward, hintCostsXP(stage)) : 0;
  const baseStars = correct && !alreadyAnswered ? exercise.starReward : 0;

  await prisma.exerciseSession.create({
    data: { userId, exerciseId: exercise.id, correct, timeTaken, xpEarned: baseXP, starsEarned: baseStars },
  });

  // Recent history in this topic (newest first) drives combo, quest position and the adaptive level.
  const recentSessions = await prisma.exerciseSession.findMany({
    where: { userId, exercise: { topicId } },
    orderBy: { completedAt: "desc" },
    take: 10,
  });
  const topicCount = await prisma.exerciseSession.count({ where: { userId, exercise: { topicId } } });

  // Quest = every ROUND_SIZE answers in a topic. Position comes from the database, not from the client.
  const questStep = ((topicCount - 1) % ROUND_SIZE) + 1;
  const questDone = questStep === ROUND_SIZE;
  const lastRound = recentSessions.slice(0, ROUND_SIZE);
  const distinct = new Set(lastRound.map((s) => s.exerciseId)).size === ROUND_SIZE;
  const questCorrect = lastRound.filter((s) => s.correct).length;
  const bonusXP = questDone && distinct ? ROUND_BONUS_XP : 0;
  const bonusStars = questDone && distinct ? ROUND_BONUS_STARS : 0;

  const combo = comboFromResults(recentSessions.map((s) => s.correct));
  const xpEarned = baseXP + bonusXP;
  const starsEarned = baseStars + bonusStars;

  // Forgiving streak: one missed day is forgiven.
  const existing = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const streakDays = nextStreak(existing.streakDays, existing.lastActiveAt, new Date());

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      totalXP: { increment: xpEarned },
      totalStars: { increment: starsEarned },
      streakDays,
      lastActiveAt: new Date(),
    },
  });

  const before = companionStage(existing.totalXP);
  const after = companionStage(updatedUser.totalXP);
  const evolvedTo = after.index > before.index ? { name: after.name, emoji: after.emoji } : undefined;

  // Adaptive engine, evaluated after every answer. Most recent first -> reverse to chronological order.
  const recentResults = recentSessions.map((s) => s.correct).reverse();
  const progress = await prisma.progress.upsert({
    where: { userId_topicId: { userId, topicId } },
    update: {},
    create: { userId, topicId, level: 1 },
  });
  const adaptResult = adaptContinuous(progress.level, recentResults, progress.sinceChange + 1);

  await prisma.progress.update({
    where: { userId_topicId: { userId, topicId } },
    data: {
      level: adaptResult.newLevel,
      sinceChange: adaptResult.sinceChange,
      correctCount: { increment: correct ? 1 : 0 },
      totalCount: { increment: 1 },
      mastered: adaptResult.newLevel >= 9,
    },
  });

  // Practice time used today in this skill vs. the parent's goal (measured from server timestamps).
  const [goals, used] = await Promise.all([goalSecondsByTopic(userId, [topicId]), usedSecondsByTopic(userId)]);
  const goalSec = goals.get(topicId) ?? DEFAULT_PRACTICE_MINUTES * 60;
  const usedSec = used.get(topicId) ?? 0;

  // Badges
  const [mathCorrect, readingTotal, scienceTotal, existingBadges] = await Promise.all([
    prisma.exerciseSession.count({
      where: { userId, correct: true, exercise: { topic: { subject: "MATH" } } },
    }),
    prisma.exerciseSession.count({
      where: { userId, exercise: { topic: { subject: "READING" } } },
    }),
    prisma.exerciseSession.count({
      where: { userId, exercise: { topic: { subject: "SCIENCE" } } },
    }),
    prisma.userBadge.findMany({ where: { userId }, include: { badge: true } }),
  ]);

  const newConditions = checkBadgeConditions({
    totalXP: updatedUser.totalXP,
    streakDays: updatedUser.streakDays,
    mathCorrectTotal: mathCorrect,
    readingTotal,
    scienceTotal,
    studentLevel: Math.min(Math.floor(updatedUser.totalXP / 100) + 1, 10),
    existingConditions: existingBadges.map((ub) => ub.badge.condition),
  });

  const newBadges: string[] = [];
  for (const condition of newConditions) {
    const badge = await prisma.badge.findFirst({ where: { condition } });
    if (!badge) continue;
    await prisma.userBadge.create({ data: { userId, badgeId: badge.id } });
    await prisma.notification.create({
      data: {
        userId,
        type: "badge",
        title: "New badge unlocked!",
        message: `You earned the "${badge.name}" badge.`,
      },
    });
    newBadges.push(badge.name);
  }

  if (adaptResult.levelChange === "up") {
    await prisma.notification.create({
      data: {
        userId,
        type: "level_up",
        title: "Level up!",
        message: `You reached level ${adaptResult.newLevel} in this topic.`,
      },
    });
  }
  if (evolvedTo) {
    await prisma.notification.create({
      data: {
        userId,
        type: "level_up",
        title: "Your buddy grew!",
        message: `Your companion became a ${evolvedTo.name} ${evolvedTo.emoji}`,
      },
    });
  }

  return {
    correct,
    correctAnswer: data.answer,
    explanation: data.explanation,
    xpEarned,
    starsEarned,
    levelChange: adaptResult.levelChange,
    message: adaptResult.message,
    newBadges,
    cheer: cheer(correct, correct ? combo : 0, topicCount),
    combo: correct ? combo : 0,
    questStep,
    questDone,
    quest: questDone
      ? { correct: questCorrect, bonusXP, bonusStars, stars: roundStars(questCorrect) }
      : undefined,
    evolvedTo,
    streakDays,
    usedSec,
    goalSec,
    timeUp: usedSec >= goalSec,
  };
}
