# AdaptiveMinds

An adaptive K-12 learning platform for math, reading and science (Next.js 14, Prisma, PostgreSQL, Auth.js, Tailwind).

## Features

- **First-run placement** – a new student takes a short placement quest (or skips it) to find a starting level.
- **Learn first** – every skill opens with a short lesson and a worked example, and can be reopened any time.
- **Hint ladder** – a free nudge, then a worked example, then a 50:50. Only the last two cost half XP.
- **Gentle recovery and spaced review** – after a miss the next question is one level easier, and one question per quest is a refresher from an older skill.
- **World map with prerequisites** – later worlds unlock at level 2 of the skills they build on. Children who already practised a world are never locked out.
- **Little Learners track** – Counting and Letters come first for grades K–2, with read-aloud on by default.
- **Adaptive engine** – difficulty moves up or down per topic from a sliding window of recent answers.
- **Server-side grading** – the correct answer never reaches the browser before the student answers.
- **Rewards** – XP, stars, daily streaks, badges, level-up notifications.
- **Student experience** – large touch targets, keyboard shortcuts (1–4 to pick, Enter to continue), question timer, mobile bottom navigation.
- **Progress analytics** – accuracy by topic, 14-day activity trend, strengths and "needs practice" insights.
- **Teacher tools** – create classrooms with a join code, class roster, students flagged as needing support.
- **Parent tools** – link a child (requires the child's email and password), per-child summary.
- **"Why?" cards** – after every question, an explanation, a "Remember" idea from the lesson, and a "Next time" nudge after a miss. Everything can be read aloud.
- **Story Time** – six original read-aloud stories (browser speech) with highlighted sentences, auto page turn and a three-question "why" quiz (`src/lib/storybook.ts`).
- **Art & Craft** – a drawing studio (save as PNG on the device), a tap-to-colour book and six craft projects with a hidden lesson and a grown-up note (`src/lib/crafts.ts`).
- **Music** – calm background music that follows the section (synthesised in the browser, **off by default**), plus a Music Maker with a xylophone, four play-along songs and a recorder (`src/lib/music.ts`).
- **Fun Zone** – memory match, animal sounds, bubble pop (no timer), a breathing break, a fun fact of the day and a sticker album. Stickers live on the device only: no leaderboards, no comparing children.

- **Question bank** – 20 skills across math, reading and science, levels 1–10, generated deterministically by `prisma/content.ts` (`math-extra.ts`, `language.ts`, `science.ts`). Math adds Counting, Geometry, Measurement, Time (with an analog clock), Money and Data. Reading adds Letters, Spelling and Grammar. Science has Life Science, Earth & Space and Matter & Energy.

## Requirements

- Node.js 18.17+ (20 LTS recommended)
- PostgreSQL 14+ (local install, Docker, or a hosted DB such as Neon / Supabase)

## Run locally

```bash
cd adaptive-minds
npm install                  # also runs `prisma generate`
cp .env.example .env         # then edit DATABASE_URL and set AUTH_SECRET
npx auth secret              # (optional) prints a random AUTH_SECRET
npm run db:push              # create tables
npm run db:seed              # topics, badges, question bank, demo users
# Upgrading an existing database? Run db:push and db:seed again (new columns, a SCIENCE subject, new topics).
npm run dev                  # http://localhost:3000
```

Demo accounts (password `password123`): `student@demo.com`, `teacher@demo.com`, `parent@demo.com`.
Demo classroom join code: `STARS3`.

## Quality checks

```bash
npm run typecheck
npm run lint
npm run build
```

## Deploy (Vercel + Neon)

1. Create a Postgres database (Neon, Supabase, Railway…) and copy its connection string.
2. Push this folder to GitHub and import it in Vercel.
3. Set environment variables: `DATABASE_URL`, `AUTH_SECRET`, and `AUTH_TRUST_HOST=true`.
4. Run `npx prisma db push` and `npm run db:seed` once against the production database.
5. **Remove the demo accounts** from production (or don't run the seed's demo-user section).

## Project layout

```
prisma/            schema, seed, question-bank generator
src/app/actions/   server actions (exercise grading, classrooms, profile)
src/components/    dashboards, exercise player, progress charts
src/lib/           adaptive engine, prisma client, utils
```
