import { describe, expect, it } from "vitest";
import {
  computeDiagnosticResult,
  getNextDiagnosticLevel,
  type DiagnosticAnswerRecord,
} from "./diagnostic";

describe("Diagnostic Placement Engine", () => {
  it("starts at baseline Level 3 on first question", () => {
    expect(getNextDiagnosticLevel([])).toBe(3);
  });

  it("scales up when answer is correct", () => {
    const history: DiagnosticAnswerRecord[] = [
      { step: 1, levelTested: 3, correct: true, timeTakenSec: 10 },
    ];
    // From level 3, jump +2 to level 5
    expect(getNextDiagnosticLevel(history)).toBe(5);
  });

  it("scales down when answer is incorrect", () => {
    const history: DiagnosticAnswerRecord[] = [
      { step: 1, levelTested: 3, correct: false, timeTakenSec: 12 },
    ];
    // From level 3, drop -2 to level 1
    expect(getNextDiagnosticLevel(history)).toBe(1);
  });

  it("clamps level between 1 and 10", () => {
    const history: DiagnosticAnswerRecord[] = [
      { step: 1, levelTested: 3, correct: true, timeTakenSec: 10 },
      { step: 2, levelTested: 5, correct: true, timeTakenSec: 10 },
      { step: 3, levelTested: 7, correct: true, timeTakenSec: 10 },
      { step: 4, levelTested: 9, correct: true, timeTakenSec: 10 },
      { step: 5, levelTested: 10, correct: true, timeTakenSec: 10 },
    ];
    expect(getNextDiagnosticLevel(history)).toBe(10);
  });

  it("computes diagnostic placement result correctly for strong student", () => {
    const history: DiagnosticAnswerRecord[] = [
      { step: 1, levelTested: 3, correct: true, timeTakenSec: 8 },
      { step: 2, levelTested: 5, correct: true, timeTakenSec: 7 },
      { step: 3, levelTested: 7, correct: true, timeTakenSec: 12 },
      { step: 4, levelTested: 8, correct: true, timeTakenSec: 15 },
      { step: 5, levelTested: 9, correct: true, timeTakenSec: 14 },
    ];
    const result = computeDiagnosticResult(history);
    expect(result.recommendedLevel).toBeGreaterThanOrEqual(7);
    expect(result.accuracy).toBe(1);
    expect(result.recommendedGrade).toBeDefined();
  });

  it("computes diagnostic placement result correctly for beginner student", () => {
    const history: DiagnosticAnswerRecord[] = [
      { step: 1, levelTested: 3, correct: false, timeTakenSec: 20 },
      { step: 2, levelTested: 1, correct: true, timeTakenSec: 15 },
      { step: 3, levelTested: 2, correct: false, timeTakenSec: 18 },
      { step: 4, levelTested: 1, correct: true, timeTakenSec: 12 },
      { step: 5, levelTested: 1, correct: true, timeTakenSec: 10 },
    ];
    const result = computeDiagnosticResult(history);
    expect(result.recommendedLevel).toBeLessThanOrEqual(2);
    expect(result.recommendedGrade).toMatch(/K|G1/);
  });
});
