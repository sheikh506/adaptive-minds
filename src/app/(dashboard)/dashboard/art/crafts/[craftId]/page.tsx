import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { craftById } from "@/lib/crafts";
import CraftGuide from "@/components/fun/CraftGuide";

export const dynamic = "force-dynamic";

export default async function CraftPage({ params }: { params: { craftId: string } }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "STUDENT") redirect("/dashboard");

  const craft = craftById(params.craftId);
  if (!craft) notFound();

  return <CraftGuide craft={craft} />;
}
