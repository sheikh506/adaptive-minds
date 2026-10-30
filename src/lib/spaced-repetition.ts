/**
 * Spaced Repetition & Retention Engine based on memory decay principles.
 * Helps prevent the forgetting curve by scheduling timely refreshers for learned skills.
 */

import type { SubjectKey } from "./question-types";

export interface TopicRetention {
  topicId: string;
  topicName: string;
  subject: SubjectKey;
  currentLevel: number;
  lastPracticedAt: Date | null;
  daysSinceLastPractice: number;
  accuracy: number; // 0 to 1
  retentionScore: number; // 0 to 100
  needsReview: boolean;
  recommendedReviewIntervalDays: number;
  urgency: "urgent" | "due" | "fresh" | "new";
}

/**
 * Calculates optimal spaced repetition intervals based on student level and accuracy.
 * Intervals: 1 day -> 3 days -> 7 days -> 14 days -> 30 days.
 */
export function calculateReviewInterval(level: number, accuracy: number): number {
  if (accuracy < 0.6) return 1;
  if (accuracy < 0.8) return 3;
  if (level <= 3) return 7;
  if (level <= 6) return 14;
  return 30;
}

/**
 * Calculates retention score (0 - 100) using exponential decay:
 * R = 100 * exp(-days / stability)
 * where stability = baseStability * accuracyFactor
 */
export function calculateRetentionScore(
  daysSincePractice: number,
  accuracy: number,
  level: number
): number {
  if (daysSincePractice <= 0) return 100;
  
  // Base stability in days depends on mastery level
  const baseStability = 3 + level * 2.5;
  const accuracyFactor = Math.max(0.4, Math.min(1.2, accuracy));
  const stability = baseStability * accuracyFactor;
  
  const score = Math.round(100 * Math.exp(-daysSincePractice / stability));
  return Math.max(0, Math.min(100, score));
}

/**
 * Analyzes topic progress to produce spaced repetition recommendations.
 */
export function evaluateTopicRetention(params: {
  topicId: string;
  topicName: string;
  subject: SubjectKey;
  currentLevel: number;
  correctCount: number;
  totalCount: number;
  lastPracticedAt: Date | null;
  now?: Date;
}): TopicRetention {
  const { topicId, topicName, subject, currentLevel, correctCount, totalCount, lastPracticedAt } = params;
  const now = params.now ?? new Date();

  if (!lastPracticedAt || totalCount === 0) {
    return {
      topicId,
      topicName,
      subject,
      currentLevel,
      lastPracticedAt: null,
      daysSinceLastPractice: 999,
      accuracy: 0,
      retentionScore: 0,
      needsReview: false,
      recommendedReviewIntervalDays: 1,
      urgency: "new",
    };
  }

  const diffMs = Math.max(0, now.getTime() - new Date(lastPracticedAt).getTime());
  const daysSinceLastPractice = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const accuracy = totalCount > 0 ? correctCount / totalCount : 0;
  const interval = calculateReviewInterval(currentLevel, accuracy);
  const retentionScore = calculateRetentionScore(daysSinceLastPractice, accuracy, currentLevel);

  let urgency: TopicRetention["urgency"] = "fresh";
  if (daysSinceLastPractice >= interval * 1.5 || retentionScore < 60) {
    urgency = "urgent";
  } else if (daysSinceLastPractice >= interval || retentionScore < 75) {
    urgency = "due";
  }

  const needsReview = urgency === "urgent" || urgency === "due";

  return {
    topicId,
    topicName,
    subject,
    currentLevel,
    lastPracticedAt,
    daysSinceLastPractice,
    accuracy: Math.round(accuracy * 100) / 100,
    retentionScore,
    needsReview,
    recommendedReviewIntervalDays: interval,
    urgency,
  };
}

/**
 * Skill prerequisite graph and curriculum progression pathways.
 */
export interface TopicPrerequisite {
  topicId: string;
  requiredTopicIds: string[];
  recommendedMinLevel: number;
}

export const TOPIC_PREREQUISITES: Record<string, string[]> = {
  // Math sequence
  "topic-subtraction": ["topic-addition"],
  "topic-multiplication": ["topic-addition", "topic-subtraction"],
  "topic-division": ["topic-multiplication"],
  "topic-fractions": ["topic-division"],
  "topic-time": ["topic-addition"],
  "topic-money": ["topic-addition"],
  "topic-data": ["topic-addition"],
  // Counting, geometry and measurement are open from day one.

  // Reading sequence
  "topic-vocabulary": ["topic-phonics"],
  "topic-comprehension": ["topic-phonics", "topic-vocabulary"],
  "topic-spelling": ["topic-phonics"],
  "topic-grammar": ["topic-vocabulary"],
  // Letters and all science worlds are open from day one.
};

/** A skill is "unlocked" once the child reaches this level in every skill it builds on. */
export const UNLOCK_LEVEL = 2;

/**
 * Checks whether a topic is unlocked for a student based on prerequisite progress.
 * A child who has already answered questions in the topic is never locked out of it.
 */
export function isTopicUnlocked(
  topicId: string,
  userTopicLevels: Map<string, number>,
  requiredLevel = UNLOCK_LEVEL,
  alreadyStarted = false
): { unlocked: boolean; missingPrerequisites: string[] } {
  if (alreadyStarted) return { unlocked: true, missingPrerequisites: [] };
  const reqs = TOPIC_PREREQUISITES[topicId] ?? [];
  const missing: string[] = [];

  for (const req of reqs) {
    const lvl = userTopicLevels.get(req) ?? 1;
    if (lvl < requiredLevel) {
      missing.push(req);
    }
  }

  return {
    unlocked: missing.length === 0,
    missingPrerequisites: missing,
  };
}

export interface ProgressLike {
  topicId: string;
  level: number;
  totalCount: number;
}

/** Unlock state for every topic, given a child's progress rows. */
export function unlockMap(
  topicIds: string[],
  progress: ProgressLike[]
): Map<string, { unlocked: boolean; missingPrerequisites: string[] }> {
  const levels = new Map(progress.map((p) => [p.topicId, p.level]));
  const started = new Set(progress.filter((p) => p.totalCount > 0).map((p) => p.topicId));
  return new Map(topicIds.map((id) => [id, isTopicUnlocked(id, levels, UNLOCK_LEVEL, started.has(id))]));
}

/** Topics that are due for a refresher and which the child can reach, most urgent first. */
export function dueReviews(
  rows: { topicId: string; topicName: string; subject: SubjectKey; level: number; correctCount: number; totalCount: number; updatedAt: Date }[],
  now: Date = new Date()
): TopicRetention[] {
  return rows
    .map((p) =>
      evaluateTopicRetention({
        topicId: p.topicId,
        topicName: p.topicName,
        subject: p.subject,
        currentLevel: p.level,
        correctCount: p.correctCount,
        totalCount: p.totalCount,
        lastPracticedAt: p.updatedAt,
        now,
      })
    )
    .filter((r) => r.needsReview)
    .sort((a, b) => (a.urgency === b.urgency ? a.retentionScore - b.retentionScore : a.urgency === "urgent" ? -1 : 1));
}
