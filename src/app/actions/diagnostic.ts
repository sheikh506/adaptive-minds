"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  computeDiagnosticResult,
  getNextDiagnosticLevel,
  type DiagnosticAnswerRecord,
  type DiagnosticResult,
} from "@/lib/diagnostic";
import type { PublicData, PublicExercise } from "@/lib/question-types";

async function requireStudentId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");
  return session.user.id;
}

export async function fetchDiagnosticQuestion(
  subject: "MATH" | "READING",
  history: DiagnosticAnswerRecord[]
): Promise<{ exercise: PublicExercise; step: number; targetLevel: number } | null> {
  await requireStudentId();

  const step = history.length + 1;
  if (step > 5) return null;

  const targetLevel = getNextDiagnosticLevel(history);

  // Find active exercises for this subject around targetLevel
  const exercises = await prisma.exercise.findMany({
    where: {
      active: true,
      topic: { subject },
      level: targetLevel,
    },
    take: 10,
  });

  const pool = exercises.length > 0
    ? exercises
    : await prisma.exercise.findMany({
        where: { active: true, topic: { subject } },
        take: 10,
      });

  if (pool.length === 0) return null;

  const chosen = pool[Math.floor(Math.random() * pool.length)];
  const { answer: _ans, explanation: _exp, ...publicData } = chosen.data as unknown as PublicData & {
    answer: string;
    explanation?: string;
  };

  return {
    exercise: {
      id: chosen.id,
      topicId: chosen.topicId,
      title: chosen.title,
      instructions: chosen.instructions,
      difficulty: chosen.difficulty,
      level: chosen.level,
      data: publicData,
    },
    step,
    targetLevel,
  };
}

export async function checkDiagnosticAnswer(
  exerciseId: string,
  selectedAnswer: string
): Promise<{ correct: boolean; correctAnswer: string; explanation?: string }> {
  await requireStudentId();

  const exercise = await prisma.exercise.findUnique({ where: { id: exerciseId } });
  if (!exercise) throw new Error("Exercise not found");

  const data = exercise.data as { answer: string; explanation?: string };
  const correct = String(selectedAnswer).trim().toLowerCase() === String(data.answer).trim().toLowerCase();

  return {
    correct,
    correctAnswer: data.answer,
    explanation: data.explanation,
  };
}

export async function completeDiagnosticPlacement(
  subject: "MATH" | "READING",
  history: DiagnosticAnswerRecord[]
): Promise<DiagnosticResult & { bonusXP: number; bonusStars: number }> {
  const userId = await requireStudentId();
  const result = computeDiagnosticResult(history);

  // Bonus for completing diagnostic
  const bonusXP = 50;
  const bonusStars = 5;

  // Update user's level, grade, and rewards
  await prisma.user.update({
    where: { id: userId },
    data: {
      studentLevel: result.recommendedLevel,
      grade: result.recommendedGrade,
      placementDone: true,
      totalXP: { increment: bonusXP },
      totalStars: { increment: bonusStars },
    },
  });

  // Calibrate progress levels for all topics under this subject
  const topics = await prisma.topic.findMany({ where: { subject } });
  for (const topic of topics) {
    await prisma.progress.upsert({
      where: { userId_topicId: { userId, topicId: topic.id } },
      update: {
        level: result.recommendedLevel,
        sinceChange: 0,
      },
      create: {
        userId,
        topicId: topic.id,
        level: result.recommendedLevel,
        sinceChange: 0,
      },
    });
  }

  // Create placement completion notification
  await prisma.notification.create({
    data: {
      userId,
      title: `${subject === "MATH" ? "Math" : "Reading"} Placement Completed!`,
      message: `You've been calibrated to Level ${result.recommendedLevel} (${result.recommendedGrade}). +${bonusXP} XP earned!`,
      type: "level_up",
    },
  });

  return {
    ...result,
    bonusXP,
    bonusStars,
  };
}
