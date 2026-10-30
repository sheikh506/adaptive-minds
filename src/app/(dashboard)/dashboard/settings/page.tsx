import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ActionForm, { inputClass } from "@/components/ui/ActionForm";
import { joinClassroom, updateProfile } from "@/app/actions/manage";
import { AVATARS, NAME_HELP } from "@/lib/validation";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
    include: { classroomsAsStudent: { include: { classroom: { include: { teacher: true } } } } },
  });

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <h1 className="text-3xl font-extrabold text-gray-900">Settings ⚙️</h1>

      <section className="rounded-3xl border border-border bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-bold text-gray-900">Profile</h2>
        <ActionForm action={updateProfile} submitLabel="Save">
          <label htmlFor="name" className="block text-sm font-semibold text-gray-700">Display name</label>
          <input id="name" name="name" defaultValue={user.name ?? ""} required minLength={2} maxLength={40} className={inputClass} />
          {user.role === "STUDENT" && <p className="text-xs text-gray-500">{NAME_HELP}</p>}
          {user.role === "STUDENT" && (
            <fieldset>
              <legend className="mb-2 text-sm font-semibold text-gray-700">Your buddy</legend>
              <div className="grid grid-cols-6 gap-2">
                {AVATARS.map((a) => (
                  <label key={a} className="cursor-pointer">
                    <input
                      type="radio"
                      name="avatar"
                      value={a}
                      defaultChecked={user.image === a}
                      className="peer sr-only"
                      aria-label={`Choose ${a}`}
                    />
                    <span className="flex aspect-square items-center justify-center rounded-2xl border-2 border-border bg-white text-3xl peer-checked:scale-110 peer-checked:border-brand-500 peer-checked:bg-brand-50 peer-focus-visible:ring-4 peer-focus-visible:ring-brand-200">
                      {a}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          )}
          <p className="text-xs text-gray-500">Email: {user.email} · Role: {user.role}</p>
        </ActionForm>
      </section>

      {user.role === "STUDENT" && (
        <section className="rounded-3xl border border-border bg-white p-6 shadow-sm">
          <h2 className="mb-1 font-bold text-gray-900">Join a classroom</h2>
          <p className="mb-4 text-sm text-gray-500">Ask your teacher for the 6-character join code.</p>
          <ActionForm action={joinClassroom} submitLabel="Join">
            <input name="code" required maxLength={12} placeholder="ABC123" aria-label="Join code" className={`${inputClass} uppercase tracking-widest`} />
          </ActionForm>
          {user.classroomsAsStudent.length > 0 && (
            <ul className="mt-4 space-y-1 text-sm text-gray-600">
              {user.classroomsAsStudent.map((e) => (
                <li key={e.id}>🏫 {e.classroom.name} — {e.classroom.teacher.name}</li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
