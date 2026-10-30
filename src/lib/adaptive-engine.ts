/**
 * Adaptive difficulty engine.
 *
 * After each exercise session, it decides whether to move the student
 * up, stay, or move down in level based on a sliding window of recent results.
 */

export interface AdaptiveResult {
  newLevel: number;
  levelChange: "up" | "down" | "same";
  message: string;
}

/**
 * Update difficulty level based on recent performance.
 *
 * @param currentLevel  Current level 1–10
 * @param recentResults Array of booleans (true = correct) for the last N attempts
 * @param windowSize    How many recent results to consider
 */
export function adaptLevel(
  currentLevel: number,
  recentResults: boolean[],
  windowSize = 5
): AdaptiveResult {
  const window = recentResults.slice(-windowSize);
  if (window.length < 3) {
    return { newLevel: currentLevel, levelChange: "same", message: "Keep going!" };
  }

  const accuracy = window.filter(Boolean).length / window.length;

  if (accuracy >= 0.8 && currentLevel < 10) {
    const newLevel = currentLevel + 1;
    return {
      newLevel,
      levelChange: "up",
      message: `Amazing! You leveled up to level ${newLevel}! 🎉`,
    };
  }

  if (accuracy <= 0.4 && currentLevel > 1) {
    const newLevel = currentLevel - 1;
    return {
      newLevel,
      levelChange: "down",
      message: `Let's try some easier questions to build confidence. 💪`,
    };
  }

  return {
    newLevel: currentLevel,
    levelChange: "same",
    message: accuracy >= 0.6 ? "Great job! Keep it up! ⭐" : "Keep practicing — you can do it! 🌟",
  };
}

/**
 * Continuous adjustment, evaluated after every answer.
 * Only answers since the last level change are considered, so one hot streak cannot
 * push the level up on every single question.
 *
 * @param recentResults  correct/incorrect, oldest first (at least the last 5)
 * @param sinceChange    answers since the level last changed, INCLUDING the one just given
 */
export function adaptContinuous(
  currentLevel: number,
  recentResults: boolean[],
  sinceChange: number
): AdaptiveResult & { sinceChange: number } {
  const n = Math.min(sinceChange, 5, recentResults.length);
  const window = recentResults.slice(-n);
  const stay = (message: string) => ({ newLevel: currentLevel, levelChange: "same" as const, message, sinceChange });

  if (n < 2) return stay("Keep going!");

  const lastTwoWrong = !window[n - 1] && !window[n - 2];
  const accuracy = window.filter(Boolean).length / n;

  if (n >= 3 && accuracy >= 0.8 && currentLevel < 10) {
    return { newLevel: currentLevel + 1, levelChange: "up", message: `Amazing! Level ${currentLevel + 1} unlocked! 🎉`, sinceChange: 0 };
  }
  if ((lastTwoWrong || (n >= 3 && accuracy <= 0.4)) && currentLevel > 1) {
    return {
      newLevel: currentLevel - 1,
      levelChange: "down",
      message: "Let's try some easier ones to build confidence. 💪",
      sinceChange: 0,
    };
  }
  return stay(accuracy >= 0.6 ? "Great job! Keep it up! ⭐" : "Keep practising, you can do it! 🌟");
}
/**
 * Select the next exercise level to present, given the student's current level
 * and their recent accuracy on the current topic.
 */
export function selectNextLevel(
  studentLevel: number,
  topicAccuracy: number
): number {
  // If doing well, occasionally challenge with next level
  if (topicAccuracy >= 0.8 && studentLevel < 10) {
    return Math.random() < 0.3 ? studentLevel + 1 : studentLevel;
  }
  // If struggling, drop one level
  if (topicAccuracy < 0.5 && studentLevel > 1) {
    return studentLevel - 1;
  }
  return studentLevel;
}

/**
 * Check whether the student should earn a badge after a session.
 */
export interface BadgeCheck {
  condition: string;
  earned: boolean;
}

export function checkBadgeConditions(params: {
  totalXP: number;
  streakDays: number;
  mathCorrectTotal: number;
  readingTotal: number;
  scienceTotal?: number;
  studentLevel: number;
  existingConditions: string[];
}): string[] {
  const { totalXP, streakDays, mathCorrectTotal, readingTotal, studentLevel, existingConditions } =
    params;
  const scienceTotal = params.scienceTotal ?? 0;
  const newBadges: string[] = [];

  const check = (condition: string, met: boolean) => {
    if (met && !existingConditions.includes(condition)) newBadges.push(condition);
  };

  check("first_exercise", mathCorrectTotal + readingTotal + scienceTotal >= 1);
  check("streak_3", streakDays >= 3);
  check("streak_7", streakDays >= 7);
  check("math_correct_100", mathCorrectTotal >= 100);
  check("reading_50", readingTotal >= 50);
  check("science_30", scienceTotal >= 30);
  check("xp_500", totalXP >= 500);
  check("level_5", studentLevel >= 5);

  return newBadges;
}
