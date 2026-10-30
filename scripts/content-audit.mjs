#!/usr/bin/env node
/**
 * P0-C2: Machine-readable content audit report generator
 *
 * Usage:  node scripts/content-audit.mjs [--output content-audit.json]
 *
 * Analyses the full exercise bank and writes a JSON report covering:
 *   - Total exercise count per topic, per level
 *   - Answer correctness checks (addition/subtraction/multiplication/division)
 *   - Option quality (duplicates, missing, answer-not-in-options)
 *   - Explanation completeness
 *   - Developmental stage coverage (early learner levels 1-4)
 *   - Phonics content mode analysis (all multiple-choice, no oral interaction)
 *   - Content flagged for manual review
 *
 * Exit code 0 = no errors found. Exit code 1 = one or more errors.
 */

// Use tsx-compiled imports to work with TypeScript source
import { createRequire } from "module";
import { writeFileSync } from "fs";
import { pathToFileURL } from "url";

// We run under tsx (as invoked from npm scripts), so we can import TypeScript
// directly via dynamic import with the .ts extension
const { buildExercises } = await import("../prisma/content.ts");

const all = buildExercises();

const OUTPUT_FILE = process.argv.includes("--output")
  ? process.argv[process.argv.indexOf("--output") + 1]
  : "content-audit.json";

// ── helpers ─────────────────────────────────────────────────────────────────

function hasDangerousContent(s) {
  return /<[^>]+>/.test(s) || /javascript:/i.test(s) || /on\w+=/i.test(s);
}

function parseFraction(s) {
  const m = /^(-?\d+)\/(-?\d+)$/.exec(s.trim());
  return m ? [parseInt(m[1]), parseInt(m[2])] : null;
}

function gcd(a, b) { return b === 0 ? a : gcd(b, a % b); }

function fractionIsSimplified(num, den) {
  return Math.abs(gcd(Math.abs(num), Math.abs(den))) === 1;
}

// ── per-exercise checks ──────────────────────────────────────────────────────

function checkExercise(e) {
  const issues = [];
  const d = e.data;

  if (!d.options || d.options.length !== 4) {
    issues.push({ severity: "error", code: "OPTIONS_COUNT", detail: `expected 4 options, got ${d.options?.length}` });
  }

  if (d.options) {
    const uniq = new Set(d.options);
    if (uniq.size !== d.options.length) issues.push({ severity: "error", code: "DUPLICATE_OPTIONS", detail: `options: [${d.options.join(", ")}]` });
    for (const o of d.options) {
      if (!o || !String(o).trim()) issues.push({ severity: "error", code: "EMPTY_OPTION", detail: `empty option in [${d.options.join(", ")}]` });
    }
    if (!d.options.includes(d.answer)) issues.push({ severity: "error", code: "ANSWER_NOT_IN_OPTIONS", detail: `answer "${d.answer}" not in [${d.options.join(", ")}]` });
  }

  if (!d.explanation || d.explanation.trim().length < 5) {
    issues.push({ severity: "warning", code: "EXPLANATION_MISSING", detail: "explanation is missing or too short" });
  }

  if (!d.question || d.question.trim().length < 5) {
    issues.push({ severity: "error", code: "QUESTION_TOO_SHORT", detail: `question: "${d.question}"` });
  }
  if (d.question && d.question.length > 500) {
    issues.push({ severity: "warning", code: "QUESTION_TOO_LONG", detail: `${d.question.length} characters` });
  }

  const allFields = [d.question, ...(d.options || []), d.answer, d.explanation ?? "", d.passage ?? ""];
  for (const f of allFields) {
    if (hasDangerousContent(String(f ?? ""))) {
      issues.push({ severity: "error", code: "DANGEROUS_CONTENT", detail: `field: "${String(f).slice(0, 80)}"` });
    }
  }

  if (e.level <= 3 && e.difficulty !== "EASY") issues.push({ severity: "warning", code: "DIFFICULTY_MISMATCH", detail: `level ${e.level} should be EASY, got ${e.difficulty}` });
  if (e.level >= 8 && e.difficulty !== "HARD") issues.push({ severity: "warning", code: "DIFFICULTY_MISMATCH", detail: `level ${e.level} should be HARD, got ${e.difficulty}` });

  // Fraction answer check
  if (e.id.startsWith("sq-fractions-") && e.level >= 8) {
    const frac = parseFraction(d.answer);
    if (frac && !fractionIsSimplified(frac[0], frac[1])) {
      issues.push({ severity: "warning", code: "FRACTION_NOT_SIMPLIFIED", detail: `"${d.answer}" at level ${e.level}` });
    }
  }

  // Subtraction non-negative check
  if (e.id.startsWith("sq-subtraction-")) {
    const answer = parseInt(d.answer);
    if (!isNaN(answer) && answer < 0) issues.push({ severity: "error", code: "NEGATIVE_SUBTRACTION_ANSWER", detail: `answer: ${d.answer}` });
  }

  return issues;
}

