import { describe, expect, it } from "vitest";
import {
  calculateRetentionScore,
  calculateReviewInterval,
  dueReviews,
  evaluateTopicRetention,
  isTopicUnlocked,
  unlockMap,
} from "./spaced-repetition";

describe("Spaced Repetition & Retention Engine", () => {
  it("computes review intervals based on accuracy and level", () => {
    expect(calculateReviewInterval(1, 0.5)).toBe(1); // Low accuracy requires daily review
    expect(calculateReviewInterval(3, 0.75)).toBe(3); // Moderate accuracy
    expect(calculateReviewInterval(2, 0.9)).toBe(7); // Level <= 3
    expect(calculateReviewInterval(5, 0.9)).toBe(14); // Level 4-6
    expect(calculateReviewInterval(8, 0.9)).toBe(30); // Level 7+
  });

  it("calculates retention decay over time", () => {
    // 0 days should have 100% retention
    expect(calculateRetentionScore(0, 0.9, 5)).toBe(100);

    // 2 days should still have high retention
    const score2Days = calculateRetentionScore(2, 0.9, 5);
    expect(score2Days).toBeGreaterThan(80);

    // 30 days should show decay
    const score30Days = calculateRetentionScore(30, 0.9, 5);
    expect(score30Days).toBeLessThan(score2Days);
  });

  it("evaluates topic retention and flags review urgency correctly", () => {
    const now = new Date("2025-01-20T12:00:00Z");
    const freshDate = new Date("2025-01-19T12:00:00Z"); // 1 day ago
    const staleDate = new Date("2025-01-01T12:00:00Z"); // 19 days ago

    const fresh = evaluateTopicRetention({
      topicId: "topic-addition",
      topicName: "Addition",
      subject: "MATH",
      currentLevel: 3,
      correctCount: 9,
      totalCount: 10,
      lastPracticedAt: freshDate,
      now,
    });
    expect(fresh.needsReview).toBe(false);
    expect(fresh.urgency).toBe("fresh");

    const stale = evaluateTopicRetention({
      topicId: "topic-addition",
      topicName: "Addition",
      subject: "MATH",
      currentLevel: 2,
      correctCount: 6,
      totalCount: 10,
      lastPracticedAt: staleDate,
      now,
    });
    expect(stale.needsReview).toBe(true);
    expect(stale.urgency).toMatch(/due|urgent/);
  });

  it("checks prerequisite unlocks correctly", () => {
    const userLevels = new Map<string, number>([
      ["topic-addition", 3],
      ["topic-subtraction", 1],
    ]);

    // Subtraction requires Addition (lvl 2+). Addition is level 3 -> unlocked
    const subCheck = isTopicUnlocked("topic-subtraction", userLevels, 2);
    expect(subCheck.unlocked).toBe(true);

    // Multiplication requires Addition & Subtraction (lvl 2+). Subtraction is lvl 1 -> locked
    const multCheck = isTopicUnlocked("topic-multiplication", userLevels, 2);
    expect(multCheck.unlocked).toBe(false);
    expect(multCheck.missingPrerequisites).toContain("topic-subtraction");
  });

  it("a brand-new child has only the root worlds open", () => {
    const m = unlockMap(["topic-addition", "topic-subtraction", "topic-counting", "topic-life-science", "topic-spelling"], []);
    expect(m.get("topic-addition")?.unlocked).toBe(true);
    expect(m.get("topic-counting")?.unlocked).toBe(true);
    expect(m.get("topic-life-science")?.unlocked).toBe(true);
    expect(m.get("topic-subtraction")?.unlocked).toBe(false);
    expect(m.get("topic-spelling")?.unlocked).toBe(false);
  });

  it("reaching level 2 in the prerequisite opens the next world", () => {
    const m = unlockMap(["topic-subtraction"], [{ topicId: "topic-addition", level: 2, totalCount: 8 }]);
    expect(m.get("topic-subtraction")).toEqual({ unlocked: true, missingPrerequisites: [] });
  });

  it("a child who already practised a world is never locked out of it", () => {
    const m = unlockMap(["topic-division"], [{ topicId: "topic-division", level: 1, totalCount: 5 }]);
    expect(m.get("topic-division")?.unlocked).toBe(true);
  });

  it("lists the missing prerequisites by id", () => {
    const m = unlockMap(["topic-comprehension"], [{ topicId: "topic-phonics", level: 3, totalCount: 10 }]);
    expect(m.get("topic-comprehension")?.missingPrerequisites).toEqual(["topic-vocabulary"]);
  });

  it("dueReviews returns only stale skills, most urgent first", () => {
    const now = new Date("2025-03-01T12:00:00Z");
    const rows = [
      { topicId: "a", topicName: "A", subject: "MATH" as const, level: 3, correctCount: 9, totalCount: 10, updatedAt: new Date("2025-02-28T12:00:00Z") },
      { topicId: "b", topicName: "B", subject: "MATH" as const, level: 2, correctCount: 6, totalCount: 10, updatedAt: new Date("2025-01-01T12:00:00Z") },
    ];
    const due = dueReviews(rows, now);
    expect(due.map((d) => d.topicId)).toEqual(["b"]);
  });
});
