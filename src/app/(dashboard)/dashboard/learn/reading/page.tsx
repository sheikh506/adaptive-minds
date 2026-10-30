import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import TopicList from "@/components/exercises/TopicList";

export default async function ReadingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role === "STUDENT") redirect("/dashboard/play");

  const [topics, userProgress] = await Promise.all([
    prisma.topic.findMany({
      where: { subject: "READING" },
      orderBy: { order: "asc" },
      include: { _count: { select: { exercises: true } } },
    }),
    prisma.progress.findMany({
      where: { userId: session.user.id },
      include: { topic: true },
    }),
  ]);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Reading 📚</h1>
        <p className="mt-1 text-gray-500">
          Build your vocabulary, phonics, and comprehension skills.
        </p>
      </div>
      <TopicList topics={topics} progress={userProgress} subject="READING" />
    </div>
  );
}
