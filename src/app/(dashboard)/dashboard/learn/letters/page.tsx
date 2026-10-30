import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { lettersByGroup } from "@/lib/letter-formation";
import LetterFormationGuide from "@/components/exercises/LetterFormationGuide";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function LettersPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "STUDENT") redirect("/dashboard");

  const groups = lettersByGroup();

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/play" className="flex items-center gap-1.5 rounded-xl bg-gray-100 px-3 py-2 text-sm font-bold text-gray-700 hover:bg-gray-200">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">✏️ Letter Formation</h1>
          <p className="text-sm text-gray-500">How to write every letter correctly — with directions and tips.</p>
        </div>
      </div>

      <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-900">
        <p className="font-bold">👋 Before you start</p>
        <p className="mt-1">Hold your pencil like a bird — not too tight! Rest your paper hand on the page. Sit up comfortably.</p>
      </div>

      <LetterFormationGuide groups={groups} />
    </div>
  );
}
