/**
 * Diagnostic Placement Engine.
 * A 5-question adaptive assessment that quickly determines a student's optimal
 * starting level and topic calibration without lengthy testing.
 */

export interface DiagnosticQuestionRef {
  step: number; // 1 to 5
  targetLevel: number; // 1 to 10
}

export interface DiagnosticAnswerRecord {
  step: number;
  levelTested: number;
  correct: boolean;
  timeTakenSec: number;
}

export interface DiagnosticResult {
  recommendedLevel: number;
  accuracy: number;
  recommendedGrade: "K" | "G1" | "G2" | "G3" | "G4" | "G5" | "G6" | "G7" | "G8";
  summary: string;
}

/**
 * Determines the next level to test in a 5-step diagnostic quiz.
 *
 * Sequence:
 * Step 1: Level 3 (Baseline)
 * Step 2: Level 5 if Q1 correct, Level 1 if Q1 wrong
 * Step 3: +/- 2 levels based on Q2
 * Step 4: +/- 1 level based on Q3
 * Step 5: +/- 1 level based on Q4
 */
export function getNextDiagnosticLevel(history: DiagnosticAnswerRecord[]): number {
  if (history.length === 0) return 3; // Step 1 starts at level 3

  const last = history[history.length - 1];
  const step = history.length + 1;

  if (step > 5) {
    return last.levelTested;
  }

  let delta = 1;
  if (step === 2) delta = 2;
  else if (step === 3) delta = 2;
  else delta = 1;

  let nextLvl = last.correct ? last.levelTested + delta : last.levelTested - delta;
  return Math.max(1, Math.min(10, nextLvl));
}

/**
 * Calculates the final placement result after completing the 5-step diagnostic.
 */
export function computeDiagnosticResult(history: DiagnosticAnswerRecord[]): DiagnosticResult {
  if (history.length === 0) {
    return {
      recommendedLevel: 1,
      accuracy: 0,
      recommendedGrade: "K",
      summary: "Start at Level 1 to build confidence and fundamentals.",
    };
  }

  const correctAnswers = history.filter((h) => h.correct);
  const accuracy = correctAnswers.length / history.length;

  // Weight recent/higher level performances
  let scoreSum = 0;
  let weightSum = 0;

  history.forEach((h, idx) => {
    const weight = 1 + idx * 0.5; // Later questions carry more weight
    const score = h.correct ? h.levelTested : Math.max(1, h.levelTested - 1);
    scoreSum += score * weight;
    weightSum += weight;
  });

  let recommendedLevel = Math.round(scoreSum / weightSum);
  recommendedLevel = Math.max(1, Math.min(10, recommendedLevel));

  let recommendedGrade: DiagnosticResult["recommendedGrade"] = "K";
  if (recommendedLevel === 1) recommendedGrade = "K";
  else if (recommendedLevel === 2) recommendedGrade = "G1";
  else if (recommendedLevel === 3) recommendedGrade = "G2";
  else if (recommendedLevel === 4) recommendedGrade = "G3";
  else if (recommendedLevel === 5) recommendedGrade = "G4";
  else if (recommendedLevel === 6) recommendedGrade = "G5";
  else if (recommendedLevel === 7) recommendedGrade = "G6";
  else if (recommendedLevel === 8) recommendedGrade = "G7";
  else recommendedGrade = "G8";

  let summary = `Great job! We've placed you at Level ${recommendedLevel} (${recommendedGrade}) based on your strengths.`;
  if (recommendedLevel <= 2) {
    summary = `Welcome! Starting at Level ${recommendedLevel} is perfect for mastering the core fundamentals.`;
  } else if (recommendedLevel >= 8) {
    summary = `Incredible work! You demonstrated advanced mastery and placed into Level ${recommendedLevel}.`;
  }

  return {
    recommendedLevel,
    accuracy: Math.round(accuracy * 100) / 100,
    recommendedGrade,
    summary,
  };
}
