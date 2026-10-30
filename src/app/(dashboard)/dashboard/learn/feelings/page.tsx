import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FEELINGS_CARDS, SOCIAL_SCENARIOS } from "@/lib/feelings";
import FeelingsExplorer from "@/components/exercises/FeelingsExplorer";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function FeelingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "STUDENT") redirect("/dashboard");

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/play" className="flex items-center gap-1.5 rounded-xl bg-gray-100 px-3 py-2 text-sm font-bold text-gray-700 hover:bg-gray-200">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">💛 Feelings &amp; Friends</h1>
          <p className="text-sm text-gray-500">Learn about feelings and how to be a great friend.</p>
        </div>
      </div>
      <FeelingsExplorer feelings={FEELINGS_CARDS} scenarios={SOCIAL_SCENARIOS} />
    </div>
  );
}
