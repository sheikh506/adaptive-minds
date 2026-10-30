import { cookies } from "next/headers";
import type { Exercise, Topic } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  DEFAULT_PRACTICE_MINUTES,
  ROUND_SIZE,
  activeSeconds,
  decideQuestionKind,
  pickAdaptive,
  recoveryLevel,
  startOfLocalDay,
} from "@/lib/game";
import { dueReviews } from "@/lib/spaced-repetition";
import type { DoneSummary, PlayState, PublicData, QuestionNote } from "@/lib/question-types";

/** A miss only counts as "just now" for this long, so yesterday's mistake never changes today's first question. */
const RECENT_MISS_MS = 10 * 60 * 1000;

/** The browser stores its UTC offset in a cookie (see TimezoneCookie) so "today" matches the child's day. */
export function tzOffsetFromCookie(): number {
  const raw = Number(cookies().get("am-tz")?.value);
  return Number.isFinite(raw) ? raw : 0;
}

export function todayStart(): Date {
  return startOfLocalDay(new Date(), tzOffsetFromCookie());
}

/** Daily goal in seconds per topic for a child (parent-set, default when the parent has not chosen). */
export async function goalSecondsByTopic(childId: string, topicIds: string[]): Promise<Map<string, number>> {
  const rows = await prisma.practiceGoal.findMany({ where: { childId, topicId: { in: topicIds } } });
  const byTopic = new Map(rows.map((r) => [r.topicId, r.minutes]));
  return new Map(topicIds.map((id) => [id, (byTopic.get(id) ?? DEFAULT_PRACTICE_MINUTES) * 60]));
}

/** Seconds practised today, per topic, measured from server-side answer timestamps. */
export async function usedSecondsByTopic(userId: string): Promise<Map<string, number>> {
  const sessions = await prisma.exerciseSession.findMany({
    where: { userId, completedAt: { gte: todayStart() } },
    select: { completedAt: true, timeTaken: true, exercise: { select: { topicId: true } } },
  });
  const grouped = new Map<string, { completedAt: Date; timeTaken: number }[]>();
  for (const s of sessions) {
    const list = grouped.get(s.exercise.topicId) ?? [];
    list.push(s);
    grouped.set(s.exercise.topicId, list);
  }
  return new Map([...grouped].map(([topicId, list]) => [topicId, activeSeconds(list)]));
}

/** Strip the answer and explanation: they never leave the server before the child answers. */
function toQuestion(exercise: Exercise, level: number, usedSec: number, goalSec: number, note?: QuestionNote): PlayState {
  const { answer: _answer, explanation: _explanation, ...publicData } = exercise.data as unknown as PublicData & {
    answer: string;
    explanation?: string;
  };
  return {
    status: "question",
    exercise: {
      id: exercise.id,
      topicId: exercise.topicId,
      title: exercise.title,
      instructions: exercise.instructions,
      difficulty: exercise.difficulty,
      level: exercise.level,
      data: publicData,
    },
    level,
    usedSec,
    goalSec,
    ...(note ? { note } : {}),
  };
}

async function candidatesAround(topicId: string, level: number): Promise<Exercise[]> {
  const near = await prisma.exercise.findMany({
    where: {
      topicId,
      active: true,
      level: { gte: Math.max(1, level - 1), lte: Math.min(10, level + 1) },
    },
  });
  return near.length > 0 ? near : prisma.exercise.findMany({ where: { topicId, active: true } });
}

async function recentExerciseIds(userId: string, topicId: string): Promise<string[]> {
  const recent = await prisma.exerciseSession.findMany({
    where: { userId, exercise: { topicId } },
    orderBy: { completedAt: "desc" },
    take: 30,
    select: { exerciseId: true },
  });
  return recent.map((r) => r.exerciseId);
}

/**
 * One memory-refresher question from a different skill that is due, or null.
 * Skills the parent has set to "rest" are skipped.
 */
