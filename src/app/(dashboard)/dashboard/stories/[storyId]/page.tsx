import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { storyById } from "@/lib/storybook";
import StoryReader from "@/components/fun/StoryReader";

export const dynamic = "force-dynamic";

export default async function StoryPage({ params }: { params: { storyId: string } }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "STUDENT") redirect("/dashboard");

  const story = storyById(params.storyId);
  if (!story) notFound();

  return <StoryReader story={story} />;
}
