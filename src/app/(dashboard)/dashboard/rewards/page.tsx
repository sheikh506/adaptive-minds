import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Lock } from "lucide-react";

export default async function RewardsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [badges, earned, user] = await Promise.all([
    prisma.badge.findMany({ orderBy: { name: "asc" } }),
    prisma.userBadge.findMany({ where: { userId: session.user.id } }),
    prisma.user.findUniqueOrThrow({ where: { id: session.user.id } }),
  ]);
  const earnedMap = new Map(earned.map((e) => [e.badgeId, e.earnedAt]));

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Rewards 🏆</h1>
        <p className="mt-1 text-gray-500">
          {earned.length} of {badges.length} badges earned · {user.totalStars} stars · {user.totalXP} XP
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {badges.map((b) => {
          const when = earnedMap.get(b.id);
          return (
            <div key={b.id} className={`badge-card ${when ? "" : "opacity-60"}`}>
              <div className="text-4xl">{when ? b.icon : <Lock className="mx-auto h-8 w-8 text-gray-300" />}</div>
              <p className="font-bold text-gray-900">{b.name}</p>
              <p className="text-xs text-gray-500">{b.description}</p>
              {when && (
                <p className="text-[11px] font-semibold text-green-600">
                  Earned {when.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
