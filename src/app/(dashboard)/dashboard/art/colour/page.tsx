import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import ColouringBook from "@/components/fun/ColouringBook";

export const dynamic = "force-dynamic";

export default async function ColourPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "STUDENT") redirect("/dashboard");

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <Link href="/dashboard/art" className="text-sm font-bold text-brand-700 hover:underline">← Art &amp; Craft</Link>
      <h1 className="text-3xl font-bold text-gray-900">🌈 Colouring Book</h1>
      <ColouringBook />
    </div>
  );
}
