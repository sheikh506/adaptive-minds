import { PrismaClient, Role, Grade, Subject, Difficulty } from "@prisma/client";
import bcrypt from "bcryptjs";
import { buildExercises } from "./content";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ── Badges ─────────────────────────────────────────────────────────────────
  const badges = await Promise.all([
    prisma.badge.upsert({
      where: { id: "badge-first-star" },
      update: {},
      create: {
        id: "badge-first-star",
        name: "First Star",
        description: "Complete your first exercise",
        icon: "⭐",
        condition: "first_exercise",
      },
    }),
    prisma.badge.upsert({
      where: { id: "badge-streak-3" },
      update: {},
      create: {
        id: "badge-streak-3",
        name: "On Fire!",
        description: "3-day learning streak",
        icon: "🔥",
        condition: "streak_3",
      },
    }),
    prisma.badge.upsert({
      where: { id: "badge-streak-7" },
      update: {},
      create: {
        id: "badge-streak-7",
        name: "Week Warrior",
        description: "7-day learning streak",
        icon: "🏆",
        condition: "streak_7",
      },
    }),
    prisma.badge.upsert({
      where: { id: "badge-math-100" },
      update: {},
      create: {
        id: "badge-math-100",
        name: "Math Wizard",
        description: "Answer 100 math questions correctly",
        icon: "🧙",
        condition: "math_correct_100",
      },
    }),
    prisma.badge.upsert({
      where: { id: "badge-reading-50" },
      update: {},
      create: {
        id: "badge-reading-50",
        name: "Bookworm",
        description: "Complete 50 reading exercises",
        icon: "📚",
        condition: "reading_50",
      },
    }),
    prisma.badge.upsert({
      where: { id: "badge-science-30" },
      update: {},
      create: {
        id: "badge-science-30",
        name: "Science Explorer",
        description: "Answer 30 science questions",
        icon: "🔬",
        condition: "science_30",
      },
    }),
    prisma.badge.upsert({
      where: { id: "badge-xp-500" },
      update: {},
      create: {
        id: "badge-xp-500",
        name: "XP Champion",
        description: "Earn 500 XP",
        icon: "🎯",
        condition: "xp_500",
        xpThreshold: 500,
      },
    }),
    prisma.badge.upsert({
      where: { id: "badge-level-5" },
      update: {},
      create: {
        id: "badge-level-5",
        name: "Level 5 Hero",
        description: "Reach level 5",
        icon: "🦸",
        condition: "level_5",
      },
    }),
  ]);
  console.log(`✅ Created ${badges.length} badges`);

  // ── Topics ─────────────────────────────────────────────────────────────────
  const mathTopics = await Promise.all([
    prisma.topic.upsert({
      where: { id: "topic-addition" },
      update: {},
      create: {
        id: "topic-addition",
        subject: Subject.MATH,
        name: "Addition",
        description: "Learn to add numbers",
        icon: "➕",
        order: 1,
      },
    }),
    prisma.topic.upsert({
      where: { id: "topic-subtraction" },
      update: {},
      create: {
        id: "topic-subtraction",
        subject: Subject.MATH,
        name: "Subtraction",
        description: "Learn to subtract numbers",
        icon: "➖",
        order: 2,
      },
    }),
    prisma.topic.upsert({
      where: { id: "topic-multiplication" },
      update: {},
      create: {
        id: "topic-multiplication",
        subject: Subject.MATH,
        name: "Multiplication",
        description: "Master multiplication tables",
        icon: "✖️",
        order: 3,
      },
    }),
    prisma.topic.upsert({
      where: { id: "topic-division" },
      update: {},
      create: {
        id: "topic-division",
        subject: Subject.MATH,
        name: "Division",
        description: "Divide numbers with confidence",
        icon: "➗",
        order: 4,
      },
    }),
    prisma.topic.upsert({
      where: { id: "topic-fractions" },
      update: {},
      create: {
        id: "topic-fractions",
        subject: Subject.MATH,
        name: "Fractions",
        description: "Understand fractions and decimals",
        icon: "🔢",
        order: 5,
      },
    }),
  ]);

  const readingTopics = await Promise.all([
    prisma.topic.upsert({
      where: { id: "topic-phonics" },
      update: {},
      create: {
        id: "topic-phonics",
        subject: Subject.READING,
        name: "Phonics",
        description: "Letter sounds and blending",
        icon: "🔤",
        order: 1,
      },
    }),
    prisma.topic.upsert({
      where: { id: "topic-vocabulary" },
      update: {},
      create: {
        id: "topic-vocabulary",
        subject: Subject.READING,
        name: "Vocabulary",
        description: "Build your word bank",
        icon: "📖",
        order: 2,
      },
    }),
    prisma.topic.upsert({
      where: { id: "topic-comprehension" },
      update: {},
      create: {
        id: "topic-comprehension",
        subject: Subject.READING,
        name: "Comprehension",
        description: "Understand what you read",
        icon: "🧠",
        order: 3,
      },
    }),
  ]);
  // New worlds: early learners, more maths, more reading and science. Idempotent upserts keyed by id.
  const extraTopicDefs: { id: string; subject: Subject; name: string; description: string; icon: string; order: number }[] = [
    { id: "topic-counting", subject: Subject.MATH, name: "Counting", description: "Count, compare and add small numbers", icon: "🔢", order: 0 },
    { id: "topic-geometry", subject: Subject.MATH, name: "Geometry", description: "Shapes, perimeter and area", icon: "🔷", order: 6 },
    { id: "topic-measurement", subject: Subject.MATH, name: "Measurement", description: "Length, weight and capacity", icon: "📏", order: 7 },
    { id: "topic-time", subject: Subject.MATH, name: "Time", description: "Read clocks and work with time", icon: "🕒", order: 8 },
    { id: "topic-money", subject: Subject.MATH, name: "Money", description: "Coins, prices and change", icon: "🪙", order: 9 },
    { id: "topic-data", subject: Subject.MATH, name: "Data", description: "Read charts and find patterns", icon: "📊", order: 10 },
    { id: "topic-letters", subject: Subject.READING, name: "Letters", description: "Letters and their sounds", icon: "🅰️", order: 0 },
    { id: "topic-spelling", subject: Subject.READING, name: "Spelling", description: "Spell words the right way", icon: "🐝", order: 4 },
    { id: "topic-grammar", subject: Subject.READING, name: "Grammar", description: "Build correct sentences", icon: "🛠️", order: 5 },
    { id: "topic-life-science", subject: Subject.SCIENCE, name: "Life Science", description: "Animals, plants and the human body", icon: "🌱", order: 1 },
    { id: "topic-earth-space", subject: Subject.SCIENCE, name: "Earth & Space", description: "Planets, weather and rocks", icon: "🌍", order: 2 },
    { id: "topic-matter-energy", subject: Subject.SCIENCE, name: "Matter & Energy", description: "Solids, liquids, gases, forces and light", icon: "⚡", order: 3 },
  ];
  // One at a time: a burst of parallel upserts can exceed what the hosted database accepts.
  const extraTopics = [];
  for (const t of extraTopicDefs) {
    extraTopics.push(await prisma.topic.upsert({ where: { id: t.id }, update: {}, create: t }));
  }
  console.log(`✅ Created ${mathTopics.length + readingTopics.length + extraTopics.length} topics`);

  // ── Sample Exercises ────────────────────────────────────────────────────────
  const exercises = await Promise.all([
    // Addition - Easy
    prisma.exercise.upsert({
      where: { id: "ex-add-1" },
      update: {},
      create: {
        id: "ex-add-1",
        topicId: "topic-addition",
        title: "Simple Addition",
        instructions: "What is the sum?",
        type: "multiple_choice",
        difficulty: Difficulty.EASY,
        level: 1,
        xpReward: 10,
        starReward: 1,
        data: {
          question: "2 + 3 = ?",
          options: ["4", "5", "6", "7"],
          answer: "5",
          explanation: "2 + 3 = 5. Count forward 3 from 2!",
        },
      },
    }),
    prisma.exercise.upsert({
      where: { id: "ex-add-2" },
      update: {},
      create: {
        id: "ex-add-2",
        topicId: "topic-addition",
        title: "Addition with Tens",
        instructions: "Find the sum of these numbers.",
        type: "multiple_choice",
        difficulty: Difficulty.MEDIUM,
        level: 3,
        xpReward: 15,
        starReward: 1,
        data: {
          question: "14 + 23 = ?",
          options: ["36", "37", "38", "39"],
          answer: "37",
          explanation: "14 + 23: Add ones (4+3=7), add tens (10+20=30). Total = 37",
        },
      },
    }),
    // Multiplication - Medium
    prisma.exercise.upsert({
      where: { id: "ex-mult-1" },
      update: {},
      create: {
        id: "ex-mult-1",
        topicId: "topic-multiplication",
        title: "Times Tables",
        instructions: "Solve the multiplication problem.",
        type: "multiple_choice",
        difficulty: Difficulty.MEDIUM,
        level: 4,
        xpReward: 15,
        starReward: 1,
        data: {
          question: "7 × 8 = ?",
          options: ["54", "56", "58", "64"],
          answer: "56",
          explanation: "7 × 8 = 56. Remember: 7 eights are 56!",
        },
      },
    }),
    // Vocabulary
    prisma.exercise.upsert({
      where: { id: "ex-vocab-1" },
      update: {},
      create: {
        id: "ex-vocab-1",
        topicId: "topic-vocabulary",
        title: "Word Meaning",
        instructions: "Choose the correct meaning of the word.",
        type: "multiple_choice",
        difficulty: Difficulty.EASY,
        level: 2,
        xpReward: 10,
        starReward: 1,
        data: {
          question: "What does 'enormous' mean?",
          options: ["Very small", "Very large", "Very fast", "Very slow"],
          answer: "Very large",
          explanation: "'Enormous' means extremely large in size.",
        },
      },
    }),
    // Reading Comprehension
    prisma.exercise.upsert({
      where: { id: "ex-comp-1" },
      update: {},
      create: {
        id: "ex-comp-1",
        topicId: "topic-comprehension",
        title: "Short Story",
        instructions: "Read the passage and answer the question.",
        type: "reading_comp",
        difficulty: Difficulty.EASY,
        level: 2,
        xpReward: 20,
        starReward: 2,
        data: {
          passage:
            "Sam has a red ball. He plays with it every day after school. One day, the ball rolled under the fence and into the neighbor's yard. Sam knocked on the door and politely asked for his ball back.",
          question: "What did Sam do when his ball went into the neighbor's yard?",
          options: [
            "He cried and went home",
            "He climbed over the fence",
            "He knocked and politely asked for it back",
            "He left the ball there",
          ],
          answer: "He knocked and politely asked for it back",
          explanation:
            "The passage says Sam knocked on the door and politely asked for his ball back.",
        },
      },
    }),
  ]);
  console.log(`✅ Created ${exercises.length} sample exercises`);

  // ── Generated question bank (levels 1–10 for every topic) ──────────────────
  const bank = buildExercises();
  // Single round trip; skipDuplicates keeps re-seeding idempotent.
  const { count } = await prisma.exercise.createMany({ data: bank, skipDuplicates: true });
  console.log(`✅ Created ${count} generated exercises (${bank.length} in bank)`);

  // Retire earlier generations of the bank (plain sums, then first-draft stories). Rows a child already
  // answered are kept, but switched off so they are never served again.
  const oldIds = { OR: [{ id: { startsWith: "gen-" } }, { id: { startsWith: "story-" } }] };
  const deleted = await prisma.exercise.deleteMany({ where: { ...oldIds, sessions: { none: {} } } });
  const hidden = await prisma.exercise.updateMany({ where: oldIds, data: { active: false } });
  console.log(`🧹 Retired old questions: ${deleted.count} removed, ${hidden.count} hidden (kept for history)`);
  // ── Demo Users ──────────────────────────────────────────────────────────────
  const hashedPassword = await bcrypt.hash("password123", 12);

  const student = await prisma.user.upsert({
    where: { email: "student@demo.com" },
    update: {},
    create: {
      email: "student@demo.com",
      name: "Alex Johnson",
      password: hashedPassword,
      role: Role.STUDENT,
      grade: Grade.G3,
      studentLevel: 3,
      totalStars: 42,
      totalXP: 380,
      streakDays: 5,
      lastActiveAt: new Date(),
    },
  });

  const teacher = await prisma.user.upsert({
    where: { email: "teacher@demo.com" },
    update: {},
    create: {
      email: "teacher@demo.com",
      name: "Ms. Rivera",
      password: hashedPassword,
      role: Role.TEACHER,
    },
  });

  const parent = await prisma.user.upsert({
    where: { email: "parent@demo.com" },
    update: {},
    create: {
      email: "parent@demo.com",
      name: "Jordan Johnson",
      password: hashedPassword,
      role: Role.PARENT,
    },
  });

  // Parent-child link
  await prisma.parentChild.upsert({
    where: { parentId_childId: { parentId: parent.id, childId: student.id } },
    update: {},
    create: { parentId: parent.id, childId: student.id },
  });

  // Classroom
  const classroom = await prisma.classroom.upsert({
    where: { id: "classroom-demo" },
    update: {},
    create: {
      id: "classroom-demo",
      name: "3rd Grade Stars",
      code: "STARS3",
      teacherId: teacher.id,
      grade: Grade.G3,
    },
  });

  await prisma.enrollment.upsert({
    where: {
      studentId_classroomId: {
        studentId: student.id,
        classroomId: classroom.id,
      },
    },
    update: {},
    create: { studentId: student.id, classroomId: classroom.id },
  });

  // The demo student has been placed already (placement is skipped for them)
  await prisma.user.update({ where: { id: student.id }, data: { placementDone: true } });

  // Progress for student (the original eight worlds; new worlds start fresh)
  for (const topic of [...mathTopics, ...readingTopics]) {
    await prisma.progress.upsert({
      where: { userId_topicId: { userId: student.id, topicId: topic.id } },
      update: {},
      create: {
        userId: student.id,
        topicId: topic.id,
        level: Math.floor(Math.random() * 4) + 1,
        correctCount: Math.floor(Math.random() * 20) + 1,
        totalCount: Math.floor(Math.random() * 25) + 5,
      },
    });
  }

  // Award some badges
  await prisma.userBadge.upsert({
    where: { userId_badgeId: { userId: student.id, badgeId: "badge-first-star" } },
    update: {},
    create: { userId: student.id, badgeId: "badge-first-star" },
  });
  await prisma.userBadge.upsert({
    where: { userId_badgeId: { userId: student.id, badgeId: "badge-streak-3" } },
    update: {},
    create: { userId: student.id, badgeId: "badge-streak-3" },
  });

  console.log(`✅ Created demo users:`);
  console.log(`   📚 Student: student@demo.com / password123`);
  console.log(`   🍎 Teacher: teacher@demo.com / password123`);
  console.log(`   👨‍👩‍👧 Parent:  parent@demo.com  / password123`);
  console.log("🎉 Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
