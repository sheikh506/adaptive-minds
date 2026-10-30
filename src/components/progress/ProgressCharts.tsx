"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Prisma } from "@prisma/client";
import { Target, Clock, CheckCircle2, Layers } from "lucide-react";

type ProgressEntry = Prisma.ProgressGetPayload<{ include: { topic: true } }>;
type SessionEntry = Prisma.ExerciseSessionGetPayload<{
  include: { exercise: { include: { topic: true } } };
}>;

interface Props {
  progress: ProgressEntry[];
  recentSessions: SessionEntry[];
}

function dayKey(d: Date | string) {
  return new Date(d).toISOString().slice(0, 10);
}

export default function ProgressCharts({ progress, recentSessions }: Props) {
  const topicData = useMemo(
    () =>
      progress
        .filter((p) => p.totalCount > 0)
        .map((p) => ({
          name: p.topic.name,
          accuracy: Math.round((p.correctCount / p.totalCount) * 100),
          level: p.level,
        })),
    [progress]
  );

  // Last 14 days of activity
  const dailyData = useMemo(() => {
    const days: { key: string; label: string; answered: number; correct: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push({
        key: dayKey(d),
        label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        answered: 0,
        correct: 0,
      });
    }
    for (const s of recentSessions) {
      const day = days.find((d) => d.key === dayKey(s.completedAt));
      if (!day) continue;
      day.answered += 1;
      if (s.correct) day.correct += 1;
    }
    return days.map((d) => ({
      ...d,
      accuracy: d.answered ? Math.round((d.correct / d.answered) * 100) : null,
    }));
  }, [recentSessions]);

  const totals = useMemo(() => {
    const answered = progress.reduce((s, p) => s + p.totalCount, 0);
    const correct = progress.reduce((s, p) => s + p.correctCount, 0);
    const avgTime = recentSessions.length
      ? Math.round(recentSessions.reduce((s, r) => s + r.timeTaken, 0) / recentSessions.length)
      : 0;
    return {
      answered,
      accuracy: answered ? Math.round((correct / answered) * 100) : 0,
      avgTime,
      mastered: progress.filter((p) => p.mastered).length,
    };
  }, [progress, recentSessions]);

  // Strengths / needs-practice insights
  const ranked = [...topicData].sort((a, b) => b.accuracy - a.accuracy);
  const strengths = ranked.filter((t) => t.accuracy >= 80).slice(0, 3);
  const focus = [...ranked].reverse().filter((t) => t.accuracy < 70).slice(0, 3);

  if (progress.length === 0 && recentSessions.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-border bg-white p-12 text-center">
        <p className="text-4xl">🌱</p>
        <h3 className="mt-3 text-lg font-bold text-gray-800">No progress yet</h3>
        <p className="mt-1 text-sm text-gray-500">
          Answer a few questions and your charts will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { icon: Layers, label: "Questions answered", value: totals.answered },
          { icon: Target, label: "Overall accuracy", value: `${totals.accuracy}%` },
          { icon: Clock, label: "Avg. time / question", value: `${totals.avgTime}s` },
          { icon: CheckCircle2, label: "Topics mastered", value: totals.mastered },
        ].map((s) => (
          <div key={s.label} className="stat-card flex items-center gap-3">
            <div className="rounded-xl bg-brand-50 p-2.5 text-brand-600">
              <s.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xl font-extrabold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {(strengths.length > 0 || focus.length > 0) && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-green-100 bg-green-50 p-5">
            <h3 className="mb-2 text-sm font-bold text-green-800">💪 Strengths</h3>
            {strengths.length ? (
              <ul className="space-y-1 text-sm text-green-900">
                {strengths.map((t) => (
                  <li key={t.name}>
                    {t.name} — {t.accuracy}%
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-green-800">Keep practicing to build strengths!</p>
            )}
          </div>
          <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5">
            <h3 className="mb-2 text-sm font-bold text-amber-800">🎯 Needs practice</h3>
            {focus.length ? (
              <ul className="space-y-1 text-sm text-amber-900">
                {focus.map((t) => (
                  <li key={t.name}>
                    {t.name} — {t.accuracy}%
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-amber-800">Nothing urgent — great work!</p>
            )}
          </div>
        </div>
      )}

      <section className="rounded-3xl border border-border bg-white p-6 shadow-sm">
        <h3 className="mb-4 font-bold text-gray-900">Accuracy by topic</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topicData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="accuracy" name="Accuracy (%)" fill="#2563eb" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-white p-6 shadow-sm">
        <h3 className="mb-4 font-bold text-gray-900">Last 14 days</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} interval={1} />
              <YAxis yAxisId="left" allowDecimals={false} tick={{ fontSize: 12 }} />
              <YAxis yAxisId="right" orientation="right" domain={[0, 100]} unit="%" tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="answered" name="Questions" stroke="#7c3aed" strokeWidth={2} dot={false} />
              <Line yAxisId="right" type="monotone" dataKey="accuracy" name="Accuracy (%)" stroke="#16a34a" strokeWidth={2} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-white p-6 shadow-sm">
        <h3 className="mb-4 font-bold text-gray-900">Recent activity</h3>
        <ul className="divide-y divide-border">
          {recentSessions.slice(0, 8).map((s) => (
            <li key={s.id} className="flex items-center justify-between py-2.5 text-sm">
              <span className="text-gray-700">
                {s.exercise.topic.icon} {s.exercise.title}
              </span>
              <span className="flex items-center gap-3 text-xs text-gray-400">
                <span className={s.correct ? "font-semibold text-green-600" : "font-semibold text-red-500"}>
                  {s.correct ? "Correct" : "Missed"}
                </span>
                {new Date(s.completedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
