import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function StudentsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "TEACHER") redirect("/dashboard");

  const enrollments = await prisma.enrollment.findMany({
    where: { classroom: { teacherId: session.user.id } },
    include: {
      classroom: true,
      student: { include: { progress: { include: { topic: true } } } },
    },
    orderBy: { joinedAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900">Students 👩‍🎓</h1>
        <p className="mt-1 text-gray-500">Topic-by-topic accuracy for every student in your classes.</p>
      </div>

      {enrollments.length === 0 && (
        <p className="rounded-2xl border border-dashed border-border bg-white p-8 text-center text-sm text-gray-500">
          No students have joined yet. Share a classroom join code to get started.
        </p>
      )}

      {enrollments.map(({ id, classroom, student }) => (
        <section key={id} className="rounded-3xl border border-border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-gray-900">{student.name}</h2>
              <p className="text-xs text-gray-400">{classroom.name} · {student.totalXP} XP · {student.streakDays}-day streak</p>
            </div>
          </div>
          {student.progress.length === 0 ? (
            <p className="text-sm text-gray-400">No activity yet.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {student.progress.map((p) => {
                const acc = p.totalCount ? Math.round((p.correctCount / p.totalCount) * 100) : 0;
                return (
                  <div key={p.id}>
                    <div className="mb-1 flex justify-between text-xs text-gray-500">
                      <span>{p.topic.icon} {p.topic.name} · Lvl {p.level}</span>
                      <span>{p.totalCount ? `${acc}%` : "—"}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className={`h-full rounded-full ${acc >= 80 ? "bg-green-500" : acc >= 60 ? "bg-yellow-500" : "bg-red-400"}`}
                        style={{ width: `${acc}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
