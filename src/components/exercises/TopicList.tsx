import Link from "next/link";
import type { Prisma } from "@prisma/client";

type TopicWithCount = Prisma.TopicGetPayload<{
  include: { _count: { select: { exercises: true } } };
}>;
type ProgressEntry = Prisma.ProgressGetPayload<{ include: { topic: true } }>;

interface Props {
  topics: TopicWithCount[];
  progress: ProgressEntry[];
  subject: string;
}

export default function TopicList({ topics, progress }: Props) {
  const progressMap = Object.fromEntries(progress.map((p) => [p.topicId, p]));

  return (
    <div className="space-y-3">
      {topics.map((topic) => {
        const p = progressMap[topic.id];
        const accuracy = p && p.totalCount > 0 ? (p.correctCount / p.totalCount) * 100 : null;
        const level = p?.level ?? 1;

        return (
          <Link
            key={topic.id}
            href={`/dashboard/learn/${topic.id}`}
            className="group flex items-center gap-5 rounded-2xl border border-border bg-white p-5 shadow-sm hover:shadow-md hover:border-brand-300 transition-all"
          >
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gray-50 text-3xl">
              {topic.icon ?? "📘"}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <h3 className="font-bold text-gray-900">{topic.name}</h3>
                <span className="text-xs text-gray-400">Lvl {level}</span>
                {p?.mastered && (
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                    Mastered ✓
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-sm text-gray-500 truncate">{topic.description}</p>
              {accuracy !== null && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="h-1.5 w-32 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-brand-500 transition-all"
                      style={{ width: `${accuracy}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400">{Math.round(accuracy)}% accurate</span>
                </div>
              )}
            </div>

            <div className="flex flex-shrink-0 flex-col items-end gap-1 text-xs text-gray-400">
              <span>{topic._count.exercises} questions</span>
              <span className="rounded-full bg-brand-50 px-2.5 py-1 font-semibold text-brand-600 group-hover:bg-brand-100 transition-colors">
                Practice →
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
