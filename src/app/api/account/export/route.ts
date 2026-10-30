/**
 * GET /api/account/export
 *
 * Returns a JSON download of all personal data held for the authenticated user.
 * Covers the GDPR "right of access" (Article 15) and COPPA parental-access obligation.
 *
 * What is included:
 *  • Profile (name, email, role, grade, createdAt)
 *  • Exercise session history (topic, correct, timeTaken, completedAt)
 *  • Progress per topic (level, correctCount, totalCount, mastered)
 *  • Badges earned
 *  • Notifications
 *  • Practice goals set by a parent
 *
 * What is excluded:
 *  • The hashed password (never included in exports)
 *  • Sessions / auth tokens (transient, not personal data of record)
 *  • Other users' data
 */

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const userId = session.user.id;

  const [user, sessions, progress, badges, notifications, practiceGoals] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        grade: true,
        createdAt: true,
        totalStars: true,
        totalXP: true,
        streakDays: true,
        lastActiveAt: true,
        placementDone: true,
        consentGiven: true,
        consentAt: true,
        // Deliberately omit: password, consentAgent, image (only emoji)
      },
    }),
    prisma.exerciseSession.findMany({
      where: { userId },
      select: {
        completedAt: true,
        correct: true,
        xpEarned: true,
        starsEarned: true,
        exercise: {
          select: {
            title: true,
            type: true,
            level: true,
            topic: { select: { name: true, subject: true } },
          },
        },
      },
      orderBy: { completedAt: "asc" },
    }),
    prisma.progress.findMany({
      where: { userId },
      select: {
        correctCount: true,
        totalCount: true,
        level: true,
        mastered: true,
        updatedAt: true,
        topic: { select: { name: true, subject: true } },
      },
    }),
    prisma.userBadge.findMany({
      where: { userId },
      select: {
        earnedAt: true,
        badge: { select: { name: true, description: true, icon: true } },
      },
    }),
    prisma.notification.findMany({
      where: { userId },
      select: { title: true, message: true, type: true, read: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.practiceGoal.findMany({
      where: { childId: userId },
      select: {
        minutes: true,
        updatedAt: true,
        topic: { select: { name: true } },
      },
    }),
  ]);

  const export_ = {
    exportedAt: new Date().toISOString(),
    notice:
      "This file contains all personal data that AdaptiveMinds holds for this account. " +
      "Your hashed password is never included. " +
      "To request deletion, use the account deletion endpoint or contact support.",
    profile: user,
    exerciseHistory: sessions.map((s) => ({
      completedAt: s.completedAt,
      correct: s.correct,
      xpEarned: s.xpEarned,
      starsEarned: s.starsEarned,
      exercise: {
        title: s.exercise.title,
        type: s.exercise.type,
        level: s.exercise.level,
        topic: s.exercise.topic.name,
        subject: s.exercise.topic.subject,
      },
    })),
    topicProgress: progress.map((p) => ({
      topic: p.topic.name,
      subject: p.topic.subject,
      level: p.level,
      correctCount: p.correctCount,
      totalCount: p.totalCount,
      mastered: p.mastered,
      lastUpdated: p.updatedAt,
    })),
    badges: badges.map((b) => ({
      name: b.badge.name,
      description: b.badge.description,
      icon: b.badge.icon,
      earnedAt: b.earnedAt,
    })),
    notifications,
    practiceGoals: practiceGoals.map((g) => ({
      topic: g.topic.name,
      dailyMinutes: g.minutes,
      lastUpdated: g.updatedAt,
    })),
  };

  return new NextResponse(JSON.stringify(export_, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="adaptiveminds-export-${userId}.json"`,
    },
  });
}
