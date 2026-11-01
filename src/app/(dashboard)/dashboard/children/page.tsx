import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ActionForm, { inputClass } from "@/components/ui/ActionForm";
import PracticeGoalsForm from "@/components/dashboard/PracticeGoalsForm";
import { DEFAULT_PRACTICE_MINUTES } from "@/lib/game";
import { linkChild, unlinkChild, createChildAccount, setChildConsent } from "@/app/actions/manage";
import { AVATARS } from "@/lib/validation";

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

      <div className="grid gap-8 md:grid-cols-2">
        <section className="rounded-3xl border border-border bg-white p-6 shadow-sm h-fit">
          <h2 className="mb-1 font-bold text-gray-900">Link an existing child</h2>
          <p className="mb-4 text-xs text-gray-500">
            Enter your child&apos;s login email and password. This links their independent account to your parent dashboard.
          </p>
          <ActionForm action={linkChild} submitLabel="Link child">
            <div className="grid gap-3">
              <input name="email" type="email" required placeholder="child@example.com" aria-label="Child email" className={inputClass} />
              <input name="password" type="password" required placeholder="Child's password" aria-label="Child password" className={inputClass} />
            </div>
          </ActionForm>
        </section>

        <section className="rounded-3xl border border-border bg-white p-6 shadow-sm">
          <h2 className="mb-1 font-bold text-gray-900">Create a new child profile</h2>
          <p className="mb-4 text-xs text-gray-500">
            Create a secure profile. They will log in using these credentials. Creating a child profile here automatically records your parental consent.
          </p>
          <ActionForm action={createChildAccount} submitLabel="Create profile">
            <div className="grid gap-3">
              <input name="name" type="text" required placeholder="First name / Nickname" aria-label="Child nickname" className={inputClass} />
              <input name="email" type="email" required placeholder="Username/Email for login" aria-label="Child email" className={inputClass} />
              <input name="password" type="password" required placeholder="Create password (min 8 chars)" aria-label="Child password" className={inputClass} />
              <select name="grade" required aria-label="Child grade" className={inputClass}>
                <option value="">Select Grade...</option>
                <option value="K">Kindergarten (Age 4-5)</option>
                <option value="G1">Grade 1 (Age 5-6)</option>
                <option value="G2">Grade 2 (Age 6-7)</option>
              </select>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Pick a companion</label>
                <div className="flex flex-wrap gap-1.5 p-1 bg-gray-50 rounded-xl border border-gray-100 justify-center">
                  {AVATARS.slice(0, 6).map((av) => (
                    <label key={av} className="cursor-pointer hover:scale-110 transition-transform">
                      <input type="radio" name="avatar" value={av} className="sr-only peer" defaultChecked={av === "🦊"} />
                      <span className="text-2xl p-1 rounded-lg border border-transparent peer-checked:border-brand-500 peer-checked:bg-white inline-block">
                        {av}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </ActionForm>
        </section>
      </div>

      <section className="space-y-4">
        {links.map(({ id, child }) => {
          const saved = new Map(child.practiceGoals.map((g) => [g.topicId, g.minutes]));
          return (
            <div key={id} className="rounded-2xl border border-border bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between border-b pb-4 mb-4">
                <div>
                  <p className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <span className="text-2xl">{child.image || "🦊"}</span>
                    {child.name}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{child.email} · {child.totalXP} XP · {child.streakDays}-day streak</p>
                </div>
                <form action={unlinkChild}>
                  <input type="hidden" name="childId" value={child.id} />
                  <button className="rounded-xl border border-border px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 hover:text-red-600">
                    Unlink
                  </button>
                </form>
              </div>

              {/* Consent Management Section */}
              <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 mb-5 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <span className="font-bold text-gray-400 uppercase text-[10px] tracking-wider block">Verified Parental Consent</span>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className={`h-2.5 w-2.5 rounded-full ${child.consentGiven ? "bg-green-500" : "bg-amber-500"}`} />
                      <p className="font-bold text-gray-700">
                        {child.consentGiven ? "Granted & Approved" : "Withdrawn / Pending Consent"}
                      </p>
                    </div>
                  </div>

                  <form action={setChildConsent}>
                    <input type="hidden" name="childId" value={child.id} />
                    <input type="hidden" name="consent" value={child.consentGiven ? "false" : "true"} />
                    <button
                      type="submit"
                      className={`rounded-xl px-3 py-1.5 text-xs font-bold shadow-sm transition-colors ${
                        child.consentGiven
                          ? "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
                          : "bg-green-600 text-white hover:bg-green-700"
                      }`}
                    >
                      {child.consentGiven ? "Withdraw Consent" : "Grant Consent"}
                    </button>
                  </form>
                </div>
                <p className="text-gray-500 mt-2 leading-relaxed">
                  {child.consentGiven
                    ? `Consent recorded under parent authority. Withdrawing consent suspends this child's access to all exercises, learning, and progress records immediately.`
                    : "Action Required: This child profile is inactive and cannot perform any exercises or trace history. Please click 'Grant Consent' to activate learning features safely."}
                </p>
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
