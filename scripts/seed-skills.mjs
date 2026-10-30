#!/usr/bin/env node
/**
 * scripts/seed-skills.mjs
 *
 * Seeds (upserts) the LearningSkill and SkillPrerequisite rows into the database.
 * Safe to run multiple times — uses upsert so existing records are updated, not duplicated.
 * Also seeds ContentCurriculumVersion v1.0.0 if it does not exist.
 *
 * Usage:
 *   node scripts/seed-skills.mjs
 *   npm run seed:skills
 *
 * Requires DATABASE_URL to be set in the environment (or .env.local).
 */

import { PrismaClient } from "@prisma/client";
import { createRequire } from "module";
import { fileURLToPath } from "url";
import path from "path";
import { readFileSync } from "fs";

// Load .env.local for local dev
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, "..", ".env.local");
try {
  const envText = readFileSync(envPath, "utf8");
  for (const line of envText.split("\n")) {
    const [key, ...rest] = line.split("=");
    if (key && !key.startsWith("#") && !process.env[key.trim()]) {
      process.env[key.trim()] = rest.join("=").trim();
    }
  }
} catch {
  // .env.local not present in CI — DATABASE_URL must come from the environment
}

const prisma = new PrismaClient();

// ─── Skill definitions ───────────────────────────────────────────────────────
// These mirror src/lib/skill-curriculum.ts exactly.
// When the curriculum is updated, update BOTH files and bump the version below.

const CURRICULUM_VERSION = "1.0.0";
const CURRICULUM_DESCRIPTION =
  "Initial K–G2 curriculum: phonics, vocabulary, foundational mathematics, early science.";

