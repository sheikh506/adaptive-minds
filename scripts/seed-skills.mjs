#!/usr/bin/env node
/**
 * scripts/seed-skills.mjs
 *
 * Seeds (upserts) the LearningSkill and SkillPrerequisite rows into the database.
 * Safe to run multiple times — uses upsert so existing records are updated, not duplicated.
 * Also seeds ContentCurriculumVersion v1.0.0 if it does not exist.
 *
 * Uses the authoritative curriculum manifest from src/lib/skill-curriculum.ts
 * to eliminate duplication.
 *
 * Usage:
 *   npx tsx scripts/seed-skills.mjs
 *   npm run seed:skills
 */

import { PrismaClient } from "@prisma/client";
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

// Import the single source of truth curriculum
const { SKILL_CURRICULUM } = await import("../src/lib/skill-curriculum.ts");

const CURRICULUM_VERSION = "1.0.0";
const CURRICULUM_DESCRIPTION =
  "Initial K–G2 curriculum: phonics, vocabulary, foundational mathematics, early science.";

async function main() {
  console.log("🌱  Seeding LearningSkill records from authoritative manifest…");

  // 1. Upsert skills (without prerequisites first to avoid FK issues)
  for (const skill of SKILL_CURRICULUM) {
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
  console.log(`  ✓ ${SKILL_CURRICULUM.length} skills upserted.`);

  // 2. Upsert prerequisites
  let prereqCount = 0;
  for (const skill of SKILL_CURRICULUM) {
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
