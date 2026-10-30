import Link from "next/link";
import { Star, Zap, Flame, TrendingUp, Calculator, BookOpen, Clock, Sparkles, RefreshCw, FlaskConical } from "lucide-react";
import { getStreakEmoji } from "@/lib/utils";
import { companionStage } from "@/lib/game";
import { evaluateTopicRetention } from "@/lib/spaced-repetition";
import type { Prisma } from "@prisma/client";

type UserWithRelations = Prisma.UserGetPayload<{
  include: {
    badges: { include: { badge: true } };
    progress: { include: { topic: true } };
  };
}>;

export default function StudentDashboard({
  user,
  practice,
}: {
  user: UserWithRelations;
  /** Minutes practised today vs. the parent's daily goal, across all skills. */
  practice: { usedMin: number; goalMin: number };
}) {
  const buddy = companionStage(user.totalXP);
  const goalDone = Math.min(practice.usedMin, practice.goalMin);
  const allDone = practice.goalMin > 0 && practice.usedMin >= practice.goalMin;
  const goalPercent = practice.goalMin > 0 ? Math.round((goalDone / practice.goalMin) * 100) : 100;

  const mathProgress = user.progress.filter((p) => p.topic.subject === "MATH");
  const readingProgress = user.progress.filter((p) => p.topic.subject === "READING");
  const scienceProgress = user.progress.filter((p) => p.topic.subject === "SCIENCE");

  const scienceAccuracy =
    scienceProgress.reduce((sum, p) => sum + (p.totalCount > 0 ? p.correctCount / p.totalCount : 0), 0) /
    Math.max(scienceProgress.length, 1);
  const mathAccuracy =
    mathProgress.reduce((sum, p) => sum + (p.totalCount > 0 ? p.correctCount / p.totalCount : 0), 0) /
    Math.max(mathProgress.length, 1);
  const readingAccuracy =
    readingProgress.reduce(
      (sum, p) => sum + (p.totalCount > 0 ? p.correctCount / p.totalCount : 0),
      0
    ) / Math.max(readingProgress.length, 1);

  // Spaced repetition evaluations
  const retentionReviews = user.progress
    .map((p) =>
      evaluateTopicRetention({
        topicId: p.topicId,
        topicName: p.topic.name,
        subject: p.topic.subject,
        currentLevel: p.level,
        correctCount: p.correctCount,
        totalCount: p.totalCount,
        lastPracticedAt: p.updatedAt,
      })
    )
    .filter((r) => r.needsReview);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Companion hero */}
      <div className="rounded-3xl bg-gradient-to-r from-brand-500 via-fuchsia-500 to-pink-500 p-6 text-white shadow-lg">
        <div className="flex items-center gap-5">
          <div
            className="flex h-28 w-28 flex-shrink-0 items-center justify-center rounded-full bg-white/20 text-7xl"
            aria-hidden="true"
          >
            {buddy.emoji}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-white/80">
              {user.name?.split(" ")[0]}&apos;s buddy · {buddy.name}
            </p>
            <h2 className="text-2xl font-extrabold">
              {practice.goalMin === 0 ? "Rest day today 😴" : allDone ? "Today's practice is complete! 🎉" : "Ready for today's adventure?"}
            </h2>
            {buddy.next ? (
              <>
                <p className="mt-1 text-sm text-white/90">
                  {buddy.xpToNext} XP until it grows into a {buddy.next.name} {buddy.next.emoji}
                </p>
                <div
                  className="mt-2 h-3 w-full overflow-hidden rounded-full bg-black/20"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={buddy.percent}
                  aria-label="Buddy growth"
                >
                  <div className="h-full rounded-full bg-yellow-300 transition-all" style={{ width: `${buddy.percent}%` }} />
                </div>
              </>
            ) : (
              <p className="mt-1 text-sm text-white/90">Your buddy is fully grown. What a legend!</p>
            )}
          </div>
          <div className="hidden text-4xl sm:block" title={`${user.streakDays} day streak`}>
            {getStreakEmoji(user.streakDays)}
          </div>
        </div>

        {/* Daily quest */}
        <div className="mt-5 rounded-2xl bg-white/15 p-4">
          <div className="mb-2 flex items-center justify-between text-sm font-bold">
            <span>Today&apos;s practice time</span>
            <span>
              {goalDone}/{practice.goalMin} min
            </span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-black/20">
            <div className="h-full rounded-full bg-green-300 transition-all" style={{ width: `${goalPercent}%` }} />
          </div>
          <Link
            href="/dashboard/play"
            className="mt-4 flex items-center justify-center rounded-2xl bg-white py-4 text-lg font-extrabold text-brand-700 hover:bg-yellow-100"
          >
            {allDone ? "Visit the map" : "Start practising"} 🚀
          </Link>
          <p className="mt-2 text-center text-xs text-white/80">Missing a day is okay. Your streak forgives one rest day.</p>
        </div>
      </div>

      {/* Fun tiles */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { href: "/dashboard/stories", emoji: "📚", title: "Story Time", sub: "Listen & wonder", grad: "from-indigo-500 to-fuchsia-500" },
          { href: "/dashboard/art", emoji: "🎨", title: "Art & Craft", sub: "Draw, colour, make", grad: "from-orange-400 to-pink-500" },
          { href: "/dashboard/fun/music", emoji: "🎹", title: "Music", sub: "Play & compose", grad: "from-violet-500 to-sky-500" },
          { href: "/dashboard/fun", emoji: "🎈", title: "Fun Zone", sub: "Games & stickers", grad: "from-lime-400 to-emerald-500" },
        ].map((t) => (
          <Link key={t.href} href={t.href} className={`tile bg-gradient-to-br ${t.grad}`}>
            <span className="animate-float block text-5xl drop-shadow" aria-hidden="true">{t.emoji}</span>
            <p className="mt-2 text-lg font-bold leading-tight">{t.title}</p>
            <p className="text-xs text-white/90">{t.sub}</p>
          </Link>
        ))}
      </div>

      {/* Spaced Repetition Refresher Alert */}
      {retentionReviews.length > 0 && (
        <div className="rounded-3xl border-2 border-amber-200 bg-amber-50/60 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-amber-600 animate-spin-slow" />
              <h3 className="font-extrabold text-amber-950">Memory Refresher: Skills Due for Review</h3>
            </div>
            <span className="rounded-full bg-amber-200/80 px-2.5 py-0.5 text-xs font-bold text-amber-900">
              Spaced Repetition
            </span>
          </div>
          <p className="text-xs text-amber-800 mb-3">
            Practicing these skills today will lock them into long-term memory before memory decay sets in!
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {retentionReviews.slice(0, 4).map((r) => (
              <Link
                key={r.topicId}
                href={`/dashboard/learn/${r.topicId}`}
                className="flex items-center justify-between rounded-2xl bg-white p-3 border border-amber-200/80 shadow-sm hover:border-amber-400 transition-all"
              >
                <div>
                  <p className="font-extrabold text-gray-900 text-sm">{r.topicName}</p>
                  <p className="text-[11px] text-gray-500">
                    Last practiced {r.daysSinceLastPractice}d ago · Retention: <strong>{r.retentionScore}%</strong>
                  </p>
                </div>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-extrabold text-amber-900">
                  Quick Review →
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          {
            icon: Star,
            label: "Total Stars",
            value: user.totalStars,
            color: "text-yellow-500 bg-yellow-50",
          },
          {
            icon: Zap,
            label: "Total XP",
            value: user.totalXP,
            color: "text-brand-600 bg-brand-50",
          },
          {
            icon: Flame,
            label: "Day Streak",
            value: user.streakDays,
            color: "text-orange-500 bg-orange-50",
          },
          {
            icon: TrendingUp,
            label: "Badges",
            value: user.badges.length,
            color: "text-purple-600 bg-purple-50",
          },
        ].map((stat) => (
          <div key={stat.label} className="stat-card flex items-center gap-4">
            <div className={`rounded-xl p-2.5 ${stat.color}`}>
              <stat.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Placement diagnostic banner */}
      <div className="flex flex-col sm:flex-row items-center justify-between rounded-3xl border border-brand-200 bg-brand-50/50 p-5 shadow-sm gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-white flex-shrink-0">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h4 className="font-extrabold text-gray-900 text-base">Diagnostic Placement Quest</h4>
            <p className="text-xs text-gray-600 mt-0.5">
              Calibrate your math and reading difficulty level with a quick 5-question test.
            </p>
          </div>
        </div>
        <Link
          href="/dashboard/placement"
          className="rounded-2xl bg-brand-600 px-5 py-2.5 text-xs font-extrabold text-white hover:bg-brand-700 whitespace-nowrap transition-colors"
        >
          Take Placement Test →
        </Link>
      </div>

      {/* Subject cards */}
      <div className="grid gap-6 sm:grid-cols-3">
        <SubjectCard
          subject="Math"
          icon={Calculator}
          color="from-sky-400 to-blue-600"
          accuracy={mathAccuracy}
          topicCount={mathProgress.length}
          masteredCount={mathProgress.filter((p) => p.mastered).length}
          href="/dashboard/play"
        />
        <SubjectCard
          subject="Reading"
          icon={BookOpen}
          color="from-fuchsia-500 to-purple-600"
          accuracy={readingAccuracy}
          topicCount={readingProgress.length}
          masteredCount={readingProgress.filter((p) => p.mastered).length}
          href="/dashboard/play"
        />
        <SubjectCard
          subject="Science"
          icon={FlaskConical}
          color="from-lime-500 to-emerald-600"
          accuracy={scienceAccuracy}
          topicCount={scienceProgress.length}
          masteredCount={scienceProgress.filter((p) => p.mastered).length}
          href="/dashboard/play"
        />
      </div>

      {/* Recent badges */}
      {user.badges.length > 0 && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-bold text-gray-900">Your Badges</h3>
            <Link
              href="/dashboard/rewards"
              className="text-sm font-medium text-brand-600 hover:underline"
            >
              View all →
            </Link>
          </div>
          <div className="flex flex-wrap gap-3">
            {user.badges.map((ub) => (
              <div
                key={ub.id}
                className="flex items-center gap-2 rounded-2xl border border-border bg-white px-4 py-2.5 shadow-sm"
              >
                <span className="text-2xl">{ub.badge.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{ub.badge.name}</p>
                  <p className="text-xs text-gray-400">{ub.badge.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function SubjectCard({
  subject,
  icon: Icon,
  color,
  accuracy,
  topicCount,
  masteredCount,
  href,
}: {
  subject: string;
  icon: React.ElementType;
  color: string;
  accuracy: number;
  topicCount: number;
  masteredCount: number;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-3xl border border-border bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
    >
      <div
        className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${color} text-white`}
      >
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-extrabold text-gray-900">{subject}</h3>
      <p className="mt-1 text-sm text-gray-500">
        {topicCount} topics · {masteredCount} mastered
      </p>

      {/* Accuracy bar */}
      <div className="mt-4">
        <div className="mb-1 flex justify-between text-xs text-gray-400">
          <span>Accuracy</span>
          <span>{Math.round(accuracy * 100)}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${color} transition-all`}
            style={{ width: `${Math.round(accuracy * 100)}%` }}
          />
        </div>
      </div>
    </Link>
  );
}
