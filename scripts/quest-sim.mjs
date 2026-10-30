// Data-level check of the continuous-practice rules against the real database.
// It does NOT call server actions (they need a login session). It uses a throwaway student + parent and deletes them.
// Usage: node --env-file=.env scripts/quest-sim.mjs
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const stamp = Date.now();
const email = `e2e.quest${stamp}@example.com`;
const parentEmail = `e2e.questparent${stamp}@example.com`;
let pass = 0;
let fail = 0;
const check = (name, ok, extra = "") => {
  ok ? pass++ : fail++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${extra ? "  -> " + extra : ""}`);
};

try {
  const topics = await prisma.topic.findMany();
  check("8 worlds exist", topics.length === 8, String(topics.length));

  // Every world must have enough ACTIVE questions at every level to run for a long session.
  for (const t of topics) {
    const rows = await prisma.exercise.groupBy({ by: ["level"], where: { topicId: t.id, active: true }, _count: true });
    const thin = rows.filter((r) => r._count < 10);
    check(`${t.name}: every level has >= 10 active questions`, rows.length === 10 && thin.length === 0, `${rows.length} levels, thin: ${thin.map((r) => r.level).join(",") || "none"}`);
  }
  const retired = await prisma.exercise.count({ where: { active: true, id: { startsWith: "story-" } } });
  check("old story-* questions are no longer served", retired === 0, String(retired));

  const user = await prisma.user.create({ data: { name: "Quest Sim", email, role: "STUDENT", grade: "G3" } });
  const parent = await prisma.user.create({ data: { name: "Quest Parent", email: parentEmail, role: "PARENT" } });
  await prisma.parentChild.create({ data: { parentId: parent.id, childId: user.id } });
  const topic = topics.find((t) => t.name === "Addition");

  // Parent-set goal: unique per child and skill, upsert changes it.
  await prisma.practiceGoal.upsert({
    where: { childId_topicId: { childId: user.id, topicId: topic.id } },
    update: { minutes: 15 },
    create: { childId: user.id, topicId: topic.id, minutes: 15 },
  });
  await prisma.practiceGoal.upsert({
    where: { childId_topicId: { childId: user.id, topicId: topic.id } },
    update: { minutes: 20 },
    create: { childId: user.id, topicId: topic.id, minutes: 20 },
  });
  const goals = await prisma.practiceGoal.findMany({ where: { childId: user.id } });
  check("one goal row per child+skill, latest value wins", goals.length === 1 && goals[0].minutes === 20);

  // Many more than 5 answers in a row: the pool never runs dry within a level window.
  const pool = await prisma.exercise.findMany({ where: { topicId: topic.id, active: true, level: { in: [1, 2] } } });
  check("level 1-2 window holds far more than one 5-question round", pool.length >= 30, String(pool.length));

  const picked = pool.slice(0, 12);
  for (const [i, ex] of picked.entries()) {
    await prisma.exerciseSession.create({
      data: { userId: user.id, exerciseId: ex.id, correct: i % 4 !== 1, timeTaken: 20, xpEarned: 0, starsEarned: 0, completedAt: new Date(Date.now() - (12 - i) * 20_000) },
    });
  }
  const sessions = await prisma.exerciseSession.findMany({ where: { userId: user.id }, orderBy: { completedAt: "asc" } });
  let sec = 0;
  for (let i = 0; i < sessions.length; i++) {
    const gap = i === 0 ? sessions[i].timeTaken : (sessions[i].completedAt - sessions[i - 1].completedAt) / 1000;
    sec += gap > 90 ? Math.min(sessions[i].timeTaken, 90) : gap;
  }
  check("12 answers about 20s apart count as about 4 minutes of practice", sec > 200 && sec < 280, `${Math.round(sec)}s`);

  // Anti-farming guard: re-answering inside 10 minutes finds a recent session.
  const recent = await prisma.exerciseSession.findFirst({
    where: { userId: user.id, exerciseId: picked[0].id, completedAt: { gt: new Date(Date.now() - 600_000) } },
  });
  check("repeat within 10 minutes is detected (no extra XP)", !!recent);

  // The hint needs wrong options to remove and must keep the answer.
  const d = picked[0].data;
  const wrong = d.options.filter((o) => o !== d.answer);
  check("hint has wrong options to remove and keeps the answer", wrong.length >= 2 && d.options.includes(d.answer));
} finally {
  await prisma.user.deleteMany({ where: { email: { in: [email, parentEmail] } } }).catch(() => {});
  await prisma.$disconnect();
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
