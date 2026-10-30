import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ActionForm, { inputClass } from "@/components/ui/ActionForm";
import PracticeGoalsForm from "@/components/dashboard/PracticeGoalsForm";
import { DEFAULT_PRACTICE_MINUTES } from "@/lib/game";
import { linkChild, unlinkChild } from "@/app/actions/manage";

export default async function ChildrenPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "PARENT") redirect("/dashboard");

  const links = await prisma.parentChild.findMany({
    where: { parentId: session.user.id },
    include: { child: { include: { practiceGoals: true } } },
  });
  const topics = await prisma.topic.findMany({ orderBy: [{ subject: "asc" }, { order: "asc" }] });

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900">My Children 👨‍👩‍👧</h1>
        <p className="mt-1 text-gray-500">Link your child&apos;s account to follow their progress.</p>
      </div>

      <section className="rounded-3xl border border-border bg-white p-6 shadow-sm">
        <h2 className="mb-1 font-bold text-gray-900">Link a child</h2>
        <p className="mb-4 text-sm text-gray-500">
          Enter your child&apos;s login email and password. We ask for the password so only a
          parent or guardian can link an account.
        </p>
        <ActionForm action={linkChild} submitLabel="Link child">
          <div className="grid gap-4 sm:grid-cols-2">
            <input name="email" type="email" required placeholder="child@example.com" aria-label="Child email" className={inputClass} />
            <input name="password" type="password" required placeholder="Child's password" aria-label="Child password" className={inputClass} />
          </div>
        </ActionForm>
      </section>

      <section className="space-y-4">
        {links.map(({ id, child }) => {
          const saved = new Map(child.practiceGoals.map((g) => [g.topicId, g.minutes]));
          return (
            <div key={id} className="rounded-2xl border border-border bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-900">{child.name}</p>
                  <p className="text-xs text-gray-400">{child.email} · {child.totalXP} XP · {child.streakDays}-day streak</p>
                </div>
                <form action={unlinkChild}>
                  <input type="hidden" name="childId" value={child.id} />
                  <button className="rounded-xl border border-border px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50">
                    Unlink
                  </button>
                </form>
              </div>
              <h3 className="mt-5 text-sm font-bold text-gray-900">Daily practice time for {child.name?.split(" ")[0]}</h3>
              <p className="text-xs text-gray-500">
                How long should {child.name?.split(" ")[0]} practise each skill every day? The app keeps giving questions
                and adjusts the difficulty until the time is used.
              </p>
              <PracticeGoalsForm
                childId={child.id}
                topics={topics.map((t) => ({
                  id: t.id,
                  name: t.name,
                  subject: t.subject,
                  icon: t.icon,
                  minutes: saved.get(t.id) ?? DEFAULT_PRACTICE_MINUTES,
                }))}
              />
            </div>
          );
        })}
        {links.length === 0 && <p className="text-sm text-gray-500">No children linked yet.</p>}
      </section>
    </div>
  );
}
