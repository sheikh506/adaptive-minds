import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ActionForm, { inputClass } from "@/components/ui/ActionForm";
import { createClassroom } from "@/app/actions/manage";

const GRADES = [
  ["K", "Kindergarten"], ["G1", "1st Grade"], ["G2", "2nd Grade"], ["G3", "3rd Grade"],
  ["G4", "4th Grade"], ["G5", "5th Grade"], ["G6", "6th Grade"], ["G7", "7th Grade"],
  ["G8", "8th Grade"], ["G9", "9th Grade"], ["G10", "10th Grade"], ["G11", "11th Grade"], ["G12", "12th Grade"],
];

export default async function ClassroomPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "TEACHER") redirect("/dashboard");

  const classrooms = await prisma.classroom.findMany({
    where: { teacherId: session.user.id },
    include: { _count: { select: { enrollments: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900">Classrooms 🏫</h1>
        <p className="mt-1 text-gray-500">Create a class and share the join code with your students.</p>
      </div>

      <section className="rounded-3xl border border-border bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-bold text-gray-900">New classroom</h2>
        <ActionForm action={createClassroom} submitLabel="Create classroom">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="mb-1.5 block text-sm font-semibold text-gray-700">Class name</label>
              <input id="name" name="name" required minLength={2} placeholder="3rd Grade Stars" className={inputClass} />
            </div>
            <div>
              <label htmlFor="grade" className="mb-1.5 block text-sm font-semibold text-gray-700">Grade</label>
              <select id="grade" name="grade" defaultValue="G3" className={inputClass}>
                {GRADES.map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
          </div>
        </ActionForm>
      </section>

      <section className="space-y-3">
        {classrooms.map((c) => (
          <div key={c.id} className="flex items-center justify-between rounded-2xl border border-border bg-white p-5 shadow-sm">
            <div>
              <p className="font-bold text-gray-900">{c.name}</p>
              <p className="text-xs text-gray-400">{c._count.enrollments} students</p>
            </div>
            <div className="text-right text-sm">
              <p className="text-xs text-gray-400">Join code</p>
              <code className="text-lg font-bold tracking-widest text-brand-700">{c.code}</code>
            </div>
          </div>
        ))}
        {classrooms.length === 0 && <p className="text-sm text-gray-500">No classrooms yet.</p>}
      </section>
    </div>
  );
}
