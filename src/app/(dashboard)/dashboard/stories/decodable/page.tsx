import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { DECODABLE_READERS } from "@/lib/decodable-readers";

export const dynamic = "force-dynamic";

/**
 * Decodable readers shelf — listed by step level.
 * All readers are always visible so parents and teachers can choose.
 * Readers that match a child's current skill level are highlighted.
 */
export default async function DecodableReadersPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "STUDENT") redirect("/dashboard");

  const byStep = ["Step 1", "Step 2", "Step 3", "Step 4"] as const;

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="rounded-3xl bg-gradient-to-r from-sky-500 to-teal-500 p-6 text-white shadow-lg">
        <p className="text-5xl" aria-hidden="true">📖✨</p>
        <h1 className="mt-1 text-3xl font-bold">Decodable Readers</h1>
        <p className="mt-1 max-w-xl text-white/95">
          Short books built from the letter patterns you are learning. Every word can be sounded out — you can really read these yourself!
        </p>
      </div>

      <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-900">
        <p className="font-bold">💡 How to use these books</p>
        <p className="mt-1">Start with Step 1. Each book uses only the letter patterns you have already practised. Sight words are listed at the top of each book — ask a grown-up to help you learn those before you start.</p>
      </div>

      {byStep.map((step) => {
        const readers = DECODABLE_READERS.filter((r) => r.readingLevel === step);
        if (readers.length === 0) return null;
        return (
          <section key={step} aria-labelledby={`step-heading-${step}`}>
            <h2 id={`step-heading-${step}`} className="mb-3 text-lg font-extrabold text-gray-900">
              📚 {step}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {readers.map((reader) => (
                <Link
                  key={reader.id}
                  href={`/dashboard/stories/decodable/${reader.id}`}
                  className={`group overflow-hidden rounded-3xl bg-gradient-to-br ${reader.cover} p-5 text-white shadow-sm transition-transform hover:-translate-y-1 hover:shadow-lg`}
                >
                  <span className="text-5xl" aria-hidden="true">{reader.emoji}</span>
                  <h3 className="mt-3 text-lg font-bold leading-tight">{reader.title}</h3>
                  <p className="mt-1 text-sm text-white/90">
                    {reader.pages.length} pages · {reader.patternsUsed[0]}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {reader.sightWords.map((w) => (
                      <span key={w} className="rounded-full bg-white/25 px-2 py-0.5 text-xs font-bold">
                        {w}
                      </span>
                    ))}
                  </div>
                  <div className="mt-4 rounded-2xl bg-white py-2.5 text-center text-sm font-extrabold text-gray-900 group-hover:bg-yellow-100">
                    Read this book →
                  </div>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