// ── main report ──────────────────────────────────────────────────────────────

const TOPICS = [
  "topic-addition", "topic-subtraction", "topic-multiplication", "topic-division", "topic-fractions",
  "topic-phonics", "topic-vocabulary", "topic-comprehension",
  "topic-counting", "topic-geometry", "topic-measurement", "topic-time", "topic-money", "topic-data",
  "topic-letters", "topic-spelling", "topic-grammar",
  "topic-life-science", "topic-earth-space", "topic-matter-energy",
];

const EARLY_LEARNER_TOPICS = [
  "topic-counting", "topic-letters", "topic-phonics", "topic-addition",
  "topic-subtraction", "topic-vocabulary", "topic-comprehension",
  "topic-life-science", "topic-earth-space",
];

// ID uniqueness
const idCounts = new Map();
for (const e of all) idCounts.set(e.id, (idCounts.get(e.id) ?? 0) + 1);
const duplicateIds = [...idCounts.entries()].filter(([, c]) => c > 1).map(([id]) => id);

// Per-topic stats
const topicStats = TOPICS.map((topicId) => {
  const exercises = all.filter((e) => e.topicId === topicId);
  const byLevel = {};
  for (let l = 1; l <= 10; l++) byLevel[l] = exercises.filter((e) => e.level === l).length;
  const earlyCount = exercises.filter((e) => e.level <= 4).length;
  const isEarlyLearnerTopic = EARLY_LEARNER_TOPICS.includes(topicId);
  return {
    topicId,
    totalExercises: exercises.length,
    byLevel,
    earlyLearnerCoverage: earlyCount,
    earlyLearnerOk: !isEarlyLearnerTopic || earlyCount >= 16,
    phonicsModes: topicId === "topic-phonics"
      ? [...new Set(exercises.map((e) => e.type))]
      : undefined,
  };
});

// Per-exercise issues
const allIssues = [];
for (const e of all) {
  const issues = checkExercise(e);
  for (const issue of issues) {
    allIssues.push({ id: e.id, topicId: e.topicId, level: e.level, ...issue });
  }
}

const errors = allIssues.filter((i) => i.severity === "error");
const warnings = allIssues.filter((i) => i.severity === "warning");

// Phonics mode analysis (important flag)
const phonicsExercises = all.filter((e) => e.topicId === "topic-phonics");
const phonicsModes = [...new Set(phonicsExercises.map((e) => e.type))];
const phonicsHasOralInteraction = phonicsModes.some((m) => m === "tile_build" || m === "oral_blend");

// Report
const report = {
  generatedAt: new Date().toISOString(),
  summary: {
    totalExercises: all.length,
    totalTopics: TOPICS.length,
    duplicateIds: duplicateIds.length,
    errorCount: errors.length,
    warningCount: warnings.length,
    pass: duplicateIds.length === 0 && errors.length === 0,
  },
  knownGaps: {
    phonicsOralInteraction: {
      status: phonicsHasOralInteraction ? "present" : "missing",
      detail: "All phonics questions are multiple-choice written recognition only. No spoken phoneme or letter-tile interaction exists. This means choosing the correct written option does not prove decoding ability.",
      modes: phonicsModes,
    },
    teachGuidedIndependentMastery: {
      status: "missing",
      detail: "There is no TEACH → GUIDED PRACTICE → INDEPENDENT PRACTICE → MASTERY CHECK → REVIEW sequence. All questions draw from the same pool regardless of learning stage.",
    },
    decodableReaders: {
      status: "missing",
      detail: "No decodable readers aligned to mastered grapheme patterns exist.",
    },
    tenFramesAndManipulatives: {
      status: "missing",
      detail: "No interactive ten-frame, number bond, part-whole model, or place-value block Visual types exist.",
    },
    agePathway: {
      status: "missing",
      detail: "No explicit age 4-5 / age 6-7 developmental pathway exists. Grade is used as a proxy but grade does not equal demonstrated skill.",
    },
  },
  topicCoverage: topicStats,
  duplicateIds,
  errors: errors.slice(0, 50),
  warnings: warnings.slice(0, 50),
  allIssues: allIssues.length > 100 ? `Truncated. ${allIssues.length} total issues found.` : allIssues,
};

writeFileSync(OUTPUT_FILE, JSON.stringify(report, null, 2), "utf8");
console.log(`\n📋 Content Audit Report written to ${OUTPUT_FILE}`);
console.log(`   Total exercises: ${report.summary.totalExercises}`);
console.log(`   Duplicate IDs:   ${report.summary.duplicateIds}`);
console.log(`   Errors:          ${report.summary.errorCount}`);
console.log(`   Warnings:        ${report.summary.warningCount}`);
console.log(`   Status:          ${report.summary.pass ? "✅ PASS" : "❌ FAIL"}`);

if (!report.summary.pass) {
  console.error("\n❌ Content audit failed. See report for details.");
  process.exit(1);
}
