import Link from "next/link";
import { Star, Zap, Flame, BookOpen } from "lucide-react";
import type { Prisma } from "@prisma/client";
import { accuracyOf } from "./TeacherDashboard";

type ParentUser = Prisma.UserGetPayload<{
  include: {
    children: {
      include: {
        child: {
          include: {
            progress: { include: { topic: true } };
            badges: { include: { badge: true } };
          };
        };
      };
    };
  };
}>;

export default function ParentDashboard({ user }: { user: ParentUser }) {
  const kids = user.children.map((c) => c.child);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="rounded-3xl bg-gradient-to-r from-brand-500 to-brand-700 p-6 text-white">
        <p className="text-sm font-medium text-brand-200">Parent dashboard</p>
        <h2 className="mt-1 text-2xl font-extrabold">{user.name}</h2>
        <p className="mt-1 text-sm text-brand-100">Follow your children&apos;s learning journey.</p>
      </div>

      {kids.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-white p-10 text-center">
          <p className="text-4xl">👨‍👩‍👧</p>
          <h3 className="mt-3 text-lg font-bold text-gray-800">Link your child&apos;s account</h3>
          <p className="mt-1 text-sm text-gray-500">
            Enter your child&apos;s email to start following their progress.
          </p>
          <Link
            href="/dashboard/children"
            className="mt-4 inline-block rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-700"
          >
            Add a child
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {kids.map((kid) => {
            const acc = accuracyOf(kid.progress);
            const sorted = kid.progress
              .filter((p) => p.totalCount > 0)
              .map((p) => ({ name: p.topic.name, icon: p.topic.icon, acc: Math.round((p.correctCount / p.totalCount) * 100) }))
              .sort((a, b) => a.acc - b.acc);
            const weakest = sorted[0];
            const strongest = sorted[sorted.length - 1];

            return (
              <section key={kid.id} className="rounded-3xl border border-border bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-lg font-bold text-brand-700">
                    {kid.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{kid.name}</h3>
                    <p className="text-xs text-gray-400">
                      {kid.grade ? `Grade ${kid.grade.replace("G", "")}` : "Student"} · Last active{" "}
                      {kid.lastActiveAt ? new Date(kid.lastActiveAt).toLocaleDateString() : "never"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-xl bg-yellow-50 p-3 text-yellow-700">
                    <Star className="mx-auto h-4 w-4" />
                    <p className="mt-1 text-lg font-extrabold">{kid.totalStars}</p>
                    <p className="text-[11px]">Stars</p>
                  </div>
                  <div className="rounded-xl bg-brand-50 p-3 text-brand-700">
                    <Zap className="mx-auto h-4 w-4" />
                    <p className="mt-1 text-lg font-extrabold">{kid.totalXP}</p>
                    <p className="text-[11px]">XP</p>
                  </div>
                  <div className="rounded-xl bg-orange-50 p-3 text-orange-600">
                    <Flame className="mx-auto h-4 w-4" />
                    <p className="mt-1 text-lg font-extrabold">{kid.streakDays}</p>
                    <p className="text-[11px]">Day streak</p>
                  </div>
                </div>

                <div className="mt-5">
                  <div className="mb-1 flex justify-between text-xs text-gray-400">
                    <span>Overall accuracy</span>
                    <span>{acc === null ? "No data yet" : `${acc}%`}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                    <div className="h-full rounded-full bg-brand-500" style={{ width: `${acc ?? 0}%` }} />
                  </div>
                </div>

                {sorted.length > 0 && (
                  <div className="mt-5 space-y-1 text-sm">
                    <p className="text-green-700">
                      💪 Strongest: {strongest.icon} {strongest.name} ({strongest.acc}%)
                    </p>
                    {sorted.length > 1 && weakest.acc < 70 && (
                      <p className="text-amber-700">
                        🎯 Could use practice: {weakest.icon} {weakest.name} ({weakest.acc}%)
                      </p>
                    )}
                  </div>
                )}

                {kid.badges.length > 0 && (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {kid.badges.map((ub) => (
                      <span
                        key={ub.id}
                        title={ub.badge.description}
                        className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700"
                      >
                        {ub.badge.icon} {ub.badge.name}
                      </span>
                    ))}
                  </div>
                )}

                {/* Learning companion link */}
                <div className="mt-5 border-t border-gray-100 pt-4">
                  <Link
                    href={`/dashboard/children/${kid.id}`}
                    className="flex items-center gap-2 rounded-2xl bg-brand-50 px-4 py-3 text-sm font-bold text-brand-700 hover:bg-brand-100 transition-colors"
                  >
                    <BookOpen className="h-4 w-4 flex-shrink-0" />
                    <span>View skill mastery map</span>
                    <span className="ml-auto text-brand-400">→</span>
                  </Link>
                  <p className="mt-1 text-[11px] text-gray-400">
                    See individual skill progress, mastery evidence, and activity suggestions.
                  </p>
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
