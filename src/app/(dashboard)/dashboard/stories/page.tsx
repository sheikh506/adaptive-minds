import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { STORIES } from "@/lib/storybook";
import SceneArt from "@/components/art/SceneArt";

export const dynamic = "force-dynamic";

/** The story shelf: every picture book can be read to the child, page by page. */
export default async function StoriesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "STUDENT") redirect("/dashboard");

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="rounded-3xl bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-pink-500 p-6 text-white shadow-lg">
        <p className="text-5xl" aria-hidden="true">📚🌙</p>
        <h1 className="mt-1 text-3xl font-bold">Story Time</h1>
        <p className="mt-1 max-w-xl text-white/95">
          Pick a picture book and tap <strong>Read to me</strong>. A friendly voice reads each page and the words light up. Then think about it and earn a sticker!
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {STORIES.map((s) => (
          <Link
            key={s.id}
            href={`/dashboard/stories/${s.id}`}
            className="group overflow-hidden rounded-3xl bg-amber-900 p-1.5 shadow-md transition-transform hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="overflow-hidden rounded-[1.25rem] border-2 border-amber-100 bg-[#fffaf0]">
              <div className="relative">
                <SceneArt backdrop={s.pages[0].backdrop ?? s.backdrop} scene={s.pages[0].scene} />
                <span className="absolute right-2 top-2 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-brand-700">
                  {s.level === "Little" ? "Little readers" : "Bigger readers"}
                </span>
              </div>
              <div className="p-4">
                <h2 className="text-lg font-bold leading-tight text-gray-900">{s.emoji} {s.title}</h2>
                <p className="mt-1 text-sm text-gray-600">{s.theme} · {s.pages.length} pages</p>
                <p className="mt-3 rounded-2xl bg-brand-600 py-2.5 text-center font-display text-base font-bold text-white group-hover:bg-brand-700">
                  Open the book →
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
