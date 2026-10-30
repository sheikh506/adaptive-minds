import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { DECODABLE_READERS } from "@/lib/decodable-readers";
import DecodableReaderPlayer from "@/components/fun/DecodableReaderPlayer";
import { ArrowLeft } from "lucide-react";

interface Props {
  params: { readerId: string };
}

export default async function DecodableReaderPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "STUDENT") redirect("/dashboard");

  const reader = DECODABLE_READERS.find((r) => r.id === params.readerId);
  if (!reader) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4 py-4">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/stories/decodable"
          className="flex items-center gap-1.5 rounded-xl bg-gray-100 px-3 py-2 text-sm font-bold text-gray-700 hover:bg-gray-200"
          aria-label="Back to decodable readers"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <div>
          <h1 className="text-xl font-extrabold text-gray-900">{reader.emoji} {reader.title}</h1>
          <p className="text-xs text-gray-500">{reader.readingLevel} · {reader.pages.length} pages</p>
        </div>
      </div>

      {/* Sight words box — pre-teach before reading */}
      <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-amber-800 mb-2">
          📋 Sight words to learn first
        </p>
        <div className="flex flex-wrap gap-2">
          {reader.sightWords.map((w) => (
            <span key={w} className="rounded-lg border-2 border-amber-300 bg-white px-3 py-1 text-base font-extrabold text-amber-900">
              {w}
            </span>
          ))}
        </div>
        <p className="mt-2 text-xs text-amber-700">Ask a grown-up to say each word with you before you start reading.</p>
      </div>

      <DecodableReaderPlayer reader={reader} />
    </div>
  );
}
