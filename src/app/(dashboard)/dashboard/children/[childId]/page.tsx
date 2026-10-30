import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { loadChildCompanionData } from "@/lib/parent-companion";
import SkillMasteryMap from "@/components/dashboard/SkillMasteryMap";
import { ArrowLeft } from "lucide-react";

interface Props {
  params: { childId: string };
}

/**
 * Parent Learning Companion — skill detail page.
 * Route: /dashboard/children/[childId]
 *
 * Only accessible to the authenticated parent linked to this child.
 */
export default async function ChildCompanionPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const data = await loadChildCompanionData(session.user.id, params.childId);
  if (!data) notFound();

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/children"
          className="flex items-center gap-1.5 rounded-xl bg-gray-100 px-3 py-2 text-sm font-bold text-gray-700 hover:bg-gray-200"
          aria-label="Back to children"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">{data.childName}</h1>
          <p className="text-sm text-gray-500">
            Learning companion ·{" "}
            {data.lastActiveAt
              ? `Last active ${new Date(data.lastActiveAt).toLocaleDateString()}`
              : "No sessions yet"}
          </p>
        </div>
      </div>

      {/* Skill mastery map + recommendations */}
      <SkillMasteryMap data={data} />

      {/* Evidence disclaimer */}
      <p className="text-xs text-gray-400 border-t border-gray-100 pt-4">
        Mastery is only recorded when your child answers unseen questions correctly without hints during a mastery check.
        Practice attempts and mastery attempts are always shown separately.
        No information about how quickly your child answered is used or displayed here.
      </p>
    </div>
  );
}
