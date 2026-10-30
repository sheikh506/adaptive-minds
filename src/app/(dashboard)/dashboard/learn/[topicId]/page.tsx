import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ExercisePlayer from "@/components/exercises/ExercisePlayer";
import { loadPlayState } from "@/lib/practice";
import { isEarlyLearner, worldFor } from "@/lib/game";
import { lessonFor } from "@/lib/lessons";
import { unlockMap } from "@/lib/spaced-repetition";

export const dynamic = "force-dynamic";

interface Params {
  params: { topicId: string };
}

/** Practice session for one world. Questions keep flowing in place until today's practice time is used. */
export default async function ExercisePage({ params }: Params) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const topic = await prisma.topic.findUnique({ where: { id: params.topicId } });
  if (!topic) notFound();

  const [allProgress, user] = await Promise.all([
    prisma.progress.findMany({ where: { userId } }),
    prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { grade: true } }),
  ]);

  // A skill that builds on another stays closed until the child reaches level 2 there.
  if (session.user.role === "STUDENT" && !unlockMap([topic.id], allProgress).get(topic.id)?.unlocked) {
    redirect("/dashboard/play");
  }

  const initial = await loadPlayState(userId, params.topicId);
  const progress = allProgress.find((p) => p.topicId === params.topicId);
  const lesson = lessonFor(topic.id);

  return (
    <ExercisePlayer
      initial={initial}
      topic={{ id: topic.id, name: topic.name, icon: topic.icon }}
      world={worldFor(topic.name)}
      topicLevel={progress?.level ?? 1}
      lesson={lesson}
      lessonFirst={!!lesson && (progress?.lessonsSeen ?? 0) === 0}
      readAloudByDefault={isEarlyLearner(user.grade)}
    />
  );
}
