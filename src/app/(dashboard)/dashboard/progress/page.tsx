import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProgressCharts from "@/components/progress/ProgressCharts";

export default async function ProgressPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [progress, recentSessions] = await Promise.all([
    prisma.progress.findMany({
      where: { userId: session.user.id },
      include: { topic: true },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.exerciseSession.findMany({
      where: { userId: session.user.id },
      include: { exercise: { include: { topic: true } } },
      orderBy: { completedAt: "desc" },
      take: 50,
    }),
  ]);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">My Progress 📈</h1>
        <p className="mt-1 text-gray-500">Track your improvement across all topics.</p>
      </div>
      <ProgressCharts progress={progress} recentSessions={recentSessions} />
    </div>
  );
}