const SKILLS = [
  // ── PHONICS & EARLY READING ──────────────────────────────────────────────
  { id: "ph-letter-names", subject: "READING", name: "Letter Names",
    objective: "Name all 26 uppercase and lowercase letters of the alphabet in any order.",
    stageMin: 0, stageMax: 1, order: 1, prerequisites: [] },
  { id: "ph-letter-sounds-consonants", subject: "READING", name: "Consonant Sounds",
    objective: "Produce the most common sound for each consonant letter.",
    stageMin: 0, stageMax: 1, order: 2, prerequisites: ["ph-letter-names"] },
  { id: "ph-letter-sounds-vowels-short", subject: "READING", name: "Short Vowel Sounds",
    objective: "Produce the short vowel sound for a, e, i, o, u.",
    stageMin: 0, stageMax: 1, order: 3, prerequisites: ["ph-letter-names"] },
  { id: "ph-cvc-blending", subject: "READING", name: "CVC Blending",
    objective: "Blend three phonemes (consonant-vowel-consonant) to decode simple words.",
    stageMin: 1, stageMax: 2, order: 4, prerequisites: ["ph-letter-sounds-consonants", "ph-letter-sounds-vowels-short"] },
  { id: "ph-cvc-segmenting", subject: "READING", name: "CVC Segmenting",
    objective: "Segment spoken CVC words into their individual phonemes.",
    stageMin: 1, stageMax: 2, order: 5, prerequisites: ["ph-letter-sounds-consonants", "ph-letter-sounds-vowels-short"] },
  { id: "ph-initial-blends", subject: "READING", name: "Initial Consonant Blends",
    objective: "Read and produce words with initial consonant blends.",
    stageMin: 1, stageMax: 2, order: 6, prerequisites: ["ph-cvc-blending"] },
  { id: "ph-digraphs", subject: "READING", name: "Common Digraphs",
    objective: "Read and produce words with digraphs ch, sh, th, wh, and ph.",
    stageMin: 1, stageMax: 2, order: 7, prerequisites: ["ph-cvc-blending"] },
  { id: "ph-long-vowels-silent-e", subject: "READING", name: "Long Vowels (Silent E)",
    objective: "Decode words with the VCe (silent e) pattern.",
    stageMin: 1, stageMax: 2, order: 8, prerequisites: ["ph-cvc-blending"] },
  { id: "ph-vowel-teams", subject: "READING", name: "Vowel Teams",
    objective: "Read words with common vowel pairs including ai, ay, ee, ea, oa, ow, oo.",
    stageMin: 2, stageMax: 3, order: 9, prerequisites: ["ph-long-vowels-silent-e"] },
  { id: "ph-rhyme", subject: "READING", name: "Rhyming",
    objective: "Identify and produce words that rhyme.",
    stageMin: 0, stageMax: 1, order: 10, prerequisites: ["ph-letter-sounds-consonants"] },
  { id: "ph-syllables", subject: "READING", name: "Syllable Counting",
    objective: "Count and clap syllables in spoken words of 1-4 syllables.",
    stageMin: 1, stageMax: 2, order: 11, prerequisites: ["ph-cvc-blending"] },

  // ── VOCABULARY ────────────────────────────────────────────────────────────
  { id: "vocab-opposites", subject: "READING", name: "Antonyms",
    objective: "Identify common opposite-word pairs in simple sentences.",
    stageMin: 0, stageMax: 1, order: 20, prerequisites: [] },
  { id: "vocab-synonyms", subject: "READING", name: "Synonyms",
    objective: "Match words with similar meanings using picture and sentence context.",
    stageMin: 1, stageMax: 2, order: 21, prerequisites: ["vocab-opposites"] },
  { id: "vocab-context-clues", subject: "READING", name: "Context Clues",
    objective: "Use sentence context to determine the meaning of an unknown word.",
    stageMin: 2, stageMax: 3, order: 22, prerequisites: ["vocab-synonyms"] },

  // ── FOUNDATIONAL MATHEMATICS ──────────────────────────────────────────────
  { id: "math-counting-0-10", subject: "MATH", name: "Counting to 10",
    objective: "Count a set of up to 10 objects accurately, using one-to-one correspondence.",
    stageMin: 0, stageMax: 0, order: 1, prerequisites: [] },
  { id: "math-counting-0-20", subject: "MATH", name: "Counting to 20",
    objective: "Count forward and backward to 20; identify numerals 0-20.",
    stageMin: 0, stageMax: 1, order: 2, prerequisites: ["math-counting-0-10"] },
  { id: "math-counting-0-100", subject: "MATH", name: "Counting to 100",
    objective: "Count forward and backward to 100; count by 2s, 5s and 10s.",
    stageMin: 1, stageMax: 2, order: 3, prerequisites: ["math-counting-0-20"] },
  { id: "math-compare-numbers", subject: "MATH", name: "Compare Numbers",
    objective: "Compare two numbers up to 20 and use the words more, fewer, equal to.",
    stageMin: 0, stageMax: 1, order: 4, prerequisites: ["math-counting-0-20"] },
  { id: "math-addition-to-10", subject: "MATH", name: "Addition to 10",
    objective: "Compose and decompose numbers to 10; add two single-digit numbers.",
    stageMin: 0, stageMax: 1, order: 5, prerequisites: ["math-counting-0-10"] },
  { id: "math-subtraction-within-10", subject: "MATH", name: "Subtraction within 10",
    objective: "Subtract from numbers up to 10; understand subtraction as taking away.",
    stageMin: 0, stageMax: 1, order: 6, prerequisites: ["math-addition-to-10"] },
  { id: "math-addition-to-20", subject: "MATH", name: "Addition to 20",
    objective: "Add two single-digit numbers with a sum up to 20; use a number line.",
    stageMin: 1, stageMax: 2, order: 7, prerequisites: ["math-addition-to-10"] },
  { id: "math-subtraction-within-20", subject: "MATH", name: "Subtraction within 20",
    objective: "Subtract from numbers within 20; relate subtraction to addition.",
    stageMin: 1, stageMax: 2, order: 8, prerequisites: ["math-subtraction-within-10", "math-addition-to-20"] },
  { id: "math-place-value-tens", subject: "MATH", name: "Place Value: Tens and Ones",
    objective: "Understand that a two-digit number represents tens and ones.",
    stageMin: 1, stageMax: 2, order: 9, prerequisites: ["math-counting-0-100"] },
  { id: "math-addition-two-digit", subject: "MATH", name: "Two-Digit Addition",
    objective: "Add two-digit numbers (without and with regrouping).",
    stageMin: 2, stageMax: 3, order: 10, prerequisites: ["math-place-value-tens", "math-addition-to-20"] },
  { id: "math-subtraction-two-digit", subject: "MATH", name: "Two-Digit Subtraction",
    objective: "Subtract two-digit numbers (without and with regrouping).",
    stageMin: 2, stageMax: 3, order: 11, prerequisites: ["math-addition-two-digit"] },
  { id: "math-shapes-2d", subject: "MATH", name: "2D Shapes",
    objective: "Name, describe and sort 2D shapes.",
    stageMin: 0, stageMax: 1, order: 12, prerequisites: [] },
  { id: "math-shapes-3d", subject: "MATH", name: "3D Shapes",
    objective: "Name and describe 3D shapes.",
    stageMin: 0, stageMax: 2, order: 13, prerequisites: ["math-shapes-2d"] },
  { id: "math-measurement-length", subject: "MATH", name: "Measurement: Length",
    objective: "Measure and compare lengths using non-standard and standard units.",
    stageMin: 1, stageMax: 2, order: 14, prerequisites: ["math-compare-numbers"] },
  { id: "math-time-oclock", subject: "MATH", name: "Telling Time: O'Clock and Half Past",
    objective: "Read an analogue clock to the hour and half hour.",
    stageMin: 1, stageMax: 2, order: 15, prerequisites: ["math-counting-0-20"] },

  // ── EARLY SCIENCE ─────────────────────────────────────────────────────────
  { id: "sci-living-nonliving", subject: "SCIENCE", name: "Living and Non-Living",
    objective: "Sort objects and organisms into living and non-living categories.",
    stageMin: 0, stageMax: 1, order: 1, prerequisites: [] },
  { id: "sci-plant-parts", subject: "SCIENCE", name: "Plant Parts",
    objective: "Name the main parts of a plant and state their function.",
    stageMin: 0, stageMax: 1, order: 2, prerequisites: ["sci-living-nonliving"] },
  { id: "sci-animal-groups", subject: "SCIENCE", name: "Animal Groups",
    objective: "Sort animals into broad groups using observable features.",
    stageMin: 1, stageMax: 2, order: 3, prerequisites: ["sci-living-nonliving"] },
  { id: "sci-weather-types", subject: "SCIENCE", name: "Weather Types",
    objective: "Name and describe common weather types and their characteristics.",
    stageMin: 0, stageMax: 1, order: 4, prerequisites: [] },
  { id: "sci-states-matter", subject: "SCIENCE", name: "States of Matter",
    objective: "Identify and describe solids, liquids and gases with everyday examples.",
    stageMin: 1, stageMax: 2, order: 5, prerequisites: [] },
];

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱  Seeding LearningSkill records…");

  // 1. Upsert skills (without prerequisites first to avoid FK issues)
  for (const skill of SKILLS) {
    await prisma.learningSkill.upsert({
      where: { id: skill.id },
      create: {
        id: skill.id,
        subject: skill.subject,
        name: skill.name,
        objective: skill.objective,
        stageMin: skill.stageMin,
        stageMax: skill.stageMax,
        order: skill.order,
      },
      update: {
        name: skill.name,
        objective: skill.objective,
        stageMin: skill.stageMin,
        stageMax: skill.stageMax,
        order: skill.order,
      },
    });
  }
  console.log(`  ✓ ${SKILLS.length} skills upserted.`);

  // 2. Upsert prerequisites
  let prereqCount = 0;
  for (const skill of SKILLS) {
    for (const reqId of skill.prerequisites) {
      await prisma.skillPrerequisite.upsert({
        where: { skillId_requiresId: { skillId: skill.id, requiresId: reqId } },
        create: { skillId: skill.id, requiresId: reqId },
        update: {},
      });
      prereqCount++;
    }
  }
  console.log(`  ✓ ${prereqCount} prerequisites upserted.`);

  // 3. Upsert ContentCurriculumVersion
  const existing = await prisma.contentCurriculumVersion.findUnique({
    where: { version: CURRICULUM_VERSION },
  });
  if (!existing) {
    // Deactivate any previously active version
    await prisma.contentCurriculumVersion.updateMany({
      where: { active: true },
      data: { active: false },
    });
    await prisma.contentCurriculumVersion.create({
      data: {
        version: CURRICULUM_VERSION,
        description: CURRICULUM_DESCRIPTION,
        active: true,
      },
    });
    console.log(`  ✓ Curriculum version ${CURRICULUM_VERSION} created.`);
  } else {
    console.log(`  ✓ Curriculum version ${CURRICULUM_VERSION} already exists.`);
  }

  console.log("🎉  Done.");
}

main()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
