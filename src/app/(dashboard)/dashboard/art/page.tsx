import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { CRAFTS } from "@/lib/crafts";

export const dynamic = "force-dynamic";

/** Art & Craft hub: draw, colour, and make things with your hands. */
export default async function ArtPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "STUDENT") redirect("/dashboard");

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="rounded-3xl bg-gradient-to-r from-orange-400 via-pink-500 to-fuchsia-500 p-6 text-white shadow-lg">
        <p className="text-5xl" aria-hidden="true">🎨✂️</p>
        <h1 className="mt-1 text-3xl font-bold">Art &amp; Craft</h1>
        <p className="mt-1 max-w-xl text-white/95">Draw, colour and make real things. Every craft hides a little bit of learning!</p>
      </div>

      <Link href="/dashboard/art/puzzles" className="tile block bg-gradient-to-br from-violet-500 via-fuchsia-500 to-rose-500">
        <div className="flex items-center gap-4">
          <span className="animate-float text-6xl" aria-hidden="true">🧩</span>
          <div className="flex-1">
            <h2 className="text-2xl font-bold">Puzzle Playground</h2>
            <p className="mt-1 text-sm text-white/95">Matching, block building, spot the difference, number bubbles, patterns and more. For Kindergarten and Primary.</p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-2xl" aria-hidden="true">
          <span className="rounded-xl bg-white/25 px-2 py-1">🔗</span>
          <span className="rounded-xl bg-white/25 px-2 py-1">🔍</span>
          <span className="rounded-xl bg-white/25 px-2 py-1">🧱</span>
          <span className="rounded-xl bg-white/25 px-2 py-1">🔢</span>
          <span className="rounded-xl bg-white/25 px-2 py-1">🫧</span>
          <span className="rounded-xl bg-white/25 px-2 py-1">🎯</span>
        </div>
      </Link>

      <div className="grid gap-5 sm:grid-cols-2">
        <Link href="/dashboard/art/draw" className="tile bg-gradient-to-br from-sky-400 to-indigo-500">
          <span className="animate-float text-6xl" aria-hidden="true">🖍️</span>
          <h2 className="mt-3 text-xl font-bold">Drawing Studio</h2>
          <p className="mt-1 text-sm text-white/90">Free drawing with colours, stamps and an eraser. Save your picture!</p>
        </Link>
        <Link href="/dashboard/art/colour" className="tile bg-gradient-to-br from-lime-400 to-emerald-500">
          <span className="animate-float text-6xl" aria-hidden="true">🌈</span>
          <h2 className="mt-3 text-xl font-bold">Colouring Book</h2>
          <p className="mt-1 text-sm text-white/90">Tap a shape, pick a colour. Flowers, fish, rockets and more.</p>
        </Link>
      </div>

      <section>
        <h2 className="mb-3 text-xl font-bold text-gray-900">Make it with your hands</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {CRAFTS.map((c) => (
            <Link key={c.id} href={`/dashboard/art/crafts/${c.id}`} className={`tile bg-gradient-to-br ${c.cover}`}>
              <span className="animate-float text-5xl drop-shadow" aria-hidden="true">{c.emoji}</span>
              <h3 className="mt-2 text-lg font-bold leading-tight">{c.title}</h3>
              <p className="mt-1 text-sm text-white/90">{c.time} · {c.steps.length} steps</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
