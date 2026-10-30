import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import StudentDashboard from "@/components/dashboard/StudentDashboard";
import TeacherDashboard from "@/components/dashboard/TeacherDashboard";
import ParentDashboard from "@/components/dashboard/ParentDashboard";
import { goalSecondsByTopic, usedSecondsByTopic } from "@/lib/practice";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      badges: { include: { badge: true } },
      progress: { include: { topic: true } },
      classroomsAsStudent: {
        include: { classroom: { include: { teacher: true } } },
      },
      children: {
        include: {
          child: {
            include: {
              progress: { include: { topic: true } },
              badges: { include: { badge: true } },
            },
          },
        },
      },
      classroomsAsTeacher: {
        include: {
          enrollments: {
            include: {
              student: {
                include: { progress: { include: { topic: true } } },
              },
            },
          },
        },
      },
    },
  });

  if (!user) redirect("/login");

  if (user.role === "TEACHER") return <TeacherDashboard user={user} />;
  if (user.role === "PARENT") return <ParentDashboard user={user} />;

  // First run: a short placement quest finds the right starting level. Children who already
  // practised before this existed are not sent back to it.
  if (!user.placementDone && user.progress.every((p) => p.totalCount === 0)) redirect("/dashboard/placement");

  // Today's practice: skills the child has started today count toward the total; before any
  // practice the card shows one skill's goal so it reads "ready to start", not an 80-minute wall.
  const topics = await prisma.topic.findMany({ select: { id: true } });
  const [goals, used] = await Promise.all([
    goalSecondsByTopic(user.id, topics.map((t) => t.id)),
    usedSecondsByTopic(user.id),
  ]);
  const counted = topics.filter((t) => (used.get(t.id) ?? 0) > 0);
  const goalSec =
    counted.length > 0
      ? counted.reduce((s, t) => s + (goals.get(t.id) ?? 0), 0)
      : Math.max(0, ...topics.map((t) => goals.get(t.id) ?? 0));
  const usedSec = counted.reduce((s, t) => s + Math.min(used.get(t.id) ?? 0, goals.get(t.id) ?? 0), 0);
  const practice = { usedMin: Math.floor(usedSec / 60), goalMin: Math.round(goalSec / 60) };
  return <StudentDashboard user={user} practice={practice} />;
}