async function pickReview(
  userId: string,
  excludeTopicId: string,
  goals: Map<string, number>
): Promise<{ exercise: Exercise; level: number; topicName: string } | null> {
  const rows = await prisma.progress.findMany({
    where: { userId, topicId: { not: excludeTopicId }, totalCount: { gt: 0 } },
    include: { topic: true },
  });
  const due = dueReviews(
    rows
      .filter((p) => (goals.get(p.topicId) ?? DEFAULT_PRACTICE_MINUTES * 60) > 0)
      .map((p) => ({
        topicId: p.topicId,
        topicName: p.topic.name,
        subject: p.topic.subject,
        level: p.level,
        correctCount: p.correctCount,
        totalCount: p.totalCount,
        updatedAt: p.updatedAt,
      }))
  );
  for (const d of due.slice(0, 3)) {
    const candidates = await candidatesAround(d.topicId, d.currentLevel);
    if (candidates.length === 0) continue;
    const recent = await recentExerciseIds(userId, d.topicId);
    return { exercise: pickAdaptive(candidates, recent, d.currentLevel), level: d.currentLevel, topicName: d.topicName };
  }
  return null;
}

/** The question for this world right now, or a "done" summary when today's time is used up. */
export async function loadPlayState(userId: string, topicId: string): Promise<PlayState> {
  const topics: Topic[] = await prisma.topic.findMany({ orderBy: [{ subject: "asc" }, { order: "asc" }] });
  const topic = topics.find((t) => t.id === topicId);
  if (!topic) return { status: "empty" };

  const [goals, used] = await Promise.all([
    goalSecondsByTopic(userId, topics.map((t) => t.id)),
    usedSecondsByTopic(userId),
  ]);
  const goalSec = goals.get(topicId) ?? DEFAULT_PRACTICE_MINUTES * 60;
  const usedSec = used.get(topicId) ?? 0;

  if (goalSec === 0 || usedSec >= goalSec) {
    const today = await prisma.exerciseSession.findMany({
      where: { userId, completedAt: { gte: todayStart() }, exercise: { topicId } },
      select: { correct: true, xpEarned: true, starsEarned: true },
    });
    const next = topics.find((t) => t.id !== topicId && (goals.get(t.id) ?? 0) > (used.get(t.id) ?? 0));
    const summary: DoneSummary = {
      status: "done",
      reason: goalSec === 0 ? "rest" : "time",
      usedSec,
      goalSec,
      answered: today.length,
      correct: today.filter((s) => s.correct).length,
      xp: today.reduce((s, x) => s + x.xpEarned, 0),
      stars: today.reduce((s, x) => s + x.starsEarned, 0),
      next: next ? { id: next.id, name: next.name } : null,
    };
    return summary;
  }

  const progress = await prisma.progress.upsert({
    where: { userId_topicId: { userId, topicId } },
    update: {},
    create: { userId, topicId, level: 1 },
  });

  const [lastSession, topicCount] = await Promise.all([
    prisma.exerciseSession.findFirst({
      where: { userId },
      orderBy: { completedAt: "desc" },
      select: { correct: true, completedAt: true, exercise: { select: { topicId: true } } },
    }),
    prisma.exerciseSession.count({ where: { userId, exercise: { topicId } } }),
  ]);

  const lastWasMiss = !!lastSession && !lastSession.correct && Date.now() - lastSession.completedAt.getTime() < RECENT_MISS_MS;
  const lastWasHere = lastSession?.exercise.topicId === topicId;
  const lastWasReview = !!lastSession && !lastWasHere;
  const position = (topicCount % ROUND_SIZE) + 1;

  // Only look for a refresher at the moment one could be used (it costs a few queries).
  const mayReview = !lastWasMiss && !lastWasReview && position === Math.ceil(ROUND_SIZE / 2);
  const review = mayReview ? await pickReview(userId, topicId, goals) : null;

  const kind = decideQuestionKind({
    lastWasMiss,
    lastWasHere,
    level: progress.level,
    position,
    hasDueReview: review !== null,
    lastWasReview,
  });

  if (kind === "review" && review) {
    return toQuestion(review.exercise, review.level, usedSec, goalSec, { kind: "review", topicName: review.topicName });
  }

  const recent = await recentExerciseIds(userId, topicId);

  if (kind === "recovery") {
    const easier = recoveryLevel(progress.level);
    const pool = await candidatesAround(topicId, easier);
    if (pool.length > 0) {
      return toQuestion(pickAdaptive(pool, recent, easier), progress.level, usedSec, goalSec, { kind: "recovery" });
    }
  }

  const candidates = await candidatesAround(topicId, progress.level);
  if (candidates.length === 0) return { status: "empty" };
  return toQuestion(pickAdaptive(candidates, recent, progress.level), progress.level, usedSec, goalSec);
}
