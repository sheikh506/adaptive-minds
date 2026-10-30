import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Character from "@/components/art/Character";
import { companionStage, isEarlyLearner, isEarlyTopic, worldFor } from "@/lib/game";
import { goalSecondsByTopic, usedSecondsByTopic } from "@/lib/practice";
import { unlockMap } from "@/lib/spaced-repetition";

export const dynamic = "force-dynamic";

/** Adventure map: every topic is a themed world with its own guide character. */
export default async function PlayMapPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "STUDENT") redirect("/dashboard");
  const userId = session.user.id;

  const [topics, progress, user, used] = await Promise.all([
    prisma.topic.findMany({ orderBy: [{ subject: "asc" }, { order: "asc" }] }),
    prisma.progress.findMany({ where: { userId } }),
    prisma.user.findUniqueOrThrow({ where: { id: userId } }),
    usedSecondsByTopic(userId),
  ]);
  const goals = await goalSecondsByTopic(userId, topics.map((t) => t.id));
  const progressMap = new Map(progress.map((p) => [p.topicId, p]));
  const buddy = companionStage(user.totalXP);
  const unlocks = unlockMap(topics.map((t) => t.id), progress);
  const nameById = new Map(topics.map((t) => [t.id, t.name]));

  // Little Learners (Counting, Letters) come first for K–2 and are folded into Math/Reading for everyone else.
  const early = isEarlyLearner(user.grade);
  const groups = [
    ...(early ? [{ key: "EARLY", title: "Little Learners", emoji: "🧸", pick: (t: { id: string }) => isEarlyTopic(t.id) }] : []),
    { key: "MATH", title: "Number Lands", emoji: "🔢", pick: (t: { id: string; subject: string }) => t.subject === "MATH" && !(early && isEarlyTopic(t.id)) },
    { key: "READING", title: "Story Lands", emoji: "📚", pick: (t: { id: string; subject: string }) => t.subject === "READING" && !(early && isEarlyTopic(t.id)) },
    { key: "SCIENCE", title: "Science Labs", emoji: "🔬", pick: (t: { id: string; subject: string }) => t.subject === "SCIENCE" },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="flex items-center gap-4 rounded-3xl bg-gradient-to-r from-brand-500 to-purple-600 p-5 text-white">
        <div className="text-6xl" aria-hidden="true">{buddy.emoji}</div>
        <div>
          <h1 className="text-2xl font-extrabold">Pick your adventure!</h1>
          <p className="text-white/90">
            Play as long as you like. Every world keeps the questions coming, and helps your {buddy.name.toLowerCase()} grow.
          </p>
        </div>
      </div>

      {groups.map((g) => {
        const list = topics.filter((t) => g.pick(t));
        if (list.length === 0) return null;
        return (
          <section key={g.key}>
            <h2 className="mb-3 text-xl font-extrabold text-gray-900">
              {g.emoji} {g.title}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {list.map((t) => {
                const w = worldFor(t.name);
                const p = progressMap.get(t.id);
                const usedSec = used.get(t.id) ?? 0;
                const goalSec = goals.get(t.id) ?? 0;
                const level = p?.level ?? 1;
                const usedMin = Math.floor(usedSec / 60);
                const goalMin = Math.round(goalSec / 60);
                const dayLabel =
                  goalMin === 0
                    ? "Rest today"
                    : usedSec >= goalSec
                      ? "Today's time done ✓"
                      : usedSec === 0
                        ? `${goalMin} min today`
                        : `${usedMin}/${goalMin} min today`;
                const lock = unlocks.get(t.id);
                if (lock && !lock.unlocked) {
                  const needs = lock.missingPrerequisites.map((id) => nameById.get(id) ?? "the earlier world").join(" and ");
                  return (
                    <div
                      key={t.id}
                      className="rounded-3xl border-2 border-dashed border-gray-300 bg-gray-100 p-5 text-gray-600"
                      aria-label={`${w.name} is locked. Reach level 2 in ${needs} to open it.`}
                    >
                      <p className="text-xs font-bold uppercase tracking-wide text-gray-500">{t.name}</p>
                      <h3 className="text-2xl font-extrabold text-gray-700">
                        <span aria-hidden="true">🔒</span> {w.name}
                      </h3>
                      <p className="mt-1 text-sm">{w.tagline}</p>
                      <p className="mt-3 rounded-2xl bg-white py-3 text-center text-sm font-bold text-gray-700">
                        Reach level 2 in {needs} to open this world
                      </p>
                    </div>
                  );
                }
                return (
                  <Link
                    key={t.id}
                    href={`/dashboard/learn/${t.id}`}
                    className={`group overflow-hidden rounded-3xl bg-gradient-to-br ${w.gradient} p-5 text-white shadow-sm transition-transform hover:-translate-y-1 hover:shadow-lg`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-white/80">{t.name}</p>
                        <h3 className="text-2xl font-extrabold">{w.name}</h3>
                        <p className="mt-1 text-sm text-white/90">{w.tagline}</p>
                      </div>
                      <span className="rounded-full bg-white/25 p-1 drop-shadow"><Character kind={w.guide} size={72} /></span>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-sm font-bold">
                      <span className="rounded-full bg-white/25 px-3 py-1">
                        Level {level}
                        {p?.mastered ? " · Mastered ✓" : ""}
                      </span>
                      <span className="rounded-full bg-white/25 px-3 py-1">
                        {dayLabel}
                      </span>
                    </div>
                    <div className="mt-3 rounded-2xl bg-white py-3 text-center text-base font-extrabold text-gray-900 group-hover:bg-yellow-100">
                      {usedSec === 0 && !p ? `Meet ${w.guideName}` : `Play with ${w.guideName}`} →
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
