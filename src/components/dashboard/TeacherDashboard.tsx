import Link from "next/link";
import { GraduationCap, Users, TrendingUp, AlertTriangle, Copy } from "lucide-react";
import type { Prisma } from "@prisma/client";

type TeacherUser = Prisma.UserGetPayload<{
  include: {
    classroomsAsTeacher: {
      include: {
        enrollments: {
          include: { student: { include: { progress: { include: { topic: true } } } } };
        };
      };
    };
  };
}>;

export function accuracyOf(progress: { correctCount: number; totalCount: number }[]) {
  const total = progress.reduce((s, p) => s + p.totalCount, 0);
  const correct = progress.reduce((s, p) => s + p.correctCount, 0);
  return total ? Math.round((correct / total) * 100) : null;
}

export default function TeacherDashboard({ user }: { user: TeacherUser }) {
  const classrooms = user.classroomsAsTeacher;
  const students = classrooms.flatMap((c) => c.enrollments.map((e) => e.student));
  const uniqueStudents = Array.from(new Map(students.map((s) => [s.id, s])).values());

  const rows = uniqueStudents.map((s) => ({
    student: s,
    accuracy: accuracyOf(s.progress),
    answered: s.progress.reduce((sum, p) => sum + p.totalCount, 0),
  }));
  const struggling = rows.filter((r) => r.accuracy !== null && r.accuracy < 60);
  const withData = rows.filter((r) => r.accuracy !== null);
  const classAvg = withData.length
    ? Math.round(withData.reduce((s, r) => s + (r.accuracy ?? 0), 0) / withData.length)
    : null;

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="rounded-3xl bg-gradient-to-r from-brand-500 to-brand-700 p-6 text-white">
        <p className="text-sm font-medium text-brand-200">Teacher dashboard</p>
        <h2 className="mt-1 text-2xl font-extrabold">{user.name}</h2>
        <p className="mt-1 text-sm text-brand-100">
          See who needs help at a glance and keep every student moving forward.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { icon: GraduationCap, label: "Classrooms", value: classrooms.length },
          { icon: Users, label: "Students", value: uniqueStudents.length },
          { icon: TrendingUp, label: "Class accuracy", value: classAvg === null ? "—" : `${classAvg}%` },
          { icon: AlertTriangle, label: "Need support", value: struggling.length },
        ].map((s) => (
          <div key={s.label} className="stat-card flex items-center gap-3">
            <div className="rounded-xl bg-brand-50 p-2.5 text-brand-600">
              <s.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {classrooms.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-white p-10 text-center">
          <p className="text-4xl">🏫</p>
          <h3 className="mt-3 text-lg font-bold text-gray-800">Create your first classroom</h3>
          <p className="mt-1 text-sm text-gray-500">
            You&apos;ll get a join code to share with your students.
          </p>
          <Link
            href="/dashboard/classroom"
            className="mt-4 inline-block rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-700"
          >
            Create classroom
          </Link>
        </div>
      ) : (
        <>
          {struggling.length > 0 && (
            <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <h3 className="mb-2 flex items-center gap-2 font-bold text-amber-900">
                <AlertTriangle className="h-4 w-4" /> Students who may need support
              </h3>
              <ul className="space-y-1 text-sm text-amber-900">
                {struggling.map((r) => (
                  <li key={r.student.id}>
                    {r.student.name} — {r.accuracy}% accuracy over {r.answered} questions
                  </li>
                ))}
              </ul>
            </section>
          )}

          {classrooms.map((c) => (
            <section key={c.id} className="rounded-3xl border border-border bg-white p-6 shadow-sm">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{c.name}</h3>
                  <p className="text-xs text-gray-400">{c.enrollments.length} students</p>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2 text-sm">
                  <Copy className="h-4 w-4 text-gray-400" />
                  Join code: <code className="font-bold tracking-wider text-brand-700">{c.code}</code>
                </div>
              </div>

              {c.enrollments.length === 0 ? (
                <p className="text-sm text-gray-500">No students yet — share the join code above.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="text-xs uppercase text-gray-400">
                      <tr>
                        <th className="pb-2 font-semibold">Student</th>
                        <th className="pb-2 font-semibold">Level</th>
                        <th className="pb-2 font-semibold">XP</th>
                        <th className="pb-2 font-semibold">Streak</th>
                        <th className="pb-2 font-semibold">Accuracy</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {c.enrollments.map(({ student }) => {
                        const acc = accuracyOf(student.progress);
                        return (
                          <tr key={student.id}>
                            <td className="py-2.5 font-medium text-gray-800">{student.name}</td>
                            <td className="py-2.5 text-gray-600">{Math.min(Math.floor(student.totalXP / 100) + 1, 10)}</td>
                            <td className="py-2.5 text-gray-600">{student.totalXP}</td>
                            <td className="py-2.5 text-gray-600">{student.streakDays}d</td>
                            <td className="py-2.5">
                              {acc === null ? (
                                <span className="text-gray-400">—</span>
                              ) : (
                                <span
                                  className={
                                    acc >= 80
                                      ? "font-semibold text-green-600"
                                      : acc >= 60
                                        ? "font-semibold text-yellow-600"
                                        : "font-semibold text-red-500"
                                  }
                                >
                                  {acc}%
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          ))}
        </>
      )}
    </div>
  );
}
